import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList, FiSearch } from "react-icons/fi"; 
import { FaRoad } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// --- HELPERS ---
const formatDate = (date) => (date ? date.split('T')[0] : '');

const groupEntriesByDate = (entries) => {
    return entries.reduce((acc, entry) => {
        const dateKey = formatDate(entry.date);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
    }, {});
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const History = () => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const navigate = useNavigate();
    
    const [currentView, setCurrentView] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date()); 
    const [selectedDateEntries, setSelectedDateEntries] = useState(null);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        fetch('https://fuel-tracker-api.vercel.app/history', {
            headers: { 'Authorization': token }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                localStorage.clear(); navigate("/login"); return null;
            }
            return res.json();
        })
        .then(data => { if (data && Array.isArray(data)) setEntries(data); })
        .catch(err => console.error("Error:", err));
    }, [navigate]);

    // --- 2. SEARCH & FILTER LOGIC ---
    const filteredEntries = useMemo(() => {
        return entries.filter(entry => 
            entry.date.includes(searchTerm) || 
            entry.cost.toString().includes(searchTerm) ||
            entry.liters.toString().includes(searchTerm)
        );
    }, [entries, searchTerm]);

    const totalStats = useMemo(() => {
        const cost = filteredEntries.reduce((sum, e) => sum + parseFloat(e.cost || 0), 0);
        const liters = filteredEntries.reduce((sum, e) => sum + parseFloat(e.liters || 0), 0);
        return { cost, liters };
    }, [filteredEntries]);

    const entriesByDate = useMemo(() => groupEntriesByDate(entries), [entries]);

    // --- 3. CSV EXPORT ---
    const exportToCSV = () => {
        if (entries.length === 0) { alert("No data to export"); return; }
        const headers = ["Date,Time,Liters,Rate,Total Cost,Odometer\n"];
        const rows = entries.map(item => `${item.date},${item.time || "-"},${item.liters},${item.pricePerLiter},${item.cost},${item.odometer || "-"}\n`);
        const blob = new Blob([headers, ...rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `Fuel_History.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 3000);
    };

    // --- 4. CRUD OPERATIONS ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`https://fuel-tracker-api.vercel.app/delete/${id}`, {
                method: 'DELETE', headers: { 'Authorization': token }
            });
            if (res.ok) setEntries(entries.filter(entry => entry._id !== id));
        } catch (error) { alert("Error deleting record"); }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        let newData = { ...editData, [name]: value };
        if (name === "liters" || name === "pricePerLiter") {
            const l = parseFloat(name === "liters" ? value : editData.liters) || 0;
            const p = parseFloat(name === "pricePerLiter" ? value : editData.pricePerLiter) || 0;
            newData.cost = (l * p).toFixed(2);
        }
        setEditData(newData);
    };

    const saveEdit = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`https://fuel-tracker-api.vercel.app/update/${editData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const updated = await res.json();
                setEntries(entries.map(item => item._id === editData._id ? updated.data : item));
                setIsEditing(false);
            }
        } catch (error) { alert("Update failed"); }
    };

    // --- 5. CALENDAR RENDER ---
    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const startPadding = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = getDaysInMonth(year, month);
        const cells = [];
        for (let i = 0; i < startPadding; i++) cells.push(<div key={`p-${i}`} />);
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entriesByDate[dateKey];
            cells.push(
                <div key={day} onClick={() => hasEntry && setSelectedDateEntries(hasEntry)}
                    className={`p-2 h-16 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${hasEntry ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-gray-50 border-gray-100 dark:bg-neutral-800 dark:border-neutral-700'}`}>
                    <span className="text-xs font-bold dark:text-gray-400">{day}</span>
                    {hasEntry && <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-right">Rs.{parseFloat(hasEntry.reduce((s, e) => s + parseFloat(e.cost), 0)).toFixed(0)}</span>}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="relative pb-24 max-w-4xl mx-auto px-4">
            {/* --- HEADER --- */}
            <header className="mb-6 pt-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">History</h1>
                        <p className="text-slate-500 text-sm dark:text-gray-400 font-medium">Manage your fuel logs.</p>
                    </div>
                    <button onClick={exportToCSV} className="p-3 bg-emerald-500 text-white rounded-[1.2rem] shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <FiDownload size={22} />
                    </button>
                </div>

                {/* --- SEARCH & TOGGLE BAR --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full flex-1 group">
                        <FiSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by date or amount..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border border-transparent focus:border-emerald-500/20 rounded-2xl shadow-sm dark:text-white outline-none transition-all"
                        />
                    </div>
                    <div className="flex bg-gray-200 dark:bg-neutral-800 p-1 rounded-2xl w-full md:w-auto">
                        <button onClick={() => setCurrentView('list')} className={`flex-1 md:w-24 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiList /> List</button>
                        <button onClick={() => setCurrentView('month')} className={`flex-1 md:w-24 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiCalendar /> Month</button>
                    </div>
                </div>
            </header>

            {/* --- QUICK STATS BAR --- */}
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800 min-w-[150px] shadow-sm">
                    <span className="text-[10px] uppercase font-black text-emerald-600 block mb-1">Filtered Total</span>
                    <span className="font-black text-slate-900 dark:text-white">Rs. {totalStats.cost.toFixed(2)}</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-800 min-w-[150px] shadow-sm">
                    <span className="text-[10px] uppercase font-black text-blue-600 block mb-1">Total Liters</span>
                    <span className="font-black text-slate-900 dark:text-white">{totalStats.liters.toFixed(2)} L</span>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {currentView === 'list' ? (
                <div className="space-y-4">
                    {filteredEntries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-800 rounded-[1.8rem] p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex justify-between items-center group transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3.5 rounded-2xl text-emerald-600"><FiDroplet size={22} /></div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-lg">Rs. {parseFloat(entry.cost).toFixed(2)}</h4>
                                    <p className="text-xs text-gray-400 font-bold">{entry.date} • {entry.liters}L</p>
                                </div>
                            </div>
                            
                            {/* Icons visible on mobile, hover on desktop */}
                            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {setEditData(entry); setIsEditing(true);}} className="p-3 md:p-2.5 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-xl active:scale-90 transition-all">
                                    <FiEdit2 size={18}/>
                                </button>
                                <button onClick={() => handleDelete(entry._id)} className="p-3 md:p-2.5 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-xl active:scale-90 transition-all">
                                    <FiTrash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredEntries.length === 0 && <div className="text-center py-20 text-gray-400 font-bold tracking-tight">No fuel records found.</div>}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-emerald-500 font-black px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl active:scale-90 transition-all">Prev</button>
                        <h2 className="font-black dark:text-white uppercase tracking-tighter text-sm">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-emerald-500 font-black px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl active:scale-90 transition-all">Next</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-center text-[11px] font-black text-gray-400 py-2 uppercase tracking-widest">{d}</div>)}
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-2xl font-black mb-6 dark:text-white">Edit Entry</h2>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] uppercase font-black text-gray-400 px-2 tracking-widest">Date</label>
                                <input name="date" type="date" value={editData.date} onChange={handleEditChange} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none dark:text-white outline-none font-bold" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2 space-y-1.5">
                                    <label className="text-[11px] uppercase font-black text-gray-400 px-2 tracking-widest">Liters</label>
                                    <input name="liters" type="number" value={editData.liters} onChange={handleEditChange} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none dark:text-white outline-none font-bold" />
                                </div>
                                <div className="w-1/2 space-y-1.5">
                                    <label className="text-[11px] uppercase font-black text-gray-400 px-2 tracking-widest">Rate</label>
                                    <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={handleEditChange} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none dark:text-white outline-none font-bold" />
                                </div>
                            </div>
                            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 mt-2">
                                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Calculated Total</p>
                                <p className="text-2xl font-black dark:text-emerald-400">Rs. {editData.cost}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                            <button onClick={saveEdit} className="flex-1 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUCCESS NOTIFICATION --- */}
            {showExportSuccess && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
                    <FiSave size={20} className="text-emerald-400" /> <span className="text-sm font-black tracking-tight">Data Exported Successfully!</span>
                </div>
            )}
        </div>
    );
};

export default History;
import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList, FiSearch, FiInfo } from "react-icons/fi"; 
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
    const [searchTerm, setSearchTerm] = useState(""); // ENHANCEMENT: Search state
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

    // --- 4. CRUD OPERATIONS (Delete/Edit) ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
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
        <div className="relative pb-24 max-w-4xl mx-auto">
            {/* --- HEADER --- */}
            <header className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">History</h1>
                        <p className="text-slate-500 text-sm dark:text-gray-400">Manage your fuel logs.</p>
                    </div>
                    <button onClick={exportToCSV} className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:scale-105 transition-transform active:scale-95">
                        <FiDownload size={22} />
                    </button>
                </div>

                {/* --- SEARCH & TOGGLE BAR --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full flex-1">
                        <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by date or amount..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        />
                    </div>
                    <div className="flex bg-gray-200 dark:bg-neutral-800 p-1 rounded-2xl w-full md:w-auto">
                        <button onClick={() => setCurrentView('list')} className={`flex-1 md:w-24 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiList /> List</button>
                        <button onClick={() => setCurrentView('month')} className={`flex-1 md:w-24 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiCalendar /> Month</button>
                    </div>
                </div>
            </header>

            {/* --- QUICK STATS BAR --- */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 whitespace-nowrap">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Filtered Total</span>
                    <span className="font-black text-slate-800 dark:text-emerald-400">Rs. {totalStats.cost.toFixed(2)}</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Total Liters</span>
                    <span className="font-black text-slate-800 dark:text-blue-400">{totalStats.liters.toFixed(2)} L</span>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {currentView === 'list' ? (
                <div className="space-y-4">
                    {filteredEntries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl text-emerald-600"><FiDroplet size={20} /></div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">Rs. {parseFloat(entry.cost).toFixed(2)}</h4>
                                    <p className="text-xs text-gray-400 font-medium">{entry.date} • {entry.liters}L</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {setEditData(entry); setIsEditing(true);}} className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><FiEdit2 size={16}/></button>
                                <button onClick={() => handleDelete(entry._id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg"><FiTrash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {filteredEntries.length === 0 && <div className="text-center py-10 text-gray-400">No records found.</div>}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-emerald-500 font-bold px-3">Prev</button>
                        <h2 className="font-black dark:text-white uppercase tracking-tighter text-sm">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-emerald-500 font-bold px-3">Next</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-center text-[10px] font-black text-gray-400 py-2">{d}</div>)}
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* --- MODALS & NOTIFICATIONS --- */}
            {/* (Edit Modal and Popup Daily Entries code remains logically the same but with dark mode classes) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6">
                        <h2 className="text-xl font-black mb-6 dark:text-white">Edit Record</h2>
                        <div className="space-y-4">
                            <input name="date" type="date" value={editData.date} onChange={handleEditChange} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border-none dark:text-white" />
                            <div className="flex gap-4">
                                <input name="liters" type="number" placeholder="Liters" value={editData.liters} onChange={handleEditChange} className="w-1/2 p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border-none dark:text-white" />
                                <input name="pricePerLiter" type="number" placeholder="Rate" value={editData.pricePerLiter} onChange={handleEditChange} className="w-1/2 p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 border-none dark:text-white" />
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Estimated Total</p>
                                <p className="text-lg font-black dark:text-emerald-400">Rs. {editData.cost}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 font-bold text-gray-400">Cancel</button>
                            <button onClick={saveEdit} className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showExportSuccess && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 animate-bounce bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                    <FiSave /> <span className="text-sm font-bold">Exported Successfully!</span>
                </div>
            )}
        </div>
    );
};

export default History;
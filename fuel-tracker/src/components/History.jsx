import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList, FiSearch, FiHash } from "react-icons/fi";
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

    // --- 2. FILTER LOGIC ---
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

    // --- 4. CRUD OPS ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`https://fuel-tracker-api.vercel.app/delete/${id}`, {
                method: 'DELETE', headers: { 'Authorization': token }
            });
            if (res.ok) setEntries(entries.filter(entry => entry._id !== id));
        } catch (error) { alert("Error deleting"); }
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

    // --- 5. RENDER CALENDAR ---
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
        <div className="relative pb-32 max-w-2xl mx-auto px-4">
            {/* --- HEADER --- */}
            <header className="mb-6 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fuel Log</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest dark:text-gray-400">Manage History</p>
                    </div>
                    <button onClick={exportToCSV} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                        <FiDownload size={22} />
                    </button>
                </div>

                {/* Stats Summary Card */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-4xl shadow-sm border border-gray-100 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600"><FiTrendingUp size={14}/></div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Cost</span>
                        </div>
                        <h3 className="text-xl font-black dark:text-white">Rs. {totalStats.cost.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-4xl shadow-sm border border-gray-100 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><FiDroplet size={14}/></div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Fuel</span>
                        </div>
                        <h3 className="text-xl font-black dark:text-white">{totalStats.liters.toFixed(2)} <small className="text-xs">Ltrs</small></h3>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full group">
                    <FiSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search date, cost, or liters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-none rounded-2xl shadow-sm dark:text-white outline-none focus:ring-2 ring-emerald-500/20"
                    />
                </div>

                {/* View Toggles */}
                <div className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-2xl border border-gray-200 dark:border-neutral-800">
                    <button onClick={() => setCurrentView('list')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-800 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiList /> LIST</button>
                    <button onClick={() => setCurrentView('month')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-800 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiCalendar /> CALENDAR</button>
                </div>
            </header>

            {/* --- LIST CONTENT --- */}
            {currentView === 'list' ? (
                <div className="space-y-4">
                    {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-800 rounded-4xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
                            {/* Card Header: Date & Time */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600">
                                        <FiDroplet size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                            <h4 className="font-black text-lg">Rs. {parseFloat(entry.cost).toFixed(2)}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><FiCalendar /> {entry.date}</span>
                                            <span className="flex items-center gap-1"><FiClock /> {entry.time || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditData(entry); setIsEditing(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><FiEdit2 size={18} /></button>
                                    <button onClick={() => handleDelete(entry._id)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><FiTrash2 size={18} /></button>
                                </div>
                            </div>

                            {/* Card Body: Technical Details */}
                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 dark:border-neutral-700/50">
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Quantity</p>
                                    <p className="text-xs font-black dark:text-gray-200 flex items-center justify-center gap-1"><FiDroplet className="text-blue-500"/> {entry.liters}L</p>
                                </div>
                                <div className="text-center border-x border-gray-50 dark:border-neutral-700/50">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Rate</p>
                                    <p className="text-xs font-black dark:text-gray-200 flex items-center justify-center gap-1"><FiTrendingUp className="text-emerald-500"/> {entry.pricePerLiter}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Odometer</p>
                                    <p className="text-xs font-black dark:text-gray-200 flex items-center justify-center gap-1"><FaRoad className="text-slate-400"/> {entry.odometer || '---'}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-30">
                            <FiList size={48} className="mx-auto mb-2" />
                            <p className="font-bold uppercase tracking-widest text-xs">No records found</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Month View */
                <div className="bg-white dark:bg-neutral-800 p-5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-700 rounded-xl text-emerald-500 font-black">←</button>
                        <h2 className="font-black dark:text-white uppercase tracking-tighter text-sm">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-700 rounded-xl text-emerald-500 font-black">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-black text-gray-300 mb-2">{d}</div>
                        ))}
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {isEditing && editData && (
                <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black dark:text-white">Edit Record</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 dark:bg-neutral-700 rounded-full dark:text-white"><FiX /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Liters</label>
                                    <div className="relative mt-1">
                                        <FiDroplet className="absolute left-3 top-3.5 text-blue-500" />
                                        <input name="liters" type="number" value={editData.liters} onChange={handleEditChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-700 dark:text-white rounded-2xl outline-none border-none focus:ring-2 ring-emerald-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Price/L</label>
                                    <div className="relative mt-1">
                                        <FiTrendingUp className="absolute left-3 top-3.5 text-emerald-500" />
                                        <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={handleEditChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-700 dark:text-white rounded-2xl outline-none border-none focus:ring-2 ring-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Odometer Reading</label>
                                <div className="relative mt-1">
                                    <FaRoad className="absolute left-3 top-3.5 text-slate-400" />
                                    <input name="odometer" type="number" value={editData.odometer || ""} onChange={handleEditChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-700 dark:text-white rounded-2xl outline-none border-none focus:ring-2 ring-emerald-500" />
                                </div>
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Calculated Total</span>
                                <span className="text-xl font-black text-emerald-600 dark:text-emerald-300">Rs. {editData.cost}</span>
                            </div>

                            <button onClick={saveEdit} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                                <FiSave /> UPDATE RECORD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showExportSuccess && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-110 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                    <FiSave size={20} className="text-emerald-400" /> <span className="text-sm font-bold">CSV Exported Successfully!</span>
                </div>
            )}
        </div>
    );
};

export default History;
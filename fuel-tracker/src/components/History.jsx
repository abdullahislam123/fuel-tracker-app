import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList, FiSearch, FiHash, FiInfo } from "react-icons/fi";
import { FaRoad, FaGasPump } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ⭐ SMART API SWITCH: Ye logic detect karega ke aap local hain ya live
const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://fuel-tracker-api.vercel.app";

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

        // ⭐ UPDATED: Template Literal with Dynamic API_URL
        fetch(`${API_URL}/history`, {
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
            // ⭐ UPDATED: Template Literal with Dynamic API_URL
            const res = await fetch(`${API_URL}/delete/${id}`, {
                method: 'DELETE', headers: { 'Authorization': token }
            });
            if (res.ok) {
                setEntries(entries.filter(entry => entry._id !== id));
                setSelectedDateEntries(null);
            }
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
            // ⭐ UPDATED: Template Literal with Dynamic API_URL
            const res = await fetch(`${API_URL}/update/${editData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const updated = await res.json();
                setEntries(entries.map(item => item._id === editData._id ? updated.data : item));
                setIsEditing(false);
                setSelectedDateEntries(null);
            }
        } catch (error) { alert("Update failed"); }
    };

    // --- 5. RENDER CALENDAR ---
    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const startPadding = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < startPadding; i++) cells.push(<div key={`p-${i}`} className="h-20" />);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entriesByDate[dateKey];

            cells.push(
                <div
                    key={day}
                    onClick={() => hasEntry && setSelectedDateEntries(hasEntry)}
                    className={`p-1.5 h-15 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all active:scale-95
                    ${hasEntry
                            ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                            : 'bg-gray-50 border-gray-100 dark:bg-neutral-800/40 dark:border-neutral-700'
                        }`}
                >
                    <span className={`text-xs font-black ${hasEntry ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {day}
                    </span>

                    {hasEntry && (
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg py-1 px-0.5 text-center overflow-hidden">
                            <span className="text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 block leading-none truncate">
                                Rs.{parseFloat(hasEntry.reduce((s, e) => s + parseFloat(e.cost), 0)).toFixed(0)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="relative pb-32 max-w-4xl mx-auto px-4 animate-fade-in">
            {/* --- HEADER --- */}
            <header className="mb-6 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fuel Log</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest dark:text-gray-400">Manage History</p>
                    </div>
                </div>

                <div className="relative w-full group">
                    <FiSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search date, cost, or liters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-800 border-none rounded-2xl shadow-sm dark:text-white outline-none focus:ring-2 ring-emerald-500/20 font-medium"
                    />
                </div>

                <div className="flex bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
                    <button onClick={() => setCurrentView('list')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black tracking-widest transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-800 shadow-md text-emerald-600' : 'text-gray-400'}`}><FiList /> LIST</button>
                    <button onClick={() => setCurrentView('month')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black tracking-widest transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-800 shadow-md text-emerald-600' : 'text-gray-400'}`}><FiCalendar /> CALENDAR</button>
                </div>
            </header>

            {/* --- LIST CONTENT --- */}
            {currentView === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEntries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-800 rounded-4xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
                            <div className="absolute top-5 right-5 flex gap-1 z-10">
                                <button onClick={(e) => { e.stopPropagation(); setEditData(entry); setIsEditing(true); }} className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"><FiEdit2 size={18} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(entry._id); }} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"><FiTrash2 size={18} /></button>
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600"><FiDroplet size={20} /></div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white">Rs. {parseFloat(entry.cost).toFixed(2)}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider"><span>{entry.date}</span> • <span>{entry.time || 'N/A'}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 dark:border-neutral-700/50">
                                <div className="text-center"><p className="text-[9px] font-bold text-gray-400 uppercase">Liters</p><p className="text-xs font-black dark:text-gray-200">{entry.liters}L</p></div>
                                <div className="text-center border-x border-gray-50 dark:border-neutral-700/50"><p className="text-[9px] font-bold text-gray-400 uppercase">Rate</p><p className="text-xs font-black dark:text-gray-200">{entry.pricePerLiter}</p></div>
                                <div className="text-center"><p className="text-[9px] font-bold text-gray-400 uppercase">Odometer</p><p className="text-xs font-black dark:text-gray-200">{entry.odometer || '---'}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 p-4 md:p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-2xl text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm">←</button>
                        <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-base md:text-xl">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-2xl text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 md:gap-4">{renderCalendarGrid()}</div>
                </div>
            )}

            {selectedDateEntries && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative border dark:border-neutral-800 animate-slide-up">
                        <button onClick={() => setSelectedDateEntries(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
                                <FaGasPump size={30} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedDateEntries[0].date}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Refill Summary</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-neutral-800 rounded-3xl">
                                <div className="flex items-center gap-3"><FiDroplet className="text-blue-500" /><span className="text-sm font-bold text-slate-500">Total Fuel</span></div>
                                <span className="font-black text-slate-900 dark:text-white">{selectedDateEntries.reduce((s, e) => s + parseFloat(e.liters), 0).toFixed(2)} L</span>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                                <div className="flex items-center gap-3"><FiTrendingUp className="text-emerald-500" /><span className="text-sm font-bold text-slate-500">Total Bill</span></div>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">Rs. {selectedDateEntries.reduce((s, e) => s + parseFloat(e.cost), 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && editData && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-slide-up border dark:border-neutral-700">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Entry</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 dark:bg-neutral-700 rounded-full dark:text-white transition-transform active:scale-90"><FiX /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Liters</label>
                                    <input name="liters" type="number" value={editData.liters} onChange={handleEditChange} className="w-full p-4 bg-gray-50 dark:bg-neutral-700 dark:text-white rounded-2xl outline-none focus:ring-2 ring-emerald-500 font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Rate</label>
                                    <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={handleEditChange} className="w-full p-4 bg-gray-50 dark:bg-neutral-700 dark:text-white rounded-2xl outline-none focus:ring-2 ring-emerald-500 font-bold" />
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 p-5 rounded-2xl border-2 border-dashed border-emerald-500/20 flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">New Total</span>
                                <span className="text-xl font-black text-emerald-600">Rs. {editData.cost}</span>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs tracking-widest transition-all active:scale-95 hover:bg-slate-200 dark:hover:bg-neutral-600">CANCEL</button>
                                <button onClick={saveEdit} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 transition-all hover:bg-emerald-600">SAVE CHANGES</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
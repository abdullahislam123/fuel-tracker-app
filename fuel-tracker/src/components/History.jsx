import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList, FiSearch, FiActivity, FiHash } from "react-icons/fi";
import { FaRoad, FaGasPump } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 

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
            entry.liters.toString().includes(searchTerm) ||
            (entry.odometer && entry.odometer.toString().includes(searchTerm))
        );
    }, [entries, searchTerm]);

    const entriesByDate = useMemo(() => groupEntriesByDate(entries), [entries]);

    // --- 3. CRUD OPS ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record?")) return;
        const token = localStorage.getItem("token");
        try {
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

    // --- 4. RENDER CALENDAR ---
    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const startPadding = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < startPadding; i++) cells.push(<div key={`p-${i}`} className="h-16" />);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entriesByDate[dateKey];

            cells.push(
                <div
                    key={day}
                    onClick={() => hasEntry && setSelectedDateEntries(hasEntry)}
                    className={`p-2 h-16 rounded-2xl border flex flex-col justify-center items-center cursor-pointer transition-all active:scale-95
                    ${hasEntry
                            ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/20'
                            : 'bg-gray-50 border-gray-100 dark:bg-neutral-800/40 dark:border-neutral-700'
                        }`}
                >
                    <span className={`text-xs font-black ${hasEntry ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                        {day}
                    </span>
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="relative pb-32 max-w-5xl mx-auto px-4 animate-fade-in">
            {/* --- HEADER --- */}
            <header className="mb-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Refill <span className="text-emerald-500">History</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] dark:text-gray-400 mt-1">Vehicle Performance Logs</p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-neutral-900 p-1.5 rounded-2xl border dark:border-neutral-800 self-start md:self-center">
                    <button onClick={() => setCurrentView('list')} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-800 shadow-md text-emerald-600' : 'text-gray-400'}`}><FiList /> LIST</button>
                    <button onClick={() => setCurrentView('month')} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-800 shadow-md text-emerald-600' : 'text-gray-400'}`}><FiCalendar /> CALENDAR</button>
                </div>
            </header>

            {/* SEARCH BAR */}
            <div className="relative mb-8 group">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by date, cost, liters or odometer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white dark:bg-neutral-900 border-none rounded-4xl shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-neutral-800 dark:text-white outline-none focus:ring-4 ring-emerald-500/10 font-bold italic"
                />
            </div>

            {/* --- CONTENT --- */}
            {currentView === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEntries.length > 0 ? [...filteredEntries].reverse().map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-50 dark:border-neutral-800 relative group hover:border-emerald-500/30 transition-all overflow-hidden">
                            
                            {/* Actions */}
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => { setEditData(entry); setIsEditing(true); }} className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl transition-all"><FiEdit2 size={16} /></button>
                                <button onClick={() => handleDelete(entry._id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><FiTrash2 size={16} /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-600"><FiDroplet size={24} /></div>
                                <div>
                                    <h4 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">Rs. {parseFloat(entry.cost).toLocaleString()}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                        <FiCalendar /> {new Date(entry.date).toLocaleDateString('en-GB')} • <FiClock /> {entry.time || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50 dark:border-neutral-800/50">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fuel</p>
                                    <p className="text-sm font-black dark:text-emerald-400 italic">{entry.liters}L</p>
                                </div>
                                <div className="space-y-1 border-x border-slate-50 dark:border-neutral-800/50 px-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                                    <p className="text-sm font-black dark:text-white italic">{entry.pricePerLiter}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Odometer</p>
                                    <p className="text-sm font-black text-emerald-600 italic flex items-center justify-end gap-1"><FiActivity size={12}/> {entry.odometer || '---'}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <FiHash size={40} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs italic">No matching logs found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] shadow-xl border dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-10">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-2xl text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white italic font-black uppercase text-[10px]">Prev</button>
                        <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl italic">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-2xl text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white italic font-black uppercase text-[10px]">Next</button>
                    </div>
                    <div className="grid grid-cols-7 gap-3">{renderCalendarGrid()}</div>
                </div>
            )}

            {/* EDIT MODAL - MATCHING ADD FUEL STYLE */}
            {isEditing && editData && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-slide-up border dark:border-neutral-800">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Edit <span className="text-emerald-500">Record</span></h2>
                            <button onClick={() => setIsEditing(false)} className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-full dark:text-white transition-all hover:text-red-500"><FiX size={20}/></button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Odometer Edit (High Priority) */}
                            <div className="bg-emerald-500/5 p-6 rounded-4xl border border-dashed border-emerald-500/20">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Odometer Reading (KM)</label>
                                <div className="relative">
                                    <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input name="odometer" type="number" step="0.1" value={editData.odometer || ''} onChange={handleEditChange} className="w-full p-4 pl-12 bg-white dark:bg-neutral-800 rounded-3xl outline-none border-none font-black italic shadow-sm" placeholder="e.g. 4873.8" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Liters</label>
                                    <input name="liters" type="number" step="0.01" value={editData.liters} onChange={handleEditChange} className="w-full p-4 bg-slate-50 dark:bg-neutral-800 rounded-3xl outline-none font-black italic" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Rate</label>
                                    <input name="pricePerLiter" type="number" step="0.01" value={editData.pricePerLiter} onChange={handleEditChange} className="w-full p-4 bg-slate-50 dark:bg-neutral-800 rounded-3xl outline-none font-black italic" />
                                </div>
                            </div>

                            <div className="flex bg-slate-900 p-6 rounded-4xl justify-between items-center">
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">New Total Bill</span>
                                <span className="text-2xl font-black text-white italic">Rs. {editData.cost}</span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-5 bg-slate-100 dark:bg-neutral-800 text-slate-500 rounded-4xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                                <button onClick={saveEdit} className="flex-1 py-5 bg-emerald-500 text-white rounded-4xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Update Log</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
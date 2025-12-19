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
        <div className="relative pb-32 max-w-4xl mx-auto px-4">
            {/* --- MOBILE-FIXED HEADER --- */}
            <header className="mb-6 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">History</h1>
                        <p className="text-slate-500 text-xs dark:text-gray-400">Synced with Database</p>
                    </div>
                    {/* Export Button: Always visible icon */}
                    <button onClick={exportToCSV} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                        <FiDownload size={24} />
                    </button>
                </div>

                {/* Search Bar: Occupies full width on mobile */}
                <div className="relative w-full group">
                    <FiSearch className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by date or cost..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border-none rounded-2xl shadow-sm dark:text-white outline-none"
                    />
                </div>

                {/* View Toggles */}
                <div className="flex bg-gray-200 dark:bg-neutral-800 p-1 rounded-2xl">
                    <button onClick={() => setCurrentView('list')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'list' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiList /> List View</button>
                    <button onClick={() => setCurrentView('month')} className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${currentView === 'month' ? 'bg-white dark:bg-neutral-700 shadow-sm text-emerald-600' : 'text-gray-500'}`}><FiCalendar /> Month View</button>
                </div>
            </header>

            {/* --- STATS --- */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-2xl min-w-35">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Total Spent</span>
                    <span className="font-black text-slate-900 dark:text-white">Rs. {totalStats.cost.toFixed(0)}</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-2xl min-w-35">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">Total Fuel</span>
                    <span className="font-black text-slate-900 dark:text-white">{totalStats.liters.toFixed(2)} L</span>
                </div>
            </div>

            {/* --- LIST CONTENT --- */}
            {currentView === 'list' ? (
                <div className="space-y-4">
                    {filteredEntries.map(entry => (
                        <div key={entry._id} className="bg-white dark:bg-neutral-800 rounded-[1.8rem] p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl text-emerald-600"><FiDroplet size={20} /></div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">Rs. {parseFloat(entry.cost).toFixed(2)}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold">{entry.date}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {setEditData(entry); setIsEditing(true);}} className="p-3 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-xl active:scale-90"><FiEdit2 size={18}/></button>
                                <button onClick={() => handleDelete(entry._id)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-xl active:scale-90"><FiTrash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-emerald-500 font-black p-2">Prev</button>
                        <h2 className="font-black dark:text-white uppercase tracking-tighter text-sm">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-emerald-500 font-black p-2">Next</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showExportSuccess && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-100 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
                    <FiSave size={20} /> <span className="text-sm font-bold">CSV Exported!</span>
                </div>
            )}
        </div>
    );
};

export default History;
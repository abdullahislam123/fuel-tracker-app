import React, { useState, useEffect, useMemo, useContext } from "react";
import { 
    FiDownload, FiTrash2, FiDroplet, FiClock, FiEdit2, 
    FiX, FiCalendar, FiList, FiSearch, FiActivity, FiHash, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 
import { VehicleContext } from "../App"; // Global state use karne ke liye

const styles = {
    card: "bg-white dark:bg-neutral-900/60 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl transition-all duration-300 hover:border-emerald-500/30",
    modal: "bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[3.5rem] p-8 md:p-10 shadow-2xl border dark:border-neutral-800 animate-slide-up",
    input: "w-full p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl outline-none font-black italic border-2 border-transparent focus:border-emerald-500 dark:text-white transition-all"
};

const History = () => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [currentView, setCurrentView] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateEntries, setSelectedDateEntries] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { activeVehicle } = useContext(VehicleContext);
    const activeId = activeVehicle?._id || localStorage.getItem("activeVehicleId");

    // --- 1. FETCH DATA (FILTERED BY VEHICLE) ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/login"); return; }
            if (!activeId) { navigate("/select-vehicle"); return; }

            setLoading(true);
            try {
                // ⭐ Multi-Vehicle Fix: Added ?vehicleId query parameter
                const res = await fetch(`${API_URL}/history?vehicleId=${activeId}`, {
                    headers: { 'Authorization': token }
                });
                
                if (res.status === 401 || res.status === 403) {
                    localStorage.clear(); navigate("/login"); return;
                }
                
                const data = await res.json();
                setEntries(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, activeId]); // ⭐ Re-fetch when vehicle changes

    // --- 2. HELPERS & FILTERS ---
    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.date.includes(searchTerm) ||
            entry.cost.toString().includes(searchTerm) ||
            entry.liters.toString().includes(searchTerm) ||
            (entry.odometer && entry.odometer.toString().includes(searchTerm))
        );
    }, [entries, searchTerm]);

    const entriesByDate = useMemo(() => {
        return entries.reduce((acc, entry) => {
            const dateKey = entry.date.split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(entry);
            return acc;
        }, {});
    }, [entries]);

    // --- 3. CRUD OPERATIONS ---
    const handleDelete = async (id) => {
        if (!window.confirm("Permanent delete this log?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/delete/${id}`, {
                method: 'DELETE', headers: { 'Authorization': token }
            });
            if (res.ok) setEntries(entries.filter(e => e._id !== id));
        } catch (error) { alert("Delete failed"); }
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
            }
        } catch (error) { alert("Update failed"); }
    };

    // --- 4. CALENDAR RENDER ---
    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const startPadding = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < startPadding; i++) cells.push(<div key={`p-${i}`} className="h-14 sm:h-20" />);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entriesByDate[dateKey];

            cells.push(
                <div
                    key={day}
                    onClick={() => hasEntry && setSelectedDateEntries(hasEntry)}
                    className={`p-2 h-14 sm:h-20 rounded-2xl border flex flex-col justify-center items-center cursor-pointer transition-all active:scale-90
                    ${hasEntry ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-50/50 dark:bg-neutral-800/30 border-transparent'}`}
                >
                    <span className={`text-xs font-black ${hasEntry ? 'text-emerald-500' : 'text-slate-400'}`}>{day}</span>
                    {hasEntry && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 animate-pulse" />}
                </div>
            );
        }
        return cells;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic text-emerald-500 text-2xl animate-pulse">Filtering Logs...</div>;

    return (
        <div className="relative pb-36 max-w-6xl mx-auto px-4 animate-fade-in">
            {/* HEADER */}
            <header className="mb-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                        {activeVehicle?.type === 'Bike' ? 'Moto' : 'Auto'}<span className="text-emerald-500">Logs</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">
                        History for: {activeVehicle?.name || 'Active Vehicle'}
                    </p>
                </div>
                
                <div className="flex bg-white dark:bg-neutral-900 p-1.5 rounded-2xl shadow-sm border dark:border-neutral-800">
                    <button onClick={() => setCurrentView('list')} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest transition-all ${currentView === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>LIST</button>
                    <button onClick={() => setCurrentView('month')} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black tracking-widest transition-all ${currentView === 'month' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>CALENDAR</button>
                </div>
            </header>

            {/* SEARCH */}
            <div className="relative mb-10">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                <input
                    type="text"
                    placeholder={`Search entries in ${activeVehicle?.name}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white dark:bg-neutral-900 rounded-4xl shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-neutral-800 outline-none font-bold italic dark:text-white"
                />
            </div>

            {/* CONTENT */}
            {currentView === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.length > 0 ? [...filteredEntries].reverse().map(entry => (
                        <div key={entry._id} className={styles.card}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-500"><FiDroplet size={24} /></div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditData(entry); setIsEditing(true); }} className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><FiEdit2 size={14}/></button>
                                    <button onClick={() => handleDelete(entry._id)} className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                                </div>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Rs. {parseFloat(entry.cost).toLocaleString()}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FiCalendar /> {new Date(entry.date).toLocaleDateString('en-GB')} • <FiClock /> {entry.time || 'N/A'}
                            </p>
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t dark:border-neutral-800">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Volume</p><p className="text-sm font-black dark:text-white italic">{entry.liters}L</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Rate</p><p className="text-sm font-black dark:text-white italic">{entry.pricePerLiter}</p></div>
                                <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Odo</p><p className="text-sm font-black text-emerald-500 italic">{entry.odometer}</p></div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center opacity-30">
                            <FiHash size={50} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-[0.3em] text-xs">No records for {activeVehicle?.name}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 p-6 sm:p-10 rounded-[3rem] shadow-xl border dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-10">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500"><FiChevronLeft /></button>
                        <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl italic">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500"><FiChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 sm:gap-4">{renderCalendarGrid()}</div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditing && editData && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className={styles.modal}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic uppercase dark:text-white">Modify <span className="text-emerald-500">Log</span></h2>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400"><FiX size={24}/></button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-emerald-500/5 p-6 rounded-4xl border border-dashed border-emerald-500/20">
                                <label className="text-[10px] font-black text-emerald-600 uppercase mb-2 block tracking-widest">Odometer Reading</label>
                                <div className="relative">
                                    <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input name="odometer" type="number" value={editData.odometer} onChange={(e) => setEditData({...editData, odometer: e.target.value})} className={styles.input + " pl-12 bg-white dark:bg-neutral-800"} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Liters</label>
                                <input name="liters" type="number" value={editData.liters} onChange={(e) => setEditData({...editData, liters: e.target.value})} className={styles.input} /></div>
                                <div><label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Price</label>
                                <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={(e) => setEditData({...editData, pricePerLiter: e.target.value})} className={styles.input} /></div>
                            </div>
                            <button onClick={saveEdit} className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black uppercase italic tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
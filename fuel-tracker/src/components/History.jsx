import React, { useState, useEffect, useMemo, useContext } from "react";
import { 
    FiTrash2, FiDroplet, FiClock, FiEdit2, 
    FiX, FiCalendar, FiSearch, FiActivity, FiHash, FiChevronLeft, FiChevronRight,
    FiImage, FiCamera 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config"; 
import { VehicleContext } from "../App";

const styles = {
    card: "bg-white dark:bg-neutral-900/60 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl transition-all duration-300 hover:border-emerald-500/30 group",
    modal: "bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[3.5rem] p-8 md:p-10 shadow-2xl border dark:border-neutral-800 animate-slide-up max-h-[90vh] overflow-y-auto",
    input: "w-full p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl outline-none font-black italic border-2 border-transparent focus:border-emerald-500 dark:text-white transition-all"
};

const History = () => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [currentView, setCurrentView] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { activeVehicle } = useContext(VehicleContext);
    const activeId = activeVehicle?._id || localStorage.getItem("activeVehicleId");

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/login"); return; }
            if (!activeId) { navigate("/select-vehicle"); return; }

            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/history?vehicleId=${activeId}`, {
                    headers: { 'Authorization': token }
                });
                const data = await res.json();
                setEntries(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, activeId]);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.date.includes(searchTerm) ||
            entry.cost.toString().includes(searchTerm) ||
            entry.liters.toString().includes(searchTerm)
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const saveEdit = async () => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("odometer", editData.odometer);
        formData.append("liters", editData.liters);
        formData.append("pricePerLiter", editData.pricePerLiter);
        formData.append("cost", (editData.liters * editData.pricePerLiter).toFixed(2));
        
        if (newImageFile) {
            formData.append("receiptImage", newImageFile);
        } else if (!editData.receiptImage && !previewUrl) {
            formData.append("removeImage", "true");
        }

        try {
            const res = await fetch(`${API_URL}/update/${editData._id}`, {
                method: 'PUT',
                headers: { 'Authorization': token },
                body: formData
            });
            if (res.ok) {
                const updated = await res.json();
                setEntries(entries.map(item => item._id === editData._id ? updated.data : item));
                setIsEditing(false);
                setNewImageFile(null);
                setPreviewUrl(null);
            }
        } catch (error) { alert("Update failed"); }
    };

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
                <div key={day} className={`p-2 h-14 sm:h-20 rounded-2xl border flex flex-col justify-center items-center cursor-pointer transition-all active:scale-90 ${hasEntry ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-50/50 dark:bg-neutral-800/30 border-transparent'}`}>
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
            <header className="mb-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                        {activeVehicle?.type === 'Bike' ? 'Moto' : 'Auto'}<span className="text-emerald-500">Logs</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Timeline: {activeVehicle?.name}</p>
                </div>
                <div className="flex bg-white dark:bg-neutral-900 p-1.5 rounded-2xl shadow-sm border dark:border-neutral-800">
                    <button onClick={() => setCurrentView('list')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest ${currentView === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>LIST</button>
                    <button onClick={() => setCurrentView('month')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest ${currentView === 'month' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>CALENDAR</button>
                </div>
            </header>

            {/* SEARCH */}
            <div className="relative mb-10">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                <input type="text" placeholder={`Search entries...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white dark:bg-neutral-900 rounded-4xl outline-none font-bold italic dark:text-white border dark:border-neutral-800 shadow-xl shadow-slate-200/50 dark:shadow-none" />
            </div>

            {/* LIST CONTENT */}
            {currentView === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.length > 0 ? [...filteredEntries].reverse().map(entry => (
                        <div key={entry._id} className={styles.card}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-emerald-500/10 p-4 rounded-3xl text-emerald-500"><FiDroplet size={24} /></div>
                                <div className="flex gap-2 items-center">
                                    {/* ⭐ VIEW RECEIPT BUTTON (FiImage) */}
                                    {entry.receiptImage && (
                                        <button 
                                            onClick={() => setSelectedImage(`${API_URL}${entry.receiptImage}`)}
                                            className="p-3 bg-emerald-500 text-white rounded-xl active:scale-90 transition-all shadow-lg shadow-emerald-500/20"
                                            title="View Receipt"
                                        >
                                            <FiImage size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => { setEditData(entry); setPreviewUrl(null); setIsEditing(true); }} className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><FiEdit2 size={14}/></button>
                                    <button onClick={() => handleDelete(entry._id)} className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                                </div>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Rs. {parseFloat(entry.cost).toLocaleString()}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                                <FiCalendar className="text-emerald-500" /> {new Date(entry.date).toLocaleDateString('en-GB')} • <FiClock className="text-emerald-500" /> {entry.time || 'N/A'}
                            </p>
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t dark:border-neutral-800">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Volume</p><p className="text-sm font-black dark:text-white italic">{entry.liters}L</p></div>
                                <div><p className="text-[9px] font-black text-slate-400 uppercase">Rate</p><p className="text-sm font-black dark:text-white italic">{entry.pricePerLiter}</p></div>
                                <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Odo</p><p className="text-sm font-black text-emerald-500 italic">{entry.odometer || 'N/A'}</p></div>
                            </div>
                        </div>
                    )) : <div className="col-span-full py-20 text-center opacity-30"><FiHash size={50} className="mx-auto mb-4" /><p className="font-black uppercase tracking-[0.3em] text-xs">No records found</p></div>}
                </div>
            )}

            {/* CALENDAR VIEW */}
            {currentView === 'month' && (
                <div className="bg-white dark:bg-neutral-900 p-6 sm:p-10 rounded-[3rem] shadow-xl border dark:border-neutral-800">
                    <div className="flex justify-between items-center mb-10 px-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500"><FiChevronLeft /></button>
                        <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl italic">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500"><FiChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 sm:gap-4">{renderCalendarGrid()}</div>
                </div>
            )}

            {/* ⭐ IMAGE ZOOM MODAL */}
            {selectedImage && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white bg-red-500 p-2 rounded-full shadow-lg active:scale-90 transition-all"><FiX size={24}/></button>
                        <img src={selectedImage} alt="Receipt" className="w-full h-auto max-h-[85vh] object-contain rounded-3xl border-4 border-white/10" />
                    </div>
                </div>
            )}

            {/* ⭐ EDIT MODAL */}
            {isEditing && editData && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className={styles.modal}>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black italic uppercase dark:text-white tracking-tighter">Modify <span className="text-emerald-500">Log</span></h2>
                            <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-red-500 transition-all"><FiX size={20}/></button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Update Receipt</label>
                                <input type="file" id="edit-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                                
                                <div className="relative">
                                    <label htmlFor="edit-image" className="block w-full h-44 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 overflow-hidden cursor-pointer hover:border-emerald-500 transition-all relative group">
                                        {(previewUrl || editData.receiptImage) ? (
                                            <div className="w-full h-full">
                                                <img src={previewUrl || `${API_URL}${editData.receiptImage}`} alt="preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiCamera className="text-white text-3xl" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 dark:bg-neutral-800/30">
                                                <FiCamera size={30} />
                                                <span className="text-[10px] font-black uppercase mt-2 italic">Add Receipt Image</span>
                                            </div>
                                        )}
                                    </label>

                                    {(previewUrl || editData.receiptImage) && (
                                        <button 
                                            onClick={() => {
                                                setPreviewUrl(null);
                                                setNewImageFile(null);
                                                setEditData({...editData, receiptImage: null});
                                            }}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-all z-10"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-dashed border-emerald-500/20 shadow-inner">
                                <label className="text-[10px] font-black text-emerald-600 uppercase mb-3 block tracking-widest text-center italic">Odometer Milestone</label>
                                <div className="relative">
                                    <FiActivity className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                                    <input name="odometer" type="number" value={editData.odometer} onChange={(e) => setEditData({...editData, odometer: e.target.value})} className={styles.input + " pl-14 bg-white dark:bg-neutral-800 text-xl"} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Volume (L)</label>
                                <input name="liters" type="number" value={editData.liters} onChange={(e) => setEditData({...editData, liters: e.target.value})} className={styles.input + " text-lg"} /></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest">Rate (PKR)</label>
                                <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={(e) => setEditData({...editData, pricePerLiter: e.target.value})} className={styles.input + " text-lg"} /></div>
                            </div>
                            
                            <button onClick={saveEdit} className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all mt-4 text-sm">Synchronize Logs</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
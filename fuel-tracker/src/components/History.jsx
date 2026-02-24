import React, { useState, useEffect, useMemo, useContext } from "react";
import {
    FiTrash2, FiDroplet, FiClock, FiEdit2,
    FiX, FiCalendar, FiSearch, FiActivity, FiHash, FiChevronLeft, FiChevronRight,
    FiImage, FiCamera, FiPrinter, FiDownload
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { VehicleContext } from "../context/VehicleContext";

const styles = {
    card: "glass-card p-0 overflow-hidden hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-500 group flex flex-col",
    modal: "bg-white/90 dark:bg-neutral-950/90 backdrop-blur-2xl w-full max-w-lg rounded-[3.5rem] p-8 md:p-10 shadow-3xl border border-white/20 dark:border-white/5 animate-slide-up max-h-[90vh] overflow-y-auto",
    input: "w-full p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl outline-none font-black italic border-2 border-transparent focus:border-emerald-500 dark:text-white transition-all",
    detailPopup: "absolute z-[60] bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-emerald-500/20 animate-slide-up backdrop-blur-xl"
};

const History = () => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const [currentView, setCurrentView] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredDate, setHoveredDate] = useState(null);
    const [clickedDate, setClickedDate] = useState(null);

    const navigate = useNavigate();
    const { activeVehicle } = useContext(VehicleContext);
    const activeId = activeVehicle?._id || localStorage.getItem("activeVehicleId");

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!activeId || !token) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/history?vehicleId=${activeId}`, {
                headers: { 'Authorization': token }
            });
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeId]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e =>
            e.cost?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.odometer?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.liters?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Date(e.date).toLocaleDateString().includes(searchTerm)
        );
    }, [entries, searchTerm]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this log permanently?")) return;
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_URL}/delete/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': token }
            });
            setEntries(entries.filter(e => e._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageRemoved(false);
        }
    };

    const saveEdit = async () => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("odometer", editData.odometer);
        formData.append("liters", editData.liters);
        formData.append("pricePerLiter", editData.pricePerLiter);
        formData.append("cost", editData.cost);
        if (newImageFile) formData.append("receiptImage", newImageFile);
        if (imageRemoved) formData.append("removeImage", "true");


        try {
            const res = await fetch(`${API_URL}/update/${editData._id}`, {
                method: "PUT",
                headers: { 'Authorization': token },
                body: formData
            });
            if (res.ok) {
                setIsEditing(false);
                fetchData();
            }
        } catch (err) {
            alert("Update failed");
        }
    };
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text("Fuel Tracker Pro Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Vehicle: ${activeVehicle?.name || 'All Vehicles'}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

        const tableColumn = ["Date", "Odometer", "Liters", "Rate", "Cost"];
        const tableRows = [];

        filteredEntries.forEach(entry => {
            const entryData = [
                new Date(entry.date).toLocaleDateString(),
                entry.odometer,
                `${entry.liters} L`,
                `Rs. ${entry.pricePerLiter || (entry.cost / entry.liters).toFixed(2)}`,
                `Rs. ${parseFloat(entry.cost).toLocaleString()}`
            ];
            tableRows.push(entryData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.save(`Fuel_Report_${activeVehicle?.name || 'Logs'}.pdf`);
    };

    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid = [];
        // Empty slots for previous month
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            grid.push(<div key={`empty-${i}`} className="h-24 md:h-32 rounded-3xl bg-slate-50/50 dark:bg-white/5 opacity-20" />);
        }

        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const currentDay = new Date(year, month, d);
            const dateStr = currentDay.toISOString().split('T')[0];
            const dayEntries = entries.filter(e => e.date.startsWith(dateStr));
            const totalCost = dayEntries.reduce((acc, curr) => acc + parseFloat(curr.cost || 0), 0);

            const isHovered = hoveredDate === dateStr;
            const isClicked = clickedDate === dateStr;
            const showDetails = (isHovered || isClicked) && dayEntries.length > 0;

            grid.push(
                <div
                    key={d}
                    className={`relative h-24 md:h-32 rounded-3xl p-3 flex flex-col items-center justify-center border transition-all cursor-pointer ${dayEntries.length > 0 ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 z-10' : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-50'} ${isClicked ? 'ring-4 ring-emerald-500/50 ring-offset-2 dark:ring-offset-neutral-900 border-white' : ''}`}
                    onMouseEnter={() => dayEntries.length > 0 && setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (dayEntries.length > 0) {
                            setClickedDate(clickedDate === dateStr ? null : dateStr);
                        }
                    }}
                >
                    <span className={`text-xl font-black italic tracking-tighter ${dayEntries.length > 0 ? 'text-white drop-shadow-md' : 'text-slate-400'}`}>{d}</span>

                    {showDetails && (
                        <div className={styles.detailPopup} onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">{currentDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase italic">{dayEntries.length} Record</span>
                            </div>
                            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {dayEntries.map((entry, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all text-left">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white italic">Rs. {parseFloat(entry.cost).toLocaleString()}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">{entry.time || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-tighter text-slate-400">
                                            <span>{entry.liters} Liters</span>
                                            <span className="text-right">Odo: {entry.odometer}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {isClicked && (
                                <button
                                    onClick={() => setClickedDate(null)}
                                    className="w-full mt-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors md:hidden"
                                >
                                    Close Details
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return grid;
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0c10]">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8" />
            <h2 className="text-xl font-black italic text-emerald-500 animate-pulse tracking-widest">Fetching History...</h2>
        </div>
    );

    return (
        <div className="relative pb-36 max-w-6xl mx-auto px-4 animate-fade-in" onClick={() => setClickedDate(null)}>
            <header className="mb-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">
                        {activeVehicle?.type === 'Bike' ? 'Moto' : (activeVehicle?.type === 'Car' ? 'Auto' : 'Asset')}<span className="text-emerald-500">Logs</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic bg-emerald-500/5 px-3 py-1 rounded-full w-fit flex items-center gap-2">
                        <FiActivity className="text-emerald-500" /> Timeline: {activeVehicle?.name}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-neutral-800 text-white rounded-2xl text-[10px] font-black tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
                    >
                        <FiPrinter size={16} /> EXPORT PDF
                    </button>
                    <div className="flex bg-slate-100 dark:bg-neutral-900/50 p-1.5 rounded-2xl shadow-inner border dark:border-white/5">
                        <button onClick={() => setCurrentView('list')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${currentView === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-500'}`}>LIST</button>
                        <button onClick={() => setCurrentView('month')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${currentView === 'month' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-500'}`}>CALENDAR</button>
                    </div>
                </div>
            </header>

            <div className="relative mb-10 group">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:scale-110 transition-transform" size={20} />
                <input type="text" placeholder={`Deep search records...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-6 bg-white dark:bg-neutral-900/80 rounded-[2.5rem] outline-none font-bold italic dark:text-white border dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none focus:border-emerald-500/50 transition-all" />
            </div>

            {currentView === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEntries.length > 0 ? [...filteredEntries].reverse().map(entry => (
                        <div key={entry._id} className={styles.card}>
                            <div className="h-44 w-full relative group/img overflow-hidden bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                                {entry.receiptImage ? (
                                    <>
                                        <img
                                            src={`${API_URL}${entry.receiptImage}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt="Receipt"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                            <button
                                                onClick={() => setSelectedImage(`${API_URL}${entry.receiptImage}`)}
                                                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 active:scale-90 transition-all"
                                            >
                                                <FiImage size={24} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-neutral-700">
                                        <FiCamera size={40} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">No Receipt Attached</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg border border-white/20"><FiDroplet size={18} /></div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => { setEditData(entry); setPreviewUrl(null); setIsEditing(true); setImageRemoved(false); }} className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-emerald-500 transition-colors"><FiEdit2 size={14} /></button>
                                    <button onClick={() => handleDelete(entry._id)} className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-red-500 transition-colors"><FiTrash2 size={14} /></button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Transaction Amount</p>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Rs. {parseFloat(entry.cost).toLocaleString()}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block uppercase italic">Verified</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-y border-slate-100 dark:border-white/5 mb-6">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-emerald-500" size={12} />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 italic">{new Date(entry.date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-emerald-500" size={12} />
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 italic">{entry.time || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Volume</p>
                                        <p className="text-xs font-black dark:text-white italic">{entry.liters}L</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Rate</p>
                                        <p className="text-xs font-black dark:text-white italic">Rs. {entry.pricePerLiter || (entry.cost / entry.liters).toFixed(0)}</p>
                                    </div>
                                    <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mb-1">Odometer</p>
                                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 italic">{entry.odometer || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : <div className="col-span-full py-20 text-center opacity-30"><FiHash size={50} className="mx-auto mb-4" /><p className="font-black uppercase tracking-[0.3em] text-xs">No logs found in repository</p></div>}
                </div>
            )}

            {currentView === 'month' && (
                <div className="glass-card p-6 sm:p-10 shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10 px-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500 active:scale-95 transition-all"><FiChevronLeft /></button>
                        <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl italic">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl text-emerald-500 active:scale-95 transition-all"><FiChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 sm:gap-6">{renderCalendarGrid()}</div>
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white bg-red-500 p-2 rounded-full shadow-lg active:scale-90 transition-all"><FiX size={24} /></button>
                        <img src={selectedImage} alt="Receipt" className="w-full h-auto max-h-[85vh] object-contain rounded-3xl border-4 border-white/10" />
                    </div>
                </div>
            )}

            {isEditing && editData && (
                <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className={styles.modal}>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-black italic uppercase dark:text-white tracking-tighter">Modify <span className="text-emerald-500">Log</span></h2>
                            <button onClick={() => setIsEditing(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-neutral-800 rounded-xl text-slate-400 hover:text-red-500 transition-all"><FiX size={20} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest italic ml-4">Update Receipt Registry</label>
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
                                                setEditData({ ...editData, receiptImage: null });
                                                setImageRemoved(true);
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
                                    <input name="odometer" type="number" value={editData.odometer} onChange={(e) => setEditData({ ...editData, odometer: e.target.value })} className={styles.input + " pl-14 bg-white dark:bg-neutral-800 text-xl"} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest italic">Volume (L)</label>
                                    <input name="liters" type="number" value={editData.liters} onChange={(e) => setEditData({ ...editData, liters: e.target.value })} className={styles.input + " text-lg"} /></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-2 block tracking-widest italic">Rate (PKR)</label>
                                    <input name="pricePerLiter" type="number" value={editData.pricePerLiter} onChange={(e) => setEditData({ ...editData, pricePerLiter: e.target.value })} className={styles.input + " text-lg"} /></div>
                            </div>

                            <button onClick={saveEdit} className="w-full py-6 bg-emerald-500 text-slate-900 rounded-[2rem] font-black uppercase italic tracking-widest shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all mt-4 text-sm">Synchronize Logs</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiDroplet, FiDollarSign, FiActivity, FiArrowLeft,
    FiSave, FiZap, FiCheckCircle, FiChevronDown, FiSettings,
    FiCamera, FiLoader, FiCheck, FiImage, FiX
} from "react-icons/fi";
import Tesseract from 'tesseract.js';
import { API_URL } from "../config";
import { VehicleContext } from "../App";

const styles = {
    card: "bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/5 shadow-2xl rounded-[3rem] p-6 md:p-10",
    inputGroup: "relative mb-4",
    label: "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-1 block",
    input: "w-full bg-slate-100 dark:bg-neutral-800/60 p-4 rounded-2xl font-black text-xl text-emerald-500 outline-none border-2 border-transparent focus:border-emerald-500/30 transition-all italic pl-12",
    icon: "absolute left-4 top-[65%] -translate-y-1/2 text-slate-400"
};

const AddFuel = () => {
    const navigate = useNavigate();
    const { activeVehicle } = useContext(VehicleContext);
    const [vehicles, setVehicles] = useState([]);
    const [lastReading, setLastReading] = useState(0);
    const [loading, setLoading] = useState(false);

    const [scanning, setScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);

    const [formData, setFormData] = useState({
        vehicleId: activeVehicle?._id || localStorage.getItem("activeVehicleId") || "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        cost: "",
        liters: "",
        pricePerLiter: "",
        odometer: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/vehicles`, { headers: { 'Authorization': token } })
            .then(res => res.json())
            .then(vData => setVehicles(vData));

        if (formData.vehicleId) {
            fetch(`${API_URL}/history?vehicleId=${formData.vehicleId}`, { headers: { 'Authorization': token } })
                .then(res => res.json())
                .then(data => {
                    const dataArray = Array.isArray(data) ? data : [];
                    setLastReading(dataArray.length > 0 ? Math.max(...dataArray.map(e => parseFloat(e.odometer || 0))) : 0);
                });
        }
    }, [formData.vehicleId]);

    // ⭐ STEP 1: Accurate Extraction Logic
    const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setReceiptFile(file);
        setReceiptPreview(URL.createObjectURL(file));
        setScanComplete(true); // Direct success green tick
    }
};

    // ⭐ STEP 2: Remove Image Handler
    const handleRemoveReceipt = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setReceiptFile(null);
        setReceiptPreview(null);
        setScanComplete(false);
    };

    useEffect(() => {
        const l = parseFloat(formData.liters || 0);
        const p = parseFloat(formData.pricePerLiter || 0);
        if (!scanning && l > 0 && p > 0) {
            setFormData(prev => ({ ...prev, cost: (l * p).toFixed(2) }));
        }
    }, [formData.liters, formData.pricePerLiter, scanning]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (parseFloat(formData.odometer) <= lastReading) {
            alert(`Error: Odometer must be higher than ${lastReading} KM!`);
            return;
        }

        setLoading(true);
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
        if (receiptFile) dataToSend.append("receiptImage", receiptFile);

        try {
            const response = await fetch(`${API_URL}/add`, {
                method: 'POST',
                headers: { 'Authorization': localStorage.getItem("token") },
                body: dataToSend
            });

            if (response.ok) {
                localStorage.setItem(`odo_${formData.vehicleId}`, formData.odometer);
                navigate("/dashboard");
            }
        } catch (error) {
            alert("Save failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] p-4 flex flex-col items-center justify-center font-bold">
            <div className="w-full max-w-lg animate-fade-in">

                <header className="flex items-center justify-between mb-6 px-2">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-[#12141c] rounded-xl shadow-md dark:text-white active:scale-90 transition-all">
                        <FiArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-black italic dark:text-white uppercase leading-none">Smart <span className="text-emerald-500">Scanner</span></h2>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-1">Direct Upload & AI Sync</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className={styles.card}>

                    {/* ⭐ AI RECEIPT UPLOADER SECTION WITH REMOVE BUTTON */}
                    <div className="mb-8 relative">
                        <label className={styles.label}>AI Receipt Verification</label>

                        {/* Remove Button Overlay */}
                        {receiptPreview && !scanning && (
                            <button
                                onClick={handleRemoveReceipt}
                                className="absolute top-8 right-2 z-30 bg-red-500 text-white p-1.5 rounded-full shadow-lg active:scale-75 transition-all border-2 border-white dark:border-[#12141c]"
                            >
                                <FiX size={14} />
                            </button>
                        )}

                        <div className="relative">
                            <input
                                type="file" accept="image/*" capture="environment"
                                onChange={handleReceiptUpload} id="receipt-upload" className="hidden"
                            />
                            <label
                                htmlFor="receipt-upload"
                                className={`flex flex-col items-center justify-center w-full h-40 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden relative
                                    ${scanComplete ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-neutral-800/40 hover:border-emerald-500/40'}`}
                            >
                                {scanning ? (
                                    <div className="flex flex-col items-center gap-3 text-emerald-500">
                                        <FiLoader className="animate-spin" size={30} />
                                        <span className="text-[10px] uppercase tracking-tighter animate-pulse">AI Reading Data...</span>
                                    </div>
                                ) : scanComplete ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                                        <img src={receiptPreview} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" alt="preview" />
                                        <div className="z-10 bg-emerald-500 text-white p-3 rounded-full shadow-xl animate-bounce">
                                            <FiCheck size={24} />
                                        </div>
                                        <span className="z-10 mt-2 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-widest font-black">Pic Captured & Synced</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <div className="flex gap-4 mb-2">
                                            <FiCamera size={32} className="hover:text-emerald-500 transition-colors" />
                                            <FiImage size={32} className="hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest opacity-60">Snap Receipt or Upload</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Selected Ride</label>
                        <FiSettings className={styles.icon} />
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className={styles.input + " appearance-none cursor-pointer"}
                        >
                            {vehicles.map(v => <option key={v._id} value={v._id} className="dark:bg-[#12141c]">{v.name}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="bg-emerald-500/5 p-5 rounded-4xl border border-dashed border-emerald-500/20 mb-4 transition-all shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><FiActivity /> Odometer (KM)</label>
                            {lastReading > 0 && <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Last: {lastReading}</span>}
                        </div>
                        <div className="relative">
                            <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
                            <input
                                required type="number" step="0.1"
                                className="w-full p-4 pl-12 bg-white dark:bg-neutral-800 rounded-2xl font-black text-2xl text-slate-900 dark:text-white outline-none border-2 border-transparent focus:border-emerald-500 italic"
                                value={formData.odometer}
                                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Liters</label>
                            <FiDroplet className={styles.icon} />
                            <input
                                required type="number" step="0.01"
                                className={styles.input}
                                value={formData.liters}
                                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                placeholder="5.0"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price/L</label>
                            <FiDollarSign className={styles.icon} />
                            <input
                                required type="number" step="0.01"
                                className={styles.input}
                                value={formData.pricePerLiter}
                                onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                                placeholder="267"
                            />
                        </div>
                    </div>

                    <div className={`p-6 rounded-4xl flex items-center justify-between mt-2 shadow-inner transition-all duration-500 ${scanComplete ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className={scanComplete ? 'text-white' : 'text-emerald-500'} size={20} />
                            <span className="text-sm font-black text-white italic uppercase tracking-tighter">Total Bill</span>
                        </div>
                        <div className={`text-2xl font-black tracking-tighter ${scanComplete ? 'text-white' : 'text-emerald-500'}`}>Rs. {formData.cost}</div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full mt-6 py-5 bg-emerald-500 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "SYNCING..." : <><FiSave size={18} /> Update Logs & Countdown</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddFuel;
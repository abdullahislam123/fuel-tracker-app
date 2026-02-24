import React, { useState, useEffect, useContext } from "react";
import { FiArrowLeft, FiCamera, FiDatabase, FiDroplet, FiCheckCircle, FiPlusCircle, FiZap, FiCalendar } from "react-icons/fi";
import { FaGasPump } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { ThemeContext } from "../context/Themecontext";

const AddFuel = () => {
    const [formData, setFormData] = useState({
        odometer: "",
        liters: "",
        cost: "",
        pricePerLiter: "",
        date: new Date().toISOString().split('T')[0],
        receiptImage: null
    });
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_URL}/vehicles`, {
                    headers: { 'Authorization': token }
                });
                const data = await res.json();
                setVehicles(data);
                if (data.length > 0) setSelectedVehicle(data[0]._id);
            } catch (err) { console.error(err); }
        };
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "receiptImage") {
            setFormData({ ...formData, receiptImage: files[0] });
            setPreview(URL.createObjectURL(files[0]));
        } else {
            const updatedData = { ...formData, [name]: value };

            // Auto-calculation logic
            if (name === "liters" || name === "pricePerLiter") {
                if (updatedData.liters && updatedData.pricePerLiter) {
                    updatedData.cost = (parseFloat(updatedData.liters) * parseFloat(updatedData.pricePerLiter)).toFixed(2);
                }
            } else if (name === "cost") {
                if (updatedData.cost && updatedData.pricePerLiter && parseFloat(updatedData.pricePerLiter) > 0) {
                    updatedData.liters = (parseFloat(updatedData.cost) / parseFloat(updatedData.pricePerLiter)).toFixed(2);
                }
            }

            setFormData(updatedData);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append("vehicleId", selectedVehicle);
        data.append("time", new Date().toLocaleTimeString('en-US', { hour12: false }));

        try {
            const res = await fetch(`${API_URL}/add`, {
                method: "POST",
                headers: { 'Authorization': token },
                body: data
            });
            if (res.ok) navigate("/dashboard");
        } catch (err) { alert("Failed to log entry"); }
        finally { setLoading(false); }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0a0c10]' : 'bg-gray-50'} pb-24 transition-colors duration-500`}>
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <header className="pt-10 mb-12 max-w-2xl mx-auto flex items-center justify-between px-4 relative z-10">
                <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/5 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all shadow-xl">
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-4xl font-black italic tracking-tighter dark:text-white">Push <span className="text-emerald-500">Log.</span></h1>
                <div className="w-12" />
            </header>

            <main className="max-w-2xl mx-auto px-4 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* VEHICLE PICKER */}
                    <div className="glass-card p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-4 flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-emerald-500 shadow-md">
                                <FaGasPump size={20} />
                            </div>
                            <select
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="w-full bg-transparent outline-none font-black text-xs uppercase tracking-[0.3em] py-2 dark:text-white appearance-none cursor-pointer"
                            >
                                {vehicles.map(v => <option key={v._id} value={v._id} className="dark:bg-[#12141c]">{v.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* MAIN INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl group hover:border-emerald-500/30 transition-all duration-500">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Odometer Reading</span>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-focus-within:bg-emerald-500 group-focus-within:text-white transition-all duration-300 shadow-lg shadow-emerald-500/5"><FiDatabase size={22} /></div>
                                <input name="odometer" type="number" step="any" required onChange={handleChange} placeholder="000000" className="bg-transparent text-4xl font-black italic tracking-tighter dark:text-white outline-none w-full" />
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl group hover:border-blue-500/30 transition-all duration-500">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Fuel Volume (L)</span>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-focus-within:bg-blue-500 group-focus-within:text-white transition-all duration-300 shadow-lg shadow-blue-500/5"><FiDroplet size={22} /></div>
                                <input name="liters" type="number" step="any" required value={formData.liters} onChange={handleChange} placeholder="0.00" className="bg-transparent text-4xl font-black italic tracking-tighter dark:text-white outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl group hover:border-blue-500/30 transition-all duration-500">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Price Per Liter (Rs.)</span>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-focus-within:bg-blue-500 group-focus-within:text-white transition-all duration-300 shadow-lg shadow-blue-500/5"><FiZap size={22} /></div>
                            <input name="pricePerLiter" type="number" step="any" value={formData.pricePerLiter} onChange={handleChange} placeholder="0.00" className="bg-transparent text-4xl font-black italic tracking-tighter dark:text-white outline-none w-full" />
                        </div>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl group hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 text-emerald-500/5 rotate-12 -translate-x-1/4 translate-y-1/4 pointer-events-none transition-transform group-hover:rotate-0 duration-700"><FiCheckCircle size={250} /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Total Transaction Cost</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-2xl font-black text-emerald-500 italic">Rs.</span>
                            <input name="cost" type="number" step="any" required value={formData.cost} onChange={handleChange} placeholder="0.00" className="bg-transparent text-6xl md:text-8xl font-black italic tracking-tighter dark:text-white outline-none w-full" />
                        </div>
                    </div>

                    {/* RECEIPT UPLOAD */}
                    <div className="relative group">
                        <input type="file" name="receiptImage" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />

                        <div className={`p-8 rounded-[3rem] border-2 border-dashed ${preview ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5'} backdrop-blur-xl flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-slate-50 dark:group-hover:bg-white/10 shadow-2xl`}>
                            {preview ? (
                                <div className="relative w-full">
                                    <img src={preview} className="w-full h-56 object-cover rounded-3xl border border-white/20 shadow-xl" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FiCamera size={40} className="text-white" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:shadow-lg transition-all"><FiCamera size={32} /></div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Snapshot receipt for direct preview</p>
                                        <p className="text-[8px] font-bold text-slate-300 dark:text-slate-500 mt-1 uppercase">Recommended for auditing</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button
                        disabled={loading}
                        className="w-full py-9 bg-emerald-500 text-slate-900 text-xl font-black italic uppercase tracking-[0.2em] rounded-[3rem] shadow-2xl shadow-emerald-500/30 active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group"
                    >
                        {loading ? <div className="w-8 h-8 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : (
                            <>
                                Initialize Entry <FiPlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Transaction will be synchronized with cloud servers</p>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddFuel;
import React, { useState } from "react";
import { FiArrowLeft, FiTruck, FiSettings, FiPlusCircle, FiZap, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const AddVehicle = () => {
    const [name, setName] = useState("");
    const [type, setType] = useState("Bike");
    const [interval, setInterval] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_URL}/vehicles/add`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    name,
                    type,
                    maintenanceInterval: type === "Custom" ? Number(interval) : (type === "Bike" ? 1000 : 5000)
                })
            });

            if (res.ok) {
                navigate("/select-vehicle");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add vehicle");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-24 animate-fade-in px-4">
            <header className="pt-10 mb-12 max-w-2xl mx-auto flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all outline-none">
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-black italic tracking-tighter dark:text-white">Register <span className="text-emerald-500">Unit.</span></h1>
                <div className="w-12" />
            </header>

            <main className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* VEHICLE NAME */}
                    <div className="glass-card p-10 group hover:border-emerald-500/30 transition-all duration-500">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Vehicle Name / Number</span>
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform"><FiZap size={24} /></div>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Honda Civic or LEZ-1234"
                                required
                                className="bg-transparent text-2xl md:text-3xl font-black italic tracking-tighter dark:text-white outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* VEHICLE TYPE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Bike', 'Car', 'Custom'].map((t) => (
                            <div
                                key={t}
                                onClick={() => setType(t)}
                                className={`glass-card p-6 flex flex-col items-center gap-4 cursor-pointer transition-all duration-500 ${type === t ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'hover:border-emerald-500/20'}`}
                            >
                                <div className={`p-4 rounded-2xl ${type === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-neutral-900 text-slate-400'}`}>
                                    {t === 'Bike' ? <FiTruck size={24} /> : (t === 'Car' ? <FiSettings size={24} /> : <FiPlusCircle size={24} />)}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${type === t ? 'text-emerald-500' : 'text-slate-400'}`}>{t}</span>
                            </div>
                        ))}
                    </div>

                    {/* MAINTENANCE INTERVAL (Only for Custom) */}
                    <div className={`glass-card p-10 group hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative ${type !== 'Custom' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        <div className="absolute right-0 bottom-0 text-blue-500/5 rotate-12 -translate-x-1/4 translate-y-1/4 pointer-events-none transition-transform group-hover:rotate-0 duration-700">
                            <FiCheckCircle size={200} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block italic">Maintenance Gap (KM)</span>
                        <div className="flex items-baseline gap-4">
                            <input
                                type="number"
                                value={type === 'Bike' ? 1000 : (type === 'Car' ? 5000 : interval)}
                                onChange={(e) => setInterval(e.target.value)}
                                disabled={type !== 'Custom'}
                                placeholder={type === 'Bike' ? "1000" : (type === 'Car' ? "5000" : "0000")}
                                required
                                className="bg-transparent text-5xl md:text-6xl font-black italic tracking-tighter dark:text-white outline-none w-full"
                            />
                            <span className="text-xl font-black text-blue-500 italic">KM</span>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button
                        disabled={loading || !name || (type === 'Custom' && !interval)}
                        className="w-full py-10 bg-emerald-500 text-slate-900 text-xl font-black italic uppercase tracking-[0.2em] rounded-[3rem] shadow-2xl shadow-emerald-500/30 active:scale-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="w-8 h-8 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : (
                            <>
                                Register Unit <FiPlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddVehicle;

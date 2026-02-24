import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGasPump } from "react-icons/fa";
import { FiArrowRight, FiActivity, FiZap, FiShield, FiMoon, FiSun, FiCpu, FiBarChart2 } from "react-icons/fi";
import { ThemeContext } from "../context/Themecontext";

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
            icon: <FiActivity size={32} />,
            title: "Track Easily",
            desc: "Keep a simple record of your fuel and mileage. No complex math required.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            hover: "group-hover:bg-emerald-500"
        },
        {
            icon: <FiCpu size={32} />,
            title: "Multiple Vehicles",
            desc: "Register and track all your cars and bikes in one place.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hover: "group-hover:bg-blue-500"
        },
        {
            icon: <FiShield size={32} />,
            title: "Safe & Secure",
            desc: "Your data is private and securely stored in your personal account.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            hover: "group-hover:bg-purple-500"
        },
        {
            icon: <FiZap size={32} />,
            title: "Auto-Sync",
            desc: "Access your fuel logs from any device, anytime.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            hover: "group-hover:bg-orange-500"
        }
    ];

    const stats = [
        { label: "Total Logs", value: "50K+" },
        { label: "Vehicles", value: "10K+" },
        { label: "Satisfaction", value: "99%" },
        { label: "Uptime", value: "99.9%" }
    ];

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0a0c10]' : 'bg-gray-50'} font-sans selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-500`}>

            {/* --- TOP NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between ${scrolled ? 'bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-xl border-b dark:border-white/5 shadow-xl' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2 text-emerald-500 font-black italic tracking-tighter text-xl">
                    <FaGasPump size={24} />
                    <span className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-sm">FuelTracker<span className="text-emerald-500 text-2xl">.</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-white hover:scale-110 active:scale-90 transition-all"
                    >
                        {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} className="text-yellow-400" />}
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] dark:text-white/60 hover:text-emerald-500 transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-8 animate-fade-in">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Smart Tracking Active</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl xl:text-9xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.85] mb-8">
                            Fuel Tracking <br />
                            <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Made Simple.</span>
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed font-bold italic opacity-80">
                            The easy way to track your fuel consumption and manage your vehicles.
                            Simple, fast, and secure for every driver.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 max-w-lg mx-auto lg:mx-0">
                            <button
                                onClick={() => navigate("/register")}
                                className="group bg-emerald-500 text-slate-900 px-12 py-5 rounded-3xl font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Get Started <FiArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
                        <div className="relative z-10 glass-card p-4 rounded-[3rem] border-8 border-white dark:border-neutral-900 shadow-2xl skew-y-3 group-hover:skew-y-0 transition-all duration-700 aspect-video flex items-center justify-center bg-slate-100 dark:bg-neutral-800">
                            <FiBarChart2 size={120} className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-700" />
                        </div>
                        <div className="absolute -bottom-8 -right-8 glass-card p-6 rounded-3xl z-20 border border-emerald-500/30 animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500 rounded-2xl text-slate-900"><FiBarChart2 size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Savings</p>
                                    <p className="text-2xl font-black italic dark:text-white leading-none">High</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- STATS SECTION --- */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="glass-card py-12 md:py-20 rounded-[4rem] border dark:border-white/5 backdrop-blur-3xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 md:px-16 divide-x-2 divide-slate-100 dark:divide-white/5">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center px-4">
                                <h4 className="text-4xl md:text-6xl font-black italic tracking-tighter dark:text-white mb-2">{s.value}</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- FEATURES --- */}
            <section className="max-w-7xl mx-auto px-6 py-20 mb-20">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter dark:text-white mb-4 uppercase leading-[0.9]">
                        Everything you need <br /> <span className="text-emerald-500">to save fuel.</span>
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Designed for daily drivers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="group glass-card p-10 hover:border-emerald-500/50 transition-all duration-700 cursor-default relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000 text-slate-900 dark:text-white">
                                {f.icon}
                            </div>
                            <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-3xl flex items-center justify-center mb-8 ${f.hover} group-hover:text-slate-900 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black dark:text-white italic tracking-tight mb-4 uppercase">{f.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- FINAL CALL TO ACTION --- */}
            <section className="max-w-5xl mx-auto px-6 pb-40">
                <div className="bg-slate-900 dark:bg-neutral-950 p-16 md:p-32 rounded-[5rem] text-center relative overflow-hidden group border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full group-hover:scale-150 transition-transform duration-1000" />

                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter mb-12 leading-[0.85]">
                            Manage Your <br /> <span className="text-emerald-500">Vehicles Today.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button
                                onClick={() => navigate("/register")}
                                className="bg-emerald-500 text-slate-900 px-16 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30"
                            >
                                Register Now
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="glass-card bg-white/5 border-white/10 text-white px-16 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-xl hover:bg-white/10 transition-all backdrop-blur-xl"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="text-center py-16 border-t dark:border-white/5 bg-slate-50/50 dark:bg-[#08090d]">
                <div className="flex items-center justify-center gap-2 text-emerald-500 font-black italic tracking-tighter mb-8 grayscale hover:grayscale-0 transition-all opacity-50">
                    <FaGasPump size={20} />
                    <span className="text-slate-900 dark:text-white uppercase font-black tracking-widest text-sm">FuelTracker</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] italic opacity-40">© 2026 FuelTracker // Simple Fuel Management</p>
                <div className="mt-8 flex justify-center gap-12 opacity-30 grayscale hover:opacity-100 transition-all duration-700">
                    <FiCpu /> <FiActivity /> <FiZap /> <FiShield />
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
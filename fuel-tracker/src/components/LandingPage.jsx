import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGasPump, FaChartLine, FaHistory, FaShieldAlt } from "react-icons/fa";
import { FiArrowRight, FiDownload, FiSettings } from "react-icons/fi";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        /* Outer Background (Laptop view background) */
        <div className="min-h-screen bg-slate-900 flex justify-center overflow-x-hidden">
            
            /* Mobile Frame Container */
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col border-x border-slate-800">
                
                {/* 1. HERO SECTION (Dark Theme like Image) */}
                <div className="bg-[#0f172a] text-white p-8 pt-12 pb-16 relative overflow-hidden">
                    {/* Background Pattern (Subtle dots) */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <FaGasPump size={32} />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl font-black mb-4 leading-tight tracking-tighter">
                            Master Your <br/>
                            <span className="text-emerald-400">Fuel Future</span>
                        </h1>
                        
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Enterprise-grade fuel management tailored for your daily rides. 
                            Track expenses, monitor mileage, and build savings.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => navigate("/register")}
                                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Start Free Today <FiArrowRight />
                            </button>
                            <button 
                                onClick={() => navigate("/login")}
                                className="w-full bg-slate-800/50 text-white py-4 rounded-2xl font-bold border border-slate-700 hover:bg-slate-800 transition-all"
                            >
                                Sign In to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. STATS ROW (Inspired by image) */}
                <div className="grid grid-cols-2 gap-3 p-4 -mt-8 relative z-20">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-center">
                        <h3 className="text-xl font-black text-slate-900">10K+</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Users</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-center">
                        <h3 className="text-xl font-black text-slate-900">99.9%</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Uptime</p>
                    </div>
                </div>

                {/* 3. FEATURES SECTION (White Background) */}
                <div className="p-6 space-y-8">
                    <div className="text-center">
                        <h2 className="text-xl font-black text-slate-900">Everything You Need</h2>
                        <p className="text-xs text-slate-500 font-medium">Built specifically for smart tracking</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Feature 1 */}
                        <div className="flex gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 h-fit">
                                <FaChartLine size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Powerful Analytics</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">Beautiful charts showing expense breakdown and fuel trends over time.</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex gap-4">
                            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500 h-fit">
                                <FiDownload size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">CSV Export</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">Download your entire history in one click for professional reports.</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex gap-4">
                            <div className="bg-purple-50 p-4 rounded-2xl text-purple-500 h-fit">
                                <FaShieldAlt size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Secure & Private</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">Your data is encrypted and secure. We never share your information.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. FINAL CTA SECTION */}
                <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100">
                    <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-center space-y-4">
                        <h3 className="text-white font-black text-lg">Ready to Take Control?</h3>
                        <p className="text-slate-400 text-xs">Join thousands of users building a better financial future.</p>
                        <button 
                            onClick={() => navigate("/register")}
                            className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                        >
                            Create Free Account <FiArrowRight />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">
                        © 2025 FuelTracker PK. All rights reserved.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
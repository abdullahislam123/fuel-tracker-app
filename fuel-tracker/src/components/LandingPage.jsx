import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGasPump, FaChartLine, FaShieldAlt, FaBolt, FaHistory, FaUsers } from "react-icons/fa";
import { FiArrowRight, FiDownload } from "react-icons/fi";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        // ⭐ MAIN CONTAINER: Ab ye full width white background hai
        <div className="min-h-screen bg-white font-sans selection:bg-emerald-100">
            
            {/* --- 1. HERO SECTION (Full Width Dark) --- */}
            <div className="bg-[#0f172a] text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                {/* Content Container: max-w-7xl laptop par content ko center mein rakhega */}
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-32 text-center relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-emerald-500 p-4 rounded-3xl shadow-2xl shadow-emerald-500/20 animate-bounce-subtle">
                            <FaGasPump size={40} />
                        </div>
                    </div>
                    
                    {/* Responsive Heading: Mobile pr 4xl, Laptop pr 7xl */}
                    <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
                        Master Your <br/>
                        <span className="text-emerald-400">Fuel Future</span>
                    </h1>
                    
                    {/* Responsive Text: Mobile pr sm, Laptop pr xl */}
                    <p className="text-slate-400 text-sm md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Enterprise-grade fuel management tailored for your daily rides. 
                        Track expenses, monitor mileage, and build savings — seamlessly.
                    </p>

                    {/* Buttons: Mobile pr column, Laptop pr row */}
                    <div className="flex flex-col md:flex-row justify-center gap-4 max-w-md md:max-w-none mx-auto">
                        <button 
                            onClick={() => navigate("/register")}
                            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-base md:text-lg active:scale-95"
                        >
                            Start Free Today <FiArrowRight />
                        </button>
                        <button 
                            onClick={() => navigate("/login")}
                            className="bg-slate-800/50 text-white px-8 py-4 rounded-2xl font-bold border border-slate-700 hover:bg-slate-800 transition-all text-base md:text-lg active:scale-95"
                        >
                            Sign In to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 2. STATS ROW --- */}
            <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-8 md:-mt-16">
                {/* Grid: Mobile pr 2 columns, Laptop pr 4 columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <div className="bg-white p-6 rounded-4xl shadow-xl border border-slate-50 text-center">
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900">10K+</h3>
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Active Users</p>
                    </div>
                    <div className="bg-white p-6 rounded-4xl shadow-xl border border-slate-50 text-center">
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900">99.9%</h3>
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Uptime</p>
                    </div>
                    {/* Laptop ke liye 2 extra stats add kar diye taake grid bhara hua lage */}
                    <div className="hidden md:block bg-white p-6 rounded-4xl shadow-xl border border-slate-50 text-center">
                        <h3 className="text-4xl font-black text-slate-900">5M+</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Liters Tracked</p>
                    </div>
                    <div className="hidden md:block bg-white p-6 rounded-4xl shadow-xl border border-slate-50 text-center">
                        <h3 className="text-4xl font-black text-slate-900">4.9/5</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">App Rating</p>
                    </div>
                </div>
            </div>

            {/* --- 3. FEATURES SECTION --- */}
            <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Everything You Need</h2>
                    <p className="text-slate-500 font-medium mt-4 text-sm md:text-base">Built specifically for smart tracking on any device</p>
                </div>

                {/* Grid: Mobile pr 1 column, Laptop pr 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Feature 1 */}
                    <div className="flex flex-col md:items-start md:text-left gap-4 p-6 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-lg transition-all">
                        <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 w-fit mx-auto md:mx-0">
                            <FaChartLine size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl text-slate-900 mb-2">Powerful Analytics</h4>
                            <p className="text-slate-500 leading-relaxed">Beautiful charts showing expense breakdown and fuel trends over time.</p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col md:items-start md:text-left gap-4 p-6 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-lg transition-all">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500 w-fit mx-auto md:mx-0">
                            <FiDownload size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl text-slate-900 mb-2">CSV Export</h4>
                            <p className="text-slate-500 leading-relaxed">Download your entire history in one click for professional reports.</p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col md:items-start md:text-left gap-4 p-6 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-lg transition-all">
                        <div className="bg-purple-50 p-4 rounded-2xl text-purple-500 w-fit mx-auto md:mx-0">
                            <FaShieldAlt size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-xl text-slate-900 mb-2">Secure & Private</h4>
                            <p className="text-slate-500 leading-relaxed">Your data is encrypted and secure. We never share your information.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 4. FINAL CTA SECTION --- */}
            <div className="p-6 md:p-0 bg-slate-50 border-t border-slate-100">
                <div className="max-w-5xl mx-auto md:py-20">
                    <div className="bg-[#0f172a] p-8 md:p-16 rounded-[2.5rem] text-center space-y-6 md:space-y-8">
                        <h3 className="text-white font-black text-2xl md:text-4xl">Ready to Take Control?</h3>
                        <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto">Join thousands of smart drivers building a better financial future today.</p>
                        <button 
                            onClick={() => navigate("/register")}
                            className="w-full md:w-auto md:px-10 bg-white text-slate-900 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 mx-auto hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Create Free Account <FiArrowRight />
                        </button>
                    </div>
                    <p className="text-center text-[10px] md:text-xs text-slate-400mt-8 md:mt-12 pb-8 font-bold uppercase tracking-widest opacity-60">
                        © 2025 FuelTracker PK. All rights reserved.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
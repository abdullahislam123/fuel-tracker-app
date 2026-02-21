import React, { useState, useEffect, useContext, createContext } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon, FiHelpCircle, FiMoreHorizontal, FiX } from "react-icons/fi";
import { FaGasPump } from "react-icons/fa";

// Components 
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import AddFuel from "./components/AddFuel";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import SupportForm from "./components/SupportForm";
import LandingPage from "./components/LandingPage";
import VehicleSelect from "./components/VehicleSelect";

// ⭐ Context definitions (Internal exports)
export const ThemeContext = createContext();
export const VehicleContext = createContext();

const isAuthenticated = () => localStorage.getItem("token") !== null;

// --- MOBILE TOP HEADER ---
const MobileHeader = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="md:hidden flex justify-between items-center px-6 py-4 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-emerald-500 font-black italic">
        <FaGasPump size={20} />
        <span className="text-slate-900 dark:text-white text-sm tracking-tighter uppercase font-bold">Fuel Tracker</span>
      </div>
      <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-xl active:scale-90">
        {theme === 'light' ? <FiMoon size={20} className="text-slate-600" /> : <FiSun size={20} className="text-yellow-400" />}
      </button>
    </div>
  );
};

// --- SIDEBAR (Desktop) ---
const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { activeVehicle } = useContext(VehicleContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed top-0 left-0 p-6 shadow-xl z-20 justify-between border-r border-slate-800">
      <div>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-xl font-black tracking-tighter">
            <FaGasPump className="text-emerald-400" size={24} />
            <span>FUEL<span className="text-emerald-400">TRACKER</span></span>
          </div>
        </div>

        {activeVehicle && (
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] uppercase font-black text-emerald-400 mb-1">Active Ride</p>
            <p className="text-sm font-bold italic truncate">{activeVehicle.name}</p>
          </div>
        )}

        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${isActive("/dashboard") ? "bg-emerald-500 text-white" : "text-slate-400"}`}><FiHome /> Dashboard</Link>
          <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${isActive("/add") ? "bg-emerald-500 text-white" : "text-slate-400"}`}><FiPlusCircle /> Add Fuel</Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${isActive("/history") ? "bg-emerald-500 text-white" : "text-slate-400"}`}><FiClock /> History</Link>
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${isActive("/profile") ? "bg-emerald-500 text-white" : "text-slate-400"}`}><FiUser /> Profile</Link>
          <Link to="/support" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${isActive("/support") ? "bg-emerald-500 text-white" : "text-slate-400"}`}><FiHelpCircle /> Support</Link>
          <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/10">
            {theme === 'light' ? <FiMoon /> : <FiSun />} {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <Link to="/select-vehicle" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-bold hover:text-white"><FaGasPump size={14} /> Switch Vehicle</Link>
        </nav>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-all"><FiLogOut /> Logout</button>
    </aside>
  );
};

// --- BOTTOM NAV (Mobile) ---
const BottomNav = () => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const closeMenu = () => setIsMoreOpen(false);

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-55 transition-opacity duration-300 ${isMoreOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={closeMenu} />
            <div className={`fixed inset-x-0 bottom-0 z-60 bg-white dark:bg-[#12141c] rounded-t-[3rem] p-8 shadow-2xl transition-transform duration-500 ease-out ${isMoreOpen ? "translate-y-0" : "translate-y-full"}`}>
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full mx-auto mb-10"></div>
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <Link to="/support" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                        <FiHelpCircle size={28} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
                    </Link>
                    <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="flex flex-col items-center gap-3 p-6 bg-red-500/5 rounded-3xl">
                        <FiLogOut size={28} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Logout</span>
                    </button>
                </div>
            </div>

            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] bg-white/90 dark:bg-[#12141c]/90 backdrop-blur-2xl border border-white/20 dark:border-white/5 h-20 rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl z-50">
                <Link to="/dashboard" className={`p-4 ${isActive("/dashboard") ? "text-emerald-500 scale-110" : "text-gray-400"}`}><FiHome size={24} /></Link>
                <Link to="/history" className={`p-4 ${isActive("/history") ? "text-emerald-500 scale-110" : "text-gray-400"}`}><FiClock size={24} /></Link>
                <Link to="/add" className="relative -top-8 transition-transform active:scale-90">
                    <div className="p-5 rounded-4xl bg-emerald-500 text-white shadow-lg border-4 border-slate-50 dark:border-neutral-950">
                        <FiPlusCircle size={30} />
                    </div>
                </Link>
                <Link to="/profile" className={`p-4 ${isActive("/profile") ? "text-emerald-500 scale-110" : "text-gray-400"}`}><FiUser size={24} /></Link>
                <button onClick={() => setIsMoreOpen(true)} className={`p-4 ${isMoreOpen ? "text-emerald-500" : "text-gray-400"}`}><FiMoreHorizontal size={24} /></button>
            </nav>
        </>
    );
};

// --- LAYOUT ---
const Layout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const { activeVehicle } = useContext(VehicleContext);
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const hasVehicle = activeVehicle || localStorage.getItem("activeVehicleId");
  if (!hasVehicle) return <Navigate to="/select-vehicle" replace />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-neutral-950' : 'bg-gray-50'}`}>
      <MobileHeader />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="w-full md:ml-64 p-4 pb-32 md:p-10 flex justify-center">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [activeVehicle, setActiveVehicle] = useState(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedVehicleId = localStorage.getItem("activeVehicleId");
    if (savedVehicleId) {
      setActiveVehicle({ _id: savedVehicleId, name: localStorage.getItem("activeVehicleName") });
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <VehicleContext.Provider value={{ activeVehicle, setActiveVehicle }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/select-vehicle" element={isAuthenticated() ? <VehicleSelect /> : <Navigate to="/login" replace />} />
            
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/add" element={<Layout><AddFuel /></Layout>} />
            <Route path="/history" element={<Layout><History /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/support" element={<Layout><SupportForm /></Layout>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </VehicleContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
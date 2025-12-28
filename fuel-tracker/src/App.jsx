import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon, FiHelpCircle, FiMoreHorizontal, FiX } from "react-icons/fi";
import { FaGasPump } from "react-icons/fa";

// Components (Ensure these files exist in your components folder)
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import AddFuel from "./components/AddFuel";
import Login from "./components/Login";
import SupportForm from "./components/SupportForm";
import Register from "./components/Register";
import Profile from "./components/Profile";
import LandingPage from "./components/LandingPage";

export const ThemeContext = React.createContext();

const isAuthenticated = () => localStorage.getItem("token") !== null;

// --- MOBILE TOP HEADER ---
const MobileHeader = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="md:hidden flex justify-between items-center px-6 py-4 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-2 text-emerald-500 font-black italic">
        <FaGasPump size={20} />
        <span className="text-slate-900 dark:text-white text-sm tracking-tighter uppercase font-bold">Fuel Tracker</span>
      </div>
      <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-xl transition-all active:scale-90 shadow-sm">
        {theme === 'light' ? <FiMoon size={20} className="text-slate-600" /> : <FiSun size={20} className="text-yellow-400" />}
      </button>
    </div>
  );
};

// --- SIDEBAR (Desktop) ---
const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
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
          <button onClick={toggleTheme} className="p-2 bg-slate-800 rounded-xl text-emerald-400 hover:bg-slate-700 transition-all">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/dashboard") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiHome /> Dashboard
          </Link>
          <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/add") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiPlusCircle /> Add Fuel
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/history") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiClock /> History
          </Link>
          <Link to="/support" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/support") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiHelpCircle /> Support
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-800 pt-6">
        <Link to="/profile" className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/profile") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
          <FiUser /> Profile
        </Link>
        <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group" title="Logout">
          <FiLogOut size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </aside>
  );
};

// --- BOTTOM NAV (Updated with Modern Bottom Sheet) ---
// --- BOTTOM NAV (Updated with 2 Options only) ---
const BottomNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const closeMenu = () => setIsMoreOpen(false);

  return (
    <>
      {/* 1. BACKDROP OVERLAY */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-55 transition-opacity duration-300 ${isMoreOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
      />

      {/* 2. BOTTOM SHEET (Cleaned Up) */}
      <div className={`fixed inset-x-0 bottom-0 z-60 bg-white dark:bg-[#0B0E14] rounded-t-4xl p-6 shadow-2xl transition-transform duration-500 ease-in-out transform ${isMoreOpen ? "translate-y-0" : "translate-y-full"}`}>
        
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-neutral-800 rounded-full mx-auto mb-6"></div>

        <div className="flex justify-between items-center mb-10 px-2">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight italic uppercase">Options</h2>
          <button onClick={closeMenu} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-gray-500 dark:text-gray-400 active:scale-90 transition-all">
             <FiX size={20} />
          </button>
        </div>

        {/* Updated Grid Layout (Now 2 Columns for Profile & Support) */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8 text-center">
          
          {/* Option 1: Profile */}
          <Link to="/profile" onClick={closeMenu} className="flex flex-col items-center gap-3 group">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 shadow-sm group-active:scale-90 transition-transform">
              <FiUser size={30} />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">My Profile</span>
          </Link>

          {/* Option 2: Customer Support */}
          <Link to="/support" onClick={closeMenu} className="flex flex-col items-center gap-3 group">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm group-active:scale-90 transition-transform">
              <FiHelpCircle size={30} />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Customer Support</span>
          </Link>

        </div>
      </div>

      {/* 3. MAIN TAB BAR (Remains Same for Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex justify-around items-center py-2 pb-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-colors duration-300">
        
        <Link to="/dashboard" onClick={closeMenu} className={`flex flex-col items-center gap-1 flex-1 ${isActive("/dashboard") ? "text-emerald-500" : "text-gray-400"}`}>
          <FiHome size={22} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link to="/history" onClick={closeMenu} className={`flex flex-col items-center gap-1 flex-1 ${isActive("/history") ? "text-emerald-500" : "text-gray-400"}`}>
          <FiClock size={22} />
          <span className="text-[10px] font-bold">History</span>
        </Link>

        {/* Center Floating Add Button */}
        <Link to="/add" onClick={closeMenu} className="relative -top-5 px-2">
          <div className="p-4 rounded-full bg-emerald-500 text-white shadow-xl border-4 border-white dark:border-neutral-900 active:scale-90 transition-all duration-200">
            <FiPlusCircle size={26} />
          </div>
        </Link>

        {/* More Button */}
        <button 
          onClick={() => setIsMoreOpen(true)} 
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isMoreOpen || isActive("/profile") || isActive("/support") ? "text-emerald-500" : "text-gray-400"}`}
        >
          <FiMoreHorizontal size={22} className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-90' : ''}`} />
          <span className="text-[10px] font-bold">More</span>
        </button>

        {/* Main Logout Button (Kept here for quick access) */}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 flex-1 text-red-400 active:scale-90 transition-transform">
          <FiLogOut size={22} />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>
    </>
  );
};

// --- LAYOUT ---
const Layout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  if (!isAuthenticated()) return <Navigate to="/login" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-neutral-950' : 'bg-gray-50'}`}>
      <MobileHeader />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="w-full md:ml-64 p-4 pb-28 md:p-10 flex justify-center">
          <div className="w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Register />} />

          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/add" element={<Layout><AddFuel /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/support" element={<Layout><SupportForm /></Layout>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
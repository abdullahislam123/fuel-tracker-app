import React, { useState, useEffect, useContext } from "react"; 
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon } from "react-icons/fi"; 
import { FaGasPump } from "react-icons/fa";

// Components
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import AddFuel from "./components/AddFuel";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import LandingPage from "./components/LandingPage";

// ⭐ Theme Context
export const ThemeContext = React.createContext();

const isAuthenticated = () => localStorage.getItem("token") !== null;

// --- ⭐ NEW: MOBILE TOP HEADER (Theme Toggle Visibility Fix) ---
const MobileHeader = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className="md:hidden flex justify-between items-center px-6 py-4 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-2 text-emerald-500 font-black italic">
        <FaGasPump size={20} />
        <span className="text-slate-900 dark:text-white text-sm">FINTRACK PK</span>
      </div>
      <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-xl transition-all active:scale-90">
        {theme === 'light' ? <FiMoon size={20} className="text-slate-600"/> : <FiSun size={20} className="text-yellow-400"/>}
      </button>
    </div>
  );
};

// --- SIDEBAR (Desktop) ---
const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed top-0 left-0 p-6 shadow-xl z-20 justify-between">
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
          {/* Navigation Links with consistent bold text */}
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/dashboard") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiHome /> Dashboard
          </Link>
          <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/add") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiPlusCircle /> Add Fuel
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/history") ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"}`}>
            <FiClock /> History
          </Link>
        </nav>
      </div>
      <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all">
        <FiLogOut /> Logout
      </button>
    </aside>
  );
};

// --- BOTTOM NAV (Mobile Only) ---
const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex justify-around items-center py-3 z-50 shadow-2xl">
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive("/dashboard") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiHome size={22} /> <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link to="/history" className={`flex flex-col items-center gap-1 ${isActive("/history") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiClock size={22} /> <span className="text-[10px] font-bold">History</span>
      </Link>
      <Link to="/add" className="relative -top-5 bg-emerald-500 text-white p-4 rounded-full shadow-lg border-4 border-white dark:border-neutral-900">
        <FiPlusCircle size={24} />
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiUser size={22} /> <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </nav>
  );
};

// --- ⭐ IMPROVED LAYOUT (Laptop vs Mobile Fix) ---
const Layout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  if (!isAuthenticated()) return <Navigate to="/login" />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-neutral-950' : 'bg-gray-50'}`}>
      <MobileHeader />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        {/* Laptop par Wide (max-w-7xl) aur Mobile par Full Width */}
        <main className="w-full md:ml-64 p-4 pb-28 md:p-10 flex justify-center">
          <div className="w-full max-w-7xl animate-fade-in">
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

  // Ensure Tailwind 'dark' class is on the HTML root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/add" element={<Layout><AddFuel /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
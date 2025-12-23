import React, { useState, useEffect, useContext } from "react"; 
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon } from "react-icons/fi"; 
import { FaGasPump } from "react-icons/fa";

// Components (Make sure paths are correct)
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import AddFuel from "./components/AddFuel";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import LandingPage from "./components/Landingpage";

// --- THEME CONTEXT ---
export const ThemeContext = React.createContext();

const isAuthenticated = () => localStorage.getItem("token") !== null;

// --- SIDEBAR (Updated with Theme Toggle) ---
const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if(window.confirm("Logout?")) { localStorage.clear(); window.location.href = "/"; }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed top-0 left-0 p-6 shadow-xl z-20 justify-between">
      <div>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-xl font-black tracking-tighter">
            <FaGasPump className="text-emerald-400" size={24} />
            <span>FUEL<span className="text-emerald-400">TRACKER</span></span>
          </div>
          {/* Desktop Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 bg-slate-800 rounded-xl text-emerald-400">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/dashboard") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiHome /> Dashboard
          </Link>
          <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/add") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiPlusCircle /> Add Fuel
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive("/history") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiClock /> History
          </Link>
        </nav>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all">
        <FiLogOut /> Logout
      </button>
    </aside>
  );
};

// --- BOTTOM NAV (Mobile) ---
const BottomNav = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center px-4 py-2 z-50 shadow-2xl">
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${isActive("/dashboard") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiHome size={20} /> <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link to="/history" className={`flex flex-col items-center gap-1 ${isActive("/history") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiClock size={20} /> <span className="text-[10px] font-bold">History</span>
      </Link>
      <Link to="/add" className="relative -top-5">
        <div className="p-4 rounded-full bg-emerald-500 text-white shadow-lg border-4 border-white dark:border-neutral-900">
          <FiPlusCircle size={24} />
        </div>
      </Link>
      {/* Mobile Theme Toggle */}
      <button onClick={toggleTheme} className="flex flex-col items-center gap-1 text-gray-400">
        {theme === 'light' ? <FiMoon size={20}/> : <FiSun size={20} className="text-yellow-400"/>}
        <span className="text-[10px] font-bold">Theme</span>
      </button>
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiUser size={20} /> <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </nav>
  );
};

// --- PRIVATE LAYOUT WRAPPER ---
const Layout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  if (!isAuthenticated()) return <Navigate to="/login" />;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <Sidebar />
      <main className="w-full md:ml-64 p-4 pb-28 md:p-8 overflow-x-hidden flex justify-center">
        {/* Mobile-on-Laptop Frame */}
        <div className="w-full max-w-md md:max-w-xl">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          {/* Public: Landing Page is now at / */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private: Dashboard moved to /dashboard */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/add" element={<Layout><AddFuel /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
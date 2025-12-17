import React, { useState, useEffect } from "react"; 
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
// FiSun, FiMoon icons import kiye
import { FiActivity, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon } from "react-icons/fi"; 
import { FaGasPump } from "react-icons/fa";

// Pages
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import AddFuel from "./components/AddFuel";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";

// ⭐ 1. THEME CONTEXT CREATE AUR EXPORT KAREIN
export const ThemeContext = React.createContext({ 
    theme: 'light', 
    toggleTheme: () => {} 
});

// --- CHECK LOGIN STATUS ---
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// --- SIDEBAR (Laptop) ---
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    // ⭐ Sidebar BG ko neutral-900 rakha, jo deep dark hai, lekin links mein slate-400 hi rakha
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed top-0 left-0 p-6 shadow-xl z-20 justify-between">
      <div>
        <div className="flex items-center gap-3 text-2xl font-bold mb-10 tracking-wide">
          <FaGasPump className="text-emerald-400" />
          <span>Fuel<span className="text-emerald-400">Tracker</span></span>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiActivity /> Dashboard
          </Link>
          <Link to="/add" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/add") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiPlusCircle /> Add Record
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/history") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiClock /> History
          </Link>
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/profile") ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}>
            <FiUser /> Profile
          </Link>
        </nav>
      </div>
    {/* ⭐ Sidebar Logout button mein hover BG ko neutral-800 rakha */}
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-xl transition-all font-medium">
        <FiLogOut /> Logout
      </button>
    </aside>
  );
};

// --- BOTTOM NAV (Mobile - Balanced Layout) ---
// --- BOTTOM NAV (Mobile - Balanced Layout) ---
const BottomNav = () => {
  // ⭐ Context se theme nikalenge
  const { theme } = React.useContext(ThemeContext); 
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };
  
  return (
    // ⭐ Changed py-3 to py-2 to make room for text without making the bar too big
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-between items-center px-6 py-2 z-30 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-[0_-5px_10px_rgba(0,0,0,0.8)]">
      
      {/* 1. LEFT: Home */}
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive("/") ? "text-emerald-500" : "text-gray-400"}`}>
        {/* Reduced size to 20 */}
        <FiActivity size={20} />
        {/* Added Name */}
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      {/* 2. LEFT: History */}
      <Link to="/history" className={`flex flex-col items-center gap-1 ${isActive("/history") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiClock size={20} />
        {/* Added Name */}
        <span className="text-[10px] font-medium">History</span>
      </Link>

      {/* 3. CENTER: Add Button (Floating) */}
      <Link to="/add" className="relative -top-6">
        {/* ⭐ Add Button Border ko neutral-900 rakha */}
        <div className={`p-4 rounded-full shadow-xl border-4 border-gray-50 flex items-center justify-center transition-transform hover:scale-105 dark:border-neutral-900 ${isActive("/add") ? "bg-emerald-600 text-white" : "bg-emerald-500 text-white"}`}>
          <FiPlusCircle size={28} />
        </div>
      </Link>

      {/* 4. RIGHT: Profile */}
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive("/profile") ? "text-emerald-500" : "text-gray-400"}`}>
        <FiUser size={20} />
        {/* Added Name */}
        <span className="text-[10px] font-medium">Profile</span>
      </Link>

      {/* 5. RIGHT: Logout (Red Color) */}
      <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400 hover:text-red-600">
        <FiLogOut size={20} />
        {/* Added Name */}
        <span className="text-[10px] font-medium">Logout</span>
      </button>

    </nav>
  );
};

// --- MAIN LAYOUT (Wrapper) ---
const Layout = ({ children }) => {
  // ⭐ Context se theme nikalenge
  const { theme } = React.useContext(ThemeContext); 
    
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    // ⭐ Main div BG ko neutral-900/gray-100 rakha
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'} flex flex-col md:flex-row font-sans text-gray-800 dark:text-gray-50`}>
      <Sidebar />
      <main className="w-full md:ml-64 p-6 pb-24 md:p-10 animate-fade-in">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

// --- APP COMPONENT ---
const App = () => {
    // ⭐ 2. THEME STATE AUR TOGGLE LOGIC
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    const toggleTheme = () => {
        setTheme((currentTheme) => {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    // ⭐ 3. useEffect se 'dark' class <body> tag par lagayein/hatayein
    useEffect(() => {
        const body = document.body;
        if (theme === 'dark') {
            body.classList.add('dark');
        } else {
            body.classList.remove('dark');
        }
    }, [theme]);
    
  return (
    // ⭐ 4. THEME CONTEXT PROVIDER se puri app ko theme state di
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES (No Login Needed) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PRIVATE ROUTES (Login Required) */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/add" element={<Layout><AddFuel /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
};

export default App;
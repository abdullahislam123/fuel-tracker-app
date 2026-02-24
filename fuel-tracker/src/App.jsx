import React, { useState, useEffect, useContext, createContext } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiClock, FiLogOut, FiUser, FiSun, FiMoon, FiHelpCircle, FiMoreHorizontal, FiX, FiActivity, FiMap } from "react-icons/fi";
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
import AddVehicle from "./components/AddVehicle";
import TripEstimator from "./components/TripEstimator";
import MapViewer from "./components/MapViewer";



// ⭐ Context imports
import { ThemeContext } from "./context/Themecontext";
import { VehicleContext } from "./context/VehicleContext";
import { AuthContext } from "./context/AuthContext";

const checkLoggedIn = () => localStorage.getItem("token") !== null;

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

const Sidebar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { activeVehicle } = useContext(VehicleContext);
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      localStorage.clear();
      setIsAuth(false);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-gradient-to-b from-slate-900 via-slate-900 to-[#12141c] text-white h-screen fixed top-0 left-0 p-5 shadow-2xl z-20 justify-between border-r border-white/5">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xl font-black tracking-tighter">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
              <FaGasPump className="text-slate-900" size={18} />
            </div>
            <span className="text-lg">FUEL<span className="text-emerald-500">PRO</span></span>
          </div>
        </div>

        {activeVehicle && (
          <div className="mb-4 p-3.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl -mr-8 -mt-8" />
            <p className="text-[8px] uppercase font-black text-emerald-500/60 mb-1 tracking-widest italic">Stable Connection</p>
            <p className="text-xs font-black italic truncate text-slate-100 uppercase tracking-tighter">{activeVehicle.name}</p>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          <Link to="/dashboard" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/dashboard") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/dashboard") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiHome size={16} className={isActive("/dashboard") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Dashboard
          </Link>
          <Link to="/add" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/add") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/add") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiPlusCircle size={16} className={isActive("/add") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Add Log
          </Link>
          <Link to="/history" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/history") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/history") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiClock size={16} className={isActive("/history") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> History
          </Link>
          <Link to="/profile" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/profile") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/profile") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiUser size={16} className={isActive("/profile") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Profile
          </Link>
          <Link to="/trip-estimator" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/trip-estimator") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/trip-estimator") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiActivity size={16} className={isActive("/trip-estimator") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Estimator
          </Link>
          <Link to="/map" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/map") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/map") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiMap size={16} className={isActive("/map") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Finder
          </Link>

          <div className="my-1 border-t border-white/5" />

          <Link to="/support" className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider transition-all relative ${isActive("/support") ? "bg-white/10 text-emerald-500" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            {isActive("/support") && <div className="absolute left-0 w-1 h-4 bg-emerald-500 rounded-full" />}
            <FiHelpCircle size={16} className={isActive("/support") ? "text-emerald-500" : "group-hover:text-emerald-400"} /> Support
          </Link>
          <button onClick={toggleTheme} className="group flex items-center gap-3 px-4 py-2 rounded-xl font-black italic text-[10px] uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />} {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <Link to="/select-vehicle" className="group flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 font-black italic text-[10px] uppercase tracking-wider hover:text-white hover:bg-white/5 transition-all relative">
            <FaGasPump size={14} /> Switch
          </Link>
        </nav>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-all"><FiLogOut /> Logout</button>
    </aside>
  );
};

// --- BOTTOM NAV (Mobile) ---
const BottomNav = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { setIsAuth } = useContext(AuthContext);
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
          <Link to="/history" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FiClock size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
          </Link>
          <Link to="/trip-estimator" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FiActivity size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Estimator</span>
          </Link>
          <Link to="/map" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FiMap size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Finder</span>
          </Link>
          <Link to="/select-vehicle" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FaGasPump size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Switch</span>
          </Link>
          <Link to="/profile" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FiUser size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
          </Link>
          <Link to="/support" onClick={closeMenu} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <FiHelpCircle size={28} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
          </Link>
          <button onClick={toggleTheme} className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
            {theme === 'light' ? <FiMoon size={28} className="text-slate-600" /> : <FiSun size={28} className="text-yellow-400" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          <button onClick={() => { localStorage.clear(); setIsAuth(false); }} className="flex flex-col items-center gap-3 p-6 bg-red-500/5 rounded-3xl">
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
  const { isAuth } = useContext(AuthContext);

  if (!isAuth) return <Navigate to="/login" replace />;
  const hasVehicle = activeVehicle || localStorage.getItem("activeVehicleId");
  if (!hasVehicle) return <Navigate to="/select-vehicle" replace />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-neutral-950' : 'bg-gray-50'}`}>
      <MobileHeader />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="w-full md:ml-60 p-4 pb-32 md:p-10 flex justify-center">
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
  const [isAuth, setIsAuth] = useState(checkLoggedIn());

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
    <AuthContext.Provider value={{ isAuth, setIsAuth }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <VehicleContext.Provider value={{ activeVehicle, setActiveVehicle }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={isAuth ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
              <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={isAuth ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route path="/select-vehicle" element={isAuth ? <VehicleSelect /> : <Navigate to="/login" replace />} />
              <Route path="/add-vehicle" element={isAuth ? <AddVehicle /> : <Navigate to="/login" replace />} />


              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/add" element={<Layout><AddFuel /></Layout>} />
              <Route path="/history" element={<Layout><History /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/trip-estimator" element={<Layout><TripEstimator /></Layout>} />
              <Route path="/map" element={<Layout><MapViewer /></Layout>} />
              <Route path="/support" element={<Layout><SupportForm /></Layout>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </VehicleContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
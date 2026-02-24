import React, { useState, useContext } from "react";
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import { ThemeContext } from "../context/Themecontext";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login");
      } else {
        alert(data.error);
      }
    } catch (err) { alert("Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0a0c10]' : 'bg-gray-50'} flex items-center justify-center p-4 transition-colors duration-500`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500 text-slate-900 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 -rotate-12 hover:rotate-0 transition-transform duration-500">
            <FiShield size={36} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-2">Register<span className="text-emerald-500">.</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="glass-card p-1.5 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-transparent focus-within:border-emerald-500/30 transition-all group">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 group-focus-within:shadow-lg transition-all">
                  <FiUser size={20} />
                </div>
                <input
                  required type="text"
                  placeholder="Full Name"
                  className="w-full bg-transparent outline-none dark:text-white font-bold italic tracking-wider text-sm py-2"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-transparent focus-within:border-emerald-500/30 transition-all group">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 group-focus-within:shadow-lg transition-all">
                  <FiMail size={20} />
                </div>
                <input
                  required type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent outline-none dark:text-white font-bold italic tracking-wider text-sm py-2"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-white/5 rounded-3xl border border-transparent focus-within:border-emerald-500/30 transition-all group relative">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 group-focus-within:shadow-lg transition-all">
                  <FiLock size={20} />
                </div>
                <input
                  required type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none dark:text-white font-bold italic tracking-wider text-sm py-2"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-emerald-500 transition-colors outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-7 bg-emerald-500 text-slate-900 rounded-[2.2rem] font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group"
          >
            {loading ? <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : (
              <>
                Sign Up <FiArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
              Already registered? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors underline decoration-emerald-500/30 underline-offset-4">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
import React, { useRef, useState, useContext } from 'react';
import emailjs from '@emailjs/browser';
import { FiSend, FiMessageSquare, FiAlertCircle, FiArrowLeft, FiAtSign, FiTerminal, FiTag, FiHash, FiUser } from 'react-icons/fi';
import { ThemeContext } from '../context/Themecontext';
import { useNavigate } from 'react-router-dom';

const SupportForm = () => {
  const form = useRef();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Transmitting message...');

    emailjs.sendForm(
      'service_hx4riya',
      'template_4zyfyyn',
      form.current,
      'Dp1U6Z_SVVP1aeWyt'
    )
      .then(() => {
        setStatus('Message Synchronized! ✅');
        setLoading(false);
        form.current.reset();
        setTimeout(() => setStatus(''), 5000);
      }, (error) => {
        setStatus('Transmission Failed. ❌');
        setLoading(false);
      });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0a0c10]' : 'bg-gray-50'} pb-20 transition-colors duration-500`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <header className="pt-10 mb-12 flex items-center justify-between px-4 max-w-2xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/5 rounded-3xl text-slate-900 dark:text-white active:scale-95 transition-all shadow-xl">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-black italic tracking-tighter dark:text-white">Support<span className="text-emerald-500">.</span></h1>
        <div className="w-12" />
      </header>

      <main className="max-w-2xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-6 rounded-[2.2rem] bg-emerald-500/10 text-emerald-500 mb-6 shadow-2xl shadow-emerald-500/10">
            <FiMessageSquare size={36} />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] italic">Operational Assistance Protocol</p>
        </div>

        <div className="glass-card p-1.5 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden">
          <div className="absolute right-0 top-0 p-8 text-emerald-500/5 rotate-12 pointer-events-none">
            <FiTerminal size={150} />
          </div>

          <form ref={form} onSubmit={sendEmail} className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-10 space-y-6 relative z-10">
            <input type="hidden" name="system_info" value={navigator.userAgent} />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Subject Identity</label>
              <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-neutral-800/50 p-4 rounded-3xl border-2 border-transparent focus-within:border-emerald-500/30 transition-all group">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 transition-all shadow-sm">
                  <FiUser size={18} />
                </div>
                <input name="user_name" type="text" placeholder="Operator Name" required className="bg-transparent w-full outline-none font-black italic dark:text-white tracking-widest text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Communication Node</label>
              <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-neutral-800/50 p-4 rounded-3xl border-2 border-transparent focus-within:border-emerald-500/30 transition-all group">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 transition-all shadow-sm">
                  <FiAtSign size={18} />
                </div>
                <input name="user_email" type="email" placeholder="Email Address" required className="bg-transparent w-full outline-none font-black italic dark:text-white tracking-widest text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Issue Classification</label>
              <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-neutral-800/50 p-4 rounded-3xl border-2 border-transparent focus-within:border-emerald-500/30 transition-all group">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl text-slate-400 group-focus-within:text-emerald-500 transition-all shadow-sm">
                  <FiTag size={18} />
                </div>
                <select name="subject" className="w-full bg-transparent outline-none font-black italic dark:text-white appearance-none uppercase tracking-widest text-xs cursor-pointer">
                  <option value="Bug Report" className="dark:bg-[#12141c]">🪲 Bug Report</option>
                  <option value="Feature Request" className="dark:bg-[#12141c]">💡 Feature Request</option>
                  <option value="Account Issue" className="dark:bg-[#12141c]">🔑 Account Issue</option>
                  <option value="Other" className="dark:bg-[#12141c]">📝 Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-4">Intelligence Briefing</label>
              <div className="flex gap-4 bg-slate-100/50 dark:bg-neutral-800/50 p-6 rounded-[2rem] border-2 border-transparent focus-within:border-emerald-500/30 transition-all group">
                <textarea name="message" required placeholder="Describe the anomaly..." className="w-full bg-transparent outline-none font-black italic dark:text-white tracking-widest h-40 resize-none text-sm"></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-8 bg-emerald-500 text-slate-900 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 active:scale-[0.98] hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" /> : <><FiSend size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Submit Intel</>}
            </button>
          </form>

          {status && (
            <div className={`mx-8 mb-8 p-4 rounded-3xl flex items-center justify-center gap-3 font-black italic uppercase tracking-widest text-[9px] ${status.includes('successfully') || status.includes('Synchronized') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <FiAlertCircle /> {status}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupportForm;
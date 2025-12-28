import React, { useRef, useState, useContext } from 'react';
import emailjs from '@emailjs/browser';
import { FiSend, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { ThemeContext } from '../App'; // Context import kiya theme check karne ke liye

const SupportForm = () => {
  const form = useRef();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending your message...');

    emailjs.sendForm(
      'service_hx4riya', 
      'template_4zyfyyn', 
      form.current, 
      'Dp1U6Z_SVVP1aeWyt'
    )
    .then(() => {
      setStatus('Message sent successfully! ✅');
      setLoading(false);
      form.current.reset();
      setTimeout(() => setStatus(''), 5000);
    }, (error) => {
      console.log(error.text);
      setStatus('Failed to send. Please try again. ❌');
      setLoading(false);
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-4 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
          <FiMessageSquare size={28} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Customer <span className="text-emerald-500">Support</span>
        </h2>
        <p className="text-slate-500 dark:text-neutral-400 mt-2">
          Koi masla hai ya koi naya feature chahiye? Humein batayein!
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
        <form ref={form} onSubmit={sendEmail} className="space-y-5">
          {/* Hidden Device Info */}
          <input type="hidden" name="system_info" value={navigator.userAgent} />

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-2 ml-1">
              Full Name
            </label>
            <input 
              type="text" 
              name="user_name" 
              placeholder="e.g. Ali Ahmed"
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all outline-none"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-2 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              name="user_email" 
              placeholder="name@example.com"
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all outline-none"
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-2 ml-1">
              Category
            </label>
            <select 
              name="subject" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all outline-none appearance-none"
            >
              <option value="Bug Report">🪲 Bug Report</option>
              <option value="Feature Request">💡 Feature Request</option>
              <option value="Account Issue">🔑 Account Issue</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-500 mb-2 ml-1">
              Your Message
            </label>
            <textarea 
              name="message" 
              required 
              placeholder="Apna masla tafseel se likhein..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all outline-none h-32 resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/20 ${loading ? 'bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {loading ? 'Sending...' : <><FiSend /> Submit Request</>}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 ${status.includes('success') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
            <FiAlertCircle /> {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportForm;
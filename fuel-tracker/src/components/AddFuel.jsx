import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiDroplet, FiDollarSign, FiActivity, FiArrowLeft, FiSave, FiZap, FiInfo, FiCheckCircle } from "react-icons/fi";
import { API_URL } from "../config"; 

const AddFuel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [lastReading, setLastReading] = useState(null);

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: getCurrentTime(),
    cost: "", 
    liters: "", 
    pricePerLiter: "", 
    odometer: "" 
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/history`, { headers: { 'Authorization': token } })
      .then(res => res.json())
      .then(data => {
        const dataArray = Array.isArray(data) ? data : (data.data || []);
        if (dataArray.length > 0) {
            const maxOdo = Math.max(...dataArray.map(e => parseFloat(e.odometer || 0)));
            setLastReading(maxOdo);
        }
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "liters" || name === "pricePerLiter") {
      const l = parseFloat(name === "liters" ? value : formData.liters);
      const p = parseFloat(name === "pricePerLiter" ? value : formData.pricePerLiter);
      if (!isNaN(l) && !isNaN(p)) newFormData.cost = (l * p).toFixed(2); 
    }
    setFormData(newFormData);
  };

  const handleBlur = (field) => setTouched({ ...touched, [field]: true });

  const isInvalid = (field) => {
    if (field === 'odometer') {
        return touched[field] && (!formData[field] || parseFloat(formData[field]) <= lastReading);
    }
    return touched[field] && !formData[field];
  };

  const handleSave = async () => {
    if (!formData.cost || !formData.liters || !formData.odometer) {
      alert("Fields missing! Odometer, Liters and Rate are mandatory.");
      return;
    }
    if (parseFloat(formData.odometer) <= lastReading) {
      alert(`Odometer reading must be higher than ${lastReading} KM`);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token"); 
    try {
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ ...formData, liters: parseFloat(formData.liters), pricePerLiter: parseFloat(formData.pricePerLiter), odometer: parseFloat(formData.odometer) })
      });
      if (response.ok) {
        localStorage.removeItem("manualOdo");
        navigate("/dashboard");
      }
    } catch (error) { alert("Server error!"); } finally { setLoading(false); }
  };

  const getInputClass = (field) => `
    w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800/40 border-2 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 dark:text-white
    ${isInvalid(field) ? "border-red-400 bg-red-50/30" : "border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"}
  `;

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 animate-fade-in">
      <header className="flex items-center gap-4 mb-10 pt-8">
        <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border dark:border-neutral-800 active:scale-90 transition-transform">
          <FiArrowLeft size={20} className="text-emerald-500" />
        </button>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Refill <span className="text-emerald-500">Log</span></h2>
      </header>
      
      <div className="bg-white dark:bg-neutral-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border dark:border-neutral-800 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ⭐ Odometer: Remainder Added */}
          <div className="md:col-span-2 bg-emerald-500/5 p-6 rounded-[2.5rem] border border-dashed border-emerald-500/20">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><FiActivity /> Odometer (KM)</label>
              {lastReading && <span className="text-[9px] font-black text-emerald-500">Last: {lastReading} KM</span>}
            </div>
            <div className="relative">
              <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 z-10" />
              <input type="number" step="0.1" name="odometer" placeholder="Enter meter reading..." value={formData.odometer} onChange={handleInputChange} onBlur={() => handleBlur('odometer')} className={getInputClass('odometer')} />
            </div>
            <p className="text-[9px] text-slate-400 mt-2 ml-1 font-bold italic flex items-center gap-1">
               <FiInfo /> Tip: Daily meter reading yahan update karne se "Oil Life %" accurate rahegi.
            </p>
          </div>

          {/* Liters: Remainder Added */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Liters</label>
            <div className="relative">
              <FiDroplet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input type="number" step="0.01" name="liters" placeholder="0.00" value={formData.liters} onChange={handleInputChange} onBlur={() => handleBlur('liters')} className={getInputClass('liters')} />
            </div>
            <p className="text-[9px] text-slate-400 ml-1 font-medium">Machine se liters dekh kar likhein (Average calculation ke liye).</p>
          </div>
          
          {/* Rate: Remainder Added */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Price Per Liter</label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input type="number" step="0.01" name="pricePerLiter" placeholder="e.g. 264.7" value={formData.pricePerLiter} onChange={handleInputChange} onBlur={() => handleBlur('pricePerLiter')} className={getInputClass('pricePerLiter')} />
            </div>
            <p className="text-[9px] text-slate-400 ml-1 font-medium">Aaj ka petrol rate. Total bill khud calculate ho jaye ga.</p>
          </div>

          {/* Auto-Calculated Total */}
          <div className="md:col-span-2 bg-slate-900 dark:bg-black/20 p-8 rounded-[2.5rem] flex items-center justify-between">
             <div className="flex items-center gap-3">
                <FiCheckCircle className="text-emerald-500" size={24} />
                <span className="text-xl font-black text-white italic">Total Bill</span>
             </div>
             <div className="text-4xl font-black text-emerald-500 tracking-tighter">Rs. {formData.cost || "0.00"}</div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full mt-10 py-6 text-white font-black bg-emerald-500 rounded-[2.5rem] hover:bg-emerald-600 shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-widest text-xs">
          {loading ? "SAVING..." : <><FiSave size={20} /> Save Entry</>}
        </button>
      </div>
    </div>
  );
};

export default AddFuel;
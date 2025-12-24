import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiDroplet, FiDollarSign, FiActivity, FiArrowLeft, FiSave } from "react-icons/fi";
// ⭐ Config se API_URL import kiya
import { API_URL } from "../config"; 

const AddFuel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: getCurrentTime(),
    cost: "", 
    liters: "", 
    pricePerLiter: "", 
    odometer: "" 
  });

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

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const isInvalid = (field) => {
    return touched[field] && !formData[field];
  };

  // ⭐ Updated handleSave with Dynamic URL
  const handleSave = async () => {
    if (!formData.cost || !formData.liters || !formData.pricePerLiter) {
      alert("Please fill all required fields!");
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token"); 

    try {
      // ⭐ Dynamic API_URL use ho raha hai jo local/live khud sambhalega
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token 
        },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          cost: formData.cost, 
          liters: parseFloat(formData.liters),
          pricePerLiter: parseFloat(formData.pricePerLiter),
          odometer: formData.odometer
        })
      });

      if (response.ok) {
        navigate("/history");
      } else {
        alert("Session Expired or Error. Please Login again.");
      }
    } catch (error) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (field) => `
    w-full p-4 pl-12 bg-slate-50 dark:bg-neutral-800 border-2 rounded-2xl outline-none transition-all font-medium text-slate-700 dark:text-white
    ${isInvalid(field) 
      ? "border-red-400 focus:border-red-500 animate-shake" 
      : "border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"}
  `;

  return (
    <div className="max-w-2xl mx-auto pb-10 px-4 md:px-0 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
            <FiArrowLeft size={20} />
         </button>
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Add Fuel</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Record your pump transaction</p>
         </div>
      </div>
      
      <div className="bg-white dark:bg-neutral-900 p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Refill Date</label>
            <FiCalendar className="absolute left-4 top-11.5 text-slate-400 z-10" size={20} />
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} onBlur={() => handleBlur('date')} className={getInputClass('date')} />
            {isInvalid('date') && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Date is required</p>}
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Refill Time</label>
            <FiClock className="absolute left-4 top-11.5 text-slate-400 z-10" size={20} />
            <input type="time" name="time" value={formData.time} onChange={handleInputChange} onBlur={() => handleBlur('time')} className={getInputClass('time')} />
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fuel Amount (L)</label>
            <FiDroplet className="absolute left-4 top-11.5 text-slate-400 z-10" size={20} />
            <input type="number" name="liters" placeholder="0.00" value={formData.liters} onChange={handleInputChange} onBlur={() => handleBlur('liters')} className={getInputClass('liters')} />
            {isInvalid('liters') && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Enter liters consumed</p>}
          </div>
          
          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rate (Rs / Liter)</label>
            <FiDollarSign className="absolute left-4 top-11.5 text-slate-400 z-10" size={20} />
            <input type="number" name="pricePerLiter" placeholder="e.g. 264.74" value={formData.pricePerLiter} onChange={handleInputChange} onBlur={() => handleBlur('pricePerLiter')} className={getInputClass('pricePerLiter')} />
            {isInvalid('pricePerLiter') && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Price per liter is required</p>}
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Odometer (KM)</label>
            <FiActivity className="absolute left-4 top-11.5 text-slate-400 z-10" size={20} />
            <input type="number" name="odometer" placeholder="e.g. 12450" value={formData.odometer} onChange={handleInputChange} className={getInputClass('odometer')} />
          </div>

          <div className="relative">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Bill (PKR)</label>
            <FiDollarSign className="absolute left-4 top-11.5 text-emerald-500 z-10" size={20} />
            <input type="number" name="cost" placeholder="0" readOnly value={formData.cost} className="w-full p-4 pl-12 bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 rounded-2xl font-black text-emerald-600 dark:text-emerald-400 outline-none" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <button onClick={() => navigate("/dashboard")} className="flex-1 py-4 text-red-500 font-bold bg-slate-100 dark:bg-neutral-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all active:scale-[0.98]">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-4 text-white font-black bg-emerald-500 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 disabled:bg-slate-300 dark:disabled:bg-neutral-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            {loading ? "Recording..." : <><FiSave size={20} /> Save Entry</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFuel;
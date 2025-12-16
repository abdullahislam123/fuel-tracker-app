import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddFuel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handleSave = async () => {
    if (!formData.cost || !formData.liters) return alert("Please fill details!");
    
    setLoading(true);
    const token = localStorage.getItem("token"); 

    try {
      const response = await fetch('https://fuel-tracker-api.vercel.app/add', {
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

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Fuel Record</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Liters</label>
          <input type="number" name="liters" placeholder="e.g. 10.5" value={formData.liters} onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Rate (Rs/L)</label>
          <input type="number" name="pricePerLiter" placeholder="e.g. 280" value={formData.pricePerLiter} onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <p className="text-xs text-gray-400 mt-1 ml-1">Example: 264.74</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Total Cost</label>
          <input type="number" name="cost" placeholder="0" readOnly value={formData.cost} 
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-slate-700" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Odometer</label>
          <input type="number" name="odometer" placeholder="e.g. 50200" value={formData.odometer} onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {/* --- BUTTONS SECTION (Updated) --- */}
      <div className="flex gap-4 mt-8">
        {/* CANCEL BUTTON */}
        <button 
          onClick={() => navigate("/dashboard")} 
          className="flex-1 py-4 text-slate-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>

        {/* SAVE BUTTON */}
        <button 
          onClick={handleSave} 
          disabled={loading}    
          className="flex-1 py-4 text-white font-bold bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:bg-gray-400 transition-all"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </div>
      {/* ------------------------------- */}

    </div>
  );
};

export default AddFuel;
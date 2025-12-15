import React, { useState, useEffect } from "react";
import { FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar } from "react-icons/fi";
import { FaRoad } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  // --- 1. FETCH DATA (Token ke sath) ---
  // ... (FETCH DATA remains the same)
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Agar token nahi hai to login par bhejo
    if (!token) {
      navigate("/login");
      return;
    }

    fetch('https://fuel-tracker-api.vercel.app/history', {
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) setEntries(data);
      })
      .catch(err => console.error("Error:", err));
  }, []);


  // --- 2. DELETE FUNCTION (Secure) ---
  // ... (DELETE FUNCTION remains the same)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`https://fuel-tracker-api.vercel.app/delete/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': token }
        });

        if (res.ok) {
          setEntries(entries.filter(entry => entry._id !== id));
        } else {
          alert("Failed to delete");
        }
      } catch (error) {
        alert("Server Error");
      }
    }
  };


  // --- 3. EDIT FUNCTIONS ---

  // Jab Edit button dabaye
  const handleEditClick = (entry) => {
    setEditData(entry);
    setIsEditing(true);
  };

  // Jab form mein kuch change ho
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...editData, [name]: value };

    // Cost auto-calculate karo
    if (name === "liters" || name === "pricePerLiter") {
      const l = parseFloat(name === "liters" ? value : editData.liters);
      const p = parseFloat(name === "pricePerLiter" ? value : editData.pricePerLiter);
      if (!isNaN(l) && !isNaN(p)) {
        // ⭐ CHANGE 1: Cost ko 2 decimal places tak fix kiya
        newData.cost = (l * p).toFixed(2);
      }
    }
    setEditData(newData);
  };

  // Save changes to DB
  const saveEdit = async () => {
    const token = localStorage.getItem("token");

    // ⭐ CHANGE 2: Liters aur Rate ko number mein convert karke bhej rahe hain
    const dataToSend = {
      ...editData,
      liters: parseFloat(editData.liters),
      pricePerLiter: parseFloat(editData.pricePerLiter),
      // cost already .toFixed(2) se string format mein hai, jo theek hai
    };

    try {
      const res = await fetch(`https://fuel-tracker-api.vercel.app/update/${editData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(dataToSend) // Updated dataToSend object bhej rahe hain
      });

      if (res.ok) {
        const updatedEntry = await res.json();
        // List ko update karo taake refresh na karna pare
        const updatedEntries = entries.map((item) =>
          item._id === editData._id ? updatedEntry.data : item
        );
        setEntries(updatedEntries);
        setIsEditing(false); // Modal band karo
        setEditData(null);
      } else {
        alert("Update Failed!");
      }
    } catch (error) {
      alert("Server Error");
    }
  };

  return (
    <div className="relative pb-20">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">History</h1>
          <p className="text-slate-500 text-sm mt-1">Synced with Cloud Database.</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
          Total: {entries.length}
        </div>
      </header>

      {/* --- ENTRIES LIST --- */}
      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative transition-transform hover:scale-[1.01]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>

            <div className="p-5 pl-7">
              {/* ... Date, Time, Buttons remain the same ... */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <FiCalendar className="text-emerald-500" /> {entry.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <FiClock /> {entry.time}
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Edit Button Added */}
                  <button onClick={() => handleEditClick(entry)} className="p-2 bg-gray-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-gray-200">
                    <FiEdit2 size={16} />
                  </button>
                  {/* Delete Button */}
                  <button onClick={() => handleDelete(entry._id)} className="p-2 bg-gray-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-gray-200">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
                {/* ⭐ CHANGE 3: Display cost with 2 decimals and currency formatting */}
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Rs. {parseFloat(entry.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Fuel</p>
                  <p className="font-bold text-slate-700 text-sm flex items-center gap-1"><FiDroplet className="text-blue-400" /> {entry.liters} L</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rate</p>
                  <p className="font-bold text-slate-700 text-sm flex items-center gap-1"><FiTrendingUp className="text-orange-400" /> {entry.pricePerLiter}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Odo</p>
                  <p className="font-bold text-slate-700 text-sm flex items-center gap-1"><FaRoad className="text-purple-400" /> {entry.odometer || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-400">No history found.</p></div>}
      </div>

      {/* --- EDIT MODAL (Popup) --- */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FiEdit2 className="text-emerald-500" /> Edit Record</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><FiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label><input type="date" name="date" value={editData.date} onChange={handleEditChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label><input type="time" name="time" value={editData.time || ""} onChange={handleEditChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Liters</label><input type="number" name="liters" value={editData.liters} onChange={handleEditChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rate</label><input type="number" name="pricePerLiter" value={editData.pricePerLiter} onChange={handleEditChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold" /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Cost (Auto)</label>
                {/* ⭐ CHANGE 4: Modal display mein bhi 2 decimals dikhao */}
                <input
                  type="text" // Type text rakha kyunki .toFixed(2) string deta hai
                  name="cost"
                  value={parseFloat(editData.cost).toFixed(2)}
                  readOnly
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg font-bold"
                />
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Odometer</label><input type="number" name="odometer" value={editData.odometer} onChange={handleEditChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-600 font-semibold bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-3 text-white font-bold bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"><FiSave /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
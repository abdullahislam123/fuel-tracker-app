import React, { useState, useEffect } from "react";
// FiList aur FiCalendar import kiye
import { FiDownload, FiTrash2, FiDroplet, FiTrendingUp, FiClock, FiEdit2, FiX, FiSave, FiCalendar, FiList } from "react-icons/fi"; 
import { FaRoad } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Helper function to format date for month view
const formatDate = (date) => {
    return date ? date.split('T')[0] : '';
};

// Helper function to group entries by date
const groupEntriesByDate = (entries) => {
    return entries.reduce((acc, entry) => {
        const dateKey = formatDate(entry.date);
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(entry);
        return acc;
    }, {});
};
// --- NEW: EXPORT TO CSV FUNCTION ---
  const exportToCSV = () => {
    if (entries.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV Headers
    const headers = ["Date", "Time", "Liters", "Rate (Rs/L)", "Total Cost (Rs)", "Odometer"];
    
    // Convert data to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...entries.map(entry => [
        entry.date,
        entry.time || "-",
        entry.liters,
        entry.pricePerLiter,
        entry.cost,
        entry.odometer || "-"
      ].join(","))
    ].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fuel_History_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
// Helper function to get the number of days in a month
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const History = () => {
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();
    
    // ⭐ NEW STATES FOR VIEW TOGGLE AND CALENDAR
    const [currentView, setCurrentView] = useState('list'); // 'list' or 'month'
    const [currentMonth, setCurrentMonth] = useState(new Date()); 
    const [selectedDateEntries, setSelectedDateEntries] = useState(null); // Entries for popup

    // Memoized data for Calendar view
    const entriesByDate = groupEntriesByDate(entries);
    
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
  }, [navigate]); // Added navigate to dependency array

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
  // ... (handleEditClick and handleEditChange remain the same, calculation is fixed)
  const handleEditClick = (entry) => {
    setEditData(entry);
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...editData, [name]: value };

    if (name === "liters" || name === "pricePerLiter") {
      const l = parseFloat(name === "liters" ? value : editData.liters);
      const p = parseFloat(name === "pricePerLiter" ? value : editData.pricePerLiter);
      if (!isNaN(l) && !isNaN(p)) {
        newData.cost = (l * p).toFixed(2);
      }
    }
    setEditData(newData);
  };

  const saveEdit = async () => {
    const token = localStorage.getItem("token");

    const dataToSend = {
      ...editData,
      liters: parseFloat(editData.liters),
      pricePerLiter: parseFloat(editData.pricePerLiter),
    };

    try {
      const res = await fetch(`https://fuel-tracker-api.vercel.app/update/${editData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        const updatedEntry = await res.json();
        const updatedEntries = entries.map((item) =>
          item._id === editData._id ? updatedEntry.data : item
        );
        setEntries(updatedEntries);
        setIsEditing(false); 
        setEditData(null);
      } else {
        alert("Update Failed!");
      }
    } catch (error) {
      alert("Server Error");
    }
  };
    
    // --- NEW: CALENDAR LOGIC ---

    const handleDateClick = (date) => {
        const dateKey = formatDate(date);
        const entries = entriesByDate[dateKey] || [];
        if (entries.length > 0) {
            setSelectedDateEntries(entries);
        }
    };
    
    // Function to generate the month grid
    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        // 0 = Sunday, 1 = Monday. We want Monday (1) to be the first cell (index 0).
        // Modulo 7 is used to ensure the day is within 0-6.
        const firstDayOfMonth = new Date(year, month, 1).getDay(); 
        
        // Calculate the starting position (0 for Monday, 6 for Sunday)
        // If firstDayOfMonth is 0 (Sunday), start padding is 6 (last cell).
        // If firstDayOfMonth is 1 (Monday), start padding is 0.
        // If firstDayOfMonth is 2 (Tuesday), start padding is 1.
        const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
        const daysInMonth = getDaysInMonth(year, month);
        
        const days = [];
        
        // Empty cells for padding
        for (let i = 0; i < startPadding; i++) {
            days.push(<div key={`pad-${i}`} className="p-2 text-center text-gray-300"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entriesByDate[dateKey];
            
            days.push(
                <div 
                    key={day}
                    onClick={() => hasEntry && handleDateClick(dateKey)}
                    className={`p-2 h-16 rounded-lg flex flex-col justify-between cursor-pointer transition-all ${
                        hasEntry 
                            ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-200'
                            : 'bg-gray-50 border border-gray-200 text-slate-700 hover:bg-gray-100'
                    }`}
                >
                    <span className="text-sm self-start">{day}</span>
                    {hasEntry && (
                        <span className="text-[10px] font-extrabold self-end">
                            Rs. {parseFloat(hasEntry.reduce((sum, e) => sum + parseFloat(e.cost), 0)).toFixed(0)}
                        </span>
                    )}
                </div>
            );
        }

        return days;
    };
    
    const changeMonth = (delta) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
            return newDate;
        });
    };
    
    // --- RENDER ---
  return (
    <div className="relative pb-20">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">History</h1>
          <p className="text-slate-500 text-sm mt-1">Synced with Cloud Database.</p>
        </div>
{/* ⭐ EXPORT BUTTON */}
    <button 
      onClick={exportToCSV}
      className="flex items-center gap-2 bg-white border border-gray-200 text-slate-600 px-3 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
    >
      <FiDownload size={18} />
      <span className="hidden md:inline">Export</span>
    </button>

        {/* ⭐ ADDED: VIEW TOGGLE BUTTONS */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl shadow-inner">
            <button 
                onClick={() => setCurrentView('list')} 
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 font-semibold text-sm ${currentView === 'list' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
            >
                <FiList size={18} /> List
            </button>
            <button 
                onClick={() => setCurrentView('month')} 
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 font-semibold text-sm ${currentView === 'month' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
            >
                <FiCalendar size={18} /> Month
            </button>
        </div>
      </header>

      {/* --- CONDITIONAL RENDERING --- */}
      {currentView === 'list' ? (
        
        // --- ENTRIES LIST VIEW (Existing Code) ---
        <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative transition-transform hover:scale-[1.01]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>

            <div className="p-5 pl-7">
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
                  <button onClick={() => handleEditClick(entry)} className="p-2 bg-gray-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-gray-200">
                    <FiEdit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(entry._id)} className="p-2 bg-gray-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-gray-200">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cost</p>
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
        
      ) : (
        
        // ⭐ MONTH VIEW (CALENDAR)
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 text-gray-500 hover:text-emerald-600 font-bold">&lt; Previous</button>
                <h3 className="text-lg font-bold text-slate-800">
                    {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 text-gray-500 hover:text-emerald-600 font-bold">Next &gt;</button>
            </div>

            {/* Weekday Headers (Adjusted to start with Monday and end with Sunday) */}
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 mb-2 border-b border-gray-100 pb-2">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderCalendarGrid()}
            </div>
            
            {entries.length === 0 && <p className="text-center text-gray-400 py-4">No data available for calendar view.</p>}
        </div>
      )}

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
                <input
                  type="text" 
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
      
      {/* ⭐ ADDED: DAILY ENTRIES POPUP */}
      {selectedDateEntries && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                   <div className="flex justify-between items-center mb-4 border-b pb-3">
                       <h3 className="text-xl font-bold text-slate-800">
                            Entries for {selectedDateEntries[0].date}
                       </h3>
                       <button onClick={() => setSelectedDateEntries(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                           <FiX size={20} />
                       </button>
                   </div>
                   
                   <div className="space-y-3">
                        {selectedDateEntries.map((entry, index) => (
                             <div key={index} className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                 <div className="flex justify-between items-start mb-2">
                                     <p className="text-lg font-bold text-emerald-800">
                                         Rs. {parseFloat(entry.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                     </p>
                                     <p className="text-sm text-gray-500 flex items-center gap-1"><FiClock size={14} /> {entry.time}</p>
                                 </div>
                                 <div className="flex justify-between text-sm text-slate-700">
                                     <p><FiDroplet className="inline text-blue-400" /> {entry.liters} L</p>
                                     <p><FiTrendingUp className="inline text-orange-400" /> Rs. {entry.pricePerLiter} /L</p>
                                 </div>
                             </div>
                        ))}
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default History;
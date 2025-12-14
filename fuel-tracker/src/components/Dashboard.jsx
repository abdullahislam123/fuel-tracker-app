import React, { useState, useEffect } from "react";
import { FiDollarSign, FiDroplet, FiTrendingUp, FiClock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User");
  const navigate = useNavigate();

  // Live Backend URL
  // ⚠️ FIX: Yahan wahi link lagaya jo History.jsx mein chal raha hai
  const API_URL = "https://fuel-tracker-api.vercel.app";

  useEffect(() => {
    // 1. Get User Name
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }

    // 2. Fetch History Data
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/history`, {
      method: 'GET',
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            navigate('/login');
            return [];
        }
        return res.json();
      })
      .then(data => {
        // Handle API variations (Direct Array or Object)
        let finalData = [];
        if (Array.isArray(data)) {
            finalData = data;
        } else if (data.data && Array.isArray(data.data)) {
            finalData = data.data; // Agar backend { data: [...] } bheje
        } else if (data.entries && Array.isArray(data.entries)) {
            finalData = data.entries;
        }

        setEntries(finalData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [navigate]);

  // --- OPTIMIZED CALCULATIONS ---
  // Ye logic khud dhoond lega ke database m paise aur petrol kis naam se save hain
  
  const totalSpent = entries.reduce((acc, item) => {
    // Priority: totalCost -> cost -> price -> amount
    const rawVal = item.totalCost || item.cost || item.price || item.amount || 0;
    return acc + parseFloat(rawVal); // Ensure it's a number
  }, 0);

  const totalLiters = entries.reduce((acc, item) => {
    // Priority: liters -> fuelAmount -> quantity -> litres
    const rawVal = item.liters || item.fuelAmount || item.quantity || item.litres || 0;
    return acc + parseFloat(rawVal); // Ensure it's a number
  }, 0);

  const avgPrice = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;

  if (loading) return <div className="p-10 text-center text-emerald-500 font-bold animate-pulse">Loading Overview...</div>;

  return (
    <div>
      {/* --- HEADER --- */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, <span className="font-bold text-emerald-600 capitalize">{username}</span>! 👋
        </p>
      </header>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Total Spent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {totalSpent.toLocaleString()}</div>
          <div className="absolute top-5 right-5 p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <FiDollarSign size={24} />
          </div>
        </div>
        
        {/* Card 2: Total Liters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consumed</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {totalLiters.toFixed(2)} <span className="text-lg text-gray-400 font-medium">L</span>
          </div>
          <div className="absolute top-5 right-5 p-3 bg-blue-50 text-blue-500 rounded-xl">
            <FiDroplet size={24} />
          </div>
        </div>

        {/* Card 3: Avg Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition hover:shadow-md">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Rate</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {avgPrice}</div>
          <div className="absolute top-5 right-5 p-3 bg-orange-50 text-orange-500 rounded-xl">
            <FiTrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FiClock className="text-emerald-500"/> Recent Activity
            </h3>
            <span className="text-xs text-gray-400">Last 3 entries</span>
        </div>
        
        <div className="p-4">
            {entries.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No data available yet.</p>
            ) : (
                entries.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 mb-2 bg-gray-50 rounded-xl hover:bg-emerald-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm">
                                <FiCalendar size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">
                                  {parseFloat(item.liters || item.fuelAmount || item.quantity || 0).toFixed(2)} Liters
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(item.date || item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">
                              Rs. {parseFloat(item.totalCost || item.cost || item.price || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
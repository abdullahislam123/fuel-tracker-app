import React, { useState, useEffect } from "react";
import { FiDollarSign, FiDroplet, FiTrendingUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User"); // Default name
  const navigate = useNavigate();

  useEffect(() => {
    // 1. User ka NAAM nikalo LocalStorage se
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.username) {
      setUsername(userData.username);
    }

    // 2. Data Fetch Karo
    const token = localStorage.getItem("token");

    fetch('https://fuel-tracker-api.vercel.app/history', {
      method: 'GET',
      headers: {
        'Authorization': token 
      }
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
        if(Array.isArray(data)) setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  const totalSpent = entries.reduce((acc, item) => acc + parseFloat(item.cost || 0), 0);
  const totalLiters = entries.reduce((acc, item) => acc + parseFloat(item.liters || 0), 0);
  const avgPrice = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;

  if (loading) return <div className="p-10 text-center text-emerald-500 font-bold">Loading Data...</div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, <span className="font-bold text-emerald-600 capitalize">{username}</span>! 👋
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {totalSpent.toLocaleString()}</div>
          <div className="absolute top-5 right-5 p-3 bg-emerald-50 text-emerald-500 rounded-xl"><FiDollarSign size={24} /></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consumed</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalLiters} <span className="text-lg text-gray-400 font-medium">L</span></div>
          <div className="absolute top-5 right-5 p-3 bg-blue-50 text-blue-500 rounded-xl"><FiDroplet size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Rate</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {avgPrice}</div>
          <div className="absolute top-5 right-5 p-3 bg-orange-50 text-orange-500 rounded-xl"><FiTrendingUp size={24} /></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
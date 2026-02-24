import React, { useMemo, useContext } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";
import { ThemeContext } from "../context/Themecontext";

const FuelCharts = ({ entries }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const chartTheme = {
        grid: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        text: isDark ? "#94a3b8" : "#64748b",
        tooltip: isDark ? "#1e293b" : "#ffffff",
        tooltipText: isDark ? "#f8fafc" : "#1e293b"
    };

    // 1. Process data for Price Trend
    const priceTrendData = useMemo(() => {
        return [...entries]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(entry => ({
                date: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                price: parseFloat(entry.pricePerLiter) || (parseFloat(entry.cost) / parseFloat(entry.liters)) || 0
            }))
            .filter(item => item.price > 0);
    }, [entries]);

    // 2. Process data for Monthly Spend
    const monthlySpendData = useMemo(() => {
        const months = {};
        entries.forEach(entry => {
            const date = new Date(entry.date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!months[key]) months[key] = { label, total: 0 };
            months[key].total += parseFloat(entry.cost) || 0;
        });

        return Object.values(months).slice(-6); // Last 6 months
    }, [entries]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: chartTheme.tooltip,
                    color: chartTheme.tooltipText,
                    padding: '12px',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontStyle: 'italic'
                }}>
                    <p className="mb-1">{label}</p>
                    <p className="text-emerald-500">
                        {payload[0].name}: Rs. {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
            {/* PRICE TREND CHART */}
            <div className="glass-card p-8 min-h-[400px] flex flex-col relative">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Market Index</span>
                        <h3 className="text-2xl font-black italic tracking-tighter dark:text-white mt-1">Price <span className="text-emerald-500">History</span></h3>
                    </div>
                </div>
                <div className="flex-1 w-full min-w-0 relative">
                    <ResponsiveContainer width="100%" aspect={2}>
                        <LineChart data={priceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                hide
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="price"
                                name="Price/L"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: isDark ? "#0a0c10" : "#ffffff" }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* MONTHLY SPEND CHART */}
            <div className="glass-card p-8 min-h-[400px] flex flex-col relative">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Financial Velocity</span>
                        <h3 className="text-2xl font-black italic tracking-tighter dark:text-white mt-1">Monthly <span className="text-blue-500">Burn</span></h3>
                    </div>
                </div>
                <div className="flex-1 w-full min-w-0 relative">
                    <ResponsiveContainer width="100%" aspect={2}>
                        <BarChart data={monthlySpendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', radius: 10 }} />
                            <Bar
                                dataKey="total"
                                name="Total Spent"
                                radius={[10, 10, 0, 0]}
                                animationDuration={2000}
                            >
                                {monthlySpendData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === monthlySpendData.length - 1 ? "#3b82f6" : "#64748b"} opacity={0.5} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default FuelCharts;

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6F91', '#FFD6E0', '#B5EAD7', '#FFDAC1'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Prepare data for charts
  const pieData = data ? Object.entries(data.moodDistribution).map(([name, value]) => ({ name, value })) : [];
  const barData = data ? Object.entries(data.weeklyCounts).map(([date, value]) => ({ date, value })) : [];
  const lineData = data ? Object.entries(data.monthlyPattern).map(([date, value]) => ({ date, value })) : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Mood Analytics</h2>
        {loading && <div className="text-blue-500 mb-2">Loading...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Mood Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Weekly Mood Count</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Line Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">Monthly Mood Pattern</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 
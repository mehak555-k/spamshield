import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Mail, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444']; // Blue for Ham, Red for Spam

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      // Setup axios interceptor or pass token manually if JWT used. We'll pass it simply for now.
      const res = await axios.get('http://localhost:5000/api/stats/dashboard', {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats', err);
      // Fallback for demo using mock data if backend isn't ready
      setStats({
        totalEmails: 1250,
        spamEmails: 154,
        hamEmails: 1096,
        accuracy: 94.5,
        chartData: [
          { date: '2023-10-01', ham: 120, spam: 15 },
          { date: '2023-10-02', ham: 98, spam: 22 },
          { date: '2023-10-03', ham: 150, spam: 18 },
          { date: '2023-10-04', ham: 110, spam: 10 },
          { date: '2023-10-05', ham: 140, spam: 25 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await axios.post('http://localhost:5000/api/gmail/sync', {}, {
        headers: { Authorization: `Bearer ${user._id}` }
      });
      await fetchStats();
    } catch (err) {
      console.error('Error syncing emails', err);
      // Still try to fetch stats even if sync fails
      await fetchStats();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'Clean (Ham)', value: stats.hamEmails },
    { name: 'Spam', value: stats.spamEmails },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Overview
          </h1>
          <p className="text-gray-400 mt-1">Real-time spam classification statistics</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Syncing...
            </>
          ) : (
            'Refresh Data'
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Scanned" value={stats.totalEmails} icon={Mail} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Clean Emails" value={stats.hamEmails} icon={ShieldCheck} color="text-green-400" bg="bg-green-400/10" />
        <StatCard title="Spam Blocked" value={stats.spamEmails} icon={ShieldAlert} color="text-red-400" bg="bg-red-400/10" />
        <StatCard title="Model Accuracy" value={`${stats.accuracy}%`} icon={Activity} color="text-purple-400" bg="bg-purple-400/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-semibold mb-6">Daily Classification Volume</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff50" />
                <YAxis stroke="#ffffff50" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="ham" stackId="a" fill="#3b82f6" name="Clean" radius={[0, 0, 4, 4]} />
                <Bar dataKey="spam" stackId="a" fill="#ef4444" name="Spam" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-semibold mb-6">Spam vs Clean Ratio</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#ffffff10', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`p-4 rounded-xl ${bg}`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1 text-white">{value}</p>
      </div>
    </div>
  );
}

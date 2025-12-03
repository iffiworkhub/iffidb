import React, { useEffect, useState } from 'react';
import { getStats } from '../services/db';
import { DashboardStats } from '../types';
import { Users, UserPlus, Trash2, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStats();
    setStats(data);
    setLoading(false);
  };

  const chartData = [
    { name: 'Mon', records: 4 },
    { name: 'Tue', records: 3 },
    { name: 'Wed', records: 7 },
    { name: 'Thu', records: 2 },
    { name: 'Fri', records: 6 },
    { name: 'Sat', records: 8 },
    { name: 'Sun', records: 5 },
  ];

  if (loading || !stats) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
        <span className="text-sm text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          Last updated: Just now
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Records" 
          value={stats.totalRecords} 
          icon={Users} 
          color="bg-blue-500" 
          trend="+12%"
        />
        <StatCard 
          title="New Today" 
          value={stats.newToday} 
          icon={UserPlus} 
          color="bg-emerald-500" 
          trend="+5%"
        />
        <StatCard 
          title="Deleted Records" 
          value={stats.deletedCount} 
          icon={Trash2} 
          color="bg-red-500" 
          trend="-2%"
        />
        <StatCard 
          title="Pending Review" 
          value={3} 
          icon={Clock} 
          color="bg-amber-500" 
          trend="0%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Weekly Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="records" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRecords)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Records Table Widget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recently Added</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.lastAdded.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-sm text-gray-500">No records found</td>
                  </tr>
                ) : (
                  stats.lastAdded.map((rec) => (
                    <tr key={rec.id}>
                      <td className="py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{rec.name}</td>
                      <td className="py-3 text-sm text-gray-500">{new Date(rec.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
        {trend}
      </span>
      <span className="ml-2 text-gray-400">from last month</span>
    </div>
  </div>
);
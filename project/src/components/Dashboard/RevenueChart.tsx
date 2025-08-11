import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


const RevenueChart: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ]);

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        // You can calculate monthly revenue from tickets table
        // For now, using static data - you can enhance this later
        const sampleData = [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 55000 },
          { month: 'Jun', revenue: 67000 },
        ];
        setMonthlyData(sampleData);
      } catch (error) {
        console.error('Error loading revenue data:', error);
      }
    };
    
    loadRevenueData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${Number(value) / 1000}k`}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
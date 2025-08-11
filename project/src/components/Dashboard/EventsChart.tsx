import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockAnalytics } from '../../data/mockData';

const EventsChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Events & Tickets</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockAnalytics.monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}}/>
            <Tooltip 
              cursor={{fill: 'rgba(238, 242, 255, 0.6)'}}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="events" fill="#3B82F6" name="Events" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tickets" fill="#8B5CF6" name="Tickets Sold" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventsChart;
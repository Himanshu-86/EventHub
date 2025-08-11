import React from 'react';
import { motion } from 'framer-motion';


interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, change }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('bg-', 'bg-')}/20`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
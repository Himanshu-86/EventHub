import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import {
  Home,
  Calendar,
  Plus,
  Ticket,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  Video,
} from 'lucide-react';
import { RootState } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Plus, label: 'Create Event', path: '/events/create' },
    { icon: Ticket, label: 'My Tickets', path: '/tickets' },
    { icon: Video, label: 'Class Room', path: '/classroom' },
    ...(user?.role === 'admin' ? [
      { icon: Users, label: 'Users', path: '/users' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    signOut();
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">

            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => dispatch(setSidebarOpen(false))}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
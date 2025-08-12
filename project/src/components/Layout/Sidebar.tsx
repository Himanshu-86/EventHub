<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
=======
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b

import {
  Home,
  Calendar,
  Plus,
<<<<<<< HEAD
  Ticket as TicketIcon,
=======
  Ticket,
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
<<<<<<< HEAD
  ChevronRight,
=======
  Video,
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
} from 'lucide-react';
import { RootState } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
<<<<<<< HEAD
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';

interface Ticket {
  id: string;
  eventtitle: string;
  purchasedate: string;
  status: 'confirmed' | 'cancelled' | 'refunded';
}

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user, signOut } = useAuth();
  const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchUpcomingTickets = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingTickets(true);
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('id, eventtitle, purchasedate, status')
          .eq('userid', user.id)
          .eq('status', 'confirmed')
          .order('purchasedate', { ascending: true })
          .limit(3);

        if (error) throw error;
        
        setUpcomingTickets(tickets || []);
      } catch (error) {
        console.error('Error fetching upcoming tickets:', error);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchUpcomingTickets();
  }, [user?.id]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Classroom', path: '/classroom' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Plus, label: 'Create Event', path: '/events/create' },
    { icon: TicketIcon, label: 'My Tickets', path: '/tickets' },
=======

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
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
    ...(user?.role === 'admin' ? [
      { icon: Users, label: 'Users', path: '/users' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

<<<<<<< HEAD
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

=======
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
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
<<<<<<< HEAD
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">

            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
=======
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
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            </button>
          </div>

          {/* User info */}
<<<<<<< HEAD
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">
=======
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
<<<<<<< HEAD
                <p className="font-bold text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
=======
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              </div>
            </div>
          </div>

          {/* Navigation */}
<<<<<<< HEAD
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
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
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 border-r-4 border-blue-600 dark:border-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Upcoming Tickets Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upcoming Tickets
                </h3>
                <Link 
                  to="/tickets" 
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {loadingTickets ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
              ) : upcomingTickets.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      onClick={() => {
                        navigate(`/tickets`);
                        dispatch(setSidebarOpen(false));
                      }}
                      className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {ticket.eventtitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(ticket.purchasedate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <TicketIcon className="w-6 h-6 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No upcoming tickets</p>
                  <Link
                    to="/events"
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className="mt-2 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Browse Events <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
=======
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
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
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
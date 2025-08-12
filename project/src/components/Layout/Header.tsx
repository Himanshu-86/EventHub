import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {

  Bell,
  Search,
  Calendar,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { RootState } from '../../store';

import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {

  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications } = useSelector((state: RootState) => state.ui);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
<<<<<<< HEAD
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
=======
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
<<<<<<< HEAD
            <span className="text-xl font-bold text-gray-800 dark:text-white">EventHub</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search events..."
              className="bg-transparent outline-none text-sm w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
=======
            <span className="text-xl font-bold text-gray-800">EventHub</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search events..."
              className="bg-transparent outline-none text-sm w-full"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
<<<<<<< HEAD
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
=======
              className="relative p-2 hover:bg-gray-100 rounded-lg"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
<<<<<<< HEAD
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
=======
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
<<<<<<< HEAD
                          className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}
                        >
                          <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
=======
                          className={`p-4 border-b hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <h4 className="font-medium text-sm text-gray-800">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
<<<<<<< HEAD
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
=======
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
<<<<<<< HEAD
              <span className="hidden md:block font-medium text-gray-700 dark:text-gray-300">
=======
              <span className="hidden md:block font-medium text-gray-700">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                {user?.name}
              </span>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
<<<<<<< HEAD
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
=======
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
<<<<<<< HEAD
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
=======
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                      onClick={() => setShowProfile(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
<<<<<<< HEAD
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
=======
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                      onClick={() => setShowProfile(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
<<<<<<< HEAD
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 w-full text-left"
=======
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
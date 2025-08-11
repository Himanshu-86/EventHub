import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Moon,
  Sun,
  Save,
} from 'lucide-react';
import { RootState } from '../../store';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import toast from 'react-hot-toast';

const profileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  bio: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      bio: '',
    },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const onProfileSubmit = async (data: any) => {
    try {
      // Update profile logic here
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      // Update password logic here
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Profile Information
                  </h2>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex items-center space-x-6 mb-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Change Photo
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, GIF or PNG. 1MB max.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          {...profileForm.register('name')}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {profileForm.formState.errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          {...profileForm.register('email')}
                          type="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {profileForm.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          {...profileForm.register('phone')}
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={user?.role || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...profileForm.register('bio')}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Security Settings
                  </h2>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        {...passwordForm.register('currentPassword')}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        {...passwordForm.register('newPassword')}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800 capitalize">
                            {key} Notifications
                          </h3>
                          <p className="text-sm text-gray-600">
                            Receive notifications via {key}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Preferences
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Dark Mode</h3>
                        <p className="text-sm text-gray-600">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                        <option>Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Billing Information
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-800 mb-4">Payment Methods</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-500">Expires 12/25</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                      <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                        + Add Payment Method
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-800 mb-4">Billing History</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">March 2024</span>
                          <span className="font-medium">₹2,500</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">February 2024</span>
                          <span className="font-medium">₹1,800</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">January 2024</span>
                          <span className="font-medium">₹3,200</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
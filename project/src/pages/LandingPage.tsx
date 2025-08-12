import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,

  ChevronLeft,
  ChevronRight,


  Settings,
  LogOut,
  Search,
  Ticket,
  Shield,
  Zap,
  Heart,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Event } from '../store/slices/eventSlice';
import EventCard from '../components/Events/EventCard';
import { useAuth } from '../hooks/useAuth';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const { user, signOut } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    setShowProfile(false);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.offsetWidth * 0.8;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .limit(8);
        if (eventsData) {
          setFeaturedEvents(eventsData);
        }
      } catch (error) {
        console.error('Error loading featured events:', error);
      }
    };
    
    loadFeaturedEvents();
  }, []);

  return (
<<<<<<< HEAD
        <div className="min-h-screen overflow-hidden">
=======
    <div className="min-h-screen bg-white overflow-hidden">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EventHub
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/events"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Browse Events
              </Link>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-50"
                      >
                        <div className="p-6 border-b border-gray-100">
                          <p className="font-bold text-gray-800">{user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-5 h-5 mr-3" />
                            Dashboard
                          </Link>
                          <Link
                            to="/tickets"
                            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <Ticket className="w-5 h-5 mr-3" />
                            My Tickets
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <Settings className="w-5 h-5 mr-3" />
                            Settings
                          </Link>
                        </div>
                        <div className="p-2 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
<<<<<<< HEAD
      <section className="relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819')" }}></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
=======
      <section className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-24 md:py-32"
          >
<<<<<<< HEAD
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
              <span className="block">Discover & Book</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">Amazing Events</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
=======
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-tight">
              Discover & Book
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Amazing Events
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              Your ultimate destination for concerts, sports, workshops, and more. Find your next unforgettable experience.
            </p>
            <div className="mt-10 max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-4 flex items-center space-x-3 border">
              <Search className="w-6 h-6 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder='Search for events, artists, or venues...'
                className="w-full text-lg outline-none bg-transparent"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-md">
                Search
              </button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12 px-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Featured Events
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Handpicked events we think you'll love.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button onClick={() => scroll('left')} aria-label="Scroll Left" className="p-3 rounded-full bg-white hover:bg-gray-200 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button onClick={() => scroll('right')} aria-label="Scroll Right" className="p-3 rounded-full bg-white hover:bg-gray-200 transition-all duration-300 shadow-md">
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-8 pb-8 scroll-smooth scrollbar-hide pl-4 sm:pl-6 lg:pl-8 scroll-container">
              {featuredEvents.map((event) => (
                <div key={event.id} className="flex-shrink-0 w-80 scroll-item">
                  <EventCard event={event} simple />
                </div>
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to="/events"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>View All Events</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
<<<<<<< HEAD
      <section className="py-24">
=======
      <section className="py-24 bg-white">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Why Choose EventHub?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              We provide the best tools to make your events successful and memorable.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Secure Payments</h3>
              <p className="mt-4 text-lg text-gray-500">
                Our platform ensures secure and reliable payment processing for all your ticket sales.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Fast & Easy Setup</h3>
              <p className="mt-4 text-lg text-gray-500">
                Create and launch your event page in minutes with our intuitive and user-friendly interface.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Ticket className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Dedicated Support</h3>
              <p className="mt-4 text-lg text-gray-500">
                Our support team is always here to help you with any questions or issues you may have.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Loved by Event Goers</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">Don't just take our word for it, here's what our users have to say.</p>
          </div>
          <div className="mt-20 grid md:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
              </div>
              <p className="text-gray-700 text-xl font-medium leading-relaxed">"EventHub is a game-changer! I found the perfect concert and booked my tickets in just a few minutes. The process was so smooth and easy."</p>
              <p className="text-gray-600 mt-4 text-lg">- Alex J.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
                <Heart className="w-6 h-6 text-red-500"/>
              </div>
              <p className="text-gray-700 text-xl font-medium leading-relaxed">"As an event organizer, this platform has everything I need. From promotion to ticket management, it's all in one place. Highly recommended!"</p>
              <p className="text-gray-600 mt-4 text-lg">- Sarah L.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-5xl font-extrabold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Join thousands of event organizers and attendees who trust EventHub for their perfect events
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Creating Events
              </Link>
              <Link
                to="/events"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Browse Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EventHub
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Making event discovery and booking simple, secure, and enjoyable for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Product</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link to="/create-event" className="hover:text-white transition-colors">Create Event</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EventHub. All rights reserved. Made with &hearts; for amazing events.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
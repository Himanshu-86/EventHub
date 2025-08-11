import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Ticket } from '../../store/slices/ticketSlice';

import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  Heart,
  ArrowLeft,
  ChevronLeft,
  Phone,
} from 'lucide-react';
import { RootState } from '../../store';
import { setEvents } from '../../store/slices/eventSlice';
import { addTicket } from '../../store/slices/ticketSlice';
import { supabase } from '../../services/supabase';
import PaymentModal from '../../components/Payment/PaymentModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { downloadTicketAsPDF } from '../../utils/ticketGenerator';
import './EventDetailPage.css';

// Simple Header Component for public pages
const SimpleHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowProfile(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">EventHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/events"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Browse Events
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">
                    {user?.name}
                  </span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowProfile(false)}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { events } = useSelector((state: RootState) => state.events);
  const event = events.find((e) => e.id === id);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data: eventsData } = await supabase.from('events').select('*');
        if (eventsData) {
          dispatch(setEvents(eventsData));
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    if (events.length === 0) {
      loadEvents();
    }

        const handlePaymentMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return; // Security check

      if (event.data.type === 'paymentSuccess') {
        saveTicket();
        setShowPaymentModal(false);
      } else if (event.data.type === 'paymentModalClosed') {
        setShowPaymentModal(false);
      }
    };

    window.addEventListener('message', handlePaymentMessage);

    return () => {
      window.removeEventListener('message', handlePaymentMessage);
    };
  }, [dispatch, events.length]);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Event not found</h2>
          <p className="text-gray-500 mb-6">This event may have been moved or deleted.</p>
          <Link to="/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const availableTickets = event.capacity - event.ticketssold;
  const soldPercentage = (event.ticketssold / event.capacity) * 100;
  const formattedDate = format(new Date(event.date), 'MMMM d, yyyy');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

    const saveTicket = async () => {
    if (!user || !event) return;

    const newTicket = {
      eventid: event.id,
      eventtitle: event.title,
      userid: user.id,
      username: user.name || 'Anonymous',
      useremail: user.email || '',
      quantity: 1,
      totalamount: event.price,
      purchasedate: new Date().toISOString(),
      status: 'confirmed' as const,
    };

    try {
      const { data: insertedTickets, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select();

      if (error) throw error;

      const dbTicket = insertedTickets[0] as Ticket;

      await supabase
        .from('events')
        .update({ ticketssold: event.ticketssold + 1 })
        .eq('id', event.id);

      dispatch(addTicket(dbTicket));
      toast.success('Ticket purchased successfully! Downloading...');
      await downloadTicketAsPDF(dbTicket);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast.error('Failed to purchase ticket.');
    }
  };

  const handleTicketPurchase = () => {
    if (user) {
      setShowPaymentModal(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <SimpleHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="relative">
                <img src={event.image} alt={event.title} className="w-full h-96 object-cover rounded-2xl shadow-lg" />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button onClick={handleShare} aria-label="Share this event" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                  <button aria-label="Like this event" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
                <div className="flex items-center mt-3 space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    <span>{formattedDate} at {event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{event.price.toLocaleString()}</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${availableTickets > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {availableTickets > 0 ? 'Tickets Available' : 'Sold Out'}
                </span>
              </div>
              <p className="text-gray-600 mb-6">Per person. Taxes and fees may apply.</p>
              <button
                onClick={handleTicketPurchase}
                disabled={!user || availableTickets === 0}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {availableTickets > 0 ? 'Buy Tickets' : 'Sold Out'}
              </button>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tickets Sold</span>
                  <span className="font-semibold">
                    {event.ticketssold} / {event.capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{availableTickets}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full progress-bar"
                    style={{ '--progress-width': `${soldPercentage}%` } as React.CSSProperties}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Event Date</span>
                  <span className="font-semibold">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Event Time</span>
                  <span className="font-semibold">{event.time}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Event Details Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Event Details
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Event Name</td>
                    <td className="py-3 text-sm text-gray-900">{event.title}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Category</td>
                    <td className="py-3 text-sm text-gray-900">{event.category}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Date & Time</td>
                    <td className="py-3 text-sm text-gray-900">{formattedDate}, {event.time}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Status</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Organizer</td>
                    <td className="py-3 text-sm text-gray-900">{event.organizername}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-600">Description</td>
                    <td className="py-3 text-sm text-gray-900">{event.description}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Information Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <IndianRupee className="w-5 h-5 mr-2" />
                Ticket Information
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Ticket Price</td>
                    <td className="py-3 text-sm font-semibold text-green-600">₹{event.price.toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Total Capacity</td>
                    <td className="py-3 text-sm text-gray-900">{event.capacity}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Tickets Sold</td>
                    <td className="py-3 text-sm text-gray-900">{event.ticketssold}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Available</td>
                    <td className="py-3 text-sm text-gray-900">{availableTickets}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Booking Progress</td>
                    <td className="py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                          className="bg-green-600 h-2 rounded-full progress-bar"
                          style={{ '--progress-width': `${soldPercentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{soldPercentage.toFixed(1)}% sold</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-600">Booking Status</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        availableTickets > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {availableTickets > 0 ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Venue Information Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Venue Details
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Location</td>
                    <td className="py-3 text-sm text-gray-900">{event.location}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Event Date</td>
                    <td className="py-3 text-sm text-gray-900">{formattedDate}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Event Time</td>
                    <td className="py-3 text-sm text-gray-900">{event.time}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Duration</td>
                    <td className="py-3 text-sm text-gray-900">3-4 Hours</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-600">Contact</td>
                    <td className="py-3 text-sm text-blue-600">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>Contact Organizer</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-600">Accessibility</td>
                    <td className="py-3 text-sm text-gray-900">Wheelchair Accessible</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Similar Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Similar Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter(e => e.id !== event.id && e.category === event.category)
              .slice(0, 3)
              .map(similarEvent => (
                <div key={similarEvent.id} className="border rounded-lg p-4">
                  <img
                    src={similarEvent.image}
                    alt={similarEvent.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {similarEvent.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-semibold">
                      ₹{similarEvent.price.toLocaleString()}
                    </span>
                    <Link
                      to={`/events/${similarEvent.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {user && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          event={event}
          onSuccess={handleTicketPurchase}
        />
      )}
    </div>
  );
};

export default EventDetailPage;

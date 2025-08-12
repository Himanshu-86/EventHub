import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Ticket } from '../../store/slices/ticketSlice';

import { motion } from 'framer-motion';
import {
  Calendar,
  Share2,
  Heart,
  ArrowLeft,
  ChevronLeft,
  Phone,
} from 'lucide-react';
import { RootState } from '../../store';
import { setEvents } from '../../store/slices/eventSlice';
import { addTicket, setUserTickets } from '../../store/slices/ticketSlice';
import { supabase } from '../../services/supabase';
import PaymentModal from '../../components/Payment/PaymentModal';
import EventCard from '../../components/Events/EventCard';
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
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">EventHub</span>
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
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium text-gray-700 dark:text-gray-300">
                    {user?.name}
                  </span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        onClick={() => setShowProfile(false)}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-500 w-full text-left"
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const events = useSelector((state: RootState) => state.events.events);
  const event = events.find((e) => e.id === id);

  // Derived state for rendering
  const formattedDate = event ? format(new Date(event.date), 'MMMM dd, yyyy') : '';
  const availableTickets = event ? event.capacity - event.ticketssold : 0;
    const soldPercentage = event ? (event.ticketssold / event.capacity) * 100 : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

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

  const onPaymentSuccess = () => {
    console.log('Payment successful, ticket purchased!');
    // The actual ticket saving logic is handled in handlePaymentMessage
  };

  const handleTicketPurchase = () => {
    if (user && event) {
      setShowPaymentModal(true);
    } else {
      navigate('/login');
    }
  };

  const generateTicketCode = () => {
    return 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const saveTicket = async () => {
    console.log('Starting ticket save process...');
    if (!user || !event) {
      console.error('User or event is missing:', { user, event });
      return;
    }

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
      ticketcode: generateTicketCode(),
    };

    try {
      console.log('Inserting new ticket to database:', newTicket);
      
      // First, verify database connection
      const { data: dbCheck, error: dbError } = await supabase
        .from('tickets')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      if (dbError) {
        console.error('Database connection error:', dbError);
        throw new Error('Could not connect to database');
      }
      console.log('Database connection verified');
      
      // Verify the event exists
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', event.id)
        .single();
      
      if (eventError || !eventData) {
        console.error('Error verifying event:', eventError || 'Event not found');
        throw new Error('Event not found');
      }
      console.log('Event verified:', eventData);
      
      // Now insert the ticket with explicit error handling
      console.log('Attempting to insert ticket...');
      const { data: insertedTickets, error, status, statusText } = await supabase
        .from('tickets')
        .insert([newTicket])  // Make sure to wrap in array
        .select('*');
        
      console.log('Insert response:', { status, statusText, error, insertedTickets });

      if (error) {
        console.error('Error inserting ticket:', error);
        throw error;
      }
      
      if (!insertedTickets || insertedTickets.length === 0) {
        throw new Error('No data returned from ticket insertion');
      }
      
      console.log('Successfully inserted ticket:', insertedTickets[0]);

      const dbTicket = insertedTickets[0] as Ticket;

      await supabase
        .from('events')
        .update({ ticketssold: event.ticketssold + 1 })
        .eq('id', event.id);

      console.log('Refreshing user tickets...');
      
      // First, directly query the ticket we just inserted
      const { data: freshTicket, error: fetchTicketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', dbTicket.id)
        .single();
        
      console.log('Direct ticket query result:', { freshTicket, fetchTicketError });
      
      // Then get all user tickets
      const { data: updatedTickets, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('userid', user.id)
        .order('purchasedate', { ascending: false });

      if (fetchError) {
        console.error('Error fetching updated tickets:', fetchError);
        throw fetchError;
      }

      console.log('All user tickets from database:', updatedTickets);
      
      if (updatedTickets && updatedTickets.length > 0) {
        console.log('Latest ticket in database:', updatedTickets[0]);
      } else {
        console.warn('No tickets found for user in database');
      }
      
      dispatch(setUserTickets(updatedTickets || []));
      dispatch(addTicket(dbTicket));
      
      // Force a complete refresh of the tickets page data
      const { data: forceRefresh } = await supabase
        .from('tickets')
        .select('*')
        .eq('userid', user.id);
      console.log('Force refreshed tickets:', forceRefresh);
      toast.success('Ticket purchased successfully! Downloading...');
      await downloadTicketAsPDF(dbTicket);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast.error('Failed to purchase ticket.');
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            Event not found
          </span>
          <p className="text-gray-500 dark:text-gray-400 mb-6">This event may have been moved or deleted.</p>
          <Link to="/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
            <div className="bg-gray-50 dark:bg-black min-h-screen">
      <SimpleHeader />

      {/* Banner */}
      <div className="relative h-96 rounded-b-3xl overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-6 left-6">
          <Link to="/events" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center gap-2 px-4 py-2 rounded-full transition-all">
            <ChevronLeft className="w-5 h-5" />
            <span>All Events</span>
          </Link>
        </div>
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          <button onClick={handleShare} title="Share Event" className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button title="Favorite Event" className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{event.category}</span>
          <h1 className="text-5xl font-bold text-white mt-2 shadow-text">{event.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About this event */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this event</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            </motion.div>

            {/* Event Details Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What to expect</h3>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Location</td>
                        <td className="py-4 text-gray-900 dark:text-white">{event.location}</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Date</td>
                        <td className="py-4 text-gray-900 dark:text-white">{formattedDate}</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Time</td>
                        <td className="py-4 text-gray-900 dark:text-white">{event.time}</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Duration</td>
                        <td className="py-4 text-gray-900 dark:text-white">3-4 Hours</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Contact</td>
                        <td className="py-4 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">Contact Organizer</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">Accessibility</td>
                        <td className="py-4 text-gray-900 dark:text-white">Wheelchair Accessible</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{event.price.toLocaleString()}</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${availableTickets > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'}`}>
                  {availableTickets > 0 ? 'Tickets Available' : 'Sold Out'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Per person. Taxes and fees may apply.</p>
              <button
                onClick={handleTicketPurchase}
                disabled={!user || availableTickets === 0}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {availableTickets > 0 ? 'Buy Tickets' : 'Sold Out'}
              </button>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tickets Sold</span>
                  <span className="font-semibold">
                    {event.ticketssold} / {event.capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Available</span>
                  <span className="font-semibold text-green-600">{availableTickets}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full progress-bar"
                    style={{ '--progress-width': `${soldPercentage}%` } as React.CSSProperties}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Event Date</span>
                  <span className="font-semibold">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Event Time</span>
                  <span className="font-semibold">{event.time}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Similar Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter(e => e.id !== event.id && e.category === event.category)
              .slice(0, 3)
              .map(similarEvent => (
                <EventCard event={similarEvent} key={similarEvent.id} simple />
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
          onSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
};

export default EventDetailPage;

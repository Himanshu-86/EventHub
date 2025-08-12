import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Download, 
  QrCode, 
  FileDigit, 
  CheckCircle, 
  IndianRupee,
  Calendar,
  Ticket as TicketIcon
} from 'lucide-react';
import { format } from 'date-fns';

import { RootState } from '../../store';
import { setUserTickets, setLoading, Ticket } from '../../store/slices/ticketSlice';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { downloadTicketAsPDF } from '../../utils/ticketGenerator';
import FullScreenTicket from '../../components/Tickets/FullScreenTicket';

type Event = {
  id: string;
  title: string;
  date: string;
  // Add other event properties as needed
};

const TicketsPage: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userTickets, loading } = useSelector((state: RootState) => {
    console.log('Current tickets in Redux store:', state.tickets.userTickets);
    return state.tickets;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const dispatch = useDispatch();

  const fetchTickets = useCallback(async () => {
    if (!user) return;

    console.log('Starting to fetch tickets for user:', user.id);
    dispatch(setLoading(true));
    setAuthLoading(true);

    try {
      // First, clear any existing tickets to force a refresh
      dispatch(setUserTickets([]));
      
      // Fetch user's tickets with detailed logging
      console.log('Fetching tickets from database...');
      const { data: tickets, error, status, statusText } = await supabase
        .from('tickets')
        .select('*')
        .eq('userid', user.id)
        .order('purchasedate', { ascending: false });

      console.log('Ticket fetch response:', { status, statusText, error, tickets });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!tickets || tickets.length === 0) {
        console.log('No tickets found for user');
        dispatch(setUserTickets([]));
        return;
      }

      console.log(`Found ${tickets.length} tickets for user`);

      // Fetch events for these tickets
      const eventIds = [...new Set(tickets.map((t: Ticket) => t.eventid))];
      console.log('Fetching events for ticket IDs:', eventIds);
      
      if (eventIds.length > 0) {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          throw eventsError;
        }
        
        console.log('Fetched events:', eventsData);
        setEvents(eventsData || []);
      }

      console.log('Dispatching tickets to Redux store:', tickets);
      dispatch(setUserTickets(tickets));
    } catch (error) {
      console.error('Error in fetchTickets:', error);
      alert('Failed to load tickets. Please try again.');
    } finally {
      console.log('Finished fetchTickets');
      dispatch(setLoading(false));
      setAuthLoading(false);
    }
  }, [user, dispatch]);

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tickets_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tickets',
          filter: `userid=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Ticket change detected:', payload);
          fetchTickets(); // Refresh tickets on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTickets]);

  const handleViewTicket = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const handleCloseTicket = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  // Calculate summary data
  const summaryData = useMemo(() => ({
    totalTickets: userTickets.length,
    confirmedTickets: userTickets.filter(t => t.status === 'confirmed').length,
    totalSpent: userTickets.reduce((sum, ticket) => sum + (ticket.totalamount || 0), 0)
  }), [userTickets]);

  // Format date to 'MMM dd, yyyy' format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDownloadTicket = useCallback(async (ticket: Ticket) => {
    try {
      await downloadTicketAsPDF(ticket);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  }, []);

  const getEventById = (eventId: string): Event | undefined => {
    return events.find((event: Event) => event.id === eventId);
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500">Manage and download your event tickets</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Tickets Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <FileDigit className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{summaryData.totalTickets}</p>
              </div>
            </div>
          </div>

          {/* Confirmed Tickets Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{summaryData.confirmedTickets}</p>
              </div>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{summaryData.totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tickets</h2>
          
          {userTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tickets yet</h3>
              <p className="mt-1 text-gray-500">Your purchased tickets will appear here</p>
            </div>
          ) : (
            userTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Ticket Header with Gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      {ticket.eventtitle || 'Event'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-100 mt-1">Ticket ID: {ticket.ticketcode}</p>
                </div>

                {/* Ticket Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{ticket.totalamount?.toLocaleString('en-IN') || '0'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-900">
                          {formatDate(ticket.purchasedate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => downloadTicketAsPDF(ticket)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="-ml-1 mr-2 h-4 w-4" />
                      Download Ticket
                    </button>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <QrCode className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                      View QR Code
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Full Screen Ticket Modal */}
        <FullScreenTicket
          isOpen={!!selectedTicket}
          onClose={handleCloseTicket}
          ticket={selectedTicket}
        />
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;
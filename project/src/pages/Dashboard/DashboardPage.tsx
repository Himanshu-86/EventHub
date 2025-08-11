import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  IndianRupee,
  Ticket as TicketIcon,
  Plus,
} from 'lucide-react';
import { RootState } from '../../store';
import { setEvents, deleteEvent as deleteEventAction } from '../../store/slices/eventSlice';
import { setTickets, Ticket } from '../../store/slices/ticketSlice';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import StatsCard from '../../components/Dashboard/StatsCard';
import RevenueChart from '../../components/Dashboard/RevenueChart';
import EventsChart from '../../components/Dashboard/EventsChart';
import CategoryChart from '../../components/Dashboard/CategoryChart';
import EventCard from '../../components/Events/EventCard';
import TicketCard from '../../components/Tickets/TicketCard';
import FullScreenTicket from '../../components/Tickets/FullScreenTicket';
import { downloadTicketAsPDF } from '../../utils/ticketGenerator';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { events } = useSelector((state: RootState) => state.events);
        const { tickets } = useSelector((state: RootState) => state.tickets);

  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [isFullScreenTicketOpen, setIsFullScreenTicketOpen] = React.useState(false);

  const handleEdit = (event: any) => {
    navigate(`/events/edit/${event.id}`);
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) throw error;
        dispatch(deleteEventAction(eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Fetch events organized by the user
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('organizerid', user.id);

        if (eventsError) throw eventsError;
        if (eventsData) {
          dispatch(setEvents(eventsData));
        }

        // Fetch all tickets for the user (purchased and for their events)
        const eventIds = eventsData?.map(event => event.id) || [];
        const { data: allTicketsData, error: allTicketsError } = await supabase
          .from('tickets')
          .select('*')
          .or(`userid.eq.${user.id}${eventIds.length > 0 ? `,eventid.in.(${eventIds.join(',')})` : ''}`);

        if (allTicketsError) throw allTicketsError;
        if (allTicketsData) {
          dispatch(setTickets(allTicketsData as Ticket[]));
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [dispatch, user?.id]);

    const handleShowQR = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsFullScreenTicketOpen(true);
  };

  const handleDownload = (ticket: Ticket) => {
    downloadTicketAsPDF(ticket);
  };

  const userEvents = events.filter(event => event.organizerid === user?.id);
  const recentEvents = userEvents.slice(0, 3);
  const myTickets = tickets.filter(ticket => ticket.userid === user?.id);

  // Calculate analytics from user-specific data
  const totalEvents = userEvents.length;
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalamount, 0);
  const activeUsers = new Set(tickets.map(ticket => ticket.userid)).size;

  const stats = [
    {
      title: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      change: { value: 12, type: 'increase' as const },
    },
        {
      title: 'Tickets Sold',
      value: totalTicketsSold.toLocaleString(),
      icon: TicketIcon,
      color: 'bg-green-500',
      change: { value: 8, type: 'increase' as const },
    },
    {
      title: 'Total Revenue',
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      icon: IndianRupee,
      color: 'bg-purple-500',
      change: { value: 15, type: 'increase' as const },
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      icon: Users,
      color: 'bg-orange-500',
      change: { value: 5, type: 'increase' as const },
    },
  ];

  return (
    <DashboardLayout>
      <>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto grid gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500">Welcome back, {user?.name || 'User'}!</p>
              </div>
              <Link to="/events/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Event</span>
                </motion.button>
              </Link>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <RevenueChart />
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <EventsChart />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <CategoryChart />
            </motion.div>

            {/* My Tickets Section */}
            {myTickets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">My Tickets</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTickets.map((ticket) => (
                      <TicketCard 
                        ticket={ticket} 
                        key={ticket.id} 
                        onShowQR={handleShowQR}
                        onDownload={handleDownload}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">Recent Events</h2>
                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentEvents.map((event) => (
                    <EventCard 
                      event={event} 
                      key={event.id} 
                      showActions={user?.id === event.organizerid}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Top Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Top Performing Events</h2>
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{event.title}</h3>
                          <p className="text-sm text-slate-500">
                            {event.ticketssold} tickets sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ₹{(event.ticketssold * event.price).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <FullScreenTicket
          isOpen={isFullScreenTicketOpen}
          onClose={() => setIsFullScreenTicketOpen(false)}
          ticket={selectedTicket}
        />
      </>
    </DashboardLayout>
  );
};

export default DashboardPage;
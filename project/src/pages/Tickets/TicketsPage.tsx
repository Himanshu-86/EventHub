import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Ticket, Download, QrCode } from 'lucide-react';
import { RootState } from '../../store';
import { setUserTickets, setLoading } from '../../store/slices/ticketSlice';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import TicketCard from '../../components/Tickets/TicketCard';

const TicketsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { userTickets, loading } = useSelector((state: RootState) => state.tickets);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadUserTickets = async () => {
      dispatch(setLoading(true));
      try {
        const { data: ticketsData, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('userid', user!.id);

        if (error) {
          console.error('Error fetching tickets:', error);
          throw error;
        }

        if (ticketsData) {
          dispatch(setUserTickets(ticketsData));
        }
      } catch (error) {
        console.error('Error loading user tickets:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (user?.id) {
      loadUserTickets();
    }
  }, [dispatch, user?.id]);



  const confirmedTickets = userTickets.filter(ticket => ticket.status === 'confirmed');
  const cancelledTickets = userTickets.filter(ticket => ticket.status === 'cancelled');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (userTickets.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">No Tickets Found</h2>
          <p className="text-gray-500 mt-2">You haven't purchased any tickets yet.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage and download your event tickets
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {userTickets.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {confirmedTickets.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  ₹{userTickets.reduce((acc, ticket) => acc + ticket.totalamount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
          >
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Tickets Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't purchased any tickets yet. Browse events to get started!
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Browse Events
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Confirmed Tickets */}
            {confirmedTickets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Confirmed Tickets ({confirmedTickets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {confirmedTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <TicketCard ticket={ticket} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cancelled Tickets */}
            {cancelledTickets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Cancelled Tickets ({cancelledTickets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <TicketCard ticket={ticket} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;
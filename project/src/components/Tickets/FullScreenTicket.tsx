import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Ticket } from '../../store/slices/ticketSlice';
import TicketPDF from './TicketPDF';

interface FullScreenTicketProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const FullScreenTicket: React.FC<FullScreenTicketProps> = ({ isOpen, onClose, ticket }) => {
  if (!ticket) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="relative bg-transparent rounded-lg shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the ticket itself
          >
            <TicketPDF ticket={ticket} />
            <button
              onClick={onClose}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-700 hover:bg-gray-200 transition-transform duration-300 hover:scale-110 shadow-lg"
              aria-label="Close ticket view"
            >
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenTicket;

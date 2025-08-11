import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../../store/slices/ticketSlice';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
        >
          <div className="p-6">
                        <button onClick={onClose} aria-label="Close QR Code Modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{ticket.eventtitle}</h2>
                <p className="text-gray-500 mb-6">Scan this QR code at the event</p>
                <div className="p-4 bg-gray-100 rounded-lg inline-block">
                                                            <QRCodeSVG value={JSON.stringify({ ticketId: ticket.id, eventId: ticket.eventid, userId: ticket.userid })} size={200} />
                </div>
                <div className="mt-6 text-left space-y-2">
                    <p><span className="font-semibold">Ticket Holder:</span> {ticket.username}</p>
                    <p><span className="font-semibold">Ticket ID:</span> {ticket.ticketcode}</p>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRCodeModal;

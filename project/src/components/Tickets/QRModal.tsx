import React from 'react';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react';
import { Ticket } from '../../store/slices/ticketSlice';

interface QRModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ ticket, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl relative max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close QR code modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Scan Ticket</h2>
        <div className="p-4 bg-white rounded-md inline-block">
          <QRCode
            value={JSON.stringify({ ticketId: ticket.id, eventId: ticket.eventid, userId: ticket.userid })}
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className="mt-4">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{ticket.eventtitle}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ticket ID: {ticket.ticketcode}</p>
        </div>
      </div>
    </div>
  );
};

export default QRModal;

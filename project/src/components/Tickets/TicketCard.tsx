import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download } from 'lucide-react';
import { Ticket } from '../../store/slices/ticketSlice';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  onDownload: (ticket: Ticket) => void;
  onShowQR: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDownload, onShowQR }) => {
    let formattedDate = 'Invalid Date';
  try {
        const purchaseDate = new Date(ticket.purchasedate);
    if (!isNaN(purchaseDate.getTime())) {
      formattedDate = format(purchaseDate, 'MMM dd, yyyy');
    } else {
            console.error('Invalid purchaseDate received:', ticket.purchasedate);
    }
  } catch (error) {
        console.error('Error parsing purchaseDate:', ticket.purchasedate, error);
  }

  

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
                        <h3 className="text-lg font-bold">{ticket.eventtitle}</h3>
            <p className="text-blue-100">Ticket #{ticket.ticketcode}</p>
          </div>
          <div className="text-right">
                        <p className="text-2xl font-bold">₹{ticket.totalamount.toLocaleString()}</p>
            <p className="text-blue-100">{ticket.quantity} ticket(s)</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Purchased On</p>
            <p className="font-semibold">{formattedDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
                    <button
            onClick={() => onDownload(ticket)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
                    <button onClick={() => onShowQR(ticket)} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
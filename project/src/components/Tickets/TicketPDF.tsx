import React from 'react';
import { Ticket } from '../../store/slices/ticketSlice';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface TicketPDFProps {
  ticket: Ticket;
}

const TicketPDF: React.FC<TicketPDFProps> = ({ ticket }) => {
  if (!ticket) return null;

  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventid,
    userId: ticket.userid,
  });

  return (
    <div id={`ticket-${ticket.id}`} className="w-[400px] bg-white p-6 font-sans text-gray-800 shadow-lg">
      <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
        <h1 className="text-3xl font-bold text-blue-600">{ticket.eventtitle}</h1>
        <p className="text-gray-500">Event Ticket</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Ticket Holder</p>
          <p className="font-semibold">{ticket.username}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Purchase Date</p>
          <p className="font-semibold">{format(new Date(ticket.purchasedate), 'PPP')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ticket Code</p>
          <p className="font-mono text-lg font-bold">{ticket.ticketcode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-semibold">₹{ticket.totalamount.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-gray-300 pt-4 mt-4">
        <div className="p-2 bg-white rounded-md">
           <QRCodeSVG value={qrValue} size={128} />
        </div>
        <p className="mt-2 text-sm text-gray-500">Scan at the event entrance</p>
      </div>
    </div>
  );
};

export default TicketPDF;

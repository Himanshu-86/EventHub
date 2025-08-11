import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { supabase } from '../../services/supabase';

const TicketPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;

      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*, events(*)')
          .eq('id', ticketId)
          .single();

        if (error) throw error;
        setTicket(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return <div>Loading ticket...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!ticket) {
    return <div>Ticket not found.</div>;
  }

  const qrCodeValue = JSON.stringify({
    ticketId: ticket.id,
    event: ticket.events.title,
    attendee: ticket.userName,
    date: ticket.events.date,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Event Ticket</h1>
        <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-purple-600">{ticket.events.title}</h2>
          <p className="text-gray-600">{new Date(ticket.events.date).toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-500">Attendee:</p>
          <p className="font-semibold text-gray-800">{ticket.userName}</p>
        </div>
        <div className="mb-6">
          <p className="text-gray-500">Ticket ID:</p>
          <p className="font-mono text-sm text-gray-800">{ticket.id}</p>
        </div>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={qrCodeValue} size={200} />
          </div>
        </div>
        <p className="text-center text-gray-500 text-xs mt-4">Scan this QR code to verify your ticket.</p>
      </div>
    </div>
  );
};

export default TicketPage;

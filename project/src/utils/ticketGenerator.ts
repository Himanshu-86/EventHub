import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Ticket } from '../store/slices/ticketSlice';
import TicketPDF from '../components/Tickets/TicketPDF';

export const downloadTicketAsPDF = async (ticket: Ticket) => {
  if (!ticket) return;

  // Create a temporary element to render the TicketPDF component off-screen
  const ticketElement = document.createElement('div');
  ticketElement.style.position = 'absolute';
  ticketElement.style.left = '-9999px';
  document.body.appendChild(ticketElement);

  // Use React's createRoot to render the component
  const root = createRoot(ticketElement);
  root.render(React.createElement(TicketPDF, { ticket }));

  // Allow time for the component to render fully
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const canvas = await html2canvas(ticketElement.children[0] as HTMLElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create a PDF with dimensions matching the canvas
    const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`ticket-${ticket.ticketcode}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    // Clean up the temporary elements
    root.unmount();
    document.body.removeChild(ticketElement);
  }
};

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  eventid: string;
  eventtitle: string;
  userid: string;
  username: string;
  useremail: string;
  quantity: number;
  totalamount: number;
  purchasedate: string;
  status: 'confirmed' | 'cancelled' | 'refunded';
  ticketcode: string;
}

interface TicketState {
  tickets: Ticket[];
  userTickets: Ticket[];
  loading: boolean;
}

const initialState: TicketState = {
  tickets: [],
  userTickets: [],
  loading: false,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
    setUserTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.userTickets = action.payload;
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
      state.userTickets.push(action.payload);
    },
    updateTicket: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
      const userIndex = state.userTickets.findIndex(ticket => ticket.id === action.payload.id);
      if (userIndex !== -1) {
        state.userTickets[userIndex] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTickets, setUserTickets, addTicket, updateTicket, setLoading } = ticketSlice.actions;
export default ticketSlice.reducer;
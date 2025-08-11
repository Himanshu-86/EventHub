import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image?: string;
  organizerid: string;
  organizername: string;
  category: string;
  capacity: number;
  ticketssold: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
}

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  filters: {
    category: string;
    priceRange: [number, number];
    date: string;
    search: string;
  };
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  filters: {
    category: '',
    priceRange: [0, 10000],
    date: '',
    search: '',
  },
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<EventState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  setLoading,
  setFilters,
} = eventSlice.actions;
export default eventSlice.reducer;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Grid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RootState } from '../../store';
import { setEvents, deleteEvent, updateEvent } from '../../store/slices/eventSlice';
import { Event } from '../../store/slices/eventSlice';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import EventCard from '../../components/Events/EventCard';
import EventFilters from '../../components/Events/EventFilters';
import EventForm from '../../components/Events/EventForm';
import toast from 'react-hot-toast';

const EventsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { events, filters, loading } = useSelector((state: RootState) => state.events);
  const { user } = useSelector((state: RootState) => state.auth);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data: eventsData } = await supabase.from('events').select('*');
        if (eventsData) {
          dispatch(setEvents(eventsData));
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    
    loadEvents();
  }, [dispatch]);

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !filters.search || 
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || event.category === filters.category;
    
    const matchesPrice = event.price >= filters.priceRange[0] && 
      event.price <= filters.priceRange[1];
    
    const matchesDate = !filters.date || event.date === filters.date;

    return matchesSearch && matchesCategory && matchesPrice && matchesDate;
  });

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);

        if (error) {
          throw error;
        }

        dispatch(deleteEvent(eventId));
        toast.success('Event deleted successfully!');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event. Please try again.');
      }
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;

    try {
      const updatedEventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        price: parseInt(data.price),
        image: data.image,
        category: data.category,
        capacity: parseInt(data.capacity),
      };

      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updatedEventData)
        .eq('id', editingEvent.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      dispatch(updateEvent(updatedEvent));
      toast.success('Event updated successfully!');
      setShowEditModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event. Please try again.');
    }
  };

  return (
    <DashboardLayout>
<<<<<<< HEAD
      <div className="space-y-6 dark:bg-gray-800">
=======
      <div className="space-y-6">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
        {/* Header */}
                {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
<<<<<<< HEAD
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all your events.</p>
=======
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-2">Discover and manage your events</p>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/events/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
<<<<<<< HEAD
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')} aria-label="Grid view"
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
=======
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
<<<<<<< HEAD
                onClick={() => setViewMode('list')} aria-label="List view"
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
=======
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <EventFilters />

        {/* Results */}
<<<<<<< HEAD
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {filteredEvents.length} Events Found
            </h2>
            <label htmlFor="sort-events" className="sr-only">Sort Events</label>
            <select id="sort-events" aria-label="Sort Events" className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2 text-sm">
=======
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredEvents.length} Events Found
            </h2>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              <option>Sort by Date</option>
              <option>Sort by Price</option>
              <option>Sort by Popularity</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
<<<<<<< HEAD
              <p className="text-gray-500 dark:text-gray-400 text-lg">No events found matching your criteria</p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filters</p>
=======
              <p className="text-gray-500 text-lg">No events found matching your criteria</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <EventCard 
                    event={event} 
                    showActions={user?.id === event.organizerid}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
<<<<<<< HEAD
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Event</h2>
=======
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEvent(null);
                    }}
<<<<<<< HEAD
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
=======
                    className="text-gray-400 hover:text-gray-600 text-2xl"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <EventForm 
<<<<<<< HEAD
                  initialData={editingEvent} 
                  onSubmit={handleUpdateEvent}
                  isEditMode
=======
                  event={editingEvent} 
                  onSubmit={handleUpdateEvent}
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
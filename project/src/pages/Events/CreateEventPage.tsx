import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store';
import { addEvent, updateEvent } from '../../store/slices/eventSlice';
import { supabase } from '../../services/supabase';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import EventForm from '../../components/Events/EventForm';
import toast from 'react-hot-toast';

const CreateEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data.organizerid !== user?.id) {
            toast.error('You are not authorized to edit this event.');
            navigate('/dashboard');
            return;
          }

          setInitialData(data);
        } catch (error) {
          toast.error('Failed to fetch event data.');
          navigate('/dashboard');
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode, navigate, user?.id]);

      const handleSubmit = async (formData: any) => {
    if (!user?.id) {
      toast.error('You must be logged in to create an event.');
      return;
    }
    try {
                  const eventPayload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        price: parseInt(formData.price, 10) || 0,
        image: formData.image,
        organizerid: user?.id || '',
        organizername: user?.name || 'Unknown Organizer',
        category: formData.category,
        capacity: parseInt(formData.capacity, 10) || 0,
                ticketssold: isEditMode && initialData ? (initialData as any).ticketssold : 0,
        status: 'upcoming' as const,
        // Additional fields
        tickettype: formData.ticketType || 'paid',
        bookingdeadline: formData.bookingDeadline,
        ticketprice: parseInt(formData.price, 10) || 0,
        totaltickets: parseInt(formData.capacity, 10) || 0,
        organizeremail: formData.organizerEmail || user?.email,
        organizerphone: formData.organizerPhone,
        contactphone: formData.contactPhone,
        contactemail: formData.contactEmail,
        websiteurl: formData.websiteUrl,
        eventtype: formData.eventType,
        tags: formData.tags,
        eventpublic: formData.eventPublic !== false,
        showattendeecount: formData.showAttendeeCount !== false,
        showremainingtickets: formData.showRemainingTickets !== false,
      };

      if (isEditMode) {
        const { data: updatedEvent, error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        dispatch(updateEvent(updatedEvent));
        toast.success('Event updated successfully!');
        navigate('/dashboard');
      } else {
        const { data: insertedEvent, error } = await supabase
          .from('events')
          .insert([eventPayload])
          .select()
          .single();

        if (error) throw error;

        dispatch(addEvent(insertedEvent));
        toast.success('Event created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Error saving event:', errorMessage);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? 'Update the details for your event below.'
              : 'Fill in the details below to create your event and start selling tickets.'}
          </p>
        </motion.div>

                <EventForm onSubmit={handleSubmit} initialData={initialData} isEditMode={isEditMode} />
      </div>
    </DashboardLayout>
  );
};

export default CreateEventPage;
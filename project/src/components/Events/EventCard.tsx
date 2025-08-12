import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, IndianRupee, Edit, Trash2 } from 'lucide-react';
import { Event } from '../../store/slices/eventSlice';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  simple?: boolean; // New prop for simple card view
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete,
  simple = false 
}) => {
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'MMM dd, yyyy');

  // Simple card view for front page
  if (simple) {
    return (
      <Link to={`/events/${event.id}`} className="block group h-full">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col"
        >
          <div className="relative overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300" // Taller image
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="mt-auto pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1 font-medium">{event.category}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            event.status === 'upcoming' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
            event.status === 'ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
            event.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2">
            {event.title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {event.category}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formattedDate} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span>{event.capacity - event.ticketssold} tickets available</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IndianRupee className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {event.price.toLocaleString()}
            </span>
          </div>
          <Link
            to={`/events/${event.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            View Details
          </Link>
        </div>

        {showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => onEdit?.(event)}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button 
              onClick={() => onDelete?.(event.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
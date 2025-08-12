import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Calendar, MapPin, IndianRupee, Users, Type, FileText, Clock, Phone, Mail, Globe, Tag, Upload } from 'lucide-react';
import { Event } from '../../store/slices/eventSlice';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  location: yup.string().required('Location is required'),
  price: yup.number().required('Price is required').min(0, 'Price must be positive'),
  category: yup.string().required('Category is required'),
  capacity: yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1'),
  // All fields optional for now
  ticketType: yup.string(),
  bookingDeadline: yup.string(),
  organizerEmail: yup.string().email('Invalid email'),
  organizerPhone: yup.string(),
  contactPhone: yup.string(),
  contactEmail: yup.string().email('Invalid email'),
  websiteUrl: yup.string().url('Invalid URL'),
  tags: yup.string(),
});

interface EventFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: Event | null;
  isEditMode?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, loading = false, initialData, isEditMode = false }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      reset(initialData);
      setImagePreview(initialData.image || '');
    }
  }, [isEditMode, initialData, reset]);

  const categories = [
    'Technology',
    'Music',
    'Food & Drink',
    'Business',
    'Arts & Culture',
    'Sports & Fitness',
    'Education',
    'Health & Wellness',
    'Entertainment',
    'Other'
  ];

  const ticketTypes = ['Free', 'Paid', 'Donation'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data: any) => {
    // Add image data
    const formData = {
      ...data,
      image: imagePreview, // For now, just use preview. You can add upload logic later
      imageFile: imageFile,
    };
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
      className="bg-white dark:bg-gray-900/70 dark:backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
=======
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        
        {/* Basic Information */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Type className="w-4 h-4 inline mr-2" />
                Event Title *
              </label>
              <input
                {...register('title')}
                type="text"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Category *
              </label>
              <select
                {...register('category')}
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                {...register('date')}
                type="date"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </label>
              <input
                {...register('time')}
                type="time"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="lg:col-span-2">
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <MapPin className="w-4 h-4 inline mr-2" />
                Location *
              </label>
              <input
                {...register('location')}
                type="text"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Enter event location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
<<<<<<< HEAD
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
            <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              <FileText className="w-4 h-4 inline mr-2" />
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
<<<<<<< HEAD
              className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Ticket Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-pink-600">🎫 Ticket Settings</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket Type */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Ticket Type
              </label>
              <select
                {...register('ticketType')}
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              >
                {ticketTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Deadline */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Booking Deadline
              </label>
              <input
                {...register('bookingDeadline')}
                type="date"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              />
            </div>

            {/* Ticket Price */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <IndianRupee className="w-4 h-4 inline mr-2" />
                Ticket Price *
              </label>
              <input
                {...register('price')}
                type="number"
                min="0"
                step="0.01"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Enter ticket price"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Total Tickets */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Users className="w-4 h-4 inline mr-2" />
                Total Tickets Available *
              </label>
              <input
                {...register('capacity')}
                type="number"
                min="1"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Enter total capacity"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Organizer Information */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Organizer Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Organizer Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Mail className="w-4 h-4 inline mr-2" />
                Organizer Email
              </label>
              <input
                {...register('organizerEmail')}
                type="email"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="organizer@example.com"
              />
              {errors.organizerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.organizerEmail.message}</p>
              )}
            </div>

            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Phone className="w-4 h-4 inline mr-2" />
                Organizer Phone
              </label>
              <input
                {...register('organizerPhone')}
                type="tel"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Phone number"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Contact Phone
              </label>
              <input
                {...register('contactPhone')}
                type="tel"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="Contact phone number"
              />
            </div>

            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Contact Email
              </label>
              <input
                {...register('contactEmail')}
                type="email"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="contact@example.com"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Globe className="w-4 h-4 inline mr-2" />
                Website URL
              </label>
              <input
                {...register('websiteUrl')}
                type="url"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="https://example.com"
              />
              {errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.websiteUrl.message}</p>
              )}
            </div>



            <div className="lg:col-span-2">
<<<<<<< HEAD
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
              <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                <Tag className="w-4 h-4 inline mr-2" />
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
<<<<<<< HEAD
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                placeholder="technology, workshop, networking (separate with commas)"
              />
            </div>
          </div>
        </div>

        {/* Event Banner */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Event Banner</h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Banner</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              <div className="mt-4">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Upload Event Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
<<<<<<< HEAD
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
=======
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="mx-auto h-32 w-auto rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Settings */}
        <div>
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Event Settings</h3>
=======
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Settings</h3>
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="eventPublic"
                defaultChecked
<<<<<<< HEAD
                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="eventPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
=======
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="eventPublic" className="ml-2 text-sm text-gray-700">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Public event (visible to everyone)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAttendeeCount"
                defaultChecked
<<<<<<< HEAD
                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="showAttendeeCount" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
=======
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showAttendeeCount" className="ml-2 text-sm text-gray-700">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Show attendee count
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showRemainingTickets"
                defaultChecked
<<<<<<< HEAD
                className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="showRemainingTickets" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
=======
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showRemainingTickets" className="ml-2 text-sm text-gray-700">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
                Show remaining tickets
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
<<<<<<< HEAD
        <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
=======
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-lg font-semibold transition-colors"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;
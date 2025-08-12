import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, Calendar, IndianRupee } from 'lucide-react';
import { RootState } from '../../store';
import { setFilters } from '../../store/slices/eventSlice';

const EventFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.events);

  const categories = [
    'All Categories',
    'Technology',
    'Music',
    'Food & Drink',
    'Business',
    'Arts & Culture',
    'Sports & Fitness',
  ];

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
<<<<<<< HEAD
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
=======
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={() => dispatch(setFilters({
            category: '',
            priceRange: [0, 10000],
            date: '',
            search: '',
          }))}
<<<<<<< HEAD
          className="text-sm text-blue-500 hover:text-blue-400 font-medium"
=======
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Events
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
=======
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Events
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title..."
<<<<<<< HEAD
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            />
          </div>
        </div>

        {/* Category */}
        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
<<<<<<< HEAD
            className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by category"
=======
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
          >
            {categories.map((category) => (
              <option key={category} value={category === 'All Categories' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
=======
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
<<<<<<< HEAD
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by date"
=======
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
=======
          <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
            Price Range
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
<<<<<<< HEAD
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
=======
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                placeholder="Min"
<<<<<<< HEAD
                className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <span className="text-gray-400 dark:text-gray-500">-</span>
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
=======
                className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                placeholder="Max"
<<<<<<< HEAD
                className="w-full pl-10 pr-2 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
=======
                className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>>>>>>> 7e3fd58216fb2112bd8ea4c027f868e0e64bb53b
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
import React, { useState } from 'react';
import type { BlogFilters as BlogFiltersType } from '../../types/api';

interface BlogFiltersProps {
  filters: BlogFiltersType;
  onFiltersChange: (filters: BlogFiltersType) => void;
  showAdminFilters?: boolean;
}

export const BlogFiltersComponent: React.FC<BlogFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  showAdminFilters = false 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: keyof BlogFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: BlogFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search articles..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Content Type Filter */}
        <select
          value={localFilters.jenis_konten || ''}
          onChange={(e) => handleFilterChange('jenis_konten', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="Blog">Blog</option>
          <option value="News">News</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Case Study">Case Study</option>
        </select>

        {/* Featured Filter */}
        <select
          value={localFilters.featured?.toString() || ''}
          onChange={(e) => handleFilterChange('featured', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Articles</option>
          <option value="true">Featured Only</option>
          <option value="false">Non-Featured</option>
        </select>

        {/* Admin Status Filter */}
        {showAdminFilters && (
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Publish">Published</option>
            <option value="Archive">Archived</option>
          </select>
        )}

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Active Filters Display */}
      {Object.values(localFilters).some(value => value !== undefined && value !== '') && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {localFilters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Search: "{localFilters.search}"
              <button onClick={() => handleFilterChange('search', '')}>×</button>
            </span>
          )}
          {localFilters.jenis_konten && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Type: {localFilters.jenis_konten}
              <button onClick={() => handleFilterChange('jenis_konten', '')}>×</button>
            </span>
          )}
          {localFilters.featured !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Featured: {localFilters.featured ? 'Yes' : 'No'}
              <button onClick={() => handleFilterChange('featured', undefined)}>×</button>
            </span>
          )}
          {localFilters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Status: {localFilters.status}
              <button onClick={() => handleFilterChange('status', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

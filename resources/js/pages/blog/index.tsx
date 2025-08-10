import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { BlogCard } from '../../components/blog/BlogCard';
import { BlogFiltersComponent } from '../../components/blog/BlogFilters';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import { blogService } from '../../services/blogService';
import type { Blog, BlogFilters } from '../../types/api';

export default function BlogIndex() {
  const [filters, setFilters] = useState<BlogFilters>({});
  const pagination = usePagination({ initialPerPage: 12 });
  
  const {
    data: blogsData,
    loading,
    error,
    execute: fetchBlogs
  } = useApi(() => blogService.getBlogs(pagination.currentPage, filters), {
    autoFetch: false
  });

  const {
    data: featuredBlogs,
    loading: featuredLoading
  } = useApi(() => blogService.getFeaturedBlogs());

  // Fetch blogs when page or filters change
  useEffect(() => {
    fetchBlogs().then((data) => {
      if (data) {
        pagination.updatePagination(data);
      }
    });
  }, [pagination.currentPage, filters]);

  const handleFiltersChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
    pagination.goToPage(1); // Reset to first page when filters change
  };

  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={pagination.prevPage}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {pagination.getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? pagination.goToPage(page) : undefined}
            disabled={page === '...'}
            className={`px-3 py-2 border rounded-lg ${
              page === pagination.currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : 'hover:bg-gray-50'
            } ${page === '...' ? 'cursor-default' : ''}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={pagination.nextPage}
          disabled={!pagination.hasNextPage}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <>
      <Head title="Blog & Articles" />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog & Articles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insights, tutorials, and industry knowledge from our experts
            </p>
          </div>

          {/* Featured Articles */}
          {featuredBlogs && featuredBlogs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBlogs.slice(0, 3).map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </section>
          )}

          {/* Filters */}
          <BlogFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading articles...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error loading articles: {error}</p>
              <button
                onClick={fetchBlogs}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Articles Grid */}
          {blogsData && blogsData.data && (
            <>
              {blogsData.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
                </div>
              ) : (
                <>
                  {/* Results Info */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      Showing {blogsData.from}-{blogsData.to} of {blogsData.total} articles
                    </p>
                    <select
                      value={pagination.perPage}
                      onChange={(e) => pagination.updatePagination({
                        ...blogsData,
                        per_page: parseInt(e.target.value)
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="12">12 per page</option>
                      <option value="24">24 per page</option>
                      <option value="48">48 per page</option>
                    </select>
                  </div>

                  {/* Articles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {blogsData.data.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <PaginationComponent />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Video } from '@/types/api';
import { videoService } from '@/services/videoService';
import { usePagination } from '@/hooks/usePagination';
import MainLayout from '@/layouts/MainLayout';

interface VideoFilters {
  search?: string;
  jenis_konten?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export default function VideoIndex() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VideoFilters>({
    sort: 'created_at',
    order: 'desc'
  });

  const {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage
  } = usePagination();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getVideos();
      setVideos(response.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: Partial<VideoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    goToPage(1);
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <Link
      href={route('video.show', video.id)}
      className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700"
    >
      {video.thumbnail && (
        <div className="relative aspect-video bg-gray-100 overflow-hidden dark:bg-gray-700">
          <img
            src={video.thumbnail}
            alt={video.nama_video}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {video.durasi && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {video.durasi} min
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 dark:text-white dark:group-hover:text-blue-400">
          {video.nama_video}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 dark:text-gray-300">
          {video.deskripsi}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs dark:bg-blue-900 dark:text-blue-300">
              Video
            </span>
            <span>{video.views} views</span>
          </div>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );

  const VideoFiltersComponent = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Search Videos
          </label>
          <input
            type="text"
            placeholder="Search videos..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Content Type
          </label>
          <select
            value={filters.jenis_konten || ''}
            onChange={(e) => handleFilterChange({ jenis_konten: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="tutorial">Tutorial</option>
            <option value="webinar">Webinar</option>
            <option value="course">Course</option>
            <option value="demo">Demo</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Sort By
          </label>
          <select
            value={filters.sort || 'created_at'}
            onChange={(e) => handleFilterChange({ sort: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="created_at">Date Created</option>
            <option value="judul_video">Title</option>
            <option value="views">Views</option>
            <option value="durasi">Duration</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            Order
          </label>
          <select
            value={filters.order || 'desc'}
            onChange={(e) => handleFilterChange({ order: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <Head title="Videos" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Videos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore our collection of educational videos and tutorials
          </p>
        </div>

        {/* Filters */}
        <VideoFiltersComponent />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-lg mb-4 dark:bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Grid */}
        {!loading && (
          <>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📹</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No videos found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search filters or check back later for new content.
                </p>
              </div>
            )}

            {/* Pagination */}
            {videos.length > 0 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

import React from 'react';
import { Link } from '@inertiajs/react';
import type { Blog } from '../../types/api';

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  onEdit?: (blog: Blog) => void;
  onDelete?: (blog: Blog) => void;
  onToggleFeatured?: (blog: Blog) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  showActions = false,
  onEdit,
  onDelete,
  onToggleFeatured 
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      {blog.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <img
            src={blog.thumbnail}
            alt={blog.nama_artikel}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header with featured badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {blog.jenis_konten}
            </span>
            {blog.featured && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Featured
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{blog.views} views</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link 
            href={`/blog/${blog.slug || blog.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {blog.nama_artikel}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateText(blog.excerpt || blog.deskripsi, 120)}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>By {blog.penulis}</span>
          <span>{formatDate(blog.created_at)}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => onToggleFeatured?.(blog)}
              className={`text-xs px-3 py-1 rounded ${
                blog.featured 
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {blog.featured ? 'Unfeature' : 'Feature'}
            </button>
            <button
              onClick={() => onEdit?.(blog)}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(blog)}
              className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}

        {/* Read more button for non-admin */}
        {!showActions && (
          <Link
            href={`/blog/${blog.slug || blog.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Read More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

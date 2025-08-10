import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useApi } from '../../hooks/useApi';
import { blogService } from '../../services/blogService';
import type { Blog } from '../../types/api';

interface BlogDetailProps {
  blog: Blog;
  relatedBlogs?: Blog[];
}

export default function BlogDetail({ blog, relatedBlogs = [] }: BlogDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head title={blog.nama_artikel} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Image */}
        {blog.thumbnail && (
          <div className="relative h-96 overflow-hidden">
            <img
              src={blog.thumbnail}
              alt={blog.nama_artikel}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gray-700">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{blog.nama_artikel}</span>
            </div>
          </nav>

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-8">
              {/* Article Header */}
              <header className="mb-8">
                {/* Categories and Featured Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {blog.jenis_konten}
                  </span>
                  {blog.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {blog.views} views
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {blog.nama_artikel}
                </h1>

                {/* Description */}
                {blog.deskripsi && (
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    {blog.deskripsi}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      By <span className="font-medium text-gray-900">{blog.penulis}</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <time className="text-sm text-gray-600">
                      {formatDate(blog.created_at)} at {formatTime(blog.created_at)}
                    </time>
                  </div>
                  
                  {/* Share Buttons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Share:</span>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.211.375-.444.865-.608 1.25a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.547 19.547 0 0 0 3.677 4.492a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.082.082 0 0 0 .031.056 19.735 19.735 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.923 13.923 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.928 1.77 8.18 1.77 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.672 19.672 0 0 0 6.002-2.981.076.076 0 0 0 .032-.055c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: blog.konten }}
              />

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Last updated: {formatDate(blog.updated_at)}
                  </div>
                  <Link 
                    href="/blog"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ← Back to Blog
                  </Link>
                </div>
              </footer>
            </div>
          </article>

          {/* Related Articles */}
          {relatedBlogs && relatedBlogs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div key={relatedBlog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {relatedBlog.thumbnail && (
                      <img
                        src={relatedBlog.thumbnail}
                        alt={relatedBlog.nama_artikel}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link
                          href={`/blog/${relatedBlog.slug || relatedBlog.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedBlog.nama_artikel}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {relatedBlog.excerpt || relatedBlog.deskripsi}
                      </p>
                      <div className="text-xs text-gray-500">
                        {formatDate(relatedBlog.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

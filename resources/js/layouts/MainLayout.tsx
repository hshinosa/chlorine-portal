import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={route('welcome')} className="text-xl font-bold text-gray-900 dark:text-white">
                Chlorine Portal
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link 
                href={route('blog.index')} 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Blog
              </Link>
              <Link 
                href={route('video.index')} 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Videos
              </Link>
              <Link 
                href={route('sertifikasi.index')} 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Certification
              </Link>
              <Link 
                href={route('pkl.index')} 
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Internship
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Chlorine Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

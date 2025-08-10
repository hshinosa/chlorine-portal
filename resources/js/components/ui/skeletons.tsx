import React from 'react';

export const ListSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows = 5, className = '' }) => {
  return (
    <div className={`grid gap-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 w-full bg-gray-100 animate-pulse rounded" />
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC<{ blocks?: number; className?: string }> = ({ blocks = 3, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="h-8 w-64 bg-gray-100 animate-pulse rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: Math.max(1, blocks - 1) }).map((_,i)=>(
            <div key={i} className="h-60 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: blocks }).map((_,i)=>(
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

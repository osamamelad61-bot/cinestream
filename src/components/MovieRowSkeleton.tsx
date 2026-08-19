import React from 'react';

export default function MovieRowSkeleton() {
  return (
    <div className="mb-8 space-y-2 px-4 md:px-12">
      <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      <div className="flex items-center space-x-2 overflow-hidden py-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 min-w-[200px] animate-pulse rounded-md bg-white/5 md:h-36 md:min-w-[280px]"
          />
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export function MatchCardSkeleton() {
  return (
    <div className="glass-card p-3.5 sm:p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="h-3 w-36 skeleton" />
        <div className="h-5 w-14 skeleton rounded-full" />
      </div>
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg skeleton" />
            <div className="h-4 w-20 skeleton" />
          </div>
          <div className="h-5 w-16 skeleton" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg skeleton" />
            <div className="h-4 w-20 skeleton" />
          </div>
          <div className="h-5 w-16 skeleton" />
        </div>
      </div>
      <div className="border-t border-border pt-4">
        <div className="h-3 w-48 skeleton" />
      </div>
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-6 h-4 skeleton rounded" />
        <div className="w-8 h-8 rounded-full skeleton" />
        <div className="w-24 h-4 skeleton rounded" />
      </div>
      <div className="w-16 h-5 skeleton rounded" />
    </div>
  );
}

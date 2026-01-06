'use client';

import { useState } from 'react';

interface AgentPhotoProps {
  photo?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showLevelBadge?: boolean;
  level?: number;
}

export default function AgentPhoto({
  photo,
  name,
  size = 'md',
  showLevelBadge = false,
  level,
}: AgentPhotoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-24 text-3xl',
    md: 'w-32 h-32 md:w-40 md:h-40 text-4xl md:text-5xl',
    lg: 'w-48 h-48 text-6xl',
  };

  const badgeSizeClasses = {
    sm: 'w-8 h-8 text-sm -bottom-1 -right-1',
    md: 'w-10 h-10 text-lg -bottom-2 -right-2',
    lg: 'w-12 h-12 text-xl -bottom-2 -right-2',
  };

  return (
    <div className="relative inline-block">
      {/* Outer decorative rings */}
      <div className="absolute -inset-2 rounded-full border-2 border-primary-300 opacity-50"></div>
      <div className="absolute -inset-4 rounded-full border border-primary-200 opacity-30"></div>
      
      {/* Main photo frame */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-primary-500 shadow-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-4 ring-primary-100 ring-offset-2`}
      >
        {photo && !imageError ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-bold text-primary-600">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Level badge on photo */}
      {showLevelBadge && level && (
        <div
          className={`absolute ${badgeSizeClasses[size]} bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg`}
        >
          <span className="font-bold text-yellow-900">{level}</span>
        </div>
      )}
    </div>
  );
}

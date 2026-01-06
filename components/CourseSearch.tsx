'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface CourseSearchProps {
  placeholder?: string;
}

export default function CourseSearch({ placeholder = 'Search courses and lessons...' }: CourseSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to first page on new search
    router.push(`/courses?${params.toString()}`);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/courses?${params.toString()}`);
  };

  return (
    <div className="relative flex-1 min-w-0">
      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.01]' : ''}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={`h-5 w-5 transition-colors duration-200 ${isFocused || searchTerm ? 'text-primary-500' : 'text-gray-400'}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center group/clear"
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors duration-200 group-hover/clear:scale-110"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

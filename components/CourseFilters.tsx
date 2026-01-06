'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface CourseFiltersProps {
  countries: Array<{ id: string; code: string; name: string }>;
  categories: Array<{ id: string; slug: string; name: string }>;
}

export default function CourseFilters({ countries, categories }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Get selected categories from URL (comma-separated)
  const categoryParam = searchParams.get('categories') || '';
  const selectedCategories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];

  const handleCountryChange = (countryCode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (countryCode === 'all') {
      params.delete('country');
    } else {
      params.set('country', countryCode);
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newSelectedCategories: string[];
    
    if (selectedCategories.includes(categorySlug)) {
      // Remove category
      newSelectedCategories = selectedCategories.filter(slug => slug !== categorySlug);
    } else {
      // Add category
      newSelectedCategories = [...selectedCategories, categorySlug];
    }

    if (newSelectedCategories.length === 0) {
      params.delete('categories');
    } else {
      params.set('categories', newSelectedCategories.join(','));
    }
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('country');
    params.delete('categories');
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const selectedCountry = searchParams.get('country') || 'all';
  const hasActiveFilters = selectedCountry !== 'all' || selectedCategories.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Country Filter */}
      <div className="relative flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <svg className={`h-5 w-5 transition-colors ${selectedCountry !== 'all' ? 'text-primary-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={`w-full border-2 rounded-xl pl-10 pr-10 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none transition-all duration-200 font-medium text-sm ${
            selectedCountry !== 'all' ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25em 1.25em',
          }}
        >
          <option value="all">All Countries</option>
          {countries.map((country) => (
            <option key={country.id} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="relative flex-shrink-0 w-full sm:w-auto" ref={categoryDropdownRef}>
        <button
          type="button"
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className={`relative w-full sm:w-[220px] border-2 rounded-xl pl-10 pr-10 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium text-sm text-left flex items-center justify-between ${
            selectedCategories.length > 0 ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 transition-colors ${selectedCategories.length > 0 ? 'text-primary-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className="pl-2">
            {selectedCategories.length === 0 
              ? 'All Categories' 
              : selectedCategories.length === 1
              ? categories.find(c => c.slug === selectedCategories[0])?.name || '1 selected'
              : `${selectedCategories.length} selected`}
          </span>
          {selectedCategories.length > 0 && (
            <span className="absolute top-1 right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCategories.length}
            </span>
          )}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isCategoryDropdownOpen && (
          <div className="absolute z-50 mt-2 w-full sm:w-[280px] bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            <div className="p-2">
              {categories.map((category) => {
                const isChecked = selectedCategories.includes(category.slug);
                return (
                  <label
                    key={category.id}
                    className="flex items-center px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(category.slug)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className={`ml-3 text-sm font-medium ${isChecked ? 'text-primary-700' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 whitespace-nowrap flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}

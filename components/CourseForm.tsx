'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Country {
  id: string;
  code: string;
  name: string;
}

interface CourseFormProps {
  categories: Category[];
  countries: Country[];
  course?: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    categoryId: string;
    countryId?: string;
    isPublished: boolean;
  };
}

export default function CourseForm({ categories, countries, course }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    categoryId: string;
    countryId: string | undefined;
    isPublished: boolean;
  }>({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    thumbnail: course?.thumbnail || '',
    categoryId: course?.categoryId || categories[0]?.id || '',
    countryId: course?.countryId || undefined,
    isPublished: course?.isPublished || false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = course 
        ? `/api/courses/${course.id}`
        : '/api/courses';
      
      const method = course ? 'PUT' : 'POST';

      // Prepare data for API - convert undefined countryId to null
      const apiData = {
        ...formData,
        countryId: formData.countryId || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      const data = await response.json();
      router.push(`/dashboard/courses/${data.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Introduction to Web Development"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug *
          </label>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., introduction-to-web-development"
          />
          <p className="mt-1 text-sm text-gray-500">
            Used in the URL: /courses/{formData.slug || 'your-slug'}
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe what students will learn in this course..."
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail URL
          </label>
          <input
            type="url"
            id="thumbnail"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="categoryId"
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-2">
            Country (Optional - leave empty for global)
          </label>
          <select
            id="countryId"
            value={formData.countryId || ''}
            onChange={(e) => setFormData({ ...formData, countryId: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Countries (Global)</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Published */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
            Publish this course (make it visible to students)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>
    </form>
  );
}

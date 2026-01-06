'use client';

import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  videoUrl?: string;
  content?: string;
  isPublished: boolean;
}

interface LessonFormProps {
  courseId: string;
  lesson?: Lesson;
  onSave: () => void;
  onCancel: () => void;
}

export default function LessonForm({ courseId, lesson, onSave, onCancel }: LessonFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    slug: lesson?.slug || '',
    description: lesson?.description || '',
    videoUrl: lesson?.videoUrl || '',
    content: lesson?.content || '',
    order: lesson?.order || 0,
    isPublished: lesson?.isPublished ?? true,
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
      const url = lesson
        ? `/api/lessons/${lesson.id}`
        : '/api/lessons';

      const method = lesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save lesson');
      }

      onSave();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error saving lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={handleTitleChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Introduction to HTML"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug *
        </label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Brief description of this lesson..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL (S3Bubble, YouTube, or Vimeo)
        </label>
        <input
          type="url"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://your-s3bubble-domain.com/embed/video-id or https://youtube.com/watch?v=..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports S3Bubble embed URLs, YouTube, or Vimeo. For testing, use YouTube URLs.
        </p>
        <p className="mt-1 text-xs text-primary-600">
          💡 Test with: https://www.youtube.com/watch?v=dQw4w9WgXcQ
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Content (HTML)
        </label>
        <textarea
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
          placeholder="<p>Additional content here...</p>"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
            />
            <span className="text-sm text-gray-700">Published</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
        </button>
      </div>
    </form>
  );
}

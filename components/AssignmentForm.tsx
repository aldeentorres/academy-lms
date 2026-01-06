'use client';

import { useState } from 'react';

interface AssignmentFormProps {
  lessonId: string;
  assignment?: {
    id: string;
    title: string;
    description: string;
    dueDate?: Date | string | null;
    maxPoints: number;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function AssignmentForm({ lessonId, assignment, onSave, onCancel }: AssignmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    dueDate: assignment?.dueDate
      ? new Date(assignment.dueDate).toISOString().split('T')[0]
      : '',
    maxPoints: assignment?.maxPoints || 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = assignment ? `/api/assignments/${assignment.id}` : '/api/assignments';
      const method = assignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assignment');
      }

      onSave();
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Final Project Submission"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            rows={6}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe the assignment requirements..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Points *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxPoints}
              onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) || 100 })}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
            />
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
            {loading ? 'Saving...' : assignment ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </form>
  );
}

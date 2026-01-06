'use client';

import { useState } from 'react';

interface AssignmentProps {
  assignmentId: string;
  title: string;
  description: string;
  dueDate?: Date;
  maxPoints: number;
}

export default function Assignment({
  assignmentId,
  title,
  description,
  dueDate,
  maxPoints,
}: AssignmentProps) {
  const [submission, setSubmission] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', submission);
    if (file) {
      formData.append('file', file);
    }

    try {
      // Here you would send to your API
      // const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
      //   method: 'POST',
      //   body: formData,
      // });

      setSubmitted(true);
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="mb-6">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">{description}</p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
        <p className="text-sm font-semibold text-gray-900">
          <span className="text-gray-600">Maximum Points:</span> <span className="text-primary-600">{maxPoints}</span>
        </p>
        {dueDate && (
          <p className="text-sm font-semibold text-gray-900">
            <span className="text-gray-600">Due Date:</span>{' '}
            <span className="text-red-600">{new Date(dueDate).toLocaleDateString()}</span>
          </p>
        )}
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Submission
            </label>
            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows={8}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 leading-relaxed"
              placeholder="Type your assignment submission here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            Submit Assignment
          </button>
        </form>
      ) : (
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <p className="text-green-800 font-bold text-lg mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Assignment submitted successfully!
          </p>
          <p className="text-sm text-green-700 font-medium">
            Your submission has been received. You will be notified when it's graded.
          </p>
        </div>
      )}
    </div>
  );
}

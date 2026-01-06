'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LessonForm from './LessonForm';
import QuizForm from './QuizForm';
import AssignmentForm from './AssignmentForm';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
  isPublished: boolean;
  quiz?: any;
  assignment?: any;
}

interface LessonManagerProps {
  courseId: string;
  courseSlug: string;
  lessons: Lesson[];
}

export default function LessonManager({ courseId, courseSlug, lessons: initialLessons }: LessonManagerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setLessons(lessons.filter((l) => l.id !== lessonId));
      router.refresh();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Error deleting lesson. Please try again.');
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingLesson(null);
    setEditingQuiz(null);
    setEditingAssignment(null);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Lessons</h2>
        <button
          onClick={() => {
            setEditingLesson(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
        >
          + Add Lesson
        </button>
      </div>

      {showForm && (
        <div className="mb-6 border-b pb-6">
          <LessonForm
            courseId={courseId}
            lesson={editingLesson || undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingLesson(null);
            }}
          />
        </div>
      )}

      {editingQuiz && (
        <div className="mb-6 border-b pb-6">
          {(() => {
            const lesson = lessons.find((l) => l.id === editingQuiz);
            return lesson ? (
              <QuizForm
                lessonId={lesson.id}
                quiz={lesson.quiz}
                onSave={handleSave}
                onCancel={() => setEditingQuiz(null)}
              />
            ) : null;
          })()}
        </div>
      )}

      {editingAssignment && (
        <div className="mb-6 border-b pb-6">
          {(() => {
            const lesson = lessons.find((l) => l.id === editingAssignment);
            return lesson ? (
              <AssignmentForm
                lessonId={lesson.id}
                assignment={lesson.assignment}
                onSave={handleSave}
                onCancel={() => setEditingAssignment(null)}
              />
            ) : null;
          })()}
        </div>
      )}

      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lesson.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="ml-11 flex items-center space-x-4 text-sm text-gray-500">
                    {lesson.videoUrl && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video
                      </span>
                    )}
                    {lesson.quiz && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Quiz
                      </span>
                    )}
                    {lesson.assignment && (
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Assignment
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                      target="_blank"
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      View
                    </a>
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 text-sm text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                    >
                      Edit Lesson
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.quiz ? (
                      <>
                        <a
                          href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                          target="_blank"
                          className="px-3 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
                        >
                          View Quiz
                        </a>
                        <button
                          onClick={() => setEditingQuiz(lesson.id)}
                          className="px-3 py-1 text-xs text-purple-700 bg-purple-100 rounded hover:bg-purple-200"
                        >
                          Edit Quiz
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingQuiz(lesson.id)}
                        className="px-3 py-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
                      >
                        + Add Quiz
                      </button>
                    )}
                    {lesson.assignment ? (
                      <>
                        <a
                          href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                          target="_blank"
                          className="px-3 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
                        >
                          View Assignment
                        </a>
                        <button
                          onClick={() => setEditingAssignment(lesson.id)}
                          className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
                        >
                          Edit Assignment
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingAssignment(lesson.id)}
                        className="px-3 py-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                      >
                        + Add Assignment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No lessons yet. Add your first lesson!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

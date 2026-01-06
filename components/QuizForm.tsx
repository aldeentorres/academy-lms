'use client';

import { useState } from 'react';

interface Question {
  id?: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface QuizFormProps {
  lessonId: string;
  quiz?: {
    id: string;
    title: string;
    questions: Question[];
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function QuizForm({ lessonId, quiz, onSave, onCancel }: QuizFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(quiz?.title || '');
  
  // Parse questions and handle options (which may be JSON strings from database)
  const parseQuestions = (quizQuestions?: Question[]): Question[] => {
    if (!quizQuestions || quizQuestions.length === 0) {
      return [
        {
          question: '',
          type: 'multiple-choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
          order: 0,
        },
      ];
    }
    
    return quizQuestions.map((q) => {
      let options = q.options;
      // If options is a string (JSON), parse it
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          console.error('Error parsing options:', e);
          options = ['', '', '', ''];
        }
      }
      // Ensure options is an array
      if (!Array.isArray(options)) {
        options = ['', '', '', ''];
      }
      // Ensure we have at least 4 options
      while (options.length < 4) {
        options.push('');
      }
      
      return {
        ...q,
        options: options as string[],
      };
    });
  };
  
  const [questions, setQuestions] = useState<Question[]>(parseQuestions(quiz?.questions));

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
        order: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = ['', '', '', ''];
    }
    updated[questionIndex].options![optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionsData = questions.map((q, index) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.type === 'multiple-choice' ? JSON.stringify(q.options) : null,
        correctAnswer: q.correctAnswer,
        points: q.points,
        order: index,
      }));

      const url = quiz ? `/api/quizzes/${quiz.id}` : '/api/quizzes';
      const method = quiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          title,
          questions: questionsData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      onSave();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quiz Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Chapter 1 Quiz"
        />
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    required
                    value={question.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      updateQuestion(qIndex, 'type', newType);
                      if (newType === 'multiple-choice' && !question.options) {
                        updateQuestion(qIndex, 'options', ['', '', '', '']);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {question.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options * (One must be the correct answer)
                  </label>
                  {Array.isArray(question.options) && question.options.map((option, optIndex) => (
                    <input
                      key={optIndex}
                      type="text"
                      required
                      value={option || ''}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 mb-2 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    required
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select answer...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {(question.type === 'multiple-choice' || question.type === 'short-answer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  {question.type === 'multiple-choice' ? (
                    <select
                      required
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select correct option...</option>
                      {Array.isArray(question.options) && question.options.map((opt, optIndex) => (
                        <option key={optIndex} value={opt}>
                          {opt || `Option ${optIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter the correct answer..."
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          + Add Question
        </button>

        <div className="flex items-center space-x-4">
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
            {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </form>
  );
}

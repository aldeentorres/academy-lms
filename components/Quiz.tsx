'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface QuizProps {
  quizId: string;
  questions: Question[];
  title: string;
}

export default function Quiz({ quizId, questions, title }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      maxScore += q.points;
      if (answers[q.id] === q.correctAnswer) {
        totalScore += q.points;
      }
    });

    setScore(totalScore);
    setSubmitted(true);
    setShowResults(true);

    // Here you would typically send the submission to your API
    // await fetch(`/api/quizzes/${quizId}/submit`, {
    //   method: 'POST',
    //   body: JSON.stringify({ answers })
    // });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border-b pb-6 last:border-0">
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {index + 1}. {question.question}
              </p>
              <span className="text-sm font-medium text-gray-600">
                ({question.points} point{question.points !== 1 ? 's' : ''})
              </span>
            </div>

            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label
                    key={optIndex}
                    className={`block p-3 border rounded cursor-pointer transition ${
                      showResults
                        ? option === question.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : answers[question.id] === option && option !== question.correctAnswer
                          ? 'bg-red-50 border-red-500'
                          : 'border-gray-300'
                        : answers[question.id] === option
                        ? 'bg-primary-50 border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={submitted}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`block p-3 border rounded cursor-pointer transition ${
                      showResults
                        ? option === question.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : answers[question.id] === option && option !== question.correctAnswer
                          ? 'bg-red-50 border-red-500'
                          : 'border-gray-300'
                        : answers[question.id] === option
                        ? 'bg-primary-50 border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={submitted}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.type === 'short-answer' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={submitted}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Type your answer..."
              />
            )}

            {showResults && (
              <div className="mt-3 text-sm font-medium">
                {answers[question.id] === question.correctAnswer ? (
                  <span className="text-green-700 bg-green-50 px-3 py-1.5 rounded-md inline-flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Correct
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-50 px-3 py-1.5 rounded-md inline-flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Incorrect. Correct answer: {question.correctAnswer}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-6 p-6 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border-2 border-primary-200">
          <p className="text-xl font-bold text-gray-900 mb-2">
            Your Score: {score} / {questions.reduce((sum, q) => sum + q.points, 0)} points
          </p>
          <p className="text-base font-medium text-gray-700">
            Percentage: {score !== null ? Math.round((score / questions.reduce((sum, q) => sum + q.points, 0)) * 100) : 0}%
          </p>
        </div>
      )}
    </div>
  );
}

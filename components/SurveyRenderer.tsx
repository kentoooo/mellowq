'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Survey, Answer } from '@/types';

const NotificationManager = dynamic(() => import('@/components/NotificationManager'), {
  ssr: false,
});

interface SurveyRendererProps {
  survey: Survey;
  onSubmit: (answers: Answer[], notificationSubscription?: any) => void;
  isSubmitting: boolean;
}

export default function SurveyRenderer({ survey, onSubmit, isSubmitting }: SurveyRendererProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationSubscription, setNotificationSubscription] = useState<any>(null);
  const [pendingSubscription, setPendingSubscription] = useState<any>(null);

  useEffect(() => {
    const initialAnswers: Record<string, string | string[]> = {};
    survey.questions.forEach(question => {
      if (question.type === 'checkbox') {
        initialAnswers[question.id] = [];
      } else {
        initialAnswers[question.id] = '';
      }
    });
    setAnswers(initialAnswers);
  }, [survey]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValues = answers[questionId] as string[] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(v => v !== option);
    }
    
    handleAnswerChange(questionId, newValues);
  };

  const validateAnswers = () => {
    const newErrors: Record<string, string> = {};
    
    survey.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        if (
          !answer || 
          (typeof answer === 'string' && !answer.trim()) ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[question.id] = 'この質問は必須です';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAnswers()) {
      return;
    }

    if (!showNotificationPrompt) {
      setShowNotificationPrompt(true);
      return;
    }

    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    onSubmit(formattedAnswers, notificationSubscription);
  };

  const handleNotificationSubscription = (subscription: any) => {
    console.log('NotificationSubscription received in SurveyRenderer:', subscription);
    setNotificationSubscription(subscription);
  };

  const proceedWithoutNotification = () => {
    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    onSubmit(formattedAnswers, null);
  };

  if (showNotificationPrompt && !isSubmitting) {
    return (
      <NotificationManager
        onSubscribe={(subscription) => {
          console.log('Subscription received:', subscription);
          setPendingSubscription(subscription);
          handleNotificationSubscription(subscription);
        }}
        onSkip={proceedWithoutNotification}
        onComplete={() => {
          console.log('onComplete called, pendingSubscription:', pendingSubscription);
          const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          }));
          // pendingSubscriptionを使用して確実にsubscriptionを渡す
          onSubmit(formattedAnswers, pendingSubscription);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        <p className="text-gray-600 mb-6">{survey.description}</p>

        {survey.questions.map((question, index) => (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {index + 1}. {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.type === 'text' && (
              <textarea
                value={answers[question.id] as string || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[question.id] ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
              />
            )}

            {question.type === 'radio' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'checkbox' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={(answers[question.id] as string[] || []).includes(option)}
                      onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {errors[question.id] && (
              <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? '送信中...' : '回答を送信'}
        </button>
      </div>
    </form>
  );
}
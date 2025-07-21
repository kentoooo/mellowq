'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Question } from '@/types';

const SurveyCreator = dynamic(() => import('@/components/SurveyCreator'), {
  ssr: false,
});

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (title: string, description: string, questions: Question[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!response.ok) {
        throw new Error('Failed to create survey');
      }

      const data = await response.json();
      router.push(`/manage/${data.adminToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* 紫のグラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">アンケートを作成</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <SurveyCreator onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Survey, Response, FollowupQuestion } from '@/types';

const FollowupResponse = dynamic(() => import('@/components/FollowupResponse'), {
  ssr: false,
});

interface FollowupData {
  response: Response;
  survey: Partial<Survey>;
  followupQuestions: FollowupQuestion[];
}

export default function FollowupPage({ params }: { params: Promise<{ responseToken: string }> }) {
  const { responseToken } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FollowupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowupData();
  }, [responseToken]);

  const fetchFollowupData = async () => {
    try {
      const response = await fetch(`/api/followup/${responseToken}`);
      if (!response.ok) {
        throw new Error('Failed to fetch followup data');
      }
      const followupData = await response.json();
      setData(followupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (followupQuestionId: string, answer: string) => {
    try {
      const response = await fetch(`/api/followup/${responseToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followupQuestionId, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // データを再取得
      await fetchFollowupData();
      
      return true;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
        <div className="relative z-10 bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
        <div className="relative z-10 bg-white rounded-lg shadow-xl p-8 text-center">
          <p className="text-red-600 mb-4">{error || '追加質問が見つかりません'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <FollowupResponse
            response={data.response}
            survey={data.survey}
            followupQuestions={data.followupQuestions}
            onAnswerSubmit={handleAnswerSubmit}
          />
        </div>
      </div>
    </div>
  );
}
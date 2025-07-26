'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Survey, Response } from '@/types';

const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  ssr: false,
});

interface AdminData {
  survey: Survey;
  responses: Response[];
  stats: any;
}

export default function ManagePage({ params }: { params: Promise<{ adminToken: string }> }) {
  const { adminToken } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    fetchAdminData();
  }, [adminToken]);

  // 定期的な自動更新（20秒ごと、最大20回）
  useEffect(() => {
    if (pollCount >= 20) {
      return; // 20回以上はポーリングしない
    }

    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        fetchAdminData(true);
        setPollCount(prev => prev + 1);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [loading, isRefreshing, pollCount]);

  // フォーカス時の自動更新
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && !isRefreshing && lastUpdate) {
        const timeSinceUpdate = Date.now() - lastUpdate.getTime();
        // 最後の更新から10秒以上経過していたら更新
        if (timeSinceUpdate > 10000) {
          fetchAdminData(true);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [loading, isRefreshing, lastUpdate]);

  const fetchAdminData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
      
      const response = await fetch(`/api/admin/${adminToken}/responses`);
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const adminData = await response.json();
      setData(adminData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleFollowupSubmit = async (responseId: string, question: string) => {
    try {
      const response = await fetch(`/api/admin/${adminToken}/followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responseId, question }),
      });

      if (!response.ok) {
        throw new Error('Failed to send followup question');
      }

      const result = await response.json();
      
      // データを再取得
      await fetchAdminData();
      
      return result;
    } catch (error) {
      console.error('Error sending followup:', error);
      throw error;
    }
  };

  const handleSendReminder = async (followupQuestionId: string) => {
    try {
      const response = await fetch(`/api/admin/${adminToken}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followupQuestionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reminder');
      }

      const result = await response.json();
      
      // データを再取得
      await fetchAdminData();
      
      return result;
    } catch (error) {
      console.error('Error sending reminder:', error);
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
          <p className="text-red-600 mb-4">{error || 'アンケートが見つかりません'}</p>
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

  const surveyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/survey/${data.survey.id}`
    : '';

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <AdminDashboard
          survey={data.survey}
          responses={data.responses}
          stats={data.stats}
          surveyUrl={surveyUrl}
          onFollowupSubmit={handleFollowupSubmit}
          onSendReminder={handleSendReminder}
          isRefreshing={isRefreshing}
          lastUpdate={lastUpdate}
          onRefresh={() => fetchAdminData(true)}
        />
      </div>
    </div>
  );
}
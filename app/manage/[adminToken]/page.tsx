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

  useEffect(() => {
    fetchAdminData();
  }, [adminToken]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`/api/admin/${adminToken}/responses`);
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const adminData = await response.json();
      setData(adminData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminDashboard
          survey={data.survey}
          responses={data.responses}
          stats={data.stats}
          surveyUrl={surveyUrl}
          onFollowupSubmit={handleFollowupSubmit}
        />
      </div>
    </div>
  );
}
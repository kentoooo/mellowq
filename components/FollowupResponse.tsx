'use client';

import { useState } from 'react';
import { Survey, Response, FollowupQuestion } from '@/types';

interface FollowupResponseProps {
  response: Response;
  survey: Partial<Survey>;
  followupQuestions: FollowupQuestion[];
  onAnswerSubmit: (followupQuestionId: string, answer: string) => Promise<boolean>;
}

export default function FollowupResponse({
  response,
  survey,
  followupQuestions,
  onAnswerSubmit,
}: FollowupResponseProps) {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 1500);
  };

  const handleAnswerSubmit = async (followupQuestionId: string) => {
    if (!currentAnswer.trim()) return;

    setIsSubmitting(true);
    setSubmittingQuestionId(followupQuestionId);

    try {
      await onAnswerSubmit(followupQuestionId, currentAnswer);
      setCurrentAnswer('');
      showToast('回答を送信しました！', 'success');
    } catch (error) {
      showToast('回答の送信に失敗しました。', 'error');
    } finally {
      setIsSubmitting(false);
      setSubmittingQuestionId(null);
    }
  };

  const unansweredQuestions = followupQuestions.filter(q => !q.answer);
  const answeredQuestions = followupQuestions.filter(q => q.answer);

  return (
    <div className="space-y-6 relative">
      {/* 右上トースト通知 */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
          <div className={`${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white px-6 py-4 rounded-lg shadow-xl max-w-md border border-white/20`}>
            <p className="text-base font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">追加質問への回答</h1>
        <p className="text-gray-600">
          「{survey.title}」に関する追加質問があります。
        </p>
      </div>

      {/* 元の回答の表示 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">あなたの回答</h2>
        <div className="space-y-4">
          {response.answers.map((answer) => {
            const question = survey.questions?.find(q => q.id === answer.questionId);
            return (
              <div key={answer.questionId} className="border-l-4 border-blue-200 pl-4">
                <p className="font-medium text-sm text-gray-700">{question?.text}</p>
                <p className="text-gray-900 mt-1">
                  {Array.isArray(answer.value) 
                    ? answer.value.join(', ') 
                    : answer.value}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          回答日時: {new Date(response.submittedAt).toLocaleString('ja-JP')}
        </p>
      </div>

      {/* 未回答の追加質問 */}
      {unansweredQuestions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">追加質問</h2>
          <div className="space-y-6">
            {unansweredQuestions.map((followupQuestion) => (
              <div key={followupQuestion.id} className="border rounded-lg p-4 bg-yellow-50">
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-2">
                    質問者からの追加質問
                  </p>
                  <p className="text-gray-700 bg-white p-3 rounded border">
                    {followupQuestion.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    質問日時: {new Date(followupQuestion.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    あなたの回答
                  </label>
                  <textarea
                    value={followupQuestion.id === submittingQuestionId ? currentAnswer : 
                           (followupQuestion.id === unansweredQuestions[0]?.id ? currentAnswer : '')}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onFocus={() => {
                      if (submittingQuestionId !== followupQuestion.id) {
                        setCurrentAnswer('');
                      }
                    }}
                    placeholder="こちらに回答を入力してください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleAnswerSubmit(followupQuestion.id)}
                      disabled={isSubmitting || !currentAnswer.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isSubmitting && submittingQuestionId === followupQuestion.id 
                        ? '送信中...' 
                        : '回答を送信'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 回答済みの追加質問 */}
      {answeredQuestions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">回答済みの質問</h2>
          <div className="space-y-4">
            {answeredQuestions.map((followupQuestion) => (
              <div key={followupQuestion.id} className="border rounded-lg p-4 bg-green-50">
                <div className="mb-3">
                  <p className="font-medium text-gray-900 mb-2">質問</p>
                  <p className="text-gray-700 bg-white p-3 rounded border">
                    {followupQuestion.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    質問日時: {new Date(followupQuestion.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-2">あなたの回答</p>
                  <p className="text-gray-700 bg-white p-3 rounded border">
                    {followupQuestion.answer}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    回答日時: {followupQuestion.answeredAt 
                      ? new Date(followupQuestion.answeredAt).toLocaleString('ja-JP')
                      : '未回答'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 追加質問がない場合 */}
      {followupQuestions.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">現在、追加質問はありません。</p>
        </div>
      )}

      {/* 完了メッセージ */}
      {followupQuestions.length > 0 && unansweredQuestions.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            すべての質問に回答完了
          </h3>
          <p className="text-green-700">
            ありがとうございました。すべての追加質問への回答が完了しました。
          </p>
        </div>
      )}
    </div>
  );
}
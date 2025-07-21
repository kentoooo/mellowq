'use client';

import { useState, useEffect } from 'react';
import { Survey, ResponseWithFollowup } from '@/types';

interface AdminDashboardProps {
  survey: Survey;
  responses: ResponseWithFollowup[];
  stats: any;
  surveyUrl: string;
  onFollowupSubmit: (responseId: string, question: string) => Promise<any>;
}

export default function AdminDashboard({
  survey,
  responses,
  stats,
  surveyUrl,
  onFollowupSubmit,
}: AdminDashboardProps) {
  const [selectedResponse, setSelectedResponse] = useState<ResponseWithFollowup | null>(null);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState<string | null>(null);
  const [expandedFollowups, setExpandedFollowups] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [followupToast, setFollowupToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showFollowupToast = (message: string, type: 'success' | 'info' = 'success') => {
    console.log('Showing toast:', message, type);
    setFollowupToast({ show: true, message, type });
    setTimeout(() => {
      console.log('Hiding toast');
      setFollowupToast({ show: false, message: '', type: 'success' });
    }, 1500);
  };

  const handleFollowupSubmit = async (responseId: string) => {
    if (!followupQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await onFollowupSubmit(responseId, followupQuestion);
      if (result.notificationSent) {
        showFollowupToast('追加質問を送信し、通知も送信されました。', 'success');
      } else {
        showFollowupToast('追加質問を送信しました。（回答者は通知を許可していません）', 'info');
      }
      setFollowupQuestion('');
      setShowFollowupForm(null);
    } catch (error) {
      showFollowupToast('追加質問の送信に失敗しました。', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 1000);
  };

  const toggleFollowupExpand = (responseId: string) => {
    const newExpanded = new Set(expandedFollowups);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedFollowups(newExpanded);
  };

  return (
    <div className="space-y-6 relative">
      {/* 右上トースト通知 */}
      {followupToast.show && (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
          <div className={`${
            followupToast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
          } text-white px-6 py-4 rounded-lg shadow-xl max-w-md border border-white/20`}>
            <p className="text-base font-medium">{followupToast.message}</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        <p className="text-gray-600 mb-4">{survey.description}</p>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-2">アンケートURL</p>
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={surveyUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            />
            <div className="relative">
              <button
                onClick={() => copyToClipboard(surveyUrl)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                コピー
              </button>
              {showCopyToast && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                  <div className="bg-green-600 text-white text-xs px-3 py-2 rounded-md shadow-lg animate-fade-in-up whitespace-nowrap">
                    URLをコピーしました
                    {/* 矢印 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-600"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">回答統計</h2>
        <p className="text-gray-600 mb-4">総回答数: {stats.totalResponses}</p>
        
        <div className="space-y-6">
          {stats.questionsStats.map((questionStat: any) => (
            <div key={questionStat.questionId} className="border-t pt-4">
              <h3 className="font-medium mb-2">{questionStat.text}</h3>
              <p className="text-sm text-gray-600 mb-2">
                回答数: {questionStat.totalAnswers}
              </p>
              
              {questionStat.optionCounts && (
                <div className="space-y-2">
                  {Object.entries(questionStat.optionCounts).map(([option, count]) => (
                    <div key={option} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{option}</span>
                          <span className="text-gray-600">
                            {count as number} ({((count as number / questionStat.totalAnswers) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(count as number / questionStat.totalAnswers) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 回答一覧 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">回答一覧</h2>
        
        {responses.length === 0 ? (
          <p className="text-gray-600">まだ回答がありません。</p>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedResponse(response)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      匿名ID: {response.anonymousId}
                    </p>
                    <p className="text-sm text-gray-600">
                      回答日時: {isClient ? new Date(response.submittedAt).toLocaleString('ja-JP') : '読み込み中...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {response.pushSubscription && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        通知許可
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFollowupForm(response.id);
                      }}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      追加質問
                    </button>
                  </div>
                </div>

                {/* 回答のプレビュー */}
                <div className="text-sm text-gray-700">
                  {response.answers.slice(0, 2).map((answer) => {
                    const question = survey.questions.find(q => q.id === answer.questionId);
                    return (
                      <p key={answer.questionId} className="truncate">
                        {question?.text}: {
                          Array.isArray(answer.value) 
                            ? answer.value.join(', ') 
                            : answer.value
                        }
                      </p>
                    );
                  })}
                  {response.answers.length > 2 && (
                    <p className="text-gray-500">他{response.answers.length - 2}件の回答...</p>
                  )}
                </div>

                {/* フォローアップ履歴 - 折りたたみ式 */}
                {response.followupQuestions && response.followupQuestions.length > 0 && (
                  <div className="mt-4 border border-blue-200 rounded-lg bg-blue-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollowupExpand(response.id);
                      }}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transform transition-transform text-blue-600 ${
                          expandedFollowups.has(response.id) ? 'rotate-90' : ''
                        }`}>
                          ▶
                        </span>
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            フォローアップ質問履歴
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">
                              {response.followupQuestions.length}件
                            </span>
                            <span className="text-xs text-blue-600">
                              {response.followupQuestions.filter(fq => fq.answer).length}件回答済み
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-blue-500">
                        {expandedFollowups.has(response.id) ? '閉じる' : '詳細を見る'}
                      </span>
                    </button>
                    
                    {expandedFollowups.has(response.id) && (
                      <div className="space-y-3 px-3 pt-3 pb-3 bg-white rounded-b-lg border-t border-blue-200">
                        {response.followupQuestions
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map((followup, index) => (
                          <div key={followup.id} className="space-y-2">
                            {/* 質問部分 */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-blue-600">質問 #{index + 1}</span>
                                <span className="text-xs text-gray-500">
                                  {isClient ? new Date(followup.createdAt).toLocaleString('ja-JP') : '読み込み中...'}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-800">{followup.question}</p>
                            </div>

                            {/* 回答部分 */}
                            {followup.answer ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-green-600">回答</span>
                                  <span className="text-xs text-gray-500">
                                    {isClient && followup.answeredAt ? new Date(followup.answeredAt).toLocaleString('ja-JP') : '-'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">{followup.answer}</p>
                              </div>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <span className="text-xs font-medium text-orange-600">未回答</span>
                                <p className="text-sm text-orange-700 mt-1">回答待ちです</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 追加質問フォーム */}
                {showFollowupForm === response.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md" onClick={(e) => e.stopPropagation()}>
                    <h4 className="font-medium mb-2">追加質問を送信</h4>
                    <textarea
                      value={followupQuestion}
                      onChange={(e) => setFollowupQuestion(e.target.value)}
                      placeholder="追加で聞きたいことを入力してください"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleFollowupSubmit(response.id)}
                        disabled={isSubmitting || !followupQuestion.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                      >
                        {isSubmitting ? '送信中...' : '送信'}
                      </button>
                      <button
                        onClick={() => {
                          setShowFollowupForm(null);
                          setFollowupQuestion('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 回答詳細モーダル */}
      {selectedResponse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">回答詳細</h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">匿名ID</p>
                <p className="text-sm text-gray-900">{selectedResponse.anonymousId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">回答日時</p>
                <p className="text-sm text-gray-900">
                  {isClient ? new Date(selectedResponse.submittedAt).toLocaleString('ja-JP') : '読み込み中...'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">回答内容</p>
                <div className="space-y-3">
                  {selectedResponse.answers.map((answer) => {
                    const question = survey.questions.find(q => q.id === answer.questionId);
                    return (
                      <div key={answer.questionId} className="border-l-4 border-gray-200 pl-4">
                        <p className="font-medium text-sm">{question?.text}</p>
                        <p className="text-gray-700 mt-1">
                          {Array.isArray(answer.value) 
                            ? answer.value.join(', ') 
                            : answer.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* フォローアップ質問履歴 */}
              {selectedResponse.followupQuestions && selectedResponse.followupQuestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">フォローアップ質問履歴</p>
                  <div className="space-y-4">
                    {selectedResponse.followupQuestions
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((followup) => (
                      <div key={followup.id} className="border rounded-md p-4 bg-gray-50">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">
                            質問日時: {isClient ? new Date(followup.createdAt).toLocaleString('ja-JP') : '読み込み中...'}
                          </p>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">質問:</p>
                          <p className="text-sm text-gray-900 mt-1">{followup.question}</p>
                        </div>
                        {followup.answer ? (
                          <div>
                            <p className="text-sm font-medium text-green-700">回答:</p>
                            <p className="text-sm text-green-900 mt-1">{followup.answer}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              回答日時: {isClient && followup.answeredAt ? new Date(followup.answeredAt).toLocaleString('ja-JP') : '-'}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-orange-600">
                            <p>未回答</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
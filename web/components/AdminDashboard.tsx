'use client';

import { useState, useEffect } from 'react';
import { Survey, ResponseWithFollowup } from '@/types';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import QRCodeDisplay from './QRCodeDisplay';
import { getAvatarInfo } from '@/lib/utils/avatar';

interface AdminDashboardProps {
  survey: Survey;
  responses: ResponseWithFollowup[];
  stats: any;
  surveyUrl: string;
  onFollowupSubmit: (responseId: string, question: string) => Promise<any>;
  onSendReminder?: (followupQuestionId: string) => Promise<any>;
  isRefreshing?: boolean;
  lastUpdate?: Date | null;
  onRefresh?: () => void;
}

export default function AdminDashboard({
  survey,
  responses,
  stats,
  surveyUrl,
  onFollowupSubmit,
  onSendReminder,
  isRefreshing = false,
  lastUpdate,
  onRefresh,
}: AdminDashboardProps) {
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [followupToast, setFollowupToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [expandedTextAnswers, setExpandedTextAnswers] = useState<Set<string>>(new Set());
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeCopyToast, setQrCodeCopyToast] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Chart.jsの登録
    ChartJS.register(ArcElement, Tooltip, Legend);
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

  const showQRCodeCopyToast = () => {
    setQrCodeCopyToast(true);
    setTimeout(() => setQrCodeCopyToast(false), 1500);
  };


  const toggleTextAnswersExpand = (questionId: string) => {
    const newExpanded = new Set(expandedTextAnswers);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedTextAnswers(newExpanded);
  };

  const toggleResponseExpand = (responseId: string) => {
    const newExpanded = new Set(expandedResponses);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedResponses(newExpanded);
  };

  const expandAllResponses = () => {
    const allResponseIds = new Set(responses.map(response => response.id));
    setExpandedResponses(allResponseIds);
  };

  const collapseAllResponses = () => {
    setExpandedResponses(new Set());
  };

  const handleReminderClick = async (followupId: string) => {
    if (!onSendReminder || sendingReminder) return;
    
    setSendingReminder(followupId);
    
    try {
      await onSendReminder(followupId);
      showFollowupToast('リマインダーを送信しました', 'success');
    } catch (error) {
      console.error('Reminder error:', error);
      showFollowupToast('リマインダーの送信に失敗しました', 'info');
    } finally {
      setSendingReminder(null);
    }
  };

  // 円グラフ用のカラーパレット
  const getChartColors = (count: number) => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ];
    return colors.slice(0, count);
  };

  // 円グラフデータの作成
  const createPieChartData = (optionCounts: Record<string, number>) => {
    const labels = Object.keys(optionCounts);
    const data = Object.values(optionCounts);
    const backgroundColor = getChartColors(labels.length);
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderColor: backgroundColor.map(color => color),
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            return data.labels.map((label: string, index: number) => {
              const value = data.datasets[0].data[index];
              const percentage = ((value / total) * 100).toFixed(1);
              return {
                text: `${label}: ${value}件 (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[index],
                strokeStyle: data.datasets[0].borderColor[index],
                lineWidth: data.datasets[0].borderWidth,
                hidden: false,
                index: index
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}件 (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto">
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
          <div className="flex items-center gap-2 relative mb-4">
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
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center gap-1"
            >
              {showQRCode ? 'QRコード非表示' : 'QRコード表示'}
            </button>
          </div>
          
          {showQRCode && (
            <div className="border-t pt-4">
              <div className="flex justify-center">
                <QRCodeDisplay 
                  url={surveyUrl} 
                  title="アンケート回答用QRコード"
                  size={200}
                  className="max-w-sm"
                />
              </div>
              {qrCodeCopyToast && (
                <div className="fixed top-4 right-4 z-50">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                    QRコードをクリップボードにコピーしました
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム: 統計情報 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">回答統計</h2>
          <p className="text-gray-600 mb-4">総回答数: {stats.totalResponses}</p>
        
        <div className="space-y-6">
          {stats.questionsStats.map((questionStat: any) => {
            const question = survey.questions.find(q => q.id === questionStat.questionId);
            const isChartType = question && (question.type === 'radio' || question.type === 'checkbox');
            const isTextType = question && question.type === 'text';
            
            console.log('Question:', question?.text, 'Type:', question?.type, 'isChartType:', isChartType, 'isTextType:', isTextType);
            
            return (
              <div key={questionStat.questionId} className="border-t pt-4">
                <h3 className="font-medium mb-4">{questionStat.text}</h3>
                
                {/* 円グラフ（ラジオボタン・チェックボックス用） */}
                {isChartType && questionStat.optionCounts && isClient ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div style={{ height: '300px' }}>
                      <Pie 
                        data={createPieChartData(questionStat.optionCounts)} 
                        options={chartOptions}
                      />
                    </div>
                  </div>
                ) : isTextType ? (
                  /* テキスト回答の内容一覧 */
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">回答内容一覧</h4>
                    {(() => {
                      // テキスト回答を取得
                      const textAnswers = responses
                        .map(response => response.answers.find(answer => answer.questionId === questionStat.questionId))
                        .filter(answer => answer && typeof answer.value === 'string' && answer.value.trim())
                        .map(answer => answer!.value as string);
                      
                      const displayAnswers = expandedTextAnswers.has(questionStat.questionId) 
                        ? textAnswers 
                        : textAnswers.slice(0, 5);
                      
                      return (
                        <div className="space-y-2">
                          {displayAnswers.map((answer, index) => (
                            <div key={index} className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-sm text-gray-800">{answer}</p>
                            </div>
                          ))}
                          
                          {textAnswers.length > 5 && (
                            <button
                              onClick={() => toggleTextAnswersExpand(questionStat.questionId)}
                              className="w-full mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors"
                            >
                              {expandedTextAnswers.has(questionStat.questionId) 
                                ? `折りたたむ` 
                                : `他${textAnswers.length - 5}件の回答を表示`}
                            </button>
                          )}
                          
                          {textAnswers.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">回答がありません</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : questionStat.optionCounts ? (
                  /* フォールバック：optionCountsがある場合の表示 */
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {Object.entries(questionStat.optionCounts).map(([option, count]) => (
                        <li key={option} className="flex justify-between">
                          <span>{option}</span>
                          <span className="font-medium">{count as number}件</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
          </div>
        </div>

        {/* 右カラム: 回答一覧 */}
        <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">回答一覧</h2>
          {responses.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllResponses}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
              >
                全て開く
              </button>
              <button
                onClick={collapseAllResponses}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                全て閉じる
              </button>
            </div>
          )}
        </div>
        
        {responses.length === 0 ? (
          <p className="text-gray-600">まだ回答がありません。</p>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleResponseExpand(response.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transform transition-transform text-gray-400 ${
                      expandedResponses.has(response.id) ? 'rotate-90' : ''
                    }`}>
                      ▶
                    </span>
                    {(() => {
                      const avatarInfo = getAvatarInfo(response.anonymousId);
                      return (
                        <>
                          <img 
                            src={avatarInfo.iconPath}
                            alt={`${avatarInfo.name}のアバター`}
                            className="w-8 h-8 rounded-full bg-gray-100 object-cover"
                            onError={(e) => {
                              // 画像が読み込めない場合のフォールバック
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <p className="text-sm font-semibold text-gray-900">
                            {avatarInfo.name}
                          </p>
                        </>
                      );
                    })()}
                    <p className="text-xs text-gray-400">
                      {isClient ? new Date(response.submittedAt).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '読み込み中...'}
                    </p>
                    {response.pushSubscription && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                        通知OK
                      </span>
                    )}
                    {response.followupQuestions && response.followupQuestions.length > 0 && (
                      <>
                        {response.followupQuestions.some(fq => !fq.answer) ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                            回答待ち
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                            回答済み
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFollowupForm(response.id);
                      }}
                      className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      追加質問
                    </button>
                  </div>
                </div>

                {expandedResponses.has(response.id) && (
                  <div className="border-t border-gray-100 p-3 pt-2">
                    <div className="space-y-1.5">
                      {response.answers.map((answer) => {
                        const question = survey.questions.find(q => q.id === answer.questionId);
                        return (
                          <div key={answer.questionId} className="bg-gray-50 rounded p-2">
                            <p className="text-xs font-medium text-gray-600 mb-0.5">{question?.text}</p>
                            <p className="text-xs text-gray-800">
                              {Array.isArray(answer.value) 
                                ? answer.value.join(', ') 
                                : answer.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* フォローアップ履歴 */}
                {expandedResponses.has(response.id) && response.followupQuestions && response.followupQuestions.length > 0 && (
                  <div className="mt-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="p-3 bg-blue-100 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          フォローアップ質問履歴
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">
                            {response.followupQuestions.length}件
                          </span>
                          <span className="text-xs text-blue-600">
                            {response.followupQuestions.filter(fq => fq.answer).length}件回答済み
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-3 bg-white rounded-b-lg">
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
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-xs font-medium text-orange-600">未回答</span>
                                    <p className="text-sm text-orange-700 mt-1">回答待ちです</p>
                                  </div>
                                  {onSendReminder && response.pushSubscription && (
                                    <button
                                      onClick={() => handleReminderClick(followup.id)}
                                      disabled={sendingReminder === followup.id}
                                      className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center gap-1"
                                    >
                                      {sendingReminder === followup.id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-white"></div>
                                          送信中...
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                          </svg>
                                          再通知
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 追加質問フォーム */}
                {expandedResponses.has(response.id) && showFollowupForm === response.id && (
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
      </div>

    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

interface NotificationManagerProps {
  onSubscribe: (subscription: PushSubscription) => void;
  onSkip: () => void;
  onComplete: () => void;
}

export default function NotificationManager({ onSubscribe, onSkip, onComplete }: NotificationManagerProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
    }
  };

  const requestNotificationPermission = async () => {
    setStatus('requesting');
    setError(null);

    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        await registerServiceWorkerAndSubscribe();
      } else if (permission === 'denied') {
        setStatus('denied');
      }
    } catch (err) {
      console.error('Notification permission error:', err);
      setError('通知の許可リクエストに失敗しました');
      setStatus('idle');
    }
  };

  const registerServiceWorkerAndSubscribe = async () => {
    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      await registration.update();

      console.log('Fetching VAPID public key...');
      const response = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await response.json();
      console.log('VAPID public key received:', publicKey);

      console.log('Creating push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log('Push subscription created:', subscription);

      setStatus('granted');
      setSubscription(subscription);
      onSubscribe(subscription);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      setError('通知の設定に失敗しました');
      setStatus('idle');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (status === 'unsupported') {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">通知機能について</h2>
        <p className="text-gray-600 mb-4">
          お使いのブラウザは通知機能をサポートしていません。
          追加質問がある場合は、後日このページをご確認ください。
        </p>
        <button
          onClick={onSkip}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          回答を送信する
        </button>
      </div>
    );
  }

  if (status === 'granted') {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
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
          <h2 className="text-xl font-semibold mb-2">通知設定完了</h2>
          <p className="text-gray-600">
            追加質問がある場合、ブラウザ通知でお知らせします。
          </p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">通知がブロックされています</h2>
        <p className="text-gray-600 mb-4">
          ブラウザの設定で通知がブロックされています。
          追加質問がある場合は、後日このページをご確認ください。
        </p>
        <button
          onClick={onSkip}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          回答を送信する
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">通知を受け取りますか？</h2>
      <p className="text-gray-600 mb-6">
        質問者から追加の質問がある場合、ブラウザ通知でお知らせすることができます。
        匿名性は保たれ、個人情報は一切収集されません。
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={requestNotificationPermission}
          disabled={status === 'requesting'}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'requesting' ? '設定中...' : '通知を許可する'}
        </button>
        <button
          onClick={onSkip}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          通知なしで続ける
        </button>
      </div>
    </div>
  );
}
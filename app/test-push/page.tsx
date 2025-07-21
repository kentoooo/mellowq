'use client';

import { useState, useEffect } from 'react';

export default function TestPushPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [result, setResult] = useState<string>('');
  const [swLogs, setSwLogs] = useState<string>('');

  useEffect(() => {
    // Service Workerからのメッセージを受信
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_STATUS') {
        setSwLogs(prev => prev + `\nService Worker message: ${JSON.stringify(event.data, null, 2)}\n`);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log('VAPID Key:', vapidKey);
      setResult(`Permission request...\nVAPID Key: ${vapidKey ? 'Available' : 'Missing'}`);
      
      const permission = await Notification.requestPermission();
      setResult(prev => prev + `\nPermission: ${permission}`);
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);
        
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
        
        setSubscription(sub);
        setResult(prev => prev + '\nSubscription created successfully');
        setResult(prev => prev + `\nEndpoint: ${sub.endpoint}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setResult(`Error: ${error}`);
    }
  };

  const checkServiceWorker = async () => {
    try {
      setSwLogs('=== SERVICE WORKER CHECK ===\n');
      
      // 基本的なService Worker サポート確認
      setSwLogs(prev => prev + `Service Worker support: ${'serviceWorker' in navigator}\n`);
      setSwLogs(prev => prev + `Push Manager support: ${'PushManager' in window}\n`);
      setSwLogs(prev => prev + `Notification support: ${'Notification' in window}\n`);
      setSwLogs(prev => prev + `Notification permission: ${Notification.permission}\n`);
      
      // Service Worker登録状況
      const registrations = await navigator.serviceWorker.getRegistrations();
      setSwLogs(prev => prev + `Registered Service Workers: ${registrations.length}\n`);
      
      if (registrations.length > 0) {
        registrations.forEach((reg, index) => {
          setSwLogs(prev => prev + `SW ${index}: ${reg.scope} - State: ${reg.active?.state || 'no active'}\n`);
        });
      }
      
      const registration = await navigator.serviceWorker.ready;
      setSwLogs(prev => prev + `Active SW state: ${registration.active?.state}\n`);
      setSwLogs(prev => prev + `Active SW URL: ${registration.active?.scriptURL}\n`);
      
      // Push Manager 確認
      if (registration.pushManager) {
        const subscription = await registration.pushManager.getSubscription();
        setSwLogs(prev => prev + `Existing subscription: ${subscription ? 'Yes' : 'No'}\n`);
      }
      
      // Service Worker にメッセージを送信してテスト
      if (registration.active) {
        registration.active.postMessage({ type: 'TEST_LOG' });
      }
    } catch (error) {
      setSwLogs(prev => prev + `\nService Worker error: ${error}\n`);
    }
  };

  const sendTestPush = async () => {
    if (!subscription) {
      setResult('No subscription available');
      return;
    }

    try {
      // Service Workerのログを有効にする
      console.log('Sending test push notification...');
      setSwLogs('=== SENDING TEST PUSH ===\n');
      
      const response = await fetch('/api/test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      const data = await response.json();
      setResult(prev => prev + '\n\nTest push response:\n' + JSON.stringify(data, null, 2));
      
      // 通知が表示されたかどうかをユーザーに確認
      setTimeout(() => {
        setResult(prev => prev + '\n\n❌ 通知が表示されない場合：\n1. F12でコンソールを開いてService Workerのログを確認\n2. Application > Service Workers で状態を確認\n3. 下記のデバッグ情報を確認');
      }, 2000);
    } catch (error) {
      setResult(prev => prev + '\n\nTest push error: ' + error);
    }
  };

  const sendDirectNotification = () => {
    // ブラウザの通知APIを直接使用してテスト
    if (Notification.permission === 'granted') {
      const notification = new Notification('直接通知テスト', {
        body: 'これは直接送信された通知です',
        icon: '/next.svg'
      });
      setResult(prev => prev + '\n\n直接通知を送信しました');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-purple-600 to-indigo-600"></div>
      
      <div className="relative z-10 container mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Push Notification Test</h1>
      
          <div className="space-y-4">
            <button
              onClick={requestNotificationPermission}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Request Permission & Subscribe
            </button>
            
            <button
              onClick={checkServiceWorker}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Check Service Worker
            </button>
            
            <button
              onClick={sendTestPush}
              disabled={!subscription}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Send Test Push
            </button>
            
            <button
              onClick={sendDirectNotification}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Test Direct Notification
            </button>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">
              {result}
            </pre>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Service Worker Logs:</h2>
            <pre className="bg-gray-200 p-4 rounded whitespace-pre-wrap text-sm">
              {swLogs || 'No logs yet'}
            </pre>
          </div>
          
          {subscription && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Subscription:</h2>
              <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-xs">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
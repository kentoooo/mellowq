self.addEventListener('push', function(event) {
  console.log('=== PUSH EVENT START ===');
  console.log('Push event received:', event);
  console.log('Event data exists:', !!event.data);
  
  if (!event.data) {
    console.log('No data in push event - showing default notification');
    // データがない場合のデフォルト通知
    event.waitUntil(
      self.registration.showNotification('新しい追加質問', {
        body: '追加質問があります。クリックして確認してください。',
        icon: '/next.svg',
        badge: '/next.svg',
      })
    );
    return;
  }

  let data;
  let textData;
  try {
    // まずテキストとして取得してログ出力
    textData = event.data.text();
    console.log('Push data (text):', textData);
    console.log('Text data length:', textData.length);
    console.log('Text data type:', typeof textData);
    console.log('First 100 chars:', textData.substring(0, 100));
    
    // Hexダンプ風に最初の数バイトを表示
    const firstBytes = textData.split('').slice(0, 20).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    console.log('First bytes (hex):', firstBytes);
    
    // DevToolsからのテストメッセージかどうかを確認
    if (textData.includes('DevTools') || textData.includes('からのプッシュ') || textData.includes('をテスト')) {
      console.log('DevTools test message detected');
      data = {
        title: 'DevTools テスト通知',
        body: textData,
        url: '/'
      };
      console.log('DevTools message converted to:', data);
    } else {
      // JSONとして解析を試行
      data = JSON.parse(textData);
      console.log('Push data (parsed successfully):', data);
    }
  } catch (error) {
    console.error('=== JSON PARSE ERROR ===');
    console.error('Failed to parse push data as JSON:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.log('Raw data (textData):', textData);
    console.log('Raw data length:', textData ? textData.length : 'undefined');
    
    // JSONパースに失敗した場合でも通知を表示（デバッグ用）
    data = {
      title: 'プッシュ通知テスト',
      body: textData || 'データを受信しました',
      url: '/'
    };
    console.log('Fallback notification data:', data);
  }
  
  const options = {
    body: data.body || '追加質問があります',
    icon: '/next.svg',
    badge: '/next.svg',
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: '回答する'
      },
      {
        action: 'close',
        title: '後で'
      }
    ]
  };

  console.log('Showing notification with options:', options);

  event.waitUntil(
    self.registration.showNotification(data.title || '新しい追加質問', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

const CACHE_VERSION = 'v1.1';

self.addEventListener('install', function(event) {
  console.log('Service Worker installing, version:', CACHE_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating, version:', CACHE_VERSION);
  event.waitUntil(clients.claim());
});

self.addEventListener('message', function(event) {
  console.log('Service Worker received message:', event.data);
  
  if (event.data?.type === 'TEST_LOG') {
    console.log('=== SERVICE WORKER TEST LOG ===');
    console.log('Service Worker is active and ready');
    console.log('Cache version:', CACHE_VERSION);
    console.log('Current time:', new Date().toISOString());
    
    // メインスレッドに応答を送信
    event.source.postMessage({
      type: 'SW_STATUS',
      status: 'active',
      version: CACHE_VERSION,
      timestamp: new Date().toISOString()
    });
  }
});
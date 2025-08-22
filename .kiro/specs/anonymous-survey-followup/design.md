# 設計書

## 概要

匿名アンケートサービスは、完全にログイン不要で動作し、匿名回答者との双方向コミュニケーションを可能にするWebアプリケーションです。質問作成者は管理用URLを通じてアンケートを管理し、匿名回答者はブラウザ通知を通じて追加質問に応答できます。

## アーキテクチャ

### システム全体構成

```
┌─────────────────────────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│           Vercel Platform           │    │   Push Service  │    │   データベース    │
│                                     │    │                 │    │                 │
│ ┌─────────────────┐ ┌─────────────┐ │───►│ - Web Push API  │    │ - MongoDB       │
│ │  フロントエンド   │ │ API Routes  │ │    │ - VAPID認証     │    │ - Docker Local  │
│ │                 │ │             │ │    │                 │    │                 │
│ │ - Next.js       │ │ - Web Push  │ │    │                 │    │                 │
│ │ - Service Worker│ │ - VAPID Keys│ │    │                 │    │                 │
│ │ - Push API      │ │ - Serverless│ │    │                 │    │                 │
│ └─────────────────┘ └─────────────┘ │    │                 │    │                 │
└─────────────────────────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                        │
                                │                        ▼
                                │              ┌─────────────────┐
                                │              │   ブラウザ通知    │
                                │              │                 │
                                └──────────────│ - バックグラウンド│
                                               │ - オフライン対応  │
                                               └─────────────────┘
```

### URL構造設計

- **アンケート作成**: `/create`
- **アンケート回答**: `/survey/{surveyId}`
- **アンケート管理**: `/manage/{adminToken}`
- **追加質問回答**: `/followup/{responseToken}`

## コンポーネントとインターフェース

### フロントエンドコンポーネント

#### 1. SurveyCreator
- **責務**: アンケート作成フォームの管理
- **主要機能**:
  - 質問タイプ選択（ラジオボタン、チェックリスト、テキストボックス）
  - 選択肢の動的追加・削除
  - アンケートプレビュー機能

#### 2. SurveyRenderer
- **責務**: アンケート回答フォームの表示
- **主要機能**:
  - 質問タイプに応じた入力コンポーネント表示
  - 回答データの検証
  - 匿名ID生成とブラウザ通知許可要求

#### 3. AdminDashboard
- **責務**: アンケート管理画面
- **主要機能**:
  - 回答一覧表示と統計
  - 追加質問作成フォーム
  - 対話履歴の表示

#### 4. FollowupResponse
- **責務**: 追加質問回答画面
- **主要機能**:
  - 元回答と追加質問の表示
  - 追加回答フォーム

#### 5. NotificationManager
- **責務**: Web Push通知の管理
- **主要機能**:
  - 通知許可の要求とPush Subscription生成
  - Service Workerの登録と管理
  - Push通知の受信と処理

#### 6. ServiceWorker
- **責務**: バックグラウンドでのPush通知処理
- **主要機能**:
  - Push通知の受信
  - 通知の表示
  - 通知クリック時のページ遷移

### バックエンドAPI設計

#### Survey API
```typescript
// アンケート作成
POST /api/surveys
{
  title: string;
  description: string;
  questions: Question[];
}
Response: {
  surveyId: string;
  adminToken: string;
  surveyUrl: string;
  adminUrl: string;
}

// アンケート取得
GET /api/surveys/:surveyId
Response: Survey

// 回答送信（Push Subscription含む）
POST /api/surveys/:surveyId/responses
{
  answers: Answer[];
  notificationSubscription?: PushSubscription;
}
Response: {
  responseToken: string;
  message: string;
}
```

#### Admin API
```typescript
// 回答一覧取得
GET /api/admin/:adminToken/responses
Response: Response[]

// 追加質問作成とPush通知送信
POST /api/admin/:adminToken/followup
{
  responseId: string;
  question: string;
}
Response: { 
  success: boolean;
  followupQuestionId: string;
  notificationSent: boolean;
}
```

#### Push Notification API
```typescript
// VAPID公開鍵取得
GET /api/push/vapid-public-key
Response: { publicKey: string }

// Push Subscription保存（レガシー - 現在は回答送信時に統合）
POST /api/push/subscribe
{
  responseId: string;
  subscription: PushSubscription;
}
Response: { success: boolean }
```

#### Followup API
```typescript
// 追加質問取得
GET /api/followup/:responseToken
Response: {
  originalResponse: Response;
  followupQuestions: FollowupQuestion[];
}

// 追加質問回答
POST /api/followup/:responseToken
{
  followupQuestionId: string;
  answer: string;
}
Response: { success: boolean }
```

## データモデル

### Survey（アンケート）
```typescript
interface Survey {
  id: string;
  adminToken: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  expiresAt?: Date;
}
```

### Question（質問）
```typescript
interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'text';
  text: string;
  options?: string[]; // radio, checkboxの場合
  required: boolean;
}
```

### Response（回答）
```typescript
interface Response {
  id: string;
  surveyId: string;
  anonymousId: string;
  responseToken: string;
  answers: Answer[];
  pushSubscription?: PushSubscription;
  submittedAt: Date;
}

interface ResponseWithFollowup extends Response {
  followupQuestions?: FollowupQuestion[];
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
```

### Answer（回答内容）
```typescript
interface Answer {
  questionId: string;
  value: string | string[]; // textの場合string、checkbox複数選択の場合string[]
}
```

### FollowupQuestion（追加質問）
```typescript
interface FollowupQuestion {
  id: string;
  responseId: string;
  question: string;
  answer?: string;
  createdAt: Date;
  answeredAt?: Date;
}
```

## エラーハンドリング

### クライアントサイドエラー
- **ネットワークエラー**: 再試行機能付きエラー表示
- **バリデーションエラー**: フィールド単位のエラー表示
- **通知エラー**: 通知許可失敗時の代替手段提示

### サーバーサイドエラー
- **不正なトークン**: 404エラーとリダイレクト
- **レート制限**: 429エラーと待機時間表示
- **データベースエラー**: 500エラーと再試行案内

### エラーレスポンス形式
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Web Push API実装詳細

### VAPID設定
```javascript
// サーバー側でVAPID鍵ペア生成
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
```

### Service Worker実装
```javascript
// sw.js - Service Worker
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url
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

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### クライアント側Push Subscription
```javascript
// フロントエンド - Push通知登録
async function subscribeToPush(responseId) {
  // Service Worker登録
  const registration = await navigator.serviceWorker.register('/sw.js');
  
  // VAPID公開鍵取得
  const response = await fetch('/api/push/vapid-public-key');
  const { publicKey } = await response.json();
  
  // Push Subscription作成
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
  
  // サーバーに送信
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      responseId,
      subscription
    })
  });
}
```

### Push通知送信
```javascript
// サーバー側 - 通知送信
async function sendPushNotification(subscription, payload) {
  try {
    const payloadString = JSON.stringify(payload);
    const result = await webpush.sendNotification(
      subscription,
      payloadString,
      {
        TTL: 60, // 1分
        urgency: 'high'
      }
    );
    return true;
  } catch (error) {
    console.error('Push notification failed:', error);
    return false;
  }
}

// 追加質問通知の送信
async function sendFollowupNotification(response, question, baseUrl) {
  if (response.pushSubscription) {
    const payload = {
      title: '新しい追加質問があります',
      body: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
      url: `${baseUrl}/followup/${response.responseToken}`
    };
    
    return await sendPushNotification(response.pushSubscription, payload);
  }
  
  return false;
}
```

## テスト戦略

### 単体テスト
- **フロントエンド**: Jest + React Testing Library
- **バックエンド**: Jest + Supertest
- **カバレッジ目標**: 80%以上

### 統合テスト
- **API統合**: Postman/Newman
- **ブラウザ通知**: Playwright
- **データベース**: テスト用MongoDB

### E2Eテスト
- **ユーザーフロー**: Cypress
- **クロスブラウザ**: BrowserStack
- **モバイル対応**: デバイステスト

### テストシナリオ
1. **基本フロー**: アンケート作成→回答→追加質問→追加回答
2. **匿名性テスト**: 個人特定情報の漏洩チェック
3. **Push通知テスト**: 
   - Service Worker登録
   - Push Subscription生成
   - 通知送信・受信
   - 通知クリック動作
4. **セキュリティテスト**: 不正アクセス防止
5. **パフォーマンステスト**: 大量データ処理
6. **ブラウザ互換性テスト**: Chrome、Firefox、Safari、Edge
7. **オフライン通知テスト**: ブラウザ閉じた状態での通知受信
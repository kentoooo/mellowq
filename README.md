# MellowQ - 匿名アンケートサービス

匿名性を保ちながら、質問者と回答者が双方向でコミュニケーションできるアンケートサービスです。

## 特徴

- **完全匿名**: ログイン不要で、個人情報は一切収集しません
- **双方向対話**: 特定の回答に対して追加質問を送ることができます
- **リアルタイム通知**: ブラウザ通知で追加質問をすぐに確認できます
- **簡単作成**: アカウント登録なしですぐにアンケートを作成できます

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- Docker Desktop
- npm または yarn

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd mellowq
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

必要に応じて`.env.local`の値を調整してください。

### 3. MongoDBの起動

**重要**: Docker Desktopが起動していることを確認してから：

```bash
npm run db:up
```

### 4. データベースの初期化

```bash
npm run db:init
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 でアクセスできます。

## データベース管理コマンド

```bash
# MongoDBコンテナを起動
npm run db:up

# MongoDBコンテナを停止
npm run db:down

# MongoDBのログを確認
npm run db:logs

# データベースをリセット（全データ削除）
npm run db:reset

# データベースの初期化
npm run db:init
```

## VAPID鍵の生成

Web Push通知に必要なVAPID鍵を生成：

```bash
npm run generate-vapid
```

生成された鍵を`.env.local`に設定してください。

## プロジェクト構造

```
mellowq/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── create/            # アンケート作成ページ
│   ├── survey/            # アンケート回答ページ
│   ├── manage/            # 管理画面
│   └── followup/          # 追加質問回答ページ
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティとヘルパー
│   ├── db/               # データベース関連
│   └── utils/            # 汎用ユーティリティ
├── types/                # TypeScript型定義
├── public/               # 静的ファイル
└── docker-compose.yml    # MongoDB設定
```

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: MongoDB
- **プッシュ通知**: Web Push API
- **デプロイ**: Vercel
- **開発環境**: Docker

## API エンドポイント

### アンケート
- `POST /api/surveys` - アンケート作成
- `GET /api/surveys/[surveyId]` - アンケート取得

### 回答
- `POST /api/surveys/[surveyId]/responses` - 回答送信

### 管理
- `GET /api/admin/[adminToken]/responses` - 回答一覧取得
- `POST /api/admin/[adminToken]/followup` - 追加質問作成

### 追加質問
- `GET /api/followup/[responseToken]` - 追加質問取得
- `POST /api/followup/[responseToken]` - 追加質問回答

### Web Push
- `GET /api/push/vapid-public-key` - VAPID公開鍵取得
- `POST /api/push/subscribe` - プッシュ通知登録

## 開発時の注意点

1. **MongoDB接続**: Dockerコンテナが起動していることを確認
2. **VAPID鍵**: Web Push通知をテストする場合は必ず設定
3. **HTTPS**: 本番環境ではHTTPS必須（プッシュ通知のため）
4. **セキュリティ**: レート制限とバリデーションが実装済み

## トラブルシューティング

### Dockerが起動しない
- Docker Desktopが起動していることを確認
- `docker --version`でDockerがインストールされていることを確認

### データベース接続エラー
- `npm run db:logs`でMongoDBのログを確認
- `.env.local`のMONGODB_URIが正しいことを確認

### プッシュ通知が動作しない
- VAPID鍵が正しく設定されていることを確認
- HTTPSまたはlocalhostでアクセスしていることを確認

## Vercelへのデプロイ

### 前提条件
1. **MongoDB Atlas アカウント**: 本番環境用のデータベース
2. **Vercel アカウント**: デプロイ用のプラットフォーム

### 1. MongoDB Atlasの設定
1. [MongoDB Atlas](https://cloud.mongodb.com/) でクラスターを作成
2. データベースユーザーを作成
3. ネットワークアクセスで `0.0.0.0/0` を許可（本番では適切に制限）
4. 接続文字列をコピー

### 2. Vercelでのデプロイ
1. GitHubリポジトリをpush
2. [Vercel](https://vercel.com/) でプロジェクトをインポート
3. 環境変数を設定：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mellowq?retryWrites=true&w=majority
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_EMAIL=mailto:your-email@example.com
   ```
4. デプロイ実行

### 3. 本番環境での確認
- HTTPS環境でプッシュ通知が正常に動作することを確認
- アンケート作成から追加質問までの全機能をテスト
# 実装計画（Vercel対応）

-
  1. [ ] Vercel対応プロジェクト基盤の設定
  - Next.jsプロジェクトの作成（App RouterまたはPages Router）
  - 基本的な依存関係のインストール（Next.js、MongoDB、web-push、nanoid）
  - TypeScript設定とESLint/Prettier設定
  - Vercel設定ファイル（vercel.json）の作成
  - _要件: 1.1, 1.4_

-
  2. [ ] MongoDB接続とデータモデルの実装
  - MongoDB接続（Docker Compose使用）
  - Survey、Question、Response、Answer、FollowupQuestionのTypeScript型定義
  - データベース接続とエラーハンドリングのユーティリティ作成
  - 環境変数設定（MONGODB_URI）
  - _要件: 1.4, 2.2, 2.3_

-
  3. [ ] アンケート作成機能の実装
- [ ] 3.1 アンケート作成API Routeの実装
  - /api/surveys POST エンドポイントの作成
  - 一意のsurveyIdとadminTokenの生成機能（nanoid使用）
  - アンケートデータの検証とデータベース保存
  - _要件: 1.1, 1.4, 1.5_

- [ ] 3.2 アンケート作成フロントエンドの実装
  - /create ページの作成
  - SurveyCreatorコンポーネントの作成
  - 質問タイプ選択機能（ラジオボタン、チェックリスト、テキストボックス）
  - 選択肢の動的追加・編集・削除機能
  - アンケートプレビュー機能
  - _要件: 1.1, 1.2, 1.3_

-
  4. [ ] アンケート回答機能の実装
- [ ] 4.1 アンケート表示API Routeの実装
  - /api/surveys/[surveyId] GET エンドポイントの作成
  - アンケートデータの取得と返却
  - 不正なsurveyIdに対するエラーハンドリング
  - _要件: 2.1_

- [ ] 4.2 回答送信API Routeの実装
  - /api/surveys/[surveyId]/responses POST エンドポイントの作成
  - 匿名IDとresponseTokenの生成（nanoid使用）
  - 回答データの検証とデータベース保存
  - _要件: 2.2, 2.3_

- [ ] 4.3 アンケート回答フロントエンドの実装
  - /survey/[surveyId] ページの作成
  - SurveyRendererコンポーネントの作成
  - 質問タイプに応じた入力コンポーネントの表示
  - 回答データの検証機能
  - 回答送信機能
  - _要件: 2.1, 2.2_

-
  5. [ ] Web Push通知システムの実装
- [ ] 5.1 VAPID設定とPush通知基盤の構築
  - VAPID鍵ペアの生成と環境変数設定
  - web-pushライブラリの設定
  - /api/push/vapid-public-key GET エンドポイントの作成
  - _要件: 7.1, 7.2_

- [ ] 5.2 Service Workerの実装
  - public/sw.js Service Workerファイルの作成
  - Push通知受信イベントハンドラーの実装
  - 通知クリックイベントハンドラーの実装
  - Next.js設定でService Worker対応
  - _要件: 7.4_

- [ ] 5.3 クライアント側Push Subscription機能の実装
  - NotificationManagerコンポーネントの作成
  - ブラウザ通知許可要求機能
  - Push Subscription生成機能（回答送信時に統合）
  - Service Worker登録とメッセージハンドリング
  - _要件: 7.1, 7.2_

-
  6. [ ] 管理画面と追加質問機能の実装
- [ ] 6.1 管理画面API Routeの実装
  - /api/admin/[adminToken]/responses GET エンドポイントの作成
  - adminTokenの検証機能
  - 回答一覧と統計情報の取得機能
  - _要件: 6.1, 6.4_

- [ ] 6.2 追加質問作成API Routeの実装
  - /api/admin/[adminToken]/followup POST エンドポイントの作成
  - 追加質問データの保存機能
  - Push通知送信機能の統合（Vercel Serverless対応）
  - _要件: 3.1, 3.2, 3.3_

- [ ] 6.3 管理画面フロントエンドの実装
  - /manage/[adminToken] ページの作成
  - AdminDashboardコンポーネントの作成
  - 回答一覧表示と統計機能
  - 追加質問作成フォーム
  - 対話履歴の表示機能
  - _要件: 3.1, 6.1, 6.2, 6.3_

-
  7. [ ] 追加質問回答機能の実装
- [ ] 7.1 追加質問表示API Routeの実装
  - /api/followup/[responseToken] GET エンドポイントの作成
  - responseTokenの検証機能
  - 元回答と追加質問データの取得機能
  - _要件: 4.3_

- [ ] 7.2 追加質問回答API Routeの実装
  - /api/followup/[responseToken] POST エンドポイントの作成
  - 追加回答データの検証と保存機能
  - 同一匿名IDでの回答関連付け機能
  - _要件: 4.4_

- [ ] 7.3 追加質問回答フロントエンドの実装
  - /followup/[responseToken] ページの作成
  - FollowupResponseコンポーネントの作成
  - 元回答と追加質問の表示機能
  - 追加回答フォーム機能
  - _要件: 4.3, 4.4_

-
  8. [ ] セキュリティとエラーハンドリングの実装
  - Vercel Edge Functions でのレート制限機能の実装
  - 不正なトークンに対するエラーハンドリング
  - データ検証とサニタイゼーション機能
  - セキュアなID生成機能（nanoid使用）
  - _要件: 8.1, 8.2, 8.4, 5.1_

-
  9. [ ] デプロイメント設定
  - vercel.json 設定ファイルの最適化
  - 環境変数の設定（MONGODB_URI、VAPID鍵、VAPID_EMAIL）
  - Service Worker配信設定とキャッシュ制御
  - HTTPS確認とセキュリティヘッダー設定
  - _要件: 全要件のデプロイメント_

-
  10. [ ] テストとVercel最適化
- [ ] 10.1 API Routesの単体テスト
  - 各API Routeのテスト作成（Jest + Next.js Testing）
  - データベース操作のテスト
  - Serverless環境でのエラーハンドリングテスト
  - _要件: 全要件のAPI部分_

- [ ] 10.2 フロントエンドコンポーネントのテスト
  - 各Reactコンポーネントのテスト作成（Jest + React Testing Library）
  - ユーザーインタラクションのテスト
  - Push通知機能のテスト
  - _要件: 全要件のUI部分_

- [ ] 10.3 Vercel環境でのE2Eテスト
  - 基本フロー（アンケート作成→回答→追加質問→追加回答）のテスト
  - Push通知のE2Eテスト（Vercel Preview環境）
  - パフォーマンステスト（Serverless制限確認）
  - _要件: 全要件の統合テスト_

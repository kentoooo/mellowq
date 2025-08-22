# Firebase Push Notifications Setup Guide

このガイドでは、モバイルアプリでFirebaseプッシュ通知を有効にするための設定手順を説明します。

## 前提条件

- Firebaseプロジェクトの作成
- iOS/Androidアプリの登録
- 必要な設定ファイルの配置

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：mellowq-survey）
4. Google Analyticsの設定（任意）
5. プロジェクトを作成

## 2. iOS アプリの設定

### 2.1 iOS アプリの登録

1. Firebase Consoleでプロジェクトを開く
2. 「アプリを追加」→ iOS を選択
3. iOS バンドル ID を入力：`com.mellowq.survey.mobile`
4. アプリのニックネームを入力（任意）
5. App Store ID（省略可）

### 2.2 GoogleService-Info.plist の配置

1. `GoogleService-Info.plist` ファイルをダウンロード
2. Xcodeでプロジェクトを開く：`ios/Runner.xcworkspace`
3. `GoogleService-Info.plist` を `ios/Runner/` ディレクトリに配置
4. Xcodeでファイルをプロジェクトに追加（"Copy items if needed" をチェック）

### 2.3 APNs証明書の設定

1. Apple Developer Centerで APNs Key を作成
2. Firebase Console → プロジェクト設定 → Cloud Messaging タブ
3. iOS アプリの設定で APNs認証キーをアップロード

## 3. Android アプリの設定

### 3.1 Android アプリの登録

1. Firebase Consoleで「アプリを追加」→ Android を選択
2. Android パッケージ名：`com.mellowq.survey.mobile`
3. アプリのニックネーム（任意）
4. デバッグ用署名証明書 SHA-1（省略可）

### 3.2 google-services.json の配置

1. `google-services.json` ファイルをダウンロード
2. ファイルを `android/app/` ディレクトリに配置

## 4. 現在の実装状況

✅ **実装済み機能：**
- Firebase Core/Messaging の依存関係設定
- 通知権限の要求
- フォアグラウンド/バックグラウンド通知の受信
- ローカル通知の表示
- 通知タップでの画面遷移
- デバイストークンの取得
- エラーハンドリングとフォールバック機能

## 5. 通知の送信方法

### 5.1 Firebase Console からの送信

1. Firebase Console → Messaging を開く
2. 「最初のキャンペーンを作成」をクリック
3. 通知の詳細を入力
4. ターゲットを選択（アプリ、トピック、条件など）
5. 配信スケジュールを設定
6. 送信

### 5.2 サーバーからの送信（例）

```javascript
// Node.js + Firebase Admin SDK の例
const admin = require('firebase-admin');

// サービスアカウントキーで初期化
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 追加質問通知の送信
async function sendFollowupNotification(deviceToken, responseToken) {
  const message = {
    notification: {
      title: '新しい追加質問',
      body: 'アンケートに関する追加質問が届いています。'
    },
    data: {
      responseToken: responseToken,
      type: 'followup_question'
    },
    token: deviceToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('通知送信成功:', response);
  } catch (error) {
    console.error('通知送信エラー:', error);
  }
}
```

## 6. トラブルシューティング

### iOS ビルドエラー

```
Include of non-modular header inside framework module
```

**解決方法：** `ios/Podfile` で Firebase モジュールの設定を調整

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
      config.build_settings['DEFINES_MODULE'] = 'YES'
      if target.name == 'firebase_messaging'
        config.build_settings['DEFINES_MODULE'] = 'NO'
      end
    end
  end
end
```

### Android ビルドエラー

Google Services plugin の設定を確認：

```gradle
// android/build.gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}

// android/app/build.gradle
plugins {
    id "com.google.gms.google-services"
}
```

## 7. セキュリティ設定

### 7.1 APNs 本番環境

本番リリース時は以下を確認：
- APNs Production証明書の使用
- Provisioning Profile の設定
- Release build configuration

### 7.2 Firebase セキュリティルール

Firestore のセキュリティルールを適切に設定してください。

## 8. テスト方法

### 8.1 開発中のテスト

```dart
// アプリ内でテスト通知を送信
await NotificationService.simulateFollowupNotification('test_response_token');
```

### 8.2 本番環境のテスト

1. Firebase Console の Messaging から手動送信
2. デバイストークンを使用した個別送信
3. トピック登録によるグループ送信

## 9. 本番運用時の注意点

- デバイストークンの定期更新
- 通知の配信状況の監視
- エラーログの確認
- ユーザーの通知設定の尊重
- 適切な通知頻度の管理

## 10. 関連ファイル

- `lib/services/notification_service.dart` - 通知サービスの実装
- `lib/presentation/widgets/notification_permission_widget.dart` - 権限要求UI
- `ios/Runner/AppDelegate.swift` - iOS側の Firebase 設定
- `android/app/build.gradle` - Android側の設定
- `pubspec.yaml` - 依存関係の定義

## 補足

現在のアプリは Firebase なしでも動作するよう設計されており、設定ファイルが存在しない場合は自動的にモックモードにフォールバックします。本格的な運用には上記の設定が必要です。
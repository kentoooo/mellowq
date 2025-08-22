import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';
import '../presentation/pages/followup_page.dart';

// バックグラウンド通知処理用のトップレベル関数
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase初期化（バックグラウンド処理のため必要）
  await Firebase.initializeApp();
  
  print('バックグラウンドメッセージを受信: ${message.messageId}');
  
  // 必要に応じてローカル通知を表示
  if (message.data.isNotEmpty) {
    await NotificationService._showLocalNotification(
      title: message.notification?.title ?? 'アンケートアプリ',
      body: message.notification?.body ?? '新しい通知があります',
      payload: message.data['responseToken'],
    );
  }
}

class NotificationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Firebase初期化
      await Firebase.initializeApp();
      
      // バックグラウンドメッセージハンドラーの設定
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
      // 通知権限の要求
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      print('通知権限の状態: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        print('ユーザーが通知権限を許可しました');
      } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
        print('ユーザーが仮の通知権限を許可しました');
      } else {
        print('ユーザーが通知権限を拒否しました');
      }

      // ローカル通知の初期化
      await _initializeLocalNotifications();
      
      // フォアグラウンド通知の設定
      await _firebaseMessaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 通知リスナーの設定
      _setupNotificationListeners();

      _initialized = true;
      print('Firebase通知サービスを初期化しました');
    } catch (e) {
      print('Firebase初期化エラー: $e');
      // Firebaseが利用できない場合、モックモードにフォールバック
      print('モックモードで通知サービスを初期化します');
      _initialized = true;
    }
  }

  static Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  static void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null && navigatorKey.currentContext != null) {
      // 追加質問ページに遷移
      Navigator.of(navigatorKey.currentContext!).push(
        MaterialPageRoute(
          builder: (context) => FollowupPage(responseToken: payload),
        ),
      );
    }
  }

  static void _setupNotificationListeners() {
    // フォアグラウンドでの通知受信
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('フォアグラウンドメッセージを受信: ${message.messageId}');
      
      if (message.notification != null) {
        _showLocalNotification(
          title: message.notification!.title ?? 'アンケートアプリ',
          body: message.notification!.body ?? '新しい通知があります',
          payload: message.data['responseToken'],
        );
      }
    });

    // 通知タップでアプリが開かれた場合
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('通知タップでアプリが開かれました: ${message.messageId}');
      
      final responseToken = message.data['responseToken'];
      if (responseToken != null && navigatorKey.currentContext != null) {
        // 少し遅らせてナビゲーション
        Future.delayed(const Duration(milliseconds: 500), () {
          Navigator.of(navigatorKey.currentContext!).push(
            MaterialPageRoute(
              builder: (context) => FollowupPage(responseToken: responseToken),
            ),
          );
        });
      }
    });
  }

  static Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'survey_channel',
      'アンケート通知',
      channelDescription: 'アンケートに関する通知',
      importance: Importance.max,
      priority: Priority.high,
      ticker: 'ticker',
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _localNotifications.show(
      0,
      title,
      body,
      platformChannelSpecifics,
      payload: payload,
    );
  }

  static Future<String?> getDeviceToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print('デバイストークン取得エラー: $e');
      // エラー時はモックトークンを返す
      return 'mock_device_token_${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      print('トピックに登録: $topic');
    } catch (e) {
      print('トピック登録エラー: $e');
    }
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      print('トピックから登録解除: $topic');
    } catch (e) {
      print('トピック登録解除エラー: $e');
    }
  }

  // アプリ起動時の初期通知確認
  static Future<void> checkInitialMessage() async {
    try {
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      
      if (initialMessage != null) {
        print('アプリ起動時の通知: ${initialMessage.messageId}');
        
        final responseToken = initialMessage.data['responseToken'];
        if (responseToken != null && navigatorKey.currentContext != null) {
          // アプリが完全に起動してからナビゲーション
          Future.delayed(const Duration(seconds: 1), () {
            Navigator.of(navigatorKey.currentContext!).push(
              MaterialPageRoute(
                builder: (context) => FollowupPage(responseToken: responseToken),
              ),
            );
          });
        }
      }
    } catch (e) {
      print('初期メッセージ確認エラー: $e');
    }
  }

  // モック実装用：追加質問通知をシミュレート（開発・テスト用）
  static Future<void> simulateFollowupNotification(String responseToken) async {
    await Future.delayed(const Duration(seconds: 2));
    
    await _showLocalNotification(
      title: '新しい追加質問',
      body: 'アンケートに関する追加質問が届いています。',
      payload: responseToken,
    );
  }
}
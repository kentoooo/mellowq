import 'dart:async';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';
import '../presentation/pages/followup_page.dart';

class NotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static Future<void> initialize() async {
    // Firebase初期化
    await Firebase.initializeApp();

    // ローカル通知の初期化
    await _initializeLocalNotifications();

    // 通知権限の要求
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('通知権限が許可されました');

      // デバイストークンの取得
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        print('FCM Token: $token');
        await _saveDeviceToken(token);
      }

      // トークンリフレッシュの監視
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        print('FCM Token refreshed: $newToken');
        _saveDeviceToken(newToken);
      });
    } else {
      print('通知権限が拒否されました');
    }

    // フォアグラウンド通知の設定
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // バックグラウンド通知の設定
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

    // アプリ終了時の通知処理
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // アプリが終了状態から開かれた場合の処理
    RemoteMessage? initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      _handleInitialMessage(initialMessage);
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

  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('フォアグラウンド通知受信: ${message.notification?.title}');

    // ローカル通知として表示
    await _localNotifications.show(
      message.hashCode,
      message.notification?.title,
      message.notification?.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'survey_channel',
          'Survey Notifications',
          channelDescription: 'アンケートに関する通知',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: message.data['responseToken'],
    );
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    print('バックグラウンド通知タップ: ${message.notification?.title}');
    await _navigateToFollowup(message.data['responseToken']);
  }

  static Future<void> _handleInitialMessage(RemoteMessage message) async {
    print('アプリ起動通知: ${message.notification?.title}');
    await _navigateToFollowup(message.data['responseToken']);
  }

  static void _onNotificationTapped(NotificationResponse notificationResponse) {
    final payload = notificationResponse.payload;
    if (payload != null) {
      _navigateToFollowup(payload);
    }
  }

  static Future<void> _navigateToFollowup(String? responseToken) async {
    if (responseToken != null) {
      final context = navigatorKey.currentContext;
      if (context != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => FollowupPage(responseToken: responseToken),
          ),
        );
      }
    }
  }

  static Future<void> _saveDeviceToken(String token) async {
    // SharedPreferencesにトークンを保存
    // 実際の実装では、サーバーにも送信する必要があります
    print('デバイストークンを保存: $token');
  }

  static Future<String?> getDeviceToken() async {
    return await _firebaseMessaging.getToken();
  }

  static Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
}

// バックグラウンドメッセージハンドラー（トップレベル関数である必要があります）
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('バックグラウンド通知受信: ${message.messageId}');

  // 追加質問通知の処理
  if (message.data.containsKey('responseToken')) {
    await _handleFollowupNotification(message.data['responseToken']!);
  }
}

Future<void> _handleFollowupNotification(String responseToken) async {
  // ローカル通知の表示
  final FlutterLocalNotificationsPlugin localNotifications =
      FlutterLocalNotificationsPlugin();

  await localNotifications.show(
    DateTime.now().millisecondsSinceEpoch ~/ 1000,
    '新しい追加質問があります',
    'アンケートに関する追加質問が届いています。',
    const NotificationDetails(
      android: AndroidNotificationDetails(
        'followup_channel',
        'Followup Questions',
        channelDescription: '追加質問の通知',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    ),
    payload: responseToken,
  );
}
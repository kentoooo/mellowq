import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'presentation/pages/home_page.dart';
import 'services/api_client.dart';
import 'services/storage_service.dart';
import 'services/offline_manager.dart';
import 'services/notification_service.dart';

// 初期化エラーを保持するグローバル変数
List<Map<String, String>> initializationErrors = [];

void main() async {
  // まず最小限のアプリを起動
  runApp(const MyApp());

  // 初期化は後から実行
  WidgetsFlutterBinding.ensureInitialized();

  // サービスの初期化（エラーハンドリング付き）
  try {
    APIClient.initialize();
  } catch (e, stack) {
    initializationErrors.add({
      'service': 'APIClient',
      'error': e.toString(),
      'stack': stack.toString(),
    });
    debugPrint('APIClient初期化エラー: $e');
  }

  try {
    await StorageService.database;
  } catch (e, stack) {
    initializationErrors.add({
      'service': 'StorageService',
      'error': e.toString(),
      'stack': stack.toString(),
    });
    debugPrint('StorageService初期化エラー: $e');
  }

  try {
    await NotificationService.initialize();
  } catch (e, stack) {
    initializationErrors.add({
      'service': 'NotificationService',
      'error': e.toString(),
      'stack': stack.toString(),
    });
    debugPrint('NotificationService初期化エラー: $e');
  }

  try {
    await OfflineManager.initialize();
  } catch (e, stack) {
    initializationErrors.add({
      'service': 'OfflineManager',
      'error': e.toString(),
      'stack': stack.toString(),
    });
    debugPrint('OfflineManager初期化エラー: $e');
  }

  // アプリ起動時の通知確認
  try {
    await NotificationService.checkInitialMessage();
  } catch (e, stack) {
    initializationErrors.add({
      'service': 'NotificationService.checkInitialMessage',
      'error': e.toString(),
      'stack': stack.toString(),
    });
    debugPrint('通知確認エラー: $e');
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'アンケートアプリ',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ja', 'JP'),
        Locale('en', 'US'),
      ],
      // 本番環境用: エラーがなければホーム画面、あればエラー画面
      home: initializationErrors.isEmpty
        ? const HomePage()
        : ErrorDisplayPage(errors: initializationErrors),
    );
  }
}

// デバッグ用のシンプルなホーム画面
class DebugHomePage extends StatefulWidget {
  const DebugHomePage({super.key});

  @override
  State<DebugHomePage> createState() => _DebugHomePageState();
}

class _DebugHomePageState extends State<DebugHomePage> {
  String _fcmToken = '取得中...';

  @override
  void initState() {
    super.initState();
    _loadFCMToken();
  }

  Future<void> _loadFCMToken() async {
    try {
      final token = await NotificationService.getDeviceToken();
      setState(() {
        _fcmToken = token ?? 'トークン取得失敗';
      });
      debugPrint('FCMトークン: $token');
    } catch (e) {
      setState(() {
        _fcmToken = 'エラー: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('デバッグ画面'),
        backgroundColor: Colors.green,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, size: 100, color: Colors.green),
            const SizedBox(height: 20),
            const Text(
              'アプリが正常に起動しました！',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FCMトークン:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    SelectableText(
                      _fcmToken,
                      style: const TextStyle(fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (initializationErrors.isEmpty) {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const HomePage()),
                  );
                } else {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ErrorDisplayPage(errors: initializationErrors),
                    ),
                  );
                }
              },
              child: Text(
                initializationErrors.isEmpty
                  ? 'ホーム画面へ'
                  : 'エラー詳細を見る (${initializationErrors.length}件)',
              ),
            ),
            const SizedBox(height: 20),
            Text(
              '初期化エラー: ${initializationErrors.length}件',
              style: TextStyle(
                color: initializationErrors.isEmpty ? Colors.green : Colors.red,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// エラー表示画面
class ErrorDisplayPage extends StatelessWidget {
  final List<Map<String, String>> errors;

  const ErrorDisplayPage({super.key, required this.errors});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('初期化エラー'),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Card(
            color: Colors.red,
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.error, color: Colors.white, size: 48),
                  SizedBox(height: 8),
                  Text(
                    'アプリの初期化中にエラーが発生しました',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ...errors.map((error) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ExpansionTile(
              title: Text(
                error['service'] ?? 'Unknown Service',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                error['error'] ?? 'Unknown Error',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'エラー詳細:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        error['error'] ?? 'Unknown Error',
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'スタックトレース:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(8),
                        color: Colors.grey[200],
                        child: SelectableText(
                          error['stack'] ?? 'No stack trace',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              // エラーを無視してホームページに遷移
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const HomePage()),
              );
            },
            icon: const Icon(Icons.warning),
            label: const Text('エラーを無視して続行'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.all(16),
            ),
          ),
        ],
      ),
    );
  }
}
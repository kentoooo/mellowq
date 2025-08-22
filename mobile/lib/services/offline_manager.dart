import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../data/models/survey_response.dart';
import '../data/models/answer.dart';
import 'api_client.dart';
import 'storage_service.dart';

class OfflineManager {
  static final List<SurveyResponse> _pendingResponses = [];
  static final StreamController<List<SurveyResponse>> _controller =
      StreamController<List<SurveyResponse>>.broadcast();
  static Timer? _syncTimer;

  static Stream<List<SurveyResponse>> get pendingResponsesStream =>
      _controller.stream;
  static List<SurveyResponse> get pendingResponses =>
      List.unmodifiable(_pendingResponses);

  static Future<void> initialize() async {
    // 保存された未送信回答を読み込み
    await _loadPendingResponses();

    // ネットワーク状態の監視
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result != ConnectivityResult.none) {
        syncPendingResponses();
      }
    });

    // 定期的な同期を設定（5分ごと）
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      syncPendingResponses();
    });

    // 初回同期を試行
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult != ConnectivityResult.none) {
      syncPendingResponses();
    }
  }

  static void dispose() {
    _syncTimer?.cancel();
    _controller.close();
  }

  static Future<void> syncPendingResponses() async {
    final responsesToSync = List<SurveyResponse>.from(_pendingResponses);

    for (final pending in responsesToSync) {
      await _syncSingleResponse(pending);
    }
  }

  static Future<void> _syncSingleResponse(SurveyResponse pending) async {
    try {
      final result = await APIClient.submitResponse(
        surveyId: pending.surveyId,
        answers: pending.answers,
      );

      // 送信成功
      await StorageService.markResponseAsSynced(pending.id);
      _pendingResponses.remove(pending);
      _controller.add(_pendingResponses);
      
      print('Response synced successfully: ${pending.id}');
    } catch (e) {
      // リトライカウントをインクリメント
      await StorageService.incrementRetryCount(pending.id);
      
      // 3回失敗したら削除
      final db = await StorageService.database;
      final maps = await db.query(
        'responses',
        where: 'id = ?',
        whereArgs: [pending.id],
      );
      
      if (maps.isNotEmpty && maps.first['retry_count'] as int >= 3) {
        await StorageService.deleteResponse(pending.id);
        _pendingResponses.remove(pending);
        _controller.add(_pendingResponses);
        print('Response removed after 3 failed attempts: ${pending.id}');
      } else {
        print('Response retry scheduled: ${pending.id}');
      }
    }
  }

  static Future<void> _loadPendingResponses() async {
    final unsyncedResponses = await StorageService.getUnsyncedResponses();
    _pendingResponses.clear();
    _pendingResponses.addAll(unsyncedResponses);
    _controller.add(_pendingResponses);
  }

  static Future<bool> hasConnection() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }
}
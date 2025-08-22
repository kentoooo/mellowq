import 'package:flutter/material.dart';
import '../../services/notification_service.dart';

class NotificationPermissionWidget extends StatefulWidget {
  final VoidCallback? onPermissionGranted;
  final VoidCallback? onPermissionDenied;

  const NotificationPermissionWidget({
    Key? key,
    this.onPermissionGranted,
    this.onPermissionDenied,
  }) : super(key: key);

  @override
  State<NotificationPermissionWidget> createState() =>
      _NotificationPermissionWidgetState();
}

class _NotificationPermissionWidgetState
    extends State<NotificationPermissionWidget> {
  bool _isRequesting = false;

  Future<void> _requestPermission() async {
    setState(() {
      _isRequesting = true;
    });

    try {
      // 通知サービスの初期化（権限要求を含む）
      await NotificationService.initialize();
      
      // トークンの取得を試行
      final token = await NotificationService.getDeviceToken();
      
      if (token != null) {
        widget.onPermissionGranted?.call();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('通知が有効になりました'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        widget.onPermissionDenied?.call();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('通知の許可が必要です'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      widget.onPermissionDenied?.call();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('エラーが発生しました: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isRequesting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.notifications_active,
              size: 48,
              color: Colors.blue.shade700,
            ),
            const SizedBox(height: 16),
            Text(
              '通知を有効にしませんか？',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '追加質問があった時に\nプッシュ通知でお知らせします',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isRequesting ? null : () {
                      widget.onPermissionDenied?.call();
                    },
                    child: const Text('後で'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isRequesting ? null : _requestPermission,
                    child: _isRequesting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation(Colors.white),
                            ),
                          )
                        : const Text('許可する'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
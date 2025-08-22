import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'survey_response_page.dart';
import 'history_page.dart';
import '../widgets/notification_permission_widget.dart';
import '../../services/api_client.dart';
import '../../services/notification_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final TextEditingController _urlController = TextEditingController();
  bool _isScanning = false;
  bool _showNotificationPermission = true;

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _requestCameraPermission() async {
    final status = await Permission.camera.request();
    if (status.isDenied || status.isPermanentlyDenied) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('カメラの権限が必要です'),
          action: SnackBarAction(
            label: '設定',
            onPressed: openAppSettings,
          ),
        ),
      );
    }
  }

  void _handleScanResult(String? result) {
    if (result != null && result.isNotEmpty) {
      setState(() {
        _isScanning = false;
      });
      _handleUrl(result);
    }
  }

  void _handleUrl(String url) {
    // URLからサーベイIDを抽出
    final uri = Uri.tryParse(url);
    if (uri == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('無効なURLです')),
      );
      return;
    }

    // サーベイIDの抽出 (例: /survey/123 または /s/123)
    final pathSegments = uri.pathSegments;
    String? surveyId;
    
    if (pathSegments.length >= 2) {
      if (pathSegments[0] == 'survey' || pathSegments[0] == 's') {
        surveyId = pathSegments[1];
      }
    }

    if (surveyId != null) {
      final validSurveyId = surveyId;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => SurveyResponsePage(surveyId: validSurveyId),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('アンケートIDが見つかりません')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('アンケートアプリ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const HistoryPage(),
                ),
              );
            },
          ),
        ],
      ),
      body: _isScanning ? _buildQRScanner() : _buildMainContent(),
    );
  }

  Widget _buildMainContent() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 通知権限要求
            if (_showNotificationPermission)
              NotificationPermissionWidget(
                onPermissionGranted: () {
                  setState(() {
                    _showNotificationPermission = false;
                  });
                },
                onPermissionDenied: () {
                  setState(() {
                    _showNotificationPermission = false;
                  });
                },
              ),
            const SizedBox(height: 24),
          const Icon(
            Icons.qr_code_scanner,
            size: 100,
            color: Colors.blue,
          ),
          const SizedBox(height: 24),
          const Text(
            'アンケートに参加',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'QRコードをスキャンするか、URLを入力してください',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 48),
          ElevatedButton.icon(
            onPressed: () async {
              await _requestCameraPermission();
              final status = await Permission.camera.status;
              if (status.isGranted) {
                setState(() {
                  _isScanning = true;
                });
              }
            },
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('QRコードをスキャン'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'または',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _urlController,
            decoration: InputDecoration(
              hintText: 'アンケートURLを入力',
              prefixIcon: const Icon(Icons.link),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              suffixIcon: IconButton(
                icon: const Icon(Icons.arrow_forward),
                onPressed: () {
                  if (_urlController.text.isNotEmpty) {
                    _handleUrl(_urlController.text);
                  }
                },
              ),
            ),
            onSubmitted: (value) {
              if (value.isNotEmpty) {
                _handleUrl(value);
              }
            },
          ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRScanner() {
    return Stack(
      children: [
        MobileScanner(
          onDetect: (capture) {
            final List<Barcode> barcodes = capture.barcodes;
            for (final barcode in barcodes) {
              if (barcode.rawValue != null) {
                _handleScanResult(barcode.rawValue);
                break;
              }
            }
          },
        ),
        Positioned(
          top: 50,
          left: 0,
          right: 0,
          child: Container(
            color: Colors.black54,
            padding: const EdgeInsets.all(16),
            child: const Text(
              'QRコードをカメラに向けてください',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        Positioned(
          bottom: 50,
          left: 0,
          right: 0,
          child: Center(
            child: ElevatedButton(
              onPressed: () {
                setState(() {
                  _isScanning = false;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
              ),
              child: const Text('キャンセル'),
            ),
          ),
        ),
      ],
    );
  }
}
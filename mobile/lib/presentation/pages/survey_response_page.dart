import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../data/models/survey.dart';
import '../../data/models/question.dart';
import '../../data/models/answer.dart';
import '../../data/models/survey_response.dart';
import '../../services/api_client.dart';
import '../../services/storage_service.dart';
import '../../services/notification_service.dart';
import '../widgets/question_widget.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class SurveyResponsePage extends StatefulWidget {
  final String surveyId;

  const SurveyResponsePage({Key? key, required this.surveyId})
      : super(key: key);

  @override
  State<SurveyResponsePage> createState() => _SurveyResponsePageState();
}

class _SurveyResponsePageState extends State<SurveyResponsePage> {
  Survey? _survey;
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;
  final Map<String, dynamic> _answers = {};
  double _progress = 0.0;

  @override
  void initState() {
    super.initState();
    _loadSurvey();
  }

  Future<void> _loadSurvey() async {
    try {
      final survey = await APIClient.fetchSurvey(widget.surveyId);
      setState(() {
        _survey = survey;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _updateAnswer(String questionId, dynamic value) {
    setState(() {
      if (value == null || (value is String && value.isEmpty) ||
          (value is List && value.isEmpty)) {
        _answers.remove(questionId);
      } else {
        _answers[questionId] = value;
      }
      _updateProgress();
    });
  }

  void _updateProgress() {
    if (_survey == null) return;
    
    int answeredCount = 0;
    for (final question in _survey!.questions) {
      if (_answers.containsKey(question.id)) {
        answeredCount++;
      }
    }
    
    setState(() {
      _progress = answeredCount / _survey!.questions.length;
    });
  }

  bool _isValid() {
    if (_survey == null) return false;
    
    for (final question in _survey!.questions) {
      if (question.required && !_answers.containsKey(question.id)) {
        return false;
      }
    }
    return true;
  }

  Future<void> _submitResponse() async {
    if (!_isValid()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('必須項目を入力してください')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      // 回答データの準備
      final answers = <Answer>[];
      _answers.forEach((questionId, value) {
        answers.add(Answer(questionId: questionId, value: value));
      });

      // 匿名IDの生成
      final anonymousId = const Uuid().v4();

      // ネットワーク状態の確認
      final connectivityResult = await Connectivity().checkConnectivity();
      
      if (connectivityResult == ConnectivityResult.none) {
        // オフライン時はローカルに保存
        final response = SurveyResponse(
          id: const Uuid().v4(),
          surveyId: widget.surveyId,
          anonymousId: anonymousId,
          answers: answers,
          submittedAt: DateTime.now(),
          isSynced: false,
        );
        
        await StorageService.saveResponse(response);
        
        if (!mounted) return;
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('オフラインモード：回答を保存しました。接続時に自動送信されます。'),
          ),
        );
      } else {
        // デバイストークンの取得
        final deviceToken = await NotificationService.getDeviceToken();
        
        // オンライン時はAPIに送信
        final result = await APIClient.submitResponse(
          surveyId: widget.surveyId,
          answers: answers,
          deviceToken: deviceToken,
        );

        // レスポンスの保存
        final response = SurveyResponse(
          id: result['_id'] ?? const Uuid().v4(),
          surveyId: widget.surveyId,
          anonymousId: anonymousId,
          responseToken: result['responseToken'],
          answers: answers,
          submittedAt: DateTime.now(),
          isSynced: true,
        );
        
        await StorageService.saveResponse(response);
        
        if (!mounted) return;
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('回答を送信しました')),
        );
      }

      Navigator.pop(context);
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('送信エラー: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('読み込み中...')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('エラー')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _error = null;
                  });
                  _loadSurvey();
                },
                child: const Text('再試行'),
              ),
            ],
          ),
        ),
      );
    }

    if (_survey == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('エラー')),
        body: const Center(child: Text('アンケートが見つかりません')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_survey!.title),
        actions: [
          if (!_isSubmitting)
            TextButton(
              onPressed: _isValid() ? _submitResponse : null,
              child: const Text(
                '送信',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          LinearProgressIndicator(value: _progress),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _survey!.description,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 24),
                  ..._survey!.questions.map((question) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: QuestionWidget(
                        question: question,
                        answer: _answers[question.id],
                        onAnswerChanged: (value) {
                          _updateAnswer(question.id, value);
                        },
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSubmitting || !_isValid()
                          ? null
                          : _submitResponse,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              '回答を送信',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
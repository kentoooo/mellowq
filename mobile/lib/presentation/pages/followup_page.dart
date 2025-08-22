import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/followup_question.dart';
import '../../data/models/survey_response.dart';
import '../../services/api_client.dart';
import '../../services/storage_service.dart';

class FollowupPage extends StatefulWidget {
  final String responseToken;

  const FollowupPage({Key? key, required this.responseToken}) : super(key: key);

  @override
  State<FollowupPage> createState() => _FollowupPageState();
}

class _FollowupPageState extends State<FollowupPage> {
  List<FollowupQuestion> _followupQuestions = [];
  SurveyResponse? _originalResponse;
  bool _isLoading = true;
  String? _error;
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _loadFollowupData();
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadFollowupData() async {
    try {
      // APIから追加質問データを取得
      final data = await APIClient.fetchFollowupQuestions(widget.responseToken);
      
      // 元の回答データの取得
      if (data['originalResponse'] != null) {
        _originalResponse = SurveyResponse.fromJson(data['originalResponse']);
      }
      
      // 追加質問の取得
      if (data['followupQuestions'] != null) {
        _followupQuestions = (data['followupQuestions'] as List)
            .map((q) => FollowupQuestion.fromJson(q))
            .toList();
      }

      // 各質問にコントローラーを設定
      for (final question in _followupQuestions) {
        _controllers[question.id] = TextEditingController(
          text: question.answer ?? '',
        );
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _submitAnswer(String questionId, String answer) async {
    try {
      await APIClient.submitFollowupAnswer(
        responseToken: widget.responseToken,
        questionId: questionId,
        answer: answer,
      );

      // ローカルストレージの更新
      final questionIndex = _followupQuestions.indexWhere((q) => q.id == questionId);
      if (questionIndex != -1) {
        final updatedQuestion = _followupQuestions[questionIndex].copyWith(
          answer: answer,
          answeredAt: DateTime.now(),
        );
        
        _followupQuestions[questionIndex] = updatedQuestion;
        await StorageService.saveFollowupQuestion(updatedQuestion);
        
        setState(() {});
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('回答を送信しました')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('送信エラー: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('追加質問')),
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
                  _loadFollowupData();
                },
                child: const Text('再試行'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('追加質問'),
        backgroundColor: Colors.orange.shade100,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 元の回答表示
            if (_originalResponse != null) ...[
              Card(
                color: Colors.blue.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.history, color: Colors.blue.shade700),
                          const SizedBox(width: 8),
                          Text(
                            '元の回答',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        DateFormat('yyyy/MM/dd HH:mm')
                            .format(_originalResponse!.submittedAt),
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._originalResponse!.answers.map((answer) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(
                            '${answer.questionId}: ${answer.value}',
                            style: const TextStyle(fontSize: 14),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // 追加質問リスト
            Text(
              '追加質問',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),

            if (_followupQuestions.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.quiz_outlined,
                      size: 64,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '追加質問はありません',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              )
            else
              ..._followupQuestions.map((question) {
                final isAnswered = question.isAnswered;
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  color: isAnswered ? Colors.green.shade50 : Colors.orange.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              isAnswered ? Icons.check_circle : Icons.help_outline,
                              color: isAnswered ? Colors.green : Colors.orange,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                question.question,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          DateFormat('yyyy/MM/dd HH:mm')
                              .format(question.createdAt),
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                        if (isAnswered) ...[
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.green.shade200),
                            ),
                            child: Text(
                              question.answer!,
                              style: const TextStyle(fontSize: 14),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '回答日時: ${DateFormat('yyyy/MM/dd HH:mm').format(question.answeredAt!)}',
                            style: TextStyle(
                              color: Colors.green.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ] else ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: _controllers[question.id],
                            decoration: InputDecoration(
                              hintText: '回答を入力してください',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                final answer = _controllers[question.id]?.text ?? '';
                                if (answer.isNotEmpty) {
                                  _submitAnswer(question.id, answer);
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.all(12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('回答を送信'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
          ],
        ),
      ),
    );
  }
}
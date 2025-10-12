import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../data/models/survey_response.dart';
import '../../data/models/survey.dart';
import '../../data/models/question.dart';
import '../../data/models/answer.dart';
import '../../services/api_client.dart';
import '../../services/storage_service.dart';

class ResponseDetailPage extends StatefulWidget {
  final SurveyResponse response;

  const ResponseDetailPage({
    Key? key,
    required this.response,
  }) : super(key: key);

  @override
  State<ResponseDetailPage> createState() => _ResponseDetailPageState();
}

class _ResponseDetailPageState extends State<ResponseDetailPage>
    with SingleTickerProviderStateMixin {
  Survey? _survey;
  bool _isLoading = false; // 最初からfalseに
  String? _error;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));
    
    // アニメーションを即座に開始
    _animationController.forward();
    
    // バックグラウンドで詳細を取得（UIブロックしない）
    _loadSurveyDetails();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadSurveyDetails() async {
    try {
      final survey = await APIClient.fetchSurvey(widget.response.surveyId);
      if (mounted) {
        setState(() {
          _survey = survey;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    }
  }

  String _getAnswerDisplay(Question? question, dynamic answerValue) {
    if (answerValue == null) return '未回答';

    if (question == null) {
      // 質問情報が取得できない場合は値をそのまま表示
      if (answerValue is List) {
        return answerValue.join(', ');
      }
      return answerValue.toString();
    }

    switch (question.type) {
      case QuestionType.text:
      case QuestionType.textarea:
        return answerValue.toString();
      case QuestionType.radio:
      case QuestionType.select:
        final option = question.options?.firstWhere(
          (opt) => opt.value == answerValue,
          orElse: () => QuestionOption(
            value: answerValue.toString(),
            label: answerValue.toString(),
          ),
        );
        return option?.label ?? answerValue.toString();
      case QuestionType.checkbox:
        if (answerValue is List) {
          final selectedLabels = answerValue.map((value) {
            final option = question.options?.firstWhere(
              (opt) => opt.value == value,
              orElse: () => QuestionOption(
                value: value.toString(),
                label: value.toString(),
              ),
            );
            return option?.label ?? value.toString();
          }).toList();
          return selectedLabels.join(', ');
        }
        return answerValue.toString();
      case QuestionType.date:
        try {
          final date = DateTime.parse(answerValue.toString());
          return DateFormat('yyyy年MM月dd日').format(date);
        } catch (e) {
          return answerValue.toString();
        }
      case QuestionType.number:
      case QuestionType.slider:
        return answerValue.toString();
      default:
        return answerValue.toString();
    }
  }

  Future<void> _syncResponse() async {
    final colorScheme = Theme.of(context).colorScheme;
    
    if (widget.response.isSynced) {
      HapticFeedback.lightImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('この回答は既に送信済みです'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticFeedback.mediumImpact();
    
    try {
      final deviceToken = await StorageService.getDeviceToken();
      
      final result = await APIClient.submitResponse(
        surveyId: widget.response.surveyId,
        answers: widget.response.answers,
        deviceToken: deviceToken,
      );

      final updatedResponse = SurveyResponse(
        id: widget.response.id,
        surveyId: widget.response.surveyId,
        anonymousId: widget.response.anonymousId,
        responseToken: result['responseToken'],
        answers: widget.response.answers,
        submittedAt: widget.response.submittedAt,
        isSynced: true,
      );
      
      await StorageService.updateResponse(updatedResponse);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('回答を送信しました'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('送信エラー: ${e.toString()}'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final dateFormat = DateFormat('yyyy年MM月dd日 HH:mm');

    // 即座に表示、データは後から更新される

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: colorScheme.surface,
            surfaceTintColor: colorScheme.surfaceTint,
            flexibleSpace: FlexibleSpaceBar(
              title: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Image.asset(
                  'assets/images/logo.png',
                  height: 40,
                  fit: BoxFit.contain,
                ),
              ),
              centerTitle: true,
              titlePadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      colorScheme.primaryContainer,
                      colorScheme.secondaryContainer,
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              if (!widget.response.isSynced)
                IconButton(
                  icon: const Icon(Icons.cloud_upload),
                  onPressed: _syncResponse,
                  tooltip: '送信',
                ),
            ],
          ),
          SliverToBoxAdapter(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // アンケート情報カード
                      Card(
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: colorScheme.primaryContainer,
                                    child: Icon(
                                      Icons.assignment,
                                      color: colorScheme.onPrimaryContainer,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _survey?.title ?? 'アンケート回答',
                                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        if (_survey?.description?.isNotEmpty == true)
                                          Text(
                                            _survey!.description,
                                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: colorScheme.onSurfaceVariant,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Divider(color: colorScheme.outline.withOpacity(0.3)),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time,
                                    size: 16,
                                    color: colorScheme.onSurfaceVariant,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '回答日時: ${dateFormat.format(widget.response.submittedAt)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    widget.response.isSynced ? Icons.cloud_done : Icons.cloud_off,
                                    size: 16,
                                    color: widget.response.isSynced
                                        ? colorScheme.tertiary
                                        : colorScheme.error,
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: widget.response.isSynced
                                          ? colorScheme.tertiaryContainer
                                          : colorScheme.errorContainer,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      widget.response.isSynced ? '送信済み' : '未送信',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: widget.response.isSynced
                                            ? colorScheme.onTertiaryContainer
                                            : colorScheme.onErrorContainer,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // 回答セクションヘッダー
                      Card(
                        elevation: 0,
                        color: colorScheme.primaryContainer.withOpacity(0.7),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Icon(
                                Icons.quiz,
                                color: colorScheme.onPrimaryContainer,
                                size: 24,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'あなたの回答',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: colorScheme.onPrimaryContainer,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: colorScheme.onPrimaryContainer.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '${widget.response.answers.length}件',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: colorScheme.onPrimaryContainer,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 8),
                      
                      // 各質問と回答
                      ...widget.response.answers.asMap().entries.map((entry) {
                        final index = entry.key;
                        final answer = entry.value;
                        
                        // アンケート詳細があれば対応する質問を探す
                        Question? question;
                        if (_survey != null) {
                          try {
                            question = _survey!.questions.firstWhere(
                              (q) => q.id == answer.questionId,
                            );
                          } catch (e) {
                            // 質問が見つからない場合はnullのまま
                            question = null;
                          }
                        }
                        
                        return Card(
                          elevation: 1,
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: colorScheme.primaryContainer,
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Center(
                                        child: Text(
                                          'Q${index + 1}',
                                          style: TextStyle(
                                            color: colorScheme.onPrimaryContainer,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  question?.text ?? '質問 ${index + 1}',
                                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                              if (question?.required == true)
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                    horizontal: 6,
                                                    vertical: 2,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: colorScheme.errorContainer,
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Text(
                                                    '必須',
                                                    style: TextStyle(
                                                      color: colorScheme.onErrorContainer,
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.w600,
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: answer.value != null
                                        ? colorScheme.tertiaryContainer.withOpacity(0.5)
                                        : colorScheme.surfaceVariant.withOpacity(0.5),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        answer.value != null
                                            ? Icons.check_circle
                                            : Icons.radio_button_unchecked,
                                        size: 18,
                                        color: answer.value != null
                                            ? colorScheme.tertiary
                                            : colorScheme.onSurfaceVariant,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _getAnswerDisplay(question, answer.value),
                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: answer.value != null
                                                ? colorScheme.onSurface
                                                : colorScheme.onSurfaceVariant,
                                            fontStyle: answer.value == null
                                                ? FontStyle.italic
                                                : FontStyle.normal,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                      
                      const SizedBox(height: 24),
                      
                      // 送信ボタン（未送信の場合）
                      if (!widget.response.isSynced)
                        Card(
                          elevation: 0,
                          color: colorScheme.secondaryContainer.withOpacity(0.5),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.info_outline,
                                      color: colorScheme.onSecondaryContainer,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        'この回答はまだ送信されていません',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: colorScheme.onSecondaryContainer,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: _syncResponse,
                                    icon: const Icon(Icons.cloud_upload),
                                    label: const Text('送信する'),
                                    style: FilledButton.styleFrom(
                                      minimumSize: const Size(double.infinity, 48),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
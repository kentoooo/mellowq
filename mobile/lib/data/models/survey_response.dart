import 'dart:convert';
import 'package:equatable/equatable.dart';
import 'answer.dart';
import 'followup_question.dart';

class SurveyResponse extends Equatable {
  final String id;
  final String surveyId;
  final String anonymousId;
  final String? responseToken;
  final List<Answer> answers;
  final DateTime submittedAt;
  final List<FollowupQuestion>? followupQuestions;
  final bool isSynced;

  const SurveyResponse({
    required this.id,
    required this.surveyId,
    required this.anonymousId,
    this.responseToken,
    required this.answers,
    required this.submittedAt,
    this.followupQuestions,
    this.isSynced = false,
  });

  factory SurveyResponse.fromJson(Map<String, dynamic> json) {
    return SurveyResponse(
      id: json['_id'] ?? json['id'] ?? '',
      surveyId: json['surveyId'] ?? '',
      anonymousId: json['anonymousId'] ?? '',
      responseToken: json['responseToken'],
      answers: (json['answers'] as List? ?? [])
          .map((a) => Answer.fromJson(a))
          .toList(),
      submittedAt: json['submittedAt'] != null
          ? DateTime.parse(json['submittedAt'])
          : DateTime.now(),
      followupQuestions: json['followupQuestions'] != null
          ? (json['followupQuestions'] as List)
              .map((fq) => FollowupQuestion.fromJson(fq))
              .toList()
          : null,
      isSynced: json['isSynced'] ?? false,
    );
  }

  factory SurveyResponse.fromMap(Map<String, dynamic> map) {
    return SurveyResponse(
      id: map['id'],
      surveyId: map['survey_id'],
      anonymousId: map['anonymous_id'],
      responseToken: map['response_token'],
      answers: (jsonDecode(map['answers']) as List)
          .map((a) => Answer.fromJson(a))
          .toList(),
      submittedAt: DateTime.fromMillisecondsSinceEpoch(map['submitted_at']),
      isSynced: map['is_synced'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'surveyId': surveyId,
      'anonymousId': anonymousId,
      'responseToken': responseToken,
      'answers': answers.map((a) => a.toJson()).toList(),
      'submittedAt': submittedAt.toIso8601String(),
      'followupQuestions': followupQuestions?.map((fq) => fq.toJson()).toList(),
      'isSynced': isSynced,
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'survey_id': surveyId,
      'anonymous_id': anonymousId,
      'response_token': responseToken,
      'answers': jsonEncode(answers.map((a) => a.toJson()).toList()),
      'submitted_at': submittedAt.millisecondsSinceEpoch,
      'is_synced': isSynced ? 1 : 0,
    };
  }

  SurveyResponse copyWith({
    String? id,
    String? surveyId,
    String? anonymousId,
    String? responseToken,
    List<Answer>? answers,
    DateTime? submittedAt,
    List<FollowupQuestion>? followupQuestions,
    bool? isSynced,
  }) {
    return SurveyResponse(
      id: id ?? this.id,
      surveyId: surveyId ?? this.surveyId,
      anonymousId: anonymousId ?? this.anonymousId,
      responseToken: responseToken ?? this.responseToken,
      answers: answers ?? this.answers,
      submittedAt: submittedAt ?? this.submittedAt,
      followupQuestions: followupQuestions ?? this.followupQuestions,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  @override
  List<Object?> get props => [
        id,
        surveyId,
        anonymousId,
        responseToken,
        answers,
        submittedAt,
        followupQuestions,
        isSynced,
      ];
}
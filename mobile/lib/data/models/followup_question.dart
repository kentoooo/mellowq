import 'package:equatable/equatable.dart';

class FollowupQuestion extends Equatable {
  final String id;
  final String responseId;
  final String question;
  final String? answer;
  final DateTime createdAt;
  final DateTime? answeredAt;

  const FollowupQuestion({
    required this.id,
    required this.responseId,
    required this.question,
    this.answer,
    required this.createdAt,
    this.answeredAt,
  });

  factory FollowupQuestion.fromJson(Map<String, dynamic> json) {
    return FollowupQuestion(
      id: json['_id'] ?? json['id'] ?? '',
      responseId: json['responseId'] ?? '',
      question: json['question'] ?? '',
      answer: json['answer'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      answeredAt: json['answeredAt'] != null
          ? DateTime.parse(json['answeredAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'responseId': responseId,
      'question': question,
      'answer': answer,
      'createdAt': createdAt.toIso8601String(),
      'answeredAt': answeredAt?.toIso8601String(),
    };
  }

  FollowupQuestion copyWith({
    String? id,
    String? responseId,
    String? question,
    String? answer,
    DateTime? createdAt,
    DateTime? answeredAt,
  }) {
    return FollowupQuestion(
      id: id ?? this.id,
      responseId: responseId ?? this.responseId,
      question: question ?? this.question,
      answer: answer ?? this.answer,
      createdAt: createdAt ?? this.createdAt,
      answeredAt: answeredAt ?? this.answeredAt,
    );
  }

  bool get isAnswered => answer != null && answer!.isNotEmpty;

  @override
  List<Object?> get props =>
      [id, responseId, question, answer, createdAt, answeredAt];
}
import 'package:equatable/equatable.dart';
import 'question.dart';

class Survey extends Equatable {
  final String id;
  final String title;
  final String description;
  final List<Question> questions;
  final DateTime createdAt;
  final bool allowAnonymous;

  const Survey({
    required this.id,
    required this.title,
    required this.description,
    required this.questions,
    required this.createdAt,
    this.allowAnonymous = true,
  });

  factory Survey.fromJson(Map<String, dynamic> json) {
    return Survey(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      questions: (json['questions'] as List? ?? [])
          .map((q) => Question.fromJson(q))
          .toList(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      allowAnonymous: json['allowAnonymous'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'questions': questions.map((q) => q.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'allowAnonymous': allowAnonymous,
    };
  }

  Survey copyWith({
    String? id,
    String? title,
    String? description,
    List<Question>? questions,
    DateTime? createdAt,
    bool? allowAnonymous,
  }) {
    return Survey(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      questions: questions ?? this.questions,
      createdAt: createdAt ?? this.createdAt,
      allowAnonymous: allowAnonymous ?? this.allowAnonymous,
    );
  }

  @override
  List<Object?> get props => [id, title, description, questions, createdAt, allowAnonymous];
}
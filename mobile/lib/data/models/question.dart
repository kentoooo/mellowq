import 'package:equatable/equatable.dart';

enum QuestionType {
  radio,
  checkbox,
  text,
}

class Question extends Equatable {
  final String id;
  final QuestionType type;
  final String text;
  final List<String>? options;
  final bool required;
  final int? order;

  const Question({
    required this.id,
    required this.type,
    required this.text,
    this.options,
    required this.required,
    this.order,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? '',
      type: _parseQuestionType(json['type']),
      text: json['text'] ?? '',
      options: json['options'] != null
          ? List<String>.from(json['options'])
          : null,
      required: json['required'] ?? false,
      order: json['order'],
    );
  }

  static QuestionType _parseQuestionType(String? type) {
    switch (type?.toLowerCase()) {
      case 'radio':
        return QuestionType.radio;
      case 'checkbox':
        return QuestionType.checkbox;
      case 'text':
        return QuestionType.text;
      default:
        return QuestionType.text;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.').last,
      'text': text,
      if (options != null) 'options': options,
      'required': required,
      if (order != null) 'order': order,
    };
  }

  String get displayType {
    switch (type) {
      case QuestionType.radio:
        return '単一選択';
      case QuestionType.checkbox:
        return '複数選択';
      case QuestionType.text:
        return '自由記述';
    }
  }

  @override
  List<Object?> get props => [id, type, text, options, required, order];
}
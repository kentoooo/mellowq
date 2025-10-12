import 'package:equatable/equatable.dart';

enum QuestionType {
  radio,
  checkbox,
  text,
  textarea,
  number,
  date,
  select,
  slider,
}

class QuestionOption {
  final String value;
  final String label;

  QuestionOption({
    required this.value,
    required this.label,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      value: json['value'] ?? '',
      label: json['label'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'value': value,
      'label': label,
    };
  }
}

class Question extends Equatable {
  final String id;
  final QuestionType type;
  final String text;
  final List<QuestionOption>? options;
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
          ? (json['options'] as List).map((opt) {
              if (opt is String) {
                return QuestionOption(value: opt, label: opt);
              } else if (opt is Map<String, dynamic>) {
                return QuestionOption.fromJson(opt);
              }
              return QuestionOption(value: opt.toString(), label: opt.toString());
            }).toList()
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
      case 'textarea':
        return QuestionType.textarea;
      case 'number':
        return QuestionType.number;
      case 'date':
        return QuestionType.date;
      case 'select':
        return QuestionType.select;
      case 'slider':
        return QuestionType.slider;
      default:
        return QuestionType.text;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.').last,
      'text': text,
      if (options != null) 'options': options?.map((opt) => opt.toJson()).toList(),
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
      case QuestionType.textarea:
        return '長文記述';
      case QuestionType.number:
        return '数値';
      case QuestionType.date:
        return '日付';
      case QuestionType.select:
        return 'ドロップダウン';
      case QuestionType.slider:
        return 'スライダー';
    }
  }

  @override
  List<Object?> get props => [id, type, text, options, required, order];
}
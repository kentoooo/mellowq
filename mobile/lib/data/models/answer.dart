import 'package:equatable/equatable.dart';

class Answer extends Equatable {
  final String questionId;
  final dynamic value; // String or List<String>

  const Answer({
    required this.questionId,
    this.value,
  });

  factory Answer.fromJson(Map<String, dynamic> json) {
    return Answer(
      questionId: json['questionId'] ?? '',
      value: json['value'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'value': value,
    };
  }

  // 単一選択用コンストラクタ
  Answer.single(this.questionId, String singleValue) : value = singleValue;

  // 複数選択用コンストラクタ
  Answer.multiple(this.questionId, List<String> multipleValues)
      : value = multipleValues;

  // テキスト用コンストラクタ
  Answer.text(this.questionId, String textValue) : value = textValue;

  // 値の型チェック
  bool get isSingle => value is String;
  bool get isMultiple => value is List<String>;

  String? get singleValue => value is String ? value as String : null;
  List<String>? get multipleValues =>
      value is List ? List<String>.from(value) : null;

  @override
  List<Object?> get props => [questionId, value];
}
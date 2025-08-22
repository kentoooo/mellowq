import 'package:flutter/material.dart';
import '../../data/models/question.dart';

class QuestionWidget extends StatelessWidget {
  final Question question;
  final dynamic answer;
  final Function(dynamic) onAnswerChanged;

  const QuestionWidget({
    Key? key,
    required this.question,
    required this.answer,
    required this.onAnswerChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    question.text,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                if (question.required)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red.shade100,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '必須',
                      style: TextStyle(
                        color: Colors.red.shade700,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _buildAnswerWidget(context),
          ],
        ),
      ),
    );
  }

  Widget _buildAnswerWidget(BuildContext context) {
    switch (question.type) {
      case QuestionType.radio:
        return _buildRadioOptions();
      case QuestionType.checkbox:
        return _buildCheckboxOptions();
      case QuestionType.text:
        return _buildTextInput();
    }
  }

  Widget _buildRadioOptions() {
    return Column(
      children: question.options?.map((option) {
        return RadioListTile<String>(
          title: Text(option),
          value: option,
          groupValue: answer as String?,
          onChanged: (value) => onAnswerChanged(value),
          contentPadding: EdgeInsets.zero,
        );
      }).toList() ?? [],
    );
  }

  Widget _buildCheckboxOptions() {
    final selectedValues = answer as List<String>? ?? [];
    
    return Column(
      children: question.options?.map((option) {
        final isSelected = selectedValues.contains(option);
        return CheckboxListTile(
          title: Text(option),
          value: isSelected,
          onChanged: (checked) {
            List<String> currentAnswers = List<String>.from(selectedValues);
            if (checked == true) {
              currentAnswers.add(option);
            } else {
              currentAnswers.remove(option);
            }
            onAnswerChanged(currentAnswers);
          },
          contentPadding: EdgeInsets.zero,
        );
      }).toList() ?? [],
    );
  }

  Widget _buildTextInput() {
    return TextField(
      decoration: InputDecoration(
        hintText: '回答を入力してください',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      maxLines: 3,
      onChanged: onAnswerChanged,
      controller: TextEditingController(text: answer as String? ?? ''),
    );
  }
}
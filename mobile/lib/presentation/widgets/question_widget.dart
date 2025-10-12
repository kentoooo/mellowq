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
      case QuestionType.textarea:
        return _buildTextInput(maxLines: 5);
      case QuestionType.number:
        return _buildNumberInput();
      case QuestionType.date:
        return _buildDateInput(context);
      case QuestionType.select:
        return _buildSelectOptions();
      case QuestionType.slider:
        return _buildSliderInput();
    }
  }

  Widget _buildRadioOptions() {
    return Column(
      children: question.options?.map((option) {
        return RadioListTile<String>(
          title: Text(option.label),
          value: option.value,
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
        final isSelected = selectedValues.contains(option.value);
        return CheckboxListTile(
          title: Text(option.label),
          value: isSelected,
          onChanged: (checked) {
            List<String> currentAnswers = List<String>.from(selectedValues);
            if (checked == true) {
              currentAnswers.add(option.value);
            } else {
              currentAnswers.remove(option.value);
            }
            onAnswerChanged(currentAnswers);
          },
          contentPadding: EdgeInsets.zero,
        );
      }).toList() ?? [],
    );
  }

  Widget _buildTextInput({int maxLines = 3}) {
    return TextField(
      decoration: InputDecoration(
        hintText: '回答を入力してください',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      maxLines: maxLines,
      onChanged: onAnswerChanged,
      controller: TextEditingController(text: answer as String? ?? ''),
    );
  }

  Widget _buildNumberInput() {
    return TextField(
      decoration: InputDecoration(
        hintText: '数値を入力してください',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      keyboardType: TextInputType.number,
      onChanged: (value) {
        final number = int.tryParse(value) ?? double.tryParse(value);
        onAnswerChanged(number);
      },
      controller: TextEditingController(text: answer?.toString() ?? ''),
    );
  }

  Widget _buildDateInput(BuildContext context) {
    return InkWell(
      onTap: () async {
        final DateTime? picked = await showDatePicker(
          context: context,
          initialDate: answer != null 
              ? DateTime.tryParse(answer.toString()) ?? DateTime.now()
              : DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
        );
        if (picked != null) {
          onAnswerChanged(picked.toIso8601String());
        }
      },
      child: InputDecorator(
        decoration: InputDecoration(
          hintText: '日付を選択してください',
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          filled: true,
          fillColor: Colors.grey.shade50,
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        child: Text(
          answer != null
              ? '${DateTime.tryParse(answer.toString())?.toLocal().toString().split(' ')[0]}'
              : '',
        ),
      ),
    );
  }

  Widget _buildSelectOptions() {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      value: answer as String?,
      hint: const Text('選択してください'),
      items: question.options?.map((option) {
        return DropdownMenuItem(
          value: option.value,
          child: Text(option.label),
        );
      }).toList() ?? [],
      onChanged: (value) => onAnswerChanged(value),
    );
  }

  Widget _buildSliderInput() {
    final currentValue = (answer as num?)?.toDouble() ?? 0.0;
    return Column(
      children: [
        Slider(
          value: currentValue,
          min: 0,
          max: 100,
          divisions: 20,
          label: currentValue.round().toString(),
          onChanged: (value) => onAnswerChanged(value),
        ),
        Text('値: ${currentValue.round()}'),
      ],
    );
  }
}
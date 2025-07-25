'use client';

import { useState } from 'react';
import { Question } from '@/types';

interface SurveyCreatorProps {
  onSubmit: (title: string, description: string, questions: Question[]) => void;
  isSubmitting: boolean;
}

export default function SurveyCreator({ onSubmit, isSubmitting }: SurveyCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      type,
      text: '',
      options: type !== 'text' ? [''] : undefined,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options) {
      updateQuestion(questionIndex, {
        options: [...question.options, ''],
      });
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionIndex, { options: newOptions });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options && question.options.length > 1) {
      updateQuestion(questionIndex, {
        options: question.options.filter((_, i) => i !== optionIndex),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && questions.length > 0) {
      onSubmit(title, description, questions);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              アンケートタイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">質問</h2>
        {questions.map((question, index) => (
          <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium">質問 {index + 1}</span>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                title="質問を削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(index, { text: e.target.value })}
                placeholder="質問文を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`required-${index}`}
                  checked={question.required}
                  onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                  必須項目
                </label>
              </div>
              {question.type !== 'text' && question.options && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">選択肢</span>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                        placeholder={`選択肢 ${optionIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {question.options!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index, optionIndex)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="選択肢を削除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(index)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + 選択肢を追加
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addQuestion('radio')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + ラジオボタン
          </button>
          <button
            type="button"
            onClick={() => addQuestion('checkbox')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + チェックボックス
          </button>
          <button
            type="button"
            onClick={() => addQuestion('text')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + テキスト
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !title || !description || questions.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? '作成中...' : 'アンケートを作成'}
        </button>
      </div>
    </form>
  );
}
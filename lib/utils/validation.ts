import { Question, Answer } from '@/types';

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // HTMLタグを除去
    .trim()
    .substring(0, 5000); // 最大文字数制限
}

export function validateSurveyInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('タイトルは必須です');
  } else if (data.title.length > 200) {
    errors.push('タイトルは200文字以内で入力してください');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('説明は必須です');
  } else if (data.description.length > 1000) {
    errors.push('説明は1000文字以内で入力してください');
  }
  
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('質問は1つ以上必要です');
  } else if (data.questions.length > 50) {
    errors.push('質問は50個以内で作成してください');
  } else {
    data.questions.forEach((question: any, index: number) => {
      if (!question.text || typeof question.text !== 'string') {
        errors.push(`質問${index + 1}のテキストは必須です`);
      } else if (question.text.length > 500) {
        errors.push(`質問${index + 1}は500文字以内で入力してください`);
      }
      
      if (!['radio', 'checkbox', 'text'].includes(question.type)) {
        errors.push(`質問${index + 1}の種類が無効です`);
      }
      
      if (question.type !== 'text' && (!Array.isArray(question.options) || question.options.length === 0)) {
        errors.push(`質問${index + 1}には選択肢が必要です`);
      }
      
      if (question.options && question.options.length > 20) {
        errors.push(`質問${index + 1}の選択肢は20個以内にしてください`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateResponseInput(
  answers: Answer[], 
  questions: Question[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(answers)) {
    errors.push('回答データが無効です');
    return { valid: false, errors };
  }
  
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const answeredQuestions = new Set(answers.map(a => a.questionId));
  
  // 必須質問のチェック
  questions.forEach(question => {
    if (question.required && !answeredQuestions.has(question.id)) {
      errors.push(`「${question.text}」は必須項目です`);
    }
  });
  
  // 回答の妥当性チェック
  answers.forEach(answer => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      errors.push('無効な質問への回答が含まれています');
      return;
    }
    
    if (question.type === 'text') {
      if (typeof answer.value !== 'string') {
        errors.push(`「${question.text}」の回答形式が無効です`);
      } else if (answer.value.length > 5000) {
        errors.push(`「${question.text}」の回答は5000文字以内で入力してください`);
      }
    } else if (question.type === 'radio') {
      if (typeof answer.value !== 'string' || !question.options?.includes(answer.value)) {
        errors.push(`「${question.text}」の選択肢が無効です`);
      }
    } else if (question.type === 'checkbox') {
      if (!Array.isArray(answer.value)) {
        errors.push(`「${question.text}」の回答形式が無効です`);
      } else {
        const invalidOptions = answer.value.filter(v => !question.options?.includes(v));
        if (invalidOptions.length > 0) {
          errors.push(`「${question.text}」に無効な選択肢が含まれています`);
        }
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateFollowupInput(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.question || typeof data.question !== 'string') {
    errors.push('質問は必須です');
  } else if (data.question.length > 2000) {
    errors.push('質問は2000文字以内で入力してください');
  }
  
  if (!data.responseId || typeof data.responseId !== 'string') {
    errors.push('回答IDが無効です');
  }
  
  return { valid: errors.length === 0, errors };
}
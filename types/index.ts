export interface Survey {
  id: string;
  adminToken: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'text';
  text: string;
  options?: string[];
  required: boolean;
}

export interface Response {
  id: string;
  surveyId: string;
  anonymousId: string;
  responseToken: string;
  answers: Answer[];
  pushSubscription?: PushSubscription;
  submittedAt: Date;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface FollowupQuestion {
  id: string;
  responseId: string;
  question: string;
  answer?: string;
  createdAt: Date;
  answeredAt?: Date;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
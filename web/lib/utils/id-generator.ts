import { nanoid } from 'nanoid';

export function generateSurveyId(): string {
  return nanoid(10);
}

export function generateAdminToken(): string {
  return nanoid(32);
}

export function generateAnonymousId(): string {
  return nanoid(16);
}

export function generateResponseToken(): string {
  return nanoid(24);
}

export function generateQuestionId(): string {
  return nanoid(8);
}
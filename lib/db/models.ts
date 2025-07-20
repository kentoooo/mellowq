import { Collection, Db, ObjectId } from 'mongodb';
import { getDb } from './mongodb';
import { 
  Survey, 
  Question, 
  Response, 
  Answer, 
  FollowupQuestion,
  PushSubscription 
} from '@/types';

export interface SurveyDocument extends Omit<Survey, 'id'> {
  _id: ObjectId;
}

export interface ResponseDocument extends Omit<Response, 'id'> {
  _id: ObjectId;
}

export interface FollowupQuestionDocument extends Omit<FollowupQuestion, 'id'> {
  _id: ObjectId;
}

export async function getSurveysCollection(): Promise<Collection<SurveyDocument>> {
  const db = await getDb();
  return db.collection<SurveyDocument>('surveys');
}

export async function getResponsesCollection(): Promise<Collection<ResponseDocument>> {
  const db = await getDb();
  return db.collection<ResponseDocument>('responses');
}

export async function getFollowupQuestionsCollection(): Promise<Collection<FollowupQuestionDocument>> {
  const db = await getDb();
  return db.collection<FollowupQuestionDocument>('followup_questions');
}

export function documentToSurvey(doc: SurveyDocument): Survey {
  return {
    id: doc._id.toHexString(),
    adminToken: doc.adminToken,
    title: doc.title,
    description: doc.description,
    questions: doc.questions,
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
  };
}

export function documentToResponse(doc: ResponseDocument): Response {
  return {
    id: doc._id.toHexString(),
    surveyId: doc.surveyId,
    anonymousId: doc.anonymousId,
    responseToken: doc.responseToken,
    answers: doc.answers,
    pushSubscription: doc.pushSubscription,
    submittedAt: doc.submittedAt,
  };
}

export function documentToFollowupQuestion(doc: FollowupQuestionDocument): FollowupQuestion {
  return {
    id: doc._id.toHexString(),
    responseId: doc.responseId,
    question: doc.question,
    answer: doc.answer,
    createdAt: doc.createdAt,
    answeredAt: doc.answeredAt,
  };
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getResponsesCollection, getSurveysCollection, ResponseDocument } from '@/lib/db/models';
import { generateAnonymousId, generateResponseToken } from '@/lib/utils/id-generator';
import { validateResponseInput, sanitizeText } from '@/lib/utils/validation';
import { responseSubmissionRateLimit } from '@/lib/utils/rate-limit';
import { createErrorResponse, createSuccessResponse, isValidObjectId } from '@/lib/utils/security';
import { Answer, PushSubscription } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    // レート制限チェック
    if (!responseSubmissionRateLimit(request)) {
      return createErrorResponse(
        { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
        429
      );
    }

    const { surveyId } = await params;
    const body = await request.json();
    const { answers, notificationSubscription } = body;

    if (!isValidObjectId(surveyId)) {
      return createErrorResponse(
        { code: 'INVALID_ID', message: 'Invalid survey ID' },
        400
      );
    }

    const surveysCollection = await getSurveysCollection();
    const survey = await surveysCollection.findOne({ _id: new ObjectId(surveyId) });

    if (!survey) {
      return createErrorResponse(
        { code: 'NOT_FOUND', message: 'Survey not found' },
        404
      );
    }

    // 回答バリデーション
    const validation = validateResponseInput(answers, survey.questions);
    if (!validation.valid) {
      return createErrorResponse(
        { code: 'VALIDATION_ERROR', message: 'Invalid answers', details: validation.errors },
        400
      );
    }

    const anonymousId = generateAnonymousId();
    const responseToken = generateResponseToken();

    // 回答をサニタイズ
    const sanitizedAnswers = answers.map((answer: Answer) => ({
      questionId: answer.questionId,
      value: Array.isArray(answer.value) 
        ? answer.value.map(v => sanitizeText(v))
        : sanitizeText(answer.value as string)
    }));

    const response: Omit<ResponseDocument, '_id'> = {
      surveyId,
      anonymousId,
      responseToken,
      answers: sanitizedAnswers,
      pushSubscription: notificationSubscription as PushSubscription | undefined,
      submittedAt: new Date(),
    };

    const responsesCollection = await getResponsesCollection();
    const result = await responsesCollection.insertOne(response);

    if (!result.acknowledged) {
      throw new Error('Failed to save response');
    }

    return createSuccessResponse({
      responseToken,
      message: 'Thank you for your response!',
    });
  } catch (error) {
    console.error('Error saving response:', error);
    return createErrorResponse(
      { code: 'SERVER_ERROR', message: 'Failed to save response' },
      500
    );
  }
}
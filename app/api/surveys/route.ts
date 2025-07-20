import { NextRequest, NextResponse } from 'next/server';
import { OptionalId } from 'mongodb';
import { getSurveysCollection, SurveyDocument } from '@/lib/db/models';
import { generateSurveyId, generateAdminToken, generateQuestionId } from '@/lib/utils/id-generator';
import { validateSurveyInput, sanitizeText } from '@/lib/utils/validation';
import { surveyCreationRateLimit } from '@/lib/utils/rate-limit';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/security';
import { Survey, Question } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    if (!surveyCreationRateLimit(request)) {
      return createErrorResponse(
        { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
        429
      );
    }

    const body = await request.json();
    
    // 入力バリデーション
    const validation = validateSurveyInput(body);
    if (!validation.valid) {
      return createErrorResponse(
        { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.errors },
        400
      );
    }

    const { title, description, questions } = body;

    const surveyId = generateSurveyId();
    const adminToken = generateAdminToken();

    const processedQuestions: Question[] = questions.map((q: any) => ({
      id: generateQuestionId(),
      type: q.type,
      text: sanitizeText(q.text),
      options: q.options ? q.options.map((opt: string) => sanitizeText(opt)) : [],
      required: q.required || false,
    }));

    const survey: OptionalId<SurveyDocument> = {
      adminToken,
      title: sanitizeText(title),
      description: sanitizeText(description),
      questions: processedQuestions,
      createdAt: new Date(),
    };

    const surveysCollection = await getSurveysCollection();
    const result = await surveysCollection.insertOne(survey);

    if (!result.acknowledged) {
      throw new Error('Failed to create survey');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    return createSuccessResponse({
      surveyId: result.insertedId.toHexString(),
      adminToken,
      surveyUrl: `${baseUrl}/survey/${result.insertedId.toHexString()}`,
      adminUrl: `${baseUrl}/manage/${adminToken}`,
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    return createErrorResponse(
      { code: 'SERVER_ERROR', message: 'Failed to create survey' },
      500
    );
  }
}
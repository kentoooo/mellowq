import { NextRequest, NextResponse } from 'next/server';
import { getSurveysCollection, SurveyDocument } from '@/lib/db/models';
import { generateSurveyId, generateAdminToken, generateQuestionId } from '@/lib/utils/id-generator';
import { validateSurveyInput, sanitizeText } from '@/lib/utils/validation';
import { surveyCreationRateLimit } from '@/lib/utils/rate-limit';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/security';
import { Survey, Question } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('Survey creation - 開始');
  
  try {
    // レート制限チェック
    const rateLimitStart = Date.now();
    if (!surveyCreationRateLimit(request)) {
      return createErrorResponse(
        { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
        429
      );
    }
    console.log(`Rate limit check - ${Date.now() - rateLimitStart}ms`);

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

    console.log('MongoDB接続開始');
    const dbStart = Date.now();
    const surveysCollection = await getSurveysCollection();
    console.log(`MongoDB接続完了 - ${Date.now() - dbStart}ms`);
    
    const surveyId = generateSurveyId();
    const adminToken = generateAdminToken();

    const processedQuestions: Question[] = questions.map((q: any) => ({
      id: generateQuestionId(),
      type: q.type,
      text: sanitizeText(q.text),
      options: q.options ? q.options.map((opt: string) => sanitizeText(opt)) : [],
      required: q.required || false,
    }));

    const survey = {
      adminToken,
      title: sanitizeText(title),
      description: sanitizeText(description),
      questions: processedQuestions,
      createdAt: new Date(),
    };

    console.log('データベース挿入開始');
    const insertStart = Date.now();
    const result = await surveysCollection.insertOne(survey as SurveyDocument);
    console.log(`データベース挿入完了 - ${Date.now() - insertStart}ms`);

    if (!result.acknowledged) {
      throw new Error('Failed to create survey');
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const totalDuration = Date.now() - startTime;
    console.log(`Survey creation 完了 - 総時間: ${totalDuration}ms`);
    
    return createSuccessResponse({
      surveyId: result.insertedId.toHexString(),
      adminToken,
      surveyUrl: `${baseUrl}/survey/${result.insertedId.toHexString()}`,
      adminUrl: `${baseUrl}/manage/${adminToken}`,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`Error creating survey after ${totalDuration}ms:`, error);
    return createErrorResponse(
      { code: 'SERVER_ERROR', message: 'Failed to create survey' },
      500
    );
  }
}
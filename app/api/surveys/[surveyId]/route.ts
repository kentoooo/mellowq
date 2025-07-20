import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSurveysCollection, documentToSurvey } from '@/lib/db/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params;

    if (!ObjectId.isValid(surveyId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid survey ID' } },
        { status: 400 }
      );
    }

    const surveysCollection = await getSurveysCollection();
    const surveyDoc = await surveysCollection.findOne({ _id: new ObjectId(surveyId) });

    if (!surveyDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Survey not found' } },
        { status: 404 }
      );
    }

    const survey = documentToSurvey(surveyDoc);
    const { adminToken, ...publicSurvey } = survey;

    return NextResponse.json(publicSurvey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to fetch survey' } },
      { status: 500 }
    );
  }
}
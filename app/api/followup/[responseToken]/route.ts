import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { 
  getResponsesCollection, 
  getFollowupQuestionsCollection,
  getSurveysCollection,
  documentToResponse,
  documentToFollowupQuestion,
  documentToSurvey
} from '@/lib/db/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ responseToken: string }> }
) {
  try {
    const { responseToken } = await params;

    // 元の回答を取得
    const responsesCollection = await getResponsesCollection();
    const responseDoc = await responsesCollection.findOne({ responseToken });

    if (!responseDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Response not found' } },
        { status: 404 }
      );
    }

    const response = documentToResponse(responseDoc);

    // アンケート情報を取得
    const surveysCollection = await getSurveysCollection();
    const surveyDoc = await surveysCollection.findOne({ 
      _id: new ObjectId(responseDoc.surveyId)
    });

    if (!surveyDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Survey not found' } },
        { status: 404 }
      );
    }

    const survey = documentToSurvey(surveyDoc);

    // 追加質問を取得
    const followupQuestionsCollection = await getFollowupQuestionsCollection();
    const followupDocs = await followupQuestionsCollection
      .find({ responseId: response.id })
      .sort({ createdAt: 1 })
      .toArray();

    const followupQuestions = followupDocs.map(documentToFollowupQuestion);

    return NextResponse.json({
      response,
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
      },
      followupQuestions,
    });
  } catch (error) {
    console.error('Error fetching followup questions:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to fetch followup questions' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ responseToken: string }> }
) {
  try {
    const { responseToken } = await params;
    const body = await request.json();
    const { followupQuestionId, answer } = body;

    if (!followupQuestionId || !answer) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // 元の回答を確認
    const responsesCollection = await getResponsesCollection();
    const responseDoc = await responsesCollection.findOne({ responseToken });

    if (!responseDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Response not found' } },
        { status: 404 }
      );
    }

    // 追加質問を更新
    const followupQuestionsCollection = await getFollowupQuestionsCollection();
    const result = await followupQuestionsCollection.updateOne(
      { 
        _id: new ObjectId(followupQuestionId),
        responseId: responseDoc._id.toHexString() 
      },
      { 
        $set: { 
          answer,
          answeredAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Followup question not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving followup answer:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to save followup answer' } },
      { status: 500 }
    );
  }
}
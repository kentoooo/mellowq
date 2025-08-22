import { NextRequest, NextResponse } from 'next/server';
import { 
  getSurveysCollection, 
  getResponsesCollection, 
  getFollowupQuestionsCollection,
  documentToResponse,
  documentToSurvey,
  documentToFollowupQuestion
} from '@/lib/db/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminToken: string }> }
) {
  try {
    const { adminToken } = await params;

    const surveysCollection = await getSurveysCollection();
    const surveyDoc = await surveysCollection.findOne({ adminToken });

    if (!surveyDoc) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Survey not found' } },
        { status: 404 }
      );
    }

    const survey = documentToSurvey(surveyDoc);
    const responsesCollection = await getResponsesCollection();
    const responseDocs = await responsesCollection
      .find({ surveyId: survey.id })
      .sort({ submittedAt: -1 })
      .toArray();

    const responses = responseDocs.map(documentToResponse);

    // フォローアップ質問を取得
    const followupCollection = await getFollowupQuestionsCollection();
    const responseIds = responses.map(r => r.id);
    const followupDocs = await followupCollection
      .find({ responseId: { $in: responseIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const followupQuestions = followupDocs.map(documentToFollowupQuestion);

    // 各回答にフォローアップ質問を関連付け
    const responsesWithFollowup = responses.map(response => ({
      ...response,
      followupQuestions: followupQuestions.filter(fq => fq.responseId === response.id)
    }));

    // 統計情報を計算
    const stats = {
      totalResponses: responses.length,
      questionsStats: survey.questions.map(question => {
        const questionAnswers = responses.map(r => 
          r.answers.find(a => a.questionId === question.id)
        ).filter(Boolean);

        if (question.type === 'radio' && question.options) {
          const optionCounts = question.options.reduce((acc, option) => {
            acc[option] = questionAnswers.filter(a => a?.value === option).length;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            questionId: question.id,
            type: question.type,
            text: question.text,
            optionCounts,
            totalAnswers: questionAnswers.length,
          };
        } else if (question.type === 'checkbox' && question.options) {
          const optionCounts = question.options.reduce((acc, option) => {
            acc[option] = questionAnswers.filter(a => 
              Array.isArray(a?.value) && a.value.includes(option)
            ).length;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            questionId: question.id,
            type: question.type,
            text: question.text,
            optionCounts,
            totalAnswers: questionAnswers.length,
          };
        } else {
          return {
            questionId: question.id,
            type: question.type,
            text: question.text,
            totalAnswers: questionAnswers.length,
          };
        }
      }),
    };

    return NextResponse.json({
      survey,
      responses: responsesWithFollowup,
      stats,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to fetch responses' } },
      { status: 500 }
    );
  }
}
import { getDb } from './mongodb';

export async function initializeDatabase() {
  try {
    const db = await getDb();

    await db.collection('surveys').createIndex({ adminToken: 1 }, { unique: true });
    await db.collection('surveys').createIndex({ createdAt: -1 });
    
    await db.collection('responses').createIndex({ surveyId: 1 });
    await db.collection('responses').createIndex({ responseToken: 1 }, { unique: true });
    await db.collection('responses').createIndex({ anonymousId: 1 });
    await db.collection('responses').createIndex({ submittedAt: -1 });
    
    await db.collection('followup_questions').createIndex({ responseId: 1 });
    await db.collection('followup_questions').createIndex({ createdAt: -1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
}
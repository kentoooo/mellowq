import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('Health check - MongoDB接続テスト開始');
    
    // MongoDB接続テスト
    const db = await getDb();
    await db.admin().ping();
    
    const duration = Date.now() - startTime;
    
    console.log(`Health check - MongoDB接続成功 (${duration}ms)`);
    
    return NextResponse.json({
      status: 'healthy',
      mongodb: 'connected',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('Health check - MongoDB接続失敗:', error);
    
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // スタックトレースの最初の5行
    } : { message: 'Unknown error' };
    
    return NextResponse.json({
      status: 'unhealthy',
      mongodb: 'disconnected',
      error: errorDetails,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: {
        protocol: process.env.MONGODB_URI?.split('://')[0],
        isAtlas: !!process.env.MONGODB_URI?.includes('mongodb.net'),
        hasCredentials: !!process.env.MONGODB_URI?.includes('@')
      }
    }, { status: 500 });
  }
}
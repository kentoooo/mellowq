import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';

// 環境変数を読み込み（Next.js環境以外の場合）
if (!process.env.NEXT_PHASE) {
  config({ path: '.env.local' });
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000, // 5秒でタイムアウト
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  maxPoolSize: 10, // 接続プールサイズ
  retryWrites: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  try {
    console.log('MongoDB接続試行中...');
    const startTime = Date.now();
    const client = await clientPromise;
    const duration = Date.now() - startTime;
    console.log(`MongoDB接続成功 (${duration}ms)`);
    return client.db();
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    throw error;
  }
}
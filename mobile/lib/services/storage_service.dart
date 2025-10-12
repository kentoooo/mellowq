import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../data/models/survey_response.dart';
import '../data/models/followup_question.dart';

class StorageService {
  static Database? _database;
  static const String _dbName = 'survey_app.db';
  static const int _dbVersion = 1;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), _dbName);
    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _createTables,
    );
  }

  static Future<void> _createTables(Database db, int version) async {
    await db.execute('''
      CREATE TABLE responses(
        id TEXT PRIMARY KEY,
        survey_id TEXT NOT NULL,
        anonymous_id TEXT NOT NULL,
        response_token TEXT,
        answers TEXT NOT NULL,
        submitted_at INTEGER NOT NULL,
        is_synced INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE followup_questions(
        id TEXT PRIMARY KEY,
        response_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        created_at INTEGER NOT NULL,
        answered_at INTEGER,
        FOREIGN KEY (response_id) REFERENCES responses (id)
      )
    ''');

    await db.execute('''
      CREATE TABLE surveys(
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        questions TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        accessed_at INTEGER NOT NULL
      )
    ''');
  }

  static Future<void> saveResponse(SurveyResponse response) async {
    final db = await database;
    await db.insert(
      'responses',
      response.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<List<SurveyResponse>> getResponseHistory() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'responses',
      orderBy: 'submitted_at DESC',
    );

    return List.generate(maps.length, (i) {
      return SurveyResponse.fromMap(maps[i]);
    });
  }

  static Future<List<SurveyResponse>> getUnsyncedResponses() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'responses',
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'submitted_at ASC',
    );

    return List.generate(maps.length, (i) {
      return SurveyResponse.fromMap(maps[i]);
    });
  }

  static Future<void> markResponseAsSynced(String responseId) async {
    final db = await database;
    await db.update(
      'responses',
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [responseId],
    );
  }

  static Future<void> updateResponse(SurveyResponse response) async {
    final db = await database;
    await db.update(
      'responses',
      response.toMap(),
      where: 'id = ?',
      whereArgs: [response.id],
    );
  }

  static Future<String?> getDeviceToken() async {
    // TODO: 実際のデバイストークンを取得する処理を実装
    // 現在は仮のトークンを返す
    return 'device_token_placeholder';
  }

  static Future<void> incrementRetryCount(String responseId) async {
    final db = await database;
    await db.rawUpdate(
      'UPDATE responses SET retry_count = retry_count + 1 WHERE id = ?',
      [responseId],
    );
  }

  static Future<void> deleteResponse(String responseId) async {
    final db = await database;
    await db.delete(
      'responses',
      where: 'id = ?',
      whereArgs: [responseId],
    );
  }

  static Future<void> deleteAllResponses() async {
    final db = await database;
    await db.delete('responses');
  }

  static Future<void> saveFollowupQuestion(FollowupQuestion question) async {
    final db = await database;
    await db.insert(
      'followup_questions',
      {
        'id': question.id,
        'response_id': question.responseId,
        'question': question.question,
        'answer': question.answer,
        'created_at': question.createdAt.millisecondsSinceEpoch,
        'answered_at': question.answeredAt?.millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<List<FollowupQuestion>> getFollowupQuestions(
      String responseId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'followup_questions',
      where: 'response_id = ?',
      whereArgs: [responseId],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) {
      return FollowupQuestion(
        id: maps[i]['id'],
        responseId: maps[i]['response_id'],
        question: maps[i]['question'],
        answer: maps[i]['answer'],
        createdAt:
            DateTime.fromMillisecondsSinceEpoch(maps[i]['created_at']),
        answeredAt: maps[i]['answered_at'] != null
            ? DateTime.fromMillisecondsSinceEpoch(maps[i]['answered_at'])
            : null,
      );
    });
  }

  static Future<void> clearDatabase() async {
    final db = await database;
    await db.delete('responses');
    await db.delete('followup_questions');
    await db.delete('surveys');
  }
}
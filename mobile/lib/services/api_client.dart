import 'package:dio/dio.dart';
import '../data/models/survey.dart';
import '../data/models/survey_response.dart';
import '../data/models/answer.dart';
import '../data/models/followup_question.dart';
import '../core/errors/api_exception.dart';

class APIClient {
  static const String baseURL = "https://mellowq.vercel.app";
  static final Dio _dio = Dio();

  static void initialize() {
    _dio.options.baseUrl = baseURL;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    // インターセプターの追加
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      error: true,
    ));

    // エラーハンドリング
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (error, handler) {
        print('API Error: ${error.message}');
        handler.next(error);
      },
    ));
  }

  static Future<Survey> fetchSurvey(String surveyId) async {
    try {
      final response = await _dio.get('/api/surveys/$surveyId');

      if (response.statusCode == 200) {
        return Survey.fromJson(response.data);
      } else {
        throw APIException('Survey not found');
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout) {
        throw APIException('Connection timeout');
      } else if (e.type == DioExceptionType.receiveTimeout) {
        throw APIException('Receive timeout');
      } else {
        throw APIException('Network error: ${e.message}');
      }
    }
  }

  static Future<Map<String, dynamic>> submitResponse({
    required String surveyId,
    required List<Answer> answers,
    String? deviceToken,
  }) async {
    try {
      final payload = {
        'answers': answers.map((a) => a.toJson()).toList(),
        if (deviceToken != null) 'deviceToken': deviceToken,
      };

      final response = await _dio.post(
        '/api/surveys/$surveyId/responses',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data;
      } else {
        throw APIException('Failed to submit response');
      }
    } on DioException catch (e) {
      throw APIException('Submit failed: ${e.message}');
    }
  }

  static Future<Map<String, dynamic>> fetchFollowupQuestions(
      String responseToken) async {
    try {
      final response = await _dio.get('/api/followup/$responseToken');

      if (response.statusCode == 200) {
        return response.data;
      } else {
        throw APIException('Followup questions not found');
      }
    } on DioException catch (e) {
      throw APIException('Failed to fetch followup: ${e.message}');
    }
  }

  static Future<Map<String, dynamic>> submitFollowupAnswer({
    required String responseToken,
    required String questionId,
    required String answer,
  }) async {
    try {
      final payload = {
        'answer': answer,
      };

      final response = await _dio.post(
        '/api/followup/$responseToken/questions/$questionId/answer',
        data: payload,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data;
      } else {
        throw APIException('Failed to submit followup answer');
      }
    } on DioException catch (e) {
      throw APIException('Submit followup failed: ${e.message}');
    }
  }

  static Future<void> registerDeviceToken({
    required String responseToken,
    required String deviceToken,
  }) async {
    try {
      await _dio.post(
        '/api/notifications/register',
        data: {
          'responseToken': responseToken,
          'deviceToken': deviceToken,
        },
      );
    } on DioException catch (e) {
      throw APIException('Failed to register device token: ${e.message}');
    }
  }
}
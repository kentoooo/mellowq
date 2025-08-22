import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitMap = new Map<string, { requests: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(request: NextRequest): boolean {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    
    const now = Date.now();
    const key = `${ip}`;
    
    const current = rateLimitMap.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitMap.set(key, {
        requests: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }
    
    if (current.requests < config.maxRequests) {
      current.requests++;
      return true;
    }
    
    return false;
  };
}

export const surveyCreationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分
  maxRequests: 5, // 5回まで
});

export const responseSubmissionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分
  maxRequests: 10, // 10回まで
});

export const followupRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分
  maxRequests: 20, // 20回まで
});
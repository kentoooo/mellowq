import { NextResponse } from 'next/server';

export function createSecurityHeaders() {
  const headers = new Headers();
  
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return headers;
}

export function createErrorResponse(
  error: { code: string; message: string; details?: any },
  status: number
) {
  const response = NextResponse.json({ error }, { status });
  
  // セキュリティヘッダーを追加
  const securityHeaders = createSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export function createSuccessResponse(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status });
  
  // セキュリティヘッダーを追加
  const securityHeaders = createSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidNanoid(id: string, expectedLength?: number): boolean {
  const nanoidRegex = /^[A-Za-z0-9_-]+$/;
  if (!nanoidRegex.test(id)) return false;
  if (expectedLength && id.length !== expectedLength) return false;
  return true;
}
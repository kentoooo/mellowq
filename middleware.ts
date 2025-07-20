import { NextRequest, NextResponse } from 'next/server';
import { createSecurityHeaders } from '@/lib/utils/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // セキュリティヘッダーを追加
  const securityHeaders = createSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  // CSP (Content Security Policy) を設定
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.jsに必要
      "style-src 'self' 'unsafe-inline'", // Tailwindに必要
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
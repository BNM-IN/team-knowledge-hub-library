import { NextResponse } from "next/server";

// PRD 10.1 error format
const STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  INVALID_CODE: 404,
  RATE_LIMITED: 429,
  AI_TIMEOUT: 504,
  AI_BAD_OUTPUT: 502,
  INTERNAL: 500,
} as const;

export type ErrorCode = keyof typeof STATUS;

export function apiError(code: ErrorCode, message: string, extra?: { retry_after_s?: number }) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status: STATUS[code] });
}

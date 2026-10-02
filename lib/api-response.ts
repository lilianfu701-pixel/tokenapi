import { NextResponse } from "next/server";

interface SuccessPayload<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  };
}

interface ErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function ok<T>(data: T, meta?: SuccessPayload<T>["meta"]) {
  const body: SuccessPayload<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body);
}

export function paginated<T>(
  data: T,
  total: number,
  page: number,
  limit: number,
) {
  return ok(data, { total, page, limit, has_more: page * limit < total });
}

export function fail(code: string, message: string, status = 400) {
  const body: ErrorPayload = { success: false, error: { code, message } };
  return NextResponse.json(body, { status });
}

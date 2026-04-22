import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.amroaltayeb14.workers.dev';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = `/api/${path.join('/')}`;
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Forward request body for mutating methods
  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;

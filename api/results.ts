import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quizId');

  if (!quizId) {
    return new Response(JSON.stringify({ error: 'Quiz ID is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    // 获取当前 quizId 的所有回答
    const responses = await kv.lrange(`responses:${quizId}`, 0, -1);

    return new Response(JSON.stringify(responses || []), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

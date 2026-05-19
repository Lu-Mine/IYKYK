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
    const quizData = await kv.get(`quiz:${quizId}`);

    if (!quizData) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(quizData), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any, res: any) {
  const quizId = req.query.quizId;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    const quizData = await kv.get(`quiz:${quizId}`);

    if (!quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Strip secret before returning
    const { secret, ...safeQuizData } = quizData as any;

    return res.status(200).json(safeQuizData);
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

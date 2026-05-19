import { kv } from '@vercel/kv';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any, res: any) {
  const quizId = req.query.quizId;
  const secret = req.query.secret;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    // Verify secret
    const quizData: any = await kv.get(`quiz:${quizId}`);
    if (!quizData || quizData.secret !== secret) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect secret' });
    }

    // 获取当前 quizId 的所有回答
    const responses = await kv.lrange(`responses:${quizId}`, 0, -1);

    return res.status(200).json(responses || []);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

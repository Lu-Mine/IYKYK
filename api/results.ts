import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  const quizId = req.query.quizId;
  const secret = req.query.secret;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    // Verify secret
    let quizData: any = await kv.get(`quiz:${quizId}`);
    
    if (!quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Handle case where data might be stored as a string
    if (typeof quizData === 'string') {
      try {
        quizData = JSON.parse(quizData);
      } catch (e) {
        console.error('Failed to parse quiz data string:', e);
      }
    }

    if (quizData.secret !== secret) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect secret' });
    }

    // 获取当前 quizId 的所有回答
    const responses = await kv.lrange(`responses:${quizId}`, 0, -1);
    
    // Ensure all responses are parsed if they were stored as strings
    const parsedResponses = (responses || []).map(r => {
      if (typeof r === 'string') {
        try {
          return JSON.parse(r);
        } catch (e) {
          return r;
        }
      }
      return r;
    });

    return res.status(200).json(parsedResponses);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

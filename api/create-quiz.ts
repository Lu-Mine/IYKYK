import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, title, description, questions, hostScores, createdAt, deviceInfo, secret } = req.body;

  if (!userId || !title || !questions || !hostScores || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const quizData = {
      userId,
      title,
      description,
      questions,
      hostScores,
      createdAt,
      deviceInfo,
      secret,
    };

    await kv.set(`quiz:${userId}`, JSON.stringify(quizData));

    return res.status(200).json({ message: 'Quiz saved successfully', userId });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

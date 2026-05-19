import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  const quizId = req.query.quizId;
  console.log('Fetching quiz data for ID:', quizId);

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    let quizData: any = await kv.get(`quiz:${quizId}`);
    console.log('Raw quiz data from KV:', quizData ? 'Found' : 'Not Found');

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

    // Strip secret before returning
    const { secret, ...safeQuizData } = quizData;

    return res.status(200).json(safeQuizData);
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

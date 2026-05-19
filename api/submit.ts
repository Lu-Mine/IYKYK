import { kv } from '@vercel/kv';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Incoming submission body:', {
    type: typeof req.body,
    isObject: typeof req.body === 'object' && req.body !== null,
    keys: req.body ? Object.keys(req.body) : [],
    body: req.body
  });

  const { quizId, participantName, participantScores, createdAt, deviceInfo } = req.body;

  if (!quizId || !participantName || !participantScores) {
    console.error('Submission failed. Missing fields:', {
      quizId: !!quizId,
      participantName: !!participantName,
      participantScores: !!participantScores,
      body: req.body
    });
    return res.status(400).json({ 
      error: 'Missing required fields', 
      debug: { 
        hasQuizId: !!quizId, 
        hasParticipantName: !!participantName, 
        hasParticipantScores: !!participantScores 
      } 
    });
  }

  try {
    const responseId = `res_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    const submission = {
      responseId,
      participantName,
      participantScores,
      createdAt,
      deviceInfo,
    };

    // Explicitly stringify for Redis LPUSH
    await kv.lpush(`responses:${quizId}`, JSON.stringify(submission));

    return res.status(200).json({ status: 'success', responseId });
  } catch (error) {
    console.error('Error submitting response:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

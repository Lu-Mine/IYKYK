import { getDb } from './_lib/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostName, title, description, questions, hostScores, createdAt, deviceInfo, secret, settings } = req.body;

  if (!title || !questions || !hostScores || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await getDb();
    const quizData = {
      hostName,
      title,
      description,
      questions,
      hostScores,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      deviceInfo,
      secret,
      settings: settings || { allowRepeat: true, showAnalysis: true, shuffleQuestions: false },
    };

    const result = await db.collection('Quizzes').insertOne(quizData);
    const quizIdStr = result.insertedId.toString();

    // Update the document to contain the userId string field matching the auto-generated ID for full backward compatibility
    await db.collection('Quizzes').updateOne(
      { _id: result.insertedId },
      { $set: { userId: quizIdStr } }
    );

    return res.status(200).json({ message: 'Quiz saved successfully', userId: quizIdStr });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

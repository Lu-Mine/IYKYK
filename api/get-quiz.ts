import { ObjectId } from 'mongodb';
import { getDb } from './_lib/db.js';

export default async function handler(req: any, res: any) {
  const quizId = req.query.quizId;
  console.log('Fetching quiz data for ID:', quizId);

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    const db = await getDb();
    let query: any = {};
    if (ObjectId.isValid(quizId)) {
      query = { _id: new ObjectId(quizId) };
    } else {
      query = { $or: [{ _id: quizId }, { userId: quizId }] };
    }

    const quizData: any = await db.collection('Quizzes').findOne(query);
    console.log('Quiz query result:', quizData ? 'Found' : 'Not Found');

    if (!quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Ensure _id and userId are properly mapped as strings
    const idStr = quizData._id.toString();
    const cleanQuizData = {
      ...quizData,
      _id: idStr,
      userId: quizData.userId || idStr,
    };

    const participantName = req.query.participantName;
    const browserId = req.query.browserId;
    let hasSubmitted = false;

    if (cleanQuizData.settings?.allowRepeat === false && (participantName || browserId)) {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').toString().split(',')[0].trim();
      const orConditions: any[] = [];
      if (participantName) {
        orConditions.push({ participantName });
      }
      if (browserId) {
        orConditions.push({ browserId });
      }
      if (ip) {
        orConditions.push({ ip });
      }

      const existingResponse = await db.collection('Responses').findOne({
        $and: [
          { $or: [{ quizId: idStr }, { quizId: ObjectId.isValid(idStr) ? new ObjectId(idStr) : idStr }] },
          { $or: orConditions }
        ]
      });

      if (existingResponse) {
        hasSubmitted = true;
      }
    }

    // Strip secret before returning
    const { secret, ...safeQuizData } = cleanQuizData;

    return res.status(200).json({
      ...safeQuizData,
      hasSubmitted
    });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

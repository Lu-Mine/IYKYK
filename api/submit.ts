import { ObjectId } from 'mongodb';
import { getDb } from './_lib/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quizId, participantName, participantScores, createdAt, deviceInfo, answers: clientAnswers } = req.body;

  if (!quizId || !participantName || !participantScores) {
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
    const db = await getDb();
    
    // Convert quizId to ObjectId if possible
    let quizIdDb: any = quizId;
    if (ObjectId.isValid(quizId)) {
      quizIdDb = new ObjectId(quizId);
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').toString().split(',')[0].trim();
    const browserId = req.body.browserId || '';

    // Fetch quiz to check settings
    const quiz = await db.collection('Quizzes').findOne({
      $or: [{ _id: quizIdDb }, { userId: quizId }]
    });

    if (quiz && quiz.settings?.allowRepeat === false) {
      const orConditions: any[] = [{ participantName }];
      if (browserId) {
        orConditions.push({ browserId });
      }
      if (ip) {
        orConditions.push({ ip });
      }

      const existingResponse = await db.collection('Responses').findOne({
        $and: [
          { $or: [{ quizId: quizId }, { quizId: quizIdDb }] },
          { $or: orConditions }
        ]
      });

      if (existingResponse) {
        return res.status(400).json({ error: '该试卷仅限作答一次，检测到您已经提交过答案。' });
      }
    }

    // Build the answers object as specified in the schema
    const answers: any = clientAnswers || {};
    if (Array.isArray(participantScores)) {
      participantScores.forEach((score: any, index: number) => {
        const key = `q${index}`;
        if (answers[key] === undefined) {
          answers[key] = score;
        }
      });
    }

    const responseDoc = {
      quizId: quizIdDb,
      participantName,
      participantScores, // store for frontend backward-compatibility
      answers,
      submittedAt: createdAt ? new Date(createdAt) : new Date(),
      createdAt: createdAt || new Date().toISOString(),
      deviceInfo,
      ip,
      browserId,
    };

    const result = await db.collection('Responses').insertOne(responseDoc);
    const responseIdStr = result.insertedId.toString();

    // Also update the document with responseId string for full reliability
    await db.collection('Responses').updateOne(
      { _id: result.insertedId },
      { $set: { responseId: responseIdStr } }
    );

    return res.status(200).json({ status: 'success', responseId: responseIdStr });
  } catch (error) {
    console.error('Error submitting response:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

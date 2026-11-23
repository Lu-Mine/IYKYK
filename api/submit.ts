import crypto from 'node:crypto';
import {
  DEFAULT_QUIZ_SETTINGS,
  QuizSettings,
  extractClientIp,
  findQuizById,
  getDb,
  hasExistingResponse,
  safeJsonParse,
} from './_lib/db.js';

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
        hasParticipantScores: !!participantScores,
      },
    });
  }

  try {
    const db = getDb();
    const ip = extractClientIp(req);
    const browserId = typeof req.body.browserId === 'string' ? req.body.browserId : '';

    const quiz = findQuizById(db, quizId);
    const quizSettings = quiz
      ? safeJsonParse<QuizSettings>(quiz.settings, DEFAULT_QUIZ_SETTINGS)
      : null;

    if (quiz && quizSettings?.allowRepeat === false) {
      const duplicate = hasExistingResponse(
        db,
        [quiz.id, quiz.user_id, quizId],
        participantName,
        browserId,
        ip
      );

      if (duplicate) {
        return res.status(400).json({ error: '该试卷仅限作答一次，检测到您已经提交过答案。' });
      }
    }

    const answers: Record<string, any> =
      clientAnswers && typeof clientAnswers === 'object' ? { ...clientAnswers } : {};
    if (Array.isArray(participantScores)) {
      participantScores.forEach((score: any, index: number) => {
        const key = `q${index}`;
        if (answers[key] === undefined) {
          answers[key] = score;
        }
      });
    }

    const responseIdStr = crypto.randomBytes(12).toString('hex');
    const submittedAtIso =
      createdAt && !Number.isNaN(Date.parse(createdAt))
        ? new Date(createdAt).toISOString()
        : new Date().toISOString();
    const createdAtStr = createdAt || new Date().toISOString();
    const storedQuizId = quiz ? quiz.id : quizId;

    db.prepare(`
      INSERT INTO responses (
        id, response_id, quiz_id, participant_name, participant_scores,
        answers, submitted_at, created_at, device_info, ip, browser_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      responseIdStr,
      responseIdStr,
      storedQuizId,
      participantName,
      JSON.stringify(participantScores),
      JSON.stringify(answers),
      submittedAtIso,
      createdAtStr,
      deviceInfo ?? null,
      ip,
      browserId
    );

    return res.status(200).json({ status: 'success', responseId: responseIdStr });
  } catch (error) {
    console.error('Error submitting response:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import {
  DEFAULT_QUIZ_SETTINGS,
  QuizSettings,
  extractClientIp,
  findQuizById,
  getDb,
  hasExistingResponse,
  safeJsonParse,
} from './_lib/db.js';
import { QUESTIONS, HOST_SCORES, HOST_NAME } from '../src/lib/constants.js';

export default async function handler(req: any, res: any) {
  const quizId = typeof req.query?.quizId === 'string' ? req.query.quizId : '';
  console.log('Fetching quiz data for ID:', quizId);

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    let cleanQuizData: {
      _id: string;
      userId: string;
      hostName: string | null;
      title: string;
      description: string | null;
      questions: string[];
      hostScores: number[];
      createdAt?: string;
      deviceInfo?: string | null;
      settings: QuizSettings;
    };
    let db: ReturnType<typeof getDb> | null = null;

    if (quizId === 'default_quiz') {
      cleanQuizData = {
        _id: 'default_quiz',
        userId: 'default_quiz',
        hostName: HOST_NAME,
        title: '你和我，见识同一个我吗？',
        description: '',
        questions: QUESTIONS,
        hostScores: HOST_SCORES,
        settings: DEFAULT_QUIZ_SETTINGS,
      };
    } else {
      db = getDb();
      const row = findQuizById(db, quizId);
      console.log('Quiz query result:', row ? 'Found' : 'Not Found');

      if (!row) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      cleanQuizData = {
        _id: row.id,
        userId: row.user_id || row.id,
        hostName: row.host_name,
        title: row.title,
        description: row.description,
        questions: safeJsonParse<string[]>(row.questions, []),
        hostScores: safeJsonParse<number[]>(row.host_scores, []),
        createdAt: row.created_at,
        deviceInfo: row.device_info,
        settings: safeJsonParse<QuizSettings>(row.settings, DEFAULT_QUIZ_SETTINGS),
      };
    }

    const participantName = typeof req.query?.participantName === 'string' ? req.query.participantName : '';
    const browserId = typeof req.query?.browserId === 'string' ? req.query.browserId : '';
    let hasSubmitted = false;

    if (cleanQuizData.settings?.allowRepeat === false && (participantName || browserId)) {
      if (!db) {
        db = getDb();
      }
      const ip = extractClientIp(req);
      hasSubmitted = hasExistingResponse(
        db,
        [cleanQuizData._id, cleanQuizData.userId],
        participantName,
        browserId,
        ip
      );
    }

    return res.status(200).json({
      ...cleanQuizData,
      hasSubmitted,
    });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

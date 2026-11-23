import {
  DEFAULT_QUIZ_SETTINGS,
  QuizSettings,
  ResponseRow,
  findQuizById,
  getDb,
  safeJsonParse,
} from './_lib/db.js';
import { QUESTIONS, HOST_SCORES } from '../src/lib/constants.js';

function calculateScore(userScores: number[], hostScores: number[], totalQuestions: number): number {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  const scoreConfig = [100, 85, 60, 30, 10, 0, 0];
  let totalScore = 0;
  let allMatchesWithinOne = true;
  const count = Math.min(totalQuestions, userScores.length, hostScores.length);
  if (count <= 0) return 0;

  for (let i = 0; i < count; i++) {
    const userVal = userScores[i] !== undefined ? userScores[i] : 4;
    const hostVal = hostScores[i] !== undefined ? hostScores[i] : 4;
    const diff = Math.abs(hostVal - userVal);

    if (diff > 1) {
      allMatchesWithinOne = false;
    }

    const errorIndex = Math.min(Math.max(Math.round(diff), 0), 6);
    totalScore += scoreConfig[errorIndex];
  }

  if (allMatchesWithinOne) {
    return 100;
  }

  return Math.round(totalScore / count);
}

export default async function handler(req: any, res: any) {
  const quizId = typeof req.query?.quizId === 'string' ? req.query.quizId : '';
  const secret = typeof req.query?.secret === 'string' ? req.query.secret : '';

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    const db = getDb();
    let quizData: {
      id: string;
      userId: string;
      secret: string;
      questions: string[];
      hostScores: number[];
      settings?: QuizSettings;
    };

    if (quizId === 'default_quiz') {
      quizData = {
        id: 'default_quiz',
        userId: 'default_quiz',
        secret: 'IfYouKnowYouKnow',
        questions: QUESTIONS,
        hostScores: HOST_SCORES,
      };
    } else {
      const row = findQuizById(db, quizId);
      if (!row) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      quizData = {
        id: row.id,
        userId: row.user_id || row.id,
        secret: row.secret,
        questions: safeJsonParse<string[]>(row.questions, []),
        hostScores: safeJsonParse<number[]>(row.host_scores, []),
        settings: safeJsonParse<QuizSettings>(row.settings, DEFAULT_QUIZ_SETTINGS),
      };
    }

    if (quizData.secret !== secret) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect secret' });
    }

    const lookupIds = Array.from(new Set([quizData.id, quizData.userId, quizId].filter(Boolean)));
    const placeholders = lookupIds.map(() => '?').join(', ');
    const responses = db
      .prepare(`SELECT * FROM responses WHERE quiz_id IN (${placeholders})`)
      .all(...lookupIds) as ResponseRow[];

    const questionsList = quizData.questions || QUESTIONS;

    const parsedResponses = responses.map((record) => {
      const answersMap = safeJsonParse<Record<string, any>>(record.answers, {});
      let participantScores = safeJsonParse<number[]>(record.participant_scores, []);
      if (participantScores.length === 0 && Object.keys(answersMap).length > 0) {
        participantScores = questionsList.map((_: string, idx: number) => {
          return answersMap[`q${idx}`] !== undefined ? answersMap[`q${idx}`] : 4;
        });
      }

      const answersWithQuestions = questionsList.map((q: string, idx: number) => ({
        question: q,
        answer:
          answersMap[`q${idx}`] !== undefined
            ? answersMap[`q${idx}`]
            : participantScores[idx] !== undefined
              ? participantScores[idx]
              : 4,
      }));

      return {
        id: record.id,
        responseId: record.response_id || record.id,
        participantName: record.participant_name,
        participantScores,
        createdAt: record.created_at || record.submitted_at || new Date().toISOString(),
        deviceInfo: record.device_info,
        answers: answersMap,
        answersWithQuestions,
        browserId: record.browser_id || '',
        ip: record.ip || '',
      };
    });

    const hostScores = quizData.hostScores || [];
    let finalResponses = parsedResponses;

    if (quizData.settings?.allowRepeat !== false && hostScores.length > 0) {
      const groups: any[][] = [];
      for (const resp of parsedResponses) {
        (resp as any).calculatedScore = calculateScore(
          resp.participantScores,
          hostScores,
          questionsList.length
        );

        let foundGroupIdx = -1;
        for (let gIdx = 0; gIdx < groups.length; gIdx++) {
          const group = groups[gIdx];
          const hasMatch = group.some((existing) => {
            const sameName = resp.participantName === existing.participantName;
            const sameBrowser = resp.browserId && existing.browserId && resp.browserId === existing.browserId;
            const sameIp = resp.ip && existing.ip && resp.ip === existing.ip;
            return sameName || sameBrowser || sameIp;
          });
          if (hasMatch) {
            foundGroupIdx = gIdx;
            break;
          }
        }

        if (foundGroupIdx !== -1) {
          groups[foundGroupIdx].push(resp);
        } else {
          groups.push([resp]);
        }
      }

      finalResponses = groups.map((group) => {
        let highest = group[0];
        for (const resp of group) {
          if ((resp as any).calculatedScore > (highest as any).calculatedScore) {
            highest = resp;
          }
        }
        return highest;
      });
    }

    return res.status(200).json(finalResponses);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { ObjectId } from 'mongodb';
import { getDb } from './_lib/db.js';
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
  const quizId = req.query.quizId;
  const secret = req.query.secret;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  try {
    const db = await getDb();
    let quizData: any = null;

    if (quizId === 'default_quiz') {
      // Default identity for the built-in quiz
      quizData = { 
        secret: 'IfYouKnowYouKnow',
        questions: QUESTIONS,
        hostScores: HOST_SCORES,
      };
    } else {
      let query: any = {};
      if (ObjectId.isValid(quizId)) {
        query = { _id: new ObjectId(quizId) };
      } else {
        query = { $or: [{ _id: quizId }, { userId: quizId }] };
      }

      quizData = await db.collection('Quizzes').findOne(query);

      if (!quizData) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
    }

    if (quizData.secret !== secret) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect secret' });
    }

    // Retrieve all responses for the quiz ID
    let rQuery: any = { quizId: quizId };
    if (ObjectId.isValid(quizId)) {
      rQuery = { $or: [{ quizId: new ObjectId(quizId) }, { quizId: quizId }] };
    }
    const responses = await db.collection('Responses').find(rQuery).toArray();

    const questionsList = quizData.questions || QUESTIONS;

    const parsedResponses = responses.map((record: any) => {
      // Ensure participantScores is available
      let participantScores = record.participantScores || [];
      if (participantScores.length === 0 && record.answers) {
        participantScores = questionsList.map((_: any, idx: number) => {
          return record.answers[`q${idx}`] !== undefined ? record.answers[`q${idx}`] : 4;
        });
      }

      // Merge answers with questions
      const answersMap = record.answers || {};
      const answersWithQuestions = questionsList.map((q: string, idx: number) => {
        return {
          question: q,
          answer: answersMap[`q${idx}`] !== undefined ? answersMap[`q${idx}`] : (participantScores[idx] !== undefined ? participantScores[idx] : 4),
        };
      });

      return {
        id: record._id.toString(),
        responseId: record.responseId || record._id.toString(),
        participantName: record.participantName,
        participantScores: participantScores,
        createdAt: record.createdAt || record.submittedAt?.toISOString() || new Date().toISOString(),
        deviceInfo: record.deviceInfo,
        answers: answersMap,
        answersWithQuestions,
        browserId: record.browserId || '',
        ip: record.ip || '',
      };
    });

    const hostScores = quizData.hostScores || [];
    let finalResponses = parsedResponses;
    
    if (quizData.settings?.allowRepeat !== false && hostScores.length > 0) {
      const groups: any[][] = [];
      for (const resp of parsedResponses) {
        (resp as any).calculatedScore = calculateScore(resp.participantScores, hostScores, questionsList.length);
        
        // Find if this response belongs to any existing grouped user
        let foundGroupIdx = -1;
        for (let gIdx = 0; gIdx < groups.length; gIdx++) {
          const group = groups[gIdx];
          const hasMatch = group.some(existing => {
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
      
      // For each group, select the one with the maximum score
      finalResponses = groups.map(group => {
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

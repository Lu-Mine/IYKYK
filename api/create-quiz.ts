import crypto from 'node:crypto';
import { DEFAULT_QUIZ_SETTINGS, getDb } from './_lib/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostName, title, description, questions, hostScores, createdAt, deviceInfo, secret, settings } = req.body;

  if (!title || !questions || !hostScores || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = getDb();
    const quizIdStr = crypto.randomBytes(12).toString('hex');
    const createdAtIso = createdAt && !Number.isNaN(Date.parse(createdAt))
      ? new Date(createdAt).toISOString()
      : new Date().toISOString();
    const normalizedSettings = settings || DEFAULT_QUIZ_SETTINGS;

    db.prepare(`
      INSERT INTO quizzes (
        id, user_id, host_name, title, description,
        questions, host_scores, settings, secret, device_info, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      quizIdStr,
      quizIdStr,
      hostName ?? null,
      title,
      description ?? null,
      JSON.stringify(questions),
      JSON.stringify(hostScores),
      JSON.stringify(normalizedSettings),
      secret,
      deviceInfo ?? null,
      createdAtIso
    );

    return res.status(200).json({ message: 'Quiz saved successfully', userId: quizIdStr });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

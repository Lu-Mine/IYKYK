export interface QuizDataPayload {
  userId: string;
  hostName: string;
  secret: string;
  title: string;
  description: string;
  questions: string[];
  hostScores: number[];
  deviceInfo: string;
  createdAt: string;
}

export interface QuizSubmissionPayload {
  quizId: string;
  participantName: string;
  participantScores: number[];
  deviceInfo: string;
  createdAt: string;
}

/**
 * 提交试卷数据到 Vercel Serverless API
 */
export async function saveQuizToVercel(payload: QuizDataPayload): Promise<string> {
  const response = await fetch('/api/create-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save quiz');
  }

  const data = await response.json();
  return data.userId;
}

/**
 * 提交答案到 Vercel Serverless API
 */
export async function submitQuizResponse(payload: QuizSubmissionPayload): Promise<string> {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit response');
  }

  const data = await response.json();
  return data.responseId;
}

/**
 * 从 Vercel Serverless API 获取试卷内容
 */
export async function fetchQuiz(quizId: string) {
  const response = await fetch(`/api/get-quiz?quizId=${quizId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('QUIZ_NOT_FOUND');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quiz');
  }

  return await response.json();
}

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
    const errorData = await response.json();
    const error = new Error(errorData.error || 'Failed to submit response');
    (error as any).debug = errorData.debug;
    throw error;
  }

  const data = await response.json();
  return data.responseId;
}

/**
 * 从 Vercel Serverless API 获取试卷内容
 */
export async function fetchQuiz(quizId: string) {
  const response = await fetch(`/api/get-quiz?quizId=${encodeURIComponent(quizId)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('QUIZ_NOT_FOUND');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quiz');
  }

  return await response.json();
}

/**
 * 获取试卷的所有回答（需要密语）
 */
export async function fetchResults(quizId: string, secret: string) {
  const response = await fetch(`/api/results?quizId=${encodeURIComponent(quizId)}&secret=${encodeURIComponent(secret)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch results');
  }

  return await response.json();
}

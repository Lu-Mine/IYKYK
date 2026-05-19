export interface QuizDataPayload {
  hostName: string;
  secret: string;
  title?: string;
  description?: string;
  questions: string[];
  hostScores: number[];
}

/**
 * 提交试卷数据到 Vercel Serverless API
 * 这里预留了与 Vercel 数据库对接的 API 结构。
 */
export async function saveQuizToVercel(payload: QuizDataPayload): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // No real backend exists yet, so we return a dummy ID and save to local storage for testing
  const dummyId = `dummy_user_${Math.random().toString(36).substring(2, 11)}`;
  
  try {
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '{}');
    quizzes[dummyId] = payload;
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  } catch (error) {
    console.error('Failed to save quiz to local storage', error);
  }
  
  return dummyId;
}

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import createQuizHandler from './api/create-quiz.js';
import getQuizHandler from './api/get-quiz.js';
import submitHandler from './api/submit.js';
import resultsHandler from './api/results.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('=== [Diagnostic] Checking Environment Variables ===');
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  console.log('KV_REST_API_URL configured:', kvUrl ? `Yes (length: ${kvUrl.length})` : 'No');
  console.log('KV_REST_API_TOKEN configured:', kvToken ? `Yes (length: ${kvToken.length})` : 'No');
  if (kvUrl) {
    console.log('KV_REST_API_URL prefix:', kvUrl.substring(0, 15) + '...');
    if (kvUrl.startsWith('"') || kvUrl.startsWith("'")) {
      console.warn('WARNING: KV_REST_API_URL starts with quotation marks! This might cause connection errors.');
    }
  }
  console.log('==================================================');

  app.use(express.json());

  // API routes
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  app.post('/api/create-quiz', async (req, res) => {
    try {
      await (createQuizHandler as any)(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/get-quiz', async (req, res) => {
    try {
      await (getQuizHandler as any)(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/submit', async (req, res) => {
    try {
      await (submitHandler as any)(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/results', async (req, res) => {
    try {
      await (resultsHandler as any)(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

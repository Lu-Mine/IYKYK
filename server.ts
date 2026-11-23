import 'dotenv/config';
import express from 'express';
import { getDb, closeDb } from './api/_lib/db.js';
import createQuizHandler from './api/create-quiz.js';
import getQuizHandler from './api/get-quiz.js';
import submitHandler from './api/submit.js';
import resultsHandler from './api/results.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3300;
  const HOST = process.env.HOST || '127.0.0.1';

  // Ensure SQLite DB and schema are initialized at startup
  getDb();

  app.use(express.json());

  app.get('/healthz', (_req, res) => {
    try {
      getDb().prepare('SELECT 1').get();
      res.status(200).json({ ok: true, uptime: process.uptime() });
    } catch (error) {
      console.error('[Healthz] SQLite check failed:', error);
      res.status(500).json({ ok: false });
    }
  });

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

  // Vite middleware for development (in production nginx serves dist/ directly)
  if (process.env.NODE_ENV !== 'production') {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = (await import(vitePkg)) as typeof import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

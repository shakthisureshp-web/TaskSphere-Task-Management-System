import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB, isUsingMongoose } from './server/db/connection.js';
import { dbService } from './server/services/databaseService.js';
import { initEmailTransporter } from './server/services/emailService.js';
import { authRouter } from './server/routes/authRoutes.js';
import { employeeRouter } from './server/routes/employeeRoutes.js';
import { taskRouter } from './server/routes/taskRoutes.js';
import { notificationRouter } from './server/routes/notificationRoutes.js';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to database and seed sample data
  const dbInfo = await connectDB();
  await dbService.initSeedData();
  await initEmailTransporter();

  // API health status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      database: isUsingMongoose() ? 'MongoDB (Mongoose)' : 'Persistent Embedded Store (Fallback)',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/employees', employeeRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/notifications', notificationRouter);

  // Serve Frontend via Vite dev middleware or static dist
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TaskSphere MERN Server running at http://localhost:${PORT}`);
    console.log(`📦 Database Mode: ${isUsingMongoose() ? 'MongoDB' : 'Resilient File Store'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});

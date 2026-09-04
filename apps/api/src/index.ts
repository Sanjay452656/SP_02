import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import revisionRoutes from './routes/revisions';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost (dev), Chrome extensions, and Vercel deployments
    if (
      !origin ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('chrome-extension://') ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/stats', statsRoutes);

// Health check routes for UptimeRobot
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'leetcode-tracker-api',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});

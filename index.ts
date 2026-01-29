import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import messageRoutes from './routes/messages';
import publicRoutes from './routes/public';
import fileRoutes from './routes/files';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   MIDDLEWARE
====================== */

// ✅ CORS – DEV SAFE (no more port issues)
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "OSF Backend is running 🚀",
    time: new Date().toISOString(),
  });
});

/* ======================
   ROUTES
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/files', fileRoutes);

/* ======================
   DATABASE
====================== */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables!');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error(
          '💡 Windows: netstat -ano | findstr :5000  then  taskkill /PID <PID> /F'
        );
      } else {
        console.error('❌ Server Error:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

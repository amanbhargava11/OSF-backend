import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import messageRoutes from './routes/messages';
import publicRoutes from './routes/public';
import fileRoutes from './routes/files';
import activityRoutes from './routes/activities';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activities', activityRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables!');
  console.error('Please create a .env file with MONGODB_URI');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    
    // Handle server errors gracefully
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error('💡 Solution: Kill the process using port 5000 or change PORT in .env');
        console.error('   Windows: netstat -ano | findstr :5000  then  taskkill /PID <PID> /F');
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

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

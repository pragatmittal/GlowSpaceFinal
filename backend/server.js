const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const chatRoutes = require('./routes/chat.routes');
const emotionRoutes = require('./routes/emotion.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const videoRoutes = require('./routes/video.routes');
const counselorRoutes = require('./routes/counselor.routes');
const moodRoutes = require('./routes/mood.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const profileRoutes = require('./routes/profile.routes');

// Config
const app = express();
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ['GET', 'POST']
  }
});

// Make io instance available to routes
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);

// Mount assessment routes
const assessmentRoutes = require('./routes/assessment');
app.use('/api/assessment', assessmentRoutes);

// Database connection
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB:', process.env.MONGODB_URI);
  // Start the server only after MongoDB connection is established
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/google');
    console.log('- POST /api/auth/forgot-password');
    console.log('- POST /api/auth/reset-password');
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a chat room
  socket.on('joinRoom', async ({ username, room }) => {
    try {
      console.log(`User ${socket.id} joining room: ${room}`);
      socket.join(room);
      
      // Get chat history
      const Message = require('./models/Message.model');
      const messages = await Message.find({ room })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();

      // Send chat history to the joining user
      socket.emit('chatHistory', {
        messages,
        room
      });
    } catch (err) {
      console.error('Error joining room:', err);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'GlowSpace API is running',
    version: '1.0.0',
    endpoints: [
      { path: '/api/auth', description: 'Authentication (register, login, password reset, Google OAuth)' },
      { path: '/api/users', description: 'User management' },
      { path: '/api/posts', description: 'Posts and content' },
      { path: '/api/chat', description: 'Chat and messaging' },
      { path: '/api/emotions', description: 'Emotion detection' },
      { path: '/api/appointments', description: 'Appointments and scheduling' },
      { path: '/api/video', description: 'Video call features' },
      { path: '/api/counselors', description: 'Counselor management' },
      { path: '/api/assessment/trauma', method: 'POST', description: 'Analyze trauma history text' },
      { path: '/api/assessment/medication', method: 'POST', description: 'Analyze medication history text' },
      { path: '/api/assessment/voice', method: 'POST', description: 'Analyze voice input (audio)' },
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      details: err.message 
    });
  }
  
  // Default error response
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ 
    error: message,
    status: status 
  });
});
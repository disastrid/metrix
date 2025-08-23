require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Database
const { MongoClient } = require('mongodb');

const app = express();
const server = createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Socket.io compatibility
}));
app.use(cors());

// MongoDB connection
let db;
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db();
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
const studiesApi = require('./routes/api/studies');
const participantApi = require('./routes/api/participant');
const authApi = require('./routes/api/auth');

app.use('/api/studies', studiesApi);
app.use('/api/participant', participantApi);
app.use('/api/auth', authApi);

// Serve specific pages (before static middleware)
app.get('/participant/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/participant.html'));
});

// Serve authentication pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/setup.html'));
});

app.get('/create-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/create-account.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/forgot-password.html'));
});

app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/landing.html'));
});

// Serve admin login (legacy route)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// Serve admin dashboard
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin-dashboard-new.html'));
});

// Serve Vue.js frontend (built files go in public/)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'public/js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Catch-all handler: send back Vue's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a specific study room (by study code)
  socket.on('join_study', (studyCode) => {
    socket.join(`study_${studyCode}`);
    console.log(`Socket ${socket.id} joined study ${studyCode}`);
  });

  // Leave a study room
  socket.on('leave_study', (studyCode) => {
    socket.leave(`study_${studyCode}`);
    console.log(`Socket ${socket.id} left study ${studyCode}`);
  });

  // Study control events (from control panel)
  socket.on('start_practice', (studyCode) => {
    console.log(`Starting practice for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('practice_started');
  });

  socket.on('stop_practice', (studyCode) => {
    console.log(`Stopping practice for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('practice_stopped');
  });

  socket.on('start_segment', ({ studyCode, segmentId }) => {
    console.log(`Starting segment ${segmentId} for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('segment_started', { segmentId });
  });

  socket.on('stop_segment', ({ studyCode, segmentId }) => {
    console.log(`Stopping segment ${segmentId} for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('segment_stopped', { segmentId });
  });

  // Show random usernames
  socket.on('show_usernames', (studyCode) => {
    console.log(`Showing random usernames for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('show_usernames');
  });

  socket.on('hide_usernames', (studyCode) => {
    console.log(`Hiding usernames for study ${studyCode}`);
    io.to(`study_${studyCode}`).emit('hide_usernames');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io instance for use in routes
app.io = io;

// Attach server to app for bin/www
app.server = server;

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  
  // API error response
  if (req.path.startsWith('/api/')) {
    res.json({
      error: app.get('env') === 'development' ? err.message : 'Internal server error'
    });
  } else {
    // For non-API routes, serve the Vue app
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }
});

module.exports = app;
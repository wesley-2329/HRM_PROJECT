const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// Pass Socket.io instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket connection logic
io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);
  
  socket.on('join', (data) => {
    if (data.role === 'hr') {
      socket.join('hr');
      console.log(`Socket ${socket.id} joined room: hr`);
    }
    if (data.userId) {
      socket.join(data.userId);
      console.log(`Socket ${socket.id} joined room: ${data.userId}`);
    }
    socket.join('discussion');
    console.log(`Socket ${socket.id} joined room: discussion`);
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

// Root path indicator
app.get('/', (req, res) => {
  res.send('HRorbit HRM API is running...');
});

// Register routes
const loadRoute = (rPath) => {
  const r = require(rPath);
  return r.default || r;
};
app.use('/api/auth', loadRoute('./routes/auth'));
app.use('/api/employees', loadRoute('./routes/employees'));
app.use('/api/leaves', loadRoute('./routes/leaves'));
app.use('/api/tasks', loadRoute('./routes/tasks'));
app.use('/api/tickets', loadRoute('./routes/tickets'));
app.use('/api/candidates', loadRoute('./routes/candidates'));
app.use('/api/meetings', loadRoute('./routes/meetings'));
app.use('/api/timesheet', loadRoute('./routes/timesheet'));
app.use('/api/trainings', loadRoute('./routes/trainings'));
app.use('/api/notifications', loadRoute('./routes/notifications'));
app.use('/api/chat', loadRoute('./routes/chat'));
app.use('/api/hr-notes', loadRoute('./routes/hrnotes'));
app.use('/api/warning-letters', loadRoute('./routes/warnings'));
app.use('/api/discussion', loadRoute('./routes/discussion'));
app.use('/api/daily-reports', loadRoute('./routes/dailyreports'));
app.use('/api/org', loadRoute('./routes/org'));
app.use('/api/vault', loadRoute('./routes/vault'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error occurred' });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running in dev mode on port ${PORT}`);
  });
}

module.exports = app;

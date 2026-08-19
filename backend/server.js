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

// Database connection middleware for serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (error) {
    // Handled in connectDB, proceed to route fallback
  }
  next();
});
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

// Stateful Offline Mock Database Sync Middleware
app.use((req, res, next) => {
  const clientMockState = req.headers['x-mock-state'];
  if (clientMockState) {
    try {
      const parsedState = JSON.parse(clientMockState);
      
      // Sanitize old "mock_" string IDs to valid 24-char hex IDs
      const sanitizeObj = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (let key in obj) {
          if (key === '_id' && typeof obj[key] === 'string' && obj[key].startsWith('mock_')) {
            let hash = 0;
            for (let i = 0; i < obj[key].length; i++) {
              hash = obj[key].charCodeAt(i) + ((hash << 5) - hash);
            }
            let hex = '';
            for (let i = 0; i < 24; i++) {
              hex += '0123456789abcdef'[Math.abs((hash + i) % 16)];
            }
            obj[key] = hex;
          } else if (typeof obj[key] === 'object') {
            sanitizeObj(obj[key]);
          }
        }
      };
      sanitizeObj(parsedState);

      const { setMockState } = require('./config/mock_data');
      setMockState(parsedState);
    } catch (e) {
      console.error('Failed to parse client mock state:', e);
    }
  }
  
  const originalJson = res.json;
  res.json = function(body) {
    try {
      const { getMockState } = require('./config/mock_data');
      const currentState = getMockState();
      res.setHeader('x-mock-state', JSON.stringify(currentState));
      res.setHeader('Access-Control-Expose-Headers', 'x-mock-state');
    } catch (e) {
      console.error('Failed to set response mock state:', e);
    }
    return originalJson.call(this, body);
  };
  next();
});

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
  res.send('HR O HRM API is running...');
});

// Register routes statically to ensure Vercel's bundler bundles all route files
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute.default || authRoute);

const employeesRoute = require('./routes/employees');
app.use('/api/employees', employeesRoute.default || employeesRoute);

const leavesRoute = require('./routes/leaves');
app.use('/api/leaves', leavesRoute.default || leavesRoute);

const tasksRoute = require('./routes/tasks');
app.use('/api/tasks', tasksRoute.default || tasksRoute);

const ticketsRoute = require('./routes/tickets');
app.use('/api/tickets', ticketsRoute.default || ticketsRoute);

const candidatesRoute = require('./routes/candidates');
app.use('/api/candidates', candidatesRoute.default || candidatesRoute);

const meetingsRoute = require('./routes/meetings');
app.use('/api/meetings', meetingsRoute.default || meetingsRoute);

const timesheetRoute = require('./routes/timesheet');
app.use('/api/timesheet', timesheetRoute.default || timesheetRoute);

const trainingsRoute = require('./routes/trainings');
app.use('/api/trainings', trainingsRoute.default || trainingsRoute);

const notificationsRoute = require('./routes/notifications');
app.use('/api/notifications', notificationsRoute.default || notificationsRoute);

const chatRoute = require('./routes/chat');
app.use('/api/chat', chatRoute.default || chatRoute);

const hrNotesRoute = require('./routes/hrnotes');
app.use('/api/hr-notes', hrNotesRoute.default || hrNotesRoute);

const warningsRoute = require('./routes/warnings');
app.use('/api/warning-letters', warningsRoute.default || warningsRoute);

const discussionRoute = require('./routes/discussion');
app.use('/api/discussion', discussionRoute.default || discussionRoute);

const dailyReportsRoute = require('./routes/dailyreports');
app.use('/api/daily-reports', dailyReportsRoute.default || dailyReportsRoute);

const orgRoute = require('./routes/org');
app.use('/api/org', orgRoute.default || orgRoute);

const vaultRoute = require('./routes/vault');
app.use('/api/vault', vaultRoute.default || vaultRoute);

const recruitmentRoute = require('./routes/recruitment');
app.use('/api/recruitment', recruitmentRoute.default || recruitmentRoute);

const performanceRoute = require('./routes/performance');
app.use('/api/performance', performanceRoute.default || performanceRoute);

const engagementRoute = require('./routes/engagement');
app.use('/api/engagement', engagementRoute.default || engagementRoute);

const trainingRoute = require('./routes/training');
app.use('/api/training', trainingRoute.default || trainingRoute);

const budgetRoute = require('./routes/budget');
app.use('/api/budget', budgetRoute.default || budgetRoute);

const complianceRoute = require('./routes/compliance');
app.use('/api/compliance', complianceRoute.default || complianceRoute);

const exitRoute = require('./routes/exit');
app.use('/api/exit', exitRoute.default || exitRoute);
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
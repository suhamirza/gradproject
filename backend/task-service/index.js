require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

// Import all models and associations
const {
  Organization,
  OrganizationMember,
  Project,
  Task,
  TaskAssignee,
  TaskComment,
  TaskAttachment,
  TaskHistory
} = require('./models/associations');

// Controllers
const organizationController = require('./controllers/OrganizationController');
const projectController = require('./controllers/ProjectController');
const tasksController = require('./controllers/TasksController');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint (no auth required)
app.get('/', (req, res) => {
  res.json({ message: 'Task Service API is running' });
});

// All routes are protected by auth middleware
app.use('/organizations', authMiddleware, organizationController);
app.use('/projects', authMiddleware, projectController);
app.use('/tasks', authMiddleware, tasksController);

async function connectWithRetry(retries = 10, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempt ${i} to connect to DB...`);
      await sequelize.authenticate();
      console.log('✅ Database connection established.');
      await sequelize.sync({ alter: true });
      console.log('✅ Models synchronized.');
      return;
    } catch (err) {
      console.error(`❌ DB connection failed: ${err.message}`);
      if (i < retries) {
        console.log(`🔁 Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('❌ Max retries reached. Exiting.');
        process.exit(1);
      }
    }
  }
}

(async () => {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
})();

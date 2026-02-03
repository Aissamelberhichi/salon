const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { FRONTEND_URL } = require('./config/env');
const { generalApiLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', generalApiLimiter, routes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
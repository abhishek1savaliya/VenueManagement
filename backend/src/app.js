const express = require('express');
const cors = require('cors');
const publicVenuesRouter = require('./routes/public/venues');
const authRouter = require('./routes/auth');
const adminAuthRouter = require('./routes/admin/auth');
const adminUsersRouter = require('./routes/admin/users');
const adminVenuesRouter = require('./routes/admin/venues');
const adminAuditLogsRouter = require('./routes/admin/auditLogs');
const adminDashboardRouter = require('./routes/admin/dashboard');
const adminAnalyticsRouter = require('./routes/admin/analytics');
const { requireAdmin } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'MyVenue API is running' });
});

// User auth
app.use('/api/auth', authRouter);

// Public API — read-only, active venues only
app.use('/api/public/venues', publicVenuesRouter);

// Admin auth (login is open; me/credentials require token)
app.use('/api/admin/auth', adminAuthRouter);

// Admin API — protected
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/venues', requireAdmin, adminVenuesRouter);
app.use('/api/admin/audit-logs', requireAdmin, adminAuditLogsRouter);
app.use('/api/admin/dashboard', requireAdmin, adminDashboardRouter);
app.use('/api/admin/analytics', requireAdmin, adminAnalyticsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

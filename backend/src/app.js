const express = require('express');
const cors = require('cors');
const publicVenuesRouter = require('./routes/public/venues');
const adminVenuesRouter = require('./routes/admin/venues');
const adminAuditLogsRouter = require('./routes/admin/auditLogs');
const adminDashboardRouter = require('./routes/admin/dashboard');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'MyVenue API is running' });
});

// Public API — read-only, active venues only
app.use('/api/public/venues', publicVenuesRouter);

// Admin API — full CRUD + audit logs + dashboard
app.use('/api/admin/venues', adminVenuesRouter);
app.use('/api/admin/audit-logs', adminAuditLogsRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

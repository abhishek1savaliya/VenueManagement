const auditLogService = require('../services/auditLogService');

function notFoundHandler(req, res) {
  auditLogService.logFromRequest(req, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    actionType: 'no_access',
  });

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    auditLogService.logFromRequest(req, {
      statusCode: 409,
      message: 'A record with this value already exists',
      actionType: 'warning',
    });
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    auditLogService.logFromRequest(req, {
      statusCode: 404,
      message: 'Record not found',
      actionType: 'no_access',
    });
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  if (err.code === 'P2003') {
    auditLogService.logFromRequest(req, {
      statusCode: 400,
      message: 'Invalid data provided',
      actionType: 'warning',
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
  }

  if (err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1017') {
    auditLogService.logFromRequest(req, {
      statusCode: 503,
      message: 'Database is temporarily unavailable. Please try again later.',
      actionType: 'downtime',
      err,
    });
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Please try again later.',
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    auditLogService.logFromRequest(req, {
      statusCode: 400,
      message: 'Photo must be 5 MB or smaller',
      actionType: 'warning',
    });
    return res.status(400).json({
      success: false,
      message: 'Photo must be 5 MB or smaller',
    });
  }

  if (err.message === 'Only image files are allowed') {
    auditLogService.logFromRequest(req, {
      statusCode: 400,
      message: err.message,
      actionType: 'warning',
    });
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const status = err.status || 500;
  auditLogService.logFromRequest(req, {
    statusCode: status,
    message: err.message || 'An unexpected error occurred',
    err,
  });

  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = { notFoundHandler, errorHandler };

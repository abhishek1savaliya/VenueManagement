function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
  }

  if (err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1017') {
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Please try again later.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = { notFoundHandler, errorHandler };

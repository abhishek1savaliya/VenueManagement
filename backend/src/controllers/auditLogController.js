const venueService = require('../services/venueService');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseAuditLogQuery(query) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const date = typeof query.date === 'string' ? query.date.trim() : '';

  if (Number.isNaN(page) || page < 1) {
    return { error: 'Invalid page number' };
  }

  if (Number.isNaN(limit) || limit < 1) {
    return { error: 'Invalid limit' };
  }

  if (date && !DATE_PATTERN.test(date)) {
    return { error: 'Date must be in YYYY-MM-DD format' };
  }

  return { page, limit, date: date || undefined };
}

async function listAuditLogs(req, res, next) {
  try {
    const parsed = parseAuditLogQuery(req.query);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const result = await venueService.findPaginatedAuditLogs(parsed);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };

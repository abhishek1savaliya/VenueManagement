const venueService = require('../services/venueService');

async function listAuditLogs(req, res, next) {
  try {
    const logs = await venueService.findAllAuditLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };

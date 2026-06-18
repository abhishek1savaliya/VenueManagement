const venueService = require('../services/venueService');

async function getDashboard(req, res, next) {
  try {
    const stats = await venueService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };

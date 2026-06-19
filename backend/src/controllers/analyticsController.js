const venueAnalyticsService = require('../services/venueAnalyticsService');

async function getAnalytics(req, res, next) {
  try {
    const data = await venueAnalyticsService.getAdminAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };

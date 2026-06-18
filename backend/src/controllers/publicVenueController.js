const venueService = require('../services/venueService');

async function listPublicVenues(req, res, next) {
  try {
    const { search } = req.query;
    const venues = await venueService.findAll({ search, activeOnly: true });
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
}

async function getPublicVenue(req, res, next) {
  try {
    const venue = await venueService.findById(req.venueId);
    if (!venue || venue.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPublicVenues,
  getPublicVenue,
};

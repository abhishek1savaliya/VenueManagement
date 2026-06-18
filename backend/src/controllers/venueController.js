const venueService = require('../services/venueService');

async function listVenues(req, res, next) {
  try {
    const { search } = req.query;
    const venues = await venueService.findAll({ search });
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
}

async function getVenue(req, res, next) {
  try {
    const venue = await venueService.findById(req.venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
}

async function createVenue(req, res, next) {
  try {
    const venue = await venueService.create(req.validatedBody);
    res.status(201).json({ success: true, data: venue, message: 'Venue created successfully' });
  } catch (err) {
    next(err);
  }
}

async function updateVenue(req, res, next) {
  try {
    const venue = await venueService.update(req.venueId, req.validatedBody);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, data: venue, message: 'Venue updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteVenue(req, res, next) {
  try {
    const venue = await venueService.remove(req.venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, data: venue, message: 'Venue deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
};

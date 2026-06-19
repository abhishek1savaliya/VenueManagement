const venueService = require('../services/venueService');

function parseListQuery(query) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (Number.isNaN(page) || page < 1) {
    return { error: 'Invalid page number' };
  }

  if (Number.isNaN(limit) || limit < 1) {
    return { error: 'Invalid limit' };
  }

  return { page, limit, search };
}

async function listVenues(req, res, next) {
  try {
    const parsed = parseListQuery(req.query);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const { page, limit, search } = parsed;
    const result = await venueService.findPaginated({
      search: search || undefined,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.venues,
      pagination: result.pagination,
    });
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

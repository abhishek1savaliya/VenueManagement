const venueService = require('../services/venueService');

const VALID_SORTS = ['name_asc', 'name_desc', 'newest'];

function parseListQuery(query) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 9;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sort = VALID_SORTS.includes(query.sort) ? query.sort : 'name_asc';

  if (Number.isNaN(page) || page < 1) {
    return { error: 'Invalid page number' };
  }

  if (Number.isNaN(limit) || limit < 1) {
    return { error: 'Invalid limit' };
  }

  return { page, limit, search, sort };
}

async function listPublicVenues(req, res, next) {
  try {
    const parsed = parseListQuery(req.query);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const { page, limit, search, sort } = parsed;
    const result = await venueService.findPaginated({
      search: search || undefined,
      activeOnly: true,
      page,
      limit,
      sort,
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

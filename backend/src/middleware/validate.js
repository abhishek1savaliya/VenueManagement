const { VALID_STATUSES } = require('../services/venueService');

function validateVenueBody(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      errors.push({ field: 'name', message: 'Venue name is required' });
    } else {
      data.name = body.name.trim();
    }
  }

  if (!partial || body.address !== undefined) {
    if (!body.address || typeof body.address !== 'string' || !body.address.trim()) {
      errors.push({ field: 'address', message: 'Address is required' });
    } else {
      data.address = body.address.trim();
    }
  }

  if (!partial || body.status !== undefined) {
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      errors.push({ field: 'status', message: 'Status is required and must be active or inactive' });
    } else {
      data.status = body.status;
    }
  }

  if (body.description !== undefined) {
    data.description = typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (body.imageUrls !== undefined) {
    if (!Array.isArray(body.imageUrls)) {
      errors.push({ field: 'imageUrls', message: 'Image URLs must be an array' });
    } else {
      data.imageUrls = body.imageUrls
        .filter((url) => typeof url === 'string' && url.trim())
        .map((url) => url.trim());
    }
  }

  return { errors, data };
}

function validateVenueCreate(req, res, next) {
  const { errors, data } = validateVenueBody(req.body);
  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  req.validatedBody = data;
  next();
}

function validateVenueUpdate(req, res, next) {
  const { errors, data } = validateVenueBody(req.body, { partial: false });
  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  req.validatedBody = data;
  next();
}

function validateIdParam(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid venue ID',
    });
  }
  req.venueId = id;
  next();
}

module.exports = {
  validateVenueCreate,
  validateVenueUpdate,
  validateIdParam,
};

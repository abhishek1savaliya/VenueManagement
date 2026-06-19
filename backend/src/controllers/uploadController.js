const storageService = require('../services/storageService');

async function uploadVenuePhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required',
      });
    }

    const venueId = req.body.venueId ? parseInt(req.body.venueId, 10) : null;
    if (req.body.venueId && (Number.isNaN(venueId) || venueId < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid venue ID',
      });
    }

    const imageUrl = await storageService.uploadVenuePhoto(
      req.file.buffer,
      req.file.mimetype,
      {
        venueId,
        originalName: req.file.originalname,
      }
    );

    res.json({
      success: true,
      message: 'Photo uploaded',
      data: { imageUrl },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadVenuePhoto,
};

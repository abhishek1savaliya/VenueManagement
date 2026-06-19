const express = require('express');
const venueController = require('../../controllers/venueController');
const uploadController = require('../../controllers/uploadController');
const { uploadVenuePhoto } = require('../../middleware/upload');
const {
  validateVenueCreate,
  validateVenueUpdate,
  validateIdParam,
} = require('../../middleware/validate');

const router = express.Router();

router.get('/', venueController.listVenues);
router.post(
  '/upload-photo',
  uploadVenuePhoto.single('photo'),
  uploadController.uploadVenuePhoto
);
router.get('/:id', validateIdParam, venueController.getVenue);
router.post('/', validateVenueCreate, venueController.createVenue);
router.put('/:id', validateIdParam, validateVenueUpdate, venueController.updateVenue);
router.delete('/:id', validateIdParam, venueController.deleteVenue);

module.exports = router;

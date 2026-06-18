const express = require('express');
const venueController = require('../../controllers/venueController');
const {
  validateVenueCreate,
  validateVenueUpdate,
  validateIdParam,
} = require('../../middleware/validate');

const router = express.Router();

router.get('/', venueController.listVenues);
router.get('/:id', validateIdParam, venueController.getVenue);
router.post('/', validateVenueCreate, venueController.createVenue);
router.put('/:id', validateIdParam, validateVenueUpdate, venueController.updateVenue);
router.delete('/:id', validateIdParam, venueController.deleteVenue);

module.exports = router;

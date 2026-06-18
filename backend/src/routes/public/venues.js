const express = require('express');
const publicVenueController = require('../../controllers/publicVenueController');
const { validateIdParam } = require('../../middleware/validate');

const router = express.Router();

router.get('/', publicVenueController.listPublicVenues);
router.get('/:id', validateIdParam, publicVenueController.getPublicVenue);

module.exports = router;

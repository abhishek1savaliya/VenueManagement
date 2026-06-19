const express = require('express');
const adminUserController = require('../../controllers/adminUserController');
const { requireAdmin } = require('../../middleware/auth');
const { validateUserIdParam } = require('../../middleware/validateAuth');

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', adminUserController.getUserStats);
router.get('/', adminUserController.listUsers);
router.put('/:id/deactivate', validateUserIdParam, adminUserController.deactivateUser);
router.put('/:id/activate', validateUserIdParam, adminUserController.activateUser);

module.exports = router;

const express = require('express');
const adminAuthController = require('../../controllers/adminAuthController');
const { requireAdmin } = require('../../middleware/auth');
const {
  validateAdminLogin,
  validateAdminCredentials,
} = require('../../middleware/validateAuth');

const router = express.Router();

router.post('/login', validateAdminLogin, adminAuthController.login);
router.get('/me', requireAdmin, adminAuthController.getMe);
router.put('/credentials', requireAdmin, validateAdminCredentials, adminAuthController.changeCredentials);

module.exports = router;

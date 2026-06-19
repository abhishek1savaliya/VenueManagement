const express = require('express');
const authController = require('../controllers/authController');
const { requireUser } = require('../middleware/auth');
const { uploadVenuePhoto } = require('../middleware/upload');
const {
  validateSignup,
  validateSignin,
  validateProfileUpdate,
  validateChangePassword,
  validateDeleteAccount,
} = require('../middleware/validateAuth');

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/signin', validateSignin, authController.signin);
router.get('/me', requireUser, authController.getMe);
router.put('/profile', requireUser, validateProfileUpdate, authController.updateProfile);
router.put('/change-password', requireUser, validateChangePassword, authController.changePassword);
router.delete('/account', requireUser, validateDeleteAccount, authController.deleteAccount);
router.post(
  '/upload-photo',
  requireUser,
  uploadVenuePhoto.single('photo'),
  authController.uploadPhoto
);

module.exports = router;

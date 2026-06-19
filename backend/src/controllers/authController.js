const userService = require('../services/userService');

async function signup(req, res, next) {
  try {
    const result = await userService.signup(req.validatedBody);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function signin(req, res, next) {
  try {
    const result = await userService.signin(req.validatedBody);
    res.json({
      success: true,
      data: result,
      message: 'Signed in successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({ success: true, data: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.id, req.validatedBody);
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    await userService.changePassword(req.user.id, req.validatedBody);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo file is required' });
    }

    const user = await userService.uploadUserPhoto(
      req.user.id,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.json({ success: true, data: user, message: 'Profile photo updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    await userService.deleteAccount(req.user.id, req.validatedBody);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  signin,
  getMe,
  updateProfile,
  changePassword,
  uploadPhoto,
  deleteAccount,
};

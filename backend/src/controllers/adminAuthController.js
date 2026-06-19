const adminService = require('../services/adminService');

async function login(req, res, next) {
  try {
    const result = await adminService.login(req.validatedBody);
    res.json({
      success: true,
      data: result,
      message: 'Admin signed in successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json({ success: true, data: req.admin });
}

async function changeCredentials(req, res, next) {
  try {
    const result = await adminService.changeCredentials(req.admin.id, req.validatedBody);
    res.json({
      success: true,
      data: result,
      message: 'Credentials updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getMe, changeCredentials };

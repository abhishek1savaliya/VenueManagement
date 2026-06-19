const jwt = require('jsonwebtoken');
const config = require('../config');

function signUserToken(userId) {
  return jwt.sign({ userId, type: 'user' }, config.jwtSecret, { expiresIn: '7d' });
}

function signAdminToken(adminId) {
  return jwt.sign({ adminId, type: 'admin' }, config.jwtSecret, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signUserToken, signAdminToken, verifyToken };

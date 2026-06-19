const { verifyToken } = require('../lib/jwt');
const userService = require('../services/userService');
const adminService = require('../services/adminService');
const auditLogService = require('../services/auditLogService');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

function sendUnauthorized(req, res, message) {
  auditLogService.logFromRequest(req, {
    statusCode: 401,
    message,
    actionType: 'no_access',
  });
  return res.status(401).json({ success: false, message });
}

async function requireUser(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendUnauthorized(req, res, 'Authentication required');
    }

    const payload = verifyToken(token);
    if (payload.type !== 'user') {
      return sendUnauthorized(req, res, 'Invalid token');
    }

    const user = await userService.getUserById(payload.userId);
    if (!user || user.status !== 'active') {
      return sendUnauthorized(req, res, 'Account not found or deactivated');
    }

    req.user = user;
    next();
  } catch {
    return sendUnauthorized(req, res, 'Invalid or expired token');
  }
}

async function requireAdmin(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendUnauthorized(req, res, 'Admin authentication required');
    }

    const payload = verifyToken(token);
    if (payload.type !== 'admin') {
      return sendUnauthorized(req, res, 'Invalid admin token');
    }

    const admin = await adminService.getAdminById(payload.adminId);
    if (!admin) {
      return sendUnauthorized(req, res, 'Admin not found');
    }

    req.admin = admin;
    next();
  } catch {
    return sendUnauthorized(req, res, 'Invalid or expired token');
  }
}

module.exports = { requireUser, requireAdmin, extractToken };

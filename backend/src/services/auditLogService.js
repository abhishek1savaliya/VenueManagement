const prisma = require('../db/prisma');

const CATEGORIES = ['venue', 'user', 'general'];
const GENERAL_TYPES = ['error', 'fallback', 'downtime', 'no_access', 'warning'];

function fireAndForget(promise) {
  promise.catch((err) => console.error('Audit log write error:', err.message));
}

function formatAuditLog(log) {
  if (!log) return null;
  return {
    id: log.id,
    category: log.category,
    actionType: log.actionType,
    venueName: log.venueName,
    venueId: log.venueId,
    userName: log.userName,
    userId: log.userId,
    message: log.message,
    source: log.source,
    statusCode: log.statusCode,
    timestamp: log.timestamp,
  };
}

function getUserDisplayName(user) {
  return `${user.firstName} ${user.lastName}`;
}

function mapStatusToActionType(status, err) {
  if (status === 503 || ['P1001', 'P1002', 'P1017'].includes(err?.code)) {
    return 'downtime';
  }
  if (status === 401 || status === 403 || status === 404) {
    return 'no_access';
  }
  if (status === 400 || status === 409) {
    return 'warning';
  }
  if (status >= 500) {
    return 'error';
  }
  return 'error';
}

async function logVenue({ actionType, venueName, venueId }, tx) {
  const client = tx || prisma;
  return client.auditLog.create({
    data: {
      category: 'venue',
      actionType,
      venueName,
      venueId,
    },
  });
}

async function logUser({ actionType, userName, userId }, tx) {
  const client = tx || prisma;
  return client.auditLog.create({
    data: {
      category: 'user',
      actionType,
      userName,
      userId,
    },
  });
}

async function logGeneral({ actionType, message, source, statusCode }) {
  if (!GENERAL_TYPES.includes(actionType)) {
    actionType = 'error';
  }

  fireAndForget(
    prisma.auditLog.create({
      data: {
        category: 'general',
        actionType,
        message: message?.slice(0, 2000) || 'Unknown error',
        source: source?.slice(0, 255) || null,
        statusCode: statusCode ?? null,
      },
    })
  );
}

function logFromRequest(req, { statusCode, message, actionType, err }) {
  const source = `${req.method} ${req.originalUrl}`;
  const type = actionType || mapStatusToActionType(statusCode, err);
  const detail = message || err?.message || 'An unexpected error occurred';

  logGeneral({
    actionType: type,
    message: detail,
    source,
    statusCode,
  });
}

async function findPaginated({ category, date, page = 1, limit = 20 } = {}) {
  const where = {};

  if (category && CATEGORIES.includes(category)) {
    where.category = category;
  }

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.timestamp = { gte: start, lt: end };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: safeLimit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    logs: logs.map(formatAuditLog),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasMore: safePage < totalPages,
    },
  };
}

module.exports = {
  CATEGORIES,
  GENERAL_TYPES,
  formatAuditLog,
  getUserDisplayName,
  logVenue,
  logUser,
  logGeneral,
  logFromRequest,
  findPaginated,
};

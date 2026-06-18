const prisma = require('../db/prisma');

const VALID_STATUSES = ['active', 'inactive'];

function formatVenue(venue) {
  if (!venue) return null;
  return {
    id: venue.id,
    name: venue.name,
    address: venue.address,
    description: venue.description || '',
    status: venue.status,
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt,
  };
}

function formatAuditLog(log) {
  if (!log) return null;
  return {
    id: log.id,
    actionType: log.actionType,
    venueName: log.venueName,
    venueId: log.venueId,
    timestamp: log.timestamp,
  };
}

async function findAll({ search, status, activeOnly = false } = {}) {
  const where = {};

  if (activeOnly) {
    where.status = 'active';
  } else if (status) {
    where.status = status;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const venues = await prisma.venue.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return venues.map(formatVenue);
}

async function findById(id) {
  const venue = await prisma.venue.findUnique({ where: { id } });
  return formatVenue(venue);
}

async function create({ name, address, description, status }) {
  return prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        name,
        address,
        description: description || '',
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        actionType: 'created',
        venueName: venue.name,
        venueId: venue.id,
      },
    });

    return formatVenue(venue);
  });
}

async function update(id, { name, address, description, status }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.venue.findUnique({ where: { id } });
    if (!existing) return null;

    const venue = await tx.venue.update({
      where: { id },
      data: {
        name,
        address,
        description: description || '',
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        actionType: 'updated',
        venueName: venue.name,
        venueId: venue.id,
      },
    });

    return formatVenue(venue);
  });
}

async function remove(id) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.venue.findUnique({ where: { id } });
    if (!existing) return null;

    await tx.venue.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        actionType: 'deleted',
        venueName: existing.name,
        venueId: existing.id,
      },
    });

    return formatVenue(existing);
  });
}

async function getDashboardStats() {
  const [totalVenues, activeVenues, inactiveVenues] = await Promise.all([
    prisma.venue.count(),
    prisma.venue.count({ where: { status: 'active' } }),
    prisma.venue.count({ where: { status: 'inactive' } }),
  ]);

  return { totalVenues, activeVenues, inactiveVenues };
}

async function findAllAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return logs.map(formatAuditLog);
}

module.exports = {
  VALID_STATUSES,
  findAll,
  findById,
  create,
  update,
  remove,
  getDashboardStats,
  findAllAuditLogs,
};

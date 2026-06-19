const prisma = require('../db/prisma');
const storageService = require('./storageService');

const VALID_STATUSES = ['active', 'inactive'];

function formatVenue(venue) {
  if (!venue) return null;
  return {
    id: venue.id,
    name: venue.name,
    address: venue.address,
    description: venue.description || '',
    imageUrls: venue.imageUrls || [],
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

async function create({ name, address, description, imageUrls, status }) {
  return prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        name,
        address,
        description: description || '',
        imageUrls: imageUrls || [],
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

async function update(id, { name, address, description, imageUrls, status }) {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) return null;

  const nextImageUrls = imageUrls || [];
  const removedImageUrls = storageService.getRemovedImageUrls(
    existing.imageUrls || [],
    nextImageUrls
  );

  if (removedImageUrls.length) {
    await storageService.deleteVenuePhotos(removedImageUrls);
  }

  const venue = await prisma.$transaction(async (tx) => {
    const updated = await tx.venue.update({
      where: { id },
      data: {
        name,
        address,
        description: description || '',
        imageUrls: nextImageUrls,
        status,
      },
    });

    await tx.auditLog.create({
      data: {
        actionType: 'updated',
        venueName: updated.name,
        venueId: updated.id,
      },
    });

    return updated;
  });

  return formatVenue(venue);
}

async function remove(id) {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) return null;

  const deleted = await prisma.$transaction(async (tx) => {
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

  await storageService.deleteVenuePhotoFolder(id);

  return deleted;
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

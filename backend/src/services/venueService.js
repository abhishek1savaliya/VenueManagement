const prisma = require('../db/prisma');
const storageService = require('./storageService');
const auditLogService = require('./auditLogService');

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
  return auditLogService.formatAuditLog(log);
}

async function findAll({ search, status, activeOnly = false } = {}) {
  const where = buildVenueWhere({ search, status, activeOnly });

  const venues = await prisma.venue.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return venues.map(formatVenue);
}

function buildVenueWhere({ search, status, activeOnly = false } = {}) {
  const where = {};

  if (activeOnly) {
    where.status = 'active';
  } else if (status) {
    where.status = status;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  return where;
}

function buildVenueOrderBy(sort = 'name_asc') {
  const sortMap = {
    name_asc: { name: 'asc' },
    name_desc: { name: 'desc' },
    newest: { createdAt: 'desc' },
  };

  return sortMap[sort] || sortMap.name_asc;
}

async function findPaginated({
  search,
  status,
  activeOnly = false,
  page = 1,
  limit = 9,
  sort = 'name_asc',
} = {}) {
  const where = buildVenueWhere({ search, status, activeOnly });
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [venues, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      orderBy: buildVenueOrderBy(sort),
      skip,
      take: safeLimit,
    }),
    prisma.venue.count({ where }),
  ]);

  return {
    venues: venues.map(formatVenue),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
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

    await auditLogService.logVenue(
      { actionType: 'created', venueName: venue.name, venueId: venue.id },
      tx
    );

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

    await auditLogService.logVenue(
      { actionType: 'updated', venueName: updated.name, venueId: updated.id },
      tx
    );

    return updated;
  });

  return formatVenue(venue);
}

async function remove(id) {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) return null;

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.venue.delete({ where: { id } });

    await auditLogService.logVenue(
      { actionType: 'deleted', venueName: existing.name, venueId: existing.id },
      tx
    );

    return formatVenue(existing);
  });

  await storageService.deleteVenuePhotoFolder(id);

  return deleted;
}

async function getDashboardStats() {
  const userService = require('./userService');
  const [totalVenues, activeVenues, inactiveVenues, totalUsers] = await Promise.all([
    prisma.venue.count(),
    prisma.venue.count({ where: { status: 'active' } }),
    prisma.venue.count({ where: { status: 'inactive' } }),
    userService.countAll(),
  ]);

  return { totalVenues, activeVenues, inactiveVenues, totalUsers };
}

async function findPaginatedAuditLogs(params) {
  return auditLogService.findPaginated(params);
}

async function findAllAuditLogs() {
  const result = await auditLogService.findPaginated({ limit: 1000 });
  return result.logs;
}

module.exports = {
  VALID_STATUSES,
  findAll,
  findPaginated,
  findById,
  create,
  update,
  remove,
  getDashboardStats,
  findAllAuditLogs,
  findPaginatedAuditLogs,
};

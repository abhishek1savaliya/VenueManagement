const prisma = require('../db/prisma');
const { hashPassword, comparePassword } = require('../lib/password');
const { signUserToken } = require('../lib/jwt');
const { uploadProfilePhoto, deleteVenuePhoto } = require('./storageService');
const auditLogService = require('./auditLogService');

const VALID_STATUSES = ['active', 'inactive'];

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function signup({ firstName, lastName, email, phone, password }) {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || null,
      passwordHash,
      status: 'active',
    },
  });

  await auditLogService.logUser({
    actionType: 'created',
    userName: auditLogService.getUserDisplayName(user),
    userId: user.id,
  });

  const token = signUserToken(user.id);
  return { user: sanitizeUser(user), token };
}

async function signin({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (user.status !== 'active') {
    const err = new Error('Your account has been deactivated. Please contact support.');
    err.status = 403;
    throw err;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signUserToken(user.id);
  return { user: sanitizeUser(user), token };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return sanitizeUser(user);
}

async function updateProfile(userId, { firstName, lastName, phone, profilePhotoUrl }) {
  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (phone !== undefined) data.phone = phone || null;
  if (profilePhotoUrl !== undefined) data.profilePhotoUrl = profilePhotoUrl || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  await auditLogService.logUser({
    actionType: 'updated',
    userName: auditLogService.getUserDisplayName(user),
    userId: user.id,
  });

  return sanitizeUser(user);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  const passwordHash = await hashPassword(newPassword);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await auditLogService.logUser({
    actionType: 'updated',
    userName: auditLogService.getUserDisplayName(updated),
    userId: updated.id,
  });
}

async function uploadUserPhoto(userId, buffer, mimeType, originalName) {
  const imageUrl = await uploadProfilePhoto(buffer, mimeType, { userId, originalName });
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profilePhotoUrl: imageUrl },
  });

  await auditLogService.logUser({
    actionType: 'updated',
    userName: auditLogService.getUserDisplayName(user),
    userId: user.id,
  });

  return sanitizeUser(user);
}

async function deleteAccount(userId, { password }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Password is incorrect');
    err.status = 400;
    throw err;
  }

  const displayName = auditLogService.getUserDisplayName(user);

  await prisma.$transaction(async (tx) => {
    await auditLogService.logUser(
      { actionType: 'deleted', userName: displayName, userId: user.id },
      tx
    );
    await tx.user.delete({ where: { id: userId } });
  });

  if (user.profilePhotoUrl) {
    await deleteVenuePhoto(user.profilePhotoUrl).catch(() => {});
  }
}

async function findPaginated({ search, page = 1, limit = 20, status } = {}) {
  const where = {};

  if (status && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(sanitizeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function countAll() {
  return prisma.user.count();
}

async function deactivateUser(id) {
  const user = await prisma.user.update({
    where: { id },
    data: { status: 'inactive' },
  });

  await auditLogService.logUser({
    actionType: 'updated',
    userName: auditLogService.getUserDisplayName(user),
    userId: user.id,
  });

  return sanitizeUser(user);
}

async function activateUser(id) {
  const user = await prisma.user.update({
    where: { id },
    data: { status: 'active' },
  });

  await auditLogService.logUser({
    actionType: 'updated',
    userName: auditLogService.getUserDisplayName(user),
    userId: user.id,
  });

  return sanitizeUser(user);
}

module.exports = {
  signup,
  signin,
  getUserById,
  updateProfile,
  changePassword,
  uploadUserPhoto,
  deleteAccount,
  findPaginated,
  countAll,
  deactivateUser,
  activateUser,
  VALID_STATUSES,
};

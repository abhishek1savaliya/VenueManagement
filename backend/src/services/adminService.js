const prisma = require('../db/prisma');
const { hashPassword, comparePassword } = require('../lib/password');
const { signAdminToken } = require('../lib/jwt');

function sanitizeAdmin(admin) {
  const { passwordHash, ...safe } = admin;
  return safe;
}

async function login({ username, password }) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    const err = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    const err = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }

  const token = signAdminToken(admin.id);
  return { admin: sanitizeAdmin(admin), token };
}

async function getAdminById(id) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) return null;
  return sanitizeAdmin(admin);
}

async function changeCredentials(adminId, { currentPassword, newUsername, newPassword }) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    const err = new Error('Admin not found');
    err.status = 404;
    throw err;
  }

  const valid = await comparePassword(currentPassword, admin.passwordHash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  const data = {};
  if (newUsername && newUsername !== admin.username) {
    data.username = newUsername;
  }
  if (newPassword) {
    data.passwordHash = await hashPassword(newPassword);
  }

  if (!Object.keys(data).length) {
    const err = new Error('No changes provided');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data,
  });

  const token = signAdminToken(updated.id);
  return { admin: sanitizeAdmin(updated), token };
}

module.exports = {
  login,
  getAdminById,
  changeCredentials,
};

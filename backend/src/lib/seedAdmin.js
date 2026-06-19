const prisma = require('../db/prisma');
const { hashPassword } = require('../lib/password');

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin';

async function seedDefaultAdmin() {
  const existing = await prisma.admin.findUnique({
    where: { username: DEFAULT_USERNAME },
  });

  if (existing) return;

  try {
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);
    await prisma.admin.create({
      data: {
        username: DEFAULT_USERNAME,
        passwordHash,
      },
    });
    console.log('Default admin account created (username: admin, password: admin)');
  } catch (err) {
    if (err.code === 'P2002') return;
    throw err;
  }
}

module.exports = { seedDefaultAdmin };

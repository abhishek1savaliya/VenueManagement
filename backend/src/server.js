const app = require('./app');
const config = require('./config');
const prisma = require('./db/prisma');
const { seedDefaultAdmin } = require('./lib/seedAdmin');

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected via Prisma.');

    await seedDefaultAdmin();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log('Public API:  /api/public/venues');
      console.log('Auth API:    /api/auth');
      console.log('Admin API:   /api/admin/auth, /api/admin/users, /api/admin/venues, ...');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();

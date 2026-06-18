const app = require('./app');
const config = require('./config');
const prisma = require('./db/prisma');

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected via Prisma.');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log('Public API:  /api/public/venues');
      console.log('Admin API:   /api/admin/venues, /api/admin/audit-logs, /api/admin/dashboard');
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

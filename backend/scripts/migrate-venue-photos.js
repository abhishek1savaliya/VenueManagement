require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateVenuePhotos() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE venues
    ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}'
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE venues
    SET image_urls = ARRAY[image_url]
    WHERE image_url IS NOT NULL
      AND image_url <> ''
      AND cardinality(image_urls) = 0
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE venues
    DROP COLUMN IF EXISTS image_url
  `);
}

migrateVenuePhotos()
  .then(() => {
    console.log('Migrated venue photos to image_urls.');
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

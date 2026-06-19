require('dotenv').config();

const { getSupabase, VENUE_PHOTOS_BUCKET } = require('../src/lib/supabase');

async function setupStorage() {
  const supabase = getSupabase();

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const exists = buckets.some((bucket) => bucket.id === VENUE_PHOTOS_BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(
      VENUE_PHOTOS_BUCKET,
      {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }
    );

    if (createError) {
      throw createError;
    }

    console.log(`Created public bucket "${VENUE_PHOTOS_BUCKET}".`);
  } else {
    console.log(`Bucket "${VENUE_PHOTOS_BUCKET}" already exists.`);
  }
}

setupStorage().catch((err) => {
  console.error('Failed to set up Supabase storage:', err.message);
  process.exit(1);
});

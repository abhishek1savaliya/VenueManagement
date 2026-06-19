const { createClient } = require('@supabase/supabase-js');

const VENUE_PHOTOS_BUCKET = 'venue-photos';

let supabase = null;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }

  if (!supabase) {
    supabase = createClient(url, secretKey);
  }

  return supabase;
}

module.exports = {
  getSupabase,
  VENUE_PHOTOS_BUCKET,
};

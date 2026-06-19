const { randomUUID } = require('crypto');
const { getSupabase, VENUE_PHOTOS_BUCKET } = require('../lib/supabase');

function getStoragePathFromUrl(imageUrl) {
  if (!imageUrl) return null;

  const marker = `/storage/v1/object/public/${VENUE_PHOTOS_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(imageUrl.slice(index + marker.length));
}

async function uploadVenuePhoto(buffer, mimeType, { venueId, originalName } = {}) {
  const extension = originalName?.split('.').pop()?.toLowerCase() || 'jpg';
  const folder = venueId ? `venues/${venueId}` : `venues/temp/${randomUUID()}`;
  const path = `${folder}/${Date.now()}.${extension}`;

  const { data, error } = await getSupabase().storage
    .from(VENUE_PHOTOS_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData } = getSupabase()
    .storage
    .from(VENUE_PHOTOS_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function deleteVenuePhoto(imageUrl) {
  const path = getStoragePathFromUrl(imageUrl);
  if (!path) return;

  const { error } = await getSupabase().storage
    .from(VENUE_PHOTOS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteVenuePhotos(imageUrls) {
  if (!imageUrls?.length) return;

  const paths = imageUrls
    .map(getStoragePathFromUrl)
    .filter(Boolean);

  if (!paths.length) return;

  const { error } = await getSupabase().storage
    .from(VENUE_PHOTOS_BUCKET)
    .remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteVenuePhotoFolder(venueId) {
  const folder = `venues/${venueId}`;
  const { data, error } = await getSupabase().storage
    .from(VENUE_PHOTOS_BUCKET)
    .list(folder);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) return;

  const paths = data.map((file) => `${folder}/${file.name}`);
  const { error: removeError } = await getSupabase().storage
    .from(VENUE_PHOTOS_BUCKET)
    .remove(paths);

  if (removeError) {
    throw new Error(removeError.message);
  }
}

function getRemovedImageUrls(previousUrls = [], nextUrls = []) {
  const nextSet = new Set(nextUrls);
  return previousUrls.filter((url) => !nextSet.has(url));
}

module.exports = {
  uploadVenuePhoto,
  deleteVenuePhoto,
  deleteVenuePhotos,
  deleteVenuePhotoFolder,
  getStoragePathFromUrl,
  getRemovedImageUrls,
};

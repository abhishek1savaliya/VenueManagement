import { VenueImage } from "@/components/venues/venue-image";
import { VenuePhotoCarousel } from "@/components/venues/venue-photo-carousel";

export function VenuePhotoGallery({ photos, alt, className, imageClassName, priority = false }) {
  if (!photos?.length) {
    return (
      <VenueImage
        src={null}
        alt={alt}
        className={`h-64 w-full sm:h-80 ${className || ""}`}
        imageClassName={imageClassName}
        priority={priority}
      />
    );
  }

  if (photos.length === 1) {
    return (
      <VenueImage
        src={photos[0]}
        alt={alt}
        className={`h-64 w-full sm:h-80 ${className || ""}`}
        imageClassName={imageClassName}
        priority={priority}
        sizes="(max-width: 896px) 100vw, 896px"
      />
    );
  }

  return (
    <VenuePhotoCarousel
      photos={photos}
      alt={alt}
      className={className}
      imageClassName={imageClassName}
      priority={priority}
    />
  );
}

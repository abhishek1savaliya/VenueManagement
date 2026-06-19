import { cn } from "@/lib/utils";
import { VenueImage } from "@/components/venues/venue-image";

export function VenueCardPhotos({ photos = [], alt, className }) {
  if (!photos.length) {
    return (
      <VenueImage
        src={null}
        alt={alt}
        className={cn("h-44 w-full", className)}
      />
    );
  }

  if (photos.length === 1) {
    return (
      <VenueImage
        src={photos[0]}
        alt={alt}
        className={cn("h-44 w-full", className)}
        sizes="(max-width: 768px) 100vw, 400px"
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className={cn("grid h-44 grid-cols-2 gap-0.5", className)}>
        {photos.map((url, index) => (
          <VenueImage
            key={url}
            src={url}
            alt={`${alt} ${index + 1}`}
            className="h-full w-full"
            sizes="200px"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className={cn("grid h-44 grid-cols-3 grid-rows-2 gap-0.5", className)}>
        <VenueImage
          src={photos[0]}
          alt={`${alt} 1`}
          className="col-span-2 row-span-2 h-full w-full"
          sizes="280px"
        />
        <VenueImage
          src={photos[1]}
          alt={`${alt} 2`}
          className="h-full w-full"
          sizes="120px"
        />
        <VenueImage
          src={photos[2]}
          alt={`${alt} 3`}
          className="h-full w-full"
          sizes="120px"
        />
      </div>
    );
  }

  const visible = photos.slice(0, 4);
  const extraCount = photos.length - 4;

  return (
    <div className={cn("grid h-44 grid-cols-2 grid-rows-2 gap-0.5", className)}>
      {visible.map((url, index) => (
        <div key={url} className="relative h-full w-full">
          <VenueImage
            src={url}
            alt={`${alt} ${index + 1}`}
            className="h-full w-full"
            sizes="160px"
          />
          {extraCount > 0 && index === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
              +{extraCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

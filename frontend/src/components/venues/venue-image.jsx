import Image from "next/image";
import { cn } from "@/lib/utils";

export function VenueImage({ src, alt, className, imageClassName, priority = false, sizes }) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-primary/80 via-primary to-primary/60",
        className
      )}
    />
  );
}

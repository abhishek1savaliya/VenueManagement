"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VenueImage } from "@/components/venues/venue-image";

export function VenuePhotoCarousel({
  photos,
  alt,
  className,
  imageClassName,
  priority = false,
}) {
  const scrollRef = useRef(null);
  const dragRef = useRef({ startX: 0, scrollLeft: 0, pointerId: null });
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  function updateActiveIndex() {
    const el = scrollRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    if (!slideWidth) return;

    setActiveIndex(Math.round(el.scrollLeft / slideWidth));
  }

  function scrollToIndex(index) {
    const el = scrollRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    el.scrollTo({ left: index * slideWidth, behavior: "smooth" });
    setActiveIndex(index);
  }

  function snapToNearest() {
    const el = scrollRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth;
    if (!slideWidth) return;

    const index = Math.round(el.scrollLeft / slideWidth);
    el.scrollTo({ left: index * slideWidth, behavior: "smooth" });
    setActiveIndex(index);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateActiveIndex();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function handlePointerDown(e) {
    const el = scrollRef.current;
    if (!el || e.button !== 0) return;

    dragRef.current = {
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };

    setIsDragging(true);
    isDraggingRef.current = true;
    el.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!isDraggingRef.current || !el || e.pointerId !== drag.pointerId) return;

    e.preventDefault();
    el.scrollLeft = drag.scrollLeft - (e.clientX - drag.startX);
  }

  function handlePointerEnd(e) {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!isDraggingRef.current || !el || e.pointerId !== drag.pointerId) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    el.releasePointerCapture(e.pointerId);
    snapToNearest();
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "scrollbar-hide flex h-64 touch-pan-x overflow-x-auto select-none sm:h-80",
          isDragging
            ? "cursor-grabbing snap-none scroll-auto"
            : "cursor-grab snap-x snap-mandatory scroll-smooth"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {photos.map((url, index) => (
          <div
            key={url}
            className="relative h-full w-full shrink-0 grow-0 basis-full snap-center"
          >
            <VenueImage
              src={url}
              alt={`${alt} ${index + 1}`}
              className="pointer-events-none h-full w-full"
              imageClassName={imageClassName}
              priority={priority && index === 0}
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {activeIndex + 1} / {photos.length}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-3 pt-10">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-1.5">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`View photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "pointer-events-auto rounded-full transition-all",
                  index === activeIndex
                    ? "h-2 w-6 bg-white"
                    : "h-2 w-2 bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
          {showHint && (
            <p className="text-[11px] font-medium text-white/90 transition-opacity duration-300">
              Drag or swipe for more photos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

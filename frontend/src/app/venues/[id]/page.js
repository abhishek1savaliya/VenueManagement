import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VenuePhotoGallery } from "@/components/venues/venue-photo-gallery";
import { publicApi } from "@/lib/api";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const res = await publicApi.getVenue(id);
    return {
      title: `${res.data.name} — MyVenue`,
      description: res.data.description || `Venue at ${res.data.address}`,
    };
  } catch {
    return { title: "Venue Not Found — MyVenue" };
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function VenueDetailPage({ params }) {
  const { id } = await params;
  let venue;

  try {
    const res = await publicApi.getVenue(id);
    venue = res.data;
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to venues
          </Link>
        </Button>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <VenuePhotoGallery
            photos={venue.imageUrls}
            alt={venue.name}
            className="w-full"
            priority
          />

          <div className="p-6 sm:p-10">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="success" className="mb-3">
                  Available
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {venue.name}
                </h1>
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-3 text-muted-foreground sm:flex-row sm:gap-6">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span>Listed {formatDate(venue.createdAt)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                About this venue
              </h2>
              <p className="leading-relaxed text-foreground/90">
                {venue.description || "No description has been provided for this venue yet."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

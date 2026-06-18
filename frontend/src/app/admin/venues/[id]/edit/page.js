"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VenueForm } from "@/components/venues/venue-form";
import { adminApi } from "@/lib/api";

export default function EditVenuePage({ params }) {
  const router = useRouter();
  const [venueId, setVenueId] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setVenueId(id);
      adminApi
        .getVenue(id)
        .then((res) => setVenue(res.data))
        .catch((err) => {
          toast.error(err.message);
          router.push("/admin/venues");
        })
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  async function handleSubmit(data) {
    const res = await adminApi.updateVenue(venueId, data);
    toast.success(res.message || "Venue updated");
    router.push("/admin/venues");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/venues">
          <ArrowLeft className="h-4 w-4" />
          Back to venues
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Venue</CardTitle>
          <CardDescription>
            Update venue details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : venue ? (
            <VenueForm
              initialValues={venue}
              onSubmit={handleSubmit}
              submitLabel="Update Venue"
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

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
import { VenueForm } from "@/components/venues/venue-form";
import { adminApi } from "@/lib/api";

export default function NewVenuePage() {
  const router = useRouter();

  async function handleSubmit(data) {
    const res = await adminApi.createVenue(data);
    toast.success(res.message || "Venue created");
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
          <CardTitle>Create Venue</CardTitle>
          <CardDescription>
            Add a new venue to your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VenueForm onSubmit={handleSubmit} submitLabel="Create Venue" />
        </CardContent>
      </Card>
    </div>
  );
}

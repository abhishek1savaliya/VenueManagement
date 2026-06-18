import Link from "next/link";
import { Building2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Building2 className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Venue Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This venue doesn&apos;t exist or is no longer available.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">Browse Venues</Link>
        </Button>
      </main>
    </div>
  );
}

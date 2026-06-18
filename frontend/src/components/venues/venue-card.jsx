import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VenueCard({ venue }) {
  return (
    <Link href={`/venues/${venue.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="h-2 bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-lg transition-colors group-hover:text-primary">
            {venue.name}
          </CardTitle>
          <CardDescription className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{venue.address}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {venue.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {venue.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">
              No description available
            </p>
          )}
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View details
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

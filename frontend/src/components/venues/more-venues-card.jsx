import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MoreVenuesCard() {
  return (
    <Link href="/venues" className="group block h-full">
      <Card className="flex h-full min-h-[320px] flex-col items-center justify-center border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/5">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <LayoutGrid className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
          More Venues
        </h3>
        <p className="mt-2 max-w-[200px] text-sm text-muted-foreground">
          Browse all available venues with filters and search
        </p>
        <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}

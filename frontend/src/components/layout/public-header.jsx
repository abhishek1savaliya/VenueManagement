import Link from "next/link";
import { Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">MyVenue</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Premium Venue Discovery
            </span>
          </div>
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}

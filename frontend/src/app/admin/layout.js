import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const metadata = {
  title: "Admin — MyVenue",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-0">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { AdminShell } from "@/components/layout/admin-shell";

export const metadata = {
  title: "Admin — MyVenue",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}

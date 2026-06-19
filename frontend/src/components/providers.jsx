import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

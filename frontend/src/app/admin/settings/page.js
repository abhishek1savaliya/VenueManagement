"use client";

import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/admin-auth-context";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSettingsPage() {
  const { admin, updateAdmin } = useAdminAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.newUsername.trim() && !form.newPassword) {
      toast.error("Provide a new admin ID or new password");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.changeCredentials({
        currentPassword: form.currentPassword,
        newUsername: form.newUsername.trim() || undefined,
        newPassword: form.newPassword || undefined,
      });
      updateAdmin(res.data.admin, res.data.token);
      toast.success("Admin credentials updated");
      setForm({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Change your admin ID and password
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Credentials
          </CardTitle>
          <CardDescription>
            Current admin ID: <strong>{admin?.username}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) => update("currentPassword", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newUsername">New admin ID (optional)</Label>
              <Input
                id="newUsername"
                placeholder={admin?.username}
                value={form.newUsername}
                onChange={(e) => update("newUsername", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password (optional)</Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                minLength={6}
              />
            </div>
            {form.newPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  minLength={6}
                />
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update credentials"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

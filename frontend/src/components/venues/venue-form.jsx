"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VenueImage } from "@/components/venues/venue-image";
import { adminApi } from "@/lib/api";

const defaultValues = {
  name: "",
  address: "",
  description: "",
  status: "active",
  imageUrls: [],
};

export function VenueForm({ initialValues, onSubmit, submitLabel = "Save Venue" }) {
  const [form, setForm] = useState({
    ...defaultValues,
    ...initialValues,
    imageUrls: initialValues?.imageUrls || [],
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [removedUrls, setRemovedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [newPhotos]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    e.target.value = "";
  }

  function handleRemoveExisting(url) {
    setRemovedUrls((prev) => [...prev, url]);
  }

  function handleRemoveNew(id) {
    setNewPhotos((prev) => {
      const photo = prev.find((item) => item.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  const keptExisting = (form.imageUrls || []).filter(
    (url) => !removedUrls.includes(url)
  );
  const totalPhotos = keptExisting.length + newPhotos.length;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const imageUrls = [...keptExisting];

      for (const photo of newPhotos) {
        const url = await adminApi.uploadVenuePhoto(
          photo.file,
          initialValues?.id || undefined
        );
        imageUrls.push(url);
      }

      await onSubmit({ ...form, imageUrls });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Venue Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Grand Hall"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="123 Main St, Sydney"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe the venue..."
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="photos">Venue Photos</Label>
          {totalPhotos > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {totalPhotos > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {keptExisting.map((url) => (
              <div key={url} className="group relative">
                <VenueImage
                  src={url}
                  alt={form.name || "Venue photo"}
                  className="aspect-[4/3] w-full rounded-xl"
                  sizes="240px"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-90"
                  onClick={() => handleRemoveExisting(url)}
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {newPhotos.map((photo) => (
              <div key={photo.id} className="group relative">
                <VenueImage
                  src={photo.preview}
                  alt={form.name || "New venue photo"}
                  className="aspect-[4/3] w-full rounded-xl"
                  sizes="240px"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-90"
                  onClick={() => handleRemoveNew(photo.id)}
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <VenueImage
            src={null}
            alt={form.name || "Venue photo preview"}
            className="h-48 w-full rounded-xl"
          />
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="photos" className="cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              Add photos
            </label>
          </Button>
        </div>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
        <p className="text-xs text-muted-foreground">
          Select one or more images. JPG, PNG, or WebP up to 5 MB each.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={form.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

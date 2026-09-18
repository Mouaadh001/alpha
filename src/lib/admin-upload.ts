import { supabase } from "@/integrations/supabase/client";

const YEAR_10 = 60 * 60 * 24 * 365 * 10;

/** Upload a file to a bucket and return a long-lived signed URL. */
export async function uploadImage(bucket: "product-images" | "category-images", file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, YEAR_10);
  if (error) throw error;
  return data.signedUrl;
}

/** Extract the storage object path from a Supabase signed URL, if present. */
export function pathFromSignedUrl(url: string, bucket: string): string | null {
  try {
    const u = new URL(url);
    const marker = `/object/sign/${bucket}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/** Best-effort delete of an image from storage using its signed URL. */
export async function deleteImage(bucket: "product-images" | "category-images", url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = pathFromSignedUrl(url, bucket);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
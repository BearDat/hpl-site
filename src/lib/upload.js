import { getStore } from "@netlify/blobs";
import path from "path";
import { randomUUID } from "crypto";

function uploadsStore() {
  return getStore("uploads");
}

/**
 * Saves an uploaded File into Netlify Blobs and returns a URL that serves
 * it back out (via the route handler at src/app/uploads/[...path]/route.js).
 * Writing to the local filesystem would work in dev but not on Netlify's
 * serverless functions, which are read-only at runtime.
 */
export async function saveUploadedFile(file, subdir) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const key = `${subdir}/${randomUUID()}${ext}`;
  await uploadsStore().set(key, bytes, {
    metadata: { contentType: file.type || "application/octet-stream" },
  });
  return `/uploads/${key}`;
}

export async function getUploadedFile(key) {
  return uploadsStore().getWithMetadata(key, { type: "arrayBuffer" });
}

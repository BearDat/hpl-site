import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Saves an uploaded File into public/uploads/<subdir>/ and returns the
 * public URL path to it. Local-filesystem storage: fine for development
 * and single-instance hosting, but won't persist on stateless/serverless
 * deployments — swap for S3/Supabase Storage/etc. before shipping there.
 */
export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${subdir}/${filename}`;
}

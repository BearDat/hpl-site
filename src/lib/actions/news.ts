"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "article";
  let slug = base;
  let n = 1;
  while (await prisma.newsArticle.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

async function heroImageUrlFromForm(formData: FormData): Promise<string | undefined> {
  const file = formData.get("heroImage");
  if (file instanceof File && file.size > 0) {
    return saveUploadedFile(file, "news");
  }
  return undefined;
}

export async function createArticle(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const published = formData.get("published") === "on";
  if (!title || !body) throw new Error("Title and body are required.");

  const slug = await uniqueSlug(title);
  const heroImageUrl = await heroImageUrlFromForm(formData);

  await prisma.newsArticle.create({
    data: { title, slug, body, published, heroImageUrl },
  });

  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function updateArticle(articleId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const published = formData.get("published") === "on";
  if (!title || !body) throw new Error("Title and body are required.");

  const heroImageUrl = await heroImageUrlFromForm(formData);

  await prisma.newsArticle.update({
    where: { id: articleId },
    data: { title, body, published, ...(heroImageUrl ? { heroImageUrl } : {}) },
  });

  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function deleteArticle(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  if (!articleId) return;
  await prisma.newsArticle.delete({ where: { id: articleId } });
  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function addMedia(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "") || null;
  const caption = String(formData.get("caption") ?? "") || undefined;
  const isHighlight = formData.get("isHighlight") === "on";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A file is required.");
  }

  const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
  const url = await saveUploadedFile(file, "media");

  await prisma.mediaAsset.create({
    data: { url, type, caption, isHighlight, articleId },
  });

  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function deleteMedia(formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) return;
  await prisma.mediaAsset.delete({ where: { id: mediaId } });
  revalidatePath("/admin/news");
  revalidatePath("/");
}

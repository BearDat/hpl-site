import { getUploadedFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { path: pathSegments } = await params;
  const key = pathSegments.join("/");
  const result = await getUploadedFile(key);
  if (!result || !result.data) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(result.data, {
    headers: {
      "Content-Type": result.metadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

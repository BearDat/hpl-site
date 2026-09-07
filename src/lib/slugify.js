export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
/**
 * Builds a slug from `text`, appending "-2", "-3", etc. until `exists`
 * (an async lookup for a conflicting slug) returns false.
 */
export async function uniqueSlug(text, exists, fallback = "item") {
    const base = slugify(text) || fallback;
    let slug = base;
    let n = 1;
    while (await exists(slug)) {
        n += 1;
        slug = `${base}-${n}`;
    }
    return slug;
}

/**
 * download.ts — Reliable client-side image download utility.
 *
 * Why not just `<a href={dataUri} download>`?
 *   - Works for same-origin blobs but behaves inconsistently with large
 *     base64 data URIs across Chrome/Firefox/Safari.
 *   - This approach converts the URI to a Blob first, creates an object URL,
 *     triggers the click, then immediately revokes — the most reliable method.
 */

export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    // Fetch handles both data URIs and http(s) URLs uniformly
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Determine correct extension from MIME type
    const ext = blob.type.includes("svg") ? "svg" : "png";
    const safeName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = safeName;

    // Must be in DOM to work in Firefox
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Release memory
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab so the user can save manually
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  }
}

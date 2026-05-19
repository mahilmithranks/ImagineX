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
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const ext = blob.type.includes("svg") ? "svg" : "png";
    const safeName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = safeName;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
  } catch (err) {
    console.error("Failed to download image", err);
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  }
}

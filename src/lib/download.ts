/**
 * download.ts — Reliable client-side image download utility.
 *
 * Why not just `<a href={dataUri} download>`?
 *   - Works for same-origin blobs but behaves inconsistently with large
 *     base64 data URIs across Chrome/Firefox/Safari.
 *   - This approach converts the URI to a Blob first, creates an object URL,
 *     triggers the click, then immediately revokes — the most reliable method.
 */

export async function downloadImage(imageUrl: string, filename: string, overlayText?: string): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const ext = blob.type.includes("svg") ? "svg" : "png";
    const safeName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;

    let objectUrl = URL.createObjectURL(blob);

    if (overlayText && ext !== "svg") {
      // Burn text into the image using a canvas
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Natural cinematic/meme subtitle styling
        const fontSize = Math.floor(canvas.height * 0.08); // 8% of height
        ctx.font = `bold ${fontSize}px Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        
        // Add black outline
        ctx.lineWidth = Math.floor(fontSize * 0.1);
        ctx.strokeStyle = "black";
        ctx.lineJoin = "round";
        
        // Text position (bottom center)
        const x = canvas.width / 2;
        const y = canvas.height - (canvas.height * 0.05); // 5% from bottom

        // Draw outline then fill
        ctx.strokeText(overlayText, x, y);
        ctx.fillStyle = "white";
        ctx.fillText(overlayText, x, y);

        // Replace object URL with canvas blob
        const canvasBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/png"));
        if (canvasBlob) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = URL.createObjectURL(canvasBlob);
        }
      }
    }

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

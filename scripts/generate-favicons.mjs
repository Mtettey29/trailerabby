import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_URL =
  "https://pub-a25c26cd10394d818d79893e73296a9a.r2.dev/little_abby_trucking_transparent.gif";
const OUT_DIR = path.join(ROOT, "public", "icons");
const APP_DIR = path.join(ROOT, "app");

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

async function downloadSource() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to download logo: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Crop to the bold "ABBY" center band for legibility at small sizes. */
async function cropToAbbyMark(input) {
  const meta = await sharp(input, { animated: false }).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (!width || !height) {
    throw new Error("Could not read source image dimensions");
  }

  const cropHeight = Math.round(height * 0.42);
  const cropTop = Math.round(height * 0.28);
  const cropWidth = Math.round(width * 0.62);
  const cropLeft = Math.round((width - cropWidth) / 2);

  return sharp(input, { animated: false })
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .png()
    .toBuffer();
}

async function squareIcon(cropped, size) {
  return sharp(cropped)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  console.log("Downloading source logo…");
  const source = await downloadSource();

  console.log("Cropping to ABBY mark…");
  const cropped = await cropToAbbyMark(source);

  await mkdir(OUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const png = await squareIcon(cropped, size);
    const filename = `icon-${size}x${size}.png`;
    await writeFile(path.join(OUT_DIR, filename), png);
    console.log(`  ${filename}`);
  }

  const icon32 = await squareIcon(cropped, 32);
  const icon180 = await squareIcon(cropped, 180);

  await writeFile(path.join(APP_DIR, "icon.png"), icon32);
  await writeFile(path.join(APP_DIR, "apple-icon.png"), icon180);

  const manifest = {
    name: "Trailer Abby",
    short_name: "Trailer Abby",
    icons: SIZES.map((size) => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
    theme_color: "#000000",
    background_color: "#000000",
    display: "standalone",
  };

  await writeFile(
    path.join(ROOT, "public", "manifest.webmanifest"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  console.log("\nWrote app/icon.png (32px) and app/apple-icon.png (180px)");
  console.log("Wrote public/icons/* and public/manifest.webmanifest");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

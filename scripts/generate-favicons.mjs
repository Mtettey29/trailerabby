import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_URL =
  "https://pub-a25c26cd10394d818d79893e73296a9a.r2.dev/little_abby_trucking_transparent.gif";
const BRAND_DIR = path.join(ROOT, "public", "brand");
const LOGO_PATH = path.join(BRAND_DIR, "logo.gif");
const OUT_DIR = path.join(ROOT, "public", "icons");
const APP_DIR = path.join(ROOT, "app");

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];
const BG_TOLERANCE = 42;

async function downloadSource() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to download logo: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleBackgroundColor(data, width, height, channels) {
  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + (width - 1)) * channels,
  ];

  let r = 0;
  let g = 0;
  let b = 0;

  for (const index of corners) {
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
  }

  return { r: r / 4, g: g / 4, b: b / 4 };
}

async function removeSolidBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const { r: bgR, g: bgG, b: bgB } = sampleBackgroundColor(
    data,
    width,
    height,
    channels
  );

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    if (colorDistance(r, g, b, bgR, bgG, bgB) <= BG_TOLERANCE) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  });
}

async function saveTransparentLogo(source) {
  await mkdir(BRAND_DIR, { recursive: true });
  await writeFile(LOGO_PATH, source);
  console.log("  public/brand/logo.gif (transparent source, inverted in UI via CSS)");
}

async function firstFrame(source) {
  return sharp(source, { animated: true, pages: 1 }).png().toBuffer();
}

async function invertFrame(frameBuffer) {
  const cleared = await removeSolidBackground(frameBuffer);
  return (await cleared.negate({ alpha: false })).png().toBuffer();
}

async function cropToAbbyMark(firstFrameBuffer) {
  const meta = await sharp(firstFrameBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (!width || !height) {
    throw new Error("Could not read source image dimensions");
  }

  const cropHeight = Math.min(Math.round(height * 0.42), height);
  const cropTop = Math.min(Math.round(height * 0.28), height - cropHeight);
  const cropWidth = Math.min(Math.round(width * 0.62), width);
  const cropLeft = Math.min(
    Math.round((width - cropWidth) / 2),
    width - cropWidth
  );

  return sharp(firstFrameBuffer)
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

  await saveTransparentLogo(source);

  console.log("Building inverted favicons from first frame…");
  const frame = await firstFrame(source);
  const inverted = await invertFrame(frame);
  await writeFile(path.join(BRAND_DIR, "logo-clerk.png"), inverted);
  console.log("  public/brand/logo-clerk.png (inverted still for Clerk)");
  const cropped = await cropToAbbyMark(inverted);

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

import path from "path";
import { fromFile } from "geotiff";

const TIF_PATH = path.join(process.cwd(), "public", "data", "hardiness", "PHZM199120201.tif");
const WIDTH = 676;
const HEIGHT = 990;
const X_ORIGIN = 124.185;
const Y_ORIGIN = 43.0050006;
const CELL_SIZE = 0.01;
const NO_DATA_LIMIT = -1e20;

export type HardinessResult = {
  valueC: number;
  row: number;
  col: number;
};

let imagePromise: ReturnType<typeof loadImage> | null = null;

async function loadImage() {
  const tiff = await fromFile(TIF_PATH);
  return tiff.getImage();
}

function getImage() {
  if (!imagePromise) {
    imagePromise = loadImage();
  }

  return imagePromise;
}

export async function getHardinessAt(lat: number, lng: number): Promise<HardinessResult | null> {
  const col = Math.round((lng - X_ORIGIN) / CELL_SIZE);
  const row = Math.round((Y_ORIGIN - lat) / CELL_SIZE);

  if (col < 0 || row < 0 || col >= WIDTH || row >= HEIGHT) {
    return null;
  }

  const image = await getImage();
  const raster = await image.readRasters({
    window: [col, row, col + 1, row + 1],
    interleave: true,
  });
  const value = Number(raster[0]);

  if (!Number.isFinite(value) || value < NO_DATA_LIMIT) {
    return null;
  }

  return {
    valueC: Math.round(value * 10) / 10,
    row,
    col,
  };
}

export type FitStatus = "available" | "caution" | "hard" | "indoor" | "excluded" | "unknown";

export function getFitStatus(product: { category: string; coldLimitC?: number | null }, regionValueC?: number | null) {
  if (product.category === "화분자재류") {
    return "excluded" satisfies FitStatus;
  }

  if (product.category === "관엽식물" || product.category === "동서양란") {
    return "indoor" satisfies FitStatus;
  }

  if (typeof regionValueC !== "number" || typeof product.coldLimitC !== "number") {
    return "unknown" satisfies FitStatus;
  }

  const margin = regionValueC - product.coldLimitC;

  if (margin >= 3) {
    return "available" satisfies FitStatus;
  }

  if (margin >= -3) {
    return "caution" satisfies FitStatus;
  }

  return "hard" satisfies FitStatus;
}

export function getFitLabel(status: FitStatus) {
  switch (status) {
    case "available":
      return "재배 가능";
    case "caution":
      return "주의 필요";
    case "hard":
      return "노지 어려움";
    case "indoor":
      return "실내 권장";
    case "excluded":
      return "검사 제외";
    default:
      return "지역 설정 필요";
  }
}

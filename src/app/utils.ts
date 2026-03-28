import type { CSSProperties } from "react";
import type { PreviewBorderDesign } from "./types";

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function borderToCss(
  border: Pick<PreviewBorderDesign, "kind" | "color1" | "color2" | "angle">
): CSSProperties {
  if (border.kind === "solid") {
    return { backgroundColor: border.color1 };
  }
  return {
    backgroundColor: border.color1,
    backgroundImage: `linear-gradient(${border.angle}deg, ${border.color1}, ${border.color2})`,
  };
}

export function setCanvasFillForBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  border: PreviewBorderDesign
) {
  if (border.kind === "solid") {
    ctx.fillStyle = border.color1;
    return;
  }

  const angleRad = (border.angle * Math.PI) / 180;
  const vx = Math.cos(angleRad);
  const vy = Math.sin(angleRad);
  const cx = w / 2;
  const cy = h / 2;
  const half = Math.max(w, h) / 2;

  const x1 = cx - vx * half;
  const y1 = cy - vy * half;
  const x2 = cx + vx * half;
  const y2 = cy + vy * half;

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, border.color1);
  grad.addColorStop(1, border.color2);
  ctx.fillStyle = grad;
}

export function readableTextColor(hex: string) {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) return "#ffffff";
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0a0a0a" : "#ffffff";
}

export function formatFooterDate(value: string) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

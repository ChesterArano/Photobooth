import type { PrintLayoutConfig, PreviewBorderDesign } from "./types";
import { formatFooterDate, readableTextColor, setCanvasFillForBorder } from "./utils";

export async function applySimpleEditToDataUrl(opts: {
  src: string;
  rotate: 0 | 90 | 180 | 270;
  flipX: boolean;
}): Promise<string | null> {
  const { src, rotate, flipX } = opts;
  if (!src) return null;

  const img = await loadImage(src);
  if (!img) return null;

  const rotated = rotate === 90 || rotate === 270;
  const canvas = document.createElement("canvas");
  canvas.width = rotated ? img.height : img.width;
  canvas.height = rotated ? img.width : img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(flipX ? -1 : 1, 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function buildPrintHtml(opts: {
  brandName: string;
  photos: string[];
  numPhotos: number;
  activeLayout: PrintLayoutConfig;
  previewBorder: PreviewBorderDesign;
  printEnabled: boolean;
}): string | null {
  if (!opts.printEnabled) return null;

  const used = opts.photos.slice(0, opts.numPhotos);
  const sizeCss =
    opts.activeLayout.paper === "4x6-portrait"
      ? { page: "4in 6in", sheetW: "4in", sheetH: "6in" }
      : { page: "6in 4in", sheetW: "6in", sheetH: "4in" };

  const footerVisible =
    opts.previewBorder.showDate || opts.previewBorder.footerText.trim().length > 0;
  const footerText = opts.previewBorder.footerText.trim();
  const footerDate = opts.previewBorder.showDate
    ? formatFooterDate(opts.previewBorder.footerDate)
    : "";
  const footerColor = readableTextColor(opts.previewBorder.color1);

  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const footerTextHtml = escapeHtml(footerText);
  const footerDateHtml = escapeHtml(footerDate);

  const padIn = Math.max(0.1, Math.min(0.25, opts.previewBorder.thickness / 96));
  const radiusIn = Math.max(0.14, Math.min(0.5, opts.previewBorder.radius / 96));

  const frameBackgroundCss =
    opts.previewBorder.kind === "solid"
      ? `background:${opts.previewBorder.color1};`
      : `background:linear-gradient(${opts.previewBorder.angle}deg, ${opts.previewBorder.color1}, ${opts.previewBorder.color2});`;

  const filmEnabled = opts.previewBorder.overlay === "film";
  const slotRadiusPx = filmEnabled ? 6 : 12;

  const filmOverlayHtml = filmEnabled
    ? `
        <div class="filmOverlay" aria-hidden="true">
          <div class="filmRing"></div>
          <div class="filmNoise"></div>
          <div class="filmMarksLeft">
            ${opts.activeLayout.poses === 4 ? "<div>28A</div><div>29</div><div>29A</div><div>30</div>" : "<div>28A</div><div>29</div><div>29A</div>"}
          </div>
          <div class="filmMarksRight">
            <div class="vtext">TX 5063</div>
            <div class="vtext">TX 5063</div>
          </div>
          <div class="filmTri filmTriTop"></div>
          <div class="filmTri filmTriBottom"></div>
        </div>
      `
    : "";

  function slot(src: string | undefined) {
    if (src) {
      return `<div class="slot"><img src="${src}" alt="" /></div>`;
    }
    return `<div class="slot empty"></div>`;
  }

  let content = "";

  if (opts.activeLayout.id === "strip_3" || opts.activeLayout.id === "strip_4") {
    const poseCount = opts.activeLayout.poses;
    const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
    const strip = `<div class="strip strip${poseCount}">${stripSlots.join("\n")}</div>`;
    content = `<div class="stripPair">${strip}${strip}</div>`;
  } else if (opts.activeLayout.id === "strip_3_vertical") {
    const poseCount = opts.activeLayout.poses;
    const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
    content = `<div class="stripSingle strip${poseCount}">${stripSlots.join("\n")}</div>`;
  } else if (opts.activeLayout.id === "strip_4_vertical") {
    const poseCount = opts.activeLayout.poses;
    const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
    content = `<div class="stripSingle strip${poseCount}">${stripSlots.join("\n")}</div>`;
  } else if (opts.activeLayout.id === "4r_4_duo") {
    const grid = `
        <div class="sheet4r grid4">
          ${slot(used[0])}
          ${slot(used[1])}
          ${slot(used[2])}
          ${slot(used[3])}
        </div>
      `;
    content = `<div class="duo">${grid}${grid}</div>`;
  } else if (opts.activeLayout.id === "4r_4") {
    content = `
        <div class="sheet4r grid4">
          ${slot(used[0])}
          ${slot(used[1])}
          ${slot(used[2])}
          ${slot(used[3])}
        </div>
      `;
  } else if (opts.activeLayout.id === "4r_3_left") {
    content = `
        <div class="sheet4r grid3L">
          <div class="hero">${slot(used[0])}</div>
          <div class="side">${slot(used[1])}${slot(used[2])}</div>
        </div>
      `;
  } else if (opts.activeLayout.id === "4r_3_right") {
    content = `
        <div class="sheet4r grid3R">
          <div class="side">${slot(used[1])}${slot(used[2])}</div>
          <div class="hero">${slot(used[0])}</div>
        </div>
      `;
  } else if (opts.activeLayout.id === "4r_2") {
    content = `
        <div class="sheet4r grid2">
          ${slot(used[0])}
          ${slot(used[1])}
        </div>
      `;
  } else {
    content = `
        <div class="sheet4r grid1">
          ${slot(used[0])}
        </div>
      `;
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${opts.brandName} — Print</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;padding:0;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#fff}
      @page{size:${sizeCss.page};margin:0}

      .sheet{width:${sizeCss.sheetW};height:${sizeCss.sheetH};margin:0 auto;display:flex;align-items:stretch;justify-content:center;background:#fff}

      .frame{width:100%;height:100%;padding:${padIn.toFixed(2)}in;border-radius:${radiusIn.toFixed(2)}in;${frameBackgroundCss}display:flex;flex-direction:column;gap:0.12in}
      .contentArea{flex:1;min-height:0}

      .contentWrap{position:relative;width:100%;height:100%}

      .slot{background:#fff;border:3px solid #0a0a0a;border-radius:${slotRadiusPx}px;overflow:hidden;position:relative}
      .slot img{width:100%;height:100%;display:block;object-fit:cover}
      .slot.empty{background:#fff}

      .stripPair{display:grid;grid-template-columns:1fr 1fr;gap:0.12in;width:100%;height:100%}
      .strip{display:grid;gap:0.12in;height:100%}
      .stripSingle{display:grid;gap:0.12in;width:100%;height:100%}
      .strip3{grid-template-rows:repeat(3,1fr)}
      .strip4{grid-template-rows:repeat(4,1fr)}

      .filmOverlay{position:absolute;inset:0;pointer-events:none}
      .filmRing{position:absolute;inset:0;border-radius:0.2in;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.10)}
      .filmNoise{position:absolute;inset:0;border-radius:0.2in;opacity:0.30;mix-blend-mode:screen;background-image:repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 70px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 120px), radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);background-size:auto,auto,23px 19px;background-position:0 0,0 0,7px 11px}
      .filmMarksLeft{position:absolute;left:0.12in;top:0.18in;bottom:0.18in;display:flex;flex-direction:column;justify-content:space-between;color:rgba(255,255,255,0.80);font-size:0.11in;font-weight:700;letter-spacing:0.12em}
      .filmMarksRight{position:absolute;right:0.12in;top:0.18in;bottom:0.18in;display:flex;flex-direction:column;justify-content:space-between;color:rgba(255,255,255,0.80);font-size:0.11in;font-weight:700;letter-spacing:0.12em}
      .filmMarksRight .vtext{writing-mode:vertical-rl;text-orientation:mixed}
      .filmTri{position:absolute;left:0.16in;width:0;height:0;border-top:0.08in solid transparent;border-bottom:0.08in solid transparent;border-right:0.12in solid rgba(255,255,255,0.70)}
      .filmTriTop{top:0.12in}
      .filmTriBottom{bottom:0.12in}

      .sheet4r{display:grid;gap:0.14in;width:100%;height:100%}
      .grid4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
      .grid2{grid-template-columns:1fr 1fr;grid-template-rows:1fr}
      .grid1{grid-template-columns:1fr;grid-template-rows:1fr}
      .grid3L{grid-template-columns:1.35fr 0.65fr;grid-template-rows:1fr}
      .grid3R{grid-template-columns:0.65fr 1.35fr;grid-template-rows:1fr}
      .hero{display:grid}
      .hero .slot{height:100%}
      .side{display:grid;grid-template-rows:1fr 1fr;gap:0.14in}

      .duo{display:grid;grid-template-rows:1fr 1fr;gap:0.14in;width:100%;height:100%}

      .footer{width:100%;text-align:center;color:${footerColor};font-weight:800;letter-spacing:0.06em;text-transform:uppercase}
      .footer .date{margin-top:0.04in;font-size:0.12in;font-weight:700;opacity:0.92;letter-spacing:0.08em}

      @media print{ body{padding:0} }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="frame">
        <div class="contentArea"><div class="contentWrap">${content}${filmOverlayHtml}</div></div>
        ${
          footerVisible
            ? `<div class="footer">${footerTextHtml}${footerDateHtml ? `<div class=\"date\">${footerDateHtml}</div>` : ""}</div>`
            : ""
        }
      </div>
    </div>
    <script>
      window.onload = () => { window.print(); };
    </script>
  </body>
</html>`;
}

export async function renderCollageJpeg(opts: {
  photos: string[];
  numPhotos: number;
  activeLayout: PrintLayoutConfig;
  previewBorder: PreviewBorderDesign;
  printEnabled: boolean;
}): Promise<Blob | null> {
  if (!opts.printEnabled) return null;

  const used = opts.photos.slice(0, opts.numPhotos);
  const isPortrait = opts.activeLayout.paper === "4x6-portrait";

  // Keep export size reasonable but crisp.
  const canvasW = isPortrait ? 1200 : 1800;
  const canvasH = isPortrait ? 1800 : 1200;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background frame
  setCanvasFillForBorder(ctx, canvasW, canvasH, opts.previewBorder);
  ctx.fillRect(0, 0, canvasW, canvasH);

  const minDim = Math.min(canvasW, canvasH);
  const padRatio = Math.min(0.09, Math.max(0.02, opts.previewBorder.thickness / 300));
  const pad = Math.round(minDim * padRatio);
  const gap = Math.round(minDim * 0.03);
  const innerPad = Math.round(minDim * 0.02);
  const border = Math.max(6, Math.round(minDim * 0.006));
  const radius = Math.max(18, Math.round(minDim * 0.03));
  const slotRadius =
    opts.previewBorder.overlay === "film" ? Math.max(10, Math.round(minDim * 0.012)) : radius;

  const footerVisible =
    opts.previewBorder.showDate || opts.previewBorder.footerText.trim().length > 0;
  const footerText = opts.previewBorder.footerText.trim();
  const footerDate = opts.previewBorder.showDate ? formatFooterDate(opts.previewBorder.footerDate) : "";

  const footerGap = footerVisible ? Math.round(minDim * 0.02) : 0;
  const footerH = footerVisible ? Math.round(minDim * 0.14) : 0;

  const x0 = pad;
  const y0 = pad;
  const w0 = canvasW - pad * 2;
  const h0 = canvasH - pad * 2 - footerGap - footerH;

  // Preload images
  const images = await Promise.all(used.map((src) => loadImage(src)));

  const slots: Array<{ x: number; y: number; w: number; h: number; img: HTMLImageElement | null }> = [];

  if (opts.activeLayout.id === "strip_3" || opts.activeLayout.id === "strip_4") {
    const rows = opts.activeLayout.poses;
    const stripGap = gap;
    const stripPad = innerPad;
    const stripW = (w0 - gap) / 2;
    const stripH = h0;

    for (let stripIdx = 0; stripIdx < 2; stripIdx += 1) {
      const sx = x0 + stripIdx * (stripW + gap);
      const sy = y0;

      const cellW = stripW - stripPad * 2;
      const cellH = (stripH - stripPad * 2 - stripGap * (rows - 1)) / rows;
      for (let r = 0; r < rows; r += 1) {
        slots.push({
          x: sx + stripPad,
          y: sy + stripPad + r * (cellH + stripGap),
          w: cellW,
          h: cellH,
          img: images[r] ?? null,
        });
      }
    }
  } else if (opts.activeLayout.id === "strip_3_vertical" || opts.activeLayout.id === "strip_4_vertical") {
    const rows = opts.activeLayout.poses;
    const stripGap = gap;
    const stripPad = innerPad;
    const stripW = w0;
    const stripH = h0;

    const cellW = stripW - stripPad * 2;
    const cellH = (stripH - stripPad * 2 - stripGap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r += 1) {
      slots.push({
        x: x0 + stripPad,
        y: y0 + stripPad + r * (cellH + stripGap),
        w: cellW,
        h: cellH,
        img: images[r] ?? null,
      });
    }
  } else if (opts.activeLayout.id === "4r_4") {
    const cellW = (w0 - gap) / 2;
    const cellH = (h0 - gap) / 2;
    slots.push({ x: x0, y: y0, w: cellW, h: cellH, img: images[0] ?? null });
    slots.push({ x: x0 + cellW + gap, y: y0, w: cellW, h: cellH, img: images[1] ?? null });
    slots.push({ x: x0, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[2] ?? null });
    slots.push({ x: x0 + cellW + gap, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[3] ?? null });
  } else if (opts.activeLayout.id === "4r_4_duo") {
    const duoGap = gap;
    const copyH = (h0 - duoGap) / 2;
    for (let copyIdx = 0; copyIdx < 2; copyIdx += 1) {
      const oy = y0 + copyIdx * (copyH + duoGap);
      const cellW = (w0 - gap) / 2;
      const cellH = (copyH - gap) / 2;
      slots.push({ x: x0, y: oy, w: cellW, h: cellH, img: images[0] ?? null });
      slots.push({ x: x0 + cellW + gap, y: oy, w: cellW, h: cellH, img: images[1] ?? null });
      slots.push({ x: x0, y: oy + cellH + gap, w: cellW, h: cellH, img: images[2] ?? null });
      slots.push({ x: x0 + cellW + gap, y: oy + cellH + gap, w: cellW, h: cellH, img: images[3] ?? null });
    }
  } else if (opts.activeLayout.id === "4r_3_left") {
    const total = 1.35 + 0.65;
    const leftW = (w0 - gap) * (1.35 / total);
    const rightW = (w0 - gap) * (0.65 / total);
    const cellH = (h0 - gap) / 2;
    slots.push({ x: x0, y: y0, w: leftW, h: h0, img: images[0] ?? null });
    slots.push({ x: x0 + leftW + gap, y: y0, w: rightW, h: cellH, img: images[1] ?? null });
    slots.push({ x: x0 + leftW + gap, y: y0 + cellH + gap, w: rightW, h: cellH, img: images[2] ?? null });
  } else if (opts.activeLayout.id === "4r_3_right") {
    const total = 0.65 + 1.35;
    const leftW = (w0 - gap) * (0.65 / total);
    const rightW = (w0 - gap) * (1.35 / total);
    const cellH = (h0 - gap) / 2;
    slots.push({ x: x0, y: y0, w: leftW, h: cellH, img: images[1] ?? null });
    slots.push({ x: x0, y: y0 + cellH + gap, w: leftW, h: cellH, img: images[2] ?? null });
    slots.push({ x: x0 + leftW + gap, y: y0, w: rightW, h: h0, img: images[0] ?? null });
  } else if (opts.activeLayout.id === "4r_2") {
    const cellW = (w0 - gap) / 2;
    slots.push({ x: x0, y: y0, w: cellW, h: h0, img: images[0] ?? null });
    slots.push({ x: x0 + cellW + gap, y: y0, w: cellW, h: h0, img: images[1] ?? null });
  } else {
    slots.push({ x: x0, y: y0, w: w0, h: h0, img: images[0] ?? null });
  }

  for (const s of slots) {
    drawSlot(ctx, s, s.img, { radius: slotRadius, border });
  }

  if (opts.previewBorder.overlay === "film") {
    // Film-style marks + subtle scratches over the photo area.
    const marks = opts.activeLayout.poses === 4 ? ["28A", "29", "29A", "30"] : ["28A", "29", "29A"];

    let seed = 5063;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    ctx.save();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = Math.max(2, Math.round(minDim * 0.002));
    drawRoundedRectPath(ctx, x0, y0, w0, h0, Math.max(12, radius * 0.7));
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.80)";
    ctx.font = `${Math.max(16, Math.round(minDim * 0.018))}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    for (let i = 0; i < marks.length; i += 1) {
      const t = marks.length === 4 ? i / 3 : i / 2;
      const y = y0 + h0 * (0.12 + t * 0.76);
      ctx.fillText(marks[i], x0 + Math.round(minDim * 0.012), y);
    }

    const vText = "TX 5063";
    const rightX = x0 + w0 - Math.round(minDim * 0.014);
    const topY = y0 + Math.round(minDim * 0.08);
    const bottomY = y0 + h0 - Math.round(minDim * 0.08);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.translate(rightX, topY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(vText, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(rightX, bottomY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(vText, 0, 0);
    ctx.restore();

    // Scratches
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = Math.max(1, Math.round(minDim * 0.0015));
    for (let i = 0; i < 16; i += 1) {
      const x = x0 + rand() * w0;
      const y1 = y0 + rand() * h0;
      const y2 = y1 + (0.18 + rand() * 0.55) * h0;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x + (rand() - 0.5) * 6, Math.min(y0 + h0, y2));
      ctx.stroke();
    }
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    for (let i = 0; i < 60; i += 1) {
      const x = x0 + rand() * w0;
      const y = y0 + rand() * h0;
      const r = 1 + rand() * 1.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  if (footerVisible) {
    const footerX = x0;
    const footerY = y0 + h0 + footerGap;
    const footerW = w0;

    const color = readableTextColor(opts.previewBorder.color1);
    const ctx2 = ctx;
    ctx2.save();
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    ctx2.fillStyle = color;

    ctx2.shadowColor = color === "#ffffff" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
    ctx2.shadowBlur = 10;
    ctx2.shadowOffsetY = 2;

    function fitFont(text: string, startPx: number, weight: number) {
      let size = startPx;
      while (size > 14) {
        ctx2.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        const w = ctx2.measureText(text).width;
        if (w <= footerW * 0.92) break;
        size -= 2;
      }
      return size;
    }

    const hasTitle = footerText.length > 0;
    const hasDate = footerDate.length > 0;

    const titleBase = Math.round(minDim * 0.055);
    const dateBase = Math.round(minDim * 0.03);
    const titleSize = hasTitle ? fitFont(footerText, titleBase, 900) : 0;
    const dateSize = hasDate ? fitFont(footerDate, dateBase, 700) : 0;
    const lineGap = hasTitle && hasDate ? Math.round(minDim * 0.01) : 0;
    const totalH = (hasTitle ? titleSize : 0) + (hasDate ? dateSize : 0) + lineGap;
    let y = footerY + footerH / 2 - totalH / 2;

    if (hasTitle) {
      ctx2.font = `900 ${titleSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      ctx2.fillText(footerText.toUpperCase(), footerX + footerW / 2, y + titleSize / 2);
      y += titleSize + lineGap;
    }

    if (hasDate) {
      ctx2.font = `700 ${dateSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      ctx2.globalAlpha = 0.92;
      ctx2.fillText(footerDate.toUpperCase(), footerX + footerW / 2, y + dateSize / 2);
      ctx2.globalAlpha = 1;
    }

    ctx2.restore();
  }

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = clamp(0, r, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  image: HTMLImageElement | null,
  opts: { radius: number; border: number }
) {
  const { x, y, w, h } = rect;

  // White base
  ctx.save();
  drawRoundedRectPath(ctx, x, y, w, h, opts.radius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Image (cover) clipped
  if (image) {
    ctx.save();
    ctx.clip();
    const scale = Math.max(w / image.width, h / image.height);
    const dw = image.width * scale;
    const dh = image.height * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.restore();
  }

  // Border
  ctx.lineWidth = opts.border;
  ctx.strokeStyle = "#0a0a0a";
  ctx.stroke();
  ctx.restore();
}

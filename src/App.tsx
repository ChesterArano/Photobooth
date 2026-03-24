import { useEffect, useRef, useState } from "react";

type FacingMode = "user" | "environment";

type PrintLayoutId =
  | "strip_3"
  | "strip_4"
  | "strip_3_vertical"
  | "strip_4_vertical"
  | "4r_1"
  | "4r_2"
  | "4r_3_left"
  | "4r_3_right"
  | "4r_4"
  | "4r_4_duo";

type PrintLayoutConfig = {
  id: PrintLayoutId;
  label: string;
  description: string;
  poses: 1 | 2 | 3 | 4;
  paper: "4x6-portrait" | "6x4-landscape";
};

type CameraFilterId = "none" | "bw" | "sepia" | "vivid";

type CameraFilterConfig = {
  id: CameraFilterId;
  label: string;
  css: string;
};

const CAMERA_FILTERS: readonly CameraFilterConfig[] = [
  { id: "none", label: "Normal", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1)" },
  { id: "sepia", label: "Sepia", css: "sepia(1)" },
  { id: "vivid", label: "Vivid", css: "contrast(1.15) saturate(1.35)" },
] as const;

type PreviewBorderKind = "solid" | "gradient";

type PreviewBorderOverlay = "none" | "film";

type PreviewBorderPresetId =
  | "studio_dark"
  | "couple_blush"
  | "birthday_pop"
  | "pearl"
  | "mint"
  | "film"
  | "custom";

type PreviewBorderDesign = {
  presetId: PreviewBorderPresetId;
  kind: PreviewBorderKind;
  overlay: PreviewBorderOverlay;
  color1: string;
  color2: string;
  angle: number;
  thickness: number; // px
  radius: number; // px
  footerText: string;
  footerDate: string; // yyyy-mm-dd
  showDate: boolean;
};

type PreviewBorderPreset = {
  id: Exclude<PreviewBorderPresetId, "custom">;
  label: string;
  hint: string;
  value: Omit<
    PreviewBorderDesign,
    "presetId" | "footerText" | "footerDate" | "showDate"
  >;
};

const PREVIEW_BORDER_PRESETS: readonly PreviewBorderPreset[] = [
  {
    id: "studio_dark",
    label: "Studio",
    hint: "Clean dark frame",
    value: {
      kind: "solid",
      overlay: "none",
      color1: "#09090b",
      color2: "#09090b",
      angle: 45,
      thickness: 14,
      radius: 28,
    },
  },
  {
    id: "couple_blush",
    label: "Couple",
    hint: "Soft romantic",
    value: {
      kind: "gradient",
      overlay: "none",
      color1: "#fb7185",
      color2: "#d946ef",
      angle: 35,
      thickness: 16,
      radius: 30,
    },
  },
  {
    id: "birthday_pop",
    label: "Birthday",
    hint: "Vibrant pop",
    value: {
      kind: "gradient",
      overlay: "none",
      color1: "#4f46e5",
      color2: "#f43f5e",
      angle: 55,
      thickness: 16,
      radius: 30,
    },
  },
  {
    id: "pearl",
    label: "Pearl",
    hint: "Light + minimal",
    value: {
      kind: "gradient",
      overlay: "none",
      color1: "#f4f4f5",
      color2: "#e9d5ff",
      angle: 45,
      thickness: 14,
      radius: 30,
    },
  },
  {
    id: "mint",
    label: "Mint",
    hint: "Fresh modern",
    value: {
      kind: "gradient",
      overlay: "none",
      color1: "#34d399",
      color2: "#60a5fa",
      angle: 40,
      thickness: 16,
      radius: 30,
    },
  },
  {
    id: "film",
    label: "Film",
    hint: "Photobooth negative",
    value: {
      kind: "solid",
      overlay: "film",
      color1: "#09090b",
      color2: "#09090b",
      angle: 45,
      thickness: 18,
      radius: 18,
    },
  },
] as const;

const DEFAULT_PREVIEW_BORDER: PreviewBorderDesign = {
  presetId: "studio_dark",
  ...PREVIEW_BORDER_PRESETS[0].value,
  footerText: "",
  footerDate: (() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  })(),
  showDate: true,
};

function borderToCss(
  border: Pick<PreviewBorderDesign, "kind" | "color1" | "color2" | "angle">
): React.CSSProperties {
  if (border.kind === "solid") {
    return { backgroundColor: border.color1 };
  }
  return {
    backgroundColor: border.color1,
    backgroundImage: `linear-gradient(${border.angle}deg, ${border.color1}, ${border.color2})`,
  };
}

function setCanvasFillForBorder(
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

function readableTextColor(hex: string) {
  const cleaned = hex.trim().replace("#", "");
  if (cleaned.length !== 6) return "#ffffff";
  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? "#0a0a0a" : "#ffffff";
}

function formatFooterDate(value: string) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PRINT_LAYOUTS: readonly PrintLayoutConfig[] = [
  {
    id: "strip_3",
    label: "Strip A",
    description: "6×2 strip • 3 poses (x2 on 4×6)",
    poses: 3,
    paper: "4x6-portrait",
  },
  {
    id: "strip_4",
    label: "Strip C",
    description: "6×2 strip • 4 poses (x2 on 4×6)",
    poses: 4,
    paper: "4x6-portrait",
  },
  {
    id: "strip_3_vertical",
    label: "Strip Vertical",
    description: "Single strip • 3 poses (stacked)",
    poses: 3,
    paper: "4x6-portrait",
  },
  {
    id: "strip_4_vertical",
    label: "Strip Vertical (4)",
    description: "Single strip • 4 poses (stacked)",
    poses: 4,
    paper: "4x6-portrait",
  },
  {
    id: "4r_4",
    label: "4R Grid",
    description: "6×4 (4R) • 4 poses",
    poses: 4,
    paper: "6x4-landscape",
  },
  {
    id: "4r_4_duo",
    label: "4R Grid ×2",
    description: "4×6 • 4 poses (duplicate copy)",
    poses: 4,
    paper: "4x6-portrait",
  },
  {
    id: "4r_3_left",
    label: "4R 3 (Left)",
    description: "6×4 (4R) • 3 poses",
    poses: 3,
    paper: "6x4-landscape",
  },
  {
    id: "4r_3_right",
    label: "4R 3 (Right)",
    description: "6×4 (4R) • 3 poses",
    poses: 3,
    paper: "6x4-landscape",
  },
  {
    id: "4r_2",
    label: "4R Split",
    description: "6×4 (4R) • 2 poses",
    poses: 2,
    paper: "6x4-landscape",
  },
  {
    id: "4r_1",
    label: "4R Single",
    description: "6×4 (4R) • 1 pose",
    poses: 1,
    paper: "6x4-landscape",
  },
] as const;

function CameraIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function GearIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function PrintIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
      <path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <path d="M9 21h6a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function LogoMark(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={props.className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pt_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="0.5" stopColor="#d946ef" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#pt_grad)" />
      <path
        d="M20 26c0-2.2 1.8-4 4-4h16c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4H24c-2.2 0-4-1.8-4-4V26Z"
        fill="rgba(255,255,255,0.92)"
      />
      <path
        d="M42.5 27.5h2.5c1.1 0 2 .9 2 2V34c0 1.1-.9 2-2 2h-2.5v-8.5Z"
        fill="rgba(255,255,255,0.92)"
      />
      <circle cx="32" cy="32" r="7.5" fill="rgba(0,0,0,0.25)" />
      <circle cx="32" cy="32" r="5" fill="rgba(255,255,255,0.92)" />
    </svg>
  );
}

function LayoutThumb(props: { layoutId: PrintLayoutId; className?: string }) {
  const base = (
    <rect
      x="8"
      y="8"
      width="84"
      height="84"
      rx="14"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
  );

  const stroke = 4;
  const common = {
    stroke: "currentColor",
    strokeWidth: stroke,
    fill: "none",
  } as const;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={props.className}
      aria-hidden="true"
    >
      {base}

      {props.layoutId === "4r_4" ? (
        <>
          <rect x="14" y="14" width="36" height="36" rx="8" {...common} />
          <rect x="50" y="14" width="36" height="36" rx="8" {...common} />
          <rect x="14" y="50" width="36" height="36" rx="8" {...common} />
          <rect x="50" y="50" width="36" height="36" rx="8" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_4_duo" ? (
        <>
          <rect x="14" y="14" width="72" height="34" rx="10" {...common} />
          <rect x="14" y="52" width="72" height="34" rx="10" {...common} />
          <path d="M50 14v34" {...common} />
          <path d="M14 31h72" {...common} />
          <path d="M50 52v34" {...common} />
          <path d="M14 69h72" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_3_left" ? (
        <>
          <rect x="14" y="14" width="44" height="72" rx="10" {...common} />
          <rect x="60" y="14" width="26" height="34" rx="10" {...common} />
          <rect x="60" y="52" width="26" height="34" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_3_right" ? (
        <>
          <rect x="42" y="14" width="44" height="72" rx="10" {...common} />
          <rect x="14" y="14" width="26" height="34" rx="10" {...common} />
          <rect x="14" y="52" width="26" height="34" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_2" ? (
        <>
          <rect x="14" y="14" width="36" height="72" rx="10" {...common} />
          <rect x="50" y="14" width="36" height="72" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_1" ? (
        <>
          <rect x="14" y="14" width="72" height="72" rx="12" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_3" ? (
        <>
          <rect x="14" y="14" width="34" height="72" rx="10" {...common} />
          <rect x="52" y="14" width="34" height="72" rx="10" {...common} />
          <path d="M14 38h34" {...common} />
          <path d="M14 62h34" {...common} />
          <path d="M52 38h34" {...common} />
          <path d="M52 62h34" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_3_vertical" ? (
        <>
          <rect x="28" y="14" width="44" height="72" rx="10" {...common} />
          <path d="M28 38h44" {...common} />
          <path d="M28 62h44" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_4_vertical" ? (
        <>
          <rect x="28" y="14" width="44" height="72" rx="10" {...common} />
          <path d="M28 32h44" {...common} />
          <path d="M28 50h44" {...common} />
          <path d="M28 68h44" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_4" ? (
        <>
          <rect x="14" y="14" width="34" height="72" rx="10" {...common} />
          <rect x="52" y="14" width="34" height="72" rx="10" {...common} />
          <path d="M14 32h34" {...common} />
          <path d="M14 50h34" {...common} />
          <path d="M14 68h34" {...common} />
          <path d="M52 32h34" {...common} />
          <path d="M52 50h34" {...common} />
          <path d="M52 68h34" {...common} />
        </>
      ) : null}
    </svg>
  );
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function PlaceholderImage(props: { seed: number }) {
  const variant = props.seed % 3;
  return (
    <div
      className={classNames(
        "h-full w-full",
        variant === 0 &&
          "bg-gradient-to-br from-indigo-100 via-white to-fuchsia-100",
        variant === 1 && "bg-gradient-to-br from-rose-100 via-white to-sky-100",
        variant === 2 &&
          "bg-gradient-to-br from-emerald-100 via-white to-amber-100"
      )}
    />
  );
}

function CollagePreview(props: {
  layout: PrintLayoutConfig;
  photos: string[];
  border: PreviewBorderDesign;
}) {
  const used = props.photos.slice(0, props.layout.poses);

  const showFilmOverlay = props.border.overlay === "film";

  function FilmOverlay() {
    const leftMarks = props.layout.poses === 4 ? ["28A", "29", "29A", "30"] : ["28A", "29", "29A"];
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />

        <div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 70px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 120px), radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "auto, auto, 23px 19px",
            backgroundPosition: "0 0, 0 0, 7px 11px",
            mixBlendMode: "screen",
          }}
        />

        <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-[10px] font-semibold tracking-widest text-white/80">
          {leftMarks.map((m) => (
            <div key={m} className="select-none">
              {m}
            </div>
          ))}
        </div>

        <div className="absolute right-2 top-6 bottom-6 flex flex-col justify-between text-[10px] font-semibold tracking-widest text-white/80">
          <div className="select-none [writing-mode:vertical-rl] [text-orientation:mixed]">
            TX 5063
          </div>
          <div className="select-none [writing-mode:vertical-rl] [text-orientation:mixed]">
            TX 5063
          </div>
        </div>

        <div className="absolute left-3 top-3 h-0 w-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-white/70" />
        <div className="absolute left-3 bottom-3 h-0 w-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-white/70" />
      </div>
    );
  }

  function Slot(slotProps: { src?: string; seed: number }) {
    return (
      <div
        className={classNames(
          "relative overflow-hidden bg-white ring-1 ring-zinc-200",
          showFilmOverlay ? "rounded-md" : "rounded-xl"
        )}
      >
        {slotProps.src ? (
          <img
            alt=""
            src={slotProps.src}
            className="h-full w-full object-cover"
          />
        ) : (
          <PlaceholderImage seed={slotProps.seed} />
        )}
      </div>
    );
  }

  const sheetStyle: React.CSSProperties = {
    aspectRatio: props.layout.paper === "4x6-portrait" ? "4 / 6" : "6 / 4",
  };

  const frameStyle: React.CSSProperties = {
    ...borderToCss(props.border),
    padding: props.border.thickness,
    borderRadius: props.border.radius,
  };

  const footerVisible =
    props.border.showDate || props.border.footerText.trim().length > 0;
  const footerText = props.border.footerText.trim();
  const footerDate = props.border.showDate
    ? formatFooterDate(props.border.footerDate)
    : "";
  const footerColor = readableTextColor(props.border.color1);
  const footerShadow =
    footerColor === "#ffffff"
      ? "0 1px 2px rgba(0,0,0,0.35)"
      : "0 1px 2px rgba(255,255,255,0.35)";

  const footer = footerVisible ? (
    <div
      className="shrink-0 rounded-2xl px-4 py-3 text-center"
      style={{ color: footerColor, textShadow: footerShadow }}
    >
      {footerText ? (
        <div className="text-sm font-extrabold tracking-wide">
          {footerText}
        </div>
      ) : null}
      {footerDate ? (
        <div className="mt-0.5 text-xs font-semibold tracking-wide opacity-90">
          {footerDate}
        </div>
      ) : null}
    </div>
  ) : null;

  let content: React.ReactNode;

  if (props.layout.id === "strip_3_vertical") {
    const rows = props.layout.poses;
    content = (
      <div
        className="grid h-full gap-3 rounded-2xl p-2"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <Slot key={i} src={used[i]} seed={i + 1} />
        ))}
      </div>
    );
  } else if (props.layout.id === "strip_4_vertical") {
    const rows = props.layout.poses;
    content = (
      <div
        className="grid h-full gap-3 rounded-2xl p-2"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <Slot key={i} src={used[i]} seed={i + 1} />
        ))}
      </div>
    );
  } else if (props.layout.id === "strip_3" || props.layout.id === "strip_4") {
    const rows = props.layout.poses;
    content = (
      <div className="grid h-full grid-cols-2 gap-3">
        {Array.from({ length: 2 }, (_, stripIdx) => (
          <div
            key={stripIdx}
            className="grid gap-3 rounded-2xl p-2"
            style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows }, (_, i) => (
              <Slot key={i} src={used[i]} seed={stripIdx * 10 + i + 1} />
            ))}
          </div>
        ))}
      </div>
    );
  } else if (props.layout.id === "4r_4_duo") {
    content = (
      <div className="grid h-full grid-rows-2 gap-3">
        {Array.from({ length: 2 }, (_, copyIdx) => (
          <div key={copyIdx} className="grid grid-cols-2 grid-rows-2 gap-3">
            <Slot src={used[0]} seed={copyIdx * 10 + 1} />
            <Slot src={used[1]} seed={copyIdx * 10 + 2} />
            <Slot src={used[2]} seed={copyIdx * 10 + 3} />
            <Slot src={used[3]} seed={copyIdx * 10 + 4} />
          </div>
        ))}
      </div>
    );
  } else if (props.layout.id === "4r_4") {
    content = (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
        <Slot src={used[0]} seed={1} />
        <Slot src={used[1]} seed={2} />
        <Slot src={used[2]} seed={3} />
        <Slot src={used[3]} seed={4} />
      </div>
    );
  } else if (props.layout.id === "4r_3_left") {
    content = (
      <div className="grid h-full grid-cols-[1.35fr_0.65fr] gap-3">
        <Slot src={used[0]} seed={1} />
        <div className="grid grid-rows-2 gap-3">
          <Slot src={used[1]} seed={2} />
          <Slot src={used[2]} seed={3} />
        </div>
      </div>
    );
  } else if (props.layout.id === "4r_3_right") {
    content = (
      <div className="grid h-full grid-cols-[0.65fr_1.35fr] gap-3">
        <div className="grid grid-rows-2 gap-3">
          <Slot src={used[1]} seed={2} />
          <Slot src={used[2]} seed={3} />
        </div>
        <Slot src={used[0]} seed={1} />
      </div>
    );
  } else if (props.layout.id === "4r_2") {
    content = (
      <div className="grid h-full grid-cols-2 gap-3">
        <Slot src={used[0]} seed={1} />
        <Slot src={used[1]} seed={2} />
      </div>
    );
  } else {
    content = (
      <div className="h-full">
        <Slot src={used[0]} seed={1} />
      </div>
    );
  }

  return (
    <div className="shadow-inner overflow-hidden w-full" style={frameStyle}>
      <div className="relative w-full" style={sheetStyle}>
        {content}
        {showFilmOverlay ? <FilmOverlay /> : null}
      </div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

export default function App() {
  const brandName = "phototoy";
  const tagline = "Pose, click, and keep the moment.";

  const [view, setView] = useState<"landing" | "booth">("landing");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printLayout, setPrintLayout] = useState<PrintLayoutId>("4r_4");
  const [timerSeconds, setTimerSeconds] = useState<2 | 3 | 4 | 5 | 6 | 10>(3);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cameraFilter, setCameraFilter] = useState<CameraFilterId>("none");
  const [previewBorder, setPreviewBorder] = useState<PreviewBorderDesign>(
    DEFAULT_PREVIEW_BORDER
  );

  const [photos, setPhotos] = useState<string[]>([]);
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeLayout =
    PRINT_LAYOUTS.find((l) => l.id === printLayout) ?? PRINT_LAYOUTS[2];
  const numPhotos = activeLayout.poses;

  const printEnabled = photos.length >= numPhotos && !captureInProgress;

  const activeCameraFilterCss =
    CAMERA_FILTERS.find((f) => f.id === cameraFilter)?.css ?? "none";

  useEffect(() => {
    if (view !== "booth") return;
    let cancelled = false;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError("Camera not supported in this browser.");
          return;
        }

        setCameraError(null);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (error) {
        setCameraError(
          error instanceof Error ? error.message : "Unable to access camera."
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
    };
  }, [view, facingMode]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  async function captureFrame(): Promise<string | null> {
    const video = videoRef.current;
    if (!video) return null;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.filter = activeCameraFilterCss;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";
    return canvas.toDataURL("image/png");
  }

  async function handleCapture() {
    if (captureInProgress) return;
    if (settingsOpen) return;

    setCaptureInProgress(true);
    setPhotos([]);

    for (let i = 0; i < numPhotos; i += 1) {
      for (let t = timerSeconds; t >= 1; t -= 1) {
        setCountdown(t);
        await sleep(1000);
      }

      setCountdown(null);
      setFlash(true);
      await sleep(80);
      setFlash(false);

      const image = await captureFrame();
      if (image) {
        setPhotos((prev) => [...prev, image]);
      } else {
        setPhotos((prev) => [...prev, ""]);
      }

      await sleep(250);
    }

    setCaptureInProgress(false);
  }

  function buildPrintHtml() {
    if (!printEnabled) return null;

    const used = photos.slice(0, numPhotos);
    const sizeCss =
      activeLayout.paper === "4x6-portrait"
        ? { page: "4in 6in", sheetW: "4in", sheetH: "6in" }
        : { page: "6in 4in", sheetW: "6in", sheetH: "4in" };

    const footerVisible =
      previewBorder.showDate || previewBorder.footerText.trim().length > 0;
    const footerText = previewBorder.footerText.trim();
    const footerDate = previewBorder.showDate
      ? formatFooterDate(previewBorder.footerDate)
      : "";
    const footerColor = readableTextColor(previewBorder.color1);

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

    const padIn = Math.max(0.1, Math.min(0.25, previewBorder.thickness / 96));
    const radiusIn = Math.max(0.14, Math.min(0.5, previewBorder.radius / 96));

    const frameBackgroundCss =
      previewBorder.kind === "solid"
        ? `background:${previewBorder.color1};`
        : `background:linear-gradient(${previewBorder.angle}deg, ${previewBorder.color1}, ${previewBorder.color2});`;

    const filmEnabled = previewBorder.overlay === "film";
    const slotRadiusPx = filmEnabled ? 6 : 12;

    const filmOverlayHtml = filmEnabled
      ? `
        <div class="filmOverlay" aria-hidden="true">
          <div class="filmRing"></div>
          <div class="filmNoise"></div>
          <div class="filmMarksLeft">
            ${activeLayout.poses === 4 ? "<div>28A</div><div>29</div><div>29A</div><div>30</div>" : "<div>28A</div><div>29</div><div>29A</div>"}
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

    if (activeLayout.id === "strip_3" || activeLayout.id === "strip_4") {
      const poseCount = activeLayout.poses;
      const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
      const strip = `<div class="strip strip${poseCount}">${stripSlots.join("\n")}</div>`;
      content = `<div class="stripPair">${strip}${strip}</div>`;
    } else if (activeLayout.id === "strip_3_vertical") {
      const poseCount = activeLayout.poses;
      const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
      content = `<div class="stripSingle strip${poseCount}">${stripSlots.join("\n")}</div>`;
    } else if (activeLayout.id === "strip_4_vertical") {
      const poseCount = activeLayout.poses;
      const stripSlots = Array.from({ length: poseCount }, (_, i) => slot(used[i]));
      content = `<div class="stripSingle strip${poseCount}">${stripSlots.join("\n")}</div>`;
    } else if (activeLayout.id === "4r_4_duo") {
      const grid = `
        <div class="sheet4r grid4">
          ${slot(used[0])}
          ${slot(used[1])}
          ${slot(used[2])}
          ${slot(used[3])}
        </div>
      `;
      content = `<div class="duo">${grid}${grid}</div>`;
    } else if (activeLayout.id === "4r_4") {
      content = `
        <div class="sheet4r grid4">
          ${slot(used[0])}
          ${slot(used[1])}
          ${slot(used[2])}
          ${slot(used[3])}
        </div>
      `;
    } else if (activeLayout.id === "4r_3_left") {
      content = `
        <div class="sheet4r grid3L">
          <div class="hero">${slot(used[0])}</div>
          <div class="side">${slot(used[1])}${slot(used[2])}</div>
        </div>
      `;
    } else if (activeLayout.id === "4r_3_right") {
      content = `
        <div class="sheet4r grid3R">
          <div class="side">${slot(used[1])}${slot(used[2])}</div>
          <div class="hero">${slot(used[0])}</div>
        </div>
      `;
    } else if (activeLayout.id === "4r_2") {
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
    <title>${brandName} — Print</title>
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

  function handleSaveOrPrint() {
    if (!printEnabled) return;

    const html = buildPrintHtml();
    if (!html) return;

    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.opacity = "0";
      iframe.setAttribute("aria-hidden", "true");
      iframe.srcdoc = html;

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          window.setTimeout(() => iframe.remove(), 500);
        }
      };

      document.body.appendChild(iframe);
    } catch {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brandName}-print.html`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
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

  async function loadImage(src: string): Promise<HTMLImageElement | null> {
    if (!src) return null;
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function renderCollageJpeg(): Promise<Blob | null> {
    if (!printEnabled) return null;

    const used = photos.slice(0, numPhotos);
    const isPortrait = activeLayout.paper === "4x6-portrait";

    // Keep export size reasonable but crisp.
    const canvasW = isPortrait ? 1200 : 1800;
    const canvasH = isPortrait ? 1800 : 1200;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background frame
    setCanvasFillForBorder(ctx, canvasW, canvasH, previewBorder);
    ctx.fillRect(0, 0, canvasW, canvasH);

    const minDim = Math.min(canvasW, canvasH);
    const padRatio = Math.min(0.09, Math.max(0.02, previewBorder.thickness / 300));
    const pad = Math.round(minDim * padRatio);
    const gap = Math.round(minDim * 0.03);
    const innerPad = Math.round(minDim * 0.02);
    const border = Math.max(6, Math.round(minDim * 0.006));
    const radius = Math.max(18, Math.round(minDim * 0.03));
    const slotRadius =
      previewBorder.overlay === "film"
        ? Math.max(10, Math.round(minDim * 0.012))
        : radius;

    const footerVisible =
      previewBorder.showDate || previewBorder.footerText.trim().length > 0;
    const footerText = previewBorder.footerText.trim();
    const footerDate = previewBorder.showDate
      ? formatFooterDate(previewBorder.footerDate)
      : "";

    const footerGap = footerVisible ? Math.round(minDim * 0.02) : 0;
    const footerH = footerVisible ? Math.round(minDim * 0.14) : 0;

    const x0 = pad;
    const y0 = pad;
    const w0 = canvasW - pad * 2;
    const h0 = canvasH - pad * 2 - footerGap - footerH;

    // Preload images
    const images = await Promise.all(used.map((src) => loadImage(src)));

    const slots: Array<{ x: number; y: number; w: number; h: number; img: HTMLImageElement | null }> = [];

    if (activeLayout.id === "strip_3" || activeLayout.id === "strip_4") {
      const rows = activeLayout.poses;
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
    } else if (activeLayout.id === "strip_3_vertical") {
      const rows = activeLayout.poses;
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
    } else if (activeLayout.id === "strip_4_vertical") {
      const rows = activeLayout.poses;
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
    } else if (activeLayout.id === "4r_4") {
      const cellW = (w0 - gap) / 2;
      const cellH = (h0 - gap) / 2;
      slots.push({ x: x0, y: y0, w: cellW, h: cellH, img: images[0] ?? null });
      slots.push({ x: x0 + cellW + gap, y: y0, w: cellW, h: cellH, img: images[1] ?? null });
      slots.push({ x: x0, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[2] ?? null });
      slots.push({ x: x0 + cellW + gap, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[3] ?? null });
    } else if (activeLayout.id === "4r_4_duo") {
      const duoGap = gap;
      const copyH = (h0 - duoGap) / 2;
      for (let copyIdx = 0; copyIdx < 2; copyIdx += 1) {
        const oy = y0 + copyIdx * (copyH + duoGap);
        const cellW = (w0 - gap) / 2;
        const cellH = (copyH - gap) / 2;
        slots.push({ x: x0, y: oy, w: cellW, h: cellH, img: images[0] ?? null });
        slots.push({ x: x0 + cellW + gap, y: oy, w: cellW, h: cellH, img: images[1] ?? null });
        slots.push({ x: x0, y: oy + cellH + gap, w: cellW, h: cellH, img: images[2] ?? null });
        slots.push({
          x: x0 + cellW + gap,
          y: oy + cellH + gap,
          w: cellW,
          h: cellH,
          img: images[3] ?? null,
        });
      }
    } else if (activeLayout.id === "4r_3_left") {
      const total = 1.35 + 0.65;
      const leftW = (w0 - gap) * (1.35 / total);
      const rightW = (w0 - gap) * (0.65 / total);
      const cellH = (h0 - gap) / 2;
      slots.push({ x: x0, y: y0, w: leftW, h: h0, img: images[0] ?? null });
      slots.push({ x: x0 + leftW + gap, y: y0, w: rightW, h: cellH, img: images[1] ?? null });
      slots.push({ x: x0 + leftW + gap, y: y0 + cellH + gap, w: rightW, h: cellH, img: images[2] ?? null });
    } else if (activeLayout.id === "4r_3_right") {
      const total = 0.65 + 1.35;
      const leftW = (w0 - gap) * (0.65 / total);
      const rightW = (w0 - gap) * (1.35 / total);
      const cellH = (h0 - gap) / 2;
      slots.push({ x: x0, y: y0, w: leftW, h: cellH, img: images[1] ?? null });
      slots.push({ x: x0, y: y0 + cellH + gap, w: leftW, h: cellH, img: images[2] ?? null });
      slots.push({ x: x0 + leftW + gap, y: y0, w: rightW, h: h0, img: images[0] ?? null });
    } else if (activeLayout.id === "4r_2") {
      const cellW = (w0 - gap) / 2;
      slots.push({ x: x0, y: y0, w: cellW, h: h0, img: images[0] ?? null });
      slots.push({ x: x0 + cellW + gap, y: y0, w: cellW, h: h0, img: images[1] ?? null });
    } else {
      slots.push({ x: x0, y: y0, w: w0, h: h0, img: images[0] ?? null });
    }

    for (const s of slots) {
      drawSlot(ctx, s, s.img, { radius: slotRadius, border });
    }

    if (previewBorder.overlay === "film") {
      // Film-style marks + subtle scratches over the photo area.
      const marks = activeLayout.poses === 4 ? ["28A", "29", "29A", "30"] : ["28A", "29", "29A"];

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

      const color = readableTextColor(previewBorder.color1);
      const ctx2 = ctx;
      ctx2.save();
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.fillStyle = color;

      ctx2.shadowColor =
        color === "#ffffff" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
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
      const totalH =
        (hasTitle ? titleSize : 0) + (hasDate ? dateSize : 0) + lineGap;
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
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.92
      );
    });
  }

  async function handleSaveJpeg() {
    const blob = await renderCollageJpeg();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName}-${activeLayout.id}.jpg`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function resetToLanding() {
    setSettingsOpen(false);
    setCaptureInProgress(false);
    setCountdown(null);
    setFlash(false);
    setPhotos([]);
    setView("landing");
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {view === "landing" ? (
        <div className="h-full w-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4">
          <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center text-center">
            <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white/70 p-10 shadow-xl backdrop-blur">
              <div className="flex items-center justify-center gap-3">
                <div className="rounded-2xl bg-zinc-950 p-2">
                  <LogoMark className="h-9 w-9" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-zinc-950">
                  {brandName}
                </h1>
              </div>
              <div className="mt-4 text-sm font-medium text-zinc-600">
                <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                  {tagline}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setView("booth")}
                className="mt-10 w-full rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-zinc-900 active:translate-y-px"
              >
                START
              </button>

              <div className="mt-6 text-xs text-zinc-500">
                Camera access required to take photos.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-screen w-full flex-col overflow-y-auto bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 pt-4 pb-8">
          <div className="text-center mt-2">
            <h1
              className="text-4xl font-bold text-zinc-950 md:text-5xl inline-flex items-center justify-center gap-2 cursor-pointer select-none"
              onClick={resetToLanding}
            >
              <div className="rounded-2xl bg-zinc-950 p-2">
                <LogoMark className="h-8 w-8" />
              </div>
              {brandName}
            </h1>
            <div className="text-sm font-medium relative mx-auto inline-block w-max drop-shadow-sm">
              <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 py-3">
                <span>{tagline}</span>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center py-6 md:items-center">
            <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[minmax(0,720px)_minmax(0,520px)] md:items-start md:justify-center">
              <div className="flex flex-col items-center">
                <div className="w-full">
                  <div className="rounded-3xl border border-zinc-200 bg-white/70 p-3 shadow-xl backdrop-blur">
                    <div className="overflow-hidden rounded-2xl bg-black">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={classNames(
                            "h-full w-full object-cover",
                            facingMode === "user" && "[transform:scaleX(-1)]"
                          )}
                          style={{
                            aspectRatio: "4 / 3",
                            filter: activeCameraFilterCss,
                          }}
                        />

                        {cameraError ? (
                          <div className="absolute inset-0 z-20 grid place-items-center bg-white/90 p-6 text-center">
                            <div className="max-w-sm">
                              <div className="text-lg font-semibold text-zinc-900">
                                Camera Unavailable
                              </div>
                              <div className="mt-2 text-sm text-zinc-600">
                                {cameraError}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {countdown !== null ? (
                          <div className="absolute inset-0 z-20 grid place-items-center">
                            <div className="rounded-3xl bg-black/40 px-6 py-4 text-7xl font-extrabold tracking-tight text-white shadow-2xl backdrop-blur">
                              {countdown}
                            </div>
                          </div>
                        ) : null}

                        {flash ? (
                          <div className="absolute inset-0 z-30 bg-white" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-xl backdrop-blur">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                      Preview
                    </h3>
                    <div className="text-xs font-medium text-zinc-500">
                      {Math.min(photos.filter(Boolean).length, numPhotos)}/{numPhotos}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <div className="flex items-baseline justify-between">
                        <div className="text-sm font-semibold text-zinc-900">
                          {activeLayout.label}
                        </div>
                        <div className="text-xs font-medium text-zinc-500">
                          {activeLayout.description}
                        </div>
                      </div>

                      <div className="mt-3">
                        <CollagePreview
                          layout={activeLayout}
                          photos={photos}
                          border={previewBorder}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed right-4 top-1/2 z-20 -translate-y-1/2">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-3 shadow-2xl backdrop-blur">
              <div className="aspect-square w-11 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 p-[1px] shadow-sm flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Settings"
                  onClick={() => setSettingsOpen(true)}
                  className="h-full w-full rounded-full flex items-center justify-center bg-white/80 text-zinc-800 backdrop-blur transition hover:bg-white active:translate-y-px"
                >
                  <GearIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Capture"
                  onClick={() => void handleCapture()}
                  className={classNames(
                    "h-11 w-11 rounded-full flex items-center justify-center",
                    captureInProgress
                      ? "bg-fuchsia-500/80 text-white"
                      : "bg-fuchsia-600 text-white"
                  )}
                >
                  <CameraIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Save or print"
                  disabled={!printEnabled}
                  onClick={handleSaveOrPrint}
                  className={classNames(
                    "h-11 w-11 rounded-full flex items-center justify-center",
                    printEnabled
                      ? "bg-zinc-200 text-zinc-700"
                      : "bg-zinc-300 text-zinc-500"
                  )}
                >
                  <PrintIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Save JPG"
                  disabled={!printEnabled}
                  onClick={() => void handleSaveJpeg()}
                  className={classNames(
                    "h-11 w-11 rounded-full flex items-center justify-center text-xs font-extrabold tracking-wide",
                    printEnabled
                      ? "bg-zinc-200 text-zinc-800"
                      : "bg-zinc-300 text-zinc-500"
                  )}
                >
                  JPG
                </button>
              </div>
            </div>
          </div>

          {settingsOpen ? (
            <div
              className="fixed inset-0 z-40 bg-black/55 px-4 py-6"
              role="dialog"
              aria-modal="true"
            >
              <div className="mx-auto flex h-full max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
                <div className="sticky top-0 z-10 bg-white/95 px-6 py-5 backdrop-blur md:px-8">
                  <div className="relative flex items-center justify-center">
                    <h2 className="text-center text-2xl font-bold">
                      Capture Settings
                    </h2>
                    <button
                      type="button"
                      aria-label="Exit"
                      onClick={() => setSettingsOpen(false)}
                      className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:translate-y-[calc(-50%+1px)]"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 md:px-8 md:pb-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
                    <div className="space-y-8">
                      <div className="text-center text-sm font-semibold">
                        Camera
                      </div>
                      <div className="mt-3 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFacingMode((m) =>
                              m === "user" ? "environment" : "user"
                            )
                          }
                          className="rounded-xl border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                        >
                          ⇅&nbsp; Flip Back
                        </button>
                      </div>

                      <div>
                        <div className="text-center text-sm font-semibold">
                          Camera Filter
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {CAMERA_FILTERS.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setCameraFilter(f.id)}
                              className={classNames(
                                "rounded-xl border px-3 py-2 text-sm font-semibold",
                                cameraFilter === f.id
                                  ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-center text-sm font-semibold">
                          Preview Border
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {PREVIEW_BORDER_PRESETS.map((p) => {
                            const selected = previewBorder.presetId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  setPreviewBorder((b) => ({
                                    ...b,
                                    presetId: p.id,
                                    ...p.value,
                                  }))
                                }
                                className={classNames(
                                  "rounded-2xl border px-3 py-3 text-left transition",
                                  selected
                                    ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                                    : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={classNames(
                                      "h-10 w-10 rounded-xl ring-1",
                                      selected ? "ring-white/15" : "ring-zinc-200"
                                    )}
                                    style={borderToCss(p.value)}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold leading-tight">
                                      {p.label}
                                    </div>
                                    <div
                                      className={classNames(
                                        "mt-0.5 text-xs font-medium",
                                        selected ? "text-white/70" : "text-zinc-500"
                                      )}
                                    >
                                      {p.hint}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewBorder((b) => ({
                                  ...b,
                                  presetId: "custom",
                                  kind: "solid",
                                }))
                              }
                              className={classNames(
                                "rounded-xl border px-3 py-2 text-sm font-semibold",
                                previewBorder.kind === "solid"
                                  ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                              )}
                            >
                              Solid
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewBorder((b) => ({
                                  ...b,
                                  presetId: "custom",
                                  kind: "gradient",
                                }))
                              }
                              className={classNames(
                                "rounded-xl border px-3 py-2 text-sm font-semibold",
                                previewBorder.kind === "gradient"
                                  ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                              )}
                            >
                              Gradient
                            </button>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Thickness
                              </div>
                              <div className="text-xs font-semibold text-zinc-700">
                                {previewBorder.thickness}px
                              </div>
                            </div>
                            <input
                              type="range"
                              min={8}
                              max={28}
                              step={1}
                              value={previewBorder.thickness}
                              onChange={(e) =>
                                setPreviewBorder((b) => ({
                                  ...b,
                                  presetId: "custom",
                                  thickness: Number(e.target.value),
                                }))
                              }
                              className="mt-2 w-full"
                              aria-label="Preview border thickness"
                            />
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Corner Radius
                              </div>
                              <div className="text-xs font-semibold text-zinc-700">
                                {previewBorder.radius}px
                              </div>
                            </div>
                            <input
                              type="range"
                              min={18}
                              max={44}
                              step={1}
                              value={previewBorder.radius}
                              onChange={(e) =>
                                setPreviewBorder((b) => ({
                                  ...b,
                                  presetId: "custom",
                                  radius: Number(e.target.value),
                                }))
                              }
                              className="mt-2 w-full"
                              aria-label="Preview border corner radius"
                            />
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Primary Color
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <input
                                  type="color"
                                  value={previewBorder.color1}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      color1: e.target.value,
                                    }))
                                  }
                                  aria-label="Preview border primary color"
                                  className="h-11 w-11 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1"
                                />
                                <input
                                  type="text"
                                  value={previewBorder.color1}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      color1: e.target.value,
                                    }))
                                  }
                                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                                  inputMode="text"
                                  autoComplete="off"
                                  spellCheck={false}
                                />
                              </div>
                            </div>

                            <div
                              className={classNames(
                                previewBorder.kind === "gradient"
                                  ? ""
                                  : "opacity-50 pointer-events-none"
                              )}
                            >
                              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Secondary Color
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <input
                                  type="color"
                                  value={previewBorder.color2}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      color2: e.target.value,
                                    }))
                                  }
                                  aria-label="Preview border secondary color"
                                  className="h-11 w-11 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1"
                                />
                                <input
                                  type="text"
                                  value={previewBorder.color2}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      color2: e.target.value,
                                    }))
                                  }
                                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                                  inputMode="text"
                                  autoComplete="off"
                                  spellCheck={false}
                                />
                              </div>
                            </div>

                            {previewBorder.kind === "gradient" ? (
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                    Gradient Angle
                                  </div>
                                  <div className="text-xs font-semibold text-zinc-700">
                                    {previewBorder.angle}°
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={180}
                                  step={5}
                                  value={previewBorder.angle}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      angle: Number(e.target.value),
                                    }))
                                  }
                                  className="mt-2 w-full"
                                  aria-label="Preview border gradient angle"
                                />
                              </div>
                            ) : null}

                            <div className="mt-5">
                              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Footer Text
                              </div>
                              <input
                                type="text"
                                value={previewBorder.footerText}
                                onChange={(e) =>
                                  setPreviewBorder((b) => ({
                                    ...b,
                                    presetId: "custom",
                                    footerText: e.target.value,
                                  }))
                                }
                                placeholder="e.g. TISYA'S 16TH BIRTHDAY"
                                className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                                autoComplete="off"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <input
                                  type="checkbox"
                                  checked={previewBorder.showDate}
                                  onChange={(e) =>
                                    setPreviewBorder((b) => ({
                                      ...b,
                                      presetId: "custom",
                                      showDate: e.target.checked,
                                    }))
                                  }
                                />
                                Show Date
                              </label>
                              <input
                                type="date"
                                value={previewBorder.footerDate}
                                onChange={(e) =>
                                  setPreviewBorder((b) => ({
                                    ...b,
                                    presetId: "custom",
                                    footerDate: e.target.value,
                                  }))
                                }
                                className={classNames(
                                  "mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900",
                                  previewBorder.showDate
                                    ? ""
                                    : "opacity-50 pointer-events-none"
                                )}
                              />
                            </div>
                          </div>

                          {previewBorder.presetId === "custom" ? (
                            <div className="mt-2 text-center text-xs font-semibold text-zinc-500">
                              Custom
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-center text-sm font-semibold">
                        Layout Style
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 max-h-[52vh] overflow-y-auto pr-1">
                        {PRINT_LAYOUTS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setPrintLayout(opt.id)}
                            className={classNames(
                              "w-full rounded-2xl border px-4 py-3 text-left transition",
                              printLayout === opt.id
                                ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                                : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={classNames(
                                  "mt-0.5 rounded-xl p-2",
                                  printLayout === opt.id
                                    ? "bg-white/10 text-white"
                                    : "bg-zinc-100 text-indigo-600"
                                )}
                              >
                                <LayoutThumb
                                  layoutId={opt.id}
                                  className="h-10 w-10"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-3">
                                  <div className="text-sm font-semibold">
                                    {opt.label}
                                  </div>
                                  <div
                                    className={classNames(
                                      "shrink-0 text-xs font-medium",
                                      printLayout === opt.id
                                        ? "text-white/80"
                                        : "text-zinc-500"
                                    )}
                                  >
                                    {opt.poses} pose{opt.poses === 1 ? "" : "s"}
                                  </div>
                                </div>
                                <div
                                  className={classNames(
                                    "mt-1 text-xs",
                                    printLayout === opt.id
                                      ? "text-white/80"
                                      : "text-zinc-600"
                                  )}
                                >
                                  {opt.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="text-center text-sm font-semibold">
                      Timer Duration
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 max-w-xl mx-auto">
                      {([2, 3, 4, 5, 6, 10] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTimerSeconds(s)}
                          className={classNames(
                            "rounded-xl border px-6 py-2 text-sm font-semibold",
                            timerSeconds === s
                              ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                              : "border-zinc-300 bg-white text-zinc-800"
                          )}
                        >
                          {s} s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="w-full max-w-xl rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

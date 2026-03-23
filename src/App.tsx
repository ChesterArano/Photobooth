import { useEffect, useRef, useState } from "react";

type FacingMode = "user" | "environment";

type PrintLayoutId =
  | "strip_3"
  | "strip_4"
  | "4r_1"
  | "4r_2"
  | "4r_3_left"
  | "4r_3_right"
  | "4r_4";

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
    id: "4r_4",
    label: "4R Grid",
    description: "6×4 (4R) • 4 poses",
    poses: 4,
    paper: "6x4-landscape",
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
  frameColor: string;
}) {
  const used = props.photos.slice(0, props.layout.poses);

  function Slot(slotProps: { src?: string; seed: number }) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
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

  if (props.layout.id === "strip_3" || props.layout.id === "strip_4") {
    const rows = props.layout.poses;
    return (
      <div
        className="rounded-3xl p-3 shadow-inner"
        style={{ ...sheetStyle, backgroundColor: props.frameColor }}
      >
        <div className="grid h-full grid-cols-2 gap-3">
          {Array.from({ length: 2 }, (_, stripIdx) => (
            <div
              key={stripIdx}
              className="grid gap-3 rounded-2xl p-2"
              style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                backgroundColor: props.frameColor,
              }}
            >
              {Array.from({ length: rows }, (_, i) => (
                <Slot
                  key={i}
                  src={used[i]}
                  seed={stripIdx * 10 + i + 1}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (props.layout.id === "4r_4") {
    return (
      <div
        className="rounded-3xl p-3 shadow-inner"
        style={{ ...sheetStyle, backgroundColor: props.frameColor }}
      >
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
          <Slot src={used[0]} seed={1} />
          <Slot src={used[1]} seed={2} />
          <Slot src={used[2]} seed={3} />
          <Slot src={used[3]} seed={4} />
        </div>
      </div>
    );
  }

  if (props.layout.id === "4r_3_left") {
    return (
      <div
        className="rounded-3xl p-3 shadow-inner"
        style={{ ...sheetStyle, backgroundColor: props.frameColor }}
      >
        <div className="grid h-full grid-cols-[1.35fr_0.65fr] gap-3">
          <Slot src={used[0]} seed={1} />
          <div className="grid grid-rows-2 gap-3">
            <Slot src={used[1]} seed={2} />
            <Slot src={used[2]} seed={3} />
          </div>
        </div>
      </div>
    );
  }

  if (props.layout.id === "4r_3_right") {
    return (
      <div
        className="rounded-3xl p-3 shadow-inner"
        style={{ ...sheetStyle, backgroundColor: props.frameColor }}
      >
        <div className="grid h-full grid-cols-[0.65fr_1.35fr] gap-3">
          <div className="grid grid-rows-2 gap-3">
            <Slot src={used[1]} seed={2} />
            <Slot src={used[2]} seed={3} />
          </div>
          <Slot src={used[0]} seed={1} />
        </div>
      </div>
    );
  }

  if (props.layout.id === "4r_2") {
    return (
      <div
        className="rounded-3xl p-3 shadow-inner"
        style={{ ...sheetStyle, backgroundColor: props.frameColor }}
      >
        <div className="grid h-full grid-cols-2 gap-3">
          <Slot src={used[0]} seed={1} />
          <Slot src={used[1]} seed={2} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-3 shadow-inner"
      style={{ ...sheetStyle, backgroundColor: props.frameColor }}
    >
      <div className="h-full">
        <Slot src={used[0]} seed={1} />
      </div>
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
  const [previewFrameColor, setPreviewFrameColor] = useState<string>("#09090b");

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

      .slot{background:#fff;border:3px solid #0a0a0a;border-radius:12px;overflow:hidden;position:relative}
      .slot img{width:100%;height:100%;display:block;object-fit:cover}
      .slot.empty{background:#fff}

      .stripPair{display:grid;grid-template-columns:1fr 1fr;gap:0.12in;padding:0.12in;background:#0a0a0a;width:100%;height:100%}
      .strip{display:grid;gap:0.12in;padding:0.12in;background:#0a0a0a;height:100%}
      .strip3{grid-template-rows:repeat(3,1fr)}
      .strip4{grid-template-rows:repeat(4,1fr)}

      .sheet4r{display:grid;gap:0.14in;padding:0.16in;background:#0a0a0a;width:100%;height:100%}
      .grid4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
      .grid2{grid-template-columns:1fr 1fr;grid-template-rows:1fr}
      .grid1{grid-template-columns:1fr;grid-template-rows:1fr}
      .grid3L{grid-template-columns:1.35fr 0.65fr;grid-template-rows:1fr}
      .grid3R{grid-template-columns:0.65fr 1.35fr;grid-template-rows:1fr}
      .hero{display:grid}
      .hero .slot{height:100%}
      .side{display:grid;grid-template-rows:1fr 1fr;gap:0.14in}

      @media print{ body{padding:0} }
    </style>
  </head>
  <body>
    <div class="sheet">${content}</div>
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
    ctx.fillStyle = previewFrameColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const minDim = Math.min(canvasW, canvasH);
    const pad = Math.round(minDim * 0.04);
    const gap = Math.round(minDim * 0.03);
    const innerPad = Math.round(minDim * 0.02);
    const border = Math.max(6, Math.round(minDim * 0.006));
    const radius = Math.max(18, Math.round(minDim * 0.03));

    const x0 = pad;
    const y0 = pad;
    const w0 = canvasW - pad * 2;
    const h0 = canvasH - pad * 2;

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

        // Fill strip background
        ctx.fillStyle = previewFrameColor;
        ctx.fillRect(sx, sy, stripW, stripH);

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
    } else if (activeLayout.id === "4r_4") {
      const cellW = (w0 - gap) / 2;
      const cellH = (h0 - gap) / 2;
      slots.push({ x: x0, y: y0, w: cellW, h: cellH, img: images[0] ?? null });
      slots.push({ x: x0 + cellW + gap, y: y0, w: cellW, h: cellH, img: images[1] ?? null });
      slots.push({ x: x0, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[2] ?? null });
      slots.push({ x: x0 + cellW + gap, y: y0 + cellH + gap, w: cellW, h: cellH, img: images[3] ?? null });
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
      drawSlot(ctx, s, s.img, { radius, border });
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
                          frameColor={previewFrameColor}
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
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <input
                            type="color"
                            value={previewFrameColor}
                            onChange={(e) => setPreviewFrameColor(e.target.value)}
                            aria-label="Preview border color"
                            className="h-11 w-11 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1"
                          />
                          <input
                            type="text"
                            value={previewFrameColor}
                            onChange={(e) => setPreviewFrameColor(e.target.value)}
                            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                            inputMode="text"
                            autoComplete="off"
                            spellCheck={false}
                          />
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

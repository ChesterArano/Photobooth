import type {
  CameraFilterConfig,
  PrintLayoutConfig,
  PreviewBorderDesign,
  PreviewBorderPreset,
} from "./types";

export const CAMERA_FILTERS: readonly CameraFilterConfig[] = [
  { id: "none", label: "Normal", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1)" },
  { id: "sepia", label: "Sepia", css: "sepia(1)" },
  { id: "vivid", label: "Vivid", css: "contrast(1.15) saturate(1.35)" },
  {
    id: "warm",
    label: "Warm",
    css: "sepia(0.28) saturate(1.22) contrast(1.06) brightness(1.05) hue-rotate(-8deg)",
  },
  {
    id: "cool",
    label: "Cool",
    css: "saturate(1.12) contrast(1.06) brightness(1.03) hue-rotate(10deg)",
  },
  { id: "soft", label: "Soft", css: "contrast(0.96) saturate(0.96) brightness(1.08)" },
  { id: "matte", label: "Matte", css: "contrast(0.90) saturate(0.92) brightness(1.05)" },
  { id: "fade", label: "Fade", css: "brightness(1.08) contrast(0.86) saturate(0.88)" },
  {
    id: "golden",
    label: "Golden",
    css: "sepia(0.20) saturate(1.35) brightness(1.08) contrast(1.05) hue-rotate(-12deg)",
  },
  {
    id: "retro",
    label: "Retro",
    css: "sepia(0.38) saturate(1.05) contrast(1.10) brightness(1.02) hue-rotate(-6deg)",
  },
  { id: "mocha", label: "Mocha", css: "sepia(0.45) saturate(1.05) brightness(1.02) contrast(1.08)" },
  { id: "blush", label: "Blush", css: "sepia(0.18) saturate(1.35) brightness(1.06) hue-rotate(-20deg)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.18) brightness(0.95)" },
  { id: "neon", label: "Neon", css: "contrast(1.25) saturate(1.65) brightness(1.02)" },
] as const;

export const PREVIEW_BORDER_PRESETS: readonly PreviewBorderPreset[] = [
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

export const DEFAULT_PREVIEW_BORDER: PreviewBorderDesign = {
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

export const PRINT_LAYOUTS: readonly PrintLayoutConfig[] = [
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

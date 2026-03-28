export type FacingMode = "user" | "environment";

export type PrintLayoutId =
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

export type PrintLayoutConfig = {
  id: PrintLayoutId;
  label: string;
  description: string;
  poses: 1 | 2 | 3 | 4;
  paper: "4x6-portrait" | "6x4-landscape";
};

export type CameraFilterId =
  | "none"
  | "bw"
  | "sepia"
  | "vivid"
  | "warm"
  | "cool"
  | "soft"
  | "matte"
  | "fade"
  | "golden"
  | "retro"
  | "mocha"
  | "blush"
  | "noir"
  | "neon";

export type CameraFilterConfig = {
  id: CameraFilterId;
  label: string;
  css: string;
};

export type PreviewBorderKind = "solid" | "gradient";

export type PreviewBorderOverlay = "none" | "film";

export type PreviewBorderPresetId =
  | "studio_dark"
  | "couple_blush"
  | "birthday_pop"
  | "pearl"
  | "mint"
  | "film"
  | "custom";

export type PreviewBorderDesign = {
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

export type PreviewBorderPreset = {
  id: Exclude<PreviewBorderPresetId, "custom">;
  label: string;
  hint: string;
  value: Omit<
    PreviewBorderDesign,
    "presetId" | "footerText" | "footerDate" | "showDate"
  >;
};

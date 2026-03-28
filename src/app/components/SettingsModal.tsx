import type { PrintLayoutId, PreviewBorderDesign, FacingMode, PrintLayoutConfig, PreviewBorderPreset } from "../types";
import { classNames, borderToCss } from "../utils";
import { LayoutThumb } from "./LayoutThumb";

export function SettingsModal(props: {
  open: boolean;
  onClose: () => void;
  facingMode: FacingMode;
  onToggleFacingMode: () => void;
  previewBorder: PreviewBorderDesign;
  onChangePreviewBorder: (next: PreviewBorderDesign | ((prev: PreviewBorderDesign) => PreviewBorderDesign)) => void;
  previewBorderPresets: readonly PreviewBorderPreset[];
  printLayout: PrintLayoutId;
  onChangePrintLayout: (id: PrintLayoutId) => void;
  printLayouts: readonly PrintLayoutConfig[];
  timerSeconds: 2 | 3 | 4 | 5 | 6 | 10;
  onChangeTimerSeconds: (s: 2 | 3 | 4 | 5 | 6 | 10) => void;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/55 px-4 py-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 px-6 py-5 backdrop-blur md:px-8">
          <div className="relative flex items-center justify-center">
            <h2 className="text-center text-2xl font-bold">Capture Settings</h2>
            <button
              type="button"
              aria-label="Exit"
              onClick={props.onClose}
              className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:translate-y-[calc(-50%+1px)]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 md:px-8 md:pb-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-start">
            <div className="space-y-8">
              <div className="text-center text-sm font-semibold">Camera</div>

              <div className="mt-3 flex items-center justify-center">
                <button
                  type="button"
                  onClick={props.onToggleFacingMode}
                  className="rounded-xl border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                >
                  ⇅&nbsp; Flip Back
                </button>
              </div>

              <div>
                <div className="text-center text-sm font-semibold">Preview Border</div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {props.previewBorderPresets.map((p) => {
                    const selected = props.previewBorder.presetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          props.onChangePreviewBorder((b) => ({
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
                            <div className="text-sm font-semibold leading-tight">{p.label}</div>
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
                        props.onChangePreviewBorder((b) => ({
                          ...b,
                          presetId: "custom",
                          kind: "solid",
                        }))
                      }
                      className={classNames(
                        "rounded-xl border px-3 py-2 text-sm font-semibold",
                        props.previewBorder.kind === "solid"
                          ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                          : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                      )}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        props.onChangePreviewBorder((b) => ({
                          ...b,
                          presetId: "custom",
                          kind: "gradient",
                        }))
                      }
                      className={classNames(
                        "rounded-xl border px-3 py-2 text-sm font-semibold",
                        props.previewBorder.kind === "gradient"
                          ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                          : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                      )}
                    >
                      Gradient
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Thickness</div>
                      <div className="text-xs font-semibold text-zinc-700">{props.previewBorder.thickness}px</div>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={28}
                      step={1}
                      value={props.previewBorder.thickness}
                      onChange={(e) =>
                        props.onChangePreviewBorder((b) => ({
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
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Corner Radius</div>
                      <div className="text-xs font-semibold text-zinc-700">{props.previewBorder.radius}px</div>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={44}
                      step={1}
                      value={props.previewBorder.radius}
                      onChange={(e) =>
                        props.onChangePreviewBorder((b) => ({
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
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Primary Color</div>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="color"
                          value={props.previewBorder.color1}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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
                          value={props.previewBorder.color1}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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
                        props.previewBorder.kind === "gradient" ? "" : "opacity-50 pointer-events-none"
                      )}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Secondary Color</div>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="color"
                          value={props.previewBorder.color2}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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
                          value={props.previewBorder.color2}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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

                    {props.previewBorder.kind === "gradient" ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Gradient Angle</div>
                          <div className="text-xs font-semibold text-zinc-700">{props.previewBorder.angle}°</div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={180}
                          step={5}
                          value={props.previewBorder.angle}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Footer Text</div>
                      <input
                        type="text"
                        value={props.previewBorder.footerText}
                        onChange={(e) =>
                          props.onChangePreviewBorder((b) => ({
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
                          checked={props.previewBorder.showDate}
                          onChange={(e) =>
                            props.onChangePreviewBorder((b) => ({
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
                        value={props.previewBorder.footerDate}
                        onChange={(e) =>
                          props.onChangePreviewBorder((b) => ({
                            ...b,
                            presetId: "custom",
                            footerDate: e.target.value,
                          }))
                        }
                        className={classNames(
                          "mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900",
                          props.previewBorder.showDate ? "" : "opacity-50 pointer-events-none"
                        )}
                      />
                    </div>
                  </div>

                  {props.previewBorder.presetId === "custom" ? (
                    <div className="mt-2 text-center text-xs font-semibold text-zinc-500">Custom</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <div className="text-center text-sm font-semibold">Layout Style</div>
              <div className="mt-3 grid grid-cols-1 gap-3 max-h-[52vh] overflow-y-auto pr-1">
                {props.printLayouts.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => props.onChangePrintLayout(opt.id)}
                    className={classNames(
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      props.printLayout === opt.id
                        ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                        : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={classNames(
                          "mt-0.5 rounded-xl p-2",
                          props.printLayout === opt.id
                            ? "bg-white/10 text-white"
                            : "bg-zinc-100 text-indigo-600"
                        )}
                      >
                        <LayoutThumb layoutId={opt.id} className="h-10 w-10" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="text-sm font-semibold">{opt.label}</div>
                          <div
                            className={classNames(
                              "shrink-0 text-xs font-medium",
                              props.printLayout === opt.id ? "text-white/80" : "text-zinc-500"
                            )}
                          >
                            {opt.poses} pose{opt.poses === 1 ? "" : "s"}
                          </div>
                        </div>
                        <div
                          className={classNames(
                            "mt-1 text-xs",
                            props.printLayout === opt.id ? "text-white/80" : "text-zinc-600"
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
            <div className="text-center text-sm font-semibold">Timer Duration</div>
            <div className="mt-3 grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {([2, 3, 4, 5, 6, 10] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => props.onChangeTimerSeconds(s)}
                  className={classNames(
                    "rounded-xl border px-6 py-2 text-sm font-semibold",
                    props.timerSeconds === s
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
              onClick={props.onClose}
              className="w-full max-w-xl rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { PrintLayoutConfig, PreviewBorderDesign } from "../types";
import { classNames } from "../utils";
import { CollagePreview } from "./CollagePreview";

export function PreviewPanel(props: {
  activeLayout: PrintLayoutConfig;
  photos: string[];
  previewBorder: PreviewBorderDesign;
  filledPhotos: number;
  numPhotos: number;
  captureInProgress: boolean;
  selectedPhotoIndex: number | null;
  onSelectShot: (idx: number) => void;
  onOpenEditor: () => void;
  onRetake: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-xl backdrop-blur">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Preview</h3>
        <div className="text-xs font-medium text-zinc-500">
          {Math.min(props.filledPhotos, props.numPhotos)}/{props.numPhotos}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-semibold text-zinc-900">{props.activeLayout.label}</div>
            <div className="text-xs font-medium text-zinc-500">{props.activeLayout.description}</div>
          </div>

          <div className="mt-3">
            <CollagePreview layout={props.activeLayout} photos={props.photos} border={props.previewBorder} />
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Shots</div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {Array.from({ length: props.numPhotos }).map((_, idx) => {
                const src = props.photos[idx] ?? "";
                const selected = props.selectedPhotoIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={props.captureInProgress}
                    onClick={() => props.onSelectShot(idx)}
                    className={classNames(
                      "group relative overflow-hidden rounded-xl border bg-white shadow-sm",
                      selected ? "border-fuchsia-500/70" : "border-zinc-200 hover:border-zinc-300",
                      props.captureInProgress && "opacity-60"
                    )}
                    style={{ aspectRatio: "1 / 1" }}
                    aria-label={`Select shot ${idx + 1}`}
                  >
                    {src ? (
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs font-semibold text-zinc-500">Empty</div>
                    )}
                    <div className="absolute left-1 top-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>

            {props.selectedPhotoIndex !== null ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={props.captureInProgress || !props.photos[props.selectedPhotoIndex]}
                  onClick={props.onOpenEditor}
                  className={classNames(
                    "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
                    props.captureInProgress || !props.photos[props.selectedPhotoIndex]
                      ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                      : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={props.captureInProgress}
                  onClick={props.onRetake}
                  className={classNames(
                    "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
                    props.captureInProgress
                      ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                      : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  Retake
                </button>
                <button
                  type="button"
                  disabled={props.captureInProgress || !props.photos[props.selectedPhotoIndex]}
                  onClick={props.onDelete}
                  className={classNames(
                    "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
                    props.captureInProgress || !props.photos[props.selectedPhotoIndex]
                      ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                      : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

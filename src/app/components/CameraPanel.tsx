import type { RefObject } from "react";
import type { CameraFilterConfig, CameraFilterId, FacingMode } from "../types";
import { classNames } from "../utils";

export function CameraPanel(props: {
  videoRef: RefObject<HTMLVideoElement | null>;
  facingMode: FacingMode;
  activeCameraFilterCss: string;
  cameraError: string | null;
  countdown: number | null;
  flash: boolean;
  captureInProgress: boolean;
  cameraFilter: CameraFilterId;
  cameraFilters: readonly CameraFilterConfig[];
  onSelectFilter: (id: CameraFilterId) => void;
  selectedPhotoIndex: number | null;
  photos: string[];
  onOpenEditor: () => void;
  onRetake: () => void;
  onDelete: () => void;
}) {
  const canEdit =
    props.selectedPhotoIndex !== null &&
    props.photos.length > 0 &&
    Boolean(props.photos[props.selectedPhotoIndex] ?? "") &&
    !props.captureInProgress;

  const canRetake =
    props.selectedPhotoIndex !== null && !props.captureInProgress;

  const canDelete =
    props.selectedPhotoIndex !== null &&
    Boolean(props.photos[props.selectedPhotoIndex] ?? "") &&
    !props.captureInProgress;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/70 p-3 shadow-xl backdrop-blur">
      <div className="overflow-hidden rounded-2xl bg-black">
        <div className="relative">
          <video
            ref={props.videoRef}
            autoPlay
            playsInline
            muted
            className={classNames(
              "h-full w-full object-cover",
              props.facingMode === "user" && "[transform:scaleX(-1)]"
            )}
            style={{
              aspectRatio: "4 / 3",
              filter: props.activeCameraFilterCss,
            }}
          />

          {props.cameraError ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-white/90 p-6 text-center">
              <div className="max-w-sm">
                <div className="text-lg font-semibold text-zinc-900">Camera Unavailable</div>
                <div className="mt-2 text-sm text-zinc-600">{props.cameraError}</div>
              </div>
            </div>
          ) : null}

          {props.countdown !== null ? (
            <div className="absolute inset-0 z-20 grid place-items-center">
              <div className="rounded-3xl bg-black/40 px-6 py-4 text-7xl font-extrabold tracking-tight text-white shadow-2xl backdrop-blur">
                {props.countdown}
              </div>
            </div>
          ) : null}

          {props.flash ? <div className="absolute inset-0 z-30 bg-white" /> : null}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-zinc-200 bg-white/70 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Filter</div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {props.cameraFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              disabled={props.captureInProgress}
              onClick={() => props.onSelectFilter(f.id)}
              className={classNames(
                "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                props.captureInProgress && "opacity-60",
                props.cameraFilter === f.id
                  ? "border-fuchsia-500/70 bg-zinc-950 text-white"
                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {props.selectedPhotoIndex !== null && props.photos.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={!canEdit}
            onClick={props.onOpenEditor}
            className={classNames(
              "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
              !canEdit
                ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
            )}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={!canRetake}
            onClick={props.onRetake}
            className={classNames(
              "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
              !canRetake
                ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
            )}
          >
            Retake
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={props.onDelete}
            className={classNames(
              "rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition",
              !canDelete
                ? "border-zinc-200 bg-zinc-100 text-zinc-400"
                : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50"
            )}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

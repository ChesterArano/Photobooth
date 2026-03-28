import { classNames } from "../utils";

export function EditorModal(props: {
  open: boolean;
  onClose: () => void;
  selectedPhotoIndex: number | null;
  photos: string[];
  editorRotate: 0 | 90 | 180 | 270;
  setEditorRotate: (next: (prev: 0 | 90 | 180 | 270) => 0 | 90 | 180 | 270) => void;
  editorFlipX: boolean;
  setEditorFlipX: (next: (prev: boolean) => boolean) => void;
  onReset: () => void;
  onSave: () => Promise<void>;
}) {
  if (!props.open) return null;

  const src =
    props.selectedPhotoIndex === null ? "" : props.photos[props.selectedPhotoIndex] ?? "";

  return (
    <div className="fixed inset-0 z-50 bg-black/55 px-4 py-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 px-6 py-5 backdrop-blur md:px-8">
          <div className="relative flex items-center justify-center">
            <h2 className="text-center text-2xl font-bold">Edit Shot</h2>
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
          {props.selectedPhotoIndex === null || !src ? (
            <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-900">No image selected</div>
                <div className="mt-2 text-sm text-zinc-600">Select a shot that has a photo.</div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black">
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-contain"
                  style={{
                    aspectRatio: "4 / 3",
                    transform: `rotate(${props.editorRotate}deg) ${props.editorFlipX ? "scaleX(-1)" : ""}`,
                    transformOrigin: "center",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    props.setEditorRotate((r) => (r === 0 ? 270 : ((r - 90) as 0 | 90 | 180 | 270)))
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  Rotate Left
                </button>
                <button
                  type="button"
                  onClick={() =>
                    props.setEditorRotate((r) => (r === 270 ? 0 : ((r + 90) as 0 | 90 | 180 | 270)))
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  Rotate Right
                </button>
                <button
                  type="button"
                  onClick={() => props.setEditorFlipX((v) => !v)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  Flip
                </button>
                <button
                  type="button"
                  onClick={props.onReset}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={props.onClose}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void props.onSave()}
                  className={classNames(
                    "rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-900 active:translate-y-px"
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

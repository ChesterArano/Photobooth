import { CameraIcon, GearIcon, PrintIcon } from "./Icons";
import { classNames } from "../utils";

export function FloatingActions(props: {
  printEnabled: boolean;
  captureInProgress: boolean;
  onOpenSettings: () => void;
  onCapture: () => void;
  onSaveOrPrint: () => void;
  onSaveJpg: () => void;
}) {
  return (
    <div className="fixed right-4 top-1/2 z-20 -translate-y-1/2">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-3 shadow-2xl backdrop-blur">
        <div className="aspect-square w-11 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 p-[1px] shadow-sm flex items-center justify-center">
          <button
            type="button"
            aria-label="Settings"
            onClick={props.onOpenSettings}
            className="h-full w-full rounded-full flex items-center justify-center bg-white/80 text-zinc-800 backdrop-blur transition hover:bg-white active:translate-y-px"
          >
            <GearIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
          <button
            type="button"
            aria-label="Capture"
            onClick={props.onCapture}
            className={classNames(
              "h-11 w-11 rounded-full flex items-center justify-center",
              props.captureInProgress ? "bg-fuchsia-500/80 text-white" : "bg-fuchsia-600 text-white"
            )}
          >
            <CameraIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
          <button
            type="button"
            aria-label="Save or print"
            disabled={!props.printEnabled}
            onClick={props.onSaveOrPrint}
            className={classNames(
              "h-11 w-11 rounded-full flex items-center justify-center",
              props.printEnabled ? "bg-zinc-200 text-zinc-700" : "bg-zinc-300 text-zinc-500"
            )}
          >
            <PrintIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="aspect-square w-11 rounded-full bg-zinc-200 flex items-center justify-center">
          <button
            type="button"
            aria-label="Save JPG"
            disabled={!props.printEnabled}
            onClick={props.onSaveJpg}
            className={classNames(
              "h-11 w-11 rounded-full flex items-center justify-center text-xs font-extrabold tracking-wide",
              props.printEnabled ? "bg-zinc-200 text-zinc-800" : "bg-zinc-300 text-zinc-500"
            )}
          >
            JPG
          </button>
        </div>
      </div>
    </div>
  );
}

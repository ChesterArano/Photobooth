import { LogoMark } from "./Icons";

export function LandingView(props: {
  brandName: string;
  tagline: string;
  onStart: () => void;
}) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4">
      <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center text-center">
        <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white/70 p-10 shadow-xl backdrop-blur">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-zinc-950 p-2">
              <LogoMark className="h-9 w-9" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-950">{props.brandName}</h1>
          </div>
          <div className="mt-4 text-sm font-medium text-zinc-600">
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
              {props.tagline}
            </span>
          </div>

          <button
            type="button"
            onClick={props.onStart}
            className="mt-10 w-full rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-zinc-900 active:translate-y-px"
          >
            START
          </button>

          <div className="mt-6 text-xs text-zinc-500">Camera access required to take photos.</div>
        </div>
      </div>
    </div>
  );
}

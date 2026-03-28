import { LogoMark } from "./Icons";

export function BoothHeader(props: {
  brandName: string;
  tagline: string;
  onReset: () => void;
}) {
  return (
    <div className="text-center mt-2">
      <h1
        className="text-4xl font-bold text-zinc-950 md:text-5xl inline-flex items-center justify-center gap-2 cursor-pointer select-none"
        onClick={props.onReset}
      >
        <div className="rounded-2xl bg-zinc-950 p-2">
          <LogoMark className="h-8 w-8" />
        </div>
        {props.brandName}
      </h1>
      <div className="text-sm font-medium relative mx-auto inline-block w-max drop-shadow-sm">
        <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 py-3">
          <span>{props.tagline}</span>
        </div>
      </div>
    </div>
  );
}

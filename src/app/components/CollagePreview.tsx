import type { CSSProperties, ReactNode } from "react";
import type { PrintLayoutConfig, PreviewBorderDesign } from "../types";
import { borderToCss, classNames, formatFooterDate, readableTextColor } from "../utils";

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

export function CollagePreview(props: {
  layout: PrintLayoutConfig;
  photos: string[];
  border: PreviewBorderDesign;
}) {
  const used = props.photos.slice(0, props.layout.poses);

  const showFilmOverlay = props.border.overlay === "film";

  function FilmOverlay() {
    const leftMarks =
      props.layout.poses === 4 ? ["28A", "29", "29A", "30"] : ["28A", "29", "29A"];
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />

        <div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 70px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 120px), radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "auto, auto, 23px 19px",
            backgroundPosition: "0 0, 0 0, 7px 11px",
            mixBlendMode: "screen",
          }}
        />

        <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-[10px] font-semibold tracking-widest text-white/80">
          {leftMarks.map((m) => (
            <div key={m} className="select-none">
              {m}
            </div>
          ))}
        </div>

        <div className="absolute right-2 top-6 bottom-6 flex flex-col justify-between text-[10px] font-semibold tracking-widest text-white/80">
          <div className="select-none [writing-mode:vertical-rl] [text-orientation:mixed]">
            TX 5063
          </div>
          <div className="select-none [writing-mode:vertical-rl] [text-orientation:mixed]">
            TX 5063
          </div>
        </div>

        <div className="absolute left-3 top-3 h-0 w-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-white/70" />
        <div className="absolute left-3 bottom-3 h-0 w-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-white/70" />
      </div>
    );
  }

  function Slot(slotProps: { src?: string; seed: number }) {
    return (
      <div
        className={classNames(
          "relative overflow-hidden bg-white ring-1 ring-zinc-200",
          showFilmOverlay ? "rounded-md" : "rounded-xl"
        )}
      >
        {slotProps.src ? (
          <img alt="" src={slotProps.src} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage seed={slotProps.seed} />
        )}
      </div>
    );
  }

  const sheetStyle: CSSProperties = {
    aspectRatio: props.layout.paper === "4x6-portrait" ? "4 / 6" : "6 / 4",
  };

  const frameStyle: CSSProperties = {
    ...borderToCss(props.border),
    padding: props.border.thickness,
    borderRadius: props.border.radius,
  };

  const footerVisible = props.border.showDate || props.border.footerText.trim().length > 0;
  const footerText = props.border.footerText.trim();
  const footerDate = props.border.showDate ? formatFooterDate(props.border.footerDate) : "";
  const footerColor = readableTextColor(props.border.color1);
  const footerShadow =
    footerColor === "#ffffff"
      ? "0 1px 2px rgba(0,0,0,0.35)"
      : "0 1px 2px rgba(255,255,255,0.35)";

  const footer = footerVisible ? (
    <div className="shrink-0 rounded-2xl px-4 py-3 text-center" style={{ color: footerColor, textShadow: footerShadow }}>
      {footerText ? (
        <div className="text-sm font-extrabold tracking-wide">{footerText}</div>
      ) : null}
      {footerDate ? (
        <div className="mt-0.5 text-xs font-semibold tracking-wide opacity-90">{footerDate}</div>
      ) : null}
    </div>
  ) : null;

  let content: ReactNode;

  if (props.layout.id === "strip_3_vertical") {
    const rows = props.layout.poses;
    content = (
      <div className="grid h-full gap-3 rounded-2xl p-2" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }, (_, i) => (
          <Slot key={i} src={used[i]} seed={i + 1} />
        ))}
      </div>
    );
  } else if (props.layout.id === "strip_4_vertical") {
    const rows = props.layout.poses;
    content = (
      <div className="grid h-full gap-3 rounded-2xl p-2" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows }, (_, i) => (
          <Slot key={i} src={used[i]} seed={i + 1} />
        ))}
      </div>
    );
  } else if (props.layout.id === "strip_3" || props.layout.id === "strip_4") {
    const rows = props.layout.poses;
    content = (
      <div className="grid h-full grid-cols-2 gap-3">
        {Array.from({ length: 2 }, (_, stripIdx) => (
          <div
            key={stripIdx}
            className="grid gap-3 rounded-2xl p-2"
            style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows }, (_, i) => (
              <Slot key={i} src={used[i]} seed={stripIdx * 10 + i + 1} />
            ))}
          </div>
        ))}
      </div>
    );
  } else if (props.layout.id === "4r_4_duo") {
    content = (
      <div className="grid h-full grid-rows-2 gap-3">
        {Array.from({ length: 2 }, (_, copyIdx) => (
          <div key={copyIdx} className="grid grid-cols-2 grid-rows-2 gap-3">
            <Slot src={used[0]} seed={copyIdx * 10 + 1} />
            <Slot src={used[1]} seed={copyIdx * 10 + 2} />
            <Slot src={used[2]} seed={copyIdx * 10 + 3} />
            <Slot src={used[3]} seed={copyIdx * 10 + 4} />
          </div>
        ))}
      </div>
    );
  } else if (props.layout.id === "4r_4") {
    content = (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
        <Slot src={used[0]} seed={1} />
        <Slot src={used[1]} seed={2} />
        <Slot src={used[2]} seed={3} />
        <Slot src={used[3]} seed={4} />
      </div>
    );
  } else if (props.layout.id === "4r_3_left") {
    content = (
      <div className="grid h-full grid-cols-[1.35fr_0.65fr] gap-3">
        <Slot src={used[0]} seed={1} />
        <div className="grid grid-rows-2 gap-3">
          <Slot src={used[1]} seed={2} />
          <Slot src={used[2]} seed={3} />
        </div>
      </div>
    );
  } else if (props.layout.id === "4r_3_right") {
    content = (
      <div className="grid h-full grid-cols-[0.65fr_1.35fr] gap-3">
        <div className="grid grid-rows-2 gap-3">
          <Slot src={used[1]} seed={2} />
          <Slot src={used[2]} seed={3} />
        </div>
        <Slot src={used[0]} seed={1} />
      </div>
    );
  } else if (props.layout.id === "4r_2") {
    content = (
      <div className="grid h-full grid-cols-2 gap-3">
        <Slot src={used[0]} seed={1} />
        <Slot src={used[1]} seed={2} />
      </div>
    );
  } else {
    content = (
      <div className="h-full">
        <Slot src={used[0]} seed={1} />
      </div>
    );
  }

  return (
    <div className="shadow-inner overflow-hidden w-full" style={frameStyle}>
      <div className="relative w-full" style={sheetStyle}>
        {content}
        {showFilmOverlay ? <FilmOverlay /> : null}
      </div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

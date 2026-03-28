import type { PrintLayoutId } from "../types";

export function LayoutThumb(props: { layoutId: PrintLayoutId; className?: string }) {
  const base = (
    <rect
      x="8"
      y="8"
      width="84"
      height="84"
      rx="14"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
  );

  const stroke = 4;
  const common = {
    stroke: "currentColor",
    strokeWidth: stroke,
    fill: "none",
  } as const;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={props.className}
      aria-hidden="true"
    >
      {base}

      {props.layoutId === "4r_4" ? (
        <>
          <rect x="14" y="14" width="36" height="36" rx="8" {...common} />
          <rect x="50" y="14" width="36" height="36" rx="8" {...common} />
          <rect x="14" y="50" width="36" height="36" rx="8" {...common} />
          <rect x="50" y="50" width="36" height="36" rx="8" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_4_duo" ? (
        <>
          <rect x="14" y="14" width="72" height="34" rx="10" {...common} />
          <rect x="14" y="52" width="72" height="34" rx="10" {...common} />
          <path d="M50 14v34" {...common} />
          <path d="M14 31h72" {...common} />
          <path d="M50 52v34" {...common} />
          <path d="M14 69h72" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_3_left" ? (
        <>
          <rect x="14" y="14" width="44" height="72" rx="10" {...common} />
          <rect x="60" y="14" width="26" height="34" rx="10" {...common} />
          <rect x="60" y="52" width="26" height="34" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_3_right" ? (
        <>
          <rect x="42" y="14" width="44" height="72" rx="10" {...common} />
          <rect x="14" y="14" width="26" height="34" rx="10" {...common} />
          <rect x="14" y="52" width="26" height="34" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_2" ? (
        <>
          <rect x="14" y="14" width="36" height="72" rx="10" {...common} />
          <rect x="50" y="14" width="36" height="72" rx="10" {...common} />
        </>
      ) : null}

      {props.layoutId === "4r_1" ? (
        <>
          <rect x="14" y="14" width="72" height="72" rx="12" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_3" ? (
        <>
          <rect x="14" y="14" width="34" height="72" rx="10" {...common} />
          <rect x="52" y="14" width="34" height="72" rx="10" {...common} />
          <path d="M14 38h34" {...common} />
          <path d="M14 62h34" {...common} />
          <path d="M52 38h34" {...common} />
          <path d="M52 62h34" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_3_vertical" ? (
        <>
          <rect x="28" y="14" width="44" height="72" rx="10" {...common} />
          <path d="M28 38h44" {...common} />
          <path d="M28 62h44" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_4_vertical" ? (
        <>
          <rect x="28" y="14" width="44" height="72" rx="10" {...common} />
          <path d="M28 32h44" {...common} />
          <path d="M28 50h44" {...common} />
          <path d="M28 68h44" {...common} />
        </>
      ) : null}

      {props.layoutId === "strip_4" ? (
        <>
          <rect x="14" y="14" width="34" height="72" rx="10" {...common} />
          <rect x="52" y="14" width="34" height="72" rx="10" {...common} />
          <path d="M14 32h34" {...common} />
          <path d="M14 50h34" {...common} />
          <path d="M14 68h34" {...common} />
          <path d="M52 32h34" {...common} />
          <path d="M52 50h34" {...common} />
          <path d="M52 68h34" {...common} />
        </>
      ) : null}
    </svg>
  );
}

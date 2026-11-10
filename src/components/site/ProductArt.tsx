import { cn } from "@/lib/utils";

type Props = {
  category: string;
  seed?: string;
  className?: string;
  showLabel?: boolean;
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PALETTES = [
  { a: "#f6e3dc", b: "#e9c3b6", c: "#b97a67", ink: "#5c342b" },
  { a: "#fbf1e8", b: "#ead6c4", c: "#c19a78", ink: "#4b3529" },
  { a: "#f6e7e6", b: "#dfb9b5", c: "#a96b63", ink: "#552f2c" },
  { a: "#f8ece6", b: "#e2c8bd", c: "#b5836f", ink: "#4a2f27" },
  { a: "#f4e6e9", b: "#d9bcc5", c: "#9d6f7f", ink: "#4a2c36" },
];

function Strands({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeLinecap="round">
      <path d="M60 300 C 120 210, 170 250, 220 150 S 320 110, 330 40" strokeWidth="1.4" opacity="0.55" />
      <path d="M85 320 C 150 230, 195 265, 250 165 S 345 120, 352 55" strokeWidth="1" opacity="0.4" />
      <path d="M40 285 C 100 200, 160 235, 200 140 S 290 100, 305 30" strokeWidth="0.8" opacity="0.3" />
      <path d="M110 330 C 175 245, 220 275, 272 178 S 368 135, 375 70" strokeWidth="0.7" opacity="0.22" />
    </g>
  );
}

function Lashes({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M70 220 C 130 165, 220 160, 320 205"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        opacity="0.5"
      />
      {Array.from({ length: 11 }).map((_, i) => {
        const x = 90 + i * 21;
        const lift = 46 + Math.sin(i / 2.2) * 16;
        return (
          <path
            key={i}
            d={`M${x} ${222 - i * 2.2} q ${8 + i} ${-lift} ${26 + i * 1.6} ${-lift - 26}`}
            fill="none"
            stroke={color}
            strokeWidth="1.1"
            opacity={0.22 + i * 0.035}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function Nails({ color }: { color: string }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${108 + i * 46} ${210 - Math.abs(1.5 - i) * 14}) rotate(${-8 + i * 5})`}>
          <rect x="0" y="-18" width="26" height="92" rx="13" fill="none" stroke={color} strokeWidth="1.1" opacity="0.45" />
          <rect x="0" y="-18" width="26" height="34" rx="13" fill={color} opacity="0.12" />
        </g>
      ))}
    </g>
  );
}

function Accessories({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1" opacity="0.4">
      <circle cx="180" cy="190" r="58" />
      <circle cx="180" cy="190" r="88" opacity="0.5" />
      <circle cx="180" cy="190" r="118" opacity="0.3" />
      <path d="M180 72 v236 M62 190 h236" opacity="0.25" />
    </g>
  );
}

export function ProductArt({ category, seed = "femme", className, showLabel = false }: Props) {
  const palette = PALETTES[hash(seed) % PALETTES.length];
  const motif =
    category === "Lashes"
      ? "lashes"
      : category === "Nails"
        ? "nails"
        : category === "Accessories"
          ? "accessories"
          : "strands";

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: palette.a }}
      aria-hidden={!showLabel}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 15% 10%, ${palette.a} 0%, transparent 55%),
                       radial-gradient(90% 90% at 85% 20%, ${palette.b} 0%, transparent 60%),
                       radial-gradient(100% 100% at 50% 120%, ${palette.c} 0%, transparent 65%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="200" cy="205" rx="150" ry="165" fill={palette.ink} opacity="0.05" />
        {motif === "strands" && <Strands color={palette.ink} />}
        {motif === "lashes" && <Lashes color={palette.ink} />}
        {motif === "nails" && <Nails color={palette.ink} />}
        {motif === "accessories" && <Accessories color={palette.ink} />}
        <text
          x="24"
          y="372"
          fill={palette.ink}
          opacity="0.5"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Femme
        </text>
      </svg>
      {showLabel && (
        <span className="absolute right-4 top-4 rounded-full bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-espresso backdrop-blur">
          {category}
        </span>
      )}
    </div>
  );
}

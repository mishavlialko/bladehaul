import Container from '@/components/shared/Container';

// Approximate lower-48 dot-grid silhouette. Pure decoration — coordinates picked
// to roughly trace the US outline at viewBox 600x240. Drives the impression of
// continental scope without any interactive map dependency.
const DOTS: Array<[number, number]> = [
  // Row 0 — northern border
  [80, 40], [110, 38], [140, 36], [170, 34], [200, 32], [230, 30], [260, 28],
  [290, 28], [320, 28], [350, 30], [380, 32], [410, 34], [440, 34], [470, 36],
  // Row 1
  [60, 62], [90, 62], [120, 60], [150, 58], [180, 56], [210, 56], [240, 54],
  [270, 54], [300, 54], [330, 54], [360, 54], [390, 56], [420, 56], [450, 58],
  [480, 60], [510, 62], [540, 64],
  // Row 2
  [60, 86], [90, 86], [120, 84], [150, 84], [180, 82], [210, 82], [240, 80],
  [270, 80], [300, 80], [330, 80], [360, 80], [390, 80], [420, 80], [450, 82],
  [480, 84], [510, 86], [540, 90],
  // Row 3
  [70, 110], [100, 108], [130, 108], [160, 108], [190, 106], [220, 106],
  [250, 106], [280, 106], [310, 106], [340, 106], [370, 106], [400, 106],
  [430, 106], [460, 108], [490, 108], [520, 110],
  // Row 4
  [90, 132], [120, 132], [150, 132], [180, 132], [210, 132], [240, 132],
  [270, 132], [300, 132], [330, 132], [360, 132], [390, 132], [420, 132],
  [450, 132], [480, 132], [510, 134],
  // Row 5
  [110, 158], [140, 158], [170, 158], [200, 158], [230, 158], [260, 158],
  [290, 158], [320, 158], [350, 158], [380, 158], [410, 158], [440, 158],
  [470, 160], [500, 162],
  // Row 6 — gulf + Florida start
  [140, 184], [170, 184], [200, 184], [230, 184], [260, 184], [290, 184],
  [320, 184], [350, 184], [380, 184], [410, 184], [490, 184], [510, 186],
  // Row 7
  [180, 206], [210, 206], [240, 208], [270, 210], [510, 208],
  // Row 8 — Florida tip
  [510, 226],
];

const CITY_PINS: Array<{
  cx: number;
  cy: number;
  label: string;
  textX: number;
  textY: number;
  delay: 'd1' | 'd2' | 'd3';
}> = [
  { cx: 90, cy: 138, label: 'LAX', textX: 92, textY: 156, delay: 'd1' },
  { cx: 300, cy: 160, label: 'DFW', textX: 302, textY: 178, delay: 'd2' },
  { cx: 420, cy: 148, label: 'ATL', textX: 422, textY: 166, delay: 'd3' },
  { cx: 500, cy: 90, label: 'JFK', textX: 502, textY: 82, delay: 'd2' },
];

export default function Coverage() {
  return (
    <section
      id="coverage"
      className="relative isolate scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      {/* Subtle radial accent glow — two warm orange wells, one bright (top-right), one faint (bottom-left) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_18%,rgba(234,106,17,0.10),transparent_55%),radial-gradient(circle_at_10%_85%,rgba(234,106,17,0.04),transparent_50%)]"
      />

      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60"
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Coverage
          </p>
        </div>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Left: copy + stats */}
          <div>
            <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              All 50 states.
              <br />
              Every{' '}
              <em className="not-italic text-orange">interstate.</em>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
              Door-to-door auto transport across all 50 states. No origin
              zones, no surcharge counties, no &ldquo;we don&apos;t go
              there.&rdquo;
            </p>

            <dl className="mt-10 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-5">
              <div className="flex flex-col gap-1 pr-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  50
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  States
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  Vetted
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  Carriers
                </dd>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <dt className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  Door
                </dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  to door
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: dot-grid US map */}
          <div className="relative">
            {/* Hairline bracket corners (orange) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2"
            >
              <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-orange/55" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-orange/55" />
              <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-orange/55" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-orange/55" />
            </div>

            <div className="relative h-48 w-full sm:h-60">
              <svg
                viewBox="0 0 600 240"
                className="block h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient
                    id="coverage-fade"
                    cx="50%"
                    cy="55%"
                    r="62%"
                  >
                    <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="70%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <mask id="coverage-fade-mask">
                    <rect
                      width="600"
                      height="240"
                      fill="url(#coverage-fade)"
                    />
                  </mask>
                  <linearGradient
                    id="coverage-line"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#EA6A11" stopOpacity="0" />
                    <stop offset="40%" stopColor="#EA6A11" stopOpacity="0.55" />
                    <stop offset="60%" stopColor="#EA6A11" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#EA6A11" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Dot-grid silhouette */}
                <g
                  mask="url(#coverage-fade-mask)"
                  fill="rgba(255,255,255,0.28)"
                >
                  {DOTS.map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="1.6" />
                  ))}
                </g>

                {/* Coast-to-coast hairline arc */}
                <path
                  d="M 90 138 Q 220 100 320 132 T 510 90"
                  stroke="url(#coverage-line)"
                  strokeWidth="0.8"
                  fill="none"
                  strokeDasharray="2 4"
                />

                {/* City pins with pulsing halo */}
                {CITY_PINS.map((pin) => (
                  <g key={pin.label}>
                    <circle
                      className={`coverage-pulse-ring${pin.delay === 'd2' ? ' coverage-pulse-ring--d2' : pin.delay === 'd3' ? ' coverage-pulse-ring--d3' : ''}`}
                      cx={pin.cx}
                      cy={pin.cy}
                      r="4"
                      fill="#EA6A11"
                      opacity="0.5"
                    />
                    <circle cx={pin.cx} cy={pin.cy} r="3.5" fill="#EA6A11" />
                    <text
                      x={pin.textX}
                      y={pin.textY}
                      fontFamily="ui-monospace,Menlo,monospace"
                      fontSize="9"
                      letterSpacing="0.12em"
                      fill="rgba(255,255,255,0.7)"
                    >
                      {pin.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
              <span>49&deg;N</span>
              <span>Coast to Coast</span>
              <span>25&deg;N</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

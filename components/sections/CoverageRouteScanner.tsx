'use client';

import { ArrowRight } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import Button from '@/components/shared/Button';
import { cn } from '@/lib/cn';
import type { Route, RouteId } from '@/lib/routes';

const DOTS: Array<[number, number]> = [
  [80, 40],
  [110, 38],
  [140, 36],
  [170, 34],
  [200, 32],
  [230, 30],
  [260, 28],
  [290, 28],
  [320, 28],
  [350, 30],
  [380, 32],
  [410, 34],
  [440, 34],
  [470, 36],
  [60, 62],
  [90, 62],
  [120, 60],
  [150, 58],
  [180, 56],
  [210, 56],
  [240, 54],
  [270, 54],
  [300, 54],
  [330, 54],
  [360, 54],
  [390, 56],
  [420, 56],
  [450, 58],
  [480, 60],
  [510, 62],
  [540, 64],
  [60, 86],
  [90, 86],
  [120, 84],
  [150, 84],
  [180, 82],
  [210, 82],
  [240, 80],
  [270, 80],
  [300, 80],
  [330, 80],
  [360, 80],
  [390, 80],
  [420, 80],
  [450, 82],
  [480, 84],
  [510, 86],
  [540, 90],
  [70, 110],
  [100, 108],
  [130, 108],
  [160, 108],
  [190, 106],
  [220, 106],
  [250, 106],
  [280, 106],
  [310, 106],
  [340, 106],
  [370, 106],
  [400, 106],
  [430, 106],
  [460, 108],
  [490, 108],
  [520, 110],
  [90, 132],
  [120, 132],
  [150, 132],
  [180, 132],
  [210, 132],
  [240, 132],
  [270, 132],
  [300, 132],
  [330, 132],
  [360, 132],
  [390, 132],
  [420, 132],
  [450, 132],
  [480, 132],
  [510, 134],
  [110, 158],
  [140, 158],
  [170, 158],
  [200, 158],
  [230, 158],
  [260, 158],
  [290, 158],
  [320, 158],
  [350, 158],
  [380, 158],
  [410, 158],
  [440, 158],
  [470, 160],
  [500, 162],
  [140, 184],
  [170, 184],
  [200, 184],
  [230, 184],
  [260, 184],
  [290, 184],
  [320, 184],
  [350, 184],
  [380, 184],
  [410, 184],
  [490, 184],
  [510, 186],
  [180, 206],
  [210, 206],
  [240, 208],
  [270, 210],
  [510, 208],
  [510, 226],
];

type CityKey = 'LA' | 'DAL' | 'ATL' | 'NYC' | 'MIA';

const CITY_POINTS: Record<
  CityKey,
  { x: number; y: number; labelX: number; labelY: number }
> = {
  LA: { x: 90, y: 138, labelX: 92, labelY: 157 },
  DAL: { x: 300, y: 160, labelX: 302, labelY: 179 },
  ATL: { x: 420, y: 148, labelX: 422, labelY: 167 },
  NYC: { x: 500, y: 90, labelX: 502, labelY: 82 },
  MIA: { x: 510, y: 208, labelX: 514, labelY: 226 },
};

type ScannerRouteConfig = {
  routeId: RouteId;
  origin: CityKey;
  destination: CityKey;
  path: string;
};

const FEATURED_ROUTE_CONFIG = [
  {
    routeId: 'R-002',
    origin: 'LA',
    destination: 'NYC',
    path: 'M 90 138 Q 278 70 500 90',
  },
  {
    routeId: 'R-004',
    origin: 'DAL',
    destination: 'LA',
    path: 'M 300 160 Q 192 106 90 138',
  },
  {
    routeId: 'R-006',
    origin: 'ATL',
    destination: 'LA',
    path: 'M 420 148 Q 254 92 90 138',
  },
  {
    routeId: 'R-001',
    origin: 'NYC',
    destination: 'MIA',
    path: 'M 500 90 Q 548 148 510 208',
  },
] as const satisfies readonly ScannerRouteConfig[];

type CoverageRouteScannerProps = {
  routes: readonly Route[];
};

export default function CoverageRouteScanner({
  routes,
}: CoverageRouteScannerProps) {
  const [selectedId, setSelectedId] = useState<RouteId>('R-002');

  const featuredRoutes = useMemo(
    () =>
      FEATURED_ROUTE_CONFIG.map((config) => {
        const route = routes.find(({ id }) => id === config.routeId);
        if (!route) throw new Error(`Missing route ${config.routeId}`);
        return { ...config, ...route };
      }),
    [routes],
  );

  const selectedRoute =
    featuredRoutes.find(({ routeId }) => routeId === selectedId) ??
    featuredRoutes[0];

  return (
    <div className="relative min-w-0">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-2">
        <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-orange/55" />
        <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-orange/55" />
        <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-orange/55" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-orange/55" />
      </div>

      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-white/55">
        <span>Route scan</span>
        <span>Select a route</span>
      </div>

      <div className="relative mt-3 h-44 w-full sm:h-56 lg:h-52 xl:h-56">
        <svg
          viewBox="0 0 600 240"
          className="block h-full w-full overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id="coverage-fade" cx="50%" cy="55%" r="62%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="70%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="coverage-fade-mask">
              <rect width="600" height="240" fill="url(#coverage-fade)" />
            </mask>
            <marker
              id="coverage-arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M 0 0 L 8 4 L 0 8 Z" fill="#EA6A11" />
            </marker>
          </defs>

          <g mask="url(#coverage-fade-mask)" fill="rgba(255,255,255,0.28)">
            {DOTS.map(([cx, cy], index) => (
              <circle key={index} cx={cx} cy={cy} r="1.6" />
            ))}
          </g>

          {featuredRoutes.map((route) => (
            <path
              key={route.routeId}
              d={route.path}
              className={cn(
                'transition-opacity duration-300 ease-out-expo motion-reduce:transition-none',
                route.routeId === selectedRoute.routeId
                  ? 'opacity-[0.92]'
                  : 'opacity-0',
              )}
              stroke="#EA6A11"
              strokeWidth="1.25"
              strokeLinecap="round"
              markerEnd="url(#coverage-arrow)"
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          ))}

          {Object.entries(CITY_POINTS).map(([city, point]) => {
            const cityKey = city as CityKey;
            const isOrigin = selectedRoute.origin === cityKey;
            const isDestination = selectedRoute.destination === cityKey;
            const isActive = isOrigin || isDestination;

            return (
              <g
                key={cityKey}
                className={cn(
                  'transition-opacity duration-150 ease-out motion-reduce:transition-none',
                  isActive ? 'opacity-100' : 'opacity-35',
                )}
              >
                {isActive && (
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill="none"
                      stroke="#EA6A11"
                      strokeWidth="0.8"
                      opacity="0.55"
                    />
                    <circle
                      key={`${selectedRoute.routeId}-${cityKey}`}
                      className="coverage-pin-confirm"
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill="#EA6A11"
                      opacity="0"
                    />
                  </>
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 4 : 2.5}
                  fill={isActive ? '#EA6A11' : 'rgba(255,255,255,0.72)'}
                />
                {isDestination && (
                  <circle cx={point.x} cy={point.y} r="1.4" fill="#F4F4F0" />
                )}
                <text
                  x={point.labelX}
                  y={point.labelY}
                  fontFamily="ui-monospace,Menlo,monospace"
                  fontSize="9"
                  letterSpacing="0.12em"
                  fill={
                    isActive
                      ? 'rgba(255,255,255,0.86)'
                      : 'rgba(255,255,255,0.62)'
                  }
                >
                  {cityKey}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
        <span>49&deg;N</span>
        <span>Coast to coast</span>
        <span>25&deg;N</span>
      </div>

      <div
        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        role="group"
        aria-label="Popular route previews"
      >
        {featuredRoutes.map((route) => {
          const isSelected = route.routeId === selectedRoute.routeId;
          const descriptionId = `coverage-route-description-${route.routeId.toLowerCase()}`;
          return (
            <Fragment key={route.routeId}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-controls="coverage-route-readout"
                aria-describedby={descriptionId}
                onClick={() => setSelectedId(route.routeId)}
                className={cn(
                  'min-h-11 min-w-0 rounded-lg border px-3 py-2 text-left transition-colors duration-150 ease-out-quart focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange motion-reduce:transition-none',
                  isSelected
                    ? 'border-orange/70 bg-orange/10 text-white'
                    : 'border-white/10 bg-white/[0.025] text-white/65 hover:border-white/25 hover:bg-white/[0.05] hover:text-white',
                )}
              >
                <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/55">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 w-1.5 rounded-full border',
                      isSelected
                        ? 'border-orange bg-orange'
                        : 'border-white/35 bg-transparent',
                    )}
                  />
                  {route.routeId}
                </span>
                <span className="mt-1 block text-sm font-semibold tracking-tight">
                  {route.origin}{' '}
                  <ArrowRight
                    aria-hidden="true"
                    className="mx-1 inline h-3.5 w-3.5"
                    strokeWidth={1.5}
                  />{' '}
                  {route.destination}
                </span>
              </button>
              <span id={descriptionId} hidden>
                {`Preview route from ${route.from} to ${route.to}.`}
              </span>
            </Fragment>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/10 pt-5 sm:flex sm:items-end sm:justify-between sm:gap-5">
        <div id="coverage-route-readout" className="min-h-14 min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/55">
            Selected route
          </p>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-1 text-sm font-semibold leading-snug text-white"
          >
            <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-orange">
              [{selectedRoute.routeId}]
            </span>{' '}
            {selectedRoute.from} <span className="sr-only">to </span>
            <span aria-hidden="true" className="text-white/40">
              →
            </span>{' '}
            {selectedRoute.to}
          </p>
        </div>

        <Button
          href="#quote"
          size="md"
          className="mt-4 w-full shrink-0 motion-reduce:transition-none motion-reduce:active:scale-100 sm:mt-0 sm:w-auto"
        >
          Get a Real Quote
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.5}
          />
        </Button>
      </div>
    </div>
  );
}

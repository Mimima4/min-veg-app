"use client";

import { useId } from "react";
import { MIN_VEG_ROAD_REVEAL_PATH } from "./min-veg-road-loader-path";

type MinVegRoadLoaderProps = {
  message?: string;
  className?: string;
};

/**
 * Adapted from owner GIF: static pin + smooth SVG-mask road reveal on app background.
 */
export function MinVegRoadLoader({
  message = "Building route…",
  className = "",
}: MinVegRoadLoaderProps) {
  const maskId = `min-veg-road-reveal-${useId().replace(/:/g, "")}`;

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative h-40 w-40">
        <svg
          viewBox="0 0 640 640"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect width="640" height="640" fill="black" />
              <path
                d={MIN_VEG_ROAD_REVEAL_PATH}
                pathLength={1}
                fill="none"
                stroke="white"
                strokeWidth="280"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="min-veg-loader-reveal-stroke"
              />
            </mask>
          </defs>
          <image
            href="/brand/loader-road.png"
            width="640"
            height="640"
            mask={`url(#${maskId})`}
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>

        <img
          src="/brand/loader-pin.png"
          alt=""
          width={640}
          height={640}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          decoding="async"
        />
      </div>

      <p className="mt-6 text-sm font-medium text-stone-600">{message}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { SteigenCarpenterVekslingInfoCopy } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";
import { STEIGEN_CARPENTER_VEKSLING_BADGE } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";
import SteigenVekslingInfoPanel from "./steigen-veksling-info-panel";

type Props = {
  copy: SteigenCarpenterVekslingInfoCopy;
  className?: string;
};

export default function SteigenVekslingBadgeWithInfo({ copy, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="steigen-veksling-info-panel"
        className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 transition hover:border-sky-400 hover:bg-sky-100"
        data-testid="steigen-veksling-badge"
      >
        {copy.badge ?? STEIGEN_CARPENTER_VEKSLING_BADGE}
      </button>

      {open ? (
        <div id="steigen-veksling-info-panel" className="mt-3">
          <SteigenVekslingInfoPanel copy={copy} />
        </div>
      ) : null}
    </div>
  );
}

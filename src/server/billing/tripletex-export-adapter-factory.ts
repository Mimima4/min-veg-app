import "server-only";

import type { TripletexExportAdapter } from "@/server/billing/tripletex-export-adapter";
import { TripletexExportAdapterStub } from "@/server/billing/tripletex-export-adapter-stub";
import { TripletexExportAdapterReal } from "@/server/billing/tripletex-export-adapter-real";

export function getTripletexExportAdapter(): TripletexExportAdapter {
  const mode = process.env.TRIPLETEX_EXPORT_MODE?.trim().toLowerCase();

  switch (mode) {
    case "real":
      return new TripletexExportAdapterReal();
    case "stub":
    default:
      return new TripletexExportAdapterStub();
  }
}

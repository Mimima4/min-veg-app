import "server-only";

export function isTripletexExportableLedgerEntry(params: {
  entryType: string | null | undefined;
}) {
  switch (params.entryType) {
    case "provider_payment_received":
    case "refund_received":
    case "adjustment":
      return true;
    default:
      return false;
  }
}

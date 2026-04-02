import "server-only";

export type BillingCustomerType = "b2b" | "b2c";

export function inferBillingCustomerType(params: {
  customerOrgNumber?: string | null;
}): BillingCustomerType {
  return params.customerOrgNumber?.trim() ? "b2b" : "b2c";
}

export function normalizeNorwayMva(params: {
  grossAmount: number;
  customerType: BillingCustomerType;
}) {
  const mvaRate = 0.25;

  // Initial Norway-first default:
  // domestic B2B and B2C both use standard 25% unless later overridden by explicit cross-border rules.
  const netAmount = Math.round(params.grossAmount / (1 + mvaRate));
  const mvaAmount = params.grossAmount - netAmount;

  return {
    grossAmount: params.grossAmount,
    netAmount,
    mvaAmount,
    mvaRate,
    mvaCode: "NO_STANDARD_25",
  };
}

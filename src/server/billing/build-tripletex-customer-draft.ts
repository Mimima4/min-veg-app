import "server-only";

export type TripletexCustomerDraftInput = {
  familyAccountId: string;
  customerType: "b2b" | "b2c";
  customerReference: string | null;
  organizationNumber: string | null;
  email?: string | null;
  displayName?: string | null;
};

export type TripletexCustomerDraft = {
  isPrivateIndividual: boolean;
  invoiceSendMethod: "EMAIL";
  name: string;
  organizationNumber: string | null;
  email: string | null;
  customerReference: string;
  postalAddress: null;
  physicalAddress: null;
};

export function buildTripletexCustomerDraft(
  input: TripletexCustomerDraftInput
): TripletexCustomerDraft {
  const customerReference = input.customerReference ?? input.familyAccountId;

  return {
    isPrivateIndividual: input.customerType !== "b2b",
    invoiceSendMethod: "EMAIL",
    name:
      input.displayName?.trim() ||
      (input.customerType === "b2b" ? "Min Veg Business Customer" : "Min Veg Parent Customer"),
    organizationNumber: input.customerType === "b2b" ? input.organizationNumber ?? null : null,
    email: input.email?.trim() || null,
    customerReference,
    postalAddress: null,
    physicalAddress: null,
  };
}

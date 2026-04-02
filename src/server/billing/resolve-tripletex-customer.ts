import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type Params = {
  familyAccountId: string;
  customerType: "b2b" | "b2c";
  organizationNumber?: string | null;
};

export async function resolveTripletexCustomer(params: Params) {
  const admin = createAdminClient();

  // 1. B2B → ищем по org number
  if (params.customerType === "b2b" && params.organizationNumber) {
    const { data } = await admin
      .from("tripletex_customer_links")
      .select("*")
      .eq("organization_number", params.organizationNumber)
      .maybeSingle();

    if (data) {
      return data.tripletex_customer_id;
    }
  }

  // 2. B2C → ищем по family_account_id
  const { data } = await admin
    .from("tripletex_customer_links")
    .select("*")
    .eq("family_account_id", params.familyAccountId)
    .eq("customer_type", params.customerType)
    .maybeSingle();

  if (data) {
    return data.tripletex_customer_id;
  }

  // 3. НЕ найден → создаём placeholder customer_id
  // (реальный create API подключим позже)
  const newCustomerId = `pending:${params.familyAccountId}`;

  await admin.from("tripletex_customer_links").insert({
    family_account_id: params.familyAccountId,
    customer_type: params.customerType,
    organization_number: params.organizationNumber ?? null,
    tripletex_customer_id: newCustomerId,
  });

  return newCustomerId;
}

import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildTripletexCustomerDraft } from "@/server/billing/build-tripletex-customer-draft";
import { getTripletexBasicAuthHeader } from "@/server/billing/tripletex-auth";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

function getCustomerSyncMode() {
  return (process.env.TRIPLETEX_CUSTOMER_SYNC_MODE?.trim().toLowerCase() || "stub") as
    | "stub"
    | "live";
}

type ResolveParams = {
  familyAccountId: string;
  customerType: "b2b" | "b2c";
  organizationNumber?: string | null;
  customerReference?: string | null;
  email?: string | null;
  displayName?: string | null;
};

type ResolveResult = {
  tripletexCustomerId: string;
  mode: "linked_existing" | "tripletex_found" | "tripletex_created" | "pending_created";
};

type TripletexCustomerLinkRow = {
  id: string;
  family_account_id: string;
  customer_type: "b2b" | "b2c";
  organization_number: string | null;
  tripletex_customer_id: string;
  sync_status: string;
  last_error: string | null;
};

function isPendingCustomerId(value: string | null | undefined) {
  return !!value && value.startsWith("pending-customer:");
}

async function upsertTripletexCustomerLink(params: {
  familyAccountId: string;
  customerType: "b2b" | "b2c";
  organizationNumber?: string | null;
  tripletexCustomerId: string;
}) {
  const admin = createAdminClient();

  const conflictTarget =
    params.customerType === "b2b" && params.organizationNumber
      ? "organization_number"
      : "family_account_id,customer_type";

  const { error } = await admin
    .from("tripletex_customer_links")
    .upsert(
      {
        family_account_id: params.familyAccountId,
        customer_type: params.customerType,
        organization_number: params.organizationNumber ?? null,
        tripletex_customer_id: params.tripletexCustomerId,
        sync_status: isPendingCustomerId(params.tripletexCustomerId) ? "pending" : "resolved",
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: conflictTarget,
      }
    );

  if (error) {
    throw new Error(`Failed to upsert Tripletex customer link: ${error.message}`);
  }
}

async function searchTripletexCustomer(params: {
  baseUrl: string;
  organizationNumber?: string | null;
  customerReference?: string | null;
}) {
  if (getCustomerSyncMode() !== "live") {
    return null as null | { id: string };
  }

  const authHeader = await getTripletexBasicAuthHeader();
  const url = `${params.baseUrl}/customer?count=1000`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tripletex customer search failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const customers = json?.values ?? [];

  if (params.organizationNumber) {
    const found = customers.find(
      (c: any) => c?.organizationNumber === params.organizationNumber
    );
    if (found?.id) {
      return { id: String(found.id) };
    }
  }

  if (params.customerReference) {
    const found = customers.find(
      (c: any) =>
        c?.customerNumber === params.customerReference ||
        c?.customerReference === params.customerReference
    );
    if (found?.id) {
      return { id: String(found.id) };
    }
  }

  return null;
}

async function createTripletexCustomer(params: {
  baseUrl: string;
  customerDraft: ReturnType<typeof buildTripletexCustomerDraft>;
}) {
  if (getCustomerSyncMode() !== "live") {
    return null as null | { id: string };
  }

  const authHeader = await getTripletexBasicAuthHeader();
  const url = `${params.baseUrl}/customer`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params.customerDraft),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tripletex customer create failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const created = json?.value;

  if (!created?.id) {
    throw new Error("Tripletex customer create response did not contain id.");
  }

  return { id: String(created.id) };
}

export async function resolveTripletexCustomerReal(
  params: ResolveParams
): Promise<ResolveResult> {
  const admin = createAdminClient();

  let existingLink: TripletexCustomerLinkRow | null = null;

  if (params.customerType === "b2b" && params.organizationNumber) {
    const { data: byOrg, error: byOrgError } = await admin
      .from("tripletex_customer_links")
      .select("*")
      .eq("organization_number", params.organizationNumber)
      .maybeSingle();

    if (byOrgError) {
      throw new Error(
        `Failed to lookup Tripletex customer link by organization number: ${byOrgError.message}`
      );
    }

    if (byOrg) {
      existingLink = byOrg as TripletexCustomerLinkRow;
    }
  }

  if (!existingLink) {
    const { data: byFamily, error: byFamilyError } = await admin
      .from("tripletex_customer_links")
      .select("*")
      .eq("family_account_id", params.familyAccountId)
      .eq("customer_type", params.customerType)
      .maybeSingle();

    if (byFamilyError) {
      throw new Error(
        `Failed to lookup Tripletex customer link by family account: ${byFamilyError.message}`
      );
    }

    if (byFamily) {
      existingLink = byFamily as TripletexCustomerLinkRow;
    }
  }

  if (existingLink && !isPendingCustomerId(existingLink.tripletex_customer_id)) {
    return {
      tripletexCustomerId: existingLink.tripletex_customer_id,
      mode: "linked_existing",
    };
  }

  const baseUrl = requireEnv("TRIPLETEX_API_BASE_URL");
  requireEnv("TRIPLETEX_CONSUMER_TOKEN");
  requireEnv("TRIPLETEX_EMPLOYEE_TOKEN");

  const customerReference = params.customerReference ?? params.familyAccountId;

  const found = await searchTripletexCustomer({
    baseUrl,
    organizationNumber: params.organizationNumber ?? null,
    customerReference,
  });

  if (found) {
    await upsertTripletexCustomerLink({
      familyAccountId: params.familyAccountId,
      customerType: params.customerType,
      organizationNumber: params.organizationNumber ?? null,
      tripletexCustomerId: found.id,
    });

    return {
      tripletexCustomerId: found.id,
      mode: "tripletex_found",
    };
  }

  const customerDraft = buildTripletexCustomerDraft({
    familyAccountId: params.familyAccountId,
    customerType: params.customerType,
    customerReference,
    organizationNumber: params.organizationNumber ?? null,
    email: params.email ?? null,
    displayName: params.displayName ?? null,
  });

  const created = await createTripletexCustomer({
    baseUrl,
    customerDraft,
  });

  if (created) {
    await upsertTripletexCustomerLink({
      familyAccountId: params.familyAccountId,
      customerType: params.customerType,
      organizationNumber: params.organizationNumber ?? null,
      tripletexCustomerId: created.id,
    });

    return {
      tripletexCustomerId: created.id,
      mode: "tripletex_created",
    };
  }

  const pendingCustomerId = `pending-customer:${params.customerType}:${params.organizationNumber ?? params.familyAccountId}`;

  await upsertTripletexCustomerLink({
    familyAccountId: params.familyAccountId,
    customerType: params.customerType,
    organizationNumber: params.organizationNumber ?? null,
    tripletexCustomerId: pendingCustomerId,
  });

  return {
    tripletexCustomerId: pendingCustomerId,
    mode: "pending_created",
  };
}

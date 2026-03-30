import "server-only";

import crypto from "node:crypto";

type SignatureVerificationResult = {
  provider: string;
  signatureMode: "verified" | "not_configured";
  signatureVerified: boolean;
  webhookSecretConfigured: boolean;
};

function normalizeProvider(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    throw new Error("provider is required.");
  }

  if (!/^[a-z0-9_-]+$/.test(normalized)) {
    throw new Error(`Unsupported provider value: ${value}`);
  }

  return normalized;
}

function getAllowedProviders(): Set<string> {
  const raw = process.env.BILLING_PROVIDER_ALLOWLIST?.trim();

  if (!raw) {
    throw new Error("BILLING_PROVIDER_ALLOWLIST is missing.");
  }

  const providers = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (providers.length === 0) {
    throw new Error("BILLING_PROVIDER_ALLOWLIST is empty.");
  }

  return new Set(providers);
}

function getWebhookSecretEnvName(provider: string): string {
  const normalized = provider.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return `BILLING_PROVIDER_${normalized}_WEBHOOK_SECRET`;
}

function extractTimestamp(
  signatureHeader: string | null,
  timestampHeader: string | null
): string | null {
  const direct = timestampHeader?.trim();

  if (direct) {
    return direct;
  }

  const header = signatureHeader?.trim();

  if (!header) {
    return null;
  }

  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2).map((item) => item.trim());

    if (key === "t" && value) {
      return value;
    }
  }

  return null;
}

function extractSignatureCandidates(signatureHeader: string | null): string[] {
  const header = signatureHeader?.trim();

  if (!header) {
    return [];
  }

  const candidates: string[] = [];

  for (const part of header.split(",")) {
    const trimmed = part.trim();

    if (!trimmed) {
      continue;
    }

    if (!trimmed.includes("=")) {
      candidates.push(trimmed);
      continue;
    }

    const [key, value] = trimmed.split("=", 2).map((item) => item.trim());

    if (
      value &&
      (key === "v1" ||
        key === "signature" ||
        key === "sig" ||
        key === "sha256")
    ) {
      candidates.push(value);
    }
  }

  return [...new Set(candidates)];
}

function secureHexCompare(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function assertProviderAllowed(providerInput: string): string {
  const provider = normalizeProvider(providerInput);
  const allowedProviders = getAllowedProviders();

  if (!allowedProviders.has(provider)) {
    throw new Error(
      `Provider ${provider} is not allowed by BILLING_PROVIDER_ALLOWLIST.`
    );
  }

  return provider;
}

export function verifyProviderIngestRequestSignature(args: {
  provider: string;
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
}): SignatureVerificationResult {
  const provider = normalizeProvider(args.provider);
  const webhookSecretEnvName = getWebhookSecretEnvName(provider);
  const webhookSecret = process.env[webhookSecretEnvName]?.trim() ?? "";

  if (!webhookSecret) {
    return {
      provider,
      signatureMode: "not_configured",
      signatureVerified: false,
      webhookSecretConfigured: false,
    };
  }

  const timestamp = extractTimestamp(args.signatureHeader, args.timestampHeader);

  if (!timestamp) {
    throw new Error(
      `Missing provider signature timestamp for ${provider}.`
    );
  }

  const signatures = extractSignatureCandidates(args.signatureHeader);

  if (signatures.length === 0) {
    throw new Error(`Missing provider signature for ${provider}.`);
  }

  const signedPayload = `${timestamp}.${args.rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const matched = signatures.some((candidate) =>
    secureHexCompare(candidate, expectedSignature)
  );

  if (!matched) {
    throw new Error(`Invalid provider signature for ${provider}.`);
  }

  return {
    provider,
    signatureMode: "verified",
    signatureVerified: true,
    webhookSecretConfigured: true,
  };
}

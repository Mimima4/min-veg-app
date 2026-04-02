import "server-only";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

export async function createTripletexSessionToken() {
  const baseUrl = requireEnv("TRIPLETEX_API_BASE_URL");
  const consumerToken = requireEnv("TRIPLETEX_CONSUMER_TOKEN");
  const employeeToken = requireEnv("TRIPLETEX_EMPLOYEE_TOKEN");

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const expirationDate = tomorrow.toISOString().slice(0, 10);

  const url =
    `${baseUrl}/token/session/:create` +
    `?consumerToken=${encodeURIComponent(consumerToken)}` +
    `&employeeToken=${encodeURIComponent(employeeToken)}` +
    `&expirationDate=${encodeURIComponent(expirationDate)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to create Tripletex session token: ${response.status} ${text}`
    );
  }

  const json = (await response.json()) as {
    value?: { token?: string };
  };

  const token = json?.value?.token;

  if (!token) {
    throw new Error("Tripletex session token response did not contain a token.");
  }

  return token;
}

export async function getTripletexBasicAuthHeader() {
  const sessionToken = await createTripletexSessionToken();
  const companyId = requireEnv("TRIPLETEX_COMPANY_ID");

  return "Basic " + Buffer.from(`${companyId}:${sessionToken}`).toString("base64");
}

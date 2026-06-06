import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LOSA_PROPOSED_AVAILABILITY_SCOPE } from "./losa-finnmark-publication-model.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const LOSA_ORDINARY_AVAILABILITY_SCOPE = "programme_in_school";

export const LOSA_ALLOWED_AVAILABILITY_SCOPES = [
  LOSA_ORDINARY_AVAILABILITY_SCOPE,
  LOSA_PROPOSED_AVAILABILITY_SCOPE,
];

export const LOSA_PSA_SCHEMA_MIGRATION_RELATIVE_PATH =
  "supabase/migrations/20260605120000_programme_school_availability_losa_scope.sql";

export function losaPsaSchemaMigrationPath() {
  return path.join(REPO_ROOT, LOSA_PSA_SCHEMA_MIGRATION_RELATIVE_PATH);
}

export async function verifyLosaPsaMigrationFilePresent() {
  const migrationPath = losaPsaSchemaMigrationPath();
  if (!existsSync(migrationPath)) {
    return {
      ok: false,
      migrationPath,
      reason: "migration_file_missing",
    };
  }

  const sql = await readFile(migrationPath, "utf8");
  const hasScope = sql.includes(LOSA_PROPOSED_AVAILABILITY_SCOPE);
  const hasOrdinary = sql.includes(LOSA_ORDINARY_AVAILABILITY_SCOPE);

  if (!hasScope || !hasOrdinary) {
    return {
      ok: false,
      migrationPath,
      reason: "migration_file_missing_scope_values",
    };
  }

  return {
    ok: true,
    migrationPath,
    reason: "migration_file_verified",
  };
}

/**
 * Optional live DB check — table readable only; constraint apply verified at migration session.
 */
export async function probeLosaPsaSchemaApplied(supabase) {
  const { error } = await supabase
    .from("programme_school_availability")
    .select("availability_scope")
    .limit(1);

  if (error) {
    return {
      checked: true,
      applied: null,
      reason: `table_probe_failed: ${error.message}`,
    };
  }

  return {
    checked: true,
    applied: null,
    reason:
      "table_readable; losa scope constraint apply status confirmed only after migration session",
  };
}

export async function assessLosaPsaSchemaReadiness({ supabase = null } = {}) {
  const fileCheck = await verifyLosaPsaMigrationFilePresent();
  const result = {
    section: "P4-LOSA-PSA-SCHEMA",
    migrationFile: fileCheck,
    allowedScopes: [...LOSA_ALLOWED_AVAILABILITY_SCOPES],
    losaScope: LOSA_PROPOSED_AVAILABILITY_SCOPE,
    dbApplied: null,
    writeAuthorized: false,
    nationwideApplicable: true,
  };

  if (supabase) {
    result.dbApplied = await probeLosaPsaSchemaApplied(supabase);
  }

  result.readyForMigrationApply = fileCheck.ok;
  result.readyForLosaPsaWrite =
    false &&
    fileCheck.ok &&
    result.dbApplied?.applied === true;

  return result;
}

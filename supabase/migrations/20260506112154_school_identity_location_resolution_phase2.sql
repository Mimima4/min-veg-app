/*
DRAFT MIGRATION / NOT APPLIED
Do not execute without review/approval.
Additive-only.
No backfill.
No existing runtime/truth table changes.
No Route Engine/runtime integration.
RLS/security policies are not final and require separate security review.
Backfill requires separate ADR/plan.
SECURITY REVIEW REQUIRED BEFORE APPLYING FINAL RLS/POLICIES.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS source_school_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  county_code text NOT NULL,
  profession_slug text NOT NULL,
  stage text NOT NULL,
  source_school_code text NOT NULL,
  source_school_label text NOT NULL,
  source_reference_url text,
  source_snapshot_label text NOT NULL,
  observed_at timestamptz NOT NULL,
  observation_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_obs_source_nonempty CHECK (btrim(source) <> ''),
  CONSTRAINT chk_obs_county_nonempty CHECK (btrim(county_code) <> ''),
  CONSTRAINT chk_obs_prof_slug_nonempty CHECK (btrim(profession_slug) <> ''),
  CONSTRAINT chk_obs_stage_nonempty CHECK (btrim(stage) <> ''),
  CONSTRAINT chk_obs_school_code_nonempty CHECK (btrim(source_school_code) <> ''),
  CONSTRAINT chk_obs_school_label_nonempty CHECK (btrim(source_school_label) <> ''),
  CONSTRAINT chk_obs_snapshot_nonempty CHECK (btrim(source_snapshot_label) <> ''),
  CONSTRAINT chk_obs_payload_object
    CHECK (observation_payload IS NULL OR jsonb_typeof(observation_payload) = 'object')
);

COMMENT ON TABLE source_school_observations IS 'Immutable source evidence layer per snapshot/profession/stage/school. No publishability fields.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_obs_snapshot_scope
  ON source_school_observations (
    source,
    source_snapshot_label,
    county_code,
    profession_slug,
    stage,
    source_school_code,
    source_school_label
  );

CREATE INDEX IF NOT EXISTS idx_obs_snapshot
  ON source_school_observations (source_snapshot_label);

CREATE INDEX IF NOT EXISTS idx_obs_county_prof_stage
  ON source_school_observations (county_code, profession_slug, stage);

CREATE TABLE IF NOT EXISTS school_identity_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL,
  candidate_identity_key text NOT NULL,
  candidate_nsr_institution_id uuid,
  candidate_location_key text,
  match_signals jsonb NOT NULL,
  signal_version text NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_sic_obs
    FOREIGN KEY (observation_id) REFERENCES source_school_observations(id),
  CONSTRAINT chk_sic_identity_key_nonempty CHECK (btrim(candidate_identity_key) <> ''),
  CONSTRAINT chk_sic_signal_ver_nonempty CHECK (btrim(signal_version) <> ''),
  CONSTRAINT chk_sic_match_signals_obj CHECK (jsonb_typeof(match_signals) = 'object')
);

COMMENT ON TABLE school_identity_candidates IS 'Generated evidence/candidate layer. Not authoritative decision.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_sic_obs_candidate_ver
  ON school_identity_candidates (observation_id, candidate_identity_key, candidate_nsr_institution_id, signal_version);

CREATE INDEX IF NOT EXISTS idx_sic_observation
  ON school_identity_candidates (observation_id);

CREATE TABLE IF NOT EXISTS identity_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_key text NOT NULL,
  alias_label text NOT NULL,
  normalized_alias_label text NOT NULL,
  alias_type text NOT NULL,
  language_variant text,
  evidence_ref jsonb,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_alias_identity_key_nonempty CHECK (btrim(identity_key) <> ''),
  CONSTRAINT chk_alias_label_nonempty CHECK (btrim(alias_label) <> ''),
  CONSTRAINT chk_alias_normalized_label_nonempty CHECK (btrim(normalized_alias_label) <> ''),
  CONSTRAINT chk_alias_type CHECK (
    alias_type IN (
      'slash_alias',
      'language_variant',
      'normalized_label',
      'source_label',
      'operator_alias'
    )
  ),
  CONSTRAINT chk_alias_evidence_ref_obj
    CHECK (evidence_ref IS NULL OR jsonb_typeof(evidence_ref) = 'object')
);

COMMENT ON TABLE identity_aliases IS 'Alias evidence only. No publishability semantics.';
COMMENT ON COLUMN identity_aliases.normalized_alias_label IS 'normalized_alias_label must be produced by approved normalization logic and reviewed before write integration.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_alias_identity_norm
  ON identity_aliases (identity_key, normalized_alias_label, alias_type, language_variant);

CREATE INDEX IF NOT EXISTS idx_alias_identity_key
  ON identity_aliases (identity_key);

CREATE TABLE IF NOT EXISTS school_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key text NOT NULL,
  identity_key text NOT NULL,
  nsr_institution_id uuid,
  county_code text,
  municipality_code text,
  location_label text,
  location_evidence_ref jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_loc_location_key_nonempty CHECK (btrim(location_key) <> ''),
  CONSTRAINT chk_loc_identity_key_nonempty CHECK (btrim(identity_key) <> ''),
  CONSTRAINT chk_loc_evidence_ref_obj
    CHECK (location_evidence_ref IS NULL OR jsonb_typeof(location_evidence_ref) = 'object')
);

COMMENT ON TABLE school_locations IS 'Identity/location evidence layer. No random campus decision policy in DB.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_loc_identity_location
  ON school_locations (identity_key, location_key);

CREATE INDEX IF NOT EXISTS idx_loc_county_municipality
  ON school_locations (county_code, municipality_code);

CREATE TABLE IF NOT EXISTS school_identity_resolution_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL,
  decision_state text NOT NULL,
  resolved_identity_key text,
  resolved_location_key text,
  responsible_provider_institution_id uuid,
  delivery_site_institution_id uuid,
  decision_actor_type text NOT NULL,
  decision_basis_version text NOT NULL,
  decision_reason_codes jsonb NOT NULL,
  confidence_status text NOT NULL,
  audit_ref text NOT NULL,
  decided_at timestamptz NOT NULL,
  superseded_at timestamptz,
  superseded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_res_obs
    FOREIGN KEY (observation_id) REFERENCES source_school_observations(id),
  CONSTRAINT chk_res_decision_state CHECK (
    decision_state IN (
      'publishable',
      'needs_review',
      'unsupported_losa',
      'external_delivery',
      'identity_unresolved',
      'location_unresolved',
      'ambiguous_candidates',
      'rejected_false_match'
    )
  ),
  CONSTRAINT chk_res_decision_actor_type CHECK (
    decision_actor_type IN ('system', 'operator')
  ),
  CONSTRAINT chk_res_confidence_status CHECK (
    confidence_status IN ('verified', 'needs_review', 'rejected')
  ),
  CONSTRAINT chk_res_basis_ver_nonempty CHECK (btrim(decision_basis_version) <> ''),
  CONSTRAINT chk_res_audit_ref_nonempty CHECK (btrim(audit_ref) <> ''),
  CONSTRAINT chk_res_reason_codes_array CHECK (
    jsonb_typeof(decision_reason_codes) = 'array'
  ),
  CONSTRAINT chk_res_supersession_pair CHECK (
    (superseded_at IS NULL AND superseded_by IS NULL)
    OR (superseded_at IS NOT NULL)
  )
);

COMMENT ON TABLE school_identity_resolution_decisions IS 'Append-only decision layer with supersession. audit_ref and decision_basis_version are required.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_res_active_obs
  ON school_identity_resolution_decisions (observation_id)
  WHERE superseded_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_res_state
  ON school_identity_resolution_decisions (decision_state);

CREATE INDEX IF NOT EXISTS idx_res_review_backlog
  ON school_identity_resolution_decisions (decision_state, decided_at)
  WHERE superseded_at IS NULL;

CREATE TABLE IF NOT EXISTS programme_availability_publication_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL,
  resolution_decision_id uuid NOT NULL,
  programme_key text NOT NULL,
  stage text NOT NULL,
  publishability_state text NOT NULL,
  verification_alignment_state text,
  decision_actor_type text NOT NULL,
  decision_basis_version text NOT NULL,
  decision_reason_codes jsonb NOT NULL,
  audit_ref text NOT NULL,
  decided_at timestamptz NOT NULL,
  superseded_at timestamptz,
  superseded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_pub_obs
    FOREIGN KEY (observation_id) REFERENCES source_school_observations(id),
  CONSTRAINT fk_pub_res_dec
    FOREIGN KEY (resolution_decision_id) REFERENCES school_identity_resolution_decisions(id),
  CONSTRAINT chk_pub_programme_key_nonempty CHECK (btrim(programme_key) <> ''),
  CONSTRAINT chk_pub_stage_nonempty CHECK (btrim(stage) <> ''),
  CONSTRAINT chk_pub_publishability_state CHECK (
    publishability_state IN ('publishable', 'needs_review', 'blocked', 'rejected')
  ),
  CONSTRAINT chk_pub_ver_alignment_state CHECK (
    verification_alignment_state IS NULL
    OR verification_alignment_state IN ('aligned', 'pending', 'not_applicable', 'blocked')
  ),
  CONSTRAINT chk_pub_decision_actor_type CHECK (
    decision_actor_type IN ('system', 'operator')
  ),
  CONSTRAINT chk_pub_basis_ver_nonempty CHECK (btrim(decision_basis_version) <> ''),
  CONSTRAINT chk_pub_audit_ref_nonempty CHECK (btrim(audit_ref) <> ''),
  CONSTRAINT chk_pub_reason_codes_array CHECK (
    jsonb_typeof(decision_reason_codes) = 'array'
  ),
  CONSTRAINT chk_pub_supersession_pair CHECK (
    (superseded_at IS NULL AND superseded_by IS NULL)
    OR (superseded_at IS NOT NULL)
  )
);

COMMENT ON TABLE programme_availability_publication_decisions IS 'Final publication gate decisions. No PSA write triggers or runtime automation.';
COMMENT ON COLUMN programme_availability_publication_decisions.verification_alignment_state IS 'verification_alignment_state does not redefine runtime verification_status.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_pub_active_obs_prog_stage
  ON programme_availability_publication_decisions (observation_id, programme_key, stage)
  WHERE superseded_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pub_state
  ON programme_availability_publication_decisions (publishability_state);

CREATE INDEX IF NOT EXISTS idx_pub_review_backlog
  ON programme_availability_publication_decisions (publishability_state, decided_at)
  WHERE superseded_at IS NULL;

CREATE TABLE IF NOT EXISTS school_identity_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_resolution_decision_id uuid,
  target_publication_decision_id uuid,
  review_event_type text NOT NULL,
  event_reason text,
  event_payload jsonb,
  actor_type text NOT NULL,
  actor_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_review_res_dec
    FOREIGN KEY (target_resolution_decision_id) REFERENCES school_identity_resolution_decisions(id),
  CONSTRAINT fk_review_pub_dec
    FOREIGN KEY (target_publication_decision_id) REFERENCES programme_availability_publication_decisions(id),
  CONSTRAINT chk_review_target_present CHECK (
    target_resolution_decision_id IS NOT NULL OR target_publication_decision_id IS NOT NULL
  ),
  CONSTRAINT chk_review_event_type CHECK (
    review_event_type IN (
      'assigned',
      'commented',
      'escalated',
      'resolved',
      'superseded',
      'reopened'
    )
  ),
  CONSTRAINT chk_review_actor_type CHECK (
    actor_type IN ('system', 'operator')
  ),
  CONSTRAINT chk_review_event_payload_obj
    CHECK (event_payload IS NULL OR jsonb_typeof(event_payload) = 'object')
);

COMMENT ON TABLE school_identity_review_events IS 'Append-only review/audit event log. Not a replacement for authoritative decision rows.';

CREATE INDEX IF NOT EXISTS idx_review_resolution_target
  ON school_identity_review_events (target_resolution_decision_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_publication_target
  ON school_identity_review_events (target_publication_decision_id, created_at);

CREATE INDEX IF NOT EXISTS idx_review_backlog
  ON school_identity_review_events (review_event_type, created_at);

/*
ROLLBACK TEMPLATE (comment-only, do not execute blindly):
1) drop school_identity_review_events
2) drop programme_availability_publication_decisions
3) drop school_identity_resolution_decisions
4) drop school_locations
5) drop identity_aliases
6) drop school_identity_candidates
7) drop source_school_observations
8) then drop extension only if it was created solely for this migration and safe to do so

Rollback must not touch existing production truth data.
No-data-loss risk to existing tables is minimized because this draft is additive-only.
*/

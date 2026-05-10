# Phase 4 LOSA Official-Source Evidence + Automated Refresh Design

## 1. Status / boundary

- Status: **PLANNING ARTIFACT / DOCS-ONLY**.
- This document defines future evidence and refresh requirements only.
- No implementation is approved by this document.
- No script/job is created by this document.
- No DB schema/write is approved by this document.
- No Route Engine consumption is approved by this document.
- No PSA publication is approved by this document.
- No operator workflow is enabled by this document.
- No readiness/pipeline integration is approved by this document.
- Separate owner gate is required before implementation.

(We design the future automatic refresh contour only. We do not build it here.)

## 2. Core principle

- Current official reality first.
- Internal project docs second.
- Product model third.
- Historical sources explain background, not current truth.
- Current legal/operational truth must be based on current official/authoritative sources.

(First verify Norway as it is now, then map into Min Veg.)

## 3. Automation principle

- Future LOSA evidence refresh should be automatic.
- It must not rely on the product owner manually checking sources.
- It should run on a scheduled server-side/headless process.
- Suggested cadence: twice per year.
- The cadence should align with school-year, offer-update, and admission-planning cycles where possible.
- Manual override is not the baseline path.

(The system should check sources on schedule, not depend on manual browsing.)

## 4. Not web-only / client-agnostic requirement

- Refresh contour must be backend/domain-layer owned.
- Web UI must not be the source of truth.
- Future iOS/Android must consume the same backend published truth.
- Route Engine must not fetch/scrape external sources at runtime.
- Clients may display refresh status but cannot decide truth.

(Web and native clients read one shared backend truth.)

## 5. Source tier model

Tier 1 - legal/current policy truth:

- `lovdata.no`
- `regjeringen.no`
- `stortinget.no`
- `udir.no`

Tier 2 - operational school/local delivery truth:

- fylkeskommune pages
- official school pages
- kommune pages

Tier 3 - supporting education-offer representation:

- `utdanning.no`
- Vilbli-derived/public education-offer pages

Rules:

- Tier 2/Tier 3 cannot prove legal status.
- Tier 3 cannot override Tier 1 or Tier 2.
- Local pages can describe delivery practice but not final legal authority.
- Internal docs cannot prove Norwegian current reality.
- If Tier 1 is missing for a legal claim, legal status remains `UNKNOWN`.

(Government/legal sources decide law; school/kommune sources describe practice.)

## 6. Current-truth / recency rules

- Newer official sources override older conflicting sources.
- Older sources remain `historical_context`.
- Undated sources must be marked `date_unknown`.
- Current conclusions cannot rely only on old or undated sources.
- If legal finality after law changes is not confirmed by current Tier 1 sources, legal status remains `UNKNOWN`.
- Do not infer permanent legality or prohibition when Tier 1 evidence is incomplete.

(Newer official reality wins for current truth.)

## 7. Claim labeling

Every future claim must be labeled:

- `CONFIRMED`: directly supported by current official/authoritative source.
- `HISTORICAL_CONTEXT`: supported by older source, used for background.
- `INFERRED`: logical conclusion from sources, not directly stated.
- `UNKNOWN`: not sufficiently proven by current sources.

Rules:

- Legal/current operational claims should be `CONFIRMED` or `UNKNOWN`.
- `INFERRED` must not be presented as fact.
- `CONFIRMED` requires concrete source reference.

(Each claim needs explicit evidence strength.)

## 8. Per-claim citation requirements

Each `CONFIRMED` claim must include:

- source title
- domain
- URL
- source tier
- publication/update date if available
- short source snippet or close paraphrase for legal-critical claims

If concrete reference is missing:

- do not label the claim `CONFIRMED`.

(No source link means not confirmed.)

### Legal / source fidelity

- Legal-critical claims must stay close to official wording.
- Use close paraphrase and, where legally important, a short source snippet.
- Do not freely reinterpret legal meaning.
- Do not convert legal uncertainty into product conclusion.
- Legal-critical claims include:
  - whether LOSA is legally allowed/prohibited;
  - whether it is `forsøksordning`, permanent, or unknown;
  - whether fjernundervisning is allowed;
  - whether provider/delivery arrangement is legally valid;
  - whether publication eligibility is legally safe.

(Legal uncertainty must stay uncertainty.)

## 9. LOSA-specific evidence checklist

Required evidence fields:

Legal/policy status:

- legal source
- legal status
- forsoksordning/permanent/unknown
- law/proposition reference
- effective date if known
- uncertainty

Provider/ansvarlig skole:

- provider school identity
- official source
- NSR/org reference if available
- confidence

Delivery municipality/local context:

- municipality
- local delivery source
- currentness/date
- relation to provider

Delivery site/local room/school/premises:

- site label
- evidence source
- whether formal school/campus or local delivery context
- uncertainty

Local veileder:

- name/role if public and relevant
- municipality relation
- source
- currentness

Praksis i bedrift/laerebedrift relation:

- practice model
- workplace relation
- source
- route relevance or explanatory-only role

Samling location:

- location
- frequency if stated
- mandatory/optional if stated
- source

Programme/stage availability:

- programme
- stage
- source
- ordinary-school availability or LOSA/external-delivery
- confidence

Publication eligibility:

- legal confirmation
- operational confirmation
- evidence completeness
- blocking reason
- owner gate needed

(This checklist defines what evidence is needed before LOSA can be treated safely.)

## 10. Automated refresh snapshot model

Future conceptual snapshot fields:

- `refresh_run_id`
- `source_url`
- `source_domain`
- `source_tier`
- `fetched_at`
- `source_last_updated`
- `source_hash` or content fingerprint
- `extracted_claims`
- `claim_labels`
- `previous_snapshot_reference`
- `diff_status`
- `risk_level`
- `review_required`
- `publication_impact`
- `route_impact`
- `psa_impact`
- `legal_status_impact`

Rules:

- Conceptual only.
- No DB schema is approved.
- No script/job is approved.
- No write path is approved.

(The future process should generate comparable snapshots, but this document does not implement storage.)

## 11. Semiannual refresh cadence

- Default cadence: twice per year.
- Suggested windows:
  - before new school-year planning/admission cycle
  - after official offer/legal updates are typically published
- Emergency refresh can be triggered by official legal-change signals.
- Cadence adjustments require a separate owner gate.

Rules:

- Route Engine must not fetch sources live.
- Refresh process prepares evidence only; it does not auto-publish runtime truth.

(Refresh periodically, not on every route request.)

### Minimum source coverage for current-truth conclusions

- A refresh run cannot produce current-truth conclusions unless minimum official-source coverage is met.
- Legal/current-policy claims require at least one current Tier 1 source.
- Operational school/provider/programme claims require current Tier 2 source evidence.
- Local delivery claims require current local delivery source evidence where relevant.
- Tier 3 may support education-offer representation but cannot close legal or operational truth alone.
- If coverage is not met, the refresh result must be blocked/review-needed and affected claims remain `UNKNOWN`.
- Missing coverage produces evidence gaps only, not publication/runtime truth.

(The future job cannot conclude truth from one weak or incomplete source set.)

## 12. Diff detection and risk classification

Future diff types:

- `no_change`
- `wording_change_low_risk`
- `operational_change`
- `programme_availability_change`
- `provider_change`
- `delivery_site_change`
- `legal_status_change`
- `source_missing_or_unreachable`
- `conflicting_sources`
- `stale_source`

Future risk levels:

- `low`
- `medium`
- `high`
- `blocked`

Rules:

- `legal_status_change` is high/blocked until Tier 1 confirmation.
- provider/delivery-site changes require review.
- source-missing state must not silently preserve stale truth without stale warning.
- conflicting sources require blocked/review state.

### Refresh outcome states

Refresh outcome states are run-level results. They do not replace diff types or risk levels.

- `refresh_valid_no_change` — source coverage is sufficient and no meaningful change was detected.
- `refresh_valid_low_risk_change` — source coverage is sufficient and only low-risk wording/metadata change was detected.
- `refresh_review_required` — meaningful operational or semantic change requires review before any truth update.
- `refresh_blocked_legal_unknown` — legal/current-policy status cannot be confirmed by current Tier 1 evidence.
- `refresh_blocked_source_coverage_missing` — minimum official-source coverage is not met.
- `refresh_blocked_conflicting_sources` — sources conflict and cannot safely produce current-truth conclusion.

- Refresh outcome state is not runtime state.
- Refresh outcome state cannot trigger PSA publication.
- Refresh outcome state cannot update Route Engine truth.
- Refresh outcome state cannot finalize decision rows.

(The future refresh needs clear outcomes, but outcomes do not change the product automatically.)

(Detect change type first, then classify safety.)

## 13. Automatic vs review behavior

Automatically allowed in future:

- source fetch
- source fingerprint generation
- diff detection
- claim extraction candidates
- confidence labeling candidates
- stale-source warning
- draft evidence snapshot creation
- internal review-needed flag/alert

Not automatically allowed:

- PSA publication change
- Route Engine published-truth change
- decision-row finalization
- treating LOSA as ordinary school availability
- legal finalization without Tier 1 confirmation
- overriding blocked state

(Automation can collect and flag evidence, but risky truth decisions remain gated.)

## 14. Published truth boundary

- Runtime reads only approved/published internal truth.
- Raw source snapshots are not runtime truth.
- Draft evidence snapshots are not route truth.
- Unresolved/blocked LOSA evidence cannot feed Route Engine.
- Future native/mobile clients must read the same published backend truth.

(Runtime consumes approved internal truth, not raw internet inputs.)

## 15. Failure handling

Failure conditions and safe handling:

- source unavailable -> keep blocked/review-needed state and mark source gap.
- source format changed -> mark extraction uncertain, keep blocked/review-needed state.
- legal source ambiguous -> legal status remains `UNKNOWN`.
- school page outdated/undated -> `date_unknown`/stale warning; no legal conclusions.
- municipality page stale -> local delivery confidence downgraded; no publication activation.
- conflicting Tier 1/Tier 2 facts -> Tier 1 controls legal status; keep operational conflict flagged.
- content hash changed but meaning unclear -> review-required and no auto-conclusion.
- Published truth may remain active during source failure only under a separately approved stale-tolerance policy; otherwise source failure must create warning/review-needed state.

(If a source disappears, old truth cannot silently pretend to be fresh.)

For all failure paths:

- safe default is no publication activation and no runtime truth expansion.

(If uncertain, block and review instead of guessing.)

## 16. Relationship to Phase 2

- Phase 2 can record `unsupported_losa`, `external_delivery`, and blocked evidence states.
- Phase 2 cannot solve LOSA publication semantics.
- Phase 2 planning docs remain evidence/governance support artifacts.
- Phase 4 owns external-delivery semantics.
- Route Engine remains outside until separately approved published truth exists.

(Phase 2 marks blocked evidence; Phase 4 defines safe semantics.)

## 17. Future implementation gates

Separate gates (all not approved by this document):

- approve this docs-only refresh design
- approve source list and legal evidence checklist
- approve read-only source fetch prototype
- approve snapshot storage model
- approve diff classifier
- approve review workflow
- approve publication decision model
- approve PSA integration
- approve Route Engine consumption of published truth
- approve mobile/web read-model exposure

Rules:

- each gate requires separate owner approval
- each gate remains server-side/client-agnostic
- no gate is implied by this document

(Each step is independently gated.)

## 18. Forbidden shortcuts

- no runtime scraping
- no web-only truth ownership
- no localStorage/browser truth ownership
- no manual hidden truth
- no ordinary-school publish for LOSA without Phase 4 model
- no Tier 2/3 legal substitution
- no stale source treated as current truth
- no automatic legal-finality inference
- no Route Engine use of raw source snapshots
- no PSA publication from draft evidence
- no mobile/web truth divergence
- no owner-manual checking as baseline operation

## 19. Out of scope

- script implementation
- cron/job implementation
- DB schema
- source parser implementation
- Supabase operations
- PSA publication
- Route Engine changes
- UI/admin workflow implementation
- native app implementation
- current data writes
- legal final conclusion

## 20. Normative references

- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- `docs/architecture/phase-2-read-only-evidence-packet-format.md`
- `docs/architecture/phase-2-read-only-evidence-report-design.md`
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- `docs/architecture/norway-school-identity-matching-spec.md`
- `docs/architecture/norway-school-identity-matching-execution-plan.md`
- `docs/architecture/route-engine-master-spec.md`
- `docs/product-principles.md`
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`

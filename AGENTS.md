<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:vgs-contour-b-ops -->
## Vilbli / Contour B (required when changing professions or counties)

Adding or changing **professions**, **counties (fylke)**, or Vilbli-backed **programme options** in the product does **not** auto-run ingest. Before claiming data is live, follow the **Mandatory rules when updating application information** in `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (expansion gate + relay dry-run + production relay + route E2E).

### No manual PSA (hard process)

**Do not** hand-edit `programme_school_availability` (or equivalent Contour B school truth) via SQL/UI/one-off scripts — including “temporary” `is_active` plugs. Agent **does not decide**: cite this rule + `VGS_OPERATIONAL_RUNNERS.md`, warn about risks (false truth, relay drift, P-6), propose pipeline fix, and **wait** for explicit owner override. See `.cursor/rules/no-manual-psa.mdc`.

### Flag Vilbli tilbud «ложь» (hard process)

**CRITICAL on every 1:1:** always check structure vs map tilbud (I-1…I-3); always highlight Vilbli «ложь» (or say «none») — even when Min Veg omitted correctly. See `.cursor/rules/flag-vilbli-display-untruth.mdc`.
<!-- END:vgs-contour-b-ops -->

<!-- BEGIN:pre-commit-qa-build -->
## Pre-commit QA build (mandatory)

Before **any** `git commit`, run and pass:

```bash
npx tsc --noEmit && npm run build
```

If the build fails, fix it before committing. Do not skip for "small" changes.
<!-- END:pre-commit-qa-build -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:vgs-contour-b-ops -->
## Vilbli / Contour B (required when changing professions or counties)

Adding or changing **professions**, **counties (fylke)**, or Vilbli-backed **programme options** in the product does **not** auto-run ingest. Before claiming data is live, follow the **Mandatory rules when updating application information** in `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (expansion gate + relay dry-run + production relay + route E2E).
<!-- END:vgs-contour-b-ops -->

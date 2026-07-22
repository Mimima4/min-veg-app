-- Vilbli home-page VG2 continuation allowlist (Contour B overlay).
-- Charter: docs/architecture/phase-4-vilbli-home-vg2-continuation-overlay-owner-record.md
-- Written only by Contour B relay when local VG2 is missing; read by P-7 merge.

create table if not exists public.vgs_vilbli_home_vg2_continuations (
  profession_slug text not null,
  home_county_code text not null,
  institution_id uuid not null references public.education_institutions (id),
  vilbli_school_code text,
  destination_county_code text,
  updated_at timestamptz not null default now(),
  primary key (profession_slug, home_county_code, institution_id)
);

create index if not exists vgs_vilbli_home_vg2_continuations_home_idx
  on public.vgs_vilbli_home_vg2_continuations (profession_slug, home_county_code);

comment on table public.vgs_vilbli_home_vg2_continuations is
  'NSR-matched schools listed as out-of-county VG2 on Vilbli home side=p5 when local VG2 is missing. Overlay membership only — not home PSA.';

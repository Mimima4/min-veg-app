-- Study route snapshots DB hygiene cleanup:
-- - Removes duplicate rows per (route_variant_id, snapshot_version)
-- - Preserves one canonical row with priority:
--   1) is_current_snapshot = true
--   2) latest generated_at
--   3) max(id) as deterministic tie-break
-- - Includes post-cleanup invariant checks and unique guard apply SQL

begin;

-- Optional pre-check: duplicate groups before cleanup.
select
  route_variant_id,
  snapshot_version,
  count(*) as duplicate_count
from public.study_route_snapshots
group by route_variant_id, snapshot_version
having count(*) > 1
order by duplicate_count desc, route_variant_id, snapshot_version;

with ranked as (
  select
    s.id,
    row_number() over (
      partition by s.route_variant_id, s.snapshot_version
      order by
        s.is_current_snapshot desc,
        s.generated_at desc nulls last,
        s.id desc
    ) as keep_rank,
    count(*) over (
      partition by s.route_variant_id, s.snapshot_version
    ) as group_size
  from public.study_route_snapshots s
),
to_delete as (
  select id
  from ranked
  where group_size > 1
    and keep_rank > 1
)
delete from public.study_route_snapshots s
using to_delete d
where s.id = d.id;

commit;

-- ============================================================
-- Post-cleanup invariant checks
-- ============================================================

-- A) Must return zero rows:
-- duplicate (route_variant_id, snapshot_version) groups.
select
  route_variant_id,
  snapshot_version,
  count(*) as duplicate_count
from public.study_route_snapshots
group by route_variant_id, snapshot_version
having count(*) > 1
order by duplicate_count desc, route_variant_id, snapshot_version;

-- B) Must return zero rows:
-- variants with >1 current snapshot.
select
  route_variant_id,
  count(*) as current_snapshot_count
from public.study_route_snapshots
where is_current_snapshot = true
group by route_variant_id
having count(*) > 1
order by current_snapshot_count desc, route_variant_id;

-- C) Must return zero rows:
-- variants with zero current snapshots.
select
  v.id as route_variant_id
from public.study_route_variants v
left join public.study_route_snapshots s
  on s.route_variant_id = v.id
 and s.is_current_snapshot = true
group by v.id
having count(s.id) = 0
order by v.id;

-- D) Must return zero rows:
-- routes pointing to a missing current_variant_id.
select
  r.id as route_id,
  r.current_variant_id
from public.study_routes r
left join public.study_route_variants v
  on v.id = r.current_variant_id
where r.current_variant_id is not null
  and v.id is null
order by r.id;

-- ============================================================
-- Unique guard (apply if not already present)
-- ============================================================
create unique index if not exists study_route_snapshots_variant_version_uidx
  on public.study_route_snapshots (route_variant_id, snapshot_version);

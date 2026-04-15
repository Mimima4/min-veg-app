create unique index if not exists study_route_snapshots_variant_version_uidx
  on public.study_route_snapshots (route_variant_id, snapshot_version);

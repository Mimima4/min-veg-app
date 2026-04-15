-- Route snapshots: deterministic route input signature for freshness truth.
alter table if exists study_route_snapshots
add column if not exists route_input_signature text;

create index if not exists idx_route_snapshots_input_signature
on study_route_snapshots(route_input_signature);

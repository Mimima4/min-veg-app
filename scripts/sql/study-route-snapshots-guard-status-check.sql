-- Guard status check for study_route_snapshots uniqueness.
-- Shows whether the unique guard exists in the current database,
-- how it is named, and what definition is applied.

select
  n.nspname as schema_name,
  c.relname as table_name,
  i.relname as index_name,
  ix.indisunique as is_unique,
  pg_get_indexdef(i.oid) as index_definition
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
join pg_index ix
  on ix.indrelid = c.oid
join pg_class i
  on i.oid = ix.indexrelid
join pg_attribute a1
  on a1.attrelid = c.oid
 and a1.attnum = ix.indkey[0]
join pg_attribute a2
  on a2.attrelid = c.oid
 and a2.attnum = ix.indkey[1]
where n.nspname = 'public'
  and c.relname = 'study_route_snapshots'
  and ix.indisunique = true
  and ix.indnkeyatts = 2
  and a1.attname = 'route_variant_id'
  and a2.attname = 'snapshot_version'
order by index_name;

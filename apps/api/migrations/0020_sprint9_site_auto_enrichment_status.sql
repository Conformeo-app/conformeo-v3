alter table organization_sites
  add column if not exists location_enrichment_status varchar(16),
  add column if not exists location_enrichment_attempted_at timestamptz;

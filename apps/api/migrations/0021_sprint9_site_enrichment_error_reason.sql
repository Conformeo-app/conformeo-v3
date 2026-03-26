alter table organization_sites
  add column if not exists location_enrichment_last_error_reason varchar(32);

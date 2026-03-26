alter table organizations
  add column if not exists registry_siren varchar(9),
  add column if not exists registry_headquarters_siret varchar(14),
  add column if not exists registry_company_name varchar(160),
  add column if not exists registry_activity_code varchar(16),
  add column if not exists registry_status varchar(32),
  add column if not exists registry_address text,
  add column if not exists registry_source_meta jsonb,
  add column if not exists registry_last_synced_at timestamptz;

alter table organization_sites
  add column if not exists normalized_address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists geocoding_score double precision,
  add column if not exists location_source_meta jsonb,
  add column if not exists location_last_synced_at timestamptz,
  add column if not exists site_risk_level varchar(16),
  add column if not exists site_risk_summary text,
  add column if not exists site_risk_items jsonb,
  add column if not exists site_risk_source_meta jsonb,
  add column if not exists site_risk_last_synced_at timestamptz;

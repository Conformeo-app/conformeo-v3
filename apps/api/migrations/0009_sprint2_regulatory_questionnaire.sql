alter table if exists organizations
  add column if not exists receives_public boolean;

alter table if exists organizations
  add column if not exists stores_hazardous_products boolean;

alter table if exists organizations
  add column if not exists performs_high_risk_work boolean;

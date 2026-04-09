do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'worksite_intervention_result'
  ) then
    create type worksite_intervention_result as enum (
      'completed',
      'partial',
      'blocked',
      'postponed'
    );
  end if;
end
$$;

alter table if exists worksite_interventions
  add column if not exists result worksite_intervention_result;

alter table if exists worksite_interventions
  add column if not exists report_comment text;

alter table if exists worksite_interventions
  add column if not exists follow_up_note text;

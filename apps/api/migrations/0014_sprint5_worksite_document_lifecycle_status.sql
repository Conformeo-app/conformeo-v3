alter table documents
add column if not exists lifecycle_status varchar(32);

update documents
set lifecycle_status = 'draft'
where source = 'worksite_generated'
  and attached_to_entity_type = 'worksite'
  and lifecycle_status is null;

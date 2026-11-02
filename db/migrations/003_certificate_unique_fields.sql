ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS unique_id text,
  ADD COLUMN IF NOT EXISTS punched_code text;

UPDATE certificates
SET unique_id = COALESCE(unique_id, machine_id),
    punched_code = COALESCE(punched_code, CASE WHEN machine_id ~ 'Y01-([0-9]+)-SS1/1$' THEN regexp_replace(machine_id, '^.*Y01-([0-9]+)-SS1/1$', '\1') END);

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('field_engineer','project_lead','pcap_admin','system_admin');
CREATE TYPE review_status AS ENUM ('submitted','under_review','approved','flagged');
CREATE TYPE qic_decision AS ENUM ('pass','defer');

CREATE TABLE districts (
  id        serial PRIMARY KEY,
  name      text UNIQUE NOT NULL,
  division  text NOT NULL,
  convener  text NOT NULL,
  geom      geometry(MultiPolygon,4326)
);
CREATE INDEX districts_geom_idx ON districts USING gist (geom);

CREATE TABLE tehsils (
  id          serial PRIMARY KEY,
  district_id int NOT NULL REFERENCES districts(id),
  name        text NOT NULL,
  geom        geometry(MultiPolygon,4326),
  UNIQUE (district_id, name)
);

CREATE TABLE manufacturers (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  district_id int NOT NULL REFERENCES districts(id),
  UNIQUE (name, district_id)
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username      text UNIQUE NOT NULL,
  full_name     text NOT NULL,
  password_hash text NOT NULL,
  role          user_role NOT NULL,
  activities    text[] NOT NULL DEFAULT '{}',
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE assignments (
  id             serial PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district_id    int NOT NULL REFERENCES districts(id),
  machine_type   text NOT NULL DEFAULT 'Super Seeder',
  total_machines int NOT NULL DEFAULT 0,
  UNIQUE (user_id, district_id)
);

-- Rows of the downloaded QIC certificate, cross-checked by the engineer (step 5)
CREATE TABLE certificates (
  id              serial PRIMARY KEY,
  district_id     int NOT NULL REFERENCES districts(id),
  allottee_name   text NOT NULL,
  cnic            text NOT NULL,
  mailing_address text,
  tehsil          text,
  machine_id      text UNIQUE NOT NULL,
  unique_id       text,
  punched_code    text,
  imei            text NOT NULL
);

CREATE TABLE qic_inspections (
  id                 uuid PRIMARY KEY,               -- generated on the phone => idempotent sync
  engineer_id        uuid NOT NULL REFERENCES users(id),
  district_id        int  NOT NULL REFERENCES districts(id),
  manufacturer_id    int  NOT NULL REFERENCES manufacturers(id),
  lot_size           int,
  firm_location      geometry(Point,4326),
  intimation         jsonb NOT NULL DEFAULT '{}',
  eligibility        jsonb NOT NULL DEFAULT '{}',
  certificate_id     int REFERENCES certificates(id),
  cert_check         jsonb NOT NULL DEFAULT '{}',
  decision           qic_decision NOT NULL,
  qic_certificate_no text,
  signoff            jsonb NOT NULL DEFAULT '{}',
  status             review_status NOT NULL DEFAULT 'submitted',
  review_remarks     text,
  reviewed_by        uuid REFERENCES users(id),
  reviewed_at        timestamptz,
  client_created_at  timestamptz,
  submitted_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX qic_status_idx   ON qic_inspections (status);
CREATE INDEX qic_district_idx ON qic_inspections (district_id);
CREATE INDEX qic_loc_idx      ON qic_inspections USING gist (firm_location);

-- geo-tagged photos (kind='photo', slot 1..8) and worksheet pages (kind='worksheet')
CREATE TABLE attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES qic_inspections(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('photo','worksheet')),
  slot          int  NOT NULL,
  file_path     text NOT NULL,
  mime          text,
  location      geometry(Point,4326),
  captured_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inspection_id, kind, slot)
);

-- Placeholders for later phases (structure only; flows are built next)
CREATE TABLE dic_inspections (
  id                 uuid PRIMARY KEY,
  engineer_id        uuid NOT NULL REFERENCES users(id),
  qic_inspection_id  uuid REFERENCES qic_inspections(id),
  farmer_location    geometry(Point,4326),
  payload            jsonb NOT NULL DEFAULT '{}',
  status             review_status NOT NULL DEFAULT 'submitted',
  submitted_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dic_loc_idx ON dic_inspections USING gist (farmer_location);

CREATE TABLE dic_attachments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id    uuid NOT NULL REFERENCES dic_inspections(id) ON DELETE CASCADE,
  kind             text NOT NULL CHECK (kind IN ('photo','worksheet')),
  slot             int NOT NULL,
  file_path        text NOT NULL,
  mime             text,
  location         geometry(Point,4326),
  captured_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inspection_id, kind, slot)
);

CREATE TABLE survey_responses (
  id           uuid PRIMARY KEY,
  engineer_id  uuid NOT NULL REFERENCES users(id),
  round        text NOT NULL CHECK (round IN ('baseline','midline','endline')),
  payload      jsonb NOT NULL DEFAULT '{}',
  location     geometry(Point,4326),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tpv_records (
  id           uuid PRIMARY KEY,
  engineer_id  uuid NOT NULL REFERENCES users(id),
  payload      jsonb NOT NULL DEFAULT '{}',
  location     geometry(Point,4326),
  status       review_status NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id        bigserial PRIMARY KEY,
  user_id   uuid,
  action    text NOT NULL,
  entity    text,
  entity_id text,
  details   jsonb,
  at        timestamptz NOT NULL DEFAULT now()
);

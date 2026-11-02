CREATE TABLE IF NOT EXISTS dic_attachments (
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

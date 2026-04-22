-- Runs once on first container start
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Example: your uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id   TEXT NOT NULL UNIQUE,
    original_key TEXT NOT NULL,
    webp_key    TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
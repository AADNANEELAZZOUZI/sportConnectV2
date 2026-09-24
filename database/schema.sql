DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS associations CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

DROP TYPE IF EXISTS registration_status CASCADE;
CREATE TYPE registration_status AS ENUM ('confirmed', 'cancelled', 'medical_non_compliant');

DROP TYPE IF EXISTS waiting_status CASCADE;
CREATE TYPE waiting_status AS ENUM ('waiting', 'promoted_pending', 'expired', 'converted');

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    erp_capacity INT NOT NULL CHECK (erp_capacity > 0)
);

CREATE TABLE associations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(150),
    phone VARCHAR(20)
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    facility_id INT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    association_id INT NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Boxe', 'Natation'
    requires_strict_certificate BOOLEAN NOT NULL DEFAULT FALSE,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    sub_zone VARCHAR(10) NOT NULL DEFAULT 'FULL' CHECK (sub_zone IN ('FULL', 'A', 'B')),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday, 7 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time)
);

CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    quotient_familial NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_resident BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Members (Adhérents)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    has_pass_sport BOOLEAN NOT NULL DEFAULT FALSE,
    medical_certificate_date DATE
);

-- 6. Registrations (Inscriptions)
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'confirmed',
    final_price NUMERIC(10,2) NOT NULL CHECK (final_price >= 0),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (member_id, activity_id) -- Duplicate prevention rule
);

-- 7. Waiting List (File d'attente)
CREATE TABLE waiting_list (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    priority_score INT NOT NULL DEFAULT 0,
    status waiting_status NOT NULL DEFAULT 'waiting',
    deadline_confirmation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes (as required in Sprint Plan)
CREATE INDEX idx_registrations_activity_status ON registrations(activity_id, status);
CREATE INDEX idx_activities_facility_day ON activities(facility_id, day_of_week);
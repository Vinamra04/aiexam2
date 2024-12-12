
-- Consolidated User Table
CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin' or 'teacher'
    subject VARCHAR(255), -- Only applicable if role is 'teacher'
    college VARCHAR(255), -- Only applicable if role is 'teacher'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP,
    status BOOLEAN DEFAULT TRUE NOT NULL
);
CREATE INDEX idx_user_role ON "user" (role);

-- Updated Flag Table
CREATE TABLE flag (
    flag_id SERIAL PRIMARY KEY,
    flag_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by_id INT NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT flag_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES "user"(user_id)
);

-- Updated Persona Table
CREATE TABLE persona (
    persona_id SERIAL PRIMARY KEY,
    created_by_id INT NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    CONSTRAINT persona_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES "user"(user_id)
);

-- Updated Persona Flag Table
CREATE TABLE persona_flag (
    persona_id INT NOT NULL,
    flag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT persona_flag_pkey PRIMARY KEY (persona_id, flag_id),
    CONSTRAINT persona_flag_flag_id_fkey FOREIGN KEY (flag_id) REFERENCES flag(flag_id),
    CONSTRAINT persona_flag_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES persona(persona_id)
);

-- Updated Exam Table
CREATE TABLE exam (
    exam_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    start_at TIMESTAMP NOT NULL,
    created_by_id INT NOT NULL,
    persona_id INT NOT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    batch VARCHAR(255) NOT NULL,
    duration INT DEFAULT 0 NOT NULL,
    CONSTRAINT exam_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES "user"(user_id),
    CONSTRAINT exam_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES persona(persona_id)
);

-- Updated Persona Access Table
CREATE TABLE persona_access (
    persona_id INT NOT NULL,
    user_id INT NOT NULL, -- Changed from teacher_id to user_id
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT persona_access_pkey PRIMARY KEY (persona_id, user_id),
    CONSTRAINT persona_access_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES persona(persona_id),
    CONSTRAINT persona_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

-- Updated Student Group Table
CREATE TABLE student_group (
    student_group_id SERIAL PRIMARY KEY,
    student_group_name VARCHAR(255) NOT NULL,
    created_by_id INT NOT NULL,
    CONSTRAINT student_group_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES "user"(user_id)
);

-- Updated Exam Participant Table
CREATE TABLE exam_participant (
    exam_participant_id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    participant_email VARCHAR(255) NULL,
    student_group_id INT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT exam_participant_exam_id_participant_email_student_group_id_key UNIQUE (exam_id, participant_email, student_group_id),
    CONSTRAINT exam_participant_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
    CONSTRAINT exam_participant_student_group_id_fkey FOREIGN KEY (student_group_id) REFERENCES student_group(student_group_id)
);
CREATE INDEX idx_exam_participant_exam_id ON exam_participant (exam_id);
CREATE INDEX idx_exam_participant_group_id ON exam_participant (student_group_id);

-- Updated Group Membership Table
CREATE TABLE group_membership (
    student_group_id INT NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    CONSTRAINT group_membership_pkey PRIMARY KEY (student_group_id, student_email),
    CONSTRAINT group_membership_student_group_id_fkey FOREIGN KEY (student_group_id) REFERENCES student_group(student_group_id)
);
CREATE INDEX idx_group_membership_group_id ON group_membership (student_group_id);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE exam_chat (
    chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id INT NOT NULL,
    participant_email VARCHAR(255) NOT NULL, -- Participant email is never null
    chat_log JSONB  NULL, -- Store the entire chat as JSONB
    student_group_id INT NULL,
    status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT exam_chat_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES exam(exam_id)
);

CREATE TABLE open_ai_assistant (
    id SERIAL PRIMARY KEY,
    assistant_id varchar(255) NOT NULL,
    persona_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT personid_fkey FOREIGN KEY (persona_id) REFERENCES "persona"(persona_id)
);
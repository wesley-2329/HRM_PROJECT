-- SQL Migration Script for HRorbit HRMS Database (Normalized Schema)
-- Database Dialect: PostgreSQL / standard SQL (compatible with MySQL/SQLite)

-- Enable UUID extension if using PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. COMPANIES
-- ==========================================
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo TEXT,
    business_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL
);

-- ==========================================
-- 2. LEGAL ENTITIES
-- ==========================================
CREATE TABLE IF NOT EXISTS legal_entities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    gst_number VARCHAR(15) UNIQUE NOT NULL,
    pan_number VARCHAR(10) UNIQUE NOT NULL,
    cin_number VARCHAR(21) UNIQUE NOT NULL,
    tan_number VARCHAR(10),
    business_reg_number VARCHAR(100),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    registered_address TEXT,
    corporate_address TEXT,
    email VARCHAR(150),
    phone VARCHAR(50),
    website VARCHAR(150),
    registration_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL
);

-- ==========================================
-- 3. BUSINESS UNITS
-- ==========================================
CREATE TABLE IF NOT EXISTS business_units (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_company_id VARCHAR(36),
    description TEXT,
    head_of_unit VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    cost_center VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_bu_parent_company FOREIGN KEY (parent_company_id) REFERENCES legal_entities(id) ON DELETE RESTRICT
);

-- ==========================================
-- 4. BRANCHES & LOCATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    region VARCHAR(100),
    business_unit_id VARCHAR(36),
    branch_head VARCHAR(100),
    building VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_branch_bu FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT
);

-- ==========================================
-- 5. DEPARTMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_dept_id VARCHAR(36) NULL,
    manager_id VARCHAR(100),
    business_unit_id VARCHAR(36),
    branch_id VARCHAR(36),
    cost_center VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_dept_parent FOREIGN KEY (parent_dept_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_dept_bu FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT,
    CONSTRAINT fk_dept_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
);

-- ==========================================
-- 6. TEAMS
-- ==========================================
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    team_lead VARCHAR(100),
    description TEXT,
    max_members INT DEFAULT 10,
    current_members INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_team_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- ==========================================
-- 7. DESIGNATIONS & GRADES
-- ==========================================
CREATE TABLE IF NOT EXISTS designations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    grade VARCHAR(50),
    salary_band VARCHAR(100),
    role_description TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL
);

-- ==========================================
-- 8. POSITION CONTROL
-- ==========================================
CREATE TABLE IF NOT EXISTS positions (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) NOT NULL,
    designation_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    approved_headcount INT DEFAULT 1,
    filled_positions INT DEFAULT 0,
    vacant_positions INT DEFAULT 1,
    employment_type VARCHAR(50) DEFAULT 'Full-Time',
    grade VARCHAR(50),
    cost_center VARCHAR(50),
    budget DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Vacant',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_pos_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pos_desg FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE RESTRICT,
    CONSTRAINT check_filled_headcount CHECK (filled_positions <= approved_headcount)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_legal_entities_code ON legal_entities(code);
CREATE INDEX idx_legal_entities_gst ON legal_entities(gst_number);
CREATE INDEX idx_business_units_code ON business_units(code);
CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_teams_code ON teams(code);
CREATE INDEX idx_designations_code ON designations(code);
CREATE INDEX idx_positions_status ON positions(status);

-- ==========================================
-- MODULE 7: EMPLOYEE EXPERIENCE & ENGAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS suggestion_master (
    id VARCHAR(36) PRIMARY KEY,
    suggestion_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    business_impact TEXT,
    estimated_benefit VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Submitted',
    priority VARCHAR(20) DEFAULT 'Medium',
    submitted_by_id VARCHAR(36) NOT NULL,
    submitted_by_name VARCHAR(150) NOT NULL,
    reward_badge VARCHAR(100),
    reward_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievance_master (
    id VARCHAR(36) PRIMARY KEY,
    grievance_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Medium',
    is_confidential BOOLEAN DEFAULT FALSE,
    raised_by_id VARCHAR(36) NOT NULL,
    raised_by_name VARCHAR(150) NOT NULL,
    assigned_officer_id VARCHAR(36),
    assigned_officer_name VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Submitted',
    investigation_notes TEXT,
    resolution TEXT,
    closure_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS helpdesk_ticket (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) DEFAULT 'General',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium',
    raised_by_id VARCHAR(36) NOT NULL,
    raised_by_name VARCHAR(150) NOT NULL,
    assigned_to_id VARCHAR(36),
    assigned_to_name VARCHAR(150),
    sla_hours INT DEFAULT 24,
    due_date TIMESTAMP NULL,
    resolution_notes TEXT,
    rating INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS welfare_request (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    welfare_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0.00,
    requested_by_id VARCHAR(36) NOT NULL,
    requested_by_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted',
    approval_remarks TEXT,
    verifier VARCHAR(150),
    approver VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recognition_post (
    id VARCHAR(36) PRIMARY KEY,
    recognition_id VARCHAR(50) UNIQUE NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recognized_by_id VARCHAR(36) NOT NULL,
    recognized_by_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    badge VARCHAR(100) DEFAULT '⭐ Star Performer',
    appreciation_message TEXT NOT NULL,
    visibility VARCHAR(50) DEFAULT 'Company-wide',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communication_master (
    id VARCHAR(36) PRIMARY KEY,
    communication_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(100) DEFAULT 'All Employees',
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    acknowledgement_required BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Published',
    author_id VARCHAR(36),
    author_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suggestion_status ON suggestion_master(status);
CREATE INDEX idx_grievance_status ON grievance_master(status);
CREATE INDEX idx_helpdesk_status ON helpdesk_ticket(status);
CREATE INDEX idx_welfare_status ON welfare_request(status);
CREATE INDEX idx_communication_category ON communication_master(category);

-- ==========================================
-- MODULE 8: TRAINING & COMPETENCY EVALUATION
-- ==========================================

CREATE TABLE IF NOT EXISTS training_needs_analysis (
    id VARCHAR(36) PRIMARY KEY,
    tna_id VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    skill_gap_category VARCHAR(100) NOT NULL,
    requested_skill VARCHAR(255) NOT NULL,
    current_proficiency INT DEFAULT 2,
    target_proficiency INT DEFAULT 4,
    priority VARCHAR(20) DEFAULT 'Medium',
    target_quarter VARCHAR(20) DEFAULT 'Q3-2026',
    justification TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Requested',
    manager_comments TEXT,
    hr_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS annual_training_plan (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    year INT NOT NULL DEFAULT 2026,
    title VARCHAR(255) NOT NULL,
    allocated_budget DECIMAL(12,2) DEFAULT 500000.00,
    utilized_budget DECIMAL(12,2) DEFAULT 0.00,
    planned_courses_count INT DEFAULT 5,
    status VARCHAR(50) DEFAULT 'Approved',
    approved_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_program (
    id VARCHAR(36) PRIMARY KEY,
    program_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    mode VARCHAR(50) DEFAULT 'Classroom',
    duration_hours INT DEFAULT 8,
    trainer_name VARCHAR(150) NOT NULL,
    venue_name VARCHAR(150) DEFAULT 'Conference Room Alpha',
    capacity INT DEFAULT 25,
    schedule_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_matrix (
    id VARCHAR(36) PRIMARY KEY,
    skill_id VARCHAR(50) UNIQUE NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    required_level INT DEFAULT 4,
    current_level INT DEFAULT 2,
    gap_score INT DEFAULT 2,
    last_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competency_matrix (
    id VARCHAR(36) PRIMARY KEY,
    competency_id VARCHAR(50) UNIQUE NOT NULL,
    competency_name VARCHAR(255) NOT NULL,
    framework_type VARCHAR(100) DEFAULT 'Functional Excellence',
    target_role VARCHAR(150) NOT NULL,
    target_grade VARCHAR(20) DEFAULT 'L4',
    benchmark_score DECIMAL(3,2) DEFAULT 4.00,
    assessment_method VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_certification (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    program_id VARCHAR(50),
    total_questions INT DEFAULT 10,
    passing_marks INT DEFAULT 70,
    certificate_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_history (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score_obtained INT DEFAULT 85,
    status VARCHAR(50) DEFAULT 'Completed',
    certificate_url TEXT
);

CREATE INDEX idx_tna_status ON training_needs_analysis(status);
CREATE INDEX idx_program_status ON training_program(status);
CREATE INDEX idx_skill_gap ON skill_matrix(gap_score);



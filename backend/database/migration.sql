-- SQL Migration Script for TalentSphere HRMS Database (Normalized Schema)
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

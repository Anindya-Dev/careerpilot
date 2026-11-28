// Neo4j Knowledge Graph Schema Constraints and Indexes
// CareerPilot — Multi-Agent AI Career Intelligence Platform
// Owner: Anindya Bhattacharya (Phase 1 Deliverable 2)

// =========================================================================
// 1. UNIQUE CONSTRAINTS (Enforces Entity Integrity across graph nodes)
// =========================================================================

// Ensure every student has a globally unique identifier
CREATE CONSTRAINT student_id_unique IF NOT EXISTS
FOR (s:Student)
REQUIRE s.student_id IS UNIQUE;

// Ensure every technical or soft skill has a unique identifier
CREATE CONSTRAINT skill_id_unique IF NOT EXISTS
FOR (sk:Skill)
REQUIRE sk.skill_id IS UNIQUE;

// Ensure every career goal is uniquely identified
CREATE CONSTRAINT goal_id_unique IF NOT EXISTS
FOR (g:Goal)
REQUIRE g.goal_id IS UNIQUE;

// Ensure every industry role (e.g. 'Data Scientist') is uniquely identified
CREATE CONSTRAINT role_id_unique IF NOT EXISTS
FOR (r:Role)
REQUIRE r.role_id IS UNIQUE;


// =========================================================================
// 2. LOOKUP INDEXES (Ultra-fast traversal and agent search)
// =========================================================================

// High-speed lookup by student email address for auth and profile retrieval
CREATE INDEX student_email_idx IF NOT EXISTS
FOR (s:Student)
ON (s.email);

// High-speed case-sensitive lookup by skill name for Skill Intelligence & Evidence Agents
CREATE INDEX skill_name_idx IF NOT EXISTS
FOR (sk:Skill)
ON (sk.skill_name);

// Fast lookup by role title for Career Vision roadmap generation
CREATE INDEX role_title_idx IF NOT EXISTS
FOR (r:Role)
ON (r.title);

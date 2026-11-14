// Neo4j Seed Data: 5 Complete Student Knowledge Graph Profiles
// CareerPilot — Multi-Agent AI Career Intelligence Platform
// Owner: Anindya Bhattacharya (Phase 1 Deliverable 2)

// =========================================================================
// 1. SEED SKILLS ONTOLOGY
// =========================================================================

MERGE (sk_py:Skill { skill_id: 'skill-python-001' })
ON CREATE SET sk_py.skill_name = 'Python', sk_py.category = 'Technical', sk_py.popularity_score = 98;

MERGE (sk_torch:Skill { skill_id: 'skill-pytorch-001' })
ON CREATE SET sk_torch.skill_name = 'PyTorch', sk_torch.category = 'Technical', sk_torch.popularity_score = 92;

MERGE (sk_fastapi:Skill { skill_id: 'skill-fastapi-001' })
ON CREATE SET sk_fastapi.skill_name = 'FastAPI', sk_fastapi.category = 'Technical', sk_fastapi.popularity_score = 88;

MERGE (sk_docker:Skill { skill_id: 'skill-docker-001' })
ON CREATE SET sk_docker.skill_name = 'Docker', sk_docker.category = 'Infrastructure', sk_docker.popularity_score = 90;

MERGE (sk_k8s:Skill { skill_id: 'skill-k8s-001' })
ON CREATE SET sk_k8s.skill_name = 'Kubernetes', sk_k8s.category = 'Infrastructure', sk_k8s.popularity_score = 86;

MERGE (sk_ts:Skill { skill_id: 'skill-typescript-001' })
ON CREATE SET sk_ts.skill_name = 'TypeScript', sk_ts.category = 'Technical', sk_ts.popularity_score = 94;

MERGE (sk_react:Skill { skill_id: 'skill-react-001' })
ON CREATE SET sk_react.skill_name = 'React', sk_react.category = 'Technical', sk_react.popularity_score = 95;

MERGE (sk_node:Skill { skill_id: 'skill-node-001' })
ON CREATE SET sk_node.skill_name = 'Node.js', sk_node.category = 'Technical', sk_node.popularity_score = 91;

MERGE (sk_linux:Skill { skill_id: 'skill-linux-001' })
ON CREATE SET sk_linux.skill_name = 'Linux', sk_linux.category = 'Infrastructure', sk_linux.popularity_score = 93;

MERGE (sk_go:Skill { skill_id: 'skill-go-001' })
ON CREATE SET sk_go.skill_name = 'Go', sk_go.category = 'Technical', sk_go.popularity_score = 89;

MERGE (sk_sql:Skill { skill_id: 'skill-sql-001' })
ON CREATE SET sk_sql.skill_name = 'SQL', sk_sql.category = 'Database', sk_sql.popularity_score = 96;

MERGE (sk_c:Skill { skill_id: 'skill-c-001' })
ON CREATE SET sk_c.skill_name = 'C/C++', sk_c.category = 'Technical', sk_c.popularity_score = 87;


// =========================================================================
// 2. SEED ROLES & SKILL PREREQUISITES
// =========================================================================

MERGE (r_aiml:Role { role_id: 'role-aiml-001' })
ON CREATE SET r_aiml.title = 'AI/ML Engineer', r_aiml.salary_tier = 'High', r_aiml.demand_index = 96;

MERGE (r_fullstack:Role { role_id: 'role-fullstack-001' })
ON CREATE SET r_fullstack.title = 'Full Stack Engineer', r_fullstack.salary_tier = 'High', r_fullstack.demand_index = 94;

MERGE (r_devops:Role { role_id: 'role-devops-001' })
ON CREATE SET r_devops.title = 'DevOps & Cloud Engineer', r_devops.salary_tier = 'High', r_devops.demand_index = 91;

MERGE (r_ds:Role { role_id: 'role-ds-001' })
ON CREATE SET r_ds.title = 'Data Scientist', r_ds.salary_tier = 'High', r_ds.demand_index = 90;

MERGE (r_embedded:Role { role_id: 'role-embedded-001' })
ON CREATE SET r_embedded.title = 'Embedded Systems Engineer', r_embedded.salary_tier = 'Medium-High', r_embedded.demand_index = 82;

// Role requirements mapping
MERGE (r_aiml)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_py);
MERGE (r_aiml)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 3 }]->(sk_torch);
MERGE (r_aiml)-[:REQUIRES_SKILL { importance: 'Preferred', min_proficiency: 3 }]->(sk_fastapi);
MERGE (r_aiml)-[:REQUIRES_SKILL { importance: 'Preferred', min_proficiency: 2 }]->(sk_docker);

MERGE (r_fullstack)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_ts);
MERGE (r_fullstack)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_react);
MERGE (r_fullstack)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 3 }]->(sk_node);
MERGE (r_fullstack)-[:REQUIRES_SKILL { importance: 'Preferred', min_proficiency: 3 }]->(sk_sql);

MERGE (r_devops)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_linux);
MERGE (r_devops)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 3 }]->(sk_docker);
MERGE (r_devops)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 3 }]->(sk_k8s);
MERGE (r_devops)-[:REQUIRES_SKILL { importance: 'Preferred', min_proficiency: 3 }]->(sk_go);

MERGE (r_ds)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_py);
MERGE (r_ds)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_sql);
MERGE (r_ds)-[:REQUIRES_SKILL { importance: 'Preferred', min_proficiency: 3 }]->(sk_torch);

MERGE (r_embedded)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 4 }]->(sk_c);
MERGE (r_embedded)-[:REQUIRES_SKILL { importance: 'Mandatory', min_proficiency: 3 }]->(sk_linux);


// =========================================================================
// 3. SEED 5 COMPLETE STUDENT PROFILES
// =========================================================================

// --- Student 1: Aarav Sharma (AI/ML Focus) ---
MERGE (s1:Student { student_id: 'std-test-001' })
ON CREATE SET
    s1.name = 'Aarav Sharma',
    s1.email = 'aarav@univ.edu',
    s1.major = 'Computer Science',
    s1.enrollment_year = 2023,
    s1.target_role = 'AI/ML Engineer',
    s1.created_at = datetime();

MERGE (g1:Goal { goal_id: 'goal-001' })
ON CREATE SET g1.title = 'Secure Tier-1 AI Research Internship', g1.target_date = date('2027-06-01');

MERGE (s1)-[:TARGETS]->(r_aiml);
MERGE (s1)-[:HAS_GOAL]->(g1);
MERGE (s1)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'GitHub Analysis', last_assessed: date('2026-10-15') }]->(sk_py);
MERGE (s1)-[:HAS_SKILL { proficiency: 3, verified: true, source: 'Coursework AST', last_assessed: date('2026-10-15') }]->(sk_torch);
MERGE (s1)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'GitHub Repos', last_assessed: date('2026-10-20') }]->(sk_fastapi);
MERGE (s1)-[:HAS_SKILL { proficiency: 2, verified: false, source: 'Self Reported', last_assessed: date('2026-09-01') }]->(sk_docker);


// --- Student 2: Priya Patel (Full Stack Focus) ---
MERGE (s2:Student { student_id: 'std-test-002' })
ON CREATE SET
    s2.name = 'Priya Patel',
    s2.email = 'priya@univ.edu',
    s2.major = 'Information Technology',
    s2.enrollment_year = 2023,
    s2.target_role = 'Full Stack Engineer',
    s2.created_at = datetime();

MERGE (g2:Goal { goal_id: 'goal-002' })
ON CREATE SET g2.title = 'Deploy Full-Stack Microservices Platform', g2.target_date = date('2027-03-15');

MERGE (s2)-[:TARGETS]->(r_fullstack);
MERGE (s2)-[:HAS_GOAL]->(g2);
MERGE (s2)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'GitHub Analysis', last_assessed: date('2026-10-18') }]->(sk_ts);
MERGE (s2)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'Production App', last_assessed: date('2026-10-18') }]->(sk_react);
MERGE (s2)-[:HAS_SKILL { proficiency: 3, verified: true, source: 'GitHub Repos', last_assessed: date('2026-10-18') }]->(sk_node);
MERGE (s2)-[:HAS_SKILL { proficiency: 3, verified: false, source: 'Self Reported', last_assessed: date('2026-09-10') }]->(sk_sql);


// --- Student 3: Rohan Verma (DevOps & Cloud Focus) ---
MERGE (s3:Student { student_id: 'std-test-003' })
ON CREATE SET
    s3.name = 'Rohan Verma',
    s3.email = 'rohan@univ.edu',
    s3.major = 'Computer Science',
    s3.enrollment_year = 2022,
    s3.target_role = 'DevOps & Cloud Engineer',
    s3.created_at = datetime();

MERGE (g3:Goal { goal_id: 'goal-003' })
ON CREATE SET g3.title = 'Achieve CKA Certified Kubernetes Administrator', g3.target_date = date('2026-12-30');

MERGE (s3)-[:TARGETS]->(r_devops);
MERGE (s3)-[:HAS_GOAL]->(g3);
MERGE (s3)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'Lab Exam Assessment', last_assessed: date('2026-10-05') }]->(sk_linux);
MERGE (s3)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'Dockerfile Audits', last_assessed: date('2026-10-10') }]->(sk_docker);
MERGE (s3)-[:HAS_SKILL { proficiency: 3, verified: true, source: 'Cluster Manifests', last_assessed: date('2026-10-22') }]->(sk_k8s);
MERGE (s3)-[:HAS_SKILL { proficiency: 2, verified: false, source: 'Self Reported', last_assessed: date('2026-08-15') }]->(sk_go);


// --- Student 4: Ananya Iyer (Data Science Focus) ---
MERGE (s4:Student { student_id: 'std-test-004' })
ON CREATE SET
    s4.name = 'Ananya Iyer',
    s4.email = 'ananya@univ.edu',
    s4.major = 'Data Science & Analytics',
    s4.enrollment_year = 2024,
    s4.target_role = 'Data Scientist',
    s4.created_at = datetime();

MERGE (g4:Goal { goal_id: 'goal-004' })
ON CREATE SET g4.title = 'Publish Machine Learning Research Paper', g4.target_date = date('2027-05-01');

MERGE (s4)-[:TARGETS]->(r_ds);
MERGE (s4)-[:HAS_GOAL]->(g4);
MERGE (s4)-[:HAS_SKILL { proficiency: 5, verified: true, source: 'Kaggle Notebooks', last_assessed: date('2026-10-12') }]->(sk_py);
MERGE (s4)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'Relational Coursework', last_assessed: date('2026-10-12') }]->(sk_sql);
MERGE (s4)-[:HAS_SKILL { proficiency: 3, verified: true, source: 'GitHub Repos', last_assessed: date('2026-10-20') }]->(sk_torch);


// --- Student 5: Siddharth Nair (Embedded Systems Focus) ---
MERGE (s5:Student { student_id: 'std-test-005' })
ON CREATE SET
    s5.name = 'Siddharth Nair',
    s5.email = 'siddharth@univ.edu',
    s5.major = 'Electronics & Computer Engineering',
    s5.enrollment_year = 2023,
    s5.target_role = 'Embedded Systems Engineer',
    s5.created_at = datetime();

MERGE (g5:Goal { goal_id: 'goal-005' })
ON CREATE SET g5.title = 'Design Custom RISC-V Firmware Kernel', g5.target_date = date('2027-01-20');

MERGE (s5)-[:TARGETS]->(r_embedded);
MERGE (s5)-[:HAS_GOAL]->(g5);
MERGE (s5)-[:HAS_SKILL { proficiency: 4, verified: true, source: 'Hardware Lab Verification', last_assessed: date('2026-10-08') }]->(sk_c);
MERGE (s5)-[:HAS_SKILL { proficiency: 3, verified: true, source: 'Embedded Linux Kernel', last_assessed: date('2026-10-08') }]->(sk_linux);
MERGE (s5)-[:HAS_SKILL { proficiency: 3, verified: false, source: 'Self Reported', last_assessed: date('2026-09-05') }]->(sk_py);

// Neo4j schema — constraints and indexes.
// TODO(Anindya): Phase 1.

// Unique constraints on node ids:
//   (s:Student) REQUIRE s.student_id IS UNIQUE
//   (sk:Skill)  REQUIRE sk.skill_id IS UNIQUE
//   (g:Goal)    REQUIRE g.goal_id IS UNIQUE
//   (r:Role)    REQUIRE r.role_id IS UNIQUE

// Indexes for fast lookups:
//   (s:Student) ON (s.email)
//   (sk:Skill)  ON (sk.skill_name)

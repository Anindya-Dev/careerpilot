/**
 * @file Profile.js
 * @description Mongoose schema for the Student Career Intelligence Profile.
 * Strictly adheres to the CareerPilot Neo4j Knowledge Graph & Agent Orchestrator data contract.
 * @author Md Hussain Ansari (Member 1)
 */

const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: mongoose.Schema.Types.Mixed, // Supports numeric (1-5) or string ('beginner', 'intermediate', 'advanced')
      default: 'intermediate'
    },
    category: { type: String, default: 'General', trim: true },
    verified: { type: Boolean, default: false },
    source: { type: String, default: 'self-reported', trim: true } // 'github', 'assessment', 'self-reported'
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    repo_url: { type: String, default: '', trim: true },
    technologies: [{ type: String, trim: true }]
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, default: '', trim: true },
    issue_date: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    major: {
      type: String,
      default: '',
      trim: true
    },
    target_role: {
      type: String,
      default: '',
      trim: true
    },
    skills: {
      type: [SkillSchema],
      default: []
    },
    goals: {
      type: [mongoose.Schema.Types.Mixed], // Supports array of strings or goal objects
      default: []
    },
    projects: {
      type: [ProjectSchema],
      default: []
    },
    certifications: {
      type: [CertificationSchema],
      default: []
    },
    career_health_score: {
      type: Number,
      default: 0
    },
    profile_completeness: {
      type: Number,
      default: 0
    },
    linked_accounts: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      leetcode: { type: String, default: '' }
    },
    github_data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    leetcode_data: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    dismissed_skills: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compute profile completeness percentage based on populated sections.
 * @returns {number} Percentage between 0 and 100
 */
ProfileSchema.methods.calculateCompleteness = function () {
  let score = 0;
  if (this.name && this.email) score += 20;
  if (this.target_role && this.target_role.trim().length > 0) score += 20;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.projects && this.projects.length > 0) score += 20;
  if (this.goals && this.goals.length > 0) score += 10;
  if (this.linked_accounts?.github || this.linked_accounts?.linkedin || this.certifications?.length > 0) score += 10;
  return score;
};

ProfileSchema.pre('save', function (next) {
  this.profile_completeness = this.calculateCompleteness();
  next();
});

module.exports = mongoose.model('Profile', ProfileSchema);

# Riichi Mahjong League - Documentation

Welcome to the documentation for our **Riichi Mahjong League** project - a Progressive Web App (PWA) for tracking games, rankings, and scheduling for a ~20 player friend group.

## 📋 Quick Links

### For Developers

- [**Project Overview**](./01-project-overview.md) - Goals, phases, and requirements
- [**Technical Architecture**](./02-technical-architecture.md) - Tech stack and system design
- [**Database Schema**](./03-database-schema.md) - Source vs. derived tables design
- [**Development Setup**](./04-development-setup.md) - Prerequisites and scaffolding guide

### For Product & Design

- [**Rating System**](./05-rating-system.md) - OpenSkill-based ranking algorithm
- [**Feature Roadmap**](./06-feature-roadmap.md) - Implementation phases and priorities

### Reference

- [**External APIs**](./07-external-apis.md) - Documentation links for Next.js, Supabase, etc.

---

## 🎯 Project Summary

A **hobby PWA** for tracking Riichi Mahjong games among friends with:

- **Phase 0**: Read-only PWA with leaderboard and player statistics
- **Phase 0.5**: ⭐ **Configuration playground** - Interactive rating system experimentation
- **Phase 1**: Live game tracking with hand-by-hand logging
- **Phase 2**: Game scheduling and availability management

**Tech Stack**: Next.js 15 + Supabase + Python (OpenSkill) + Turborepo

**Key Innovation**: Configuration-driven rating system with smart caching enables real-time user experimentation with different rule sets while preserving official competitive rankings.

---

## 🚀 Quick Start

1. **Understand the Project**: Start with [Project Overview](./01-project-overview.md)
2. **Review Architecture**: Read [Technical Architecture](./02-technical-architecture.md)
3. **Set Up Development**: Follow [Development Setup](./04-development-setup.md)
4. **Understand Data**: Review [Database Schema](./03-database-schema.md)

---

## 📁 Documentation Structure

| Document                         | Purpose                                   | Audience          |
| -------------------------------- | ----------------------------------------- | ----------------- |
| **01-project-overview.md**       | Product goals, user stories, phases       | Product, Dev, LLM |
| **02-technical-architecture.md** | Tech stack, system design, decisions      | Dev, LLM          |
| **03-database-schema.md**        | Configuration-driven database design      | Dev, LLM          |
| **04-development-setup.md**      | Prerequisites, scaffolding instructions   | Dev, LLM          |
| **05-rating-system.md**          | Configuration system & rating algorithm   | Product, Dev      |
| **06-feature-roadmap.md**        | Implementation phases including Phase 0.5 | Product, Dev      |
| **07-external-apis.md**          | Reference links and documentation         | Dev               |

---

_Last updated: July 11, 2025_

## ✅ Documentation Status

All documentation files are **complete** and organized for developers, product stakeholders, and LLM coding agents.

### Archive

Original documentation files have been moved to `../archive/` with a migration guide explaining the reorganization.

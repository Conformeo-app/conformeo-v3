# AGENTS.md — Conforméo

## Project
Conforméo is a modular platform for field companies with 3 modules:
1. Réglementation
2. Chantier
3. Facturation

The product must remain simple, guided, and understandable by non-experts.
It is not a generic ERP.

## Official stack
- Desktop frontend: Angular
- Mobile frontend: Ionic + Capacitor + Angular
- Tablet: same mobile app with tablet-adapted layouts
- PWA: optional secondary access mode only, never the primary field experience
- Backend: FastAPI
- Database: PostgreSQL
- Repository structure: monorepo

## Product principles
- 1 platform, 3 activable modules
- Desktop = administration, configuration, regulatory management, invoicing
- Mobile = primary field device
- Tablet = comfort device, never mandatory
- Offline-first for critical field workflows
- Progressive complexity: simple surface, deeper detail only when needed
- AI must remain optional, assistive, and never block the workflow

## UX principles
- Every screen must help the user complete one useful action quickly
- Avoid overloaded screens
- Use plain language, not raw regulatory jargon
- Prefer short guided flows over complex forms
- Always show sync state clearly on mobile
- Mobile field flows must work with limited attention and poor connectivity

## Technical principles
- Shared types and reusable UI components
- Clear module boundaries with domain links between modules
- Mobile app must use local storage + deferred sync queue
- Robust audit log for critical actions
- Soft delete when relevant
- Preserve backward compatibility when changing models if possible

## Device strategy
- Desktop is the primary administration surface
- Mobile is the primary field surface
- Tablet is a comfort extension of the mobile app
- Do not design critical chantier workflows as PWA-first
- Field-critical workflows must target the mobile app first

## Rules for Codex
- Do not introduce heavy ERP-like complexity
- Do not add features outside the current sprint scope
- Do not propose a PWA-only strategy for field operations
- Do not rename domains, entities, or modules without strong justification
- Preserve the existing architecture unless a change is clearly justified
- Prefer small, reviewable patches
- Always update types and tests when behavior changes
- When changing data models, include migrations and compatibility notes
- When adding UI, keep mobile ergonomics and low-friction flows in mind
- When implementing sync behavior, prioritize correctness over cleverness

## Required workflow
Before coding:
1. Read relevant files
2. Summarize understanding
3. Propose a short plan
4. Identify risks or blockers
5. Then implement

Before finishing:
1. Run relevant checks/tests
2. Verify acceptance criteria
3. List files changed
4. Note any remaining limitations
5. Suggest the next smallest logical step

## Non-goals
- No accounting suite
- No advanced CRM
- No heavy document engine
- No advanced analytics
- No speculative AI feature unless explicitly requested
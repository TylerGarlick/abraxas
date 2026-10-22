# Shift Handoff & Training Recording Application

## Implementation Plan

**Created:** 2026-04-07  
**Status:** Planning  
**Repository:** TylerGarlick/research (private)

---

## Executive Summary

A web application for recording work sessions and training content that enables asynchronous shift handoffs. The system allows team members to document their work, create training materials, and control access through role-based permissions—ensuring later shifts can consume and build upon previous work without requiring synchronous communication.

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Web UI    │  │  Mobile PWA │  │  API Client │         │
│  │  (React)    │  │  (Optional) │  │  (CLI/SDK)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│              (Authentication & Rate Limiting)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Session   │  │  Training   │  │     RBAC    │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Search    │  │  Analytics  │                          │
│  │   Service   │  │   Service   │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │   Redis     │  │   S3/MinIO  │         │
│  │  (Primary)  │  │   (Cache)   │  │  (Media)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Deployment Architecture

**Option A: Single-Server Deployment (Recommended for MVP)**
- Docker Compose stack on a single VPS
- All services containerized
- PostgreSQL, Redis, and app on same machine
- Cost: ~$20-40/month

**Option B: Managed Services (Production)**
- Frontend: Vercel/Netlify or S3 + CloudFront
- Backend: Railway, Render, or AWS ECS/Fargate
- Database: Supabase, Neon, or AWS RDS
- Storage: AWS S3 or Cloudflare R2

### 1.3 Key Design Principles

1. **Asynchronous-first**: All content designed for time-shifted consumption
2. **Search-driven**: Powerful search to find relevant sessions/trainings quickly
3. **Permission-aware**: Content visibility controlled by RBAC
4. **Audit-logged**: All actions tracked for compliance and debugging
5. **Offline-capable**: PWA support for field work with sync on reconnect

---

## 2. User Roles and Permissions Model

### 2.1 Role Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                      ADMIN                                │
│  • Full system access                                    │
│  • User management                                       │
│  • Role assignment                                       │
│  • System configuration                                  │
│  • Audit log access                                      │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   MANAGER                                 │
│  • Create/edit all content                               │
│  • Approve/reject submissions                            │
│  • View team analytics                                   │
│  • Manage team members                                   │
│  • Export data                                           │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                 CONTRIBUTOR                               │
│  • Create own sessions/trainings                         │
│  • Edit own content                                      │
│  • View public + team content                            │
│  • Comment on others' content                            │
│  • Request access to restricted content                  │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   VIEWER                                  │
│  • View public content only                              │
│  • View assigned team content                            │
│  • Add comments/notes                                    │
│  • Mark content as helpful                               │
│  • No creation/edit rights                               │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Permission Matrix

| Permission | Admin | Manager | Contributor | Viewer |
|------------|-------|---------|-------------|--------|
| Create sessions | ✅ | ✅ | ✅ (own) | ❌ |
| Edit any session | ✅ | ✅ | ❌ | ❌ |
| Delete any session | ✅ | ✅ | ❌ | ❌ |
| Create trainings | ✅ | ✅ | ✅ (own) | ❌ |
| Publish trainings | ✅ | ✅ | ⚠️ (needs approval) | ❌ |
| View all content | ✅ | ✅ | ⚠️ (team only) | ⚠️ (public only) |
| Manage users | ✅ | ⚠️ (team only) | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ (team) | ❌ | ❌ |
| Export data | ✅ | ✅ | ❌ | ❌ |
| Access audit logs | ✅ | ❌ | ❌ | ❌ |
| System config | ✅ | ❌ | ❌ | ❌ |

### 2.3 Content Visibility Levels

Each session/training record has a visibility setting:

1. **Public**: Visible to all authenticated users
2. **Team**: Visible to users in same team/department
3. **Private**: Visible only to creator and admins
4. **Restricted**: Visible only to explicitly granted users/roles

### 2.4 Team/Department Structure

```
Organization
├── Team Alpha
│   ├── Manager (user)
│   ├── Contributor (user)
│   └── Viewer (user)
├── Team Beta
│   └── ...
└── Team Gamma
    └── ...
```

Users can belong to multiple teams with different roles in each.

---

## 3. Data Model

### 3.1 Core Entities

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- admin, manager, contributor, viewer
    description TEXT,
    permissions JSONB NOT NULL, -- { "sessions.create": true, "trainings.publish": false }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Roles (Many-to-Many)
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- NULL = org-wide role
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = permanent
    PRIMARY KEY (user_id, role_id, team_id)
);
```

#### Teams
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Sessions (Work Records)
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    team_id UUID REFERENCES teams(id),
    visibility VARCHAR(20) DEFAULT 'team', -- public, team, private, restricted
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
    ) STORED,
    tags TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    notes TEXT,
    attachments JSONB DEFAULT '[]', -- [{url, name, size, type}]
    is_handoff_ready BOOLEAN DEFAULT false,
    handoff_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_team ON sessions(team_id);
CREATE INDEX idx_sessions_visibility ON sessions(visibility);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_sessions_tags ON sessions USING GIN(tags);
```

#### Trainings
```sql
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) NOT NULL,
    team_id UUID REFERENCES teams(id),
    visibility VARCHAR(20) DEFAULT 'team',
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending_review, published, archived
    content_type VARCHAR(50), -- guide, video, checklist, procedure, faq
    content_body TEXT, -- Markdown or HTML
    estimated_duration_minutes INTEGER,
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    prerequisites JSONB DEFAULT '[]', -- [training_id, ...]
    learning_objectives TEXT[],
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    parent_training_id UUID REFERENCES trainings(id), -- for versioning
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trainings_user ON trainings(user_id);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_trainings_visibility ON trainings(visibility);
CREATE INDEX idx_trainings_tags ON trainings USING GIN(tags);
```

#### Session-Training Links
```sql
CREATE TABLE session_trainings (
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    linked_by UUID REFERENCES users(id),
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context_note TEXT, -- Why this training is relevant to this session
    PRIMARY KEY (session_id, training_id)
);
```

#### Comments
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_session ON comments(session_id);
CREATE INDEX idx_comments_training ON comments(training_id);
```

#### Access Grants (for Restricted Content)
```sql
CREATE TABLE access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(20) NOT NULL, -- session, training
    resource_id UUID NOT NULL,
    grantee_type VARCHAR(20) NOT NULL, -- user, role, team
    grantee_id UUID NOT NULL,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(resource_type, resource_id, grantee_type, grantee_id)
);

CREATE INDEX idx_access_grants_resource ON access_grants(resource_type, resource_id);
CREATE INDEX idx_access_grants_grantee ON access_grants(grantee_type, grantee_id);
```

#### Audit Logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- create, update, delete, view, grant_access
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

### 3.2 Entity Relationships

```
┌─────────┐       ┌─────────────┐       ┌─────────┐
│  User   │───┬───│  UserRoles  │───┬───│  Role   │
└─────────┘   │   └─────────────┘   │   └─────────┘
    │         │                     │
    │         └──────────┬──────────┘
    │                    │
    │              ┌─────────┐
    └──────────────│  Team   │
                   └─────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Session  │   │ Training │   │  Access  │
   │          │   │          │   │  Grants  │
   └──────────┘   └──────────┘   └──────────┘
        │              │
        └──────┬───────┘
               │
         ┌──────────┐
         │ Comments │
         └──────────┘
```

---

## 4. Tech Stack Recommendations

### 4.1 Recommended Stack (Modern & Maintainable)

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand or TanStack Query
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Routing**: TanStack Router or React Router v6
- **Build Tool**: Vite
- **PWA**: Workbox for offline support

#### Backend
- **Runtime**: Node.js 20+ or Bun
- **Framework**: Hono (lightweight, fast) or Express
- **Language**: TypeScript
- **ORM**: Drizzle ORM (type-safe, lightweight) or Prisma
- **Validation**: Zod
- **Authentication**: Lucia Auth or Auth.js (NextAuth)
- **Authorization**: CASL or custom RBAC middleware

#### Database
- **Primary**: PostgreSQL 15+
- **Migrations**: Drizzle Kit or Prisma Migrate
- **Connection Pooling**: PgBouncer (for production)

#### Caching & Sessions
- **Cache**: Redis (for sessions, rate limiting, query cache)
- **Session Store**: Redis-backed sessions

#### File Storage
- **Option A**: AWS S3
- **Option B**: Cloudflare R2 (cheaper, no egress fees)
- **Option C**: Self-hosted MinIO

#### Search
- **MVP**: PostgreSQL full-text search (tsvector/tsquery)
- **Production**: Meilisearch or Typesense (self-hosted, fast)

#### Deployment
- **MVP**: Docker Compose on single VPS (Hetzner, DigitalOcean)
- **Production**: 
  - Frontend: Vercel/Netlify
  - Backend: Railway, Render, or AWS ECS
  - Database: Supabase, Neon, or AWS RDS

### 4.2 Alternative Stacks

#### Option B: Python Stack
- **Backend**: FastAPI + SQLAlchemy
- **Frontend**: Same as above
- **Pros**: Great for data-heavy features, ML integration
- **Cons**: Larger deployment footprint

#### Option C: Full-Stack Framework
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js
- **Pros**: Unified codebase, excellent DX
- **Cons**: Vendor lock-in to Next.js ecosystem

#### Option D: Go Stack
- **Backend**: Go + Gin/Fiber + GORM
- **Frontend**: Same as above (separate repo)
- **Pros**: Performance, single binary deployment
- **Cons**: More verbose, slower iteration

### 4.3 Why the Recommended Stack?

1. **TypeScript everywhere**: Type safety from DB to UI
2. **Modern & lightweight**: Hono + Drizzle are fast and minimal
3. **Great DX**: Hot reload, type checking, excellent tooling
4. **Easy hiring**: React/Node developers are abundant
5. **Cost-effective**: Can run on minimal infrastructure
6. **Scalable**: Each layer can be scaled independently

---

## 5. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Basic authentication and session recording

#### Deliverables
- [ ] Project setup (monorepo or separate repos)
- [ ] Database schema and migrations
- [ ] User authentication (email/password + OAuth)
- [ ] Basic user management (CRUD)
- [ ] Session creation/editing/deletion
- [ ] Simple session list view
- [ ] Basic RBAC (admin/user roles only)

#### Technical Tasks
1. Initialize repository structure
2. Set up Docker Compose for local dev
3. Configure database with Drizzle/Prisma
4. Implement auth with Lucia/Auth.js
5. Build session CRUD API endpoints
6. Create basic React UI components
7. Deploy MVP to staging environment

#### Success Criteria
- Users can sign up and log in
- Users can create work sessions with title, description, timestamps
- Sessions are visible in a list view
- Basic role system works (admin vs user)

---

### Phase 2: Core Features (Weeks 3-4)

**Goal**: Complete session management and introduce trainings

#### Deliverables
- [ ] Full RBAC system (4 roles + teams)
- [ ] Session tagging and search
- [ ] Session attachments (file uploads)
- [ ] Training creation (basic)
- [ ] Training publishing workflow
- [ ] Content visibility controls
- [ ] Comment system

#### Technical Tasks
1. Implement team management
2. Build permission middleware
3. Add file upload to S3/R2
4. Implement PostgreSQL full-text search
5. Create training CRUD with status workflow
6. Build comment system with threading
7. Add visibility filtering to all queries

#### Success Criteria
- Users can be assigned to teams with specific roles
- Sessions can be tagged and searched
- Files can be attached to sessions
- Trainings can be created and published
- Comments work on both sessions and trainings
- Content visibility is enforced

---

### Phase 3: Handoff & Discovery (Weeks 5-6)

**Goal**: Make content discoverable and handoff-ready

#### Deliverables
- [ ] Handoff-ready sessions (flag + notes)
- [ ] Advanced search and filtering
- [ ] Session-to-training linking
- [ ] Training prerequisites
- [ ] User dashboard (my sessions, my trainings)
- [ ] Team dashboard (team activity)
- [ ] Email notifications (optional)

#### Technical Tasks
1. Add handoff_ready flag and notes to sessions
2. Build advanced search UI with filters
3. Implement session-training relationships
4. Create prerequisite system for trainings
5. Build personalized dashboards
6. Set up email service (Resend/SendGrid)
7. Create notification system

#### Success Criteria
- Users can mark sessions as handoff-ready
- Search finds relevant content quickly
- Trainings can reference other trainings
- Dashboards show relevant activity
- Users receive notifications for mentions/approvals

---

### Phase 4: Polish & Production (Weeks 7-8)

**Goal**: Production-ready application

#### Deliverables
- [ ] Audit logging
- [ ] Analytics dashboard
- [ ] Data export (CSV/JSON)
- [ ] PWA support (offline mode)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation
- [ ] Production deployment

#### Technical Tasks
1. Implement comprehensive audit logging
2. Build analytics queries and dashboards
3. Add export functionality
4. Configure Workbox for PWA
5. Optimize database queries and add indexes
6. Security review (OWASP checklist)
7. Write user and admin documentation
8. Set up production infrastructure
9. Load testing and optimization

#### Success Criteria
- All actions are logged for audit
- Managers can view team analytics
- Data can be exported for backup
- App works offline (cached content)
- Page load times < 2s
- No critical security vulnerabilities
- Documentation is complete
- Production environment is stable

---

### Phase 5: Enhancements (Post-MVP)

**Future Features** (prioritize based on feedback)

- [ ] Mobile app (React Native or native)
- [ ] Voice-to-text for session notes
- [ ] AI-powered content suggestions
- [ ] Automated training recommendations
- [ ] Integration with calendar/scheduling tools
- [ ] Slack/Discord bot for notifications
- [ ] API for third-party integrations
- [ ] Webhooks for external systems
- [ ] Advanced analytics (trends, insights)
- [ ] Multi-language support
- [ ] Custom branding per organization

---

## 6. Security Considerations

### 6.1 Authentication
- Use secure password hashing (Argon2 or bcrypt)
- Implement rate limiting on login attempts
- Support OAuth (Google, GitHub, Microsoft)
- Session tokens with short expiry + refresh tokens
- HTTP-only, secure cookies

### 6.2 Authorization
- All API endpoints must check permissions
- Row-level security in database where possible
- Never trust client-side role checks
- Audit all permission grants

### 6.3 Data Protection
- Encrypt sensitive data at rest (database encryption)
- Use HTTPS everywhere (TLS 1.3)
- Sanitize all user inputs (XSS prevention)
- Implement CSRF protection
- Content Security Policy headers

### 6.4 Compliance
- GDPR: Right to deletion, data export
- Audit logs for compliance tracking
- Data retention policies
- Privacy policy and terms of service

---

## 7. Testing Strategy

### 7.1 Unit Tests
- Test all utility functions
- Test permission logic thoroughly
- Test validation schemas
- Target: 80%+ coverage on backend

### 7.2 Integration Tests
- API endpoint tests (all CRUD operations)
- Authentication flows
- Permission enforcement
- Database transactions

### 7.3 End-to-End Tests
- Critical user journeys (Playwright)
- Sign up → create session → publish training
- Role-based access scenarios
- Search and filtering

### 7.4 Performance Tests
- Load testing with k6 or Artillery
- Database query optimization
- Caching effectiveness

---

## 8. Monitoring & Observability

### 8.1 Application Monitoring
- **Error Tracking**: Sentry or self-hosted GlitchTip
- **Uptime Monitoring**: Uptime Kuma or Pingpong
- **Logs**: Structured logging (pino/winston) + Logtail or self-hosted Loki

### 8.2 Infrastructure Monitoring
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty, Opsgenie, or simple email/SMS
- **APM**: Highlight.io or self-hosted SigNoz

### 8.3 Key Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Active users (DAU/MAU)
- Content creation rates
- Search success rates

---

## 9. Cost Estimates

### MVP (Single Server)
| Item | Monthly Cost |
|------|-------------|
| VPS (4GB RAM, 2 CPU) | $20-40 |
| Domain name | $1-2 |
| Email service (Resend) | $0-15 (free tier available) |
| **Total** | **$21-57/month** |

### Production (Managed Services)
| Item | Monthly Cost |
|------|-------------|
| Frontend hosting (Vercel) | $0-20 |
| Backend (Railway/Render) | $25-50 |
| Database (Neon/Supabase) | $0-25 (free tier available) |
| Storage (R2/S3) | $5-20 |
| Email service | $15-30 |
| Monitoring (Sentry) | $0-25 (free tier available) |
| **Total** | **$45-170/month** |

---

## 10. Next Steps

### Immediate Actions
1. **Review this plan** with stakeholders
2. **Confirm tech stack** choice
3. **Set up repository** structure
4. **Create Phase 1 tasks** in project tracker
5. **Begin development** on authentication and sessions

### Questions to Resolve
- [ ] What OAuth providers are needed? (Google, GitHub, Microsoft, etc.)
- [ ] What's the expected user count in first 6 months?
- [ ] Any compliance requirements? (HIPAA, SOC2, etc.)
- [ ] Preferred cloud provider or self-hosted?
- [ ] Integration needs with existing tools?

---

## Appendix A: API Endpoint Sketch

```
# Authentication
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/oauth/:provider

# Users
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/:id

# Sessions
GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/:id
PATCH  /api/sessions/:id
DELETE /api/sessions/:id
POST   /api/sessions/:id/attachments
POST   /api/sessions/:id/handoff

# Trainings
GET    /api/trainings
POST   /api/trainings
GET    /api/trainings/:id
PATCH  /api/trainings/:id
DELETE /api/trainings/:id
POST   /api/trainings/:id/publish
POST   /api/trainings/:id/attachments

# Teams
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PATCH  /api/teams/:id
POST   /api/teams/:id/members
DELETE /api/teams/:id/members/:userId

# Roles & Permissions
GET    /api/roles
POST   /api/roles/:id/users
DELETE /api/roles/:id/users/:userId

# Search
GET    /api/search?q=:query&type=session|training

# Comments
GET    /api/sessions/:id/comments
POST   /api/sessions/:id/comments
GET    /api/trainings/:id/comments
POST   /api/trainings/:id/comments

# Admin
GET    /api/admin/users
GET    /api/admin/audit-logs
GET    /api/admin/analytics
```

---

## Appendix B: Sample RBAC Middleware

```typescript
// middleware/rbac.ts
import { Permission, Role } from '@/db/schema';

export function requirePermission(permission: Permission) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const hasPermission = await checkPermission(user.id, permission);
    if (!hasPermission) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await next();
  };
}

export function requireRole(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const userRoles = await getUserRoles(user.id);
    const hasRole = userRoles.some(r => roles.includes(r.name));
    
    if (!hasRole) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await next();
  };
}
```

---

## Appendix C: Database Migration Example

```sql
-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE visibility_level AS ENUM ('public', 'team', 'private', 'restricted');
CREATE TYPE training_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- [Rest of schema from Section 3.1]
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-07  
**Author**: MJ (via OpenClaw subagent)  
**Status**: Ready for review

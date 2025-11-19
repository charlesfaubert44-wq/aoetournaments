# Coupe Québec AOE2 - Tournament Platform Design

**Date:** November 18, 2025
**Purpose:** One-time Age of Empires 2 tournament platform for 20 players
**Audience:** Friends reunion, casual and friendly competitive event

---

## Overview

Coupe Québec AOE2 is a web platform designed to facilitate a one-time, 20-player Age of Empires 2 tournament among friends. The platform focuses on simplicity, ease of use, and creating a fun, nostalgic experience for participants.

**Core Objectives:**
- Enable easy player registration with minimal friction
- Display tournament brackets and results in real-time
- Provide simple admin tools for tournament management
- Create a polished, AoE2-themed experience

---

## Technology Stack

### Framework & Core Technologies
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS for responsive design
- **Database:** SQLite (via better-sqlite3)
- **Internationalization:** i18next (French/English toggle)
- **Deployment:** Vercel (free tier)

### Rationale
- **Next.js:** All-in-one fullstack solution with excellent developer experience, built-in routing, and seamless Vercel deployment
- **SQLite:** Perfect for small, one-time event; no external database setup required; entire tournament data in one portable file
- **Tailwind:** Rapid UI development with responsive utilities
- **Vercel:** Zero-config deployment with free tier suitable for tournament traffic

---

## Architecture

### Application Structure
```
/app
  /(public)
    /page.tsx           # Landing page
    /register/page.tsx  # Registration form
    /brackets/page.tsx  # Tournament brackets display
    /players/page.tsx   # Player gallery
  /admin
    /page.tsx           # Admin login
    /dashboard/page.tsx # Admin controls
  /api
    /register/route.ts  # Registration endpoint
    /admin/route.ts     # Admin operations
/lib
  /db.ts               # SQLite database utilities
  /tournament.ts       # Bracket generation logic
/components
  /Bracket.tsx         # Bracket visualization
  /PlayerCard.tsx      # Player display component
  /LanguageToggle.tsx  # i18n switcher
```

### Rendering Strategy
- **Server-side rendering (SSR)** for public pages (landing, brackets, players)
- **Server Actions** for form submissions and data mutations
- **API routes** for admin operations
- Session-based authentication for admin access

---

## Data Model

### Database Schema

#### Players Table
```typescript
{
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  name: TEXT NOT NULL
  email: TEXT UNIQUE NOT NULL
  aoe2Username: TEXT NOT NULL
  preferredCiv: TEXT NOT NULL
  registeredAt: DATETIME DEFAULT CURRENT_TIMESTAMP
  seed: INTEGER
}
```

#### Matches Table
```typescript
{
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  round: INTEGER NOT NULL           // 1=Round of 16, 2=Quarters, 3=Semis, 4=Finals
  matchNumber: INTEGER NOT NULL
  player1Id: INTEGER REFERENCES Players(id)
  player2Id: INTEGER REFERENCES Players(id)
  winnerId: INTEGER REFERENCES Players(id)
  completedAt: DATETIME
}
```

#### AdminUsers Table
```typescript
{
  id: INTEGER PRIMARY KEY AUTOINCREMENT
  username: TEXT UNIQUE NOT NULL
  passwordHash: TEXT NOT NULL       // bcrypt hashed
}
```

---

## Core Features

### 1. Player Registration

**Page:** `/register`

**Fields Collected:**
- Full name (text input)
- Email address (email input, unique validation)
- AoE2 in-game username (text input)
- Preferred civilization (dropdown with all AoE2 civilizations)
- Tournament code (password input, validated server-side)

**Validation:**
- Tournament code must match environment variable
- Email must be unique (prevent duplicate registrations)
- Maximum 20 registrations enforced
- All fields required

**User Flow:**
1. User navigates from landing page
2. Fills registration form
3. Submits with tournament code
4. Server validates and creates player record
5. Confirmation page displays registration details
6. Redirect to players gallery

### 2. Tournament Brackets

**Page:** `/brackets`

**Bracket Format:**
- Single-elimination tournament
- 20 players: 16 in main bracket + 4 receive first-round byes
- 4 rounds total (Round of 16 → Quarterfinals → Semifinals → Finals)

**Display Features:**
- Visual bracket tree using CSS Grid or `react-tournament-brackets` library
- Completed matches show winner highlighted
- Upcoming matches show "TBD" or player names
- Responsive design for mobile viewing
- Auto-refresh or manual refresh to see updates

**Bracket Generation Logic:**
- Admin triggers bracket generation from dashboard
- Players seeded randomly or manually by admin
- Matches created with cascade logic (winners advance automatically)

### 3. Player Gallery

**Page:** `/players`

**Display:**
- Grid of player cards showing:
  - Player name
  - AoE2 username
  - Preferred civilization (with civ icon/flag)
  - Registration order/seed
- Responsive grid (1 column mobile, 3-4 columns desktop)
- Search/filter by name or civilization

### 4. Admin Dashboard

**Pages:** `/admin` (login) → `/admin/dashboard`

**Authentication:**
- Simple username/password login
- Session-based auth (HTTP-only cookies)
- Protected routes with middleware

**Dashboard Features:**
- **Player Management:**
  - View all registered players in table
  - Edit player details (name, email, username, civ)
  - Delete registrations (if needed)
  - Manual seeding assignment

- **Bracket Management:**
  - "Generate Bracket" button (enabled when ready)
  - Visual bracket with winner selection dropdowns
  - Update match results (select winner from dropdown)
  - Auto-advance winners to next round
  - Reset match results if needed

- **Tournament Status:**
  - Registration count (X/20 players)
  - Bracket status (not generated / in progress / completed)
  - Quick stats (most popular civ, etc.)

### 5. Landing Page

**Page:** `/`

**Content:**
- Tournament name and logo
- Event description and rules
- Date and format information
- Call-to-action: "S'inscrire / Register" button
- Links to brackets and player gallery
- Language toggle (FR/EN)

**Design Theme:**
- Medieval/AoE2 aesthetic (castle imagery, medieval fonts)
- Color palette: Gold (#D4AF37), Crimson (#DC143C), Stone Gray (#708090)
- Responsive hero section with tournament logo

---

## Security & Data Protection

### Security Measures
- **Tournament Code:** Shared secret prevents public registrations
- **Admin Authentication:** Password-protected admin routes
- **Input Validation:** Server-side validation on all forms
- **Rate Limiting:** Prevent registration spam (10 attempts per IP per hour)
- **SQL Injection Prevention:** Parameterized queries with better-sqlite3
- **XSS Protection:** Next.js automatic escaping, sanitize user inputs

### Environment Variables
```
TOURNAMENT_CODE=<shared secret>
ADMIN_USERNAME=<admin username>
ADMIN_PASSWORD_HASH=<bcrypt hash>
SESSION_SECRET=<random secret for session signing>
```

---

## Internationalization (i18n)

### Languages
- French (primary)
- English (secondary)

### Implementation
- Use `next-i18next` or `next-intl`
- Language toggle component in header
- Store language preference in localStorage
- All UI strings externalized to translation files

### Translation Coverage
- Navigation and buttons
- Form labels and validation messages
- Tournament information and rules
- Bracket labels (Round of 16, Quarterfinals, etc.)
- Admin dashboard

---

## Deployment Strategy

### Hosting Platform
**Vercel** (free tier)
- Automatic deployments from git push
- Built-in SSL/HTTPS
- CDN for static assets
- Serverless functions for API routes

### Database Persistence
- SQLite file stored in project directory
- For Vercel: Consider upgrading to Vercel Postgres or external SQLite host if file persistence issues arise
- Backup strategy: Download SQLite file regularly via admin panel

### Domain
- Default: `coupe-quebec-aoe2.vercel.app`
- Custom domain optional (configure in Vercel dashboard)

### Deployment Steps
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with `vercel deploy --prod`
5. Test registration flow and admin panel

---

## Nice-to-Have Features

### Phase 1 (Core - Must Have)
- Player registration with validation
- Bracket generation and display
- Admin dashboard for match updates
- Bilingual support (FR/EN)

### Phase 2 (Polish - Should Have)
- Player gallery with civ icons
- Email confirmation after registration
- AoE2-themed design and styling
- Responsive mobile optimization

### Phase 3 (Optional - Nice to Have)
- Downloadable bracket as PDF
- Fun statistics (most popular civ, registration timeline chart)
- Tournament countdown timer on landing page
- Social sharing for registration ("I'm playing in Coupe Québec!")

---

## Out of Scope (YAGNI)

These features are explicitly NOT included to maintain simplicity:
- Player login accounts (viewing is public)
- Match scheduling system (coordinate via Discord/email)
- Live chat or messaging
- Multi-tournament support
- Historical tournament data
- Elo ratings or skill tracking
- Live match streaming integration
- Automated match reminders
- Payment/prize management

---

## Success Criteria

The platform will be considered successful if:
1. All 20 players can register without technical issues
2. Admin can generate brackets and update results easily
3. Players can view brackets on mobile and desktop
4. Platform remains available throughout tournament (99%+ uptime)
5. Zero data loss during event
6. Friends enjoy the nostalgic, polished experience

---

## Development Timeline Estimate

- **Setup & Infrastructure:** 2-4 hours (Next.js project, database schema, deployment)
- **Registration System:** 3-4 hours (form, validation, confirmation)
- **Bracket Generation:** 4-6 hours (algorithm, data model, visualization)
- **Admin Dashboard:** 3-4 hours (auth, CRUD operations, match updates)
- **Design & Styling:** 4-6 hours (Tailwind, AoE2 theme, responsive)
- **i18n Integration:** 2-3 hours (setup, translations)
- **Testing & Polish:** 2-3 hours (E2E testing, bug fixes)

**Total Estimate:** 20-30 hours for complete implementation

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite file persistence on Vercel | High | Use Vercel Postgres or external SQLite host as backup plan |
| More/fewer than 20 registrations | Medium | Admin can manually add/remove players, flexible bracket generation |
| Admin password leaked | Medium | Use strong password, rotate if needed, audit logs |
| Registration spam | Low | Tournament code + rate limiting |
| Browser compatibility issues | Low | Test on major browsers (Chrome, Firefox, Safari, Edge) |
| Mobile bracket display | Medium | Responsive design testing, horizontal scroll fallback |

---

## Next Steps

1. Initialize Next.js project with TypeScript and Tailwind
2. Set up SQLite database schema
3. Implement registration flow
4. Build bracket generation algorithm
5. Create admin authentication and dashboard
6. Design and style with AoE2 theme
7. Add internationalization
8. Deploy to Vercel and test end-to-end
9. Share tournament code with friends!

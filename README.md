# Coupe Québec AOE2 - Tournament Platform

A Next.js web application for managing a 20-player Age of Empires 2 tournament.

## Features

- **Player Registration**: Simple form with tournament code protection
- **Tournament Brackets**: Single-elimination bracket display with live updates
- **Admin Dashboard**: Manage players, generate brackets, report match results
- **Bilingual Support**: French and English (basic setup)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Authentication**: Session-based (bcrypt)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   TOURNAMENT_CODE=QUEBEC2025
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=changeme123
   SESSION_SECRET=your-secret-key-change-in-production
   DATABASE_PATH=./tournament.db
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Players

1. Navigate to `/register`
2. Fill in your details and the tournament code
3. View all registered players at `/players`
4. Check the tournament bracket at `/brackets`

### For Admins

1. Navigate to `/admin`
2. Login with admin credentials
3. Generate bracket when 20 players are registered
4. Report match results from the dashboard

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

**Note**: For production, consider using Vercel Postgres instead of SQLite for better persistence.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── brackets/          # Bracket display
│   ├── players/           # Player gallery
│   └── register/          # Registration form
├── components/            # React components
├── lib/                   # Utilities and core logic
│   ├── db.ts             # Database setup
│   ├── bracket.ts        # Bracket generation
│   ├── auth.ts           # Authentication
│   └── types.ts          # TypeScript types
├── i18n/                 # Internationalization
├── docs/plans/           # Design and implementation docs
└── scripts/              # Utility scripts
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TOURNAMENT_CODE` | Registration access code | `QUEBEC2025` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `changeme123` |
| `SESSION_SECRET` | Session signing secret | Random string |
| `DATABASE_PATH` | SQLite database path | `./tournament.db` |

## License

MIT

## Support

For issues or questions, contact the tournament organizer.

# Liga Basquet Admin

Liga Basquet Admin is the protected back-office dashboard for a women's basketball league. It provides authenticated administration for teams, players, matches, match statistics, league statistics, and news content. The interface is currently presented in Spanish.

## Implemented functionality

- Email/password sign-in with Supabase Auth, session handling, protected admin routes, and sign-out.
- Dashboard counters for teams, players, matches, and news.
- Team management with search, create, edit, delete, logo uploads, and team image uploads.
- Player management with search, create, edit, delete, player details, jersey numbers, and recent match statistics.
- Match management with search, create, edit, delete, matchdays, dates, venues, teams, scores, and match status.
- Match-statistics entry for active players, including player statistics and match score updates.
- League standings and player leader views for points, three-pointers, rebounds, assists, blocks, and fouls, with team filtering.
- News management with search, create, edit, delete, cover image uploads, publishing, and unpublishing.
- Responsive admin navigation plus loading, empty, error, and confirmation states.

## Technology

- React 19 and React DOM
- TypeScript
- Vite
- React Router
- Supabase JavaScript client, Auth, Database, and Storage
- Oxlint

## Requirements

- Node.js with npm
- A Supabase project with the database schema used by the application
- An `assets` Supabase Storage bucket for uploaded team and news images

## Installation and configuration

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root. Do not commit real credentials:

```env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

The application uses Supabase email/password authentication and reads and writes its league data through the configured Supabase project. Database policies, authentication users, schema, and Storage permissions must be configured in Supabase separately.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run lint` | Run Oxlint. |
| `npm run build` | Type-check the project and create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |

There is currently no automated test script in `package.json`.

## Project structure

```text
src/
├── features/
│   ├── admin/       # Dashboard shell, navigation, shared admin UI, and dashboard data
│   ├── auth/        # Login, session provider, and protected routes
│   ├── images/      # Image processing and Supabase Storage uploads
│   ├── matchStats/  # Per-match player statistics and score updates
│   ├── matches/     # Match management
│   ├── news/        # News management and publication state
│   ├── players/     # Player management and player details
│   ├── statistics/  # Standings and statistical leaders
│   └── teams/       # Team management
├── lib/             # Supabase client configuration
├── App.tsx          # Application routes
└── main.tsx         # Application entry point
public/              # Public favicon and static assets
index.html           # Vite HTML entry point
vercel.json          # SPA fallback rewrite for direct client-side routes
```

## Hosting

The repository includes `vercel.json`, which rewrites incoming requests to `/index.html` so that direct navigation to React Router routes works on Vercel. Configure the hosting project with the standard Vite build command and output directory:

- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

No deployment is performed by this repository's scripts.

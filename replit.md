# parcOS v1 - Spatial Cognitive Operating System

## Overview

parcOS is a web-native operating system that combines VisionOS-style spatial interfaces with HyperCard-inspired modularity and object-oriented programming principles. The system renders floating "cards" on an infinite canvas, where each card represents a distinct application or workspace (Sports, NIL tracking, Classroom, etc.). An AI assistant named BILL can generate new cards, analyze content, and connect data sources on demand.

**Core Technologies:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express.js + Node.js
- Database: PostgreSQL via Drizzle ORM
- State Management: Zustand
- UI Components: Radix UI + shadcn/ui
- Desktop: Electron (optional)
- AI Integration: BILL AI assistant for dynamic tool creation

The application follows a card-stack-workspace metaphor where everything is an object with a CMFK (Correctness, Misconception, Fog, Knowingness) cognitive vector that tracks learning state and system understanding.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:**
- **Canvas Engine**: Absolute-positioned draggable cards with z-index layering and focus management
- **Card System**: Each card is a self-contained React component rendered via an app registry pattern
- **Workspace Model**: Multiple isolated environments (SPORTS, NIL, CLASSROOM) that filter visible cards
- **Dock & System Bar**: macOS-style launcher and system controls
- **Cinema Mode**: Full-screen focused view for sports cards with side panel and timeline

**State Management (Zustand):**
- Global store manages cards, stacks, workspaces, highlights, and BILL overlay state
- Card positions persist in `lastCardPositions` for minimize/restore
- CMFK vectors track cognitive state for users and individual objects
- Workspace switching filters cards by `stackId` and `activeWorkspace`

**Application Registry:**
The system uses a centralized app registry pattern where card types map to React components:
- `sports-multiview`: Live sports dashboard with odds, highlights, and momentum tracking
- `nil-dashboard`: Name/Image/Likeness opportunity tracker
- `classroom-board`: Educational workspace with assignments and mastery tracking
- `generic-browser`: Embedded web browser view
- Additional apps: Creator Studio, System Tools (placeholders)

**Glassmorphism UI Design:**
- Backdrop blur and semi-transparent panels throughout
- VisionOS-inspired rounded corners (32px radius on cards)
- Focus states with glow shadows and ring borders
- Radix UI primitives for accessible components

### Backend Architecture

**Express.js Server:**
- RESTful API routes for highlights, game events, and workspace state
- Static file serving for production builds
- Development mode with Vite HMR integration
- Logging middleware for API request tracking

**Database Layer (Drizzle ORM):**
- PostgreSQL connection via `pg` driver
- Schema-first approach with TypeScript types generated from Drizzle schemas
- Storage abstraction layer (`IStorage` interface) for database operations
- Database migrations tracked in `migrations/` directory

**API Endpoints:**
- `GET/POST /api/highlights` - Fetch and create sports highlights
- `GET/POST /api/games` - Game event tracking
- `GET/POST /api/workspaces` - Persist workspace state per user
- All endpoints use Zod validation via `drizzle-zod` schemas

### Data Models

**Core Schema Tables:**
1. **users**: Authentication with username/password
2. **highlights**: Sports highlight events with CMFK scoring and momentum tracking
3. **gameEvents**: Live game state snapshots (scores, teams, league, status)
4. **workspaceStates**: Persisted card layouts per user/workspace

**CMFK Cognitive Vector:**
Every object in the system has four cognitive metrics (0-1 scale):
- **Correctness (C)**: How accurate/successful an action or state is
- **Misconception (M)**: Degree of error or unexpectedness
- **Fog (F)**: Uncertainty or volatility in the system
- **Knowingness (K)**: Confidence, mastery, or momentum

Used for sports momentum analysis, learning state tracking, and AI-driven insights.

### Sports Highlight Engine

**Real-time Analysis:**
- Monitors game state changes (scores, lead changes, runs)
- Calculates CMFK vectors for each play/event
- Generates highlights automatically based on momentum shifts
- Broadcasts highlights to UI via callback system

**Highlight Detection Logic:**
- Score changes: Track point differentials and scoring team
- Lead changes: Detect when the winning team switches
- Runs: Identify scoring streaks (3+ consecutive scores)
- Momentum reversals: CMFK-based shift detection
- Big plays: High-impact events with volatility spikes

**Data Flow:**
1. `sports-data.ts` fetches live game data (ESPN API with mock fallback)
2. `highlight-engine.ts` processes game state updates
3. CMFK scoring via `momentum-utils.ts`
4. Highlights stored in database and pushed to Zustand store
5. UI renders via `HighlightCard` and `HighlightTimeline` components

### Build System

**Development:**
- Vite dev server on port 5000 with HMR
- TypeScript compilation via `tsx` for server
- Concurrent client and server processes

**Production:**
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.cjs`
- Selective bundling of server dependencies (allowlist for frequently-used modules)
- Static file serving from Express

**Electron Integration:**
- Optional desktop wrapper with native window chrome
- Hidden inset title bar with traffic lights
- Vibrancy effects on macOS
- Preload script for IPC bridge

## External Dependencies

**UI & Styling:**
- Tailwind CSS v4 with custom theme (glassmorphism variables)
- Radix UI primitives for accessible components
- shadcn/ui component library (New York style)
- Lucide React icons
- Framer Motion for animations
- Custom fonts: Inter (body), JetBrains Mono (code/monospace)

**Backend Services:**
- PostgreSQL database (required via `DATABASE_URL` env var)
- Drizzle Kit for schema migrations
- Express sessions with `connect-pg-simple` for Postgres-backed sessions
- ESPN API for live sports data (with mock fallback)

**Development Tools:**
- Replit-specific plugins: runtime error modal, cartographer, dev banner
- Custom Vite plugin for OpenGraph meta image updates
- TypeScript with strict mode and path aliases

**Key NPM Packages:**
- `@tanstack/react-query` - Server state management
- `zod` + `drizzle-zod` - Runtime validation and schema generation
- `nanoid` - Unique ID generation for cards/stacks
- `date-fns` - Date manipulation for timestamps
- `class-variance-authority` + `clsx` - Utility-first styling

**AI/Future Integrations:**
- BILL AI assistant (placeholder for tool generation)
- Potential OpenAI/Google AI integration for highlight narration
- Automated card creation based on natural language commands
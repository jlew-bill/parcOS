# parcRI Ecosystem v1 - PARC Real Intelligence

## Overview

The parcRI ecosystem is a unified platform powered by the parcRI cognitive engine. The system consists of multiple interconnected applications under the PARC brand, all accessible through different subdomains of parcri.net.

**Core Brand:**
- Company: PARC
- Engine: parcRI (case-sensitive)
- OS Name: HyperBar OS
- Tagline: "The world's first state-based cognitive OS"

## Ecosystem Applications

1. **HyperBar OS** (station.parcri.net)
   - Primary user workspace environment
   - Spatial cognitive interface with card-stack-workspace metaphor
   - Deployed at: parcmains.replit.app

2. **Spotlight NIL** (mynil.parcri.net)
   - Athlete monetization and NIL tracking
   - Active and deployed
   - Deployed at: my-nil-jkhv99cmyb.replit.app

3. **CreatorFlow** (creator.parcri.net)
   - Creator tools suite for content creation
   - Status: Reserved (placeholder to parcmains.replit.app)

4. **parcBoard** (board.parcri.net)
   - Admin dashboard and analytics platform
   - Status: Reserved (placeholder to parcmains.replit.app)

5. **parcRI Engine** (api.parcri.net)
   - Backend cognitive meaning engine and vector system
   - Status: Reserved

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Deployment

**Landing Site (Root Application)**
- URL: parcmains.replit.app
- Routes:
  - `/` → Landing page (PARC Real Intelligence marketing)
  - `/app` → HyperBar OS main interface
  - `/nil` → Redirect to mynil.parcri.net
  - `/creator` → Redirect to creator.parcri.net
  - `/board` → Redirect to board.parcri.net

**Technology Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express.js + Node.js
- Database: PostgreSQL via Drizzle ORM
- State Management: Zustand
- UI Components: Radix UI + shadcn/ui
- Language: ParcTalk (custom DSL for the system)
- AI Integration: BILL AI assistant

## Branding & Identity

- All applications share: "Powered by parcRI"
- Unified visual language across ecosystem
- PARC Real Intelligence is the public-facing name
- parcRI is the underlying cognitive engine (do not alter)

## Monetization

**Early Access Pass:**
- Product: PARCOS Early Access Pass
- Price: $0.99 USD
- Status: Enabled
- Stripe Link: To be configured (placeholder: https://buy.stripe.com/REPLACE_ME)

## Key Files

- `parcRI-ecosystem.yml` - Ecosystem configuration and domain mapping
- `replit.md` - This file (project documentation)
- `/client/src/pages/Landing.tsx` - Landing page component
- `/client/src/App.tsx` - Main app routing
- `/client/index.html` - HTML template with meta tags

## Next Steps

1. Configure Stripe payment link for Early Access Pass
2. Set up subdomain routing at parcri.net DNS level
3. Deploy applications to respective subdomains
4. Configure authentication system across ecosystem

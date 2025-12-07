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
  - `/pricing` → Pricing page with all tiers and Stripe integration
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
- Payment: Stripe + stripe-replit-sync
- Language: ParcTalk (custom DSL for the system)
- AI Integration: BILL AI assistant

## Monetization & Pricing

**Pricing Tiers (see config/stripe.auto.json):**

| Tier | Price | Billing | Stripe Link |
|------|-------|---------|------------|
| Early Access Pass | $0.99 | One-time | buy.stripe.com/test_4gM00j98qdLw5mA6bD9ws00 |
| Athlete Pro | $4.99 | Monthly | buy.stripe.com/test_8x26oHesK9vg16k43v9ws01 |
| CreatorFlow Pro | $9.99 | Monthly | buy.stripe.com/test_bJefZh5We22O16k7fH9ws02 |
| Coach/Team Suite | $29 | Monthly | buy.stripe.com/test_bJedR970icHsg1e57z9ws03 |
| District Suite | $299 | Monthly | buy.stripe.com/test_dRm6oHfwO6j49CQ43v9ws04 |

**Monetization Status:**
- ✅ Stripe products/prices created
- ✅ Payment links configured
- ✅ Pricing page built (responsive, Apple-style)
- ✅ User menu with subscription status
- ✅ Premium badges on dock items (NIL, Creator)
- ✅ Feature gating components ready
- ✅ Upsell banners for NIL/CreatorFlow

## Landing Page Structure

**Hero Section:**
- Badge: "NEW • PARCOS v1"
- Headline: "PARC Real Intelligence"
- Tagline: "The world's first state-based cognitive OS..."
- Primary CTA: "Enter App" → /app
- Secondary CTA: "Get Early Access — $0.99" → Stripe payment link
- Navigation: Pricing, myNIL, parcStation, parcBoard, CreatorFlow

**Preview Strip Section:**
- Headline: "A new kind of operating system."
- Subtext: "Built on meaning. Powered by parcRI."
- Preview frame with HyperBar OS image (/preview/hyperbar.png)
- Note: "This is an early preview. Your experience will update automatically."

**Feature Gallery Section:**
- 6 preview cards with feature labels
- "Explore Full Interface" CTA

## Component Architecture

**Monetization Components:**
1. `UserMenu.tsx` - Subscription status + upgrade access in system bar
2. `MonetizationGate.tsx` - Feature gating wrapper + upsell banners
3. `Pricing.tsx` - Full pricing page with Stripe integration
4. `Dock.tsx` - Premium badges on NIL/Creator apps

**Integration Points:**
- SystemBar: User menu with upgrade button
- Dock: Premium badges on premium apps
- Pricing page: Direct Stripe payment links
- Future: Feature gating in NIL/Creator apps

## Branding & Identity

- All applications share: "Powered by parcRI"
- Unified visual language across ecosystem
- PARC Real Intelligence is the public-facing name
- parcRI is the underlying cognitive engine (do not alter)
- Premium tier includes Zap icon (⚡) visual indicator

## Key Files

- `config/stripe.auto.json` - Stripe product/price/link mappings
- `pricing.yml` - Pricing source of truth
- `client/src/pages/Pricing.tsx` - Pricing page component
- `client/src/pages/Landing.tsx` - Landing page with Pricing link
- `client/src/components/UserMenu.tsx` - User dropdown menu
- `client/src/components/MonetizationGate.tsx` - Feature gating components
- `client/src/components/SystemBar.tsx` - System bar with user menu
- `client/src/components/Dock.tsx` - Dock with premium badges
- `MONETIZATION_INTEGRATION.md` - Complete integration guide

## Next Steps

1. **Implement Authentication**
   - User sign-up/login
   - Session management
   - Subscription tracking

2. **Feature Gating**
   - Connect MonetizationGate to real user subscription data
   - Enforce usage limits per tier
   - Display tier-appropriate features

3. **Webhook Integration**
   - Handle Stripe payment events
   - Update user subscription status
   - Process refunds/cancellations

4. **Analytics**
   - Track tier conversions
   - Monitor feature usage
   - Revenue dashboards

## Recent Changes (Dec 2025)

### Completed Tasks:
1. ✅ Created Stripe products/prices from pricing.yml
2. ✅ Generated Stripe payment links
3. ✅ Built responsive Pricing page
4. ✅ Integrated Pricing into Landing page
5. ✅ Created UserMenu with subscription status
6. ✅ Added MonetizationGate component for feature gating
7. ✅ Added premium badges to dock items
8. ✅ Created upsell banners for NIL/Creator
9. ✅ Updated documentation

### Architecture Decisions:
- Stripe as primary payment processor
- PostgreSQL for subscription tracking
- Reusable MonetizationGate component for feature gating
- Premium badges as visual tier indicators
- Direct Stripe payment links for friction-free checkout


# LuxTerminal — Design Specification

**Date:** 2026-04-14
**Status:** Approved
**Version:** 1.0

---

## 1. Concept & Vision

**Name:** LuxTerminal — a luxury trading terminal that prioritizes aesthetic excellence alongside financial analytics capability.

**One-line pitch:** "The Bloomberg terminal reimagined through a luxury design lens — where financial data becomes an elegant experience."

**Core promise:** Live market data presented with the visual refinement of a premium consumer product, not a 1990s trading desk.

**Signature differentiator:** Exceptional UI/visual design — the luxury aesthetic itself is the primary differentiator from existing solutions.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React + TypeScript | Industry standard, excellent charting ecosystem |
| Backend | Python/Flask + Pandas | Existing code reuse; Pandas excels at financial calculations |
| Database | PostgreSQL + Prisma | Professional relational DB; type-safe queries |
| Auth | NextAuth.js (OAuth + Credentials) | Industry standard; handles both auth flows |
| Real-time | Direct Binance WebSocket | Lowest latency for price data |
| Charts | TradingView lightweight-charts | Gold standard for financial charts |
| State | Zustand | Lightweight, performant state for high-frequency updates |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         React Frontend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  LuxCharts  │  │ Watchlist   │  │  Portfolio Panel    │  │
│  │  (TV libs)  │  │  Manager    │  │  (holdings + P&L)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         └────────────────┼────────────────────┘              │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │    Zustand Store     │                       │
│              │   (price data,       │                       │
│              │    user session)      │                       │
│              └───────────┬───────────┘                       │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ REST API (auth, portfolio)
                    ┌──────▼──────┐
                    │ Flask API   │ ◄── PostgreSQL/Prisma
                    │ /auth,      │
                    │ /portfolio  │
                    │ /watchlist  │
                    └──────┬──────┘
                           │
              WebSocket ────┼────── Binance
                    wss://stream.binance.com
```

**Key architectural decisions:**
- Frontend connects **directly** to Binance WebSocket for price data (bypasses Flask for latency)
- Flask handles **only** user data: auth, watchlists, portfolio holdings
- Zustand for high-frequency price update state (React Context would cause unnecessary re-renders)

---

## 4. Design Language

### Aesthetic Direction
**Glass morphism meets financial precision** — frosted glass panels floating over a deep charcoal background, with champagne gold accents and muted teal/rose for financial indicators.

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Deep Charcoal | `#0D0F14` | Main app background |
| Surface | Frosted Glass | `rgba(255,255,255,0.05)` | Panel backgrounds |
| Border | Subtle Glow | `rgba(255,255,255,0.08)` | Panel borders |
| Text Primary | Off-White | `#E8E9EB` | Headlines, values |
| Text Secondary | Muted Gray | `#6B7280` | Labels, captions |
| Accent Primary | Champagne Gold | `#D4AF37` | CTAs, highlights |
| Accent Secondary | Rose Gold | `#E8B4B8` | Secondary accents |
| Positive | Muted Teal | `#50C878` | Gains, up ticks |
| Negative | Dusty Rose | `#E57373` | Losses, down ticks |

### Typography

| Element | Font | Weight | Notes |
|---------|------|--------|-------|
| Headlines | Inter | 700 | Clean, premium sans-serif |
| Data/Numbers | JetBrains Mono | 500 | Monospace for alignment |
| Body | Inter | 400 | Readable at small sizes |

### Spatial System

- Base unit: 4px
- Panel padding: 24px (6 units)
- Panel gap: 16px (4 units)
- Border radius: 16px (panels), 8px (buttons), 4px (inputs)

### Motion Philosophy

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Panel transitions | 300ms | ease-out |
| Hover states | 150ms | ease |
| Price tick flash | 200ms | fade |
| Layout switch | 400ms | ease-out (staggered) |

### Visual Effects

- **Backdrop blur:** 20px on glass panels
- **Box shadows:** Subtle colored tints (e.g., `0 8px 32px rgba(212, 175, 55, 0.1)`)
- **Gradient overlays:** Subtle vertical gradients for depth on panels
- **Border glow:** Accent color glow on focus/hover states

---

## 5. Preset Layouts

4 curated configurations, persisted per user:

| Layout | Best For | Composition |
|--------|----------|-------------|
| **Focus** | Deep chart analysis | Main chart (80%) + minimal ticker strip |
| **Balanced** | General monitoring | Chart (60%) + Watchlist (20%) + Portfolio (20%) |
| **Data Dense** | Active trading | Chart (50%) + Order Book (25%) + Watchlist + Portfolio |
| **Portfolio** | Position monitoring | Chart (40%) + Portfolio Panel (35%) + Watchlist (25%) |

---

## 6. Core Features

### A) Authentication
- Email + password registration/login
- Google OAuth
- Protected routes
- Session persistence
- User-specific data isolation

### B) Live Price Chart
- TradingView lightweight-charts integration
- Candlestick + volume by default
- Timeframe selector: 1m, 5m, 15m, 1H, 4H, 1D
- Crosshair with price/time tooltip
- Price line showing current price

### C) Watchlist
- User-created list of symbols
- Real-time price + 24h change per symbol
- Click symbol to load in main chart
- Add/remove symbols
- Persisted to database per user

### D) Portfolio Panel
- Holdings list: symbol, quantity, avg cost, current value, P&L ($), P&L (%)
- Summary: total value, total cost, total P&L, daily change
- Add holding: symbol, quantity, average cost
- Edit/remove holding
- Cost-basis P&L calculation only

---

## 7. API Design

### Auth (NextAuth.js)
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/session`

### Portfolio (Flask)
```
GET    /api/portfolio          → Get user's holdings
POST   /api/portfolio          → Add holding { symbol, quantity, avgCost }
PUT    /api/portfolio/:id     → Update holding
DELETE /api/portfolio/:id     → Remove holding
```

### Watchlist (Flask)
```
GET    /api/watchlist          → Get user's watchlist
POST   /api/watchlist          → Add symbol { symbol }
DELETE /api/watchlist/:symbol  → Remove symbol
```

### Response Shapes

**GET /api/portfolio**
```json
{
  "holdings": [
    {
      "id": "uuid",
      "symbol": "BTCUSDT",
      "quantity": 0.5,
      "avgCost": 42000.00,
      "currentPrice": 67500.00,
      "currentValue": 33750.00,
      "pnl": 12750.00,
      "pnlPercent": 60.71
    }
  ],
  "summary": {
    "totalValue": 33750.00,
    "totalCost": 21000.00,
    "totalPnl": 12750.00,
    "totalPnlPercent": 60.71
  }
}
```

---

## 8. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  createdAt     DateTime  @default(now())
  holdings      Holding[]
  watchlist     Watchlist[]
  accounts      Account[]
  sessions      Session[]
}

model Holding {
  id        String   @id @default(uuid())
  userId    String
  symbol    String
  quantity  Float
  avgCost   Float
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Watchlist {
  id        String   @id @default(uuid())
  userId    String
  symbol    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, symbol])
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id])

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
}

model VerificationToken {
  identifier String
  token     String   @unique
  expires   DateTime

  @@unique([identifier, token])
}
```

---

## 9. MVP Scope

### Included
- Email/password + Google OAuth authentication
- 4 preset dashboard layouts
- Live candlestick chart (Binance WebSocket)
- Watchlist (add/remove symbols, persists)
- Portfolio (add/edit/remove holdings, cost-basis P&L)
- High-end luxury aesthetic (glass morphism, gold accents)

### Deferred
- Order book visualization
- Price alerts
- More chart indicators/overlays
- Multi-exchange support
- Export/import portfolio

---

## 10. File Structure

```
datalens/
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt    # Python deps
│   └── prisma/
│       └── schema.prisma   # Database schema
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Chart/
│   │   │   ├── Watchlist/
│   │   │   └── Portfolio/
│   │   ├── hooks/
│   │   │   └── useBinanceWebSocket.ts
│   │   ├── stores/
│   │   │   └── priceStore.ts
│   │   └── styles/
│   │       └── globals.css
│   └── package.json
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-14-luxterminal-design.md
└── README.md
```

---

## 11. Implementation Priority

1. **Project setup** — React + TypeScript + Vite, Flask skeleton, Prisma schema
2. **Auth** — NextAuth.js integration with credentials + Google OAuth
3. **Database** — PostgreSQL + Prisma migrations, user model
4. **Portfolio API** — CRUD endpoints for holdings
5. **Watchlist API** — CRUD endpoints for watchlist
6. **WebSocket hook** — Binance connection, price state
7. **Chart component** — TradingView lightweight-charts integration
8. **Portfolio panel** — Holdings display with live P&L
9. **Watchlist panel** — Symbol list with live prices
10. **Layout system** — 4 preset layouts, persistence
11. **Aesthetic polish** — Glass morphism, typography, animations

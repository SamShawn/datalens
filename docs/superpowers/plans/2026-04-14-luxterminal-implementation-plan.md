# LuxTerminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a luxury trading terminal with live Binance data, user auth, watchlists, and portfolio tracking.

**Architecture:** React frontend with direct Binance WebSocket for price data, Flask backend for user data (auth, portfolio, watchlist), PostgreSQL/Prisma for persistence, NextAuth.js for authentication.

**Tech Stack:** React + TypeScript + Vite, Python Flask + Pandas, PostgreSQL + Prisma, NextAuth.js, TradingView lightweight-charts, Zustand, Binance WebSocket

---

## Phase 1: Project Foundation

### Task 1: Create React + TypeScript + Vite Project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/vite-env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "luxterminal-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lightweight-charts": "^4.2.0",
    "zustand": "^4.5.0",
    "next-auth": "^5.0.0-beta.22",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LuxTerminal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: Create App.tsx**

```typescript
function App() {
  return (
    <div className="app">
      <h1>LuxTerminal</h1>
    </div>
  )
}

export default App
```

- [ ] **Step 7: Create globals.css**

```css
:root {
  --color-bg: #0D0F14;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text: #E8E9EB;
  --color-text-secondary: #6B7280;
  --color-accent: #D4AF37;
  --color-accent-secondary: #E8B4B8;
  --color-positive: #50C878;
  --color-negative: #E57373;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}
```

- [ ] **Step 8: Install dependencies**

Run: `cd frontend && npm install`
Expected: Packages installed successfully

- [ ] **Step 9: Test dev server**

Run: `cd frontend && npm run dev`
Expected: Dev server starts on port 3000

- [ ] **Step 10: Commit**

```bash
git add frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html frontend/src
git commit -m "feat: scaffold React + TypeScript + Vite frontend

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Set Up Flask Backend with Prisma

**Files:**
- Create: `backend/app.py`
- Create: `backend/requirements.txt`
- Create: `backend/prisma/schema.prisma`

- [ ] **Step 1: Create backend/requirements.txt**

```
flask==3.0.3
flask-cors==4.0.1
pandas==2.2.2
prisma==0.13.1
python-dotenv==1.0.1
bcrypt==4.2.0
PyJWT==2.9.0
```

- [ ] **Step 2: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

- [ ] **Step 3: Create Flask app.py skeleton**

```python
from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
```

- [ ] **Step 4: Test Flask server**

Run: `cd backend && pip install -r requirements.txt && python app.py`
Expected: Flask server starts on port 5002

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/app.py backend/prisma/schema.prisma
git commit -m "feat: scaffold Flask backend with Prisma schema

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Set Up PostgreSQL and Initialize Database

**Files:**
- Modify: `backend/.env`

- [ ] **Step 1: Create .env file**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/luxterminal"
```

- [ ] **Step 2: Initialize Prisma client**

Run: `cd backend && npx prisma generate`
Expected: Prisma client generated

- [ ] **Step 3: Run initial migration**

Run: `cd backend && npx prisma migrate dev --name init`
Expected: Migration applied, tables created

- [ ] **Step 4: Commit**

```bash
git add backend/.env backend/prisma/migrations
git commit -m "feat: initialize PostgreSQL database with Prisma

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Authentication

### Task 4: Implement NextAuth.js

**Files:**
- Create: `frontend/src/lib/auth.ts`
- Create: `frontend/src/components/AuthProvider.tsx`
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Install NextAuth.js**

Run: `cd frontend && npm install next-auth@beta`
Expected: next-auth installed

- [ ] **Step 2: Create auth configuration**

```typescript
// frontend/src/lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        // Call Flask API for auth
        const res = await fetch('http://localhost:5002/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        })
        if (!res.ok) return null
        const user = await res.json()
        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  }
})
```

- [ ] **Step 3: Create AuthProvider**

```typescript
// frontend/src/components/AuthProvider.tsx
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}
```

- [ ] **Step 4: Update App.tsx with auth routing**

```typescript
import { AuthProvider } from './components/AuthProvider'
import { useSession } from 'next-auth/react'

function App() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="loading">Loading...</div>
  }

  return (
    <AuthProvider>
      <div className="app">
        {/* Routes will be added here */}
      </div>
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/auth.ts frontend/src/components/AuthProvider.tsx frontend/src/App.tsx
git commit -m "feat: add NextAuth.js configuration with credentials + Google OAuth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Build Flask Auth Endpoints

**Files:**
- Modify: `backend/app.py`

- [ ] **Step 1: Add user registration endpoint**

```python
import bcrypt
import jwt
from datetime import datetime, timedelta
from prisma import Prisma

db = Prisma()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return {'error': 'Email and password required'}, 400

    # Check if user exists
    existing = db.user.find_unique(where={'email': email})
    if existing:
        return {'error': 'Email already registered'}, 400

    # Hash password
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Create user
    user = db.user.create(
        data={
            'email': email,
            'password_hash': password_hash,
            'name': name
        }
    )

    # Generate JWT
    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        },
        os.getenv('JWT_SECRET', 'dev-secret'),
        algorithm='HS256'
    )

    return {
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        },
        'token': token
    }
```

- [ ] **Step 2: Add login endpoint**

```python
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = db.user.find_unique(where={'email': email})
    if not user or not user.password_hash:
        return {'error': 'Invalid credentials'}, 401

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return {'error': 'Invalid credentials'}, 401

    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        },
        os.getenv('JWT_SECRET', 'dev-secret'),
        algorithm='HS256'
    )

    return {
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        },
        'token': token
    }
```

- [ ] **Step 3: Add middleware to connect/disconnect Prisma**

```python
@app.before_request
def before_request():
    if not db.is_connected:
        db.connect()

@app.teardown_request
def after_request():
    pass  # Keep connection alive for reuse
```

- [ ] **Step 4: Test auth endpoints**

Run: `curl -X POST http://localhost:5002/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123","name":"Test User"}'`
Expected: Returns user and token

- [ ] **Step 5: Commit**

```bash
git add backend/app.py
git commit -m "feat: add Flask auth endpoints (register/login) with JWT

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: Data Layer — Portfolio & Watchlist APIs

### Task 6: Portfolio CRUD Endpoints

**Files:**
- Modify: `backend/app.py`

- [ ] **Step 1: Add auth middleware decorator**

```python
from functools import wraps
import jwt

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return {'error': 'Unauthorized'}, 401
        try:
            payload = jwt.decode(token, os.getenv('JWT_SECRET', 'dev-secret'), algorithms=['HS256'])
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return {'error': 'Token expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
        return f(*args, **kwargs)
    return decorated
```

- [ ] **Step 2: Add portfolio endpoints**

```python
@app.route('/api/portfolio', methods=['GET'])
@require_auth
def get_portfolio():
    holdings = db.holding.find_many(where={'user_id': request.user_id})
    return {'holdings': holdings}

@app.route('/api/portfolio', methods=['POST'])
@require_auth
def add_holding():
    data = request.json
    holding = db.holding.create(
        data={
            'user_id': request.user_id,
            'symbol': data['symbol'].upper(),
            'quantity': float(data['quantity']),
            'avg_cost': float(data['avgCost'])
        }
    )
    return {'holding': holding}

@app.route('/api/portfolio/<holding_id>', methods=['PUT'])
@require_auth
def update_holding(holding_id):
    data = request.json
    holding = db.holding.update(
        where={'id': holding_id, 'user_id': request.user_id},
        data={
            'quantity': float(data.get('quantity')),
            'avg_cost': float(data.get('avgCost'))
        }
    )
    return {'holding': holding}

@app.route('/api/portfolio/<holding_id>', methods=['DELETE'])
@require_auth
def delete_holding(holding_id):
    db.holding.delete(where={'id': holding_id, 'user_id': request.user_id})
    return {'success': True}
```

- [ ] **Step 3: Test portfolio endpoints**

```bash
# Register a user first, get token
TOKEN="your_token_here"

# Add holding
curl -X POST http://localhost:5002/api/portfolio \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","quantity":0.5,"avgCost":42000}'

# Get portfolio
curl http://localhost:5002/api/portfolio -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 4: Commit**

```bash
git add backend/app.py
git commit -m "feat: add portfolio CRUD endpoints with auth middleware

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Watchlist CRUD Endpoints

**Files:**
- Modify: `backend/app.py`

- [ ] **Step 1: Add watchlist endpoints**

```python
@app.route('/api/watchlist', methods=['GET'])
@require_auth
def get_watchlist():
    items = db.watchlist.find_many(where={'user_id': request.user_id})
    return {'watchlist': [w.symbol for w in items]}

@app.route('/api/watchlist', methods=['POST'])
@require_auth
def add_to_watchlist():
    data = request.json
    symbol = data['symbol'].upper()
    try:
        item = db.watchlist.create(
            data={'user_id': request.user_id, 'symbol': symbol}
        )
        return {'watchlist': item}, 201
    except Exception:
        return {'error': 'Symbol already in watchlist'}, 400

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
@require_auth
def remove_from_watchlist(symbol):
    db.watchlist.delete_many(
        where={'user_id': request.user_id, 'symbol': symbol.upper()}
    )
    return {'success': True}
```

- [ ] **Step 2: Test watchlist endpoints**

```bash
TOKEN="your_token_here"

# Add symbol
curl -X POST http://localhost:5002/api/watchlist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT"}'

# Get watchlist
curl http://localhost:5002/api/watchlist -H "Authorization: Bearer $TOKEN"
```

- [ ] **Step 3: Commit**

```bash
git add backend/app.py
git commit -m "feat: add watchlist CRUD endpoints

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: Frontend Core — WebSocket & Chart

### Task 8: Binance WebSocket Hook

**Files:**
- Create: `frontend/src/hooks/useBinanceWebSocket.ts`
- Create: `frontend/src/stores/priceStore.ts`

- [ ] **Step 1: Create Zustand price store**

```typescript
// frontend/src/stores/priceStore.ts
import { create } from 'zustand'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
}

interface PriceStore {
  prices: Record<string, PriceData>
  setPrice: (symbol: string, data: PriceData) => void
  getPrice: (symbol: string) => PriceData | undefined
}

export const usePriceStore = create<PriceStore>((set, get) => ({
  prices: {},
  setPrice: (symbol, data) =>
    set((state) => ({
      prices: { ...state.prices, [symbol]: data }
    })),
  getPrice: (symbol) => get().prices[symbol]
}))
```

- [ ] **Step 2: Create WebSocket hook**

```typescript
// frontend/src/hooks/useBinanceWebSocket.ts
import { useEffect, useRef } from 'react'
import { usePriceStore } from '../stores/priceStore'

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'

interface UseBinanceWebSocketOptions {
  symbols: string[]
  onOpen?: () => void
  onClose?: () => void
}

export function useBinanceWebSocket({ symbols, onOpen, onClose }: UseBinanceWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number>()
  const setPrice = usePriceStore((state) => state.setPrice)

  useEffect(() => {
    if (symbols.length === 0) return

    function connect() {
      const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/')
      const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`)
      wsRef.current = ws

      ws.onopen = () => {
        onOpen?.()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.e === '24hrTicker') {
          setPrice(data.s, {
            symbol: data.s,
            price: parseFloat(data.c),
            change24h: parseFloat(data.p),
            changePercent24h: parseFloat(data.P),
            high24h: parseFloat(data.h),
            low24h: parseFloat(data.l),
            volume24h: parseFloat(data.v)
          })
        }
      }

      ws.onclose = () => {
        onClose?.()
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [symbols.join(',')]) // Reconnect when symbols change
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useBinanceWebSocket.ts frontend/src/stores/priceStore.ts
git commit -m "feat: add Binance WebSocket hook with Zustand price store

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: TradingView Chart Component

**Files:**
- Create: `frontend/src/components/Chart/LuxChart.tsx`
- Create: `frontend/src/components/Chart/TimeframeSelector.tsx`

- [ ] **Step 1: Create LuxChart component**

```tsx
// frontend/src/components/Chart/LuxChart.tsx
import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'

interface LuxChartProps {
  symbol: string
  interval?: string
}

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d'
}

export function LuxChart({ symbol, interval = '1h' }: LuxChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#6B7280'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' }
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#D4AF37', width: 1, style: 2 },
        horzLine: { color: '#D4AF37', width: 1, style: 2 }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true
      }
    })

    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#50C878',
      downColor: '#E57373',
      borderUpColor: '#50C878',
      borderDownColor: '#E57373',
      wickUpColor: '#50C878',
      wickDownColor: '#E57373'
    })
    candleSeriesRef.current = candleSeries

    const volumeSeries = chart.addHistogramSeries({
      color: '#D4AF37',
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    })
    volumeSeriesRef.current = volumeSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        })
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Fetch and load data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return

    setLoading(true)
    const binanceInterval = INTERVAL_MAP[interval] || '1h'

    fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=500`
    )
      .then((res) => res.json())
      .then((data) => {
        const candleData: CandlestickData<Time>[] = data.map((k: any[]) => ({
          time: (k[0] / 1000) as Time,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4])
        }))

        const volumeData = data.map((k: any[]) => ({
          time: (k[0] / 1000) as Time,
          value: parseFloat(k[5]),
          color: parseFloat(k[4]) >= parseFloat(k[1]) ? '#50C878' : '#E57373'
        }))

        candleSeriesRef.current?.setData(candleData)
        volumeSeriesRef.current?.setData(volumeData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load chart data:', err)
        setLoading(false)
      })
  }, [symbol, interval])

  return (
    <div className="lux-chart">
      {loading && <div className="chart-loading">Loading...</div>}
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  )
}
```

- [ ] **Step 2: Create TimeframeSelector**

```tsx
// frontend/src/components/Chart/TimeframeSelector.tsx
interface TimeframeSelectorProps {
  value: string
  onChange: (tf: string) => void
}

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' }
]

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="timeframe-selector">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          className={`tf-btn ${value === tf.value ? 'active' : ''}`}
          onClick={() => onChange(tf.value)}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Add chart styles**

```css
.lux-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-secondary);
}

.timeframe-selector {
  display: flex;
  gap: 4px;
}

.tf-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
}

.tf-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.tf-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Chart/LuxChart.tsx frontend/src/components/Chart/TimeframeSelector.tsx
git commit -m "feat: add TradingView LuxChart component with candlestick + volume

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 5: UI Panels

### Task 10: Watchlist Panel

**Files:**
- Create: `frontend/src/components/Watchlist/WatchlistPanel.tsx`
- Create: `frontend/src/components/Watchlist/WatchlistItem.tsx`

- [ ] **Step 1: Create WatchlistItem component**

```tsx
// frontend/src/components/Watchlist/WatchlistItem.tsx
import { usePriceStore } from '../../stores/priceStore'

interface WatchlistItemProps {
  symbol: string
  onClick: () => void
  isActive?: boolean
}

export function WatchlistItem({ symbol, onClick, isActive }: WatchlistItemProps) {
  const priceData = usePriceStore((state) => state.prices[symbol])

  if (!priceData) {
    return (
      <div className="watchlist-item" onClick={onClick}>
        <span className="symbol">{symbol}</span>
        <span className="price">--</span>
      </div>
    )
  }

  const isPositive = priceData.changePercent24h >= 0

  return (
    <div className={`watchlist-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="symbol">{symbol}</span>
      <div className="price-info">
        <span className="price">${priceData.price.toLocaleString()}</span>
        <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create WatchlistPanel with add/remove**

```tsx
// frontend/src/components/Watchlist/WatchlistPanel.tsx
import { useState, useEffect } from 'react'
import { WatchlistItem } from './WatchlistItem'
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket'
import axios from 'axios'

interface WatchlistPanelProps {
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
}

export function WatchlistPanel({ selectedSymbol, onSelectSymbol }: WatchlistPanelProps) {
  const [symbols, setSymbols] = useState<string[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [loading, setLoading] = useState(true)

  useBinanceWebSocket({ symbols })

  useEffect(() => {
    fetchWatchlist()
  }, [])

  async function fetchWatchlist() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSymbols(res.data.watchlist)
    } catch (err) {
      console.error('Failed to fetch watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addSymbol() {
    if (!newSymbol.trim()) return
    const symbol = newSymbol.trim().toUpperCase()
    if (symbols.includes(symbol)) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/watchlist',
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSymbols([...symbols, symbol])
      setNewSymbol('')
    } catch (err) {
      console.error('Failed to add symbol:', err)
    }
  }

  async function removeSymbol(symbol: string) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/watchlist/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSymbols(symbols.filter((s) => s !== symbol))
    } catch (err) {
      console.error('Failed to remove symbol:', err)
    }
  }

  return (
    <div className="watchlist-panel">
      <div className="panel-header">
        <h3>Watchlist</h3>
      </div>

      <div className="watchlist-add">
        <input
          type="text"
          placeholder="Add symbol..."
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
        />
        <button onClick={addSymbol}>+</button>
      </div>

      <div className="watchlist-items">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : symbols.length === 0 ? (
          <div className="empty">No symbols in watchlist</div>
        ) : (
          symbols.map((symbol) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              onClick={() => onSelectSymbol(symbol)}
              isActive={symbol === selectedSymbol}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add watchlist styles**

```css
.watchlist-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.watchlist-add {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.watchlist-add input {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 14px;
}

.watchlist-add input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.watchlist-add button {
  padding: 8px 16px;
  background: var(--color-accent);
  border: none;
  border-radius: 4px;
  color: var(--color-bg);
  font-weight: 600;
  cursor: pointer;
}

.watchlist-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.watchlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease;
}

.watchlist-item:hover {
  background: var(--color-surface);
}

.watchlist-item.active {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--color-accent);
}

.watchlist-item .symbol {
  font-family: var(--font-mono);
  font-weight: 500;
}

.watchlist-item .price-info {
  text-align: right;
}

.watchlist-item .price {
  display: block;
  font-family: var(--font-mono);
  font-size: 14px;
}

.watchlist-item .change {
  font-size: 12px;
}

.watchlist-item .change.positive {
  color: var(--color-positive);
}

.watchlist-item .change.negative {
  color: var(--color-negative);
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Watchlist/WatchlistPanel.tsx frontend/src/components/Watchlist/WatchlistItem.tsx
git commit -m "feat: add watchlist panel with live prices and add/remove

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 11: Portfolio Panel

**Files:**
- Create: `frontend/src/components/Portfolio/PortfolioPanel.tsx`
- Create: `frontend/src/components/Portfolio/HoldingRow.tsx`
- Create: `frontend/src/components/Portfolio/AddHoldingModal.tsx`

- [ ] **Step 1: Create HoldingRow component**

```tsx
// frontend/src/components/Portfolio/HoldingRow.tsx
import { usePriceStore } from '../../stores/priceStore'

interface HoldingRowProps {
  holding: {
    id: string
    symbol: string
    quantity: number
    avgCost: number
  }
  onEdit: () => void
  onDelete: () => void
}

export function HoldingRow({ holding, onEdit, onDelete }: HoldingRowProps) {
  const priceData = usePriceStore((state) => state.prices[holding.symbol])
  const currentPrice = priceData?.price || 0
  const currentValue = currentPrice * holding.quantity
  const costBasis = holding.avgCost * holding.quantity
  const pnl = currentValue - costBasis
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0
  const isPositive = pnl >= 0

  return (
    <div className="holding-row">
      <div className="holding-main">
        <span className="symbol">{holding.symbol}</span>
        <span className="quantity">{holding.quantity}</span>
      </div>
      <div className="holding-values">
        <div className="value-row">
          <span className="label">Value</span>
          <span className="value">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="value-row">
          <span className="label">P&L</span>
          <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
      <div className="holding-actions">
        <button onClick={onEdit} className="edit-btn">Edit</button>
        <button onClick={onDelete} className="delete-btn">×</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create AddHoldingModal**

```tsx
// frontend/src/components/Portfolio/AddHoldingModal.tsx
import { useState } from 'react'

interface AddHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { symbol: string; quantity: number; avgCost: number }) => void
  initialData?: { symbol: string; quantity: number; avgCost: number }
}

export function AddHoldingModal({ isOpen, onClose, onAdd, initialData }: AddHoldingModalProps) {
  const [symbol, setSymbol] = useState(initialData?.symbol || '')
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '')
  const [avgCost, setAvgCost] = useState(initialData?.avgCost?.toString() || '')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      avgCost: parseFloat(avgCost)
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? 'Edit Holding' : 'Add Holding'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="BTCUSDT"
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.5"
              required
            />
          </div>
          <div className="form-group">
            <label>Average Cost (USD)</label>
            <input
              type="number"
              step="any"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="42000"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create PortfolioPanel**

```tsx
// frontend/src/components/Portfolio/PortfolioPanel.tsx
import { useState, useEffect } from 'react'
import { HoldingRow } from './HoldingRow'
import { AddHoldingModal } from './AddHoldingModal'
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket'
import axios from 'axios'

interface Holding {
  id: string
  symbol: string
  quantity: number
  avgCost: number
}

export function PortfolioPanel() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<Holding | undefined>()

  const symbols = holdings.map((h) => h.symbol)
  useBinanceWebSocket({ symbols })

  useEffect(() => {
    fetchHoldings()
  }, [])

  async function fetchHoldings() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHoldings(res.data.holdings)
    } catch (err) {
      console.error('Failed to fetch portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(data: { symbol: string; quantity: number; avgCost: number }) {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        '/api/portfolio',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHoldings([...holdings, res.data.holding])
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to add holding:', err)
    }
  }

  async function handleEdit(data: { symbol: string; quantity: number; avgCost: number }) {
    if (!editingHolding) return
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/portfolio/${editingHolding.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHoldings(
        holdings.map((h) =>
          h.id === editingHolding.id ? { ...h, ...data } : h
        )
      )
      setEditingHolding(undefined)
    } catch (err) {
      console.error('Failed to update holding:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHoldings(holdings.filter((h) => h.id !== id))
    } catch (err) {
      console.error('Failed to delete holding:', err)
    }
  }

  return (
    <div className="portfolio-panel">
      <div className="panel-header">
        <h3>Portfolio</h3>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add
        </button>
      </div>

      <div className="holdings-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : holdings.length === 0 ? (
          <div className="empty">No holdings yet</div>
        ) : (
          holdings.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              onEdit={() => setEditingHolding(holding)}
              onDelete={() => handleDelete(holding.id)}
            />
          ))
        )}
      </div>

      <AddHoldingModal
        isOpen={isModalOpen || !!editingHolding}
        onClose={() => { setIsModalOpen(false); setEditingHolding(undefined) }}
        onAdd={editingHolding ? handleEdit : handleAdd}
        initialData={editingHolding}
      />
    </div>
  )
}
```

- [ ] **Step 4: Add portfolio styles**

```css
.portfolio-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}

.add-btn {
  padding: 6px 12px;
  background: var(--color-accent);
  border: none;
  border-radius: 4px;
  color: var(--color-bg);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.holdings-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.holding-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 8px;
}

.holding-row .symbol {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 16px;
}

.holding-row .quantity {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.holding-values {
  text-align: right;
}

.value-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
}

.value-row .label {
  color: var(--color-text-secondary);
}

.value-row .value {
  font-family: var(--font-mono);
}

.value-row .value.positive {
  color: var(--color-positive);
}

.value-row .value.negative {
  color: var(--color-negative);
}

.holding-actions {
  display: flex;
  gap: 4px;
}

.holding-actions button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 16px;
}

.holding-actions button:hover {
  color: var(--color-text);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.modal-content h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.form-group input {
  width: 100%;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: var(--font-mono);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
}

.submit-btn {
  padding: 10px 20px;
  background: var(--color-accent);
  border: none;
  border-radius: 8px;
  color: var(--color-bg);
  font-weight: 600;
  cursor: pointer;
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Portfolio/PortfolioPanel.tsx frontend/src/components/Portfolio/HoldingRow.tsx frontend/src/components/Portfolio/AddHoldingModal.tsx
git commit -m "feat: add portfolio panel with holdings CRUD and live P&L

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 6: Layout System

### Task 12: Dashboard Layout System

**Files:**
- Create: `frontend/src/stores/layoutStore.ts`
- Create: `frontend/src/components/Layout/Dashboard.tsx`
- Create: `frontend/src/components/Layout/PresetSelector.tsx`

- [ ] **Step 1: Create layout store with preset definitions**

```typescript
// frontend/src/stores/layoutStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type LayoutPreset = 'focus' | 'balanced' | 'data-dense' | 'portfolio'

interface LayoutConfig {
  chartSize: number
  showWatchlist: boolean
  showPortfolio: boolean
  watchlistSize: number
  portfolioSize: number
}

const LAYOUT_CONFIGS: Record<LayoutPreset, LayoutConfig> = {
  focus: {
    chartSize: 100,
    showWatchlist: false,
    showPortfolio: false,
    watchlistSize: 0,
    portfolioSize: 0
  },
  balanced: {
    chartSize: 60,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 20,
    portfolioSize: 20
  },
  'data-dense': {
    chartSize: 50,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 25,
    portfolioSize: 25
  },
  portfolio: {
    chartSize: 40,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 25,
    portfolioSize: 35
  }
}

interface LayoutStore {
  activePreset: LayoutPreset
  setPreset: (preset: LayoutPreset) => void
  getConfig: () => LayoutConfig
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      activePreset: 'balanced',
      setPreset: (preset) => set({ activePreset: preset }),
      getConfig: () => LAYOUT_CONFIGS[get().activePreset]
    }),
    {
      name: 'luxterminal-layout'
    }
  )
)
```

- [ ] **Step 2: Create PresetSelector**

```tsx
// frontend/src/components/Layout/PresetSelector.tsx
import { useLayoutStore } from '../../stores/layoutStore'

const PRESETS = [
  { id: 'focus', label: 'Focus', description: 'Chart only' },
  { id: 'balanced', label: 'Balanced', description: 'Chart + panels' },
  { id: 'data-dense', label: 'Data Dense', description: 'Maximum info' },
  { id: 'portfolio', label: 'Portfolio', description: 'Position focus' }
] as const

export function PresetSelector() {
  const { activePreset, setPreset } = useLayoutStore()

  return (
    <div className="preset-selector">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
          onClick={() => setPreset(preset.id)}
        >
          <span className="preset-label">{preset.label}</span>
          <span className="preset-desc">{preset.description}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create Dashboard component**

```tsx
// frontend/src/components/Layout/Dashboard.tsx
import { useState } from 'react'
import { useLayoutStore } from '../../stores/layoutStore'
import { LuxChart } from '../Chart/LuxChart'
import { TimeframeSelector } from '../Chart/TimeframeSelector'
import { WatchlistPanel } from '../Watchlist/WatchlistPanel'
import { PortfolioPanel } from '../Portfolio/PortfolioPanel'
import { PresetSelector } from './PresetSelector'

export function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')
  const { getConfig } = useLayoutStore()
  const config = getConfig()

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">LuxTerminal</h1>
          <div className="symbol-badge">{selectedSymbol}</div>
        </div>
        <div className="header-center">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>
        <div className="header-right">
          <PresetSelector />
        </div>
      </header>

      <main className="dashboard-main">
        <div
          className="chart-section"
          style={{ flexBasis: `${config.chartSize}%` }}
        >
          <LuxChart symbol={selectedSymbol} interval={timeframe} />
        </div>

        {config.showWatchlist && (
          <aside
            className="watchlist-section glass-panel"
            style={{ flexBasis: `${config.watchlistSize}%` }}
          >
            <WatchlistPanel
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
          </aside>
        )}

        {config.showPortfolio && (
          <aside
            className="portfolio-section glass-panel"
            style={{ flexBasis: `${config.portfolioSize}%` }}
          >
            <PortfolioPanel />
          </aside>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Add dashboard styles with glass morphism**

```css
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(13, 15, 20, 0.8);
  backdrop-filter: blur(20px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.symbol-badge {
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 14px;
}

.header-center {
  display: flex;
  align-items: center;
}

.preset-selector {
  display: flex;
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
}

.preset-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.preset-btn.active {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.preset-btn .preset-label {
  font-size: 12px;
  font-weight: 600;
}

.preset-btn .preset-desc {
  font-size: 10px;
  opacity: 0.7;
}

.dashboard-main {
  display: flex;
  flex: 1;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.chart-section {
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

.glass-panel {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

.watchlist-section,
.portfolio-section {
  display: flex;
  flex-direction: column;
  min-width: 280px;
  max-width: 400px;
}
```

- [ ] **Step 5: Update App.tsx to use Dashboard**

```tsx
import { Dashboard } from './components/Layout/Dashboard'

function App() {
  return <Dashboard />
}

export default App
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Layout/Dashboard.tsx frontend/src/components/Layout/PresetSelector.tsx frontend/src/stores/layoutStore.ts
git commit -m "feat: add 4-preset layout system with glass morphism design

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 7: Authentication Pages

### Task 13: Login & Register Pages

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/components/AuthRoute.tsx`

- [ ] **Step 1: Create LoginPage**

```tsx
// frontend/src/pages/LoginPage.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Link } from 'next/link'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Welcome to LuxTerminal</h1>
        <p className="subtitle">Sign in to access your trading dashboard</p>

        <button className="google-btn" onClick={handleGoogleSignIn}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create RegisterPage**

```tsx
// frontend/src/pages/RegisterPage.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from 'next/link'
import axios from 'axios'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await axios.post('http://localhost:5002/api/auth/register', {
        name,
        email,
        password
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Create Account</h1>
        <p className="subtitle">Start your trading journey with LuxTerminal</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add auth page styles**

```css
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #0D0F14 0%, #1a1d24 100%);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}

.auth-card h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
}

.auth-card .subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  background: white;
  border: none;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;
}

.google-btn:hover {
  background: #f5f5f5;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider span {
  padding: 0 16px;
}

.error-message {
  padding: 12px;
  background: rgba(229, 115, 115, 0.1);
  border: 1px solid var(--color-negative);
  border-radius: 8px;
  color: var(--color-negative);
  font-size: 14px;
  margin-bottom: 16px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.auth-footer a {
  color: var(--color-accent);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx
git commit -m "feat: add login and register pages with email/password + Google OAuth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 8: Polish & Integration

### Task 14: Final Integration & Auth Flow

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/.env.local`

- [ ] **Step 1: Set up environment variables**

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

- [ ] **Step 2: Update App.tsx with routing**

```tsx
import { useSession } from 'next-auth/react'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard } from './components/Layout/Dashboard'
import { AuthProvider } from './components/AuthProvider'

function App() {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Simple hash-based routing for SPA
  const path = window.location.pathname

  if (path === '/login') {
    return <LoginPage />
  }

  if (path === '/register') {
    return <RegisterPage />
  }

  if (path === '/dashboard') {
    return <Dashboard />
  }

  // Default to login
  window.location.href = '/login'
  return null
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default AppWrapper
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: integrate auth flow with login/register/dashboard routing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 15: Global Styles & Luxury Polish

**Files:**
- Modify: `frontend/src/styles/globals.css`

- [ ] **Step 1: Add comprehensive global styles**

```css
/* Global reset and base styles */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Colors */
  --color-bg: #0D0F14;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-surface-hover: rgba(255, 255, 255, 0.08);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.15);
  --color-text: #E8E9EB;
  --color-text-secondary: #6B7280;
  --color-text-muted: #4B5563;
  --color-accent: #D4AF37;
  --color-accent-hover: #E5C04B;
  --color-accent-secondary: #E8B4B8;
  --color-positive: #50C878;
  --color-positive-bg: rgba(80, 200, 120, 0.1);
  --color-negative: #E57373;
  --color-negative-bg: rgba(229, 115, 115, 0.1);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(212, 175, 55, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 400ms ease-out;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

/* Selection */
::selection {
  background: var(--color-accent);
  color: var(--color-bg);
}

/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Glass panel base class */
.glass-panel {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* Loading screen */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Common button styles */
button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Common input styles */
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
}

/* Utility classes */
.text-positive {
  color: var(--color-positive);
}

.text-negative {
  color: var(--color-negative);
}

.text-muted {
  color: var(--color-text-secondary);
}

.font-mono {
  font-family: var(--font-mono);
}
```

- [ ] **Step 2: Final test and commit**

Run: `cd frontend && npm run build`
Expected: Build succeeds

```bash
git add frontend/src/styles/globals.css
git commit -m "feat: add comprehensive global styles with luxury aesthetic

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Implementation Checklist Summary

- [ ] Phase 1: Project Foundation
  - [ ] Task 1: React + TypeScript + Vite project
  - [ ] Task 2: Flask backend with Prisma
  - [ ] Task 3: PostgreSQL database setup
- [ ] Phase 2: Authentication
  - [ ] Task 4: NextAuth.js configuration
  - [ ] Task 5: Flask auth endpoints
- [ ] Phase 3: Data Layer
  - [ ] Task 6: Portfolio CRUD API
  - [ ] Task 7: Watchlist CRUD API
- [ ] Phase 4: Frontend Core
  - [ ] Task 8: Binance WebSocket hook
  - [ ] Task 9: TradingView chart component
- [ ] Phase 5: UI Panels
  - [ ] Task 10: Watchlist panel
  - [ ] Task 11: Portfolio panel
- [ ] Phase 6: Layout System
  - [ ] Task 12: 4-preset layout system
- [ ] Phase 7: Auth Pages
  - [ ] Task 13: Login & Register pages
- [ ] Phase 8: Polish
  - [ ] Task 14: Final integration
  - [ ] Task 15: Global styles

---

**Spec Coverage Verification:**

| Spec Requirement | Tasks |
|-----------------|-------|
| React + TypeScript frontend | Task 1 |
| Flask backend | Task 2 |
| PostgreSQL + Prisma | Task 3 |
| NextAuth.js (credentials + OAuth) | Task 4, 5, 13 |
| Direct Binance WebSocket | Task 8 |
| TradingView charts | Task 9 |
| Watchlist CRUD | Task 7, 10 |
| Portfolio CRUD | Task 6, 11 |
| 4 preset layouts | Task 12 |
| Glass morphism luxury aesthetic | Task 14, 15 |
| Cost-basis P&L | Task 11 |

All spec requirements are covered by the implementation plan.

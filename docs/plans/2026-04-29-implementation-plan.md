# E-commerce Live Video Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a POC live e-commerce platform where admin broadcasts live events, customers watch and purchase products, with a 7-day purchase window after events.

**Architecture:** Next.js 14 monolith with App Router, TypeORM + PostgreSQL (Supabase), permission-based roles, mobile-first responsive UI, third-party integrations (Agora, Stripe, Cloudinary), feature flags (LaunchDarkly), and development mock services.

**Tech Stack:** Next.js 14, TypeScript, TypeORM, PostgreSQL (Supabase), TailwindCSS, Shadcn/ui, Agora.io, Stripe, Cloudinary, LaunchDarkly, next-i18next

---

## Phase 1: Project Setup & Infrastructure

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `.env.local`
- Create: `.gitignore`

**Step 1: Initialize Next.js with TypeScript**

```bash
cd /Users/guy.kuperly/private_dev/ecommerce-live
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Creates Next.js 14 project with App Router

**Step 2: Install core dependencies**

```bash
npm install typeorm@0.3.19 pg reflect-metadata
npm install @supabase/supabase-js
npm install stripe
npm install cloudinary
npm install agora-rtc-sdk-ng agora-rtm-sdk
npm install launchdarkly-node-server-sdk launchdarkly-react-client-sdk
npm install next-i18next i18next react-i18next
npm install zod react-hook-form @hookform/resolvers/zod
npm install zustand
npm install date-fns
```

Expected: Dependencies installed

**Step 3: Install dev dependencies**

```bash
npm install -D @types/node @types/react
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D tsx
```

Expected: Dev dependencies installed

**Step 4: Configure environment variables**

Create `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_live_dev
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
NEXT_PUBLIC_AGORA_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# LaunchDarkly
LAUNCHDARKLY_SDK_KEY=sdk-xxx
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID=xxx

# App
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development

# Mock Services (for development)
NEXT_PUBLIC_USE_MOCKS=true
MOCK_STRIPE=true
MOCK_AGORA=true
MOCK_CLOUDINARY=true
```

**Step 5: Update .gitignore**

Add to `.gitignore`:

```
# Environment
.env*.local
.env.production

# TypeORM
ormconfig.json

# Development
/dev
```

**Step 6: Configure next.config.js**

```javascript
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

**Step 7: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with dependencies

- Next.js 14 with App Router
- TypeScript, TailwindCSS
- TypeORM, Supabase, Stripe, Agora, Cloudinary, LaunchDarkly
- next-i18next, Zod, Zustand
- Testing setup (Vitest, Playwright)
- Environment configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Configure TailwindCSS & Shadcn/ui

**Files:**
- Modify: `tailwind.config.js`
- Create: `app/globals.css`
- Create: `components.json`
- Create: `lib/utils.ts`

**Step 1: Configure Tailwind with custom theme**

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Step 2: Install tailwindcss-animate**

```bash
npm install tailwindcss-animate
```

**Step 3: Create global styles**

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 7%;
    --foreground: 0 0% 98%;
    --card: 0 0% 12%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 98%;
    --primary: 45 93% 58%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 20%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 20%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 84% 60%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 45 93% 58%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Mobile optimizations */
@layer utilities {
  /* Touch-friendly tap targets */
  .btn, button, a {
    @apply min-h-[44px] min-w-[44px];
  }

  /* Prevent zoom on input focus (iOS) */
  input, select, textarea {
    @apply text-base;
  }

  /* Safe area for notched devices */
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Smooth scrolling on mobile */
  .scroll-smooth {
    -webkit-overflow-scrolling: touch;
  }

  /* Hide scrollbar but keep functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Countdown animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .animate-pulse-slow {
    animation: pulse 2s infinite;
  }
}
```

**Step 4: Initialize Shadcn/ui**

```bash
npx shadcn-ui@latest init
```

When prompted:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components: @/components
- Utils: @/lib/utils
- React Server Components: Yes

**Step 5: Install essential Shadcn components**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: configure TailwindCSS and Shadcn/ui

- Custom dark theme with gold primary color
- Mobile-first utilities (safe areas, touch targets)
- Global styles and animations
- Shadcn/ui components installed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Configure i18n (next-i18next)

**Files:**
- Create: `next-i18next.config.js`
- Modify: `next.config.js`
- Create: `public/locales/en/common.json`
- Create: `public/locales/en/auth.json`
- Create: `public/locales/en/products.json`
- Create: `public/locales/en/events.json`
- Create: `public/locales/en/checkout.json`
- Create: `public/locales/en/dashboard.json`

**Step 1: Create i18n config**

Create `next-i18next.config.js`:

```javascript
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
```

**Step 2: Create translation directories**

```bash
mkdir -p public/locales/en
```

**Step 3: Create common translations**

Create `public/locales/en/common.json`:

```json
{
  "nav": {
    "home": "Home",
    "shop": "Shop",
    "liveNow": "Live Now",
    "categories": "Categories",
    "forPartners": "For Partners",
    "aboutUs": "About Us",
    "login": "Login",
    "logout": "Logout",
    "dashboard": "Dashboard",
    "cart": "Cart"
  },
  "hero": {
    "watch": "WATCH",
    "ask": "ASK",
    "buy": "BUY",
    "subtitle": "Real factories. Real people. Real deals – Live.",
    "joinLive": "JOIN LIVE NOW",
    "howItWorks": "HOW IT WORKS",
    "nextLive": "NEXT LIVE EVENT",
    "watchingNow": "{{count}} watching now"
  },
  "countdown": {
    "nextEvent": "Next Event:",
    "days": "Days",
    "hours": "Hrs",
    "minutes": "Min",
    "seconds": "Sec",
    "liveNow": "LIVE NOW"
  },
  "footer": {
    "tagline": "The world's first live factory shopping experience.",
    "copyright": "© 2024 Colosseum Live Factory. All rights reserved."
  }
}
```

**Step 4: Create auth translations**

Create `public/locales/en/auth.json`:

```json
{
  "login": {
    "title": "Login",
    "email": "Email",
    "password": "Password",
    "submit": "Sign In",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up",
    "orContinueWith": "Or continue with",
    "google": "Google"
  },
  "register": {
    "title": "Create Account",
    "fullName": "Full Name",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "accountType": "Account Type",
    "customer": "Customer",
    "manufacturer": "Manufacturer",
    "companyName": "Company Name (for manufacturers)",
    "submit": "Create Account",
    "haveAccount": "Already have an account?",
    "signIn": "Sign in"
  },
  "errors": {
    "invalidCredentials": "Invalid email or password",
    "emailExists": "Email already exists",
    "passwordMismatch": "Passwords do not match",
    "weakPassword": "Password must be at least 8 characters"
  }
}
```

**Step 5: Create products translations**

Create `public/locales/en/products.json`:

```json
{
  "title": "Products",
  "search": "Search products...",
  "card": {
    "buyNow": "BUY NOW",
    "watchLive": "WATCH LIVE",
    "addToCart": "Add to Cart",
    "viewDetails": "View Details",
    "unitsLeft": "{{count}} units left",
    "priceRevealed": "Price revealed during live event",
    "availableOn": "Available on {{date}}",
    "getNotified": "Get Notified",
    "soldOut": "Sold Out"
  }
}
```

**Step 6: Create events translations**

Create `public/locales/en/events.json`:

```json
{
  "title": "Live Events",
  "upcoming": "Upcoming Events",
  "past": "Past Events",
  "createEvent": "Create Event",
  "startBroadcast": "Start Broadcast",
  "endBroadcast": "End Broadcast",
  "status": {
    "draft": "Draft",
    "scheduled": "Scheduled",
    "live": "Live",
    "ended": "Ended",
    "closed": "Closed"
  }
}
```

**Step 7: Create checkout translations**

Create `public/locales/en/checkout.json`:

```json
{
  "title": "Checkout",
  "cart": "Shopping Cart",
  "emptyCart": "Your cart is empty",
  "continueShopping": "Continue Shopping",
  "subtotal": "Subtotal",
  "total": "Total",
  "proceedToCheckout": "Proceed to Checkout",
  "placeOrder": "Place Order"
}
```

**Step 8: Create dashboard translations**

Create `public/locales/en/dashboard.json`:

```json
{
  "title": "Dashboard",
  "admin": {
    "title": "Admin Dashboard",
    "stats": {
      "totalRevenue": "Total Revenue",
      "activeEvents": "Active Events",
      "totalOrders": "Total Orders"
    }
  },
  "manufacturer": {
    "title": "Manufacturer Dashboard",
    "stats": {
      "myProducts": "My Products",
      "upcomingEvents": "Upcoming Events",
      "revenue": "Revenue"
    }
  }
}
```

**Step 9: Commit**

```bash
git add .
git commit -m "feat: configure i18n with English translations

- next-i18next configuration
- Translation files for all namespaces
- English language only for POC

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Database & TypeORM Setup

### Task 2.1: Configure TypeORM Data Source

**Files:**
- Create: `lib/db/data-source.ts`
- Create: `lib/db/index.ts`
- Modify: `package.json` (add TypeORM scripts)

**Step 1: Create TypeORM data source**

Create `lib/db/data-source.ts`:

```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  entities: ['lib/db/entities/**/*.ts'],
  migrations: ['lib/db/migrations/**/*.ts'],
  subscribers: [],
});

// Initialize connection
let isInitialized = false;

export async function getDataSource() {
  if (!isInitialized) {
    await dataSource.initialize();
    isInitialized = true;
  }
  return dataSource;
}
```

**Step 2: Create database utilities**

Create `lib/db/index.ts`:

```typescript
import { dataSource, getDataSource } from './data-source';

export { dataSource, getDataSource };

// Helper to get repository
export async function getRepository<T>(entity: any) {
  const ds = await getDataSource();
  return ds.getRepository<T>(entity);
}
```

**Step 3: Add TypeORM scripts to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate -d lib/db/data-source.ts",
    "migration:run": "npm run typeorm -- migration:run -d lib/db/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d lib/db/data-source.ts"
  }
}
```

**Step 4: Test database connection**

Run:
```bash
npm run typeorm -- -d lib/db/data-source.ts
```

Expected: No errors (or connection error if DB not set up yet)

**Step 5: Commit**

```bash
git add .
git commit -m "feat: configure TypeORM data source

- PostgreSQL connection via Supabase
- Migration scripts
- Repository helpers

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Base Entity

**Files:**
- Create: `lib/db/entities/BaseEntity.ts`

**Step 1: Create BaseEntity**

Create `lib/db/entities/BaseEntity.ts`:

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeORMBaseEntity
} from 'typeorm';

export abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: create BaseEntity with id, createdAt, updatedAt

All entities will extend this base class for consistency.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.3: Create Permission & Role Entities

**Files:**
- Create: `lib/db/entities/Permission.ts`
- Create: `lib/db/entities/Role.ts`
- Create: `lib/db/entities/index.ts`

**Step 1: Create Permission entity**

Create `lib/db/entities/Permission.ts`:

```typescript
import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
```

**Step 2: Create Role entity**

Create `lib/db/entities/Role.ts`:

```typescript
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Permission } from './Permission';
import { User } from './User';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, user => user.role)
  users: User[];
}
```

**Step 3: Create entity index**

Create `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: create Permission and Role entities

- Permission entity with resource and action
- Role entity with many-to-many permissions
- Foundation for permission-based authorization

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.4: Create User Entity

**Files:**
- Create: `lib/db/entities/User.ts`
- Modify: `lib/db/entities/index.ts`

**Step 1: Create User entity**

Create `lib/db/entities/User.ts`:

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role';
import { Manufacturer } from './Manufacturer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @Column({ nullable: true })
  supabaseAuthId: string;

  @ManyToOne(() => Manufacturer, { nullable: true })
  manufacturer: Manufacturer | null;

  @Column({ default: true })
  isActive: boolean;
}
```

**Step 2: Update entity index**

Modify `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
export { User } from './User';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create User entity

- Links to Role (permission system)
- Links to Manufacturer (for manufacturer owners)
- Supabase auth integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.5: Create Manufacturer Entity

**Files:**
- Create: `lib/db/entities/Manufacturer.ts`
- Modify: `lib/db/entities/index.ts`

**Step 1: Create Manufacturer entity**

Create `lib/db/entities/Manufacturer.ts`:

```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Product } from './Product';
import { LiveEvent } from './LiveEvent';

@Entity('manufacturers')
export class Manufacturer extends BaseEntity {
  @Column()
  companyName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ nullable: true })
  logoUrl: string | null;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @OneToMany(() => User, user => user.manufacturer)
  teamMembers: User[];

  @OneToMany(() => Product, product => product.manufacturer)
  products: Product[];

  @OneToMany(() => LiveEvent, event => event.manufacturer)
  liveEvents: LiveEvent[];
}
```

**Step 2: Update entity index**

Modify `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
export { User } from './User';
export { Manufacturer } from './Manufacturer';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create Manufacturer entity

- Company details and approval status
- isHidden flag for POC (hide from customers)
- Relations to users, products, events

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.6: Create Product Entity

**Files:**
- Create: `lib/db/entities/Product.ts`
- Modify: `lib/db/entities/index.ts`

**Step 1: Create Product entity**

Create `lib/db/entities/Product.ts`:

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Manufacturer } from './Manufacturer';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ type: 'simple-array' })
  imageUrls: string[];

  @Column({ default: 0 })
  stockQuantity: number;

  @Column()
  category: string;

  @ManyToOne(() => Manufacturer, manufacturer => manufacturer.products)
  manufacturer: Manufacturer;

  @Column({ default: true })
  isActive: boolean;
}
```

**Step 2: Update entity index**

Modify `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
export { User } from './User';
export { Manufacturer } from './Manufacturer';
export { Product } from './Product';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create Product entity

- Product catalog with pricing
- Image URLs (Cloudinary)
- Stock management
- Category classification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.7: Create LiveEvent Entity

**Files:**
- Create: `lib/db/entities/LiveEvent.ts`
- Modify: `lib/db/entities/index.ts`

**Step 1: Create LiveEvent entity**

Create `lib/db/entities/LiveEvent.ts`:

```typescript
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Manufacturer } from './Manufacturer';
import { Product } from './Product';

export enum EventStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  PURCHASE_WINDOW = 'purchase_window',
  CLOSED = 'closed',
}

@Entity('live_events')
export class LiveEvent extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  scheduledStartTime: Date;

  @Column({ type: 'timestamp' })
  scheduledEndTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  purchaseWindowEndTime: Date | null;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @ManyToOne(() => Manufacturer, manufacturer => manufacturer.liveEvents)
  manufacturer: Manufacturer;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'event_featured_products',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  featuredProducts: Product[];

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ nullable: true })
  agoraChannelName: string | null;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date | null;

  @Column({ default: 0 })
  viewerCount: number;
}
```

**Step 2: Update entity index**

Modify `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
export { User } from './User';
export { Manufacturer } from './Manufacturer';
export { Product } from './Product';
export { LiveEvent, EventStatus } from './LiveEvent';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create LiveEvent entity

- Event scheduling and status flow
- Purchase window tracking
- Agora channel integration
- Featured products (many-to-many)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.8: Create Order Entities

**Files:**
- Create: `lib/db/entities/Order.ts`
- Create: `lib/db/entities/OrderItem.ts`
- Modify: `lib/db/entities/index.ts`

**Step 1: Create Order entity**

Create `lib/db/entities/Order.ts`:

```typescript
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { LiveEvent } from './LiveEvent';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User)
  customer: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true })
  stripePaymentIntentId: string | null;

  @ManyToOne(() => LiveEvent, { nullable: true })
  purchasedDuringEvent: LiveEvent | null;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: any;
}
```

**Step 2: Create OrderItem entity**

Create `lib/db/entities/OrderItem.ts`:

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number;

  @Column({ nullable: true })
  productName: string | null;

  @Column({ nullable: true })
  productImageUrl: string | null;
}
```

**Step 3: Update entity index**

Modify `lib/db/entities/index.ts`:

```typescript
export { BaseEntity } from './BaseEntity';
export { Permission } from './Permission';
export { Role } from './Role';
export { User } from './User';
export { Manufacturer } from './Manufacturer';
export { Product } from './Product';
export { LiveEvent, EventStatus } from './LiveEvent';
export { Order, OrderStatus } from './Order';
export { OrderItem } from './OrderItem';
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: create Order and OrderItem entities

- Order tracking with Stripe integration
- Order items with product snapshots
- Link to live events (track live purchases)
- Shipping address storage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.9: Generate and Run Initial Migration

**Files:**
- Create: `lib/db/migrations/[timestamp]-InitialSchema.ts`

**Step 1: Generate migration**

```bash
npm run typeorm -- migration:generate lib/db/migrations/InitialSchema -d lib/db/data-source.ts
```

Expected: Migration file created with all tables

**Step 2: Review migration**

Open the generated migration file and verify it includes:
- permissions table
- roles table
- role_permissions junction table
- users table
- manufacturers table
- products table
- live_events table
- event_featured_products junction table
- orders table
- order_items table

**Step 3: Run migration**

```bash
npm run migration:run
```

Expected: All tables created successfully

**Step 4: Verify database**

Connect to your database and verify tables exist:

```bash
psql $DATABASE_URL -c "\dt"
```

Expected: List of all tables

**Step 5: Commit**

```bash
git add .
git commit -m "feat: generate and run initial database migration

- All entity tables created
- Junction tables for many-to-many relations
- Indexes and constraints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Authentication & Permissions

### Task 3.1: Setup Supabase Client

**Files:**
- Create: `lib/auth/supabase.ts`
- Create: `lib/auth/types.ts`

**Step 1: Create Supabase client**

Create `lib/auth/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

**Step 2: Create auth types**

Create `lib/auth/types.ts`:

```typescript
import { User } from '@/lib/db/entities';

export interface Session {
  user: User;
  supabaseSession: any;
}

export interface AuthError {
  message: string;
  code?: string;
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: setup Supabase authentication clients

- Client-side Supabase client
- Server-side admin client
- Auth types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3.2: Create Permission Definitions

**Files:**
- Create: `lib/permissions/definitions.ts`

**Step 1: Create permission definitions**

Create `lib/permissions/definitions.ts`:

```typescript
export const PERMISSIONS = {
  // Event permissions
  EVENT_CREATE: 'event.create',
  EVENT_READ: 'event.read',
  EVENT_UPDATE: 'event.update',
  EVENT_DELETE: 'event.delete',
  EVENT_BROADCAST: 'event.broadcast',

  // Product permissions
  PRODUCT_CREATE: 'product.create',
  PRODUCT_READ: 'product.read',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_UPDATE_OWN: 'product.update.own',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_IMPORT: 'product.import',

  // Order permissions
  ORDER_CREATE: 'order.create',
  ORDER_READ_OWN: 'order.read.own',
  ORDER_READ_ALL: 'order.read.all',
  ORDER_UPDATE: 'order.update',

  // Manufacturer permissions
  MANUFACTURER_CREATE: 'manufacturer.create',
  MANUFACTURER_READ: 'manufacturer.read',
  MANUFACTURER_UPDATE_OWN: 'manufacturer.update.own',
  MANUFACTURER_UPDATE_ALL: 'manufacturer.update.all',
  MANUFACTURER_APPROVE: 'manufacturer.approve',

  // User permissions
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Analytics permissions
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
  ANALYTICS_VIEW_ALL: 'analytics.view.all',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<string, PermissionValue[]> = {
  admin: [
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_DELETE,
    PERMISSIONS.EVENT_BROADCAST,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_IMPORT,
    PERMISSIONS.ORDER_READ_ALL,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.MANUFACTURER_READ,
    PERMISSIONS.MANUFACTURER_UPDATE_ALL,
    PERMISSIONS.MANUFACTURER_APPROVE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
  ],

  manufacturer_owner: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_IMPORT,
    PERMISSIONS.ORDER_READ_OWN,
    PERMISSIONS.MANUFACTURER_UPDATE_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],

  customer: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ_OWN,
  ],

  guest: [
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.PRODUCT_READ,
  ],
};
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: define permission system

- Permission constants
- Role-permission mappings
- TypeScript types for permissions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

Due to the length of this implementation plan, I'll continue in the next file. This plan is getting quite large. Let me create a summary and save what we have so far, then continue with the remaining phases.

---

**[PLAN CONTINUES - This is Part 1 of the implementation plan. The remaining phases will be added next.]**

## Remaining Phases (To be detailed)

### Phase 4: Core API Routes & Business Logic
- Session management
- Permission checking utilities
- Product CRUD APIs
- Event management APIs
- Order processing

### Phase 5: Frontend Components & Pages
- Layout components
- Authentication pages
- Product catalog
- Live stream page
- Dashboard pages
- Shopping cart & checkout

### Phase 6: Third-Party Integrations
- Agora streaming setup
- Stripe payment flow
- Cloudinary uploads
- LaunchDarkly feature flags

### Phase 7: Development Tools
- Mock services
- Database seeding
- Dev admin panel

### Phase 8: Testing & Deployment
- Unit tests
- E2E tests
- Vercel deployment

---

**Total Estimated Tasks:** 80-100 tasks
**Estimated Time:** 2-3 weeks for POC

# 🚀 Zorvyn Fintech Project Setup Guide

## Project Overview

Your project has been configured with a professional, production-ready backend setup featuring:
- **Node.js + Express** - Modern web framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Type-safe database layer
- **PostgreSQL** - Robust relational database
- **Nodemon** - Development auto-reload with manual restart control

---

## 📁 Project Structure

```
zorvyn-fintech/
├── src/
│   ├── config/                 # Configuration & setup
│   │   ├── environment.ts     # Environment variables
│   │   ├── middleware.ts      # Express middleware setup
│   │   └── database.ts        # Database connection & initialization
│   │
│   ├── routes/                 # API route definitions
│   │   └── health.ts          # Health check endpoints
│   │
│   ├── controllers/            # Business logic for routes
│   │   └── health.ts          # Health check logic
│   │
│   ├── services/               # Business logic & data access
│   │   └── (create services here)
│   │
│   ├── middleware/             # Custom middleware
│   │   └── errorHandler.ts    # Global error handling
│   │
│   ├── utils/                  # Helper functions
│   │   └── errors.ts          # Custom error classes
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── (create types here)
│   │
│   ├── db/                     # Database layer
│   │   └── schema/            # Drizzle ORM table schemas
│   │       └── users.ts       # Example user table
│   │
│   └── index.ts                # Application entry point
│
├── dist/                        # Compiled JavaScript (build output)
├── drizzle/                     # Database migration files
├── node_modules/               # Dependencies
│
├── .env                         # Environment variables (local)
├── .env.example                 # Environment template
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── nodemon.json                # Nodemon configuration (rs = restart key)
├── prettier.config.json        # Code formatter configuration
├── tsconfig.json               # TypeScript configuration
├── drizzle.config.ts           # Drizzle ORM configuration
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## 🛠️ Configuration Files

### `tsconfig.json` - TypeScript Settings
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled (`strict: true`)
- **Path Aliases**: Configured for clean imports
  - `@config/*` → `src/config/*`
  - `@routes/*` → `src/routes/*`
  - `@controllers/*` → `src/controllers/*`
  - `@services/*` → `src/services/*`
  - `@middleware/*` → `src/middleware/*`
  - `@utils/*` → `src/utils/*`
  - `@db/*` → `src/db/*`

### `nodemon.json` - Development Server
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node",
  "restartable": "rs"  // ← Press 'rs' + Enter to restart
}
```

**Key Feature**: Auto-reload on file changes, manual restart by typing `rs`

### `.eslintrc.json` - Code Quality
- ESLint with TypeScript plugin
- TypeScript-specific rules enabled

### `prettier.config.json` - Code Formatting
- 2 space indentation
- Single quotes
- 100 character line width
- Trailing commas

### `drizzle.config.ts` - Database ORM
- Configured for PostgreSQL
- Schema location: `src/db/schema`
- Migrations location: `drizzle`

---

## 🚀 Getting Started

### Step 1: Set Up Environment Variables

Copy `.env.example` to `.env` and update with your actual values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000
HOST=localhost

# Update with your PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/zorvyn_fintech

API_PREFIX=/api/v1
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=7d
```

### Step 2: Set Up PostgreSQL Database

```bash
# Create database
createdb zorvyn_fintech

# Or if using Docker:
docker run --name zorvyn_pg \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=zorvyn_fintech \
  -p 5432:5432 \
  -d postgres:15
```

### Step 3: Run Development Server

```bash
cd /home/akash/zorvyn-fintech
npm run dev
```

You'll see:
```
╔════════════════════════════════════════════╗
║     🚀 Zorvyn Fintech API Server 🚀        ║
╠════════════════════════════════════════════╣
║ Environment: development                   ║
║ Port:        3000                          ║
║ Host:        localhost                     ║
║ URL:         http://localhost:3000         ║
╠════════════════════════════════════════════╣
║ Press Ctrl+C to stop                       ║
║ Type 'rs' in nodemon to restart (dev)      ║
╚════════════════════════════════════════════╝
```

### Step 4: Test Health Endpoints

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/info
```

---

## 📝 Available npm Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with auto-reload (type 'rs' to restart) |
| `npm run build` | Compile TypeScript → JavaScript |
| `npm start` | Run production compiled code |
| `npm run prod` | Build & start in production |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |
| `npm run db:push` | Sync Drizzle schema with database |
| `npm run db:studio` | Open Drizzle Studio UI |

---

## 🔄 Nodemon - Development Server Control

### ✨ Special Feature: Manual Restart with `rs`

Your nodemon is configured to:
1. **Watch** the `src/` folder for file changes
2. **Auto-reload** when .ts files change
3. **Accept manual restart** by typing `rs` in the terminal

### How to Restart:
```
> rs

# Server restarts
To restart at any time, enter `rs`.
```

---

## 💾 Database Setup with Drizzle

### 1. Define Your Schema

Edit `src/db/schema/users.ts`:
```typescript
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2. Create Additional Schemas

Add more files in `src/db/schema/`:
- `accounts.ts`
- `transactions.ts`
- `wallets.ts`
- etc.

### 3. Sync with Database

```bash
npm run db:push
```

### 4. View/Manage with Drizzle Studio

```bash
npm run db:studio
```

---

## 🏗️ Adding Your First Endpoint

### 1. Create a Route

Create `src/routes/users.ts`:
```typescript
import { Router } from 'express';
import { getUsers, createUser } from '@controllers/users';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);

export default router;
```

### 2. Create a Controller

Create `src/controllers/users.ts`:
```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '@middleware/errorHandler';
import { UserService } from '@services/users';

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  res.json({ status: 'success', data: users });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body);
  res.status(201).json({ status: 'success', data: user });
});
```

### 3. Create a Service

Create `src/services/users.ts`:
```typescript
import { getDatabase } from '@config/database';
import { users } from '@db/schema/users';

export class UserService {
  static async getAllUsers() {
    const db = getDatabase();
    return await db.select().from(users);
  }

  static async createUser(data: any) {
    const db = getDatabase();
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }
}
```

### 4. Register Route in App

Edit `src/index.ts`:
```typescript
import usersRoutes from '@routes/users';

// Add to app setup:
app.use(`${config.apiPrefix}/users`, usersRoutes);
```

---

## 🔐 Security Features

The project includes:
- **Helmet** - HTTP headers security
- **CORS** - Cross-origin request handling
- **Compression** - Response compression
- **Input Validation** - Via middleware
- **Error Handling** - Centralized error catching
- **Environment Variables** - Sensitive config isolation

---

## 🧪 Development Workflow

1. **Start Server**
   ```bash
   npm run dev
   ```

2. **Edit Files** in `src/` folder
   - Changes auto-reload

3. **Manual Restart** (if needed)
   ```
   Type: rs
   Press: Enter
   ```

4. **Test Endpoints**
   ```bash
   curl http://localhost:3000/api/v1/users
   ```

5. **Check Code Quality**
   ```bash
   npm run lint
   npm run format
   ```

---

## 📦 Production Deployment

### 1. Build

```bash
npm run build
```

### 2. Set Environment

```bash
export NODE_ENV=production
export PORT=3000
export DATABASE_URL=postgresql://prod-user:pass@prod-host:5432/zorvyn
```

### 3. Run

```bash
npm start
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql postgresql://user:password@localhost:5432/zorvyn_fintech

# Check connection string in .env
```

### TypeScript Errors
```bash
# Type check
npm run type-check

# Full rebuild
npm run build
```

### Nodemon Not Restarting
```
# Type directly in terminal where npm run dev is running:
rs
# Press Enter
```

---

## 📚 Architecture Principles

Based on professional backend patterns:

1. **Separation of Concerns**
   - Routes organize endpoints
   - Controllers handle HTTP logic
   - Services handle business logic
   - Database handles data persistence

2. **Type Safety**
   - Full TypeScript strict mode
   - Database-level type safety with Drizzle
   - Request/Response type definitions

3. **Error Handling**
   - Custom AppError class
   - Centralized error middleware
   - Proper HTTP status codes

4. **Configuration**
   - Environment-based settings
   - No hardcoded secrets
   - Easy multi-environment setup

5. **Development Experience**
   - Fast reload on changes
   - Manual restart control
   - Clear logging
   - Path aliases for clean imports

---

## 🎯 Next Steps

1. ✅ Configure `.env` with your database credentials
2. ✅ Set up PostgreSQL database
3. ✅ Create your data schemas in `src/db/schema/`
4. ✅ Run `npm run db:push` to sync database
5. ✅ Create your first routes, controllers, and services
6. ✅ Test endpoints with curl or Postman
7. ✅ Deploy to production

---

## 📖 Resources

- [Express Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nodemon Guide](https://nodemon.io/)

---

**Happy coding! 🎉** Your professional fintech backend is ready to go!

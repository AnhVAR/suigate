# Admin Authentication Setup

This document describes the admin authentication system for the SuiGate admin dashboard.

## Architecture

### Hybrid Authentication Flow

1. **Google OAuth via zkLogin** - User authenticates with Google
2. **Backend JWT Session** - Backend issues admin session JWT (24h validity)
3. **Cookie Storage** - Session stored in httpOnly cookie
4. **Middleware Protection** - Routes protected by Next.js middleware

### Auth Flow

```
1. User clicks "Login with Google" on /login
2. Redirect to Google OAuth with nonce
3. Google redirects back with id_token in URL hash
4. Frontend sends id_token to POST /admin/auth/zklogin
5. Backend:
   - Verifies Google JWT signature
   - Finds/creates user by google_id
   - Grants admin role (hackathon: first login = auto-admin)
   - Returns admin session JWT with role embedded
6. Frontend stores JWT in cookie
7. Middleware checks cookie on protected routes
8. User accesses dashboard
```

## Database Changes

Execute migration SQL:

```bash
psql $DATABASE_URL -f backend/migrations/add-admin-role-column.sql
```

Or manually in Supabase SQL Editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role VARCHAR(20) DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_users_admin_role ON users(admin_role) WHERE admin_role IS NOT NULL;
```

## Environment Variables

### Backend (.env)

```bash
# Google OAuth (same as mobile app)
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# JWT Secret for admin sessions
JWT_SECRET=your-secret-key-here
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## Role-Based Access Control (RBAC)

### Roles

- **admin** - Full access (view + update orders, users, analytics)
- **support** - Read-only access (view orders, users, analytics)

### Permissions

```typescript
const PERMISSIONS = {
  admin: ['view_orders', 'update_orders', 'view_users', 'update_users', 'view_analytics'],
  support: ['view_orders', 'view_users', 'view_analytics'],
};
```

### Usage in Components

```tsx
import { RequirePermission } from '@/components/auth/require-permission';

<RequirePermission permission="update_orders">
  <button>Approve Order</button>
</RequirePermission>
```

### Usage in Hooks

```tsx
import { useAdminSession } from '@/hooks/use-admin-session';
import { hasPermission } from '@/lib/admin-rbac';

const { role } = useAdminSession();
const canUpdate = role && hasPermission(role, 'update_orders');
```

## Backend API Endpoints

### POST /admin/auth/zklogin

Authenticate admin user with Google OAuth id_token.

**Request:**
```json
{
  "idToken": "eyJhbG..."
}
```

**Response:**
```json
{
  "userId": "uuid",
  "suiAddress": "0x...",
  "role": "admin",
  "token": "eyJhbG..."
}
```

**Errors:**
- 401: Invalid JWT, expired, or user not admin
- 400: Missing idToken

### Protected Endpoints

Use AdminAuthGuard on routes:

```typescript
@UseGuards(AdminAuthGuard)
@Get('admin/orders')
async getOrders(@Request() req) {
  // req.user contains { userId, suiAddress, role }
}
```

## Testing Locally

### 1. Start Backend

```bash
cd backend
npm run start:dev
```

### 2. Start Admin Frontend

```bash
cd admin
npm run dev
```

### 3. Configure Google OAuth

1. Go to Google Cloud Console
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/login`
4. Copy Client ID to both `.env` files

### 4. Run Database Migration

```bash
psql $SUPABASE_URL -f backend/migrations/add-admin-role-column.sql
```

### 5. Test Login

1. Navigate to http://localhost:3000
2. Redirects to /login
3. Click "Sign in with Google"
4. Complete Google OAuth
5. First login = auto-granted admin role (hackathon mode)
6. Redirected to /orders

## Hackathon Simplifications

For HackMoney 2026 speed:

1. **Auto-grant admin role** - First login gets admin role automatically
2. **No email verification** - Trust Google OAuth
3. **No role management UI** - Roles set via SQL
4. **Simple JWT** - No refresh tokens, 24h expiry
5. **Client-side routing** - Middleware checks, not SSR

## Security Considerations

### Current (Hackathon)

- Client-side JWT decode (no signature verification in middleware)
- Auto-grant admin role on first login
- httpOnly cookies (prevents XSS)
- Secure flag in production

### Production Enhancements

- Server-side JWT verification in middleware
- Admin role approval workflow
- Refresh token rotation
- Rate limiting on auth endpoint
- Audit logging
- IP whitelist for admin access
- 2FA for admin accounts

## File Structure

```
admin/
├── lib/
│   ├── zklogin-web-auth.ts      # OAuth URL builder, callback parser
│   ├── admin-session.ts          # Cookie management
│   └── admin-rbac.ts             # Permission checks
├── hooks/
│   └── use-admin-session.ts      # Session hook
├── components/auth/
│   ├── google-login-button.tsx   # Google OAuth button
│   └── require-permission.tsx    # RBAC wrapper
├── app/(auth)/login/
│   └── page.tsx                  # Login page with OAuth callback
├── middleware.ts                 # Route protection
└── AUTH_SETUP.md                 # This file

backend/
└── src/modules/admin/
    ├── admin.module.ts           # Module definition
    ├── admin.controller.ts       # Auth endpoint
    ├── admin.service.ts          # Auth logic + JWT
    ├── guards/
    │   └── admin-auth.guard.ts   # JWT verification guard
    └── dto/
        └── admin-auth.dto.ts     # Request/response types
```

# SuiGate Admin Dashboard

Admin dashboard for monitoring and managing the SuiGate platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **State Management**: TanStack Query (React Query)
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **UI Components**: Custom components with shadcn/ui styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### Development

```bash
# Start development server (runs on port 3002)
npm run dev

# From project root
npm run admin:dev
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Type Checking

```bash
npm run typecheck
```

## Project Structure

```
admin/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   │   └── login/           # Login page
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── layout.tsx       # Dashboard shell
│   │   ├── page.tsx         # Analytics overview
│   │   ├── orders/          # Orders management
│   │   └── users/           # Users management
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Redirect to dashboard
│   └── globals.css          # Global styles
├── components/              # React components
│   └── ui/                  # UI components (shadcn/ui)
├── lib/                     # Utilities
│   ├── api-client.ts        # API fetch wrapper
│   ├── cn-utility.ts        # Class name utility
│   └── react-query-provider.tsx  # Query client provider
├── types/                   # TypeScript types
│   └── database.types.ts    # Database schema types
└── .env.local.example       # Environment variables template
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | - |

## Features

### Phase 1 (Current)
- ✅ Project setup with Next.js 14
- ✅ Tailwind CSS configuration
- ✅ TypeScript configuration
- ✅ API client setup
- ✅ Basic layouts and navigation
- ✅ Placeholder pages

### Phase 2 (Planned)
- Authentication with Google OAuth
- Real-time dashboard analytics
- Order management with filtering/sorting
- User management with KYC status
- Rate configuration
- System settings

## Development Notes

- Uses React 18 (Next.js 14 compatibility)
- Runs on port 3002 to avoid conflicts with backend (3001) and mobile app dev server (8081)
- API client auto-injects auth headers when token is set
- Follows kebab-case naming for files

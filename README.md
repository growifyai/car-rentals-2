## Project Structure

This project follows a feature-first structure with shared layers. Files remain in their original locations; feature barrels provide a unified import surface to avoid breaking changes.

### Top-level
- `src/app`: Next.js App Router routes and route-local client components
- `src/features`: Feature barrels exposing each domain
- `src/components`: Shared presentational components (layout, ui, admin)
- `src/lib`: Core libraries (api, env, auth, domain libs) with a root barrel
- `src/types`: Shared TypeScript types
- `src/styles`: Global styles (globals.css, index.css)

### Features
- `src/features/cars`: Car domain exports (lib, types, UI)
- `src/features/bookings`: Booking domain exports (lib, types, UI)
- `src/features/auth`: Auth utilities, provider, and UI
- `src/features/notifications`: Notifications utilities and UI

### Importing
- Prefer importing via feature barrels:
  - `import { fetchCars } from "@/features/cars";`
  - `import { BookingPageClient } from "@/features/bookings";`
  - `import { AuthProvider } from "@/features/auth";`
- Shared lib:
  - `import { apiFetch, getApiBaseUrl } from "@/lib";`
- Layout:
  - `import { SiteHeader, SiteFooter } from "@/components/layout";`

### Notes
- No functionality changed; barrels re-export existing modules.
- Next steps (optional): gradually move files into `src/features/*` directories while maintaining imports through barrels.

# Zion Car Rentals Website

A modern car rental platform built with Next.js 14, React, and TypeScript. This is a full-stack application featuring customer booking system, admin management dashboard, and payment integration with Razorpay.

## 🚀 Features

- **Customer Features:**
  - Browse and filter available cars
  - Multi-step booking form with document upload
  - Real-time pricing calculation
  - Payment integration (Razorpay)
  - Booking management dashboard
  - Live photo capture for verification

- **Admin Features:**
  - Manage fleet (add, edit, delete cars)
  - Review and approve bookings
  - Start and complete rentals
  - Track revenue and statistics
  - View customer documents

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running at `https://zion-car-rentals-backend.up.railway.app`
- Razorpay account (for payment processing)

## 🛠️ Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd zion-car-rentals

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://zion-car-rentals-backend.up.railway.app

# Razorpay Configuration (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 📦 Project Structure

```
zion-car-rentals/
├── src/
│   ├── app/                # Next.js pages and routes
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   ├── booking/        # Booking pages
│   │   └── dashboard/      # User dashboard
│   ├── components/         # React components
│   │   ├── admin/          # Admin components
│   │   ├── ui/             # UI components
│   │   └── providers/      # Context providers
│   ├── lib/                # API clients and utilities
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                  # Static assets
├── next.config.mjs         # Next.js configuration
└── package.json            # Dependencies
```

## 🚀 Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Setup in Vercel:

Add these environment variables:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay Key (optional)

## 🎨 Key Technologies

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Forms:** React Hook Form
- **State Management:** React Context
- **Payments:** Razorpay
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📱 Pages

- `/` - Homepage with featured cars
- `/cars` - Browse all available cars
- `/booking/[carId]` - Booking form
- `/dashboard/bookings` - User bookings
- `/admin/dashboard` - Admin overview
- `/admin/cars` - Car management
- `/admin/bookings` - Booking management

## 🔧 Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 License

This project is part of the Zion Car Rentals Website Design (Community) Figma design.

## 🤝 Contributing

Feel free to submit issues and pull requests.

# IZI Store — E-Commerce Frontend

Frontend application for the IZI Store e-commerce platform, built with Next.js and integrated with a Spring Boot REST API backend.

## Tech Stack

- **Next.js 16** — React framework with App Router
- **TypeScript** — Type-safe development
- **Tailwind CSS v4** — Utility-first styling

## Features

- **Product Browsing** — Search, filter by category, pagination
- **Authentication** — Login and registration
- **Shopping Cart** — Add, update quantity, remove items
- **Checkout** — Address selection, order summary, Xendit payment integration
- **Order Management** — Order history, order detail, cancel orders
- **User Profile** — Edit profile, manage delivery addresses

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3000/api/v1` ([Backend Repository](https://github.com/native-99/Ecommerce))

### Installation

```bash
git clone https://github.com/native-99/ecommerce-frontend.git
cd ecommerce-frontend
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                     # Pages (Next.js App Router)
│   ├── page.tsx             # Homepage — product listing
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── products/[id]/       # Product detail
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── orders/              # Order history & detail
│   └── profile/             # Profile & address management
├── components/              # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
└── lib/                     # Utilities
    ├── types.ts             # TypeScript type definitions
    ├── api.ts               # API client with JWT auth
    ├── auth.tsx             # Auth context
    └── cart.tsx             # Cart context
```

## API Integration

This frontend consumes the following backend endpoints:

| Feature | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Products | `GET /products`, `GET /products/{id}` |
| Cart | `GET/POST/PUT/DELETE /carts/items` |
| Orders | `POST /orders/checkout`, `GET /orders`, `PUT /orders/{id}/cancel` |
| Address | `GET/POST/PUT/DELETE /address` |
| Profile | `GET/PUT /users/me` |

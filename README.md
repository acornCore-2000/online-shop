# Online Shop

A full-stack e-commerce web application built from scratch with a React/TypeScript frontend and a Node.js/Express/TypeScript backend, backed by PostgreSQL. It covers the full shopping flow: browsing products by category, cart management, checkout, order tracking, and returns — all behind a JWT-based authentication system.

## Features

- **Authentication** — signup/login with hashed passwords (bcrypt), short-lived access tokens + rotating refresh tokens stored as httpOnly cookies, automatic token refresh on the frontend via an Axios interceptor.
- **Product catalog** — browse by category (men / women / unisex) and by seasonal collection (summer / winter), with clothing, shoes, and accessories.
- **Cart** — add/remove items with real-time stock checks.
- **Checkout & orders** — cart-to-order conversion runs inside a database transaction with row-level locking (`SELECT ... FOR UPDATE`) to safely handle concurrent requests; orders move through `pending → under review → delivered`.
- **Order management** — increase/decrease item quantities while pending, cancel orders, request returns on delivered items.
- **Profile management** — update name, email, phone number, and address.
- **Security** — Helmet, rate limiting on sensitive routes (login/signup/checkout), input validation, ownership checks on every order/return lookup.

## Screenshots

<p align="center">
  <a href="./frontend/public/screenshots/product-catalog.png">
    <img src="./frontend/public/screenshots/product-catalog.png" alt="Product catalog with product details and cart controls" width="180" />
  </a>
  <a href="./frontend/public/screenshots/category-browser.png">
    <img src="./frontend/public/screenshots/category-browser.png" alt="Category browser for clothing, shoes, and accessories" width="180" />
  </a>
  <a href="./frontend/public/screenshots/cart.png">
    <img src="./frontend/public/screenshots/cart.png" alt="Shopping cart with quantity controls and checkout total" width="180" />
  </a>
  <a href="./frontend/public/screenshots/orders-and-returns.png">
    <img src="./frontend/public/screenshots/orders-and-returns.png" alt="Order history with delivery status and return request flow" width="180" />
  </a>
  <a href="./frontend/public/screenshots/sign-up.png">
    <img src="./frontend/public/screenshots/sign-up.png" alt="Account creation form" width="180" />
  </a>
</p>

<p align="center">
  Click an image to view it in full size.
</p>

## Tech stack

**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query (React Query), Axios, CSS Modules

**Backend:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`), JSON Web Tokens, bcrypt, Helmet, express-rate-limit, AWS S3 (product images)

## Project structure

```text
online-shop/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── server.ts
│   └── src/
│       ├── routes/       # auth, products, cart, orders, profile, returns...
│       ├── middleware/   # auth guard, rate limiting, error handling, validation
│       └── config/       # database pool, CORS
└── frontend/
    ├── public/
    │   └── screenshots/
    └── src/
        ├── pages/        # route-level views (Home, Cart, Checkout, Orders, Profile...)
        ├── components/   # reusable UI (ProductCard, Header, order item lists...)
        ├── api/          # Axios instances + typed API calls
        ├── context/      # auth context
        └── lib/          # shared helpers
```

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd online-shop
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
cd ..
```

### 3. Database setup

1. In pgAdmin, create a new PostgreSQL database named `online_shop`.

2. From the project root, run:

```bash
psql -U postgres -d online_shop -f backend/database/schema.sql
```

3. Update `backend/.env` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/online_shop
```

4. Start the backend:

```bash
cd backend
npm run dev
```

### 4. Frontend setup

Open a new terminal, then run:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

## Environment variables

Both `backend/.env.example` and `frontend/.env.example` list every variable the app needs, with placeholder values — copy each to `.env` and fill in your own values. **Never commit real `.env` files** (they're already git-ignored).

## License

This project is available under the MIT License.
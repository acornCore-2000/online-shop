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

## Tech stack

**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query (React Query), Axios, CSS Modules

**Backend:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`), JSON Web Tokens, bcrypt, Helmet, express-rate-limit, AWS S3 (product images)

## Project structure

online-shop/
├── backend/
│ ├── server.ts
│ └── src/
│ ├── routes/ # auth, products, cart, orders, profile, returns...
│ ├── middleware/ # auth guard, rate limiting, error handling, validation
│ └── config/ # database pool, CORS
└── frontend/
└── src/
├── pages/ # route-level views (Home, Cart, Checkout, Orders, Profile...)
├── components/ # reusable UI (ProductCard, Header, order item lists...)
├── api/ # Axios instances + typed API calls
├── context/ # auth context
└── lib/ # shared helpers


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
cp .env.example .env   # then fill in your own DB credentials and secrets
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

## Environment variables

Both `backend/.env.example` and `frontend/.env.example` list every variable the app needs, with placeholder values — copy each to `.env` and fill in your own values. **Never commit real `.env` files** (they're already git-ignored).

## License

This project is available under the MIT License.
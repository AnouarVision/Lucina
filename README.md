<div align="center" style="margin-top: 30px;">
  <img src="./client/public/assets/images/logo.png" height="100px" alt="Lucina logo"/>
  <h1>Lucina — Korean Skincare E-commerce</h1>
</div>

---

## Overview

> **Disclaimer**: Lucina is a fictional brand created solely for demonstration purposes. All products, prices, orders, and data presented are entirely fabricated. This project does not represent a real commercial activity.

**Lucina** is a full-stack e-commerce platform focused on Korean skincare products for the Italian market. Built with **Angular 20**, **.NET 9** and **Stripe**, it provides a complete online store experience with clean architecture, role-based access, server-side coupons, Redis cart persistence and a built-in AI K-Beauty assistant.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Quickstart](#quickstart)
  - [Requirements](#requirements)
  - [Environment Setup](#environment-setup)
  - [Run with Docker Compose](#run-with-docker-compose)
  - [Run locally (without Docker)](#run-locally-without-docker)
- [Development Guide](#development-guide)
  - [Backend](#backend-aspnet-core)
  - [Frontend](#frontend-angular)
- [Admin Setup](#admin-setup)

---

## Features

- Full checkout flow: browsing → cart → coupon → shipping → payment → order confirmation
- JWT authentication with role-based access (User / Admin)
- Server-side promotional coupon system (Admin-generated, server-validated)
- Free shipping threshold (≥ €65 on standard shipping)
- Stripe payment integration
- Cart persistence via Redis (synced across sessions)
- Product filtering, sorting, searching and pagination
- Order history with full-page detail view and printable invoice
- AI K-Beauty assistant (Google Gemini, Italian language)
- Mobile-first responsive UI (Angular Material + Tailwind CSS) with hamburger menu
- Repository & Specification patterns in the backend
- Seeded demo data (products, coupons, delivery options)
- Newsletter subscription with welcome email (coupon code delivery)
- Fake SMTP server for local email testing (smtp4dev)
- Working contact form with server-side email delivery
- **GDPR compliance**: opt-in checkbox at registration, Privacy Policy and Terms of Service pages
- **Security hardening**: role-based Admin guards on write endpoints, IDOR protection on cart/payment, security response headers, HTTPS redirection
- **JWT HTTP interceptor**: automatically attaches Bearer token to all API requests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, Angular Material 20, Tailwind CSS 4 |
| Backend | ASP.NET Core 9, Entity Framework Core 9 |
| Authentication | JWT, BCrypt.Net, role claims (`Admin` / `User`) |
| Database | SQL Server 2022 (Docker) |
| Cache | Redis 7 (cart persistence) |
| Payments | Stripe.net 50 |
| Email | MailKit 4.11 (SMTP) |
| Environment | DotNetEnv 3.1 |
| Container | Docker Compose |

---

## Architecture

```
Browser
  └── Angular SPA (port 4200)
        └── HTTP REST calls ──→ ASP.NET Core API (port 5001)
                                    ├── SQL Server (port 1433)  — orders, users, products, coupons
                                    ├── Redis (port 6379)       — cart state
                                    └── smtp4dev (port 2525)    — SMTP relay (local dev)
```

### Solution layout

```
Lucina/
├── API/                    # Presentation layer — controllers, DTOs, middleware, services
├── Core/                   # Domain layer — entities, repository interfaces, specifications
├── Infrastructure/         # Data layer — EF Core, repositories, migrations, auth service
├── client/                 # Angular 20 SPA
│   ├── src/app/
│   │   ├── core/           # Services, guards, interceptors
│   │   ├── features/       # Routed feature components
│   │   ├── layout/         # Page-level layout components
│   │   └── shared/         # Shared models, components
│   └── public/assets/      # Static images and fonts
└── docker-compose.yml      # SQL Server + Redis + smtp4dev + Adminer containers
```

---

## API Reference

Base URL: `https://localhost:5001/api`

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | Login; returns JWT |
| POST | `/signup` | — | Register new account |
| GET | `/profile` | [jwt] | Get current user profile |
| PUT | `/profile` | [jwt] | Update profile |
| GET | `/orders` | [jwt] | List user orders (paginated) |
| GET | `/orders/{id}` | [jwt] | Order detail with items |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List products (filter, sort, paginate) |
| GET | `/{id}` | — | Single product |
| GET | `/brands` | — | All brands |
| GET | `/types` | — | All types |

### Cart — `/api/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/{userId}` | — | Get cart |
| POST | `/{userId}/add` | — | Add item |
| POST | `/{userId}/add-all` | — | Replace cart items |
| DELETE | `/{userId}/remove/{productId}` | — | Remove item |

### Payment — `/api/payment`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order/{userId}` | [jwt] | Create order from cart |
| POST | `/{orderId}/process-payment` | [jwt] | Process Stripe payment |
| GET | `/{orderId}` | [jwt] | Order details |
| GET | `/user/{userId}` | [jwt] | All user orders |

### Coupon — `/api/coupon`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | [jwt] | Validate code (returns discount %) |
| POST | `/redeem` | [jwt] | Increment usage counter |
| POST | `/generate` | [admin] | Create coupon |
| GET | `/` | [admin] | List all coupons |
| DELETE | `/{id}` | [admin] | Deactivate coupon |

### Chatbot — `/api/chatbot`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/message` | — | Send message to AI K-Beauty assistant (Gemini) |

### Contact — `/api/contact`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/send` | — | Submit contact form; delivers email via SMTP |

### Newsletter — `/api/newsletter`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscribe` | — | Subscribe email; sends welcome email with `WELCOME15` coupon code |
| DELETE | `/unsubscribe` | — | Soft-unsubscribe (sets `IsActive = false`) |

---

## Frontend Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | HomeComponent | Hero, featured categories, shop preview, testimonials |
| `/shop` | ShopComponent | Product grid with filters, sort, search, skeleton loading |
| `/shop/:id` | ProductDetailComponent | Product detail page |
| `/skincare-routine` | SkincareRoutineComponent | K-Beauty routine guide |
| `/about-us` | AboutUsComponent | Team, mission, values, timeline |
| `/contact-us` | ContactUsComponent | Contact form |
| `/faq` | FaqComponent | FAQ accordion |
| `/k-beauty` | KBeautyComponent | K-Beauty educational content |
| `/privacy-policy` | PrivacyPolicyComponent | Privacy Policy (GDPR) |
| `/terms-of-service` | TermsOfServiceComponent | Terms of Service |
| `/profile` | ProfileComponent | Login / register |
| `/my-profile` | MyProfileComponent | Authenticated user dashboard (orders, wishlist) |
| `/wishlist` | WishlistComponent | Saved items |
| `/cart` | CartComponent | Cart with order summary, coupon, shipping picker |
| `/checkout` | CheckoutComponent | Shipping address + payment form |
| `/payment-processing` | PaymentProcessingComponent | Stripe payment + order confirmation |

### Core Entities

| Entity | Key Fields |
|---|---|
| `Product` | Name, Description, Price, Type, Brand, QuantityInStock, PictureUrl |
| `User` | Name, Email, PasswordHash, Phone, Address, IsAdmin |
| `Order` | UserId, OrderStatus, Subtotal, ShippingCost, Tax, Discount, CouponCode, Total, PaymentMethod |
| `OrderItem` | OrderId, ProductId, ProductName, UnitPrice, Quantity |
| `CouponCode` | Code, DiscountPercent, IsActive, MaxUses, UsedCount, ExpiresAt |
| `DeliveryOption` | ShortName, DeliveryTime, Price |
| `Cart` *(Redis)* | UserId, Items[] |
| `NewsletterSubscription` | Email, SubscribedAt, IsActive |

---

## Quickstart

### Requirements

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Environment Setup

Create a `.env` file in the project root (next to `docker-compose.yml`):

```env
# Database
DB_PASSWORD=YourStrong!Password

# JWT
JWT_KEY=your-256-bit-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini (chatbot)
GEMINI_API_KEY=AIza...

# Email / SMTP
Email__Smtp__Host=localhost
Email__Smtp__Port=2525
Email__Smtp__From=noreply@lucina.local
Email__Smtp__DisplayName=Lucina
Email__Smtp__Username=
Email__Smtp__Password=
Email__Smtp__UseSsl=false
```

> By default emails are captured locally by **smtp4dev** (no real sending). To deliver emails to real inboxes, switch the SMTP config to a real provider, see [Email Setup](#email-setup).

> `appsettings.Development.json` is for logging overrides only. All secrets are loaded from `.env` via DotNetEnv at startup.

### Run with Docker Compose

```bash
# Start SQL Server + Redis
docker compose up -d

# Apply migrations and start API
cd API
dotnet ef database update --project ../Infrastructure --startup-project .
dotnet run

# In a separate terminal, start Angular
cd client
npm install
ng serve
```

| Service | URL |
|---|---|
| Angular app | http://localhost:4200 |
| API | https://localhost:5001 |
| Swagger | https://localhost:5001/swagger |
| smtp4dev (email inbox) | http://localhost:5080 |
| Adminer (DB GUI) | http://localhost:5090 |

### Run locally (without Docker)

If you have SQL Server and Redis installed locally, update the connection strings in `appsettings.json` accordingly, then follow the same steps above.

---

## Email Setup

In development, all outgoing emails are intercepted by **smtp4dev**, a local fake SMTP server. No emails reach real inboxes, but you can inspect them at **http://localhost:5080**.

To send real emails, update the SMTP block in `.env`:

**Gmail** (requires a [Google App Password](https://myaccount.google.com/apppasswords)):
```env
Email__Smtp__Host=smtp.gmail.com
Email__Smtp__Port=587
Email__Smtp__From=your@gmail.com
Email__Smtp__Username=your@gmail.com
Email__Smtp__Password=xxxx-xxxx-xxxx-xxxx
Email__Smtp__UseSsl=false
```

**Other providers** (Brevo, Resend, Mailgun, etc.) work the same way, just replace host, port and credentials.

---

## Development Guide

### Backend (ASP.NET Core)

```bash
# Restore packages
dotnet restore

# Create a new migration
dotnet ef migrations add <MigrationName> --project Infrastructure --startup-project API

# Apply migrations
dotnet ef database update --project Infrastructure --startup-project API

# Drop database (dev only)
dotnet ef database drop --project Infrastructure --startup-project API
```

### Frontend (Angular)

```bash
cd client

# Install dependencies
npm install

# Serve with hot reload
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test
```

---

## Admin Setup

By default all registered users are standard users. To grant admin access:

1. Register a user via `/profile` or `POST /api/auth/signup`
2. Run the following SQL against the database:

```sql
UPDATE Users SET IsAdmin = 1 WHERE Email = 'your@email.com';
```

3. Log out and back in, the JWT will include the `Admin` role claim.

Admin users can then call the `/api/coupon/generate`, list and deactivate endpoints.

---

## Security & Compliance

### Authentication & Authorization
- All write operations on products (`POST`/`PUT`/`DELETE /api/products`) require `[Authorize(Roles = "Admin")]`
- Cart endpoints require `[Authorize]` and enforce ownership checks (users can only access their own cart)
- Payment endpoints are IDOR-protected: orders are always verified against the authenticated user's ID
- `UpdateOrderStatus` is restricted to Admin only
- A global **JWT HTTP interceptor** (`auth.interceptor.ts`) automatically attaches the Bearer token to every outbound API request

### Security Headers
`Program.cs` sets the following response headers on every request:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

HTTPS redirection is enforced in all environments.

### Error Handling
- In production, `ExceptionMiddleware` returns a generic `"An unexpected error occurred"` message, no stack traces or internal details are leaked
- `AuthService` returns a unified `"Invalid credentials"` message for both wrong email and wrong password, preventing user enumeration

### GDPR Compliance
- Registration form includes a mandatory **GDPR opt-in checkbox** linking to the Privacy Policy and Terms of Service
- `/privacy-policy` and `/terms-of-service` are standalone public pages
- Newsletter subscriptions store only email + timestamp; unsubscribe sets `IsActive = false` (soft delete)


### Adminer (Database GUI)

Adminer is available at **http://localhost:5090**. Connect with:

| Field | Value |
|---|---|
| System | MS SQL (beta) |
| Server | `sql,1433` |
| Username | `sa` |
| Password | value of `MSSQL_SA_PASSWORD` in `.env` |
| Database | `LucinaDb` |

### Demo Coupons (seeded)

| Code | Discount |
|---|---|
| `LUCINA10` | 10% |
| `LUCINA20` | 20% |
| `WELCOME15` | 15% |
| `KBEAUTY25` | 25% |
| `SUMMER5` | 5% |


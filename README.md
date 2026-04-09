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
- [Testing](#testing)
- [Security & Compliance](#security--compliance)
- [Documentation](#documentation)

---

## Features

- Full checkout flow: browsing → cart → coupon → shipping → payment → order confirmation
- JWT authentication with cookie-based token storage, refresh token rotation and role-based access (User / Admin)
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
- **Compliance**: opt-in checkbox at registration, Privacy Policy and Terms of Service pages
- **Security hardening**: role-based Admin guards on write endpoints, IDOR protection on cart/payment, security response headers, HTTPS redirection
- **JWT HTTP interceptor**: automatically attaches cookies to all API requests via `withCredentials`, transparently refreshes the access token on 401

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, Angular Material 20, Tailwind CSS 4 |
| Backend | ASP.NET Core 9, Entity Framework Core 9 |
| Authentication | JWT (HttpOnly cookie), BCrypt.Net, refresh token rotation, role claims (`Admin` / `User`) |
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

| Group | Prefix | Description |
|---|---|---|
| Auth | `/api/auth` | Login, signup, token refresh, logout, profile, orders |
| Products | `/api/products` | List, filter, sort, paginate, single product |
| Cart | `/api/cart` | Get cart, add / remove items |
| Payment | `/api/payment` | Create order, process payment, retrieve orders |
| Coupon | `/api/coupon` | Validate, redeem, generate (Admin), deactivate (Admin) |
| Chatbot | `/api/chatbot` | Send message to Gemini K-Beauty assistant |
| Contact | `/api/contact` | Submit contact form |
| Newsletter | `/api/newsletter` | Subscribe / unsubscribe |

Full endpoint contracts with request/response schemas are in [`api_specification.md`](./api_specification.md).

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

---

## Quickstart

### Requirements

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [mkcert](https://github.com/FiloSottile/mkcert) (for local HTTPS certificates)

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

> By default emails are captured locally by **smtp4dev** (no real sending). To use a real SMTP provider (Gmail, Brevo, etc.), update the `Email__Smtp__*` values in `.env` accordingly.

> `appsettings.Development.json` is for logging overrides only. All secrets are loaded from `.env` via DotNetEnv at startup.

### Run with Docker Compose

> **SSL certificates**: The Angular dev server requires a local HTTPS certificate. Before running for the first time, generate it with:
> ```bash
> cd client
> mkdir ssl
> mkcert localhost
> mv localhost.pem ssl/localhost.pem
> mv localhost-key.pem ssl/localhost-key.pem
> ```
> If `mkcert` is not installed, follow the [mkcert installation guide](https://github.com/FiloSottile/mkcert#installation).

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

## Testing

The project includes a full suite of **61 automated unit tests** written with xUnit, Moq and EF Core InMemory, covering all backend business logic.

| Area | Tests | Status |
|---|---|---|
| Auth Service (register, login, token refresh, logout) | 12 | [OK] All passing |
| Auth Controller (consent validation, cookie clearing) | 2 | [OK] All passing |
| Coupon (validation, redemption, admin operations) | 10 | [OK] All passing |
| Cart (add, remove, stock availability) | 10 | [OK] All passing |
| Payment and Orders (create, retrieve, authorisation) | 8 | [OK] All passing |
| Newsletter (subscribe, unsubscribe, email trigger) | 5 | [OK] All passing |
| Chatbot input validation | 6 | [OK] All passing |
| Product catalogue (filter, sort, search, pagination) | 8 | [OK] All passing |
| **Total** | **61** | **61 / 61** |

```bash
# Run the full test suite
dotnet test Lucina.Tests /p:UseAppHost=false

# Run with verbose output
dotnet test Lucina.Tests /p:UseAppHost=false --logger "console;verbosity=normal"

# Run a specific test class
dotnet test Lucina.Tests /p:UseAppHost=false --filter "FullyQualifiedName~AuthServiceTests"
```

> The `/p:UseAppHost=false` flag is required when the API is simultaneously running via `dotnet watch run` to avoid a file-lock conflict on `API.exe`.

The complete test specification, including: test IDs, descriptions, per-test status and implementation notes ([`test_plan.md`](./test_plan.md)).

---

## Security & Compliance

- **Authentication**: JWT stored in HttpOnly + Secure + SameSite=Strict cookies (never `localStorage`). Access token 15 min; refresh token 7 days, SHA-256 hashed at rest, rotated on every use.
- **Authorization**: `[Authorize(Roles = "Admin")]` on all admin write operations; IDOR protection on cart and payment endpoints.
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. HTTPS enforced in all environments.
- **Stock reservation**: Redis soft-reservation prevents overselling; all stock and quantity checks are server-side.
- **Chatbot**: input sanitised (500-char limit, 20-message history cap, `sender` allowlist); `system_instruction` is structurally separated from user input.
- **Error handling**: `ExceptionMiddleware` returns generic messages in production; unified login error prevents user enumeration.
- **Compliance**: mandatory opt-in at registration; Privacy Policy and Terms of Service pages; newsletter uses soft-delete.

Full threat model, OWASP Top 10 mitigations and security testing approach are documented in [`security.md`](./security.md).


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

---

## Documentation

The following documents are maintained alongside the codebase. Each is linked below with a brief description of its scope.

| Document | Description |
|---|---|
| [`business_case.md`](./business_case.md) | Market opportunity, problem statement, competitive analysis and financial projections for the Italian K-Beauty market |
| [`project_charter.md`](./project_charter.md) | Project scope, objectives, stakeholders, milestones and success criteria |
| [`software_requirements_document.md`](./software_requirements_document.md) | Functional and non-functional requirements, user stories and requirements traceability matrix |
| [`software_design_document.md`](./software_design_document.md) | Full technical architecture, clean-architecture layer breakdown, sequence diagrams, component design and design decisions |
| [`test_plan.md`](./test_plan.md) | Unit test plan: 61 test cases across 8 areas, per-test status, implementation notes and pass criteria |
| [`api_specification.md`](./api_specification.md) | Full OpenAPI-style reference for every endpoint: request/response schemas, authentication requirements and error codes |
| [`security.md`](./security.md) | Security architecture, threat model, OWASP Top 10 mitigations, compliance measures and security testing approach |
| [`user_manual.md`](./user_manual.md) | End-user guide covering all platform features: browsing, cart, checkout, K-Beauty assistant, admin panel and FAQ |

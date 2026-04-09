# API Specification

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Endpoints](#3-endpoints)
   - 3.1 [Auth](#31-auth----apiauth)
   - 3.2 [Products](#32-products----apiproducts)
   - 3.3 [Cart](#33-cart----apicart)
   - 3.4 [Payment](#34-payment----apipayment)
   - 3.5 [Coupon](#35-coupon----apicoupon)
   - 3.6 [Chatbot](#36-chatbot----apichatbot)
   - 3.7 [Contact](#37-contact----apicontact)
   - 3.8 [Newsletter](#38-newsletter----apinewsletter)
4. [Request and Response Conventions](#4-request-and-response-conventions)
5. [Error Codes](#5-error-codes)
6. [Related Documents](#6-related-documents)

---

## 1. Overview

The Lucina API is a RESTful HTTP API built with ASP.NET Core 9. All requests and responses use JSON. Authentication is handled via HttpOnly cookies set by the `/api/auth/login` endpoint.

The API is documented interactively via Swagger at `https://localhost:5001/swagger` when running locally.

### Auth Levels

| Label | Meaning |
|---|---|
| `--` | Public endpoint, no authentication required |
| `[jwt]` | Requires a valid `access_token` cookie |
| `[admin]` | Requires a valid `access_token` cookie with the `Admin` role claim |

---

## 2. Authentication

Lucina uses a dual-token JWT strategy. On successful login, the API sets two HttpOnly cookies:

| Cookie | Lifetime | Scope |
|---|---|---|
| `access_token` | 15 minutes | All API requests |
| `refresh_token` | 7 days | Path-scoped to `/api/auth` only |

All authenticated requests must include `withCredentials: true` so the browser transmits the cookies automatically. When the `access_token` expires, the client should call `POST /api/auth/refresh` to obtain a new pair of tokens without requiring the user to log in again.

Cookie security flags applied: `HttpOnly`, `Secure`, `SameSite=Strict`.

---

## 3. Endpoints

### 3.1 Auth -- `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | -- | Login with email and password. Sets `access_token` and `refresh_token` cookies. |
| POST | `/signup` | -- | Register a new user account. |
| POST | `/refresh` | -- | Rotate access and refresh tokens. Reads the `refresh_token` cookie automatically. |
| POST | `/logout` | -- | Revoke the current refresh token and clear both cookies. |
| GET | `/validate` | [jwt] | Validate the current session. Called at app startup to restore authenticated state. |
| GET | `/profile` | [jwt] | Get the authenticated user's profile. |
| PUT | `/profile` | [jwt] | Update the authenticated user's profile (name, phone, address). |
| GET | `/orders` | [jwt] | List all orders belonging to the authenticated user. |
| GET | `/orders/{id}` | [jwt] | Get full detail of a specific order, including items. |

#### POST /login

```json
// Request body
{
  "email": "user@example.com",
  "password": "yourpassword"
}

// Response: 200 OK
// Sets cookies: access_token, refresh_token
// Body: user profile object

// Response: 401 Unauthorized
{
  "message": "Invalid credentials"
}
```

#### POST /signup

```json
// Request body
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "yourpassword",
  "gdprConsent": true
}

// Response: 200 OK
// Sets cookies: access_token, refresh_token

// Response: 400 Bad Request
{
  "message": "Email already in use"
}
```

---

### 3.2 Products -- `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | -- | List products with optional filtering, sorting and pagination. |
| GET | `/{id}` | -- | Get a single product by ID. |
| GET | `/brands` | -- | Get all available brands. |
| GET | `/types` | -- | Get all available product types. |

#### GET / -- Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by keyword in name or description |
| `brand` | string | Filter by brand name |
| `type` | string | Filter by product type |
| `sort` | string | Sort order: `priceAsc`, `priceDesc`, `nameAsc`, `nameDesc` |
| `pageIndex` | int | Page number (default: 1) |
| `pageSize` | int | Items per page (default: 10) |

```json
// Response: 200 OK
{
  "pageIndex": 1,
  "pageSize": 10,
  "count": 42,
  "data": [
    {
      "id": 1,
      "name": "COSRX Advanced Snail Serum",
      "description": "...",
      "price": 24.99,
      "brand": "COSRX",
      "type": "Serum",
      "quantityInStock": 15,
      "pictureUrl": "/images/cosrx-serum.jpg"
    }
  ]
}
```

---

### 3.3 Cart -- `/api/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/{userId}` | -- | Get the cart for a given user. |
| POST | `/{userId}/add` | -- | Add a product to the cart or update its quantity. |
| POST | `/{userId}/add-all` | -- | Replace all cart items (used for cart sync). |
| DELETE | `/{userId}/remove/{productId}` | -- | Remove a specific product from the cart. |

> **Note:** Cart ownership is enforced server-side. Authenticated users can only access their own cart. Unauthenticated users are identified by a client-generated `userId`.

#### POST /{userId}/add

```json
// Request body
{
  "productId": 3,
  "quantity": 2
}

// Response: 200 OK -- updated cart object

// Response: 400 Bad Request (insufficient stock)
{
  "message": "Only 1 unit available"
}
```

---

### 3.4 Payment -- `/api/payment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order/{userId}` | [jwt] | Create an order from the current cart. Verifies stock and ownership. |
| POST | `/{orderId}/process-payment` | [jwt] | Process payment for an existing order (simulated in v1.0). |
| GET | `/{orderId}` | [jwt] | Get details of a specific order. |
| GET | `/user/{userId}` | [jwt] | Get all orders for the authenticated user. |

> **Note:** All payment endpoints verify that the order belongs to the authenticated user before processing. Payment processing is simulated in v1.0 -- no real transaction takes place.

#### POST /create-order/{userId}

```json
// Request body
{
  "shippingAddress": {
    "fullName": "Mario Rossi",
    "street": "Via Roma 1",
    "city": "Milano",
    "postalCode": "20100",
    "country": "Italy"
  },
  "deliveryOptionId": 1,
  "couponCode": "LUCINA10"
}

// Response: 200 OK
{
  "orderId": 42,
  "total": 44.99,
  "status": "Pending"
}
```

---

### 3.5 Coupon -- `/api/coupon`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | [jwt] | Validate a coupon code and return the discount percentage. |
| POST | `/redeem` | [jwt] | Increment the usage counter of a coupon after successful checkout. |
| POST | `/generate` | [admin] | Create a new coupon. |
| GET | `/` | [admin] | List all coupons with their current status. |
| DELETE | `/{id}` | [admin] | Deactivate a coupon. |

#### POST /validate

```json
// Request body
{
  "code": "LUCINA10"
}

// Response: 200 OK
{
  "code": "LUCINA10",
  "discountPercent": 10
}

// Response: 400 Bad Request
{
  "message": "Coupon expired"
  // Possible values: "Coupon not found", "Coupon inactive",
  // "Coupon expired", "Coupon usage limit reached"
}
```

#### POST /generate

```json
// Request body
{
  "code": "SUMMER20",
  "discountPercent": 20,
  "maxUses": 100,
  "expiresAt": "2025-09-01T00:00:00Z"
}

// Response: 201 Created
```

---

### 3.6 Chatbot -- `/api/chatbot`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/message` | -- | Send a message to the AI K-Beauty assistant (Google Gemini). |

#### POST /message

```json
// Request body
{
  "message": "Qual è la migliore routine per pelle secca?",
  "history": [
    { "sender": "user", "text": "Ciao!" },
    { "sender": "bot", "text": "Ciao! Come posso aiutarti?" }
  ]
}

// Response: 200 OK
{
  "response": "Per la pelle secca ti consiglio..."
}

// Response: 400 Bad Request
{
  "message": "Message exceeds 500 characters"
}
```

**Constraints enforced server-side:**

| Field | Limit |
|---|---|
| `message` | Max 500 characters, non-empty |
| `history` | Max 20 entries |
| `history[].sender` | Must be `"user"` or `"bot"` |
| `history[].text` | Max 500 characters |

---

### 3.7 Contact -- `/api/contact`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/send` | -- | Submit the contact form. Delivers the message via SMTP. |

#### POST /send

```json
// Request body
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "message": "Vorrei sapere..."
}

// Response: 200 OK
```

---

### 3.8 Newsletter -- `/api/newsletter`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/subscribe` | -- | Subscribe an email address. Sends a welcome email with the `WELCOME15` coupon code. |
| DELETE | `/unsubscribe` | -- | Soft-unsubscribe: sets `IsActive = false` on the subscription record. |

#### POST /subscribe

```json
// Request body
{
  "email": "mario@example.com"
}

// Response: 200 OK

// Response: 409 Conflict
{
  "message": "Email already subscribed"
}
```

#### DELETE /unsubscribe

```json
// Request body
{
  "email": "mario@example.com"
}

// Response: 200 OK
```

---

## 4. Request and Response Conventions

- All request and response bodies are JSON.
- Dates and times are in ISO 8601 format (e.g. `2025-06-01T00:00:00Z`).
- Monetary values are decimal numbers in EUR (e.g. `24.99`).
- Pagination is zero-indexed on the API side but displayed as 1-indexed in the UI.
- Successful responses with no body return `200 OK` or `201 Created` with an empty body or a minimal confirmation object.
- Endpoints that modify state (POST, PUT, DELETE) require the appropriate auth level as specified above.

---

## 5. Error Codes

| HTTP Status | Meaning | Common Causes |
|---|---|---|
| `400 Bad Request` | Invalid input | Missing fields, validation failure, insufficient stock, exhausted coupon |
| `401 Unauthorized` | Not authenticated | Missing or expired `access_token` cookie |
| `403 Forbidden` | Not authorised | Accessing another user's cart or order; missing Admin role |
| `404 Not Found` | Resource not found | Invalid product ID, order ID or coupon code |
| `409 Conflict` | Duplicate resource | Email already registered or already subscribed |
| `500 Internal Server Error` | Unexpected error | Returns generic message in production; no stack trace exposed |

---

## 6. Related Documents

| Document | Description |
|---|---|
| [`business_case.md`](./business_case.md) | Market opportunity and investment rationale |
| [`project_charter.md`](./project_charter.md) | Project objectives, scope and constraints |
| [`software_requirements_specification.md`](./software_requirements_specification.md) | Functional and non-functional requirements |
| [`software_design_document.md`](./software_design_document.md) | Architecture, sequence diagrams and data model |
| [`security.md`](./security.md) | Security model, authentication design and compliance notes |
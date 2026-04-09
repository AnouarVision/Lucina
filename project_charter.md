# Project Charter

## 1. Project Overview

| Field | Detail |
|---|---|
| **Project name** | Lucina (Korean Skincare E-commerce) |
| **Type** | Personal / portfolio project |
| **Status** | MVP completed, awaiting approval and funding |
| **Purpose** | Validate the opportunity for a localised K-Beauty platform in the Italian market |

---

## 2. Purpose and Justification

Lucina was initiated to address a clear gap in the Italian e-commerce landscape: no dedicated, localised platform exists for Korean skincare products. Generalist marketplaces like Amazon and YesStyle serve the category but offer no curated experience, no Italian-language guidance and no educational content around K-Beauty routines.

The project also serves as a demonstration of full-stack software engineering capabilities applied to a realistic commercial scenario, including clean architecture, security, AI integration and compliance.

The full market rationale is documented in [`business_case.md`](./business_case.md).

---

## 3. Objectives

| # | Objective |
|---|---|
| 1 | Deliver a fully functional e-commerce platform targeting Italian K-Beauty consumers |
| 2 | Provide a localised, mobile-first shopping experience superior to generalist alternatives |
| 3 | Integrate an AI assistant in Italian to guide users through product selection and skincare routines |
| 4 | Implement a complete back-office for promotional and order management |
| 5 | Build on a scalable, production-grade architecture ready for commercial activation |

---

## 4. Scope

### 4.1 In Scope

- Product catalogue with browsing, search, filtering, sorting and pagination
- User accounts: registration, login, profile management and order history
- Shopping cart with session persistence and inventory reservation
- Promotional coupon system with admin-controlled generation and checkout validation
- Simulated checkout and order confirmation flow
- AI K-Beauty assistant in Italian (Google Gemini)
- Newsletter subscription with automated welcome offer
- Contact form with email delivery
- Privacy Policy, Terms of Service and consent at registration
- Admin back-office for coupon and order management
- Skincare routine guide and K-Beauty educational content

### 4.2 Out of Scope

- Real payment processing (requires VAT registration, live Stripe account and supplier agreements)
- Physical logistics and warehousing
- Native mobile application (iOS / Android)
- Multi-language support beyond Italian
- Offline or physical retail
- Personalised skincare formulations

---

## 5. Deliverables

| Deliverable | Description |
|---|---|
| **Working platform** | Full-stack web application, locally deployable via Docker Compose |
| **Source code** | Versioned repository with clean architecture and documented codebase |
| **API documentation** | Full REST API reference available via Swagger at `/swagger` |
| **Seeded demo data** | Products, coupons and delivery options pre-loaded for immediate testing |
| **Project documentation** | Business case, project charter, requirements, software design document |

---

## 6. Technical Constraints

| Constraint | Detail |
|---|---|
| **Runtime** | .NET 9 SDK, Node.js 20+ |
| **Containerisation** | Docker Desktop required for local infrastructure (SQL Server, Redis) |
| **Local HTTPS** | mkcert required for Angular dev server SSL certificate |
| **AI dependency** | Google Gemini API key required for chatbot functionality |
| **Payment** | Stripe integration is simulated; real processing requires commercial activation |
| **Email** | Local email testing via smtp4dev; real delivery requires an external SMTP provider |

---

## 7. Assumptions

- The platform is demonstrated with seeded fictional data; no real products or transactions are involved.
- A single developer or small team can maintain and extend the codebase given the clean architecture and separation of concerns.
- Commercial activation (real payments, real inventory) is a future phase contingent on external investment or business formation.
- The AI assistant quality is dependent on Google Gemini's availability and API quotas.

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API quota exhaustion (Gemini) | Medium | Low | Chatbot is non-critical; degrades gracefully |
| Scope creep in future phases | Medium | Medium | Clear out-of-scope definition in this document |
| Dependency on third-party services (Stripe, Gemini) | Low | High | Abstracted at service layer; replaceable without core changes |
| Regulatory requirements on commercial launch | Low (now) | High | GDPR consent, Privacy Policy, Terms of Service, EU ODR/PCS link, e‑commerce information duties, return policy compliance, cookie banner, VAT and invoicing requirements |


---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, Angular Material 20, Tailwind CSS 4 |
| Backend | ASP.NET Core 9, Entity Framework Core 9 |
| Database | SQL Server 2022 |
| Cache | Redis 7 |
| AI | Google Gemini |
| Email | MailKit 4.11 (SMTP) |
| Container | Docker Compose |

---

## 10. Related Documents

| Document | Description |
|---|---|
| [`business_case.md`](./business_case.md) | Market opportunity, revenue model and investment rationale |
| [`requirements.md`](./requirements.md) | Functional and non-functional requirements |
| [`software_design_document.md`](./software_design_document.md) | Architecture, entities, patterns and design decisions |
| [`api_specification.md`](./api_specification.md) | Full REST API reference |
| [`security.md`](./security.md) | Security model, authentication design and compliance notes |
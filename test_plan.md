# Test Plan
**Framework:** xUnit (.NET)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Scope](#2-test-scope)
3. [Test Strategy](#3-test-strategy)
4. [Test Cases -- Auth Service](#4-test-cases----auth-service)
5. [Test Cases -- Coupon](#5-test-cases----coupon)
6. [Test Cases -- Cart](#6-test-cases----cart)
7. [Test Cases -- Payment and Orders](#7-test-cases----payment-and-orders)
8. [Test Cases -- Newsletter](#8-test-cases----newsletter)
9. [Test Cases -- Chatbot Input Validation](#9-test-cases----chatbot-input-validation)
10. [Test Cases -- Products](#10-test-cases----products)
11. [Test Summary](#11-test-summary)
12. [Related Documents](#12-related-documents)

---

## 1. Introduction

This document defines the test plan for the Lucina platform. It describes the test strategy adopted, the areas covered and the individual test cases executed against the backend API.

All tests are automated unit tests written in C# using the **xUnit** framework, targeting the ASP.NET Core 9 backend. Dependencies such as the database and Redis are mocked or replaced with in-memory equivalents to ensure tests are fast, isolated and repeatable.

---

## 2. Test Scope

| Area | In Scope | Out of Scope |
|---|---|---|
| Auth service | Yes | OAuth / third-party login |
| Coupon validation | Yes | Coupon UI rendering |
| Cart logic | Yes | Redis TTL behaviour (infrastructure) |
| Payment and orders | Yes | Real Stripe transaction processing |
| Newsletter | Yes | Email delivery (SMTP) |
| Chatbot input validation | Yes | Gemini API responses |
| Product catalogue | Yes | Image serving, CDN |
| Frontend (Angular) | No | Covered by manual exploratory testing |
| Deployment pipeline | No | Out of scope for v1.0 |

---

## 3. Test Strategy

### Approach

Each test targets a single unit of business logic in isolation. External dependencies (database, Redis, SMTP, Gemini API) are replaced with mocks or fakes using the `Moq` library and xUnit fixtures.

### Test Structure

Each test case follows the **Arrange / Act / Assert** pattern:

- **Arrange:** set up the system under test, mock dependencies and prepare input data.
- **Act:** invoke the method or endpoint under test.
- **Assert:** verify the output, return value or side effect matches the expected result.

### Naming Convention

Test method names follow the pattern: `MethodName_Scenario_ExpectedResult`

Example: `Login_WithInvalidPassword_Returns401`

### Test Execution

```bash
# Run all tests
dotnet test Lucina.Tests /p:UseAppHost=false

# Run with verbose output
dotnet test Lucina.Tests /p:UseAppHost=false --logger "console;verbosity=normal"

# Run a specific test class
dotnet test Lucina.Tests /p:UseAppHost=false --filter "FullyQualifiedName~AuthServiceTests"
```

> **Note:** `/p:UseAppHost=false` is required when the API is running via `dotnet watch run` alongside the tests, to avoid a file-lock conflict on `API.exe`.

---

## 4. Test Cases -- Auth Service

### 4.1 Registration

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-AUTH-01 | `Register_WithValidData_CreatesUser` | Register with valid name, email, password and consent | User created, tokens issued, 200 OK | [OK] |
| T-AUTH-02 | `Register_WithDuplicateEmail_Returns400` | Register with an email already in use | 400 Bad Request, "Email already in use" | [OK] |
| T-AUTH-03 | `Register_WithMissingConsent_Returns400` | Register without accepting GDPR consent | 400 Bad Request | [OK] Tested via `AuthControllerTests`: `ModelState.AddModelError` simulates DTO validation failure on the consent field, verifying the `!ModelState.IsValid` guard in `AuthController.Signup()` |
| T-AUTH-04 | `Register_PasswordIsHashed` | Verify stored password is never plain text | `PasswordHash` != original password, BCrypt valid | [OK] |

### 4.2 Login

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-AUTH-05 | `Login_WithValidCredentials_ReturnsTokens` | Login with correct email and password | 200 OK, access and refresh token cookies set | [OK] |
| T-AUTH-06 | `Login_WithWrongPassword_Returns401` | Login with correct email but wrong password | 401 Unauthorized, "Invalid credentials" | [OK] |
| T-AUTH-07 | `Login_WithUnknownEmail_Returns401` | Login with an email not in the database | 401 Unauthorized, "Invalid credentials" | [OK] |
| T-AUTH-08 | `Login_ErrorMessage_IsIdenticalForBothFailureCases` | Verify error message does not distinguish email vs password failure | Both return identical message (no user enumeration) | [OK] |

### 4.3 Token Refresh

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-AUTH-09 | `Refresh_WithValidToken_RotatesTokens` | Call refresh with a valid refresh token | New access and refresh tokens issued, old token invalidated | [OK] |
| T-AUTH-10 | `Refresh_WithExpiredToken_Returns401` | Call refresh with an expired refresh token | 401 Unauthorized | [OK] |
| T-AUTH-11 | `Refresh_WithRevokedToken_Returns401` | Call refresh with a token marked IsRevoked | 401 Unauthorized | [OK] |
| T-AUTH-12 | `Refresh_TokenIsStoredHashed` | Verify refresh token in DB is SHA-256 hashed | Stored value != raw token | [OK] |

### 4.4 Logout

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-AUTH-13 | `Logout_RevokesRefreshToken` | Call logout with authenticated session | RefreshToken.IsRevoked set to true in DB | [OK] |
| T-AUTH-14 | `Logout_ClearsCookies` | Verify cookies are cleared on logout | `access_token` and `refresh_token` cookies removed | [OK] Tested via `AuthControllerTests`: uses `DefaultHttpContext` and asserts that `Response.Headers["Set-Cookie"]` contains deletion entries for both tokens |

---

## 5. Test Cases -- Coupon

### 5.1 Validation

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CPN-01 | `ValidateCoupon_WithValidCode_ReturnsDiscount` | Validate an active, non-expired coupon with uses remaining | 200 OK, discount percentage returned | [OK] |
| T-CPN-02 | `ValidateCoupon_WithExpiredCode_Returns400` | Validate a coupon past its expiry date | 400 Bad Request, "Coupon expired" | [OK] |
| T-CPN-03 | `ValidateCoupon_WithInactiveCode_Returns400` | Validate a deactivated coupon | 400 Bad Request, "Coupon inactive" | [OK] |
| T-CPN-04 | `ValidateCoupon_WithExhaustedCode_Returns400` | Validate a coupon where UsedCount >= MaxUses | 400 Bad Request, "Coupon usage limit reached" | [OK] |
| T-CPN-05 | `ValidateCoupon_WithUnknownCode_Returns400` | Validate a code not in the database | 400 Bad Request, "Coupon not found" | [OK] |

### 5.2 Redemption

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CPN-06 | `RedeemCoupon_IncrementsUsedCount` | Redeem a valid coupon | UsedCount incremented by 1 in DB | [OK] |
| T-CPN-07 | `RedeemCoupon_AtMaxUses_Returns400` | Attempt to redeem when UsedCount == MaxUses | 400 Bad Request | [OK] [BUG] Bug found and fixed — `Redeem` was missing the `MaxUses` check; exhausted coupons could be redeemed indefinitely |

### 5.3 Admin Operations

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CPN-08 | `GenerateCoupon_AsAdmin_CreatesCoupon` | Admin creates a coupon with valid fields | 201 Created, coupon active in DB | [OK] |
| T-CPN-09 | `GenerateCoupon_AsUser_Returns403` | Non-admin user attempts to create a coupon | 403 Forbidden | [OK] Tested via reflection: verifies `[Authorize(Roles = "Admin")]` is present on the `Generate` action — attribute removal is immediately caught |
| T-CPN-10 | `DeactivateCoupon_AsAdmin_SetsIsActiveFalse` | Admin deactivates an existing coupon | IsActive set to false in DB | [OK] |

---

## 6. Test Cases -- Cart

### 6.1 Adding Items

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CART-01 | `AddToCart_WithAvailableStock_SavesReservation` | Add a product with sufficient stock | Item saved in Redis, soft reservation created | [OK] |
| T-CART-02 | `AddToCart_ExceedingStock_Returns400` | Add more units than available stock | 400 Bad Request, available units returned | [OK] |
| T-CART-03 | `AddToCart_WithQuantityZero_Returns400` | Add an item with quantity 0 | 400 Bad Request | [OK] |
| T-CART-04 | `AddToCart_WithNegativeQuantity_Returns400` | Add an item with negative quantity | 400 Bad Request | [OK] |
| T-CART-05 | `AddToCart_ExceedingMaxCap_Returns400` | Add more than 99 units of a product | 400 Bad Request | [OK] |
| T-CART-06 | `AddToCart_WithUnknownProduct_Returns404` | Add a product ID that does not exist | 404 Not Found | [OK] |

### 6.2 Removing Items

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CART-07 | `RemoveFromCart_ReleasesReservation` | Remove a product from the cart | Redis reservation released immediately | [OK] |
| T-CART-08 | `RemoveFromCart_NotOwner_Returns403` | Attempt to remove from another user's cart | 403 Forbidden | [OK] |

### 6.3 Stock Availability

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-CART-09 | `GetAvailableStock_ExcludesOtherUsersReservations` | Stock check excludes units reserved by other users | Available = physicalStock - reservedByOthers | [OK] |
| T-CART-10 | `GetAvailableStock_IncludesOwnReservation` | Stock check includes caller's own reservation | Own reserved units not subtracted from available | [OK] |

---

## 7. Test Cases -- Payment and Orders

### 7.1 Order Creation

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-PAY-01 | `CreateOrder_WithValidCart_CreatesOrderInDB` | Confirm order with a valid cart and shipping address | Order and OrderItems persisted in DB | [OK] |
| T-PAY-02 | `CreateOrder_DecrementsProductStock` | Confirm order with multiple items | QuantityInStock decremented for each product | [OK] |
| T-PAY-03 | `CreateOrder_ReleasesRedisReservations` | Confirm order clears cart reservations | Redis cart entries removed | [OK] |
| T-PAY-04 | `CreateOrder_ForAnotherUser_Returns403` | Attempt to create order using another user's cart | 403 Forbidden | [OK] |
| T-PAY-05 | `CreateOrder_WithOutOfStockItem_Returns400` | Confirm order when stock was depleted between cart add and checkout | 400 Bad Request | [OK] [BUG] Bug found and fixed — `CreateOrderAsync` had no stock guard; exhausted stock could still generate orders. Guard added before order creation in `PaymentService` |

### 7.2 Order Retrieval

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-PAY-06 | `GetOrder_ReturnsCorrectItems` | Retrieve an order by ID | Order returned with all items and correct totals | [OK] |
| T-PAY-07 | `GetOrder_ForAnotherUser_Returns403` | Retrieve an order belonging to a different user | 403 Forbidden | [OK] |
| T-PAY-08 | `GetUserOrders_ReturnsOnlyOwnOrders` | List orders for authenticated user | Only orders belonging to that user returned | [OK] |

---

## 8. Test Cases -- Newsletter

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-NEWS-01 | `Subscribe_WithNewEmail_CreatesSubscription` | Subscribe with an email not previously registered | Subscription saved with IsActive = true | [OK] |
| T-NEWS-02 | `Subscribe_WithExistingEmail_Returns409` | Subscribe with an already subscribed email | 409 Conflict | [OK] |
| T-NEWS-03 | `Subscribe_SendsWelcomeEmail` | Verify welcome email is triggered on subscription | SMTP service called with WELCOME15 coupon | [OK] |
| T-NEWS-04 | `Unsubscribe_SetsIsActiveFalse` | Unsubscribe an active subscription | IsActive set to false, record preserved | [OK] |
| T-NEWS-05 | `Unsubscribe_PreservesRecord` | Verify unsubscribe does not delete the DB record | Record still present in DB after unsubscribe | [OK] |

---

## 9. Test Cases -- Chatbot Input Validation

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-BOT-01 | `SendMessage_WithValidInput_CallsGemini` | Send a valid message with valid history | Gemini API invoked, response returned | [OK] |
| T-BOT-02 | `SendMessage_WithEmptyMessage_Returns400` | Send an empty string as message | 400 Bad Request | [OK] |
| T-BOT-03 | `SendMessage_ExceedingCharLimit_Returns400` | Send a message longer than 500 characters | 400 Bad Request | [OK] |
| T-BOT-04 | `SendMessage_WithHistoryExceedingLimit_Returns400` | Send more than 20 history entries | 400 Bad Request | [OK] |
| T-BOT-05 | `SendMessage_WithInvalidSenderField_Returns400` | History entry with sender value other than "user" or "bot" | 400 Bad Request | [OK] |
| T-BOT-06 | `SendMessage_WithHistoryMessageTooLong_Returns400` | History entry with text exceeding 500 characters | 400 Bad Request | [OK] |

---

## 10. Test Cases -- Products

| ID | Test Name | Description | Expected Result | Status |
|---|---|---|---|---|
| T-PROD-01 | `GetProducts_ReturnsPagedResults` | Request product list with default pagination | Paginated response with correct count and data | [OK] |
| T-PROD-02 | `GetProducts_FilterByBrand_ReturnsMatchingProducts` | Filter by a specific brand | Only products of that brand returned | [OK] |
| T-PROD-03 | `GetProducts_FilterByType_ReturnsMatchingProducts` | Filter by a specific product type | Only products of that type returned | [OK] |
| T-PROD-04 | `GetProducts_SearchByKeyword_ReturnsMatchingProducts` | Search by keyword present in product name | Matching products returned | [OK] |
| T-PROD-05 | `GetProducts_SortByPriceAsc_ReturnsSortedResults` | Sort by price ascending | Products ordered from lowest to highest price | [OK] |
| T-PROD-06 | `GetProducts_SortByPriceDesc_ReturnsSortedResults` | Sort by price descending | Products ordered from highest to lowest price | [OK] |
| T-PROD-07 | `GetProductById_WithValidId_ReturnsProduct` | Retrieve a single product by valid ID | Product returned with all fields | [OK] |
| T-PROD-08 | `GetProductById_WithInvalidId_Returns404` | Retrieve a product with a non-existent ID | 404 Not Found | [OK] |

---

## 11. Test Summary

| Area | Planned | Implemented | Passing |
|---|---|---|---|
| Auth Service | 14 | 12 | 12 |
| Auth Controller | 2 | 2 | 2 |
| Coupon | 10 | 10 | 10 |
| Cart | 10 | 10 | 10 |
| Payment and Orders | 8 | 8 | 8 |
| Newsletter | 5 | 5 | 5 |
| Chatbot Input Validation | 6 | 6 | 6 |
| Products | 8 | 8 | 8 |
| **Total** | **61** | **61** | **61** |

**All 61 tests implemented and passing.**

### Pass Criteria

A build is considered stable when all 61 implemented test cases pass. Any failing test blocks a production deployment.

### Running the Full Suite

```bash
cd Lucina
dotnet test Lucina.Tests /p:UseAppHost=false
```

Expected output on a clean build:

```
Test Run Successful.
Total tests: 61
     Passed: 61
 Total time: < 10 seconds
```

### Implementation Notes

- **Test project:** `Lucina.Tests/` (xUnit 2.9, Moq 4.20, EF Core InMemory 9.0)
- **Production changes required by tests:**
  - `ICartService` interface extracted from `CartService` to enable mocking in controller tests.
  - `CouponController.Redeem` was missing a `MaxUses` guard — **bug found and fixed**.
  - `PaymentService.CreateOrderAsync` had no stock check — **bug found and fixed**: stock is now validated before order creation.
- **T-AUTH-03**: Tested via `AuthControllerTests` using `ModelState.AddModelError` to simulate DTO validation failure.
- **T-AUTH-14**: Tested via `DefaultHttpContext` — `Response.Headers["Set-Cookie"]` inspected for cookie deletion entries.
- **T-CPN-09**: Tested via reflection — `[Authorize(Roles = "Admin")]` attribute presence verified on the `Generate` method.
- **SDK workaround:** `<StaticWebAssetsEnabled>false</StaticWebAssetsEnabled>` added to the Debug `PropertyGroup` in `API.csproj` to prevent a case-insensitive filesystem conflict (SDK 9.0.300) when the test project references the API project.

---

## 12. Related Documents

| Document | Description |
|---|---|
| [`software_requirements_specification.md`](./software_requirements_specification.md) | Requirements each test case validates |
| [`software_design_document.md`](./software_design_document.md) | Architecture and sequence diagrams for reference |
| [`api_specification.md`](./api_specification.md) | Endpoint contracts verified by the tests |
| [`security.md`](./security.md) | Security requirements covered by auth and cart tests |
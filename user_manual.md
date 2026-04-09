# User Manual

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - 2.1 [Creating an Account](#21-creating-an-account)
   - 2.2 [Logging In](#22-logging-in)
   - 2.3 [Logging Out](#23-logging-out)
3. [Browsing Products](#3-browsing-products)
   - 3.1 [Searching and Filtering](#31-searching-and-filtering)
   - 3.2 [Product Detail Page](#32-product-detail-page)
4. [Wishlist](#4-wishlist)
   - 4.1 [Saving a Product](#41-saving-a-product)
   - 4.2 [Viewing Your Wishlist](#42-viewing-your-wishlist)
5. [Shopping Cart](#5-shopping-cart)
   - 5.1 [Adding Products](#51-adding-products)
   - 5.2 [Removing or Adjusting Items](#52-removing-or-adjusting-items)
   - 5.3 [Choosing a Delivery Option](#53-choosing-a-delivery-option)
6. [Checkout](#6-checkout)
   - 6.1 [Applying a Coupon](#61-applying-a-coupon)
   - 6.2 [Entering a Shipping Address](#62-entering-a-shipping-address)
   - 6.3 [Choosing a Payment Method](#63-choosing-a-payment-method)
   - 6.4 [Order Summary](#64-order-summary)
   - 6.5 [Completing Payment](#65-completing-payment)
7. [Your Account](#7-your-account)
   - 7.1 [Order History](#71-order-history)
   - 7.2 [Printing an Invoice](#72-printing-an-invoice)
   - 7.3 [Updating Your Profile](#73-updating-your-profile)
8. [K-Beauty Assistant](#8-k-beauty-assistant)
9. [Newsletter](#9-newsletter)
10. [About Us](#10-about-us)
11. [Skincare Routine](#11-skincare-routine)
12. [Contact Us](#12-contact-us)
13. [Admin Guide](#13-admin-guide)
    - 13.1 [Creating a Coupon](#131-creating-a-coupon)
    - 13.2 [Viewing and Deactivating Coupons](#132-viewing-and-deactivating-coupons)
14. [Frequently Asked Questions](#14-frequently-asked-questions)

---

## 1. Introduction

Welcome to **Lucina**, a K-Beauty e-commerce platform dedicated to Korean skincare products for the Italian market.

This manual explains how to use the platform step by step, from creating an account and browsing products to placing an order and getting help from the AI assistant. No technical knowledge is required.

![Lucina homepage](docs/images/manual/home.jpeg)

---

## 2. Getting Started

### 2.1 Creating an Account

You can browse and add items to your cart without an account. However, you will need to register before placing an order.

To create an account:

1. Click **Profile** in the top navigation bar.
2. Select **Register**.
3. Fill in your name, email address and a password.
4. Read and accept the Privacy Policy and Terms of Service by checking the consent box.
5. Click **Create account**.

You will be logged in automatically and redirected to the homepage.

![Registration form](docs/images/manual/register.jpeg)

> **Note:** Your email address must be unique. If you see an error saying the email is already in use, try logging in instead or use a different address.

### 2.2 Logging In

1. Click **Profile** in the navigation bar.
2. Select **Login**.
3. Enter your email and password.
4. Click **Sign in**.

![Login form](docs/images/manual/login.jpeg)

Your session will remain active automatically. You will not be asked to log in again unless you log out manually or your session expires after an extended period of inactivity.

### 2.3 Logging Out

1. Click your name or the profile icon in the navigation bar.
2. Select **Logout**.

Your session will be terminated securely.

![Logout](docs/images/manual/logout.png)

---

## 3. Browsing Products

### 3.1 Searching and Filtering

From the **Shop** page you can:

- **Search** for a product by typing a keyword in the search bar (e.g. "serum", "COSRX", "moisturiser").
- **Filter** by brand or product type using the filter panel on the left.
- **Sort** results by price (low to high, high to low) or by name.

Results update automatically as you apply filters. You can combine search, filter and sort at the same time.

![Shop overview](docs/images/manual/shop.jpeg)

![Search bar](docs/images/manual/search.jpeg)

![Filter panel](docs/images/manual/filter.jpeg)

![Sort options](docs/images/manual/sort.jpeg)

### 3.2 Product Detail Page

Click any product to open its detail page. Here you will find:

- Full product description
- Price
- Brand and product type
- Available stock
- An **Add to cart** button

If a product is out of stock, the button will be disabled.

![Product detail page](docs/images/manual/detail_product.jpeg)

---

## 4. Wishlist

The wishlist lets you save products you are interested in so you can find them again quickly without adding them to your cart.

### 4.1 Saving a Product

On the **Shop** page, every product card displays a heart icon in the top-right corner of the product image.

- Click the heart icon to **add** the product to your wishlist. The icon turns red to confirm it has been saved.
- Click the red heart again to **remove** the product from your wishlist.

![Like button on product card](docs/images/manual/like.png)

> **Note:** The wishlist is saved in your browser. It does not require an account and is not tied to any specific device. Clearing your browser data will reset the wishlist.

### 4.2 Viewing Your Wishlist

Click the heart icon in the navigation bar (or the **Wishlist** link in the footer) to open the **La Mia Wishlist** page. If you have saved any products, they will appear in a grid with their name, price and an **Aggiungi al carrello** button.

- To add a product to your cart directly from the wishlist, click **Aggiungi al carrello**.
- To remove a product from the wishlist, click the X icon in the top-right corner of its card.

If the wishlist is empty, you will see a message inviting you to browse the shop.

![Wishlist page](docs/images/manual/wishlist.png)

---

## 5. Shopping Cart

### 5.1 Adding Products

On any product detail page, select the quantity you want and click **Add to cart**. The cart icon in the navigation bar will update to show the number of items.

![Cart page](docs/images/manual/add_to_cart.jpeg)

> **Note:** You cannot add more units than are currently in stock. The maximum quantity per product is 99.

### 5.2 Removing or Adjusting Items

Open your cart by clicking the cart icon in the navigation bar.

- To **increase** or **decrease** the quantity of an item, use the + and - buttons next to it.
- To **remove** an item entirely, click the bin icon next to it.

The order summary on the right updates automatically as you make changes.

![Adding product](docs/images/manual/add_product.jpeg)


> **Note:** Your cart is saved on the server, so it will still be there if you close the browser and come back later. Items in your cart are soft-reserved for 10 minutes of inactivity. After that, the reservation expires and the stock becomes available to other users again.

### 5.3 Choosing a Delivery Option

At the bottom of the cart you can select your preferred delivery method. Each option shows the estimated delivery time and cost.

![Delivery options](docs/images/manual/delivery.jpeg)

> **Tip:** Orders of EUR 65 or more qualify for free standard shipping.

---

## 6. Checkout

You must be logged in to proceed to checkout.

### 6.1 Applying a Coupon

In the cart or at checkout, enter your coupon code in the **Coupon code** field and click **Apply**.

- If the code is valid, the discount will be applied to your order total immediately.
- If the code is invalid, expired or has already reached its usage limit, you will see an error message explaining why.

![Coupon field](docs/images/manual/coupon.jpeg)
You can only apply one coupon per order.

### 6.2 Entering a Shipping Address

At checkout, fill in your shipping address: full name, street address, city, postal code and country.

![Shipment options](docs/images/manual/shipment.jpeg)

Make sure the address is complete and correct before proceeding.

### 6.3 Choosing a Payment Method

After entering your shipping address, you will be asked to select a payment method. Choose your preferred option and click **Riepilogo** to proceed.

![Payment method](docs/images/manual/payment_method.jpeg)

### 6.4 Order Summary

Review your full order before confirming: items, quantities, delivery option, coupon discount (if any), payment method and total. If everything looks correct, click **Completa il pagamento**.

![Order summary](docs/images/manual/summary.jpeg)

### 6.5 Completing Payment

You will be taken to the payment page, which simulates a connection to your bank for payment approval. Wait for the process to complete. Once approved, you will be automatically redirected to the homepage.

> **Note:** The payment flow is simulated. No real transaction takes place and no card data is required or stored.

---

## 7. Your Account

### 7.1 Order History

To view your past orders:

1. Click your name or the profile icon in the navigation bar.
2. Select **My profile**.
3. Go to the **Orders** tab.

You will see a list of all your orders with their status, date and total. Click any order to see the full detail, including the items purchased and the shipping address used.

![Order history](docs/images/manual/my-orders.png)

### 7.2 Printing an Invoice

From the order detail page, click **Print invoice**. Your browser's print dialog will open. You can print to paper or save as a PDF.

![Invoice](docs/images/manual/invoice.png)

### 7.3 Updating Your Profile

1. Go to **My profile**.
2. Click **Edit profile**, the pencil.
3. Update your name, phone number or address.
4. Click **Save**.

Your email address cannot be changed after registration.

![Update profile form](docs/images/manual/update_profile.jpeg)

---

## 8. K-Beauty Assistant

Lucina includes an AI-powered assistant that can help you with questions about Korean skincare routines, ingredients, product recommendations and K-Beauty in general.

To use the assistant:

1. Click the chat icon, usually visible in the bottom-right corner of the page.
2. Type your question in Italian.
3. The assistant will reply with personalised guidance.

![Lucina AI assistant](docs/images/manual/lucina_assistant.png)

**Tips for getting the best answers:**

- Keep your messages under 500 characters.
- Ask specific questions, such as "What is a good routine for dry skin?" or "What does niacinamide do?"
- The assistant is focused on K-Beauty topics only. Questions outside this area will be politely declined.

---

## 9. Newsletter

To subscribe to the Lucina newsletter and receive a welcome discount:

1. Scroll to the newsletter section on the homepage (or the footer).
2. Enter your email address.
3. Click **Subscribe**.

You will receive a welcome email with a promotional coupon code. The coupon can be used at your next checkout.

To unsubscribe at any time, click the **Unsubscribe** link at the bottom of any newsletter email.

![Newsletter](docs/images/manual/newsletter.png)

---

## 10. About Us

The **About Us** page tells the story of Lucina and explains the values behind the brand.

To reach it, click **About us** in the navigation bar or footer.

The page is divided into three sections:

- **Our mission**: Why Lucina was created and what it stands for: making high-quality Korean skincare accessible and turning self-care into a conscious, enjoyable ritual.
- **Our values**: The three pillars that guide the brand: quality, sustainability and community.
- **Our story**: A timeline of Lucina's key milestones, from the early idea to the launch of the platform.

![About us page](docs/images/manual/about_us.jpeg)

---

## 11. Skincare Routine

The **Skincare Routine** page helps you build a personalised K-Beauty routine based on your skin type.

To reach it, click **Skincare Routine** in the navigation bar.

### 11.1 Selecting Your Skin Type

At the top of the page, choose one of the four skin types:

| Skin type | Description |
|---|---|
| Normal | Balanced, no specific concerns |
| Dry | Tight or flaky, needs extra hydration |
| Oily | Shiny, prone to enlarged pores |
| Combination | Oily in the T-zone, drier on the cheeks |

The recommended routine updates automatically to suit your selection.

### 11.2 Morning and Evening Routines

Use the **Morning** and **Evening** tabs to switch between the two routines. Each step card shows:

- The step number and product category (e.g. Cleanser, Toner, Serum)
- A short description of what to do and why
- The recommended frequency and approximate time
- A suggested product from the Lucina catalogue, with a direct link to its detail page

Follow the steps in order for best results.

![Skincare routine page](docs/images/manual/skincare_routine.jpeg)

---

## 12. Contact Us

If you have a question, feedback or a problem that is not covered in this manual:

1. Go to the **Contact us** page from the navigation bar.
2. Fill in your name, email address and message.
3. Click **Send**.

Your message will be delivered to the Lucina team by email. You will receive a reply at the address you provided.

![Contact us form](docs/images/manual/contact_us.jpeg)

---

## 13. Admin Guide

This section is intended for users with Admin access only. Admin accounts are assigned manually and cannot be created through the registration form.

### 13.1 Creating a Coupon

1. Log in with your Admin account.
2. Go to the **Admin** section from the navigation bar.
3. Click **Create coupon**.
4. Fill in the following fields:

| Field | Description |
|---|---|
| Code | The code users will enter at checkout (e.g. SUMMER20) |
| Discount | Percentage discount applied to the order subtotal |
| Max uses | Maximum number of times the coupon can be redeemed |
| Expiry date | Date after which the coupon is no longer valid |

5. Click **Generate**.

The coupon is immediately active and available for use.

### 13.2 Viewing and Deactivating Coupons

1. Go to the **Admin** section.
2. Select **Coupons**.

You will see a list of all coupons with their code, discount percentage, current usage count, max uses, expiry date and status (active / inactive).

To deactivate a coupon before its expiry date, click **Deactivate** next to it. The coupon will be rejected immediately if a user tries to apply it.

---

## 14. Frequently Asked Questions

The **FAQ** page offers a searchable, categorised list of common questions. To reach it, click **FAQ** in the footer or navigation bar.

Use the search bar at the top to find a specific topic, or browse by category (Account, Orders, Payments, Shipping & Returns). Click any question to expand the answer.

![FAQ page](docs/images/manual/faq.jpeg)

If you cannot find what you need, use the [Contact Us](#11-contact-us) form.

---

**Do I need an account to browse products?**
No. You can browse the catalogue and add items to your cart without registering. You will only need an account when you proceed to checkout.

**My cart disappeared. What happened?**
Cart reservations expire after 10 minutes of inactivity. If you were away for a while, the items may have been released. Simply add them to your cart again.

**The coupon code I have is not working. Why?**
There are a few possible reasons: the code may have expired, reached its maximum number of uses, or been deactivated by an administrator. Check the exact code for typos and try again.

**Can I change my order after confirming it?**
No. Once an order is confirmed it cannot be modified. If you need assistance, please use the Contact us form.

**Is my payment information stored?**
Payment processing is not yet active in this version. No payment card data is collected or stored.

**How do I unsubscribe from the newsletter?**
Click the **Unsubscribe** link at the bottom of any newsletter email. You will be removed from the mailing list immediately.

**I forgot my password. How do I reset it?**
Password reset is not yet available in v1.0. Please contact us via the Contact us page for assistance.
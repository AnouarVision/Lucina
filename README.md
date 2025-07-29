# Lucina - Korean Skincare E-commerce

**Lucina** is a modern e-commerce platform focused on delivering high-quality Korean skincare products to the Italian market. Built with **Angular**, **.NET Core** and **Stripe**, the project offers a full-stack implementation of an online store with an optimized shopping experience, clean architecture and enterprise-level scalability.

---

## Features

- Complete e-commerce workflow (browsing, basket, checkout)
- Secure login and registration using ASP.NET Identity
- Stripe integration with EU-compliant 3D Secure payments
- Basket persistence with Redis
- Product filtering, sorting, searching, and pagination
- Order creation and payment flow
- Mobile-first responsive UI with Angular Material & Tailwind CSS
- Clean architecture with Repository & Unit of Work patterns
- Admin-ready backend with role-based access
- Blog, reviews and content-ready structure
- Cloud-deployable to Microsoft Azure

---

## Tech Stack

| Layer         | Technology                     |
|---------------|--------------------------------|
| Frontend      | Angular, Angular Material, Tailwind CSS |
| Backend       | ASP.NET Core, Entity Framework Core |
| Authentication| ASP.NET Identity, Role-based auth |
| Database      | SQL Server + Redis             |
| Payments      | Stripe                         |
| Hosting       | Azure                          |
| Realtime      | SignalR (optional integration) |

---

## Architecture Overview

- Modular architecture with **lazy-loaded Angular modules**
- Separation of concerns via **Repository**, **Unit of Work** and **Specification Pattern**
- Use of **multiple DbContext boundaries** for clear responsibility
- Built-in **admin panel** features (e.g., manage products, roles)
- Optional integrations: ERP systems, email marketing tools

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lucina-ecommerce.git
   cd lucina-ecommerce
   
2. **Set up the backend**
   ```bash
   cd API
   dotnet restore
   dotnet ef database update
   dotnet run
   
3. **Set up the frontend**
   ```bash
   cd client
   npm install
   ng serve

4. **Set up Redis (optional for basket)**
   - Requires Redis installed and running locally or remotely.


## 5. Environment Configuration

Before running the application, make sure to configure the necessary environment variables and settings for both the **backend** and **frontend**.

---

### Backend (`appsettings.Development.json`)

Create a file named `appsettings.Development.json` in the `API` project root with the following structure:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=<yourServer>,1433;Database=<yourDatabase>;User Id=<yourId>;Password=Password@1;TrustServerCertificate=True"
  },
  "StripeSettings": {
    "PublishableKey": "<your-publishable-key>",
    "SecretKey": "<your-secret-key>"
  }
}
```

Replace <yourServer>, <yourDatabase>, <yourId>, <your-publishable-key>, <yourServer>, <yourDatabase>, <yourId> and <your-secret-key> with your actual credentials.

### Frontend (`environment.ts`)
In the client/src/environments/environment.ts file, configure the frontend environment as follows:

```ts
export const environment = {
   production: false,
   apiUrl: 'https://localhost:5001/api/',
   stripePublicKey: '<your-publishable-key>'
};
```

### Notes

- The backend runs on port **5001** by default (HTTPS).  
  Make sure it's not blocked by your firewall or any antivirus software.

- **Redis** must be installed and running (locally or remotely) for **shopping cart (basket)** persistence.

- For development with **SQL Server in Docker**, remember to expose port **1433** and accept TCP connections.  
  You can use the following command to quickly spin up a development-ready SQL Server instance:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Password@1" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server

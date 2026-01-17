# TrackMed User Backend (Consumer Mobile App)

Backend API for the TrackMed consumer mobile application (Kotlin).

## Features

- 🔐 **Authentication**: JWT-based auth with refresh tokens, device management
- 👤 **Profile Management**: User profile, addresses, preferences
- 📱 **QR Code Scanning**: Scan medicines and view detailed information
- 🛒 **Shopping Cart**: Add/remove medicines, update quantities
- 📦 **Orders**: Place orders, track delivery, order history
- 💳 **Payments**: Razorpay integration for secure payments

## Tech Stack

- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (shared with admin-be via Prisma)
- **Auth**: JWT (Access + Refresh tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
user-be/
├── src/
│   ├── config/          # Database, environment config
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── index.ts         # App entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new consumer
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `DELETE /api/profile` - Delete account

### Addresses
- `GET /api/profile/addresses` - List addresses
- `POST /api/profile/addresses` - Add address
- `PUT /api/profile/addresses/:id` - Update address
- `DELETE /api/profile/addresses/:id` - Delete address
- `PATCH /api/profile/addresses/:id/default` - Set default address

### Scan & Medicine
- `POST /api/scan` - Scan QR code and get medicine details
- `GET /api/medicine/:id` - Get medicine details by ID
- `GET /api/medicine/batch/:batchId` - Get batch details

### Cart
- `GET /api/cart` - Get cart with items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:batchId` - Update item quantity
- `DELETE /api/cart/items/:batchId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/payment` - Initiate payment
- `POST /api/orders/payment/verify` - Verify payment callback

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure `.env` with your database URL (same as admin-be)

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run migrations (if new models added):
   ```bash
   npm run prisma:migrate
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Notes

- Uses the same PostgreSQL database as admin-be
- Prisma schema is located in admin-be/prisma/schema.prisma
- Consumer-specific models: Address, Cart, CartItem, Order, OrderItem, RefreshToken
- Port 3001 (admin-be uses 3000)

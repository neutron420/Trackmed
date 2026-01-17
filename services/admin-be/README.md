# TrackMed Backend API

Backend API for TrackMed - Medicine tracking system with blockchain verification.

## Architecture

**IMPORTANT**: Blockchain and Database are COMPLETELY SEPARATE.

- **Blockchain (Solana)**: Stores ONLY immutable proof data
  - `batch_hash`
  - `manufacturer_wallet`
  - `manufacturing_date`
  - `expiry_date`
  - `status` (valid/recalled)
  - `created_at`

- **Database (PostgreSQL)**: Stores all business details
  - User accounts and roles
  - Medicine details (name, strength, composition, MRP, etc.)
  - Manufacturer textual details
  - QR code mappings
  - Scan logs and device/location data
  - Fraud alerts
  - Lifecycle status
  - Image URLs
  - Analytics and reports

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

4. **Generate Anchor IDL**
   ```bash
   # From project root
   anchor build
   anchor idl parse -f programs/solana_test_project/src/lib.rs -o admin-be/src/idl/solana_test_project.json
   ```
   Then convert the JSON IDL to TypeScript format in `src/idl/solana_test_project.ts`

5. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Batch Verification
- `GET /api/batch/:batchHash` - Verify batch using blockchain and return combined data
- `POST /api/batch/verify-qr` - Verify QR code and return combined batch data

### Scan Logs
- `GET /api/scan/logs` - Get scan logs with pagination
- `GET /api/scan/logs/:batchId` - Get scan logs for a specific batch

### Fraud Alerts
- `GET /api/fraud/alerts` - Get fraud alerts with pagination
- `POST /api/fraud/alerts` - Create a fraud alert
- `PATCH /api/fraud/alerts/:id/resolve` - Resolve a fraud alert

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Combined Batch Data

When verifying a batch or QR code, the API returns combined blockchain + database data:

```json
{
  "success": true,
  "data": {
    "blockchain": {
      "batchHash": "...",
      "manufacturerWallet": "...",
      "manufacturingDate": "...",
      "expiryDate": "...",
      "status": "Valid",
      "pda": "...",
      "isExpired": false,
      "isVerified": true
    },
    "database": {
      "id": "...",
      "batchNumber": "...",
      "manufacturer": { ... },
      "medicine": { ... },
      "quantity": 1000,
      "lifecycleStatus": "IN_PRODUCTION",
      ...
    }
  }
}
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio to view database

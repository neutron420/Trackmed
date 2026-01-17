TrackMed User App (Android, Kotlin)
===================================

Purpose
-------
Mobile client for TrackMed end users (ordering, tracking, notifications, payments). This app consumes existing services:
- User API: http://localhost:3001 (dev) or http://api.trackmed.local (via nginx)
- WebSocket: ws://localhost:3003 (dev) or ws://ws.trackmed.local
- Admin API is not needed client-side except for data fetched through User API.

Prerequisites
-------------
- Android Studio Flamingo or newer
- JDK 17+
- Android SDK 34+
- Node/Docker only if you run backends locally

Backend Services (local dev)
----------------------------
From repository root:
```
# User API
cd services/user-be && npm install && npm run dev

# WebSocket server
cd services/websocket && npm install && npm run dev

# Optional: admin API if needed by flows
cd services/admin-be && npm install && npm run dev
```

Environment Targets
-------------------
Use build variants or a simple constants file (e.g., `Config.kt`) to switch between environments.

- DEV
	- `API_BASE_URL = http://10.0.2.2:3001` (Android emulator) or your LAN IP
	- `WS_BASE_URL = ws://10.0.2.2:3003`
	- `RAZORPAY_KEY_ID = rzp_test_xxx`
- PROD
	- `API_BASE_URL = https://api.trackmed.local`
	- `WS_BASE_URL = wss://ws.trackmed.local`
	- `RAZORPAY_KEY_ID = rzp_live_xxx`

Suggested Stack
---------------
- UI: Jetpack Compose
- DI: Hilt
- Networking: Retrofit + OkHttp + Moshi
- Auth: Bearer tokens (access + refresh) stored in EncryptedSharedPreferences or DataStore
- WS: OkHttp WebSocket client
- Coroutines + Flows
- Image: Coil
- Payments: Razorpay Android SDK
- Push: OneSignal Android SDK (use app ID from backend env)

Key Flows
---------
- Auth: Login -> store access/refresh -> attach Authorization: Bearer <token> to requests
- Refresh tokens: call refresh endpoint before expiry; on 401 retry once after refresh
- Payments: create order on User API, open Razorpay Checkout with returned order_id, verify on success
- Real-time: connect to WS for order status updates

Gradle Dependencies (minimal starting point)
--------------------------------------------
Add to `app/build.gradle.kts`:
```
implementation("androidx.core:core-ktx:1.13.1")
implementation("androidx.activity:activity-compose:1.9.2")
implementation("androidx.compose.ui:ui:1.7.5")
implementation("androidx.compose.material3:material3:1.3.0")
implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
implementation("com.google.dagger:hilt-android:2.52")
kapt("com.google.dagger:hilt-android-compiler:2.52")
implementation("com.squareup.retrofit2:retrofit:2.11.0")
implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
implementation("io.coil-kt:coil-compose:2.7.0")
implementation("com.razorpay:checkout:1.6.40")
implementation("com.onesignal:OneSignal:5.1.12")
```

API Contracts (user-be)
-----------------------
Check the backend tests and routes in [services/user-be](services/user-be) for exact schemas. Common endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me`
- `GET /api/orders` and `POST /api/orders`
- `POST /api/payments/razorpay/order` (creates order_id for checkout)

WebSocket
---------
- Connect to `WS_BASE_URL` with Authorization header (`Bearer <access_token>`)
- Listen for order status events; keep a reconnect/backoff strategy

Push Notifications
------------------
- Use OneSignal App ID from backend env (`ONESIGNAL_APP_ID` in services/user-be/.env)
- Register device, send player ID to backend if required for targeted pushes

Project Layout (suggested)
--------------------------
```
apps/user-app/
	app/
		src/main/java/.../common/   # models, util
		src/main/java/.../data/     # api, repositories
		src/main/java/.../domain/   # use cases
		src/main/java/.../ui/       # compose screens
		src/main/java/.../di/       # hilt modules
```

Build and Run
-------------
1) Open `apps/user-app` in Android Studio.
2) Set `Config.kt` or BuildConfig fields for `API_BASE_URL`, `WS_BASE_URL`, `RAZORPAY_KEY_ID`, `ONESIGNAL_APP_ID`.
3) Select a device/emulator and Run.

Quality Checklist
-----------------
- Handle offline/slow network gracefully
- Securely store tokens (EncryptedSharedPreferences/DataStore)
- Proper error surfaces for payments and auth
- Reconnect WS with backoff
- Do not ship test keys in production builds

Notes
-----
- For emulators, use `10.0.2.2` to reach host services on localhost.
- If running via Docker with nginx, use the provided domain mappings (admin/user/ws). Adjust `/etc/hosts` if needed.

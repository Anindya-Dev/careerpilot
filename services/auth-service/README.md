# CareerPilot Authentication Microservice

**Owner**: Md Hussain Ansari (Member 1)  
**Stack**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt (12 rounds)  
**Port**: `5001` (configurable via `PORT` in `.env`)

---

## 1. Overview
The Auth Service provides isolated user identity, credential encryption, and session lifecycle management for CareerPilot. It isolates authentication concerns from the Python multi-agent orchestration layer.

## 2. API Endpoints (v1)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Liveness probe returning `{ status: 'healthy', service: 'auth-service' }` |
| `GET` | `/ready` | No | Readiness probe verifying active MongoDB connectivity |
| `POST` | `/api/v1/auth/register` | No (Rate Limited) | Creates student account with 12-round bcrypt hash, returns JWTs |
| `POST` | `/api/v1/auth/login` | No (Rate Limited) | Validates credentials, issues access token, sets httpOnly refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Cookie / Body | Rotates refresh token, detects reuse, issues fresh token pair |
| `POST` | `/api/v1/auth/logout` | Yes (Bearer) | Invalidate refresh token session in database, clears auth cookie |
| `GET` | `/api/v1/auth/me` | Yes (Bearer) | Returns authenticated user profile details |
| `POST` | `/api/v1/auth/forgot-password` | No (Rate Limited) | Generates 1-hour crypto reset token and logs URL to server console |
| `POST` | `/api/v1/auth/reset-password` | No (Rate Limited) | Validates crypto token and updates bcrypt password hash |

## 3. Security Highlights
- **12-Round Bcrypt**: Password hashes computed using 12 salt rounds before database persistence.
- **Token Rotation**: Refresh tokens are cryptographically rotated on every refresh with reuse detection.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attempts (10 requests / 15 minutes).
- **Centralized Error Interceptor**: Structured errors conforming to `{ "success": false, "error": { "code": "...", "message": "..." } }`.

## 4. Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Run integration tests
npm test
```

## 5. Docker Containerization

```bash
docker build -t careerpilot-auth-service .
docker run -p 5001:5001 careerpilot-auth-service
```

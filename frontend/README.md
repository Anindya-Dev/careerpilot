# CareerPilot Client SPA Shell

**Owned by**: Md Hussain Ansari (Shell, Auth/Profile UI) & Sargam Banerjee (Dashboard, Data Visualizations)  
**Stack**: React 18, Vite, TailwindCSS, React Router v6, Axios, Lucide-react  
**Port**: `3000` (configurable in `vite.config.js`)

---

## 1. Overview
Provides the responsive SPA client shell for CareerPilot. Features secure JWT session handling, route guards, registration/login forms, profile management, and modular layout containers ready for Sargam's chart widgets.

## 2. Architecture & Modules
- `src/api/client.js` — Axios instances with JWT request/response interceptors.
- `src/context/AuthContext.jsx` — Global `useReducer` auth state (`login`, `register`, `logout`, token hydration).
- `src/context/ProfileContext.jsx` — Student profile context & CRUD operations.
- `src/routes/ProtectedRoute.jsx` — Unauthenticated traffic guard redirecting to `/login`.
- `src/pages/DashboardPage.jsx` — Authenticated dashboard shell with dedicated integration slots for Member 4 (Sargam):
  - `Slot A`: Career Health Index Dial
  - `Slot B`: Market Skill Alignment Radar Chart
- `src/pages/ProfilePage.jsx` — Complete Student Profile CRUD interface.

## 3. Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run development server
npm run dev

# Build production bundle
npm run build
```

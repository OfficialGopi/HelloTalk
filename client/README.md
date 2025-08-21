## HelloTalk Client (React + Vite)

Modern React app for real‑time chat with private and group conversations, file attachments, friend requests, notifications, and an admin dashboard.

### Stack

- React 19, Vite 7, TypeScript
- Redux Toolkit + RTK Query
- React Router 7, Socket.IO Client 4
- Tailwind CSS 4, Chart.js

### Requirements

- Node 18+

### Environment

Create `client/.env.local`:

```bash
VITE_SERVER=http://localhost:8080
```

This is used to construct `SERVER_URL` and `SERVER_API_URL`.

### Install & Run

```bash
cd client
npm i
npm run dev
```

Build & Preview

```bash
npm run build
npm run preview
```

### Scripts

- `dev`: Vite dev server
- `build`: Type check + production build
- `preview`: Preview built app
- `lint`: ESLint

### Routing

See `src/router/Router.tsx` for routes:

- App routes (protected by `ProtectedRoute`):
  - `/` (Home), `/chat/:chatId`, `/groups`
- Auth route: `/authenticate` (guarded to redirect if logged in)
- Admin routes: `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/chats`, `/admin/messages`

### State & Data

- Redux slices: `auth`, `chat`, `misc` in `src/redux/reducers/`
- RTK Query API in `src/redux/api/api.ts` with endpoints for chats, users, messages
- Axios instance for non-RTK calls: `src/utils/axiosInstace.util.ts`

### Realtime (Socket.IO)

- `src/lib/Socket.tsx` provides `SocketProvider` and `getSocket()`
- Connects to `VITE_SERVER` with `withCredentials: true`
- Events mirrored in `src/constants/events.ts`

### UI

- Components under `src/components/` (shared/dialogs/layout/ui)
- Tailwind utilities and `tailwind-merge` for style composition

### Docker

Produces a static build served by `serve` on port 3000.

```bash
docker build -t hellotalk-client ./client
docker run -p 3000:3000 hellotalk-client
```

### Notes

- Cookies from the server are `secure:true` and `sameSite:"none"`; for local HTTP dev, prefer HTTPS or adjust server cookie options for development only.

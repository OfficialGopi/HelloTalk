## HelloTalk Chat App

A full‑stack real‑time chat application with private and group chats, file attachments, friend requests, notifications, and an admin dashboard. Built with React + Vite on the client and Node.js + Express + Socket.IO on the server, using MongoDB and Cloudinary for storage.

![Logo](client/public/logo.png)

### Features

- **Authentication**: Username/password login, HTTP‑only cookie tokens, protected routes
- **Real‑time chat**: Socket.IO messaging, typing indicators, online users list
- **Group chats**: Create groups, add/remove members, leave group, rename, delete
- **Attachments**: Upload multiple files per message via Cloudinary
- **Social graph**: Search users, send/accept friend requests, notifications
- **Admin dashboard**: View users, chats, messages, and 7‑day message chart
- **WebRTC Communication**: Audio and video calls with real-time peer-to-peer connections
- **Modern UI**: React 19, Tailwind CSS, lazy‑loaded routes, toasts, charts

### Tech Stack

- **Client**: React 19, Vite 7, Redux Toolkit + RTK Query, React Router 7, Socket.IO Client, Tailwind CSS 4, Chart.js, WebRTC
- **Server**: Node.js, Express 5, TypeScript, Socket.IO 4, Mongoose 8, Zod, Multer, Cloudinary, Winston
- **Database**: MongoDB (Atlas or self‑hosted)
- **WebRTC**: Dedicated signalling server, RTCPeerConnection, MediaStreams

### Monorepo Structure

```text
hellotalk/
  client/                    # React app (Vite)
  server/                    # Node/Express API + Socket.IO
  webrtc-signalling-server/  # WebRTC signalling server
  docker-compose.yml         # Local Docker setup for all services
```

### Environment Variables

Create a `.env` file in `server/` and a `.env.local` (or `.env`) in `client/`.

Server (`server/.env`):

```bash
CLIENT_URL=http://localhost:3000
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
USER_TOKEN_SECRET=replace_me
USER_TOKEN_EXPIRY=1d
ADMIN_TOKEN_SECRET=replace_me
ADMIN_TOKEN_EXPIRY=1d
ADMIN_SECRET_KEY=replace_me
MONGO_URI=mongodb+srv://...
NODE_ENV=development
PORT=8080
```

Client (`client/.env.local`):

```bash
VITE_SERVER=http://localhost:8080
```

Note: Cookies are configured with `secure: true` and `sameSite: "none"`. For local development over HTTP, cookies may not be set by browsers. Either run the server behind HTTPS locally (e.g., reverse proxy) or adjust cookie settings for local dev only.

### Install & Run (Local)

Open three terminals (one for each service):

Server

```bash
cd server
npm i
npm run dev
```

Client

```bash
cd client
npm i
npm run dev
```

WebRTC Signalling Server

```bash
cd webrtc-signalling-server
npm i
npm run dev
```

Default ports

- Client: `http://localhost:3000`
- Server: `http://localhost:8080`
- WebRTC Signalling Server: `http://localhost:8001`

### Docker (Optional)

The provided `docker-compose.yml` starts both services:

```bash
docker compose up --build
```

Replace any example credentials/secrets in the compose file with your own before use.

### NPM Scripts

Server (`server/package.json`)

- `dev`: TypeScript watch + nodemon on compiled output
- `build`: Compile TypeScript to `dist/`
- `start`: Run compiled server

Client (`client/package.json`)

- `dev`: Vite dev server
- `build`: Type check + production build
- `preview`: Preview production build
- `lint`: ESLint

### API Overview

Base URL: `SERVER_API_URL = {VITE_SERVER}/api/v1`

User (`/user`)

- `POST /new` — Sign up (avatar upload)
- `POST /login` — Login
- `GET /me` — Current user
- `GET /logout` — Logout
- `GET /search?name=` — Search users (excludes friends/self)
- `PUT /send-request` — Send friend request
- `PUT /accept-request` — Accept/reject friend request
- `GET /notifications` — Pending requests
- `GET /friends[?chatId=]` — Friends or available to add to a chat

Chat (`/chat`)

- `POST /new` — Create group
- `GET /my` — My chats (DMs and groups)
- `GET /my/groups` — My groups (created by me)
- `PUT /add-members` — Add members to group
- `PUT /remove-member` — Remove a member
- `DELETE /leave/:id` — Leave group
- `POST /message` — Send attachments (multipart)
- `GET /message/:id?page=` — Paginated messages
- `GET /:id[?populate=true]` — Chat details
- `PUT /:id` — Rename group
- `DELETE /:id` — Delete chat

Admin (`/admin`)

- `POST /verify` — Admin login (secret key)
- `GET /logout` — Admin logout
- `GET /` — Admin session check
- `GET /users` — List users with counts
- `GET /chats` — List chats with stats
- `GET /messages` — List messages
- `GET /stats` — Dashboard numbers + 7‑day chart

Auth & CORS

- Cookies: `user-token`, `admin-token` (HTTP‑only)
- CORS origins: `{CLIENT_URL}`, `http://localhost:5173` (credentials enabled)

### Socket.IO Events

Common event names (`events`):

- `NEW_MESSAGE` / `NEW_MESSAGE_ALERT`
- `START_TYPING` / `STOP_TYPING`
- `CHAT_JOINED` / `CHAT_LEAVED`
- `ONLINE_USERS`
- `ALERT`, `REFETCH_CHATS`, `NEW_ATTACHMENT`, `NEW_REQUEST`

Client connects with credentials and listens/emits via a `SocketProvider`. The server authenticates sockets using the `user-token` cookie.

### WebRTC Functionality

The application includes comprehensive WebRTC capabilities for real-time audio and video communication, powered by a dedicated signalling server.

#### WebRTC Features

- **Audio & Video Calls**: Support for both audio-only and video calls
- **Real-time Communication**: Direct peer-to-peer connections using WebRTC
- **Signalling Server**: Dedicated WebRTC signalling server for call coordination
- **ICE Candidate Handling**: Automatic ICE candidate exchange for NAT traversal
- **Media Controls**: Mute/unmute audio/video, camera switching
- **Connection Monitoring**: Real-time connection quality and statistics
- **Call Management**: Initiate, accept, reject, and end calls

#### WebRTC Architecture

```text
Client (Browser) ←→ WebRTC Signalling Server ←→ Client (Browser)
       ↓                                              ↓
RTCPeerConnection                              RTCPeerConnection
       ↓                                              ↓
   Media Streams                              Media Streams
```

#### WebRTC Class API

The `WebRTC` class provides a comprehensive interface for managing WebRTC connections:

**Core Methods:**

- `join(userId: string)`: Connect to signalling server
- `initiateCall(options: CallOptions)`: Start a new call
- `acceptCall(callId, from, callType)`: Accept incoming call
- `rejectCall(callId, from)`: Reject incoming call
- `endCall()`: Terminate current call

**Media Control:**

- `toggleAudioMute(muted: boolean)`: Mute/unmute audio
- `toggleVideoMute(muted: boolean)`: Mute/unmute video
- `switchCamera()`: Switch between front/back cameras

**Connection Management:**

- `getConnectionQuality()`: Get connection state information
- `getConnectionStats()`: Get detailed connection statistics
- `isInCall()`: Check if currently in a call
- `getCurrentCallInfo()`: Get current call details

**Event Handling:**

- `on(event, handler)`: Register event handlers
- `off(event)`: Remove event handlers

#### WebRTC Events

The WebRTC class emits various events for call lifecycle management:

- `onCallIncoming`: Incoming call notification
- `onCallAccepted`: Call accepted by remote peer
- `onCallRejected`: Call rejected by remote peer
- `onCallEnded`: Call terminated
- `onCallOffer`: Received call offer (SDP)
- `onCallAnswer`: Received call answer (SDP)
- `onIceCandidate`: Received ICE candidate
- `onRemoteStream`: Remote media stream available
- `onError`: Error notifications

#### WebRTC Signalling Server

A dedicated Node.js server handles WebRTC signalling:

**Server Features:**

- User session management
- Call initiation and coordination
- SDP offer/answer exchange
- ICE candidate relay
- Call state tracking
- User availability status

**Signalling Events:**

- `user:join`: User connects to signalling server
- `call:initiate`: Initiate a new call
- `call:accept`/`call:reject`: Handle call responses
- `call:offer`/`call:answer`: Exchange SDP information
- `ice:candidate`: Relay ICE candidates
- `call:end`: Terminate calls

#### Configuration

**Environment Variables:**

```bash
# Client (.env.local)
VITE_WEBRTC_SIGNALLING_SERVER=http://localhost:8001

# WebRTC Signalling Server (.env)
CLIENT_URL=http://localhost:3000
PORT=8001
```

**STUN Servers:**
The WebRTC implementation includes multiple Google STUN servers for reliable NAT traversal:

- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`
- `stun:stun3.l.google.com:19302`
- `stun:stun4.l.google.com:19302`

#### Usage Example

```typescript
import WebRTC from "./lib/WebRTC";

// Initialize WebRTC
const webrtc = new WebRTC();

// Set up event handlers
webrtc.on("onCallIncoming", (data) => {
  console.log(`Incoming ${data.callType} call from ${data.from}`);
});

webrtc.on("onRemoteStream", (stream) => {
  // Handle remote media stream
  remoteVideo.srcObject = stream;
});

// Join signalling server
await webrtc.join(userId);

// Initiate a video call
const callId = await webrtc.initiateCall({
  to: remoteUserId,
  callType: "video",
});

// Create and send offer
await webrtc.createOffer();
```

#### Browser Support

WebRTC functionality requires modern browsers with WebRTC support:

- Chrome 56+
- Firefox 44+
- Safari 11+
- Edge 79+

#### Security Considerations

- Media access requires user permission
- HTTPS required for production deployments
- STUN servers are public but don't store data
- Signalling server handles authentication via user tokens

### File Uploads

- Implemented with Multer on the server; uploaded to Cloudinary as `resource_type: raw`
- Attachment metadata saved with messages; deletions purge Cloudinary assets

### UI Highlights

- Lazy‑loaded routes, protected routes, toast notifications, charts for admin
- Tailwind utilities with merge helpers; responsive layouts

### Development Notes

- Ensure MongoDB is reachable via `MONGO_URI`
- For local cookies, consider HTTPS or adjusting cookie options in `server/src/app/constants/cookie.constant.ts`
- Update Cloudinary credentials and configure allowed upload types as needed

### Project Tree (selected)

```text
server/src
  app/
    controllers/ (user, chat, admin)
    middlewares/ (auth, error, file handling)
    routes/ (user, chat, admin)
    socket/ (auth middleware, events, helpers)
    models/ (user, chat, message, request)
    constants/ (events, cors, cookies)
    utils/ (async handler, responses, send token, socket utils)
  db/ (Mongo connection)
  env.ts, index.ts, logger.ts

client/src
  app/ (pages incl. admin dashboard)
  components/ (shared, dialogs, layout, etc.)
  redux/ (slices, RTK Query API, store)
  lib/ (Socket provider, theme)
  constants/ (config, events)
  router/ (Router.tsx)
  utils/ (axios instance, guards)
```

### License

No license specified. Add a license if you intend to distribute this project.

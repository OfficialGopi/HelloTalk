## HelloTalk Server (API + Realtime)

Node.js/Express REST API with Socket.IO for realtime chat, using MongoDB for data and Cloudinary for file storage.

### Stack

- Express 5, TypeScript, Mongoose 8
- Socket.IO 4 (auth via cookie)
- Multer + Cloudinary uploads
- Zod for env validation, Winston for logging

### Requirements

- Node 18+ (Docker uses node:22-alpine)
- MongoDB connection string
- Cloudinary account (cloud name, API key/secret)

### Setup

1. Create `server/.env` with:

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

2. Install and run

```bash
cd server
npm i
npm run dev
```

Build/Start (production)

```bash
npm run build
npm start
```

### Scripts

- `dev`: TS watch + nodemon on compiled output
- `build`: Compile TS to `dist/`
- `start`: Run compiled server

### REST API (base: `/api/v1`)

- `POST /user/new` — signup (multipart: `avatar`)
- `POST /user/login` — login, sets `user-token` cookie
- `GET /user/me` — current user
- `GET /user/logout` — clear cookie
- `GET /user/search?name=` — search users (excludes friends/self)
- `PUT /user/send-request` — send friend request
- `PUT /user/accept-request` — accept/reject request
- `GET /user/notifications` — pending requests
- `GET /user/friends[?chatId=]` — friends/available to add

- `POST /chat/new` — create group
- `GET /chat/my` — my chats
- `GET /chat/my/groups` — groups I created
- `PUT /chat/add-members` — add members
- `PUT /chat/remove-member` — remove member
- `DELETE /chat/leave/:id` — leave group
- `POST /chat/message` — send attachments (multipart: `files[]`)
- `GET /chat/message/:id?page=` — paginated messages
- `GET /chat/:id[?populate=true]` — chat details
- `PUT /chat/:id` — rename group
- `DELETE /chat/:id` — delete chat

- `POST /admin/verify` — admin login (secret key)
- `GET /admin/logout` — admin logout
- `GET /admin/` — admin session check
- `GET /admin/users|chats|messages|stats` — admin data

Auth & CORS

- Cookies: `user-token`, `admin-token` (HTTP-only, `sameSite=none`, `secure=true`)
- CORS origins: `CLIENT_URL`, `http://localhost:5173` (credentials enabled)

### Socket.IO

Authenticated via `user-token` cookie. Key events:

- `NEW_MESSAGE`, `NEW_MESSAGE_ALERT`
- `START_TYPING`, `STOP_TYPING`
- `CHAT_JOINED`, `CHAT_LEAVED`, `ONLINE_USERS`
- `ALERT`, `REFETCH_CHATS`, `NEW_ATTACHMENT`, `NEW_REQUEST`

See `server/src/app/socket/` for handlers and `socket.middleware.ts` for auth.

### File Uploads

- Multer stores temp files in `server/temp/avatars` and `server/temp/attachments`
- Uploaded to Cloudinary (`resource_type: raw`); deletes local temp files

### Project Structure

```text
src/
  app/
    controllers/ routes/ middlewares/ models/
    socket/ constants/ utils/
  db/ (Mongo connection)
  env.ts, index.ts, logger.ts
```

### Docker

Builds a production image that runs `npm start` on `dist/index.js`.

```bash
docker build -t hellotalk-server ./server
docker run --env-file ./server/.env -p 8080:8080 hellotalk-server
```

### Notes

- In local HTTP development, browsers may not set cookies marked `secure:true`.
  Prefer HTTPS locally or adjust cookie options for dev only.

# WebRTC Signalling Server

A robust WebRTC signalling server for HelloTalk's P2P calling feature. This server handles the exchange of WebRTC signalling messages between peers to establish direct audio/video connections.

## Features

- **User Management**: Track online users and their call status
- **Call Management**: Handle call initiation, acceptance, rejection, and termination
- **WebRTC Signalling**: Exchange SDP offers/answers and ICE candidates
- **Real-time Communication**: Built with Socket.IO for reliable real-time messaging
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error handling and validation
- **Graceful Shutdown**: Proper cleanup on server shutdown

## Socket Events

### Client to Server Events

- `user:join` - User joins the signalling server
- `call:initiate` - Initiate a call to another user
- `call:accept` - Accept an incoming call
- `call:reject` - Reject an incoming call
- `call:offer` - Send WebRTC offer (SDP)
- `call:answer` - Send WebRTC answer (SDP)
- `ice:candidate` - Send ICE candidate
- `call:end` - End an active call
- `user:status` - Get status of a specific user

### Server to Client Events

- `user:joined` - Confirmation of successful user join
- `call:incoming` - Notification of incoming call
- `call:initiated` - Confirmation of call initiation
- `call:accepted` - Call was accepted by recipient
- `call:rejected` - Call was rejected by recipient
- `call:offer` - Received WebRTC offer
- `call:answer` - Received WebRTC answer
- `ice:candidate` - Received ICE candidate
- `call:ended` - Call was ended
- `user:status` - Status information for requested user
- `error` - Error messages

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   PORT=8001
   CLIENT_URL=http://localhost:3000
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Run the Server**

   ```bash
   # Production
   npm start

   # Development
   npm run dev
   ```

## Usage Example

### Client Connection

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:8001");

// Join the signalling server
socket.emit("user:join", { userId: "user123" });

// Listen for confirmation
socket.on("user:joined", (data) => {
  console.log("Joined successfully:", data);
});
```

### Initiating a Call

```typescript
// Initiate a call
socket.emit("call:initiate", {
  to: "user456",
  callType: "video",
});

// Listen for call initiation confirmation
socket.on("call:initiated", (data) => {
  console.log("Call initiated:", data);
});

// Listen for incoming call offers
socket.on("call:offer", (data) => {
  console.log("Received offer:", data);
  // Handle WebRTC offer
});
```

### Handling ICE Candidates

```typescript
// Send ICE candidate
socket.emit("ice:candidate", {
  candidate: iceCandidate,
  from: "user123",
  to: "user456",
});

// Listen for ICE candidates
socket.on("ice:candidate", (data) => {
  console.log("Received ICE candidate:", data);
  // Add ICE candidate to peer connection
});
```

## Architecture

The server maintains three main data structures:

1. **Users Map**: Tracks all connected users and their socket connections
2. **Call Rooms Map**: Manages active call sessions and participants
3. **Socket to User Map**: Maps socket IDs to user IDs for quick lookups

## Error Handling

All socket events are wrapped in try-catch blocks with proper error responses. The server validates:

- User authentication
- Call state consistency
- Data format validation
- User availability

## Production Considerations

- Set appropriate CORS origins for production
- Use environment variables for configuration
- Implement rate limiting if needed
- Add logging and monitoring
- Consider clustering for high availability

## License

ISC

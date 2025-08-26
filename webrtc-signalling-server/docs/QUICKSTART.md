# Quick Start Guide

Get your WebRTC signalling server up and running in minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Basic knowledge of WebRTC and Socket.IO

## 1. Clone and Setup

```bash
# Navigate to the webrtc-signalling-server directory
cd webrtc-signalling-server

# Install dependencies
npm install
```

## 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=8001
CLIENT_URL=http://localhost:3000
```

**Environment Variables:**

- `PORT`: Port for the signalling server (default: 8001)
- `CLIENT_URL`: Your client application URL for CORS

## 3. Build and Run

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```

**Alternative commands:**

```bash
# Development mode (with auto-reload)
npm run dev

# Watch mode (auto-rebuild on changes)
npm run watch
```

## 4. Verify Server is Running

You should see:

```
🚀 WebRTC Signalling Server running on port 8001
📡 CORS enabled for: http://localhost:3000
```

## 5. Test Connection

### Using Browser Console

Open your browser console and run:

```javascript
// Connect to the server
const socket = io("http://localhost:8001");

// Join as a user
socket.emit("user:join", { userId: "testuser1" });

// Listen for confirmation
socket.on("user:joined", (data) => {
  console.log("Joined successfully:", data);
});

// Listen for errors
socket.on("error", (error) => {
  console.error("Error:", error);
});
```

### Using a Simple Test Client

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>WebRTC Test Client</title>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  </head>
  <body>
    <h1>WebRTC Signalling Test</h1>
    <button onclick="joinServer()">Join Server</button>
    <button onclick="getStatus()">Get User Status</button>
    <div id="status"></div>

    <script>
      const socket = io("http://localhost:8001");

      socket.on("connect", () => {
        console.log("Connected to server");
        document.getElementById("status").innerHTML = "Connected to server";
      });

      socket.on("user:joined", (data) => {
        console.log("Joined:", data);
        document.getElementById(
          "status"
        ).innerHTML = `Joined as: ${data.userId}`;
      });

      socket.on("error", (error) => {
        console.error("Error:", error);
        document.getElementById("status").innerHTML = `Error: ${error.message}`;
      });

      function joinServer() {
        socket.emit("user:join", { userId: "testuser" + Date.now() });
      }

      function getStatus() {
        socket.emit("user:status", { userId: "testuser" });
      }
    </script>
  </body>
</html>
```

## 6. Test with Two Clients

Open the test HTML file in two different browser tabs to simulate two users:

1. **Tab 1**: Join as "user1"
2. **Tab 2**: Join as "user2"
3. **Tab 1**: Check status of "user2"
4. **Tab 2**: Check status of "user1"

## 7. Integration with Your App

### Basic Integration

```typescript
import { io } from "socket.io-client";

class WebRTCClient {
  private socket: any;

  constructor() {
    this.socket = io("http://localhost:8001");
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on("connect", () => {
      console.log("Connected to signalling server");
    });

    this.socket.on("user:joined", (data) => {
      console.log("Joined server:", data);
    });

    this.socket.on("error", (error) => {
      console.error("Server error:", error);
    });
  }

  join(userId: string) {
    this.socket.emit("user:join", { userId });
  }
}

// Usage
const client = new WebRTCClient();
client.join("myuser123");
```

### React Integration

```typescript
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const WebRTCComponent: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:8001");

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("user:join", { userId: "reactuser" });
    });

    newSocket.on("user:joined", (data) => {
      console.log("Joined server:", data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div>
      <h2>WebRTC Status: {isConnected ? "Connected" : "Disconnected"}</h2>
    </div>
  );
};

export default WebRTCComponent;
```

## 8. Common Issues & Solutions

### Port Already in Use

```bash
# Kill process using port 8001
npx kill-port 8001

# Or use a different port
PORT=8002 npm start
```

### CORS Issues

Make sure your `CLIENT_URL` in `.env` matches your client application URL exactly.

### Connection Refused

- Verify server is running
- Check firewall settings
- Ensure port is accessible

### TypeScript Build Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## 9. Next Steps

1. **Read the full documentation**:

   - [Client Integration Guide](./CLIENT_INTEGRATION.md)
   - [Workflow Documentation](./WORKFLOW.md)

2. **Implement WebRTC calling**:

   - Add media stream handling
   - Implement peer connections
   - Add call UI components

3. **Production deployment**:
   - Set up proper environment variables
   - Configure CORS for production domains
   - Add SSL/TLS certificates
   - Implement authentication

## 10. Development Tips

### Enable Debug Logging

```typescript
// In your server code
const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Add debug logging
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.onAny((eventName, ...args) => {
    console.log(`Event: ${eventName}`, args);
  });
});
```

### Monitor Connections

```typescript
// Add connection monitoring
setInterval(() => {
  console.log(`Active connections: ${io.engine.clientsCount}`);
  console.log(`Active users: ${users.size}`);
  console.log(`Active calls: ${callRooms.size}`);
}, 5000);
```

### Test with Multiple Users

Use browser incognito windows or different browsers to test with multiple users simultaneously.

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check the [Workflow Documentation](./WORKFLOW.md) for detailed flow
5. Review the [Client Integration Guide](./CLIENT_INTEGRATION.md) for implementation details

Happy coding! 🚀

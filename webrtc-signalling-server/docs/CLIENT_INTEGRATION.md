# Client Integration Guide

This guide shows how to integrate the WebRTC signalling server with your HelloTalk client application.

## Prerequisites

- Node.js 16+ or modern browser with WebRTC support
- Socket.IO client library
- WebRTC API support in the browser

## Installation

### For React/Node.js Applications

```bash
npm install socket.io-client
```

### For Browser Applications

```html
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
```

## Basic Connection Setup

### 1. Initialize Socket Connection

```typescript
import { io, Socket } from "socket.io-client";

class WebRTCSignallingClient {
  private socket: Socket;
  private userId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(signallingServerUrl: string, userId: string) {
    this.userId = userId;
    this.socket = io(signallingServerUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to signalling server");
      this.joinServer();
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from signalling server");
    });

    // User management events
    this.socket.on("user:joined", (data) => {
      console.log("Successfully joined server:", data);
    });

    this.socket.on("error", (error) => {
      console.error("Signalling server error:", error);
    });
  }

  private joinServer() {
    this.socket.emit("user:join", { userId: this.userId });
  }
}
```

### 2. Call Management

```typescript
class WebRTCSignallingClient {
  // ... previous code ...

  // Initiate a call
  async initiateCall(targetUserId: string, callType: "audio" | "video") {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: callType === "audio" || callType === "video",
        video: callType === "video",
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local stream tracks
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Setup peer connection event handlers
      this.setupPeerConnectionHandlers();

      // Initiate call through signalling server
      this.socket.emit("call:initiate", {
        to: targetUserId,
        callType,
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      throw error;
    }
  }

  // Handle incoming calls
  private setupIncomingCallHandlers() {
    this.socket.on("call:incoming", async (data) => {
      const { from, callType, callId } = data;

      // Show incoming call UI
      this.showIncomingCallUI(from, callType, callId);
    });
  }

  // Accept incoming call
  async acceptCall(callId: string, from: string) {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local stream tracks
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Setup peer connection event handlers
      this.setupPeerConnectionHandlers();

      // Accept call through signalling server
      this.socket.emit("call:accept", { callId, from });
    } catch (error) {
      console.error("Failed to accept call:", error);
      throw error;
    }
  }

  // Reject incoming call
  rejectCall(callId: string, from: string) {
    this.socket.emit("call:reject", { callId, from });
  }
}
```

### 3. WebRTC Signalling

```typescript
class WebRTCSignallingClient {
  // ... previous code ...

  private setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer
        this.socket.emit("ice:candidate", {
          candidate: event.candidate,
          from: this.userId,
          to: this.getRemoteUserId(), // You need to track this
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStreamReceived(this.remoteStream);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", this.peerConnection?.connectionState);
    };
  }

  // Handle WebRTC offer
  private setupOfferHandlers() {
    this.socket.on("call:offer", async (data) => {
      const { offer, from, callType } = data;

      try {
        if (!this.peerConnection) {
          throw new Error("Peer connection not initialized");
        }

        // Set remote description
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        // Create answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send answer through signalling server
        this.socket.emit("call:answer", {
          answer,
          from: this.userId,
          to: from,
        });
      } catch (error) {
        console.error("Failed to handle offer:", error);
      }
    });
  }

  // Handle WebRTC answer
  private setupAnswerHandlers() {
    this.socket.on("call:answer", async (data) => {
      const { answer, from } = data;

      try {
        if (!this.peerConnection) {
          throw new Error("Peer connection not initialized");
        }

        // Set remote description
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }
    });
  }

  // Handle ICE candidates
  private setupIceCandidateHandlers() {
    this.socket.on("ice:candidate", async (data) => {
      const { candidate, from } = data;

      try {
        if (!this.peerConnection) {
          throw new Error("Peer connection not initialized");
        }

        // Add ICE candidate to peer connection
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    });
  }
}
```

### 4. Call State Management

```typescript
class WebRTCSignallingClient {
  // ... previous code ...

  private setupCallStateHandlers() {
    // Call initiated
    this.socket.on("call:initiated", (data) => {
      console.log("Call initiated:", data);
      this.onCallInitiated(data);
    });

    // Call accepted
    this.socket.on("call:accepted", (data) => {
      console.log("Call accepted:", data);
      this.onCallAccepted(data);
    });

    // Call rejected
    this.socket.on("call:rejected", (data) => {
      console.log("Call rejected:", data);
      this.onCallRejected(data);
      this.cleanupCall();
    });

    // Call ended
    this.socket.on("call:ended", (data) => {
      console.log("Call ended:", data);
      this.onCallEnded(data);
      this.cleanupCall();
    });
  }

  // End current call
  endCall() {
    if (this.currentCallId) {
      this.socket.emit("call:end", { callId: this.currentCallId });
    }
  }

  // Cleanup call resources
  private cleanupCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.currentCallId = null;
  }

  // Get user status
  getUserStatus(userId: string) {
    this.socket.emit("user:status", { userId });
  }

  private setupUserStatusHandlers() {
    this.socket.on("user:status", (data) => {
      const { userId, isOnline, isInCall } = data;
      this.onUserStatusReceived(userId, isOnline, isInCall);
    });
  }
}
```

## Complete Integration Example

```typescript
// Complete client implementation
class HelloTalkWebRTCClient extends WebRTCSignallingClient {
  private videoElement: HTMLVideoElement;
  private remoteVideoElement: HTMLVideoElement;

  constructor(signallingServerUrl: string, userId: string) {
    super(signallingServerUrl, userId);

    this.videoElement = document.getElementById(
      "localVideo"
    ) as HTMLVideoElement;
    this.remoteVideoElement = document.getElementById(
      "remoteVideo"
    ) as HTMLVideoElement;

    this.setupAllHandlers();
  }

  private setupAllHandlers() {
    this.setupIncomingCallHandlers();
    this.setupOfferHandlers();
    this.setupAnswerHandlers();
    this.setupIceCandidateHandlers();
    this.setupCallStateHandlers();
    this.setupUserStatusHandlers();
  }

  // Override methods to handle UI updates
  protected onCallInitiated(data: any) {
    // Update UI to show calling state
    this.updateCallUI("calling", data.to);
  }

  protected onCallAccepted(data: any) {
    // Update UI to show connected state
    this.updateCallUI("connected", data.by);
  }

  protected onCallRejected(data: any) {
    // Update UI to show call rejected
    this.updateCallUI("rejected", data.by);
  }

  protected onCallEnded(data: any) {
    // Update UI to show call ended
    this.updateCallUI("ended", data.by);
  }

  protected onRemoteStreamReceived(stream: MediaStream) {
    // Display remote video
    if (this.remoteVideoElement) {
      this.remoteVideoElement.srcObject = stream;
    }
  }

  protected onUserStatusReceived(
    userId: string,
    isOnline: boolean,
    isInCall: boolean
  ) {
    // Update user status in UI
    this.updateUserStatus(userId, isOnline, isInCall);
  }

  private updateCallUI(state: string, userId: string) {
    // Implement your UI update logic here
    console.log(`Call state: ${state} with user: ${userId}`);
  }

  private updateUserStatus(
    userId: string,
    isOnline: boolean,
    isInCall: boolean
  ) {
    // Implement your user status update logic here
    console.log(`User ${userId}: online=${isOnline}, inCall=${isInCall}`);
  }
}

// Usage
const client = new HelloTalkWebRTCClient("http://localhost:8001", "user123");

// Initiate a video call
client.initiateCall("user456", "video");

// Get user status
client.getUserStatus("user456");
```

## Error Handling

```typescript
class WebRTCSignallingClient {
  // ... previous code ...

  private handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);

    // Emit error event for UI handling
    this.emit("error", {
      context,
      error: error.message || "Unknown error occurred",
    });
  }

  private setupErrorHandlers() {
    this.socket.on("error", (error) => {
      this.handleError(error, "signalling");
    });

    // Handle WebRTC errors
    if (this.peerConnection) {
      this.peerConnection.onerror = (error) => {
        this.handleError(error, "webrtc");
      };
    }
  }
}
```

## Best Practices

1. **Always handle errors gracefully** - Implement proper error handling for all async operations
2. **Clean up resources** - Stop media streams and close peer connections when calls end
3. **Implement reconnection logic** - Handle network disconnections and reconnections
4. **Use proper TypeScript types** - Define interfaces for all data structures
5. **Test on different browsers** - WebRTC support varies across browsers
6. **Implement fallbacks** - Have fallback mechanisms for unsupported features
7. **Monitor connection quality** - Implement connection quality monitoring
8. **Handle permissions gracefully** - Handle cases where users deny camera/microphone access

## Browser Compatibility

- **Chrome**: Full WebRTC support
- **Firefox**: Full WebRTC support
- **Safari**: WebRTC support (iOS 11+, macOS 10.13+)
- **Edge**: Full WebRTC support (Chromium-based)

## Testing

Test your integration with multiple browsers and devices to ensure compatibility. Use tools like:

- Browser DevTools for debugging
- WebRTC internals (chrome://webrtc-internals/ in Chrome)
- Network throttling to test poor network conditions

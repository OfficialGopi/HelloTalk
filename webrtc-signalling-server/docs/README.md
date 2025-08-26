# WebRTC Signalling Server Documentation

Welcome to the comprehensive documentation for the HelloTalk WebRTC Signalling Server. This server enables peer-to-peer audio and video calling in your chat application.

## 📚 Documentation Index

### 🚀 Getting Started

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in minutes
- **[Main README](../README.md)** - Project overview and setup

### 🔧 Implementation Guides

- **[Client Integration Guide](./CLIENT_INTEGRATION.md)** - Complete client-side integration
- **[Workflow Documentation](./WORKFLOW.md)** - Detailed call flow and architecture

## 🎯 What This Server Does

The WebRTC Signalling Server acts as a **mediator** between WebRTC peers during the initial connection setup. It handles:

- **User Management** - Track online users and their call status
- **Call Coordination** - Initiate, accept, reject, and terminate calls
- **WebRTC Signalling** - Exchange SDP offers/answers and ICE candidates
- **Real-time Communication** - Built with Socket.IO for reliability

## 🔄 How It Works

1. **Users connect** to the signalling server via WebSocket
2. **Caller initiates** a call to a specific user
3. **Server coordinates** the call setup between both parties
4. **WebRTC signalling** occurs through the server
5. **Direct P2P connection** is established for media streaming
6. **Server manages** call state and cleanup

## 🏗️ Architecture

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│   Client A  │◄──►│  Signalling      │◄──►│  Client B  │
│             │    │  Server          │    │             │
└─────────────┘    └──────────────────┘    └─────────────┘
       │                    │                    │
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   Direct P2P     │
                    │   Connection     │
                    │  (Media Stream)  │
                    └──────────────────┘
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "PORT=8001\nCLIENT_URL=http://localhost:3000" > .env

# 3. Build and run
npm run build
npm start
```

## 📱 Supported Features

- ✅ **Audio Calls** - Voice-only communication
- ✅ **Video Calls** - Video and audio communication
- ✅ **User Status** - Online/offline and call status
- ✅ **Call Management** - Accept, reject, end calls
- ✅ **Real-time Updates** - Instant status changes
- ✅ **Error Handling** - Comprehensive error management
- ✅ **TypeScript** - Full type safety
- ✅ **CORS Support** - Cross-origin requests
- ✅ **Graceful Shutdown** - Proper resource cleanup

## 🔌 Socket Events

### Client → Server

- `user:join` - Join the signalling server
- `call:initiate` - Start a call
- `call:accept` - Accept incoming call
- `call:reject` - Reject incoming call
- `call:offer` - Send WebRTC offer
- `call:answer` - Send WebRTC answer
- `ice:candidate` - Send ICE candidate
- `call:end` - End active call
- `user:status` - Get user status

### Server → Client

- `user:joined` - Confirmation of join
- `call:incoming` - Incoming call notification
- `call:initiated` - Call initiation confirmation
- `call:accepted` - Call accepted notification
- `call:rejected` - Call rejected notification
- `call:offer` - Received WebRTC offer
- `call:answer` - Received WebRTC answer
- `ice:candidate` - Received ICE candidate
- `call:ended` - Call ended notification
- `user:status` - User status information
- `error` - Error messages

## 🌐 Browser Support

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 11+ ✅
- **Edge** 79+ ✅

## 🔒 Security Features

- **Input Validation** - All data is validated
- **User Authentication** - Users must provide valid IDs
- **CORS Protection** - Configurable cross-origin policies
- **Error Handling** - Comprehensive error management
- **Resource Cleanup** - Automatic cleanup on disconnect

## 📊 Monitoring

The server provides:

- Connection status logging
- Call event tracking
- Error reporting
- User activity monitoring
- Performance metrics

## 🚀 Production Deployment

For production use:

1. Set proper environment variables
2. Configure CORS for your domains
3. Add SSL/TLS certificates
4. Implement proper authentication
5. Set up monitoring and logging
6. Consider load balancing for high availability

## 🤝 Contributing

This server is designed to be:

- **Modular** - Easy to extend and modify
- **Well-documented** - Clear implementation details
- **Type-safe** - Full TypeScript support
- **Testable** - Designed for easy testing

## 📞 Support

If you need help:

1. Check the [Quick Start Guide](./QUICKSTART.md)
2. Review the [Client Integration Guide](./CLIENT_INTEGRATION.md)
3. Examine the [Workflow Documentation](./WORKFLOW.md)
4. Check server logs for error details
5. Verify your configuration

## 📝 License

This project is licensed under the ISC License.

---

**Happy coding! 🚀**

Your WebRTC calling feature is just a few steps away from being fully functional.

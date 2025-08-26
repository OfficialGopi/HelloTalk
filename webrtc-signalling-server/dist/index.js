"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
require("dotenv/config");
// Server configuration
const io = new socket_io_1.Server({
    cors: {
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});
// Data structures
const users = new Map();
const callRooms = new Map();
const socketToUser = new Map();
// Helper functions
function createCallId(user1, user2) {
    return [user1, user2].sort().join("-");
}
function getUserBySocketId(socketId) {
    const userId = socketToUser.get(socketId);
    return userId ? users.get(userId) : undefined;
}
function isUserAvailable(userId) {
    const user = users.get(userId);
    return user ? !user.isInCall : false;
}
function cleanupCall(callId) {
    const call = callRooms.get(callId);
    if (call) {
        call.participants.forEach((participantId) => {
            const user = users.get(participantId);
            if (user) {
                user.isInCall = false;
                user.currentCallId = undefined;
            }
        });
        callRooms.delete(callId);
    }
}
// Socket connection handler
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    // User joins the signalling server
    socket.on("user:join", (data) => {
        try {
            const { userId } = data;
            if (!userId) {
                socket.emit("error", { message: "User ID is required" });
                return;
            }
            // Remove user from previous session if exists
            const existingUser = users.get(userId);
            if (existingUser) {
                socketToUser.delete(existingUser.socketId);
                const existingSocket = io.sockets.sockets.get(existingUser.socketId);
                if (existingSocket) {
                    existingSocket.disconnect();
                }
            }
            // Create new user session
            const user = {
                id: userId,
                socketId: socket.id,
                isInCall: false,
            };
            users.set(userId, user);
            socketToUser.set(socket.id, userId);
            socket.emit("user:joined", { userId, socketId: socket.id });
            console.log(`User ${userId} joined with socket ${socket.id}`);
        }
        catch (error) {
            console.error("Error in user:join:", error);
            socket.emit("error", { message: "Failed to join" });
        }
    });
    // Initiate a call
    socket.on("call:initiate", (data) => {
        try {
            const { to, callType } = data;
            const caller = getUserBySocketId(socket.id);
            if (!caller) {
                socket.emit("error", { message: "User not authenticated" });
                return;
            }
            if (caller.isInCall) {
                socket.emit("error", { message: "Already in a call" });
                return;
            }
            const callee = users.get(to);
            if (!callee) {
                socket.emit("error", { message: "User not found" });
                return;
            }
            if (!isUserAvailable(to)) {
                socket.emit("error", { message: "User is not available" });
                return;
            }
            // Create call room
            const callId = createCallId(caller.id, callee.id);
            const callRoom = {
                id: callId,
                participants: [caller.id, callee.id],
                isActive: true,
                createdAt: new Date(),
            };
            callRooms.set(callId, callRoom);
            // Update user states
            caller.isInCall = true;
            caller.currentCallId = callId;
            callee.isInCall = true;
            callee.currentCallId = callId;
            // Notify callee about incoming call
            const calleeSocket = io.sockets.sockets.get(callee.socketId);
            if (calleeSocket) {
                calleeSocket.emit("call:incoming", {
                    from: caller.id,
                    callType,
                    callId,
                });
            }
            socket.emit("call:initiated", { callId, to });
            console.log(`Call initiated from ${caller.id} to ${to}, type: ${callType}`);
        }
        catch (error) {
            console.error("Error in call:initiate:", error);
            socket.emit("error", { message: "Failed to initiate call" });
        }
    });
    // Accept a call
    socket.on("call:accept", (data) => {
        try {
            const { callId, from } = data;
            const callee = getUserBySocketId(socket.id);
            if (!callee) {
                socket.emit("error", { message: "User not authenticated" });
                return;
            }
            const callRoom = callRooms.get(callId);
            if (!callRoom || !callRoom.isActive) {
                socket.emit("error", { message: "Call not found or expired" });
                return;
            }
            // Notify caller that call was accepted
            const caller = users.get(from);
            if (caller) {
                const callerSocket = io.sockets.sockets.get(caller.socketId);
                if (callerSocket) {
                    callerSocket.emit("call:accepted", { callId, by: callee.id });
                }
            }
            socket.emit("call:accepted", { callId, by: callee.id });
            console.log(`Call ${callId} accepted by ${callee.id}`);
        }
        catch (error) {
            console.error("Error in call:accept:", error);
            socket.emit("error", { message: "Failed to accept call" });
        }
    });
    // Reject a call
    socket.on("call:reject", (data) => {
        try {
            const { callId, from } = data;
            const callee = getUserBySocketId(socket.id);
            if (!callee) {
                socket.emit("error", { message: "User not authenticated" });
                return;
            }
            // Notify caller that call was rejected
            const caller = users.get(from);
            if (caller) {
                const callerSocket = io.sockets.sockets.get(caller.socketId);
                if (callerSocket) {
                    callerSocket.emit("call:rejected", { callId, by: callee.id });
                }
            }
            // Cleanup call
            cleanupCall(callId);
            socket.emit("call:rejected", { callId, by: callee.id });
            console.log(`Call ${callId} rejected by ${callee.id}`);
        }
        catch (error) {
            console.error("Error in call:reject:", error);
            socket.emit("error", { message: "Failed to reject call" });
        }
    });
    // Send call offer (SDP)
    socket.on("call:offer", (data) => {
        try {
            const { offer, from, to, callType } = data;
            const sender = getUserBySocketId(socket.id);
            if (!sender || sender.id !== from) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }
            const receiver = users.get(to);
            if (!receiver) {
                socket.emit("error", { message: "Receiver not found" });
                return;
            }
            // Send offer to receiver
            const receiverSocket = io.sockets.sockets.get(receiver.socketId);
            if (receiverSocket) {
                receiverSocket.emit("call:offer", {
                    offer,
                    from: sender.id,
                    callType,
                });
            }
            console.log(`Call offer sent from ${sender.id} to ${to}`);
        }
        catch (error) {
            console.error("Error in call:offer:", error);
            socket.emit("error", { message: "Failed to send offer" });
        }
    });
    // Send call answer (SDP)
    socket.on("call:answer", (data) => {
        try {
            const { answer, from, to } = data;
            const sender = getUserBySocketId(socket.id);
            if (!sender || sender.id !== from) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }
            const receiver = users.get(to);
            if (!receiver) {
                socket.emit("error", { message: "Receiver not found" });
                return;
            }
            // Send answer to receiver
            const receiverSocket = io.sockets.sockets.get(receiver.socketId);
            if (receiverSocket) {
                receiverSocket.emit("call:answer", {
                    answer,
                    from: sender.id,
                });
            }
            console.log(`Call answer sent from ${sender.id} to ${to}`);
        }
        catch (error) {
            console.error("Error in call:answer:", error);
            socket.emit("error", { message: "Failed to send answer" });
        }
    });
    // Send ICE candidates
    socket.on("ice:candidate", (data) => {
        try {
            const { candidate, from, to } = data;
            const sender = getUserBySocketId(socket.id);
            if (!sender || sender.id !== from) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }
            const receiver = users.get(to);
            if (!receiver) {
                socket.emit("error", { message: "Receiver not found" });
                return;
            }
            // Send ICE candidate to receiver
            const receiverSocket = io.sockets.sockets.get(receiver.socketId);
            if (receiverSocket) {
                receiverSocket.emit("ice:candidate", {
                    candidate,
                    from: sender.id,
                });
            }
            console.log(`ICE candidate sent from ${sender.id} to ${to}`);
        }
        catch (error) {
            console.error("Error in ice:candidate:", error);
            socket.emit("error", { message: "Failed to send ICE candidate" });
        }
    });
    // End call
    socket.on("call:end", (data) => {
        try {
            const { callId } = data;
            const user = getUserBySocketId(socket.id);
            if (!user) {
                socket.emit("error", { message: "User not authenticated" });
                return;
            }
            const callRoom = callRooms.get(callId);
            if (!callRoom) {
                socket.emit("error", { message: "Call not found" });
                return;
            }
            // Notify all participants that call ended
            callRoom.participants.forEach((participantId) => {
                if (participantId !== user.id) {
                    const participant = users.get(participantId);
                    if (participant) {
                        const participantSocket = io.sockets.sockets.get(participant.socketId);
                        if (participantSocket) {
                            participantSocket.emit("call:ended", { callId, by: user.id });
                        }
                    }
                }
            });
            // Cleanup call
            cleanupCall(callId);
            socket.emit("call:ended", { callId, by: user.id });
            console.log(`Call ${callId} ended by ${user.id}`);
        }
        catch (error) {
            console.error("Error in call:end:", error);
            socket.emit("error", { message: "Failed to end call" });
        }
    });
    // Get user status
    socket.on("user:status", (data) => {
        try {
            const { userId } = data;
            const user = users.get(userId);
            if (user) {
                socket.emit("user:status", {
                    userId,
                    isOnline: true,
                    isInCall: user.isInCall,
                });
            }
            else {
                socket.emit("user:status", {
                    userId,
                    isOnline: false,
                    isInCall: false,
                });
            }
        }
        catch (error) {
            console.error("Error in user:status:", error);
            socket.emit("error", { message: "Failed to get user status" });
        }
    });
    // Disconnect handler
    socket.on("disconnect", () => {
        try {
            const userId = socketToUser.get(socket.id);
            if (userId) {
                const user = users.get(userId);
                if (user) {
                    // If user was in a call, end it
                    if (user.isInCall && user.currentCallId) {
                        const callRoom = callRooms.get(user.currentCallId);
                        if (callRoom) {
                            callRoom.participants.forEach((participantId) => {
                                if (participantId !== userId) {
                                    const participant = users.get(participantId);
                                    if (participant) {
                                        const participantSocket = io.sockets.sockets.get(participant.socketId);
                                        if (participantSocket) {
                                            participantSocket.emit("call:ended", {
                                                callId: user.currentCallId,
                                                by: userId,
                                                reason: "User disconnected",
                                            });
                                        }
                                    }
                                }
                            });
                            cleanupCall(user.currentCallId);
                        }
                    }
                    // Cleanup user
                    users.delete(userId);
                    socketToUser.delete(socket.id);
                    console.log(`User ${userId} disconnected`);
                }
            }
        }
        catch (error) {
            console.error("Error in disconnect:", error);
        }
    });
});
// Start server
const PORT = Number(process.env.PORT) || 8001;
io.listen(PORT);
console.log(`🚀 WebRTC Signalling Server running on port ${PORT}`);
console.log(`📡 CORS enabled for: ${process.env.CLIENT_URL || "*"}`);
// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    io.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    io.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

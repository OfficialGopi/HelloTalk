import type { Socket } from "socket.io-client";
import { getWebRTCSocket } from "./WebRTCSignalProvider";

interface CallOptions {
  to: string;
  callType: "audio" | "video";
}

interface WebRTCEvents {
  onCallIncoming?: (data: {
    from: string;
    callType: "audio" | "video";
    callId: string;
  }) => void;
  onCallAccepted?: (data: { callId: string; by: string }) => void;
  onCallRejected?: (data: { callId: string; by: string }) => void;
  onCallEnded?: (data: { callId: string; by: string; reason?: string }) => void;
  onCallOffer?: (data: {
    offer: RTCSessionDescriptionInit;
    from: string;
    callType: "audio" | "video";
  }) => void;
  onCallAnswer?: (data: {
    answer: RTCSessionDescriptionInit;
    from: string;
  }) => void;
  onIceCandidate?: (data: {
    candidate: RTCIceCandidateInit;
    from: string;
  }) => void;
  onUserStatus?: (data: {
    userId: string;
    isOnline: boolean;
    isInCall: boolean;
  }) => void;
  onError?: (data: { message: string }) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

class WebRTC {
  private peerConnection: RTCPeerConnection;
  private webRtcSocket: Socket;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private currentCallType: "audio" | "video" | null = null;
  private isInitiator: boolean = false;
  private events: WebRTCEvents = {};

  constructor() {
    // Initialize RTCPeerConnection with proper configuration
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    });

    this.webRtcSocket = getWebRTCSocket();
    this.setupSocketListeners();
    this.setupPeerConnectionListeners();
  }

  // Set up socket event listeners
  private setupSocketListeners() {
    this.webRtcSocket.on(
      "call:incoming",
      (data: { from: string; callType: "audio" | "video"; callId: string }) => {
        this.events.onCallIncoming?.(data);
      }
    );

    this.webRtcSocket.on(
      "call:accepted",
      (data: { callId: string; by: string }) => {
        this.events.onCallAccepted?.(data);
      }
    );

    this.webRtcSocket.on(
      "call:rejected",
      (data: { callId: string; by: string }) => {
        this.events.onCallRejected?.(data);
        this.cleanup();
      }
    );

    this.webRtcSocket.on(
      "call:ended",
      (data: { callId: string; by: string; reason?: string }) => {
        this.events.onCallEnded?.(data);
        this.cleanup();
      }
    );

    this.webRtcSocket.on(
      "call:offer",
      (data: {
        offer: RTCSessionDescriptionInit;
        from: string;
        callType: "audio" | "video";
      }) => {
        this.events.onCallOffer?.(data);
      }
    );

    this.webRtcSocket.on(
      "call:answer",
      (data: { answer: RTCSessionDescriptionInit; from: string }) => {
        this.events.onCallAnswer?.(data);
      }
    );

    this.webRtcSocket.on(
      "ice:candidate",
      (data: { candidate: RTCIceCandidateInit; from: string }) => {
        this.events.onIceCandidate?.(data);
      }
    );

    this.webRtcSocket.on(
      "user:status",
      (data: { userId: string; isOnline: boolean; isInCall: boolean }) => {
        this.events.onUserStatus?.(data);
      }
    );

    this.webRtcSocket.on("error", (data: { message: string }) => {
      this.events.onError?.(data);
    });
  }

  // Set up RTCPeerConnection event listeners
  private setupPeerConnectionListeners() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentCallId) {
        // Send ICE candidate to the other peer
        this.webRtcSocket.emit("ice:candidate", {
          candidate: event.candidate,
          from: this.getCurrentUserId(),
          to: this.getRemoteUserId(),
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      // Emit event for remote stream
      this.events.onRemoteStream?.(this.remoteStream);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state:",
        this.peerConnection.iceConnectionState
      );
      if (this.peerConnection.iceConnectionState === "failed") {
        this.peerConnection.restartIce();
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", this.peerConnection.connectionState);
    };
  }

  // Join the signalling server
  async join(userId: string): Promise<void> {
    try {
      this.webRtcSocket.emit("user:join", { userId });
      return new Promise((resolve, reject) => {
        this.webRtcSocket.once("user:joined", () => resolve());
        this.webRtcSocket.once("error", (error) => reject(error));
      });
    } catch (error) {
      console.error("Failed to join:", error);
      throw error;
    }
  }

  // Initiate a call
  async initiateCall(options: CallOptions): Promise<string> {
    try {
      this.isInitiator = true;
      this.currentCallType = options.callType;

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: options.callType === "video",
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      // Emit initiate call event
      this.webRtcSocket.emit("call:initiate", {
        to: options.to,
        callType: options.callType,
      });

      return new Promise((resolve, reject) => {
        this.webRtcSocket.once("call:initiated", (data) => {
          this.currentCallId = data.callId;
          resolve(data.callId);
        });
        this.webRtcSocket.once("error", (error) => reject(error));
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      throw error;
    }
  }

  // Accept an incoming call
  async acceptCall(
    callId: string,
    from: string,
    callType: "audio" | "video"
  ): Promise<void> {
    try {
      this.currentCallId = callId;
      this.currentCallType = callType;
      this.isInitiator = false;

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      // Accept the call
      this.webRtcSocket.emit("call:accept", { callId, from });
    } catch (error) {
      console.error("Failed to accept call:", error);
      throw error;
    }
  }

  // Reject an incoming call
  rejectCall(callId: string, from: string): void {
    this.webRtcSocket.emit("call:reject", { callId, from });
    this.cleanup();
  }

  // Create and send offer
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to the other peer
      this.webRtcSocket.emit("call:offer", {
        offer,
        from: this.getCurrentUserId(),
        to: this.getRemoteUserId(),
        callType: this.currentCallType!,
      });

      return offer;
    } catch (error) {
      console.error("Failed to create offer:", error);
      throw error;
    }
  }

  // Create and send answer
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer to the other peer
      this.webRtcSocket.emit("call:answer", {
        answer,
        from: this.getCurrentUserId(),
        to: this.getRemoteUserId(),
      });

      return answer;
    } catch (error) {
      console.error("Failed to create answer:", error);
      throw error;
    }
  }

  // Receive and set remote offer
  async receiveOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection.setRemoteDescription(offer);
      // Create and send answer
      await this.createAnswer();
    } catch (error) {
      console.error("Failed to receive offer:", error);
      throw error;
    }
  }

  // Receive and set remote answer
  async receiveAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error("Failed to receive answer:", error);
      throw error;
    }
  }

  // Add ICE candidate
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error("Failed to add ICE candidate:", error);
      throw error;
    }
  }

  // End the current call
  endCall(): void {
    if (this.currentCallId) {
      this.webRtcSocket.emit("call:end", { callId: this.currentCallId });
    }
    this.cleanup();
  }

  // Get user status
  getUserStatus(userId: string): void {
    this.webRtcSocket.emit("user:status", { userId });
  }

  // Handle incoming call - this should be called when receiving a call:incoming event
  async handleIncomingCall(
    callId: string,
    from: string,
    callType: "audio" | "video"
  ): Promise<void> {
    // Store the call information for when the user accepts
    this.currentCallId = callId;
    this.currentCallType = callType;
    // Note: Don't set isInitiator here as this is for incoming calls
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Check if in call
  isInCall(): boolean {
    return this.currentCallId !== null;
  }

  // Get current call ID
  getCurrentCallId(): string | null {
    return this.currentCallId;
  }

  // Get current call type
  getCurrentCallType(): "audio" | "video" | null {
    return this.currentCallType;
  }

  // Check if current user is the call initiator
  isCallInitiator(): boolean {
    return this.isInitiator;
  }

  // Get current call information
  getCurrentCallInfo(): {
    callId: string | null;
    callType: "audio" | "video" | null;
    isInitiator: boolean;
  } {
    return {
      callId: this.currentCallId,
      callType: this.currentCallType,
      isInitiator: this.isInitiator,
    };
  }

  // Mute/unmute audio
  toggleAudioMute(muted: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  // Mute/unmute video
  toggleVideoMute(muted: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  // Switch camera (for video calls)
  async switchCamera(): Promise<void> {
    if (this.currentCallType !== "video" || !this.localStream) {
      throw new Error(
        "Cannot switch camera: not in video call or no local stream"
      );
    }

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Stop current video track
        videoTrack.stop();

        // Get new video stream with different camera
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode:
              videoTrack.getSettings().facingMode === "user"
                ? "environment"
                : "user",
          },
        });

        const newVideoTrack = newStream.getVideoTracks()[0];

        // Replace video track in local stream
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);

        // Replace video track in peer connection
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(
          (sender) => sender.track?.kind === "video"
        );
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        }
      }
    } catch (error) {
      console.error("Failed to switch camera:", error);
      throw error;
    }
  }

  // Get connection statistics
  async getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) {
      return null;
    }

    try {
      return await this.peerConnection.getStats();
    } catch (error) {
      console.error("Failed to get connection stats:", error);
      return null;
    }
  }

  // Get connection quality information
  async getConnectionQuality(): Promise<{
    iceConnectionState: RTCIceConnectionState;
    connectionState: RTCPeerConnectionState;
    iceGatheringState: RTCIceGatheringState;
    signalingState: RTCSignalingState;
  } | null> {
    if (!this.peerConnection) {
      return null;
    }

    return {
      iceConnectionState: this.peerConnection.iceConnectionState,
      connectionState: this.peerConnection.connectionState,
      iceGatheringState: this.peerConnection.iceGatheringState,
      signalingState: this.peerConnection.signalingState,
    };
  }

  // Set event handlers
  on<K extends keyof WebRTCEvents>(event: K, handler: WebRTCEvents[K]): void {
    this.events[event] = handler;
  }

  // Remove event handler
  off<K extends keyof WebRTCEvents>(event: K): void {
    delete this.events[event];
  }

  // Cleanup resources
  private cleanup(): void {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10,
      });
      this.setupPeerConnectionListeners();
    }

    // Reset state
    this.currentCallId = null;
    this.currentCallType = null;
    this.isInitiator = false;
    this.remoteStream = null;
  }

  // Get current user ID (this should be implemented based on your auth system)
  private getCurrentUserId(): string {
    // This should return the current user's ID from your auth context
    // For now, returning a placeholder - implement this based on your auth system
    return "current-user-id";
  }

  // Get remote user ID (this should be implemented based on your call logic)
  private getRemoteUserId(): string {
    // This should return the remote user's ID from your call context
    // For now, returning a placeholder - implement this based on your call logic
    return "remote-user-id";
  }

  // Destroy the WebRTC instance
  destroy(): void {
    this.cleanup();
    this.webRtcSocket.disconnect();
  }
}

export default WebRTC;

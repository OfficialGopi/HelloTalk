import { getSocket } from "@/lib/Socket";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

// Types for socket events
type OfferPayload = {
  offer: RTCSessionDescriptionInit;
  from: string;
};

type AnswerPayload = {
  answer: RTCSessionDescriptionInit;
};

type IceCandidatePayload = {
  candidate: RTCIceCandidateInit;
};

type HangupPayload = {
  to?: string | null;
};

type CallMode = "audio" | "video";

type CallProps = {
  calleeId?: string | null;
  callerId?: string | null;
  mode: CallMode;
  isOutgoing: boolean;
  initialOffer?: RTCSessionDescriptionInit | null;
  onClose?: () => void;
};

const Call = ({
  calleeId,
  callerId: incomingCallerId,
  mode,
  isOutgoing,
  initialOffer = null,
  onClose,
}: CallProps) => {
  const socket = getSocket();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callIncoming, setCallIncoming] = useState<boolean>(!isOutgoing);
  const [callerId, setCallerId] = useState<string | null>(
    incomingCallerId || null
  );
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const remoteCombinedStreamRef = useRef<MediaStream | null>(null);

  // ICE servers for STUN/TURN
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      // Add TURN servers here if needed
    ],
  };

  // Get user media on mount with constraints based on mode
  useEffect(() => {
    const getMedia = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          // Request audio always. Request video only in video mode.
          audio: { echoCancellation: true, noiseSuppression: true },
          video: mode === "video" ? { width: 1280, height: 720 } : false,
        } as MediaStreamConstraints;
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media", err);
      }
    };
    getMedia();
  }, [mode]);

  // Connect to socket and set up listeners
  useEffect(() => {
    socketRef.current = socket;

    // We do NOT listen to receive:offer here. Chat opens the modal and passes
    // the initialOffer into this component for a single, controlled handling.

    // Listen for incoming answer
    socketRef.current.on(
      "receive:answer",
      async ({ answer }: AnswerPayload) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      }
    );

    // Listen for ICE candidates
    socketRef.current.on(
      "receive-ice-candidate",
      async ({ candidate }: IceCandidatePayload) => {
        try {
          if (peerConnectionRef.current && candidate) {
            await peerConnectionRef.current.addIceCandidate(candidate);
          }
        } catch (err) {
          console.error("Error adding received ice candidate", err);
        }
      }
    );

    // Listen for hangup
    socketRef.current.on("call:hangup", () => {
      endCall();
    });

    return () => {
      // remove listeners, do not disconnect the global socket
      socketRef.current?.off("receive:answer");
      socketRef.current?.off("receive-ice-candidate");
      socketRef.current?.off("call:hangup");
    };
    // eslint-disable-next-line
  }, [myStream]);

  // Helper to create peer connection
  const createPeerConnection = (otherUserId: string) => {
    const pc = new RTCPeerConnection(iceServers);

    // We rely on addTrack for local sending, and ontrack for receiving.
    // Avoid adding extra transceivers which can cause asymmetric directions.

    // Send ICE candidates to peer
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socketRef.current?.emit("send-ice-candidate", {
          to: otherUserId,
          candidate: event.candidate,
        });
      }
    };

    // When remote stream arrives
    pc.ontrack = (event: RTCTrackEvent) => {
      // Some browsers provide event.streams, others only event.track
      if (!remoteCombinedStreamRef.current) {
        remoteCombinedStreamRef.current = new MediaStream();
      }
      const combined = remoteCombinedStreamRef.current;
      const incomingTrack = event.track;
      const alreadyHas = combined
        .getTracks()
        .some((t) => t.id === incomingTrack.id);
      if (!alreadyHas) combined.addTrack(incomingTrack);

      setRemoteStream(combined);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = combined;
        (remoteVideoRef.current as HTMLVideoElement).play?.().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = combined;
        // Ensure not muted and volume is up
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.play?.().catch(() => {});
      }
    };

    return pc;
  };

  // Initiate a call
  const startCall = async () => {
    if (!calleeId || !myStream) return;
    // If an old peerConnection exists, close it before starting
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null as any;
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }
    setIsCalling(true);
    peerConnectionRef.current = createPeerConnection(calleeId);

    // Add local stream tracks with explicit kind handling to ensure both sides send audio
    const pc = peerConnectionRef.current!;
    myStream.getAudioTracks().forEach((track) => pc.addTrack(track, myStream));
    if (mode === "video") {
      myStream
        .getVideoTracks()
        .forEach((track) => pc.addTrack(track, myStream));
    }

    // Create offer
    const offer = await peerConnectionRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: mode === "video",
    } as any);
    await peerConnectionRef.current.setLocalDescription(offer);

    // Send offer to callee with mode so receiver can set UI
    socketRef.current?.emit("send:offer", {
      to: calleeId,
      offer,
      mode,
    });

    setIsMuted(false);
    setCallActive(true);
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!callerId || !peerConnectionRef.current || !myStream) return;
    setIsMuted(false);
    setCallActive(true);
    setCallIncoming(false);

    // Add local stream tracks with explicit kind handling
    const pc = peerConnectionRef.current!;
    myStream.getAudioTracks().forEach((track) => pc.addTrack(track, myStream));
    if (mode === "video") {
      myStream
        .getVideoTracks()
        .forEach((track) => pc.addTrack(track, myStream));
    }

    // Create answer
    const answer = await peerConnectionRef.current.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: mode === "video",
    } as any);
    await peerConnectionRef.current.setLocalDescription(answer);

    // Send answer to caller
    socketRef.current?.emit("send:answer", {
      to: callerId,
      answer,
    });
  };

  // Reject incoming call
  const rejectCall = () => {
    setCallIncoming(false);
    setCallerId(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (myStream) {
      myStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
    }
    // Notify caller that the call was rejected
    const target = callerId || calleeId;
    if (target) socketRef.current?.emit("call:reject", { to: target });
    onClose?.();
  };

  // Hang up call
  const endCall = () => {
    setCallActive(false);
    setIsCalling(false);
    setCallIncoming(false);
    setCallerId(null);
    setRemoteStream(null);
    // Stop local tracks to release mic/camera properly
    if (myStream) {
      myStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    socketRef.current?.emit("call:hangup", {
      to: calleeId || callerId,
    } as HangupPayload);
    onClose?.();
  };

  // Auto-start outgoing call when stream ready
  const shouldAutoStart = useMemo(
    () => isOutgoing && !!calleeId && !!myStream,
    [isOutgoing, calleeId, myStream]
  );
  useEffect(() => {
    if (shouldAutoStart) {
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoStart]);

  // If initial offer is provided (opened due to incoming call), set it
  useEffect(() => {
    const setupFromInitialOffer = async () => {
      if (!initialOffer) return;
      // incoming offer
      setCallIncoming(true);
      setCallerId(incomingCallerId || null);
      if (!incomingCallerId) return;
      peerConnectionRef.current = createPeerConnection(incomingCallerId);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(initialOffer)
      );
      if (myStream) {
        myStream.getTracks().forEach((track) => {
          peerConnectionRef.current?.addTrack(track, myStream);
        });
      }
    };
    setupFromInitialOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOffer]);

  // Keep remote audio element in sync with remote stream
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play?.().catch(() => {});
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (!myStream) return;
    const newMuted = !isMuted;
    myStream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
    setIsMuted(newMuted);
  };

  // Attach streams to video elements
  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        (remoteVideoRef.current as HTMLVideoElement).play?.().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.play?.().catch(() => {});
      }
    }
  }, [remoteStream]);

  // Handle remote rejection
  useEffect(() => {
    const onRejected = () => {
      // Close UI and cleanup if remote rejected
      endCall();
    };
    socketRef.current?.on("call:rejected", onRejected);
    return () => {
      socketRef.current?.off("call:rejected", onRejected);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-neutral-900 text-white flex flex-col justify-between">
      {/* VIDEO GRID */}
      {mode === "video" && (
        <div className="flex flex-1 items-center justify-center gap-4 p-4 sm:p-6 flex-col sm:flex-row">
          {/* Local video */}
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            className="bg-black rounded-xl shadow-lg object-cover w-full sm:w-1/2 h-72 sm:h-[400px]"
          />

          {/* Remote / Callee video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="bg-black rounded-xl shadow-lg object-cover w-full sm:w-1/2 h-72 sm:h-[400px] border-4 border-green-500"
          />
        </div>
      )}

      {/* AUDIO PLACEHOLDER */}
      {mode === "audio" && (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-800 flex items-center justify-center shadow-inner">
            <Mic className="text-neutral-400 w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <p className="text-sm sm:text-lg text-neutral-400 italic mt-4">
            Audio call in progress...
          </p>
          {/* Hidden element for remote audio playback */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
        </div>
      )}

      {/* CONTROLS */}
      <div className="w-full flex justify-center gap-4 sm:gap-6 p-4 sm:p-6 bg-neutral-950/70 border-t border-neutral-800">
        <AnimatePresence>
          {callIncoming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              <span className="hidden sm:block text-neutral-300 font-medium tracking-wide">
                Incoming call...
              </span>
              <button
                onClick={acceptCall}
                className="bg-green-600 hover:bg-green-700 transition-all text-white p-4 sm:p-5 rounded-full shadow-lg"
              >
                <Phone size={20} className="sm:!w-6 sm:!h-6" />
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-600 hover:bg-red-700 transition-all text-white p-4 sm:p-5 rounded-full shadow-lg"
              >
                <PhoneOff size={20} className="sm:!w-6 sm:!h-6" />
              </button>
            </motion.div>
          )}

          {callActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4 sm:gap-6"
            >
              <button
                onClick={toggleMute}
                className="bg-neutral-700 hover:bg-neutral-600 transition-all text-white p-4 sm:p-5 rounded-full shadow-lg"
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 transition-all text-white p-4 sm:p-5 rounded-full shadow-lg"
              >
                <PhoneOff size={20} />
              </button>
            </motion.div>
          )}

          {!callActive && !callIncoming && isOutgoing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm sm:text-lg text-neutral-400 italic"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {isCalling ? "Calling..." : "Starting call..."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Call;

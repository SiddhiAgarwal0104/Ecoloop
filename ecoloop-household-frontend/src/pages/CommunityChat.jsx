// pages/CommunityChat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Image as ImageIcon, X, CheckCheck,
  Loader2, ShieldCheck, PackageCheck, ThumbsUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const getId = (ref) => ref?._id || ref;
const getName = (participant) => participant?.userId?.name || 'User';

const fmt = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS = {
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  PARTIALLY_CONFIRMED: {
    label: 'Waiting for other party…',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  IN_NEGOTIATION: {
    label: 'In Negotiation',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

// ══════════════════════════════════════════════════════════════════════════════
export default function CommunityChat() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [roomId, setRoomId] = useState(null); // actual DB _id

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);

  // ── scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // ── socket setup ─────────────────────────────────────────────────────────
  const setupSocket = useCallback((rid) => {
    // Tear down old connection
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token =
      localStorage.getItem('token') || localStorage.getItem('recycler_token');

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join_chat_room', { roomId: rid });
    });

    // ── incoming message ───────────────────────────────────────────────────
    socket.on('newMessage', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    // ── typing indicator ───────────────────────────────────────────────────
    socket.on('typing', ({ isTyping }) => {
      setOtherTyping(isTyping);
    });

    // ── status updates ─────────────────────────────────────────────────────
    socket.on('lendingConfirmed', () => {
      fetchRoom(rid);
    });
    socket.on('itemHandedOver', () => {
      fetchRoom(rid);
    });
    socket.on('itemPickedUp', () => {
      fetchRoom(rid);
    });

    socket.on('disconnect', () => {
      setOtherTyping(false);
    });

    socketRef.current = socket;
  }, []);

  // ── fetch only the room (refresh state after socket events) ─────────────
  const fetchRoom = async (rid) => {
    try {
      const res = await api.get(`/chat/room-by-id/${rid}`);
      setChatRoom(res.data.data);
    } catch (_) {}
  };

  // ── initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try by requestId first, fall back to chatRoomId
        let room;
        try {
          const r = await api.get(`/chat/room/${chatRoomId}`);
          room = r.data.data;
        } catch (e) {
          if (e.response?.status === 404) {
            const r = await api.get(`/chat/room-by-id/${chatRoomId}`);
            room = r.data.data;
          } else throw e;
        }

        if (cancelled) return;
        setChatRoom(room);
        setRoomId(room._id);

        const msgRes = await api.get(`/chat/${room._id}/messages`);
        if (!cancelled) {
          setMessages(msgRes.data.data || []);
          setupSocket(room._id);
        }
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || 'Failed to load chat');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [chatRoomId, setupSocket]);

  // ── derived values ────────────────────────────────────────────────────────
  const myId = user?.id || user?._id;

  const getUserRole = () =>
    chatRoom?.participants?.find(
      (p) => getId(p.userId)?.toString() === myId?.toString()
    )?.role;

  const otherParticipant = chatRoom?.participants?.find(
    (p) => getId(p.userId)?.toString() !== myId?.toString()
  );

  const getStatus = () => {
    if (chatRoom?.lenderConfirmed && chatRoom?.borrowerConfirmed) return 'CONFIRMED';
    if (chatRoom?.lenderConfirmed || chatRoom?.borrowerConfirmed) return 'PARTIALLY_CONFIRMED';
    return 'IN_NEGOTIATION';
  };

  const isMine = (msg) => {
    const sid = getId(msg.senderId)?.toString();
    return sid === myId?.toString();
  };

  // ── typing emit ───────────────────────────────────────────────────────────
  const emitTyping = (isTyping) => {
    socketRef.current?.emit('typing', { roomId, isTyping });
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  };

  // ── send message ──────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedImage) return;
    if (!roomId) return;

    emitTyping(false);
    clearTimeout(typingTimer.current);

    try {
      setSending(true);

      if (messageText.trim()) {
        const res = await api.post(`/chat/${roomId}/message`, {
          content: messageText.trim(),
        });
        // Add optimistically — socket will also fire but dedupe handles it
        setMessages((prev) =>
          prev.some((m) => m._id === res.data.data._id)
            ? prev
            : [...prev, res.data.data]
        );
        setMessageText('');
      }

      if (selectedImage) {
        const fd = new FormData();
        fd.append('image', selectedImage);
        const res = await api.post(`/chat/${roomId}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessages((prev) =>
          prev.some((m) => m._id === res.data.data._id)
            ? prev
            : [...prev, res.data.data]
        );
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ── image select ──────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // ── confirmation actions ──────────────────────────────────────────────────
  const doAction = async (endpoint, updater) => {
    try {
      setConfirming(true);
      const res = await api.post(`/chat/${roomId}${endpoint}`);
      setChatRoom(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setConfirming(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0fdf4]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#25d366]" size={36} />
          <p className="text-slate-500 text-sm">Loading chat…</p>
        </div>
      </div>
    );
  }

  if (error && !chatRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#f0fdf4]">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-[#25d366] text-white rounded-xl text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const status = getStatus();
  const statusCfg = STATUS[status];
  const role = getUserRole();

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: '#efeae2',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c0b0' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm z-10"
        style={{ background: '#075e54' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-white/80 hover:text-white transition p-1 rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: '#128c7e' }}
        >
          {getName(otherParticipant).charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {getName(otherParticipant)}
          </p>
          <p className="text-white/60 text-xs truncate">
            {otherTyping ? (
              <span className="text-[#25d366]">typing…</span>
            ) : (
              chatRoom?.requestId?.itemName || 'Community Chat'
            )}
          </p>
        </div>
      </div>

      {/* ── STATUS BANNER ──────────────────────────────────────────────────── */}
      <div className={`mx-3 mt-3 rounded-2xl border ${statusCfg.bg} ${statusCfg.border} p-3 shadow-sm`}>
        {/* Status row */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
          <span className={`text-xs font-semibold ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {status !== 'CONFIRMED' && (
          <>
            <div className="flex gap-4 text-xs text-slate-500 mb-2.5">
              <span className={chatRoom?.lenderConfirmed ? 'text-emerald-600 font-medium' : ''}>
                {chatRoom?.lenderConfirmed ? '✓' : '○'} Lender
              </span>
              <span className={chatRoom?.borrowerConfirmed ? 'text-emerald-600 font-medium' : ''}>
                {chatRoom?.borrowerConfirmed ? '✓' : '○'} Borrower
              </span>
            </div>

            <div className="flex gap-2">
              {role === 'lender' && !chatRoom?.lenderConfirmed && (
                <ActionButton
                  icon={<ThumbsUp size={15} />}
                  label="Confirm Lending"
                  color="#25d366"
                  loading={confirming}
                  onClick={() => doAction('/confirm-lend')}
                />
              )}
              {role === 'requester' && !chatRoom?.borrowerConfirmed && (
                <ActionButton
                  icon={<ThumbsUp size={15} />}
                  label="Confirm Borrowing"
                  color="#25d366"
                  loading={confirming}
                  onClick={() => doAction('/confirm-borrow')}
                />
              )}
              {((role === 'lender' && chatRoom?.lenderConfirmed) ||
                (role === 'requester' && chatRoom?.borrowerConfirmed)) && (
                <p className="text-xs text-emerald-600 font-medium py-1">
                  ✓ You confirmed — waiting for other party
                </p>
              )}
            </div>
          </>
        )}

        {status === 'CONFIRMED' && (
          <div className="flex gap-2">
            {role === 'lender' && !chatRoom?.handedOver && (
              <ActionButton
                icon={<PackageCheck size={15} />}
                label="Hand Over Item"
                color="#075e54"
                loading={confirming}
                onClick={() => doAction('/hand-over')}
              />
            )}
            {chatRoom?.handedOver && !chatRoom?.pickedUp && role === 'requester' && (
              <ActionButton
                icon={<ShieldCheck size={15} />}
                label="Picked Up"
                color="#8b5cf6"
                loading={confirming}
                onClick={() => doAction('/picked-up')}
              />
            )}
            {chatRoom?.handedOver && chatRoom?.pickedUp && (
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                <CheckCheck size={16} />
                Transaction Complete!
              </div>
            )}
            {chatRoom?.handedOver && !chatRoom?.pickedUp && role === 'lender' && (
              <p className="text-xs text-slate-500 py-1">
                Item handed over — waiting for borrower to confirm pickup
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── MESSAGES ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center shadow">
              <Send size={28} className="text-[#25d366]" />
            </div>
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const mine = isMine(msg);
            const showDate =
              i === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[i - 1].createdAt).toDateString();

            return (
              <React.Fragment key={msg._id || i}>
                {showDate && (
                  <div className="flex justify-center my-2">
                    <span className="text-xs bg-white/70 text-slate-500 px-3 py-1 rounded-full shadow-sm">
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <MessageBubble msg={msg} mine={mine} />
              </React.Fragment>
            );
          })
        )}

        {/* Typing bubble */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── IMAGE PREVIEW ──────────────────────────────────────────────────── */}
      {imagePreview && (
        <div className="mx-3 mb-2 relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#25d366] shadow">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── INPUT BAR ──────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-3 py-3"
        style={{ background: '#f0f2f5' }}
      >
        {/* Image picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-[#25d366] shadow transition disabled:opacity-50"
        >
          <ImageIcon size={20} />
        </button>

        {/* Text input */}
        <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow flex items-center min-h-[40px]">
          <textarea
            rows={1}
            value={messageText}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message"
            disabled={sending}
            className="w-full resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none leading-relaxed max-h-32"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Send */}
        <button
          type="submit"
          disabled={sending || (!messageText.trim() && !selectedImage)}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow transition disabled:opacity-40"
          style={{ background: sending || (!messageText.trim() && !selectedImage) ? '#b0bec5' : '#25d366' }}
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function MessageBubble({ msg, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[72%] px-3 py-2 shadow-sm text-sm leading-relaxed
          ${mine
            ? 'bg-[#d9fdd3] text-slate-800 rounded-2xl rounded-tr-sm'
            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm'
          }`}
        style={{ wordBreak: 'break-word' }}
      >
        {msg.type === 'image' ? (
          <img
            src={msg.content}
            alt="attachment"
            className="rounded-xl max-w-full"
            style={{ maxHeight: 240 }}
          />
        ) : (
          <p>{msg.content}</p>
        )}

        {/* timestamp + tick */}
        <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
          <span className="text-[10px] text-slate-400">{fmt(msg.createdAt)}</span>
          {mine && <CheckCheck size={14} className="text-[#53bdeb]" />}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow transition disabled:opacity-60 active:scale-95"
      style={{ background: color }}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400"
          style={{
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, CheckCheck, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const QUICK_REPLIES = [
  '📋 Voir le menu',
  '🚚 Où est ma commande ?',
  '💰 Promotions du jour',
  '📞 Urgence commande',
];

export default function LiveChat() {
  const { user, token } = useAuth();

  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [roomId,    setRoomId]    = useState(null);
  const [connected, setConnected] = useState(false);
  const [isTyping,  setIsTyping]  = useState(false);
  const [unread,    setUnread]    = useState(0);

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);
  // ← FIX : refs pour éviter les closures périmées
  const openRef        = useRef(open);
  const minimizedRef   = useRef(minimized);
  const roomIdRef      = useRef(roomId);

  useEffect(() => { openRef.current = open; },           [open]);
  useEffect(() => { minimizedRef.current = minimized; }, [minimized]);
  useEffect(() => { roomIdRef.current = roomId; },       [roomId]);

  // ── Init Socket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connecté');
      setConnected(true);
      // FIX : ré-émettre chat:join si le chat était déjà ouvert (reconnexion)
      if (openRef.current && roomIdRef.current) {
        socket.emit('chat:join', {
          userId:   user.id,
          userName: user.nom || user.email,
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', () => setConnected(false));

    // FIX : utilise les refs pour éviter la closure périmée
    socket.on('chat:message', (msg) => {
      setMessages(prev => {
        // Évite les doublons (si le message est déjà dans l'historique)
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!openRef.current || minimizedRef.current) {
        setUnread(n => n + 1);
      }
    });

    socket.on('chat:typing', ({ isTyping: t }) => setIsTyping(t));

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  // ── Ouvrir le chat ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !user || !socketRef.current) return;
    setUnread(0);

    const init = async () => {
      try {
        const { data: room } = await api.post('/chat/room', {
          userId:   user.id,
          userName: user.nom || user.email,
        });
        setRoomId(room.roomId);

        // Rejoindre la room socket
        socketRef.current.emit('chat:join', {
          userId:   user.id,
          userName: user.nom || user.email,
        });

        const { data: hist } = await api.get(`/chat/history/${room.roomId}`);

        if (hist.length === 0) {
          setMessages([{
            id:         'welcome',
            senderRole: 'bot',
            senderName: 'FoodDash',
            message:    `👋 Bonjour ${user.nom || ''} ! Un conseiller va vous répondre sous peu. En attendant, utilisez les suggestions ci-dessous.`,
            createdAt:  new Date().toISOString(),
          }]);
        } else {
          setMessages(hist);
        }
      } catch (err) {
        console.error('Chat init error:', err);
      }
    };

    init();
  }, [open, user]);

  // ── Scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Envoi ───────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !roomId || !socketRef.current?.connected) return;

    socketRef.current.emit('chat:message', {
      roomId,
      senderId:   user.id,
      senderName: user.nom || user.email,
      senderRole: 'client',
      message:    text,
    });

    socketRef.current.emit('chat:typing', { roomId, name: user.nom, isTyping: false });
    clearTimeout(typingTimer.current);
    setInput('');
    inputRef.current?.focus();
  }, [input, roomId, user]);

  // ── Typing ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!roomId || !socketRef.current?.connected) return;
    socketRef.current.emit('chat:typing', { roomId, name: user.nom, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { roomId, name: user.nom, isTyping: false });
    }, 2000);
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setRoomId(null);
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // ── Bouton flottant ─────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 group"
        title="Chat support"
      >
        <MessageCircle className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
        <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${connected ? 'bg-green-400' : 'bg-gray-400'}`} />
        <span className="absolute left-full ml-3 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
          Support en direct
        </span>
      </button>
    );
  }

  // ── Fenêtre chat ────────────────────────────────────────────────────────
  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ease-out ${minimized ? 'h-14 w-72' : 'h-[560px] w-[370px]'}`}>
      <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">

        {/* Header */}
        <div
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none"
          onClick={() => minimized && setMinimized(false)}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              🍕
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-orange-500 ${connected ? 'bg-green-400' : 'bg-gray-300'}`} />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Support FoodDash</p>
              <p className="text-[11px] text-white/80 flex items-center gap-1">
                {connected
                  ? <><Wifi className="w-3 h-3" /> Conseiller disponible</>
                  : <><WifiOff className="w-3 h-3" /> Reconnexion...</>
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMinimized(v => !v)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-950">
              {messages.map((msg, i) => {
                const isMe  = msg.senderRole === 'client';
                const isBot = msg.senderRole === 'bot';
                return (
                  <div key={msg.id ?? i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-auto ${
                        isBot
                          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-600'
                      }`}>
                        {isBot ? '🤖' : (msg.senderName?.[0]?.toUpperCase() || 'A')}
                      </div>
                    )}
                    <div className={`max-w-[78%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-[10px] text-gray-400 px-1">
                          {isBot ? 'Assistant' : msg.senderName}
                        </span>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <span className={`text-[10px] text-gray-400 flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {fmtTime(msg.createdAt)}
                        {isMe && msg.isRead && <CheckCheck className="w-3 h-3 text-blue-400" />}
                      </span>
                      {isBot && i === messages.length - 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {QUICK_REPLIES.map((qr, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(qr)}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full hover:border-orange-400 hover:text-orange-600 transition"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {isMe && (
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-auto">
                        {user?.nom?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-xs flex-shrink-0">A</div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-3">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wide">Suggestions rapides</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(qr)}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-full hover:bg-orange-100 hover:text-orange-600 transition"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Votre message..."
                  rows={1}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 dark:text-white placeholder-gray-400 max-h-24"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !roomId || !connected}
                  className="bg-gradient-to-br from-orange-500 to-red-500 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Entrée pour envoyer · Maj+Entrée pour saut de ligne
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
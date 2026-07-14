import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, Search, CheckCheck, Clock, Users, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const QUICK_ADMIN = [
  '✅ Commande bien reçue !',
  '🚚 En cours de livraison',
  '⏱️ Environ 30 minutes',
  '🙏 Désolé pour le désagrément',
  '📞 Je vous appelle',
];

export default function AdminChat() {
  const { user, token } = useAuth();

  const [rooms,        setRooms]        = useState([]);
  const [activeRoom,   setActiveRoom]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [connected,    setConnected]    = useState(false);
  const [clientTyping, setClientTyping] = useState(false);
  const [search,       setSearch]       = useState('');
  const [totalUnread,  setTotalUnread]  = useState(0);

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  // FIX : ref pour éviter closure périmée sur activeRoom
  const activeRoomRef  = useRef(null);

  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

  // ── Socket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:joinAdmin');
      // FIX : rejoindre la room active si reconnexion
      if (activeRoomRef.current?.roomId) {
        socket.emit('chat:joinRoom', activeRoomRef.current.roomId);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Admin socket error:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('chat:message', (msg) => {
      // FIX : lire la ref pour éviter la closure périmée
      if (activeRoomRef.current?.roomId === msg.roomId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setRooms(prev => prev.map(r =>
        r.roomId === msg.roomId
          ? { ...r, lastMessage: msg.message, lastActivity: msg.createdAt }
          : r
      ));
    });

    socket.on('chat:newRoom', (room) => {
      setRooms(prev => {
        const exists = prev.find(r => r.roomId === room.roomId);
        if (exists) return prev.map(r => r.roomId === room.roomId ? { ...r, ...room } : r);
        return [room, ...prev];
      });
    });

    socket.on('chat:unread', ({ roomId }) => {
      // Ne pas incrémenter si la room est active (messages déjà vus)
      if (activeRoomRef.current?.roomId === roomId) return;
      setRooms(prev => prev.map(r =>
        r.roomId === roomId ? { ...r, unreadAdmin: (r.unreadAdmin || 0) + 1 } : r
      ));
      setTotalUnread(n => n + 1);
    });

    socket.on('chat:typing', ({ name, isTyping }) => {
      setClientTyping(isTyping ? name : false);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ── Charger rooms ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    api.get('/chat/rooms')
      .then(({ data }) => {
        setRooms(data);
        setTotalUnread(data.reduce((sum, r) => sum + (r.unreadAdmin || 0), 0));
      })
      .catch(console.error);
  }, [token]);

  // ── Sélectionner room ──────────────────────────────────────────────────
  const selectRoom = async (room) => {
    setActiveRoom(room);
    setClientTyping(false);
    socketRef.current?.emit('chat:joinRoom', room.roomId);

    try {
      const { data } = await api.get(`/chat/history/${room.roomId}`);
      setMessages(data);
    } catch (err) { console.error(err); }

    if (room.unreadAdmin > 0) {
      try {
        await api.put(`/chat/room/${room.roomId}/read`);
        setRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, unreadAdmin: 0 } : r));
        setTotalUnread(prev => Math.max(0, prev - (room.unreadAdmin || 0)));
      } catch (err) { console.error(err); }
    }
  };

  // ── Scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, clientTyping]);

  // ── Envoi ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !activeRoom || !socketRef.current?.connected) return;
    socketRef.current.emit('chat:message', {
      roomId:     activeRoom.roomId,
      senderId:   user.id,
      senderName: user.nom || 'Conseiller',
      senderRole: 'admin',
      message:    text,
    });
    socketRef.current.emit('chat:typing', { roomId: activeRoom.roomId, name: user.nom, isTyping: false });
    clearTimeout(typingTimer.current);
    setInput('');
  }, [input, activeRoom, user]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeRoom || !socketRef.current?.connected) return;
    socketRef.current.emit('chat:typing', { roomId: activeRoom.roomId, name: user.nom, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { roomId: activeRoom.roomId, name: user.nom, isTyping: false });
    }, 2000);
  };

  // ── Fermer room ────────────────────────────────────────────────────────
  const closeRoom = async (roomId, e) => {
    e?.stopPropagation();
    try {
      await api.put(`/chat/room/${roomId}/close`);
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      if (activeRoom?.roomId === roomId) { setActiveRoom(null); setMessages([]); }
    } catch (err) { console.error(err); }
  };

  const fmtTime = (d) => {
    const date = new Date(d);
    const diff = Date.now() - date;
    if (diff < 60000)   return "À l'instant";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (date.toDateString() === new Date().toDateString())
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const filteredRooms = rooms.filter(r =>
    r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Sidebar ── */}
      <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <h1 className="font-semibold text-gray-900 dark:text-white">Live Chat</h1>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {connected
                ? <><Wifi className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">En ligne</span></>
                : <><WifiOff className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400">Déco.</span></>
              }
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:text-white"
            />
          </div>
        </div>

        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/20 flex gap-4 text-xs text-orange-700 dark:text-orange-400">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{rooms.length} conv.</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{rooms.filter(r => r.status === 'open').length} actives</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8 text-center">
              <MessageCircle className="w-10 h-10 opacity-30" />
              <p className="text-sm">Aucune conversation active</p>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room.roomId}
                onClick={() => selectRoom(room)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-all group hover:bg-orange-50 dark:hover:bg-orange-900/10 ${
                  activeRoom?.roomId === room.roomId
                    ? 'bg-orange-50 dark:bg-orange-900/10 border-l-2 border-l-orange-500'
                    : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {room.clientName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-medium text-sm truncate ${room.unreadAdmin > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {room.clientName}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">
                      {fmtTime(room.lastActivity)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${room.unreadAdmin > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400'}`}>
                    {room.lastMessage || 'Conversation ouverte'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {room.unreadAdmin > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {room.unreadAdmin}
                    </span>
                  )}
                  <button
                    onClick={(e) => closeRoom(room.roomId, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Zone chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-orange-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600 dark:text-gray-300">Sélectionnez une conversation</p>
              <p className="text-sm mt-1 text-gray-400">Choisissez un client dans la liste</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {activeRoom.clientName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{activeRoom.clientName}</p>
                  <p className="text-xs text-gray-400">
                    {clientTyping
                      ? <span className="text-orange-500 animate-pulse">✍️ {clientTyping} écrit...</span>
                      : `Actif ${fmtTime(activeRoom.lastActivity)}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => closeRoom(activeRoom.roomId, e)}
                className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 dark:border-red-900 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <X className="w-3.5 h-3.5" /> Clôturer
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              {messages.map((msg, i) => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={msg.id ?? i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mt-auto ${
                      isAdmin
                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600'
                        : 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
                    }`}>
                      {isAdmin ? (user.nom?.[0]?.toUpperCase() || 'A') : msg.senderName?.[0]?.toUpperCase()}
                    </div>
                    <div className={`max-w-[65%] flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-gray-400 px-1">{msg.senderName}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isAdmin
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <span className={`text-[10px] text-gray-400 flex items-center gap-1 px-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {isAdmin && <CheckCheck className="w-3 h-3 text-blue-400" />}
                      </span>
                    </div>
                  </div>
                );
              })}

              {clientTyping && (
                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {activeRoom.clientName?.[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-3">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-2">
                {QUICK_ADMIN.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(r)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder={`Répondre à ${activeRoom.clientName}...`}
                  rows={2}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 dark:text-white placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                  className="bg-gradient-to-br from-orange-500 to-red-500 disabled:from-gray-200 disabled:to-gray-200 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white p-3 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-md shadow-orange-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
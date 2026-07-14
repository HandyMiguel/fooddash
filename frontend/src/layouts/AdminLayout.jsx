// layouts/AdminLayout.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, ClipboardList, Utensils,
  Settings, ChevronLeft, ChevronRight, LogOut, Shield,
  Bell, Sun, Moon, X, User, MessageCircle
} from 'lucide-react';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const adminNavItems = [
  { path: '/admin',           icon: LayoutDashboard, label: 'Dashboard',  exact: true,  color: '#f97316' },
  { path: '/admin/commandes', icon: ClipboardList,   label: 'Commandes',  exact: false, color: '#3b82f6' },
  { path: '/admin/plats',     icon: Utensils,        label: 'Plats',      exact: false, color: '#10b981' },
  { path: '/admin/chat',      icon: MessageCircle,   label: 'Chat',       exact: false, color: '#f97316' },
  { path: '/admin/settings',  icon: Settings,        label: 'Paramètres', exact: false, color: '#8b5cf6' },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const [chatUnread, setChatUnread] = useState(0);
  const socketRef = useRef(null);

  // Thème
  const bg = dark ? '#060608' : '#f0f0f3';
  const sidebarBg = dark ? 'linear-gradient(180deg, #0d0d12 0%, #080810 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)';
  const sidebarBorder = dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.5)';
  const topbarBg = dark ? 'rgba(6,6,8,0.8)' : 'rgba(255,255,255,0.8)';
  const topbarBorder = dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
  const navItemBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const navItemActiveBg = (color) => dark ? `linear-gradient(135deg, ${color}22, ${color}11)` : `${color}15`;
  const userBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const notifDropdownBg = dark ? '#0d0d14' : '#ffffff';
  const notifDropdownBorder = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)';
  const notifItemBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const notifItemBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const logoGradient = 'linear-gradient(135deg, #f97316, #ef4444)';

  // Socket pour les messages non lus du chat
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    api.get('/chat/rooms')
      .then(({ data }) => setChatUnread(data.reduce((s, r) => s + (r.unreadAdmin || 0), 0)))
      .catch(() => {});

    const socket = io(SOCKET_URL, { auth: { token }, reconnection: true });
    socket.on('connect', () => socket.emit('chat:joinAdmin'));
    socket.on('chat:message', (msg) => {
      if (msg.senderRole === 'client') setChatUnread(prev => prev + 1);
    });
    socket.on('chat:unread', () => {
      api.get('/chat/rooms')
        .then(({ data }) => setChatUnread(data.reduce((s, r) => s + (r.unreadAdmin || 0), 0)))
        .catch(() => {});
    });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, []);

  // Réinitialiser le compteur quand on va sur la page chat
  useEffect(() => {
    if (location.pathname === '/admin/chat') setChatUnread(0);
  }, [location.pathname]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/commandes/all');
      const commandes = Array.isArray(res.data) ? res.data : res.data.commandes ?? [];
      const enAttente = commandes.filter(c => c.statut === 'en_attente');
      const nouvelles = commandes.filter(c => {
        const created = new Date(c.createdAt);
        const now = new Date();
        return (now - created) < 5 * 60 * 1000;
      });
      
      const notifs = [];
      if (nouvelles.length > 0) {
        notifs.push({
          id: 'nouvelles',
          type: 'info',
          message: `${nouvelles.length} nouvelle${nouvelles.length > 1 ? 's' : ''} commande${nouvelles.length > 1 ? 's' : ''} reçue${nouvelles.length > 1 ? 's' : ''}`,
          time: 'À l\'instant',
          color: '#3b82f6',
        });
      }
      if (enAttente.length > 0) {
        notifs.push({
          id: 'en_attente',
          type: 'warning',
          message: `${enAttente.length} commande${enAttente.length > 1 ? 's' : ''} en attente de traitement`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          color: '#f59e0b',
        });
      }
      setNotifications(notifs);
    } catch (e) {
      console.error('Erreur chargement notifications');
    }
  };

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const unreadCount = notifications.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: bg, fontFamily: "'Syne', 'Inter', sans-serif", transition: 'background 0.3s' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 260,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: sidebarBg,
        borderRight: sidebarBorder,
        position: 'fixed', height: '100vh', zIndex: 40,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #f97316, #ef4444, transparent)',
        }} />

        <div style={{
          padding: '24px 20px 20px',
          borderBottom: sidebarBorder,
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 12, minHeight: 72,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                background: logoGradient,
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '0 0 20px rgba(249,115,22,0.35)',
              }}>🍔</div>
              <span style={{
                fontSize: 18, fontWeight: 800,
                background: logoGradient,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}>FoodDash</span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36,
              background: logoGradient,
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🍔</div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: 'rgba(255,255,255,0.5)', width: 28, height: 28,
                borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: 'rgba(255,255,255,0.5)', width: 32, height: 32,
                borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {!collapsed && (
          <div style={{ padding: '12px 20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <Shield size={11} color="#f97316" />
              <span style={{
                fontSize: 11, color: '#f97316', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Admin Panel</span>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {adminNavItems.map(({ path, icon: Icon, label, exact, color }) => {
            const active = isActive(path, exact);
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 12,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px' : '10px 14px',
                  borderRadius: 12, textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: active ? navItemActiveBg(color) : 'transparent',
                  border: active ? `1px solid ${color}33` : '1px solid transparent',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', background: color,
                    borderRadius: '0 4px 4px 0', boxShadow: `0 0 10px ${color}`,
                  }} />
                )}
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: active ? `${color}22` : navItemBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  <Icon size={17} color={active ? color : textMuted} />
                </div>
                {!collapsed && (
                  <span style={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? textColor : textMuted,
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}>{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: sidebarBorder }}>
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              background: userBg, marginBottom: 8,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: logoGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0,
              }}>
                {user?.nom?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.nom || 'Administrateur'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: textMuted }}>Admin</p>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? 10 : '10px 14px',
              borderRadius: 10, border: 'none', background: 'transparent',
              color: textMuted, cursor: 'pointer',
              fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: collapsed ? 72 : 260,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh', background: bg,
      }}>
        <div style={{
          height: 64, borderBottom: topbarBorder,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 28px', background: topbarBg,
          backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30,
          gap: 12,
        }}>
          {/* Bouton Chat avec compteur */}
          <Link to="/admin/chat" title="Chat clients" style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: location.pathname === '/admin/chat' ? 'rgba(249,115,22,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', textDecoration: 'none' }}>
            <MessageCircle size={17} style={{ color: location.pathname === '/admin/chat' ? '#f97316' : textMuted }} />
            {chatUnread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
                {chatUnread}
              </span>
            )}
          </Link>

          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              style={{
                position: 'relative',
                width: 38, height: 38, borderRadius: 10,
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Bell size={17} style={{ color: textMuted }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                  border: '2px solid #0a0a0a',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 360,
                background: notifDropdownBg,
                backdropFilter: 'blur(20px)',
                border: notifDropdownBorder,
                borderRadius: 16,
                boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
                zIndex: 100,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '14px 18px',
                  borderBottom: notifDropdownBorder,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: textColor, margin: 0 }}>Notifications</h3>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted, padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                      <Bell size={28} style={{ color: textMuted, marginBottom: 8 }} />
                      <p style={{ color: textMuted, fontSize: 13, margin: 0 }}>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <Link
                        key={notif.id}
                        to="/admin/commandes"
                        onClick={() => setShowNotif(false)}
                        style={{
                          display: 'flex', gap: 12, padding: '14px 18px',
                          borderBottom: idx < notifications.length - 1 ? `1px solid ${notifItemBorder}` : 'none',
                          textDecoration: 'none', transition: 'background 0.15s',
                          cursor: 'pointer', background: notifItemBg,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = notifItemBg}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${notif.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bell size={15} color={notif.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: textColor, margin: '0 0 2px 0' }}>{notif.message}</p>
                          <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>{notif.time}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <Link
                  to="/admin/commandes"
                  onClick={() => setShowNotif(false)}
                  style={{
                    display: 'block', padding: '12px 18px', borderTop: notifDropdownBorder,
                    textAlign: 'center', fontSize: 12, fontWeight: 700,
                    color: '#f97316', textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Voir toutes les commandes →
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/profil" title="Mon profil"
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <User size={17} style={{ color: textMuted }} />
          </Link>

          <button
            onClick={toggle}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {dark ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: textMuted }} />}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8, padding: '5px 12px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Système actif</span>
          </div>
        </div>
        <div style={{ padding: 32 }}>{children}</div>
      </main>
    </div>
  );
}
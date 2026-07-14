import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { ShoppingBag, ClipboardList, LogOut, Shield, Zap } from 'lucide-react';

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 9, fontSize: 13,
        fontWeight: 500, textDecoration: 'none',
        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
        border: active ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
        color: active ? '#fb923c' : 'rgba(255,255,255,0.55)',
        transition: 'all 0.2s', fontFamily: "'Syne', 'Inter', sans-serif",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
    >
      {typeof icon === 'string' ? <span style={{ fontSize: 14 }}>{icon}</span> : icon}
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 50,
      background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      fontFamily: "'Syne', 'Inter', sans-serif",
    }}>
      {/* Top accent */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #f97316 30%, #ef4444 60%, transparent 100%)',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20,
            boxShadow: '0 0 20px rgba(249,115,22,0.3)',
          }}>🍔</div>
          <span style={{
            fontSize: 20, fontWeight: 800,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>FoodDash</span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <NotificationBell />
              {user.role === 'admin' ? (
                <NavLink to="/admin" label="Admin" icon={<Shield size={14} />} />
              ) : (
                <>
                  <NavLink to="/" label="Menu" icon="🍽️" />
                  <NavLink to="/panier" label="Panier" icon={<ShoppingBag size={14} />} />
                  <NavLink to="/commandes" label="Commandes" icon={<ClipboardList size={14} />} />
                </>
              )}
              <button
                onClick={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(249,115,22,0.3)',
              }}
            >
              <Zap size={14} />
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
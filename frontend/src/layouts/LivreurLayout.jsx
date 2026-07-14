// layouts/LivreurLayout.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Truck, User, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Sparkles, MapPin
} from 'lucide-react';

const livreurNavItems = [
  { path: '/livreur',             icon: LayoutDashboard, label: 'Tableau de bord', exact: true,  color: '#FF6B35' },
  { path: '/livreur/disponibles', icon: MapPin,          label: 'Disponibles',     exact: false, color: '#3b82f6' },
  { path: '/profil',              icon: User,             label: 'Mon Profil',      exact: false, color: '#10b981' },
];

export default function LivreurLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();

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
  const logoGradient = 'linear-gradient(135deg, #FF6B35, #FF3366)';

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

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
          background: 'linear-gradient(90deg, transparent, #FF6B35, #FF3366, transparent)',
        }} />

        {/* Brand/Logo Header */}
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
                fontSize: 18, boxShadow: '0 0 20px rgba(255,107,53,0.35)',
              }}>🛵</div>
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
            }}>🛵</div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', width: 28, height: 28,
                borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Collapsed view expand button */}
        {collapsed && (
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', width: 32, height: 32,
                borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Badge role */}
        {!collapsed && (
          <div style={{ padding: '12px 20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: 6, padding: '4px 10px',
            }}>
              <Truck size={11} color="#FF6B35" />
              <span style={{
                fontSize: 11, color: '#FF6B35', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Espace Livreur</span>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {livreurNavItems.map(({ path, icon: Icon, label, exact, color }) => {
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
                  border: active ? `1px solid ${color}22` : '1px solid transparent',
                }}
              >
                <Icon size={18} color={active ? color : (dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.6)')} style={{ transition: 'transform 0.2s' }} />
                {!collapsed && (
                  <span style={{
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? textColor : textMuted,
                  }}>{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: 12, borderTop: sidebarBorder }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : 12, padding: collapsed ? 10 : '10px 14px',
              background: 'transparent', border: 'none', borderRadius: 12,
              cursor: 'pointer', transition: 'all 0.2s',
              color: '#ef4444',
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 600 }}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        marginLeft: collapsed ? 72 : 260,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minWidth: 0,
      }}>

        {/* Topbar */}
        <header style={{
          height: 72, background: topbarBg, backdropFilter: 'blur(12px)',
          borderBottom: topbarBorder, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: 0 }}>
              Bienvenue, {user?.nom || 'Livreur'} 👋
            </h2>
            <p style={{ fontSize: 11, color: textMuted, margin: '2px 0 0' }}>
              Statut : <span style={{ color: user?.disponible ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {user?.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              style={{
                background: navItemBg, border: 'none',
                width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: textColor, transition: 'all 0.2s',
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{user?.nom}</div>
                <div style={{ fontSize: 10, color: textMuted }}>
                  {user?.vehicule || 'Sans véhicule'}
                </div>
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF3366 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', fontWeight: 'bold'
              }}>
                {user?.nom?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

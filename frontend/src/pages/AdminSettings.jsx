// pages/AdminSettings.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Store, Moon, Sun, Bell, Globe, Shield, 
  Save, Trash2, AlertTriangle, Lock, X 
} from 'lucide-react';

export default function AdminSettings() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  
  const [restaurantName, setRestaurantName] = useState('FoodDash');
  const [restaurantEmail, setRestaurantEmail] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('3.99');
  const [minOrder, setMinOrder] = useState('15');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const bg = dark ? '#060608' : '#f0f0f3';
  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)';
  const textMuted2 = dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.55)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const itemBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const hoverBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const toggleBg = dark ? '#f97316' : '#d1d5db';
  const dangerBg = dark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.02)';
  const dangerBorder = dark ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(239,68,68,0.1)';
  const modalBg = dark ? '#0d0d14' : '#ffffff';
  const modalBorder = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
  const labelStyle = { fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data;
      if (data) {
        setRestaurantName(data.restaurantName || 'FoodDash');
        setRestaurantEmail(data.restaurantEmail || '');
        setRestaurantPhone(data.restaurantPhone || '');
        setRestaurantAddress(data.restaurantAddress || '');
        setDeliveryFee(data.deliveryFee || '3.99');
        setMinOrder(data.minOrder || '15');
        setNotificationsEnabled(data.notificationsEnabled !== false);
        setAutoAcceptOrders(data.autoAcceptOrders || false);
      }
    } catch (error) {
      console.log('Paramètres par défaut');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', {
        restaurantName,
        restaurantEmail,
        restaurantPhone,
        restaurantAddress,
        deliveryFee: parseFloat(deliveryFee),
        minOrder: parseFloat(minOrder),
        notificationsEnabled,
        autoAcceptOrders,
      });
      toast.success('Paramètres sauvegardés !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Réinitialiser toutes les données ? Cette action est irréversible !')) return;
    try {
      await api.post('/settings/reset');
      toast.success('Données réinitialisées');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div style={{ fontFamily: "'Syne','Inter',sans-serif", color: textColor, maxWidth: 900 }}>

      {/* Header */}
      <div className="as-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: textColor }}>Paramètres</h1>
          <p style={{ color: textMuted, fontSize: 13, margin: '4px 0 0' }}>
            Gérez les paramètres de votre restaurant
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="as-save-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 11,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 24px rgba(249,115,22,0.3)',
            opacity: loading ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          <Save size={15} /> Sauvegarder
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Restaurant Info */}
        <div className="as-card" style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '24px', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(249,115,22,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Store size={18} color="#f97316" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: textColor }}>Informations du restaurant</h3>
          </div>

          <div className="as-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Nom du restaurant</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Email</label>
              <input
                type="email"
                value={restaurantEmail}
                onChange={(e) => setRestaurantEmail(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="contact@fooddash.com"
              />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Téléphone</label>
              <input
                type="text"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="01 23 45 67 89"
              />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Adresse</label>
              <input
                type="text"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
                placeholder="123 rue de la Food"
              />
            </div>
          </div>
        </div>

        {/* Commandes */}
        <div className="as-card" style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '24px', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(59,130,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Globe size={18} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: textColor }}>Paramètres des commandes</h3>
          </div>

          <div className="as-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Frais de livraison (€)</label>
              <input
                type="number"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: 6, display: 'block' }}>Commande minimum (€)</label>
              <input
                type="number"
                step="0.01"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: inputBg, border: cardBorder,
                  borderRadius: 10, color: textColor, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Préférences */}
        <div className="as-card" style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '24px', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Shield size={18} color="#8b5cf6" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: textColor }}>Préférences</h3>
          </div>

          {/* Dark Mode */}
          <div className="as-toggle-row" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: itemBg,
            borderRadius: 10,
            border: cardBorder,
            marginBottom: 10,
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              {dark ? <Moon size={18} style={{ color: textMuted, flexShrink: 0 }} /> : <Sun size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: textColor, margin: 0 }}>Mode sombre</p>
                <p style={{ fontSize: 12, color: textMuted, margin: '2px 0 0' }}>Activer/Désactiver le thème sombre</p>
              </div>
            </div>
            <button
              onClick={toggle}
              style={{
                position: 'relative', flexShrink: 0,
                width: 44, height: 24, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: toggleBg,
              }}
            >
              <span style={{
                position: 'absolute', top: 2,
                left: dark ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Notifications */}
          <div className="as-toggle-row" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: itemBg,
            borderRadius: 10,
            border: cardBorder,
            marginBottom: 10,
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Bell size={18} style={{ color: textMuted, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: textColor, margin: 0 }}>Notifications</p>
                <p style={{ fontSize: 12, color: textMuted, margin: '2px 0 0' }}>Recevoir les alertes de commandes</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              style={{
                position: 'relative', flexShrink: 0,
                width: 44, height: 24, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: notificationsEnabled ? '#10b981' : toggleBg,
              }}
            >
              <span style={{
                position: 'absolute', top: 2,
                left: notificationsEnabled ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Auto-accept */}
          <div className="as-toggle-row" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: itemBg,
            borderRadius: 10,
            border: cardBorder,
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Lock size={18} style={{ color: textMuted, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: textColor, margin: 0 }}>Acceptation automatique</p>
                <p style={{ fontSize: 12, color: textMuted, margin: '2px 0 0' }}>Accepter automatiquement les commandes</p>
              </div>
            </div>
            <button
              onClick={() => setAutoAcceptOrders(!autoAcceptOrders)}
              style={{
                position: 'relative', flexShrink: 0,
                width: 44, height: 24, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: autoAcceptOrders ? '#10b981' : toggleBg,
              }}
            >
              <span style={{
                position: 'absolute', top: 2,
                left: autoAcceptOrders ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Zone danger */}
        <div className="as-card" style={{
          background: cardBg,
          border: dangerBorder,
          borderRadius: 16,
          padding: '24px',
          boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={18} color="#fca5a5" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#fca5a5' }}>Zone dangereuse</h3>
          </div>

          <button
            onClick={handleResetData}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              background: dangerBg,
              borderRadius: 10,
              border: dangerBorder,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = dangerBg;
              e.currentTarget.style.borderColor = dark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)';
            }}
          >
            <Trash2 size={16} style={{ color: '#fca5a5', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fca5a5', margin: '0 0 2px 0' }}>
                Réinitialiser toutes les données
              </p>
              <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.5)', margin: 0 }}>
                Cette action est irréversible
              </p>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .as-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }
          .as-save-btn {
            width: 100%;
          }
          .as-card {
            padding: 16px !important;
          }
          .as-form-grid {
            grid-template-columns: 1fr !important;
          }
          .as-toggle-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
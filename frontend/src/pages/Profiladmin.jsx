// pages/Profil.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, Mail, Phone, MapPin, Moon, Sun, LogOut, 
  Edit2, Save, X, Lock, Trash2, Shield, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Profiladmin() {
  const { user, logout, setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const bg = dark ? '#0a0a0a' : '#f0f0f3';
  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const itemBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)';
  const hoverBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const btnGhostBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnGhostBorder = dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';
  const btnGhostColor = dark ? 'rgba(255,255,255,0.6)' : 'rgba(26,26,46,0.6)';
  const modalBg = dark ? '#1a1a1a' : '#ffffff';
  const modalBorder = dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
  const modalOverlay = dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)';
  const dangerBg = dark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.02)';
  const dangerBorder = dark ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(239,68,68,0.1)';
  const toggleBg = dark ? '#f97316' : '#d1d5db';

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      toast.success('Profil mis à jour !');
      if (setUser) {
        setUser(prev => ({ ...prev, ...form }));
      }
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || ''
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Mot de passe modifié !');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/auth/account');
      toast.success('Compte supprimé');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pf-page" style={{
      minHeight: '100vh',
      background: bg,
      fontFamily: "'Syne','Inter',sans-serif",
      color: textColor,
      padding: '80px 20px 60px',
      transition: 'background 0.3s, color 0.3s',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            margin: '0 0 4px 0',
            letterSpacing: '-1px',
            color: textColor,
          }}>
            Profil
          </h1>
          <p style={{ color: textMuted, fontSize: 13, margin: 0 }}>
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Avatar Section */}
        <div style={{ 
          background: cardBg,
          border: cardBorder,
          borderRadius: 16,
          padding: '24px',
          textAlign: 'center',
          marginBottom: 16,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(249,115,22,0.2)',
          }}>
            {user?.nom?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: textColor }}>
            {user?.nom}
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: user?.role === 'admin' ? 'rgba(139,92,246,0.12)' : 'rgba(16,185,129,0.12)',
            border: `1px solid ${user?.role === 'admin' ? 'rgba(139,92,246,0.25)' : 'rgba(16,185,129,0.25)'}`,
            color: user?.role === 'admin' ? '#a78bfa' : '#6ee7b7',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            <Shield size={12} />
            {user?.role === 'admin' ? 'Administrateur' : 'Client'}
          </div>
        </div>

        {/* Info Section */}
        <div style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: 16,
          padding: '24px',
          marginBottom: 16,
        }}>
          <div className="pf-info-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            gap: 12,
          }}>
            <h3 style={{
              fontSize: 11,
              fontWeight: 700,
              color: textMuted,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
              whiteSpace: 'nowrap',
            }}>
              Informations personnelles
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: btnGhostBg,
                  border: btnGhostBorder,
                  color: btnGhostColor,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: loading ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Save size={14} /> Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: btnGhostBg,
                    border: btnGhostBorder,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} style={{ color: textMuted }} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Nom */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: itemBg,
              borderRadius: 10,
              border: cardBorder,
            }}>
              <User size={16} style={{ color: textMuted, flexShrink: 0 }} />
              {editing ? (
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    color: textColor,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nom}</span>
              )}
            </div>

            {/* Email */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: itemBg,
              borderRadius: 10,
              border: cardBorder,
            }}>
              <Mail size={16} style={{ color: textMuted, flexShrink: 0 }} />
              {editing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    color: textColor,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
              )}
            </div>

            {/* Téléphone */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: itemBg,
              borderRadius: 10,
              border: cardBorder,
            }}>
              <Phone size={16} style={{ color: textMuted, flexShrink: 0 }} />
              {editing ? (
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="06 XX XX XX XX"
                  style={{
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    color: textColor,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, color: user?.telephone ? textColor : textMuted }}>
                  {user?.telephone || 'Non renseigné'}
                </span>
              )}
            </div>

            {/* Adresse */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: itemBg,
              borderRadius: 10,
              border: cardBorder,
            }}>
              <MapPin size={16} style={{ color: textMuted, flexShrink: 0 }} />
              {editing ? (
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  placeholder="123 rue de Paris"
                  style={{
                    width: '100%',
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    color: textColor,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: 14, color: user?.adresse ? textColor : textMuted }}>
                  {user?.adresse || 'Non renseignée'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Paramètres */}
        <div style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: 16,
          padding: '24px',
          marginBottom: 16,
        }}>
          <h3 style={{
            fontSize: 11,
            fontWeight: 700,
            color: textMuted,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Préférences
          </h3>
          
          {/* Dark Mode */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: itemBg,
            borderRadius: 10,
            border: cardBorder,
            marginBottom: 10,
            cursor: 'pointer',
            transition: 'background 0.2s',
            gap: 12,
          }}
          onMouseEnter={e => e.currentTarget.style.background = hoverBg}
          onMouseLeave={e => e.currentTarget.style.background = itemBg}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {dark ? 
                <Moon size={16} style={{ color: textMuted, flexShrink: 0 }} /> : 
                <Sun size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              }
              <span style={{ fontSize: 14, color: textColor }}>Mode sombre</span>
            </div>
            <button
              onClick={toggle}
              style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: toggleBg,
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: 2,
                left: dark ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Changer mot de passe */}
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: itemBg,
              borderRadius: 10,
              border: cardBorder,
              cursor: 'pointer',
              transition: 'background 0.2s',
              textAlign: 'left',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = itemBg}
          >
            <Lock size={16} style={{ color: textMuted, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: textColor }}>Changer le mot de passe</span>
          </button>
        </div>

        {/* Zone danger */}
        <div style={{
          background: cardBg,
          border: dangerBorder,
          borderRadius: 16,
          padding: '24px',
          marginBottom: 16,
        }}>
          <h3 style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#fca5a5',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Zone dangereuse
          </h3>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: dangerBg,
              borderRadius: 10,
              border: dangerBorder,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
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
                Supprimer mon compte
              </p>
              <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.5)', margin: 0 }}>
                Cette action est irréversible
              </p>
            </div>
          </button>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: btnGhostBg,
            border: btnGhostBorder,
            color: btnGhostColor,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = hoverBg;
            e.currentTarget.style.color = textColor;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = btnGhostBg;
            e.currentTarget.style.color = btnGhostColor;
          }}
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>

      {/* Modal Changement de mot de passe */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: modalOverlay,
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowPasswordModal(false)}
          />
          <div style={{
            position: 'relative',
            background: modalBg,
            border: modalBorder,
            borderRadius: 20,
            padding: 28,
            maxWidth: 420,
            width: '100%',
            boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: textColor }}>
                Changer le mot de passe
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  background: btnGhostBg,
                  border: btnGhostBorder,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={16} style={{ color: textMuted }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: itemBg,
                  border: cardBorder,
                  borderRadius: 10,
                  color: textColor,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: itemBg,
                  border: cardBorder,
                  borderRadius: 10,
                  color: textColor,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: itemBg,
                  border: cardBorder,
                  borderRadius: 10,
                  color: textColor,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: 20,
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: loading ? 0.5 : 1,
                boxSizing: 'border-box',
              }}
            >
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Suppression compte */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: modalOverlay,
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowDeleteModal(false)}
          />
          <div style={{
            position: 'relative',
            background: modalBg,
            border: dangerBorder,
            borderRadius: 20,
            padding: 28,
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
            boxShadow: dark ? '0 20px 60px rgba(239,68,68,0.1)' : '0 20px 60px rgba(0,0,0,0.08)',
            boxSizing: 'border-box',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertTriangle size={28} style={{ color: '#fca5a5' }} />
            </div>
            <h2 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#fca5a5',
              margin: '0 0 8px 0',
            }}>
              Supprimer votre compte ?
            </h2>
            <p style={{
              color: textMuted,
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
            }}>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
            <div className="pf-modal-actions" style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: btnGhostBg,
                  border: btnGhostBorder,
                  color: btnGhostColor,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                }}
              >
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .pf-page {
            padding: 24px 14px 40px !important;
          }
          .pf-info-header {
            flex-wrap: wrap;
          }
          .pf-info-header h3 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
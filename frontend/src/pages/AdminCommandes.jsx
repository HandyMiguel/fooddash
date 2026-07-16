// pages/AdminCommandes.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, RefreshCw, ChevronDown, ClipboardList, Clock, CheckCircle, ChefHat, Package, Ban } from 'lucide-react';

const STATUTS = ['en_attente','confirmee','en_preparation','prete','livree','annulee'];

const STATUT_CFG = {
  en_attente:     { label: 'En attente',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: Clock },
  confirmee:      { label: 'Confirmée',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: CheckCircle },
  en_preparation: { label: 'En préparation', color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  icon: ChefHat },
  prete:          { label: 'Prête',          color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)',  icon: Package },
  livree:         { label: 'Livrée',         color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: CheckCircle },
  annulee:        { label: 'Annulée',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: Ban },
};

function StatuBadge({ statut }) {
  const cfg = STATUT_CFG[statut] || STATUT_CFG.en_attente;
  const Icon = cfg.icon || Clock;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 7,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export default function AdminCommandes() {
  const { dark } = useTheme();
  const [commandes, setCommandes] = useState([]);
  const [filter, setFilter] = useState('toutes');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)';
  const rowHover = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const thBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const thBorder = dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
  const rowBorder = dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)';

  useEffect(() => {
    loadCommandes();
    const t = setInterval(loadCommandes, 15000);
    return () => clearInterval(t);
  }, []);

  const loadCommandes = async () => {
    try {
      const res = await api.get('/commandes/all');
      setCommandes(Array.isArray(res.data) ? res.data : res.data.commandes ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const updateStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await api.put(`/commandes/${id}/statut`, { statut });
      toast.success(`Statut → ${STATUT_CFG[statut]?.label}`);
      loadCommandes();
    } catch { toast.error('Erreur mise à jour'); }
    finally { setUpdating(null); }
  };

  const filtered = commandes.filter(c => {
    if (filter !== 'toutes' && c.statut !== filter) return false;
    if (search && !String(c.id).includes(search) &&
        !c.User?.nom?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: commandes.length,
    enAttente: commandes.filter(c => c.statut === 'en_attente').length,
    enCours: commandes.filter(c => ['confirmee','en_preparation'].includes(c.statut)).length,
    livrees: commandes.filter(c => c.statut === 'livree').length,
  };

  return (
    <div style={{ fontFamily: "'Syne','Inter',sans-serif", color: textColor }}>

      {/* Header */}
      <div className="cmd-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: textColor }}>Commandes</h1>
          <p style={{ color: textMuted, fontSize: 13, margin: '4px 0 0' }}>
            {commandes.length} commandes enregistrées
          </p>
        </div>
        <button
          onClick={loadCommandes}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            background: cardBg, border: cardBorder,
            color: textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={14} />Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="cmd-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',       val: stats.total,     color: dark ? '#fff' : '#1a1a2e',    bg: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', icon: ClipboardList, iconColor: dark ? '#fff' : '#1a1a2e' },
          { label: 'En attente',  val: stats.enAttente, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock, iconColor: '#f59e0b' },
          { label: 'En cours',    val: stats.enCours,   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  icon: ChefHat, iconColor: '#f97316' },
          { label: 'Livrées',     val: stats.livrees,   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle, iconColor: '#10b981' },
        ].map(({ label, val, color, bg, icon: Icon, iconColor }) => (
          <div key={label} style={{ background: bg, border: cardBorder, borderRadius: 14, padding: '16px 20px', textAlign: 'center', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
              {Icon && <Icon size={14} color={iconColor} />}
              <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0, letterSpacing: '-1px' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{
        background: cardBg, border: cardBorder, borderRadius: 14, padding: '16px 20px',
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 18,
        boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
          {['toutes', ...STATUTS].map(s => {
            const active = filter === s;
            const cfg = STATUT_CFG[s];
            const IconComponent = cfg?.icon;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '6px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: active ? (cfg ? cfg.bg : 'rgba(255,255,255,0.12)') : 'transparent',
                  border: `1px solid ${active ? (cfg ? cfg.border : 'rgba(255,255,255,0.2)') : cardBorder}`,
                  color: active ? (cfg ? cfg.color : textColor) : textMuted,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {IconComponent && <IconComponent size={12} />}
                {s === 'toutes' ? 'Toutes' : (cfg?.label || s)}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', minWidth: 220, flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            type="text"
            placeholder="N° ou client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: inputBg, border: cardBorder,
              borderRadius: 9, color: textColor, fontSize: 13, fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Table - scroll horizontal sur mobile */}
      <div style={{ background: cardBg, border: cardBorder, borderRadius: 14, overflow: 'hidden', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 680 }}>
            {/* Table head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 140px 110px 100px 160px',
              padding: '12px 20px',
              borderBottom: thBorder,
              background: thBg,
            }}>
              {['N°','Client','Date','Adresse','Total','Statut'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 13 }}>
                Chargement…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <ClipboardList size={48} style={{ color: textMuted, marginBottom: 12 }} />
                <p style={{ color: textMuted, fontSize: 14 }}>Aucune commande trouvée</p>
              </div>
            ) : (
              filtered.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 140px 110px 100px 160px',
                    padding: '14px 20px',
                    borderBottom: i < filtered.length - 1 ? rowBorder : 'none',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>#{c.id}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: 'linear-gradient(135deg,#f97316,#ef4444)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#fff',
                    }}>
                      {c.User?.nom?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.User?.nom || 'Inconnu'}
                    </span>
                  </div>

                  <span style={{ fontSize: 11, color: textMuted }}>
                    {new Date(c.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <span style={{ fontSize: 11, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.adresse || '—'}
                  </span>

                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(c.total || 0)}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatuBadge statut={c.statut} />
                    <div style={{ position: 'relative' }}>
                      <select
                        value={c.statut}
                        onChange={e => updateStatut(c.id, e.target.value)}
                        disabled={updating === c.id}
                        style={{
                          appearance: 'none',
                          padding: '4px 24px 4px 8px',
                          borderRadius: 6,
                          background: inputBg,
                          border: cardBorder,
                          color: textColor,
                          fontSize: 11,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          opacity: updating === c.id ? 0.5 : 1,
                        }}
                      >
                        {STATUTS.map(s => {
                          const cfg = STATUT_CFG[s];
                          return (
                            <option key={s} value={s} style={{ background: dark ? '#1a1a1a' : '#fff', color: textColor }}>
                              {cfg?.label || s}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cmd-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .cmd-header h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}
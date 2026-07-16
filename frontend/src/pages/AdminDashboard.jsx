// pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, ShoppingBag, Utensils, Clock,
  ArrowUpRight, ArrowDownRight, RefreshCw, Zap
} from 'lucide-react';

const revenusData = [
  { day: 'Lun', revenus: 1200, commandes: 18 },
  { day: 'Mar', revenus: 1900, commandes: 27 },
  { day: 'Mer', revenus: 1500, commandes: 22 },
  { day: 'Jeu', revenus: 2800, commandes: 39 },
  { day: 'Ven', revenus: 3200, commandes: 45 },
  { day: 'Sam', revenus: 4100, commandes: 58 },
  { day: 'Dim', revenus: 3600, commandes: 51 },
];

const catData = [
  { name: 'Burgers', value: 38, color: '#f97316' },
  { name: 'Pizzas',  value: 27, color: '#ef4444' },
  { name: 'Pâtes',   value: 15, color: '#8b5cf6' },
  { name: 'Salades', value: 10, color: '#10b981' },
  { name: 'Autres',  value: 10, color: '#3b82f6' },
];

function StatCard({ icon: Icon, label, value, delta, positive, color, suffix = '', dark }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
      border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
      boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
      minWidth: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 32, fontWeight: 800, color: dark ? '#fff' : '#1a1a2e', margin: '6px 0 0', letterSpacing: '-1px' }}>{value}{suffix}</p>
      {delta != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {positive ? <ArrowUpRight size={13} color="#10b981" /> : <ArrowDownRight size={13} color="#ef4444" />}
          <span style={{ fontSize: 12, color: positive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {delta}% vs semaine dernière
          </span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '0 0 6px', fontWeight: 700 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700, margin: '2px 0' }}>
          {p.name === 'revenus' ? `${p.value}€` : `${p.value} cmd`}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { dark } = useTheme();
  const [stats, setStats] = useState({ commandes: 0, plats: 0, revenus: 0, enAttente: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([api.get('/commandes/all'), api.get('/plats')]);
      const commandes = Array.isArray(cRes.data) ? cRes.data : cRes.data.commandes ?? [];
      const plats = Array.isArray(pRes.data) ? pRes.data : pRes.data.plats ?? [];
      setStats({
        commandes: commandes.length,
        plats: plats.length,
        revenus: commandes.reduce((s, c) => s + (Number(c.total) || 0), 0),
        enAttente: commandes.filter(c => c.statut === 'en_attente').length,
      });
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: "'Syne','Inter',sans-serif", color: textColor, maxWidth: 1280 }}>

      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 6, padding: '3px 10px',
            }}>
              <Zap size={11} color="#f97316" />
              <span style={{ fontSize: 10, color: '#f97316', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Live
              </span>
            </div>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-1px', color: textColor }}>Dashboard</h1>
          <p style={{ color: textMuted, fontSize: 13, margin: '4px 0 0' }}>
            Mis à jour {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={loadStats}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            background: cardBg, border: cardBorder,
            color: textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = cardBg}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualiser
        </button>
      </div>

      {/* Stat cards */}
      <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard icon={ShoppingBag} label="Commandes" value={stats.commandes} delta={12.4} positive color="#3b82f6" dark={dark} />
        <StatCard icon={TrendingUp} label="Revenus" value={stats.revenus.toFixed(0)} delta={8.1} positive color="#f97316" suffix="€" dark={dark} />
        <StatCard icon={Utensils} label="Plats" value={stats.plats} color="#10b981" dark={dark} />
        <StatCard icon={Clock} label="En attente" value={stats.enAttente} delta={3.2} positive={false} color="#8b5cf6" dark={dark} />
      </div>

      {/* Charts row 1 */}
      <div className="dash-charts-row1" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>

        {/* Area chart */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '20px 24px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Revenus 7 jours</p>
              <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.5px', color: textColor }}>
                {revenusData.reduce((s, d) => s + d.revenus, 0).toLocaleString('fr-FR')}€
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 7, padding: '5px 10px',
            }}>
              <ArrowUpRight size={13} color="#10b981" />
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>+18.3%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenusData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="revenus" stroke="#f97316" strokeWidth={2}
                fill="url(#gOrange)" dot={false} activeDot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>Catégories</p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => active && payload?.length ? (
                    <div style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px' }}>
                      <p style={{ color: payload[0].payload.color, fontSize: 13, fontWeight: 700, margin: 0 }}>
                        {payload[0].name} — {payload[0].value}%
                      </p>
                    </div>
                  ) : null}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
            {catData.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: textMuted }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart + quick actions */}
      <div className="dash-charts-row2" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>

        {/* Bar chart commandes */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '20px 24px', minWidth: 0 }}>
          <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>Commandes par jour</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenusData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barSize={22}>
              <XAxis dataKey="day" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="commandes" name="commandes" radius={[6, 6, 0, 0]}>
                {revenusData.map((_, i) => (
                  <Cell key={i} fill={i === revenusData.length - 2 ? '#f97316' : 'rgba(249,115,22,0.25)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div style={{ background: cardBg, border: cardBorder, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>Accès rapide</p>
          {[
            { to: '/admin/commandes', icon: '📋', label: 'Gérer les commandes', sub: `${stats.enAttente} en attente`, color: '#3b82f6' },
            { to: '/admin/plats', icon: '🍽️', label: 'Gérer le menu', sub: `${stats.plats} plats actifs`, color: '#f97316' },
          ].map(({ to, icon, label, sub, color }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 12, textDecoration: 'none',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s', flex: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>{icon}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: textMuted }}>{sub}</p>
              </div>
              <ArrowUpRight size={15} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
            </Link>
          ))}

          {/* Mini status breakdown */}
          <div style={{
            marginTop: 4, padding: '14px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, marginTop: 0 }}>Statuts actifs</p>
            {[
              { label: 'En attente', val: stats.enAttente, color: '#f59e0b' },
              { label: 'En préparation', val: Math.max(0, Math.floor(stats.commandes * 0.12)), color: '#f97316' },
              { label: 'Prêtes', val: Math.max(0, Math.floor(stats.commandes * 0.05)), color: '#8b5cf6' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: textMuted }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{val}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: color,
                    width: `${Math.min(100, (val / Math.max(stats.commandes, 1)) * 100 * 4)}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dash-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .dash-charts-row1,
          .dash-charts-row2 {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .dash-header h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
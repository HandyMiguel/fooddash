// pages/AdminPlats.jsx
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, Search, LayoutGrid, List, X, Pencil, Trash2,
  Beef, Pizza, Salad, Soup, Coffee, Cake, Utensils,
  Upload, Image as ImageIcon
} from 'lucide-react';

const CATS = ['Burgers','Pizzas','Salades','Pâtes','Boissons','Desserts'];

const CAT_ICONS = {
  Burgers: Beef,
  Pizzas: Pizza,
  Salades: Salad,
  Pâtes: Soup,
  Boissons: Coffee,
  Desserts: Cake,
};

const CAT_COLORS = {
  Burgers: '#f97316',
  Pizzas: '#ef4444',
  Salades: '#10b981',
  Pâtes: '#f59e0b',
  Boissons: '#3b82f6',
  Desserts: '#ec4899',
};

const EMPTY_FORM = { nom: '', description: '', prix: '', categorie: 'Burgers', image: '', promo: 0, disponible: true };
const IMAGE_BASE_URL = 'http://localhost:5000';

export default function AdminPlats() {
  const { dark } = useTheme();
  const [plats, setPlats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const textColor = dark ? '#fff' : '#1a1a2e';
  const textMuted = dark ? 'rgba(255,255,255,0.35)' : 'rgba(26,26,46,0.45)';
  const textMuted2 = dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.55)';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const modalBg = dark ? '#0d0d14' : '#ffffff';
  const modalBorder = dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
  const tagBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const gridHoverBg = dark ? 'rgba(249,115,22,0.04)' : 'rgba(249,115,22,0.05)';
  const listHoverBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';

  useEffect(() => { loadPlats(); }, []);

  const loadPlats = async () => {
    try {
      const res = await api.get('/plats');
      setPlats(Array.isArray(res.data) ? res.data : res.data.plats ?? res.data.data ?? []);
    } catch { toast.error('Erreur chargement'); }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'default-food.jpg') return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    return `${IMAGE_BASE_URL}${imagePath}`;
  };

  const openAdd = () => { 
    setEditing(null); 
    setForm(EMPTY_FORM); 
    setImagePreview(null);
    setModal(true); 
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ 
      nom: p.nom, 
      description: p.description || '', 
      prix: p.prix,
      categorie: p.categorie, 
      image: p.image || '', 
      promo: p.promo || 0, 
      disponible: p.disponible !== false 
    });
    setImagePreview(getImageUrl(p.image) || null);
    setModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG, WebP ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande. Maximum 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = res.data.url || res.data.imageUrl || res.data.path;
      set('image', imageUrl);
      toast.success('Image uploadée !');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    set('image', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...form,
        prix: parseFloat(form.prix),
        promo: parseInt(form.promo) || 0,
      };

      editing 
        ? await api.put(`/plats/${editing.id}`, dataToSend) 
        : await api.post('/plats', dataToSend);
      
      toast.success(editing ? 'Plat modifié !' : 'Plat créé !');
      setModal(false); 
      setImagePreview(null);
      loadPlats();
    } catch { 
      toast.error('Erreur enregistrement'); 
    }
  };

  const del = async (id) => {
    if (!confirm('Supprimer ce plat ?')) return;
    try { 
      await api.delete(`/plats/${id}`); 
      toast.success('Supprimé !'); 
      loadPlats(); 
    } catch { 
      toast.error('Erreur suppression'); 
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const cats = [...new Set(plats.map(p => p.categorie))];
  const filtered = plats.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie.toLowerCase().includes(search.toLowerCase())
  );

  const S = {
    input: {
      width: '100%', padding: '10px 14px',
      background: inputBg, border: cardBorder,
      borderRadius: 10, color: textColor, fontSize: 14, fontFamily: 'inherit', outline: 'none',
      boxSizing: 'border-box',
    },
    fieldLabel: { fontSize: 12, color: textMuted2, fontWeight: 600, display: 'block', marginBottom: 6 },
  };

  const getCatIcon = (cat) => {
    const IconComponent = CAT_ICONS[cat];
    const color = CAT_COLORS[cat] || '#f97316';
    if (IconComponent) {
      return <IconComponent size={24} color={color} />;
    }
    return <Utensils size={24} color={color} />;
  };

  const getCatIconSmall = (cat) => {
    const IconComponent = CAT_ICONS[cat];
    const color = CAT_COLORS[cat] || '#f97316';
    if (IconComponent) {
      return <IconComponent size={16} color={color} />;
    }
    return <Utensils size={16} color={color} />;
  };

  const hasValidImage = (plat) => {
    return plat.image && plat.image !== 'default-food.jpg' && plat.image !== '';
  };

  return (
    <div style={{ fontFamily: "'Syne','Inter',sans-serif", color: textColor }}>

      {/* Header */}
      <div className="ap-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: textColor }}>Gestion des Plats</h1>
          <p style={{ color: textMuted, fontSize: 13, margin: '4px 0 0' }}>{plats.length} plats au total</p>
        </div>
        <button
          onClick={openAdd}
          className="ap-add-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 11,
            background: 'linear-gradient(135deg,#f97316,#ef4444)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 0 24px rgba(249,115,22,0.3)',
          }}
        >
          <Plus size={15} /> Ajouter un plat
        </button>
      </div>

      {/* Cat stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {cats.map(cat => (
          <div key={cat} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: tagBg, border: cardBorder,
            borderRadius: 10, padding: '8px 14px',
          }}>
            {getCatIconSmall(cat)}
            <span style={{ fontSize: 12, color: textMuted }}>{cat}</span>
            <span style={{
              fontSize: 12, fontWeight: 800, color: '#f97316',
              background: 'rgba(249,115,22,0.12)', borderRadius: 6, padding: '1px 7px',
            }}>{plats.filter(p => p.categorie === cat).length}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="ap-toolbar" style={{ background: cardBg, border: cardBorder, borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="ap-search-wrap" style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
          <input
            type="text" placeholder="Rechercher un plat…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...S.input, paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setView('grid')}
            style={{
              width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: view === 'grid' ? 'rgba(249,115,22,0.15)' : tagBg,
              color: view === 'grid' ? '#f97316' : textMuted,
              transition: 'all 0.15s',
            }}
          ><LayoutGrid size={15} /></button>
          <button
            onClick={() => setView('list')}
            style={{
              width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: view === 'list' ? 'rgba(249,115,22,0.15)' : tagBg,
              color: view === 'list' ? '#f97316' : textMuted,
              transition: 'all 0.15s',
            }}
          ><List size={15} /></button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' ? (
        <div className="ap-plats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14 }}>
          {filtered.map(plat => (
            <div
              key={plat.id}
              style={{
                background: cardBg, border: cardBorder,
                borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s',
                boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'; e.currentTarget.style.background = gridHoverBg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; e.currentTarget.style.background = cardBg; }}
            >
              <div style={{
                height: 140, 
                background: `linear-gradient(135deg, ${CAT_COLORS[plat.categorie] || '#f97316'}18, ${CAT_COLORS[plat.categorie] || '#ef4444'}18)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                {hasValidImage(plat) ? (
                  <img 
                    src={getImageUrl(plat.image)} 
                    alt={plat.nom} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  getCatIcon(plat.categorie)
                )}
                {plat.promo > 0 && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '3px 8px', borderRadius: 7,
                  }}>-{plat.promo}%</span>
                )}
                {plat.disponible === false && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8 }}>
                      Indisponible
                    </span>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textColor, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                    {plat.nom}
                  </p>
                  <span style={{
                    fontSize: 10, color: textMuted, fontWeight: 700,
                    background: tagBg, borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {getCatIconSmall(plat.categorie)}
                    {plat.categorie}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: textMuted, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {plat.description || 'Aucune description'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    {plat.promo > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 11, color: textMuted, textDecoration: 'line-through' }}>{Number(plat.prix).toFixed(2)}€</span>
                        <span style={{ fontSize: 17, fontWeight: 800, color: '#f97316' }}>
                          {(Number(plat.prix) * (1 - plat.promo / 100)).toFixed(2)}€
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 17, fontWeight: 800, color: '#f97316' }}>{Number(plat.prix).toFixed(2)}€</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(plat)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></button>
                    <button onClick={() => del(plat.id)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div style={{ background: cardBg, border: cardBorder, borderRadius: 14, padding: 0, overflow: 'hidden', boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.03)' }}>
          {filtered.map((plat, i) => (
            <div
              key={plat.id}
              className="ap-list-row"
              style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 120px 80px 80px 100px 80px',
                padding: '12px 20px', alignItems: 'center', gap: 12,
                borderBottom: i < filtered.length - 1 ? (dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = listHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="ap-col-img" style={{
                width: 40, height: 40, borderRadius: 9,
                background: `${CAT_COLORS[plat.categorie] || '#f97316'}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {hasValidImage(plat) ? (
                  <img 
                    src={getImageUrl(plat.image)} 
                    alt={plat.nom} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  getCatIconSmall(plat.categorie)
                )}
              </div>
              <div className="ap-col-name" style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plat.nom}</p>
                <p className="ap-col-desc" style={{ margin: '2px 0 0', fontSize: 11, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plat.description}</p>
              </div>
              <span className="ap-col-cat" style={{ fontSize: 11, color: textMuted, background: tagBg, borderRadius: 6, padding: '3px 9px', justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 4 }}>
                {getCatIconSmall(plat.categorie)}
                {plat.categorie}
              </span>
              <span className="ap-col-price" style={{ fontSize: 14, fontWeight: 800, color: '#f97316' }}>{Number(plat.prix).toFixed(2)}€</span>
              <span className="ap-col-promo" style={{ fontSize: 12, fontWeight: 700, color: plat.promo > 0 ? '#ef4444' : textMuted }}>
                {plat.promo > 0 ? `-${plat.promo}%` : '—'}
              </span>
              <span className="ap-col-status" style={{
                fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                background: plat.disponible !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: plat.disponible !== false ? '#10b981' : '#ef4444',
                justifySelf: 'start',
              }}>
                {plat.disponible !== false ? 'Dispo' : 'Indispo'}
              </span>
              <div className="ap-col-actions" style={{ display: 'flex', gap: 6, justifySelf: 'end' }}>
                <button onClick={() => openEdit(plat)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={13} /></button>
                <button onClick={() => del(plat.id)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Utensils size={48} style={{ color: textMuted, marginBottom: 12 }} />
          <p style={{ color: textMuted, fontSize: 14 }}>Aucun plat trouvé</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}
        >
          <div className="ap-modal" style={{
            background: modalBg, border: modalBorder,
            borderRadius: 20, width: '100%', maxWidth: 550,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            position: 'relative',
          }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg,#f97316,#ef4444,#8b5cf6)', borderRadius: '20px 20px 0 0' }} />

            <div className="ap-modal-inner" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: textColor }}>
                    {editing ? 'Modifier le plat' : 'Nouveau plat'}
                  </h2>
                  <p style={{ fontSize: 12, color: textMuted, margin: '4px 0 0' }}>
                    {editing ? `Édition de "${editing.nom}"` : 'Remplissez les informations'}
                  </p>
                </div>
                <button
                  onClick={() => setModal(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: tagBg, color: textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                ><X size={15} /></button>
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Upload Image */}
                <div>
                  <label style={S.fieldLabel}>Image du plat</label>
                  <div style={{
                    border: `2px dashed ${cardBorder}`,
                    borderRadius: 12,
                    padding: imagePreview ? '0' : '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: inputBg,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#f97316'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const fakeEvent = { target: { files: [file] } };
                        handleImageUpload(fakeEvent);
                      }
                    }}
                  >
                    {imagePreview ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(239,68,68,0.8)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          <X size={14} />
                        </button>
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.6)',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          color: '#fff',
                        }}>
                          Cliquez pour changer
                        </div>
                      </div>
                    ) : (
                      <div>
                        {uploading ? (
                          <div>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              border: '3px solid rgba(249,115,22,0.2)',
                              borderTopColor: '#f97316',
                              animation: 'spin 0.8s linear infinite',
                              margin: '0 auto 12px',
                            }} />
                            <p style={{ color: textMuted, fontSize: 13, margin: 0 }}>Upload en cours...</p>
                          </div>
                        ) : (
                          <div>
                            <Upload size={32} style={{ color: textMuted, marginBottom: 8 }} />
                            <p style={{ color: textColor, fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
                              Glissez-déposez une image
                            </p>
                            <p style={{ color: textMuted, fontSize: 12, margin: 0 }}>
                              ou cliquez pour parcourir (JPG, PNG, WebP - max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  {/* URL alternative */}
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: textMuted, margin: '0 0 4px' }}>
                      Ou utilisez une URL :
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <ImageIcon size={14} style={{ color: textMuted, flexShrink: 0 }} />
                      <input
                        type="text"
                        value={form.image}
                        onChange={e => {
                          set('image', e.target.value);
                          setImagePreview(e.target.value ? getImageUrl(e.target.value) : null);
                        }}
                        style={{ ...S.input, flex: 1 }}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label style={S.fieldLabel}>Nom du plat *</label>
                  <input type="text" required value={form.nom} onChange={e => set('nom', e.target.value)} style={S.input} placeholder="Ex: Burger classique" />
                </div>

                {/* Description */}
                <div>
                  <label style={S.fieldLabel}>Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={3} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }}
                    placeholder="Description du plat…" />
                </div>

                {/* Prix + Catégorie */}
                <div className="ap-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.fieldLabel}>Prix (€) *</label>
                    <input type="number" step="0.01" required value={form.prix} onChange={e => set('prix', e.target.value)} style={S.input} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={S.fieldLabel}>Catégorie</label>
                    <select value={form.categorie} onChange={e => set('categorie', e.target.value)}
                      style={{ ...S.input, cursor: 'pointer' }}>
                      {CATS.map(c => <option key={c} value={c} style={{ background: modalBg, color: textColor }}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Promo */}
                <div>
                  <label style={S.fieldLabel}>Promotion (%)</label>
                  <input type="number" min="0" max="99" value={form.promo} onChange={e => set('promo', e.target.value)} style={S.input} />
                </div>

                {/* Disponible toggle */}
                <div
                  onClick={() => set('disponible', !form.disponible)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    padding: '12px 16px', borderRadius: 10,
                    background: form.disponible ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${form.disponible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    transition: 'all 0.2s', userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 40, height: 22, borderRadius: 11, position: 'relative',
                    background: form.disponible ? '#10b981' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 3, left: form.disponible ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: form.disponible ? '#10b981' : '#f87171' }}>
                      {form.disponible ? 'Plat disponible' : 'Plat indisponible'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: textMuted }}>
                      Cliquez pour basculer
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="ap-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 4 }}>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: '12px', borderRadius: 11, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
                      background: 'linear-gradient(135deg,#f97316,#ef4444)',
                      color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                      boxShadow: '0 0 20px rgba(249,115,22,0.25)',
                      opacity: uploading ? 0.6 : 1,
                    }}
                  >
                    {editing ? 'Enregistrer' : 'Créer'}
                  </button>
                  <button
                    type="button" onClick={() => { setModal(false); setImagePreview(null); }}
                    style={{
                      padding: '12px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                      background: tagBg, border: cardBorder,
                      color: textMuted, fontSize: 14, fontWeight: 600,
                    }}
                  >Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* --- Responsive --- */
        @media (max-width: 640px) {
          .ap-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
          }
          .ap-add-btn {
            width: 100%;
          }
          .ap-toolbar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .ap-search-wrap {
            width: 100%;
          }
          .ap-plats-grid {
            grid-template-columns: 1fr !important;
          }
          .ap-modal-inner {
            padding: 16px !important;
          }
          .ap-form-row {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .ap-list-row {
            display: flex !important;
            flex-wrap: wrap !important;
            row-gap: 8px !important;
          }
          .ap-col-cat,
          .ap-col-promo,
          .ap-col-desc {
            display: none !important;
          }
          .ap-col-img {
            order: 0;
            margin-right: 8px;
          }
          .ap-col-name {
            order: 1;
            flex: 1 1 auto;
            min-width: 0;
          }
          .ap-col-price {
            order: 2;
            margin-left: 56px;
          }
          .ap-col-status {
            order: 3;
            margin-left: auto;
          }
          .ap-col-actions {
            order: 4;
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
}
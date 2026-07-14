import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import { Plus, Pencil, Trash2, Search, ArrowUpCircle, Loader2 } from 'lucide-react';
import { niveauApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Niveaux() {
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ libelle: '', ordre: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await niveauApi.getAll();
      setNiveaux(data);
    } catch { toast.error('Erreur lors du chargement des niveaux'); }
    finally { setLoading(false); }
  };

  const filtered = niveaux.filter(n => n.libelle.toLowerCase().includes(searchTerm.toLowerCase()));

  const openAdd = () => { setEditingItem(null); setForm({ libelle: '', ordre: '' }); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ libelle: item.libelle, ordre: item.ordre || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, ordre: parseInt(form.ordre) || 0 };
      if (editingItem) {
        await niveauApi.update(editingItem.id, payload);
        toast.success('Niveau modifié avec succès');
      } else {
        await niveauApi.create(payload);
        toast.success('Niveau ajouté avec succès');
      }
      setModalOpen(false);
      loadData();
    } catch (err) { typeof err === 'string' ? toast.error(err) : toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try {
      await niveauApi.delete(deletingId);
      toast.success('Niveau supprimé');
      loadData();
    } catch (err) { typeof err === 'string' ? toast.error(err) : toast.error('Impossible de supprimer'); }
    finally { setConfirmOpen(false); }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative max-w-4xl mx-auto">
      <div className="absolute top-20 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Niveaux Académiques</h1>
        <p className="text-sm font-medium mt-2 text-[var(--color-text-secondary)]">Gestion des cursus de formation (L1, L2, M1, etc.)</p>
      </div>

      <Card className="animate-fade-in-delay-1 border-t-4 border-t-emerald-500 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ArrowUpCircle className="w-5 h-5 text-emerald-500" /> Niveaux</CardTitle>
              <CardDescription>Total : {niveaux.length}</CardDescription>
            </div>
            <Button size="sm" onClick={openAdd} className="shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="relative mb-6 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher (ex: L1)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
          </div>

          {loading ? (
            <div className="flex-1 flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={ArrowUpCircle} title="Aucun niveau trouvé" />
          ) : (
            <div className="flex-1 overflow-auto -mx-1 px-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.sort((a,b) => a.ordre - b.ordre).map((item, idx) => (
                    <TableRow key={item.id} className="group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <TableCell><span className="font-bold text-slate-800">{item.libelle}</span></TableCell>
                      <TableCell><span className="text-sm font-medium text-slate-500">{item.ordre}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="!px-2 h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"><Pencil className="w-4 h-4" /></Button>
                          <Button variant="danger" size="sm" onClick={() => { setDeletingId(item.id); setConfirmOpen(true); }} className="!px-2 h-8"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Modifier le niveau' : 'Ajouter un niveau'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Libellé" value={form.libelle} onChange={(e) => setForm({...form, libelle: e.target.value})} required placeholder="Ex: L1" />
          <Input label="Ordre d'affichage (Tri)" type="number" value={form.ordre} onChange={(e) => setForm({...form, ordre: e.target.value})} required placeholder="Ex: 1" />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              {editingItem ? 'Sauvegarder' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Supprimer le niveau ?" message="Êtes-vous sûr ? Cette action pourrait impacter les autres entités." />
    </div>
  );
}

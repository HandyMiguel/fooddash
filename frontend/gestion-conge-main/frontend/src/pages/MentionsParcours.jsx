import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, EmptyState, ConfirmDialog } from '../components/ui';
import { Plus, Pencil, Trash2, Search, BookOpen, Layers, Loader2 } from 'lucide-react';
import { mentionApi, parcoursApi } from '../services/api';
import toast from 'react-hot-toast';

export default function MentionsParcours() {
  const [mentions, setMentions] = useState([]);
  const [parcours, setParcours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMention, setSearchMention] = useState('');
  const [searchParcours, setSearchParcours] = useState('');

  // Mention state
  const [mentionModalOpen, setMentionModalOpen] = useState(false);
  const [mentionConfirmOpen, setMentionConfirmOpen] = useState(false);
  const [editingMention, setEditingMention] = useState(null);
  const [deletingMentionId, setDeletingMentionId] = useState(null);
  const [mentionForm, setMentionForm] = useState({ libelle: '', description: '' });
  const [savingMention, setSavingMention] = useState(false);

  // Parcours state
  const [parcoursModalOpen, setParcoursModalOpen] = useState(false);
  const [parcoursConfirmOpen, setParcoursConfirmOpen] = useState(false);
  const [editingParcours, setEditingParcours] = useState(null);
  const [deletingParcoursId, setDeletingParcoursId] = useState(null);
  const [parcoursForm, setParcoursForm] = useState({ libelle: '', description: '', mention_id: '' });
  const [savingParcours, setSavingParcours] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([mentionApi.getAll(), parcoursApi.getAll()]);
      setMentions(m);
      setParcours(p);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  // ── MENTION CRUD ──────────────
  const filteredMentions = mentions.filter(m => m.libelle.toLowerCase().includes(searchMention.toLowerCase()));

  const openAddMention = () => { setEditingMention(null); setMentionForm({ libelle: '', description: '' }); setMentionModalOpen(true); };
  const openEditMention = (m) => { setEditingMention(m); setMentionForm({ libelle: m.libelle, description: m.description || '' }); setMentionModalOpen(true); };

  const handleMentionSubmit = async (e) => {
    e.preventDefault();
    setSavingMention(true);
    try {
      if (editingMention) { await mentionApi.update(editingMention.id, mentionForm); toast.success('Mention modifiée'); }
      else { await mentionApi.create(mentionForm); toast.success('Mention ajoutée'); }
      setMentionModalOpen(false); loadData();
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur'); }
    finally { setSavingMention(false); }
  };

  const confirmDeleteMention = async () => {
    try { await mentionApi.delete(deletingMentionId); toast.success('Supprimée'); loadData(); }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Impossible de supprimer'); }
    finally { setMentionConfirmOpen(false); }
  };

  // ── PARCOURS CRUD ──────────────
  const filteredParcours = parcours.filter(p => `${p.libelle} ${p.mention?.libelle || ''}`.toLowerCase().includes(searchParcours.toLowerCase()));

  const openAddParcours = () => { setEditingParcours(null); setParcoursForm({ libelle: '', description: '', mention_id: '' }); setParcoursModalOpen(true); };
  const openEditParcours = (p) => { setEditingParcours(p); setParcoursForm({ libelle: p.libelle, description: p.description || '', mention_id: String(p.mention_id) }); setParcoursModalOpen(true); };

  const handleParcoursSubmit = async (e) => {
    e.preventDefault();
    setSavingParcours(true);
    try {
      const payload = { ...parcoursForm, mention_id: parseInt(parcoursForm.mention_id) };
      if (editingParcours) { await parcoursApi.update(editingParcours.id, payload); toast.success('Parcours modifié'); }
      else { await parcoursApi.create(payload); toast.success('Parcours ajouté'); }
      setParcoursModalOpen(false); loadData();
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur'); }
    finally { setSavingParcours(false); }
  };

  const confirmDeleteParcours = async () => {
    try { await parcoursApi.delete(deletingParcoursId); toast.success('Supprimé'); loadData(); }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Impossible de supprimer'); }
    finally { setParcoursConfirmOpen(false); }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative">
      <div className="absolute top-20 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Mentions & Parcours</h1>
        <p className="text-sm font-medium mt-2 text-[var(--color-text-secondary)]">Gérer la hiérarchie et la structure académique</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* MENTIONS */}
        <Card className="animate-fade-in-delay-1 border-t-4 border-t-purple-500 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-500" /> Mentions</CardTitle><CardDescription>Total : {mentions.length}</CardDescription></div>
              <Button size="sm" onClick={openAddMention} className="shadow-lg shadow-purple-500/20"><Plus className="w-4 h-4" /> Ajouter</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="relative mb-6 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input value={searchMention} onChange={(e) => setSearchMention(e.target.value)} placeholder="Rechercher une mention..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none" />
            </div>
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : filteredMentions.length === 0 ? (
              <EmptyState icon={BookOpen} title="Aucune mention" />
            ) : (
              <div className="flex-1 overflow-auto -mx-1 px-1">
                <Table>
                  <TableHeader><TableRow><TableHead>Libellé</TableHead><TableHead>Parcours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredMentions.map((m, idx) => (
                      <TableRow key={m.id} className="group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <TableCell><span className="font-bold text-slate-800">{m.libelle}</span>{m.description && <p className="text-xs font-medium text-slate-400 mt-0.5">{m.description}</p>}</TableCell>
                        <TableCell><span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{m.parcours?.length || 0} parcours</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" onClick={() => openEditMention(m)} className="!px-2 h-8 text-emerald-500"><Pencil className="w-4 h-4" /></Button>
                            <Button variant="danger" size="sm" onClick={() => { setDeletingMentionId(m.id); setMentionConfirmOpen(true); }} className="!px-2 h-8"><Trash2 className="w-4 h-4" /></Button>
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

        {/* PARCOURS */}
        <Card className="animate-fade-in-delay-2 border-t-4 border-t-pink-500 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-pink-500" /> Parcours</CardTitle><CardDescription>Total : {parcours.length}</CardDescription></div>
              <Button size="sm" onClick={openAddParcours} className="shadow-lg shadow-pink-500/20 bg-pink-600 hover:bg-pink-700"><Plus className="w-4 h-4" /> Ajouter</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="relative mb-6 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <input value={searchParcours} onChange={(e) => setSearchParcours(e.target.value)} placeholder="Rechercher un parcours..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none" />
            </div>
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
            ) : filteredParcours.length === 0 ? (
              <EmptyState icon={Layers} title="Aucun parcours" />
            ) : (
              <div className="flex-1 overflow-auto -mx-1 px-1">
                <Table>
                  <TableHeader><TableRow><TableHead>Libellé</TableHead><TableHead>Mention Parente</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredParcours.map((p, idx) => (
                      <TableRow key={p.id} className="group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <TableCell><span className="font-bold text-slate-800">{p.libelle}</span>{p.description && <p className="text-xs font-medium text-slate-400 mt-0.5">{p.description}</p>}</TableCell>
                        <TableCell><span className="text-sm font-semibold text-slate-600">{p.mention?.libelle || '-'}</span></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" onClick={() => openEditParcours(p)} className="!px-2 h-8 text-emerald-500"><Pencil className="w-4 h-4" /></Button>
                            <Button variant="danger" size="sm" onClick={() => { setDeletingParcoursId(p.id); setParcoursConfirmOpen(true); }} className="!px-2 h-8"><Trash2 className="w-4 h-4" /></Button>
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
      </div>

      {/* Mention Modal */}
      <Modal open={mentionModalOpen} onClose={() => setMentionModalOpen(false)} title={editingMention ? 'Modifier la mention' : 'Ajouter une mention'}>
        <form onSubmit={handleMentionSubmit} className="space-y-4">
          <Input label="Libellé" value={mentionForm.libelle} onChange={(e) => setMentionForm({...mentionForm, libelle: e.target.value})} required placeholder="Ex: Informatique" />
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Description</label>
            <textarea value={mentionForm.description} onChange={(e) => setMentionForm({...mentionForm, description: e.target.value})} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Description optionnelle..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50"><Button variant="ghost" type="button" onClick={() => setMentionModalOpen(false)}>Annuler</Button><Button type="submit" disabled={savingMention}>{savingMention && <Loader2 className="w-5 h-5 animate-spin" />}{editingMention ? 'Sauvegarder' : 'Ajouter'}</Button></div>
        </form>
      </Modal>

      {/* Parcours Modal */}
      <Modal open={parcoursModalOpen} onClose={() => setParcoursModalOpen(false)} title={editingParcours ? 'Modifier le parcours' : 'Ajouter un parcours'}>
        <form onSubmit={handleParcoursSubmit} className="space-y-4">
          <Input label="Libellé" value={parcoursForm.libelle} onChange={(e) => setParcoursForm({...parcoursForm, libelle: e.target.value})} required placeholder="Ex: Génie Logiciel" />
          <Select label="Mention Parente" value={parcoursForm.mention_id} onChange={(e) => setParcoursForm({...parcoursForm, mention_id: e.target.value})} required
            options={mentions.map(m => ({value: String(m.id), label: m.libelle}))} />
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Description</label>
            <textarea value={parcoursForm.description} onChange={(e) => setParcoursForm({...parcoursForm, description: e.target.value})} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Description optionnelle..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50"><Button variant="ghost" type="button" onClick={() => setParcoursModalOpen(false)}>Annuler</Button><Button type="submit" disabled={savingParcours}>{savingParcours && <Loader2 className="w-5 h-5 animate-spin" />}{editingParcours ? 'Sauvegarder' : 'Ajouter'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={mentionConfirmOpen} onClose={() => setMentionConfirmOpen(false)} onConfirm={confirmDeleteMention} title="Supprimer la mention ?" message="Cette action est définitive." />
      <ConfirmDialog open={parcoursConfirmOpen} onClose={() => setParcoursConfirmOpen(false)} onConfirm={confirmDeleteParcours} title="Supprimer le parcours ?" message="Cette action est définitive." />
    </div>
  );
}

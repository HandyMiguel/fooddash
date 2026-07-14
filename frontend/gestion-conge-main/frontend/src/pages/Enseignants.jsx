import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Badge, EmptyState, ConfirmDialog } from '../components/ui';
import { Plus, Pencil, Trash2, Search, GraduationCap, Loader2 } from 'lucide-react';
import { enseignantApi } from '../services/api';
import toast from 'react-hot-toast';

const GRADES = ['Assistant', 'Maître de conférences', 'Professeur', 'Vacataire', 'ATER'];

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    matricule: '', nom: '', prenom: '', email: '', telephone: '', grade: 'Assistant', specialite: '', actif: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await enseignantApi.getAll();
      setEnseignants(data);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const filtered = enseignants.filter(e => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.matricule} ${e.email || ''} ${e.specialite || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchGrade = !filterGrade || e.grade === filterGrade;
    return matchSearch && matchGrade;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ matricule: '', nom: '', prenom: '', email: '', telephone: '', grade: 'Assistant', specialite: '', actif: true });
    setModalOpen(true);
  };

  const openEdit = (ens) => {
    setEditing(ens);
    setForm({ matricule: ens.matricule, nom: ens.nom, prenom: ens.prenom, email: ens.email || '', telephone: ens.telephone || '', grade: ens.grade, specialite: ens.specialite || '', actif: ens.actif });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await enseignantApi.update(editing.id, form);
        toast.success('Enseignant modifié');
      } else {
        await enseignantApi.create(form);
        toast.success('Enseignant ajouté');
      }
      setModalOpen(false);
      loadData();
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => { setDeletingId(id); setConfirmOpen(true); };
  const confirmDelete = async () => {
    try { await enseignantApi.delete(deletingId); toast.success('Supprimé'); loadData(); }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Impossible de supprimer'); }
    finally { setConfirmOpen(false); }
  };

  const gradeColor = (grade) => {
    const map = { 'Professeur': 'primary', 'Maître de conférences': 'info', 'Assistant': 'default', 'Vacataire': 'warning', 'ATER': 'success' };
    return map[grade] || 'default';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative">
      <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] -z-10" />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Enseignants</h1>
          <p className="text-sm font-medium mt-2 text-[var(--color-text-secondary)]">Gérer le corps professoral de l'établissement</p>
        </div>
        <Button onClick={openAdd} className="shadow-lg shadow-sky-500/20"><Plus className="w-5 h-5" /> Ajouter un enseignant</Button>
      </div>

      <Card className="animate-fade-in-delay-1 border-t-4 border-t-sky-500 overflow-visible">
        <CardHeader>
          <CardTitle>Liste des enseignants</CardTitle>
          <CardDescription>Total : <span className="font-bold text-sky-500">{enseignants.length}</span> enseignants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, matricule, email..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none" />
            </div>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-text-muted)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
              <option value="">Tous les grades</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-muted)]"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /> <span className="font-medium animate-pulse">Chargement...</span></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Aucun enseignant trouvé" description="Ajustez vos filtres de recherche." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Identité</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ens, idx) => (
                  <TableRow key={ens.id} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-fade-in group">
                    <TableCell><span className="font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">{ens.matricule}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {ens.nom.charAt(0)}{ens.prenom.charAt(0)}
                        </div>
                        <p className="font-bold text-[var(--color-text)]">{ens.nom} {ens.prenom}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={gradeColor(ens.grade)}>{ens.grade}</Badge></TableCell>
                    <TableCell><span className="font-medium text-slate-600">{ens.specialite || '-'}</span></TableCell>
                    <TableCell>
                      <div className="text-xs font-medium space-y-0.5">
                        {ens.email && <p className="text-slate-700">{ens.email}</p>}
                        {ens.telephone && <p className="text-slate-400">{ens.telephone}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={ens.actif ? 'success' : 'danger'}>{ens.actif ? 'Actif' : 'Inactif'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => openEdit(ens)} className="!px-2 h-8 text-emerald-500"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(ens.id)} className="!px-2 h-8"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Matricule" value={form.matricule} onChange={(e) => setForm({...form, matricule: e.target.value})} required placeholder="Ex: ENS001" />
            <Select label="Grade" value={form.grade} onChange={(e) => setForm({...form, grade: e.target.value})} required
              options={GRADES.map(g => ({value: g, label: g}))} />
            <Input label="Nom" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} required />
            <Input label="Prénom" value={form.prenom} onChange={(e) => setForm({...form, prenom: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="email@univ.edu" />
            <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({...form, telephone: e.target.value})} />
            <div className="sm:col-span-2">
               <Input label="Spécialité" value={form.specialite} onChange={(e) => setForm({...form, specialite: e.target.value})} placeholder="Informatique, Mathématiques..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-5 h-5 animate-spin" />}{editing ? 'Sauvegarder' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete}
        title="Supprimer l'enseignant ?" message="Êtes-vous sûr de vouloir supprimer cet enseignant ?" variant="danger" confirmLabel="Oui, supprimer" />
    </div>
  );
}

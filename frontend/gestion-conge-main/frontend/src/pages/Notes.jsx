import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Badge, EmptyState, ConfirmDialog } from '../components/ui';
import { Plus, Pencil, Trash2, Search, FileText, Printer, ChevronRight, Loader2, Award } from 'lucide-react';
import { noteApi, etudiantApi, matiereApi, sessionApi, anneeApi, enseignantApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ etudiant_id: '', matiere_id: '', session_examen_id: '', annee_universitaire_id: '', enseignant_id: '', valeur: '' });

  const [releveModalOpen, setReleveModalOpen] = useState(false);
  const [releveData, setReleveData] = useState(null);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState('');
  const [loadingReleve, setLoadingReleve] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nData, etdData, matData, sesData, anData, ensData] = await Promise.all([
        noteApi.getAll(), etudiantApi.getAll(), matiereApi.getAll(), sessionApi.getAll(), anneeApi.getAll(), enseignantApi.getAll()
      ]);
      setNotes(nData); setEtudiants(etdData); setMatieres(matData); setSessions(sesData); setAnnees(anData); setEnseignants(ensData);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const filtered = notes.filter(n => {
    const etd = n.etudiant ? `${n.etudiant.nom} ${n.etudiant.prenom} ${n.etudiant.numero_etudiant}` : '';
    const mat = n.matiere ? `${n.matiere.code} ${n.matiere.libelle}` : '';
    const matchSearch = `${etd} ${mat}`.toLowerCase().includes(search.toLowerCase());
    const matchSession = !filterSession || String(n.session_examen_id) === filterSession;
    return matchSearch && matchSession;
  });

  const openAdd = () => {
    setEditing(null);
    // Pre-select année en cours if available
    const anneeEnCours = annees.find(a => a.en_cours);
    setForm({
      etudiant_id: '', matiere_id: '', session_examen_id: '',
      annee_universitaire_id: anneeEnCours ? String(anneeEnCours.id) : '',
      enseignant_id: '', valeur: ''
    });
    setModalOpen(true);
  };
  const openEdit = (n) => {
    setEditing(n);
    setForm({
      etudiant_id: String(n.etudiant_id),
      matiere_id: String(n.matiere_id),
      session_examen_id: String(n.session_examen_id),
      annee_universitaire_id: String(n.annee_universitaire_id),
      enseignant_id: String(n.enseignant_id),
      valeur: String(n.valeur)
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        etudiant_id: parseInt(form.etudiant_id),
        matiere_id: parseInt(form.matiere_id),
        session_examen_id: parseInt(form.session_examen_id),
        annee_universitaire_id: parseInt(form.annee_universitaire_id),
        enseignant_id: parseInt(form.enseignant_id),
        valeur: parseFloat(form.valeur),
      };
      if (editing) { await noteApi.update(editing.id, payload); toast.success('Note modifiée'); }
      else { await noteApi.create(payload); toast.success('Note saisie'); }
      setModalOpen(false); loadData();
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try { await noteApi.delete(deletingId); toast.success('Note supprimée'); loadData(); }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur'); }
    finally { setConfirmOpen(false); }
  };

  const handleGenerateReleve = async (e) => {
    e.preventDefault();
    if (!selectedEtudiantId) return toast.error('Sélectionnez un étudiant');
    setLoadingReleve(true);
    try {
      const data = await noteApi.releve(selectedEtudiantId);
      setReleveData(data);
      setReleveModalOpen(true);
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Erreur lors de la génération du relevé'); }
    finally { setLoadingReleve(false); }
  };

  const getMentionBadgeStyle = (valeur) => {
    const v = parseFloat(valeur);
    if (v >= 16) return { variant: 'success', label: 'Très Bien' };
    if (v >= 14) return { variant: 'info', label: 'Bien' };
    if (v >= 12) return { variant: 'primary', label: 'Assez Bien' };
    if (v >= 10) return { variant: 'warning', label: 'Passable' };
    return { variant: 'danger', label: 'Insuffisant' };
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -z-10" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)]">Notes & Relevés</h1>
           <p className="text-sm font-medium mt-2 text-[var(--color-text-secondary)]">Saisie des résultats d'examens et génération des bulletins</p>
        </div>
        <form onSubmit={handleGenerateReleve} className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl shadow-sm border border-slate-200/60 backdrop-blur-md animate-slide-in">
          <Select value={selectedEtudiantId} onChange={(e) => setSelectedEtudiantId(e.target.value)} className="w-48 sm:w-64" style={{ padding: '0.5rem 1rem' }}
            options={etudiants.map(e => ({ value: String(e.id), label: `${e.numero_etudiant} - ${e.nom}` }))} placeholder="Choisir un étudiant..." />
          <Button type="submit" disabled={loadingReleve} className="shadow-rose-500/20 bg-rose-600 hover:bg-rose-700">{loadingReleve ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}<span className="hidden sm:inline"> Relevé</span></Button>
        </form>
      </div>

      <Card className="animate-fade-in-delay-1 border-t-4 border-t-rose-500">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-rose-500" /> Saisie des notes</CardTitle><CardDescription>Historique des notes saisies</CardDescription></div>
            <Button size="sm" onClick={openAdd} className="shadow-lg shadow-rose-500/20 bg-rose-600 hover:bg-rose-700"><Plus className="w-4 h-4" /> Saisir une note</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Chercher un étudiant ou une matière..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] focus:bg-white focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none" />
            </div>
            <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-text-muted)] focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
              <option value="">Toutes les sessions</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.libelle} ({s.type_session})</option>)}
            </select>
          </div>

          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div> :
          filtered.length === 0 ? <EmptyState icon={FileText} title="Aucune note" /> :
          <Table>
            <TableHeader><TableRow><TableHead>Étudiant</TableHead><TableHead>Matière</TableHead><TableHead>Session</TableHead><TableHead>Note (/20)</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((n, i) => {
                const mb = getMentionBadgeStyle(n.valeur);
                return (
                  <TableRow key={n.id} className="group animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <TableCell>
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-800">{n.etudiant?.nom} {n.etudiant?.prenom}</span>
                         <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{n.etudiant?.numero_etudiant}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                         <span className="font-bold text-slate-800">{n.matiere?.libelle}</span>
                         <span className="text-xs font-semibold text-slate-500">{n.matiere?.code}</span>
                       </div>
                    </TableCell>
                    <TableCell><span className="font-medium text-slate-700">{n.session?.libelle}</span></TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <span className={`text-lg font-extrabold ${mb.variant === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>{parseFloat(n.valeur).toFixed(2)}</span>
                         <Badge variant={mb.variant}>{mb.label}</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => openEdit(n)} className="!px-2 h-8 text-emerald-500"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="danger" size="sm" onClick={() => { setDeletingId(n.id); setConfirmOpen(true); }} className="!px-2 h-8"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la note' : 'Saisir une note'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Étudiant" value={form.etudiant_id} onChange={(e) => setForm({...form, etudiant_id: e.target.value})} required options={etudiants.map(e => ({ value: String(e.id), label: `${e.numero_etudiant} - ${e.nom} ${e.prenom}` }))} />
            <Select label="Matière" value={form.matiere_id} onChange={(e) => setForm({...form, matiere_id: e.target.value})} required options={matieres.map(m => ({ value: String(m.id), label: `${m.code} - ${m.libelle}` }))} />
            <Select label="Session d'examen" value={form.session_examen_id} onChange={(e) => setForm({...form, session_examen_id: e.target.value})} required options={sessions.map(s => ({ value: String(s.id), label: `${s.libelle} (${s.type_session})` }))} />
            <Select label="Année universitaire" value={form.annee_universitaire_id} onChange={(e) => setForm({...form, annee_universitaire_id: e.target.value})} required options={annees.map(a => ({ value: String(a.id), label: `${a.libelle}${a.en_cours ? ' (En cours)' : ''}` }))} />
            <Select label="Enseignant" value={form.enseignant_id} onChange={(e) => setForm({...form, enseignant_id: e.target.value})} required options={enseignants.map(e => ({ value: String(e.id), label: `${e.matricule} - ${e.nom} ${e.prenom}` }))} />
            <Input label="Note sur 20" type="number" min="0" max="20" step="0.01" value={form.valeur} onChange={(e) => setForm({...form, valeur: e.target.value})} required placeholder="Ex: 14.50" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50"><Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Annuler</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="w-5 h-5 animate-spin" />}{editing ? 'Sauvegarder' : 'Enregistrer'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Supprimer la note ?" message="Cette action est définitive." />

      {/* Relevé de notes Modal */}
      <Modal open={releveModalOpen} onClose={() => setReleveModalOpen(false)} title="Relevé de notes" size="xl">
        {releveData && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[var(--color-border)]/50 pb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-[var(--color-text)] tracking-tight">{releveData.etudiant.nom} {releveData.etudiant.prenom}</h3>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">N° {releveData.etudiant.numero_etudiant}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="primary">{releveData.etudiant.niveau}</Badge>
                  <Badge variant="info">{releveData.etudiant.parcours}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[var(--color-text-secondary)] font-medium">Relevé généré le :</p>
                <p className="font-bold text-[var(--color-text)]">{new Date(releveData.date_generation).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="space-y-8">
              {releveData.modules.map((mod, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-white/80 backdrop-blur-sm px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-emerald-500" /> {mod.code} - {mod.libelle}</h4>
                      <p className="text-xs text-slate-500 mt-1 pl-6">Semestre {mod.semestre} • Crédits: {mod.credits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-600">Moyenne Module</p>
                      <p className="text-lg font-extrabold text-emerald-600">{mod.moyenne_module}/20</p>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-bg-muted)]">
                      <tr><th className="px-5 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Matière</th><th className="px-5 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Coef</th><th className="px-5 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Note</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mod.matieres.map((mat, midx) => (
                         <tr key={midx} className="hover:bg-slate-100/50 transition-colors">
                           <td className="px-5 py-2.5 font-medium text-slate-700">{mat.matiere}</td>
                           <td className="px-5 py-2.5 text-center text-slate-500 font-semibold">{mat.coefficient}</td>
                           <td className="px-5 py-2.5 text-right font-bold text-slate-800">{mat.note}/20</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {releveData.modules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mb-3" />
                <p className="font-semibold text-lg">Aucune note trouvée</p>
                <p className="text-sm mt-1">Cet étudiant n'a pas encore de notes saisies.</p>
              </div>
            )}

            {releveData.modules.length > 0 && (
              <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-emerald-200 font-semibold uppercase tracking-wider text-sm mb-1">Résultat Final</p>
                  <div className="flex items-center gap-3">
                     <h2 className="text-4xl font-extrabold">{releveData.moyenne_generale}/20</h2>
                     <Badge variant="default" className="bg-white/20 text-white border-white/20 text-sm px-3 py-1">{releveData.mention_generale}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-200 font-semibold text-sm">Crédits validés</p>
                  <p className="text-3xl font-extrabold">{releveData.total_credits_valides} <span className="text-lg font-medium">cr.</span></p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4"><Button onClick={() => window.print()}><Printer className="w-5 h-5" /> Imprimer</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

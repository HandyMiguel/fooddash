import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard, Skeleton } from '../components/ui';
import { Users, GraduationCap, Layers, FileText, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { etudiantApi, enseignantApi, moduleApi, matiereApi, noteApi, anneeApi } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#4338ca', '#6366f1', '#0ea5e9', '#14b8a6', '#059669', '#d946ef', '#f43f5e'];

const MENTION_COLORS = {
  'Très Bien': '#059669', // success
  'Bien': '#2563eb', // info
  'Assez Bien': '#4338ca', // primary
  'Passable': '#d97706', // warning
  'Insuffisant': '#dc2626', // danger
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ etudiants: 0, enseignants: 0, modules: 0, matieres: 0, notes: 0 });
  const [noteMentions, setNoteMentions] = useState([]);
  const [niveauData, setNiveauData] = useState([]);
  const [anneeEnCours, setAnneeEnCours] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [etudiants, enseignants, modules, matieres, notes, annees] = await Promise.all([
        etudiantApi.getAll().catch(() => []),
        enseignantApi.getAll().catch(() => []),
        moduleApi.getAll().catch(() => []),
        matiereApi.getAll().catch(() => []),
        noteApi.getAll().catch(() => []),
        anneeApi.getAll().catch(() => []),
      ]);

      setStats({
        etudiants: etudiants.length,
        enseignants: enseignants.length,
        modules: modules.length,
        matieres: matieres.length,
        notes: notes.length,
      });

      // Année en cours
      const current = annees.find(a => a.en_cours);
      setAnneeEnCours(current);

      // Répartition par mention de note
      const mentionCount = { 'Très Bien': 0, 'Bien': 0, 'Assez Bien': 0, 'Passable': 0, 'Insuffisant': 0 };
      notes.forEach(n => {
        const v = parseFloat(n.valeur);
        if (v >= 16) mentionCount['Très Bien']++;
        else if (v >= 14) mentionCount['Bien']++;
        else if (v >= 12) mentionCount['Assez Bien']++;
        else if (v >= 10) mentionCount['Passable']++;
        else mentionCount['Insuffisant']++;
      });
      setNoteMentions(Object.entries(mentionCount).map(([name, value]) => ({ name, value })));

      // Répartition étudiants par niveau
      const niveauCount = {};
      etudiants.forEach(e => {
        const niv = e.niveau?.libelle || 'N/A';
        niveauCount[niv] = (niveauCount[niv] || 0) + 1;
      });
      setNiveauData(Object.entries(niveauCount).map(([name, value]) => ({ name, value })));

    } catch (err) {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-4 py-3 rounded-xl border shadow-xl bg-white/95 backdrop-blur-md border-[var(--color-border-card)]">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0].name}</p>
        <p className="font-semibold text-emerald-600 text-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill || 'var(--color-primary)' }} />
          {payload[0].value} {payload[0].dataKey === 'value' ? 'notes' : ''}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Vue d'ensemble
          </h1>
          <p className="text-sm mt-2 text-[var(--color-text-secondary)] font-medium max-w-xl">
            Suivez les performances académiques et les statistiques de votre établissement en temps réel.
          </p>
        </div>

        {anneeEnCours && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-emerald-100 animate-slide-in">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">Année Académique :</span>
            <span className="text-sm font-extrabold text-emerald-600">{anneeEnCours.libelle}</span>
          </div>
        )}
      </div>

      {/* Stats - Staggered fade in */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard className="animate-fade-in-delay-1" title="Étudiants" value={stats.etudiants} icon={Users} color="primary" loading={loading} trend={5} trendLabel="ce mois" />
        <StatCard className="animate-fade-in-delay-1" title="Enseignants" value={stats.enseignants} icon={GraduationCap} color="info" loading={loading} />
        <StatCard className="animate-fade-in-delay-2" title="Modules" value={stats.modules} icon={Layers} color="secondary" loading={loading} />
        <StatCard className="animate-fade-in-delay-2" title="Matières" value={stats.matieres} icon={BookOpen} color="warning" loading={loading} />
        <StatCard className="animate-fade-in-delay-3" title="Notes" value={stats.notes} icon={FileText} color="success" loading={loading} trend={12} trendLabel="cette semaine" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-delay-3">
        {/* Répartition des notes par mention */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-emerald-500" /> Répartition des Mentions</CardTitle>
            <CardDescription>Analyse des performances globales des étudiants</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : noteMentions.length > 0 ? (
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={noteMentions} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: 'var(--color-text-secondary)', fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 13, fill: 'var(--color-text-secondary)', fontWeight: 600 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-primary-light)', opacity: 0.4 }} />
                    <Bar dataKey="value" name="Nombre de notes" radius={[8, 8, 0, 0]}>
                      {noteMentions.map((entry) => (
                        <Cell key={entry.name} fill={MENTION_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-slate-400 font-medium">
                Aucune note saisie pour le moment
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition par niveau */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-teal-500" /> Étudiants par Niveau</CardTitle>
            <CardDescription>Effectifs par niveau d'étude</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : niveauData.length > 0 ? (
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={niveauData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      stroke="none"
                    >
                      {niveauData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center text-slate-400 font-medium">
                Aucun étudiant inscrit
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

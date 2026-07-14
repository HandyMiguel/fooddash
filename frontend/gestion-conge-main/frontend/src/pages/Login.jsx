import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2, BookOpen, Layers, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Compte créé avec succès !');
      } else {
        await login(form.email, form.password);
        toast.success('Connexion réussie !');
      }
      navigate('/');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--color-text)] bg-slate-50 selection:bg-emerald-500 selection:text-white">
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-emerald-950">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/30 blur-[80px] animate-pulse-subtle mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/20 blur-[100px] animate-pulse-subtle mix-blend-screen" style={{ animationDelay: '1s' }} />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">GestNotes</span>
        </div>

        <div className="relative z-10 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Gérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">résultats</span> académiques.
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed font-medium">
            Une plateforme centralisée et moderne pour simplifier la vie des enseignants, étudiants et de l'administration.
          </p>
          
          <div className="mt-12 flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-fit hover:bg-white/10 transition-colors cursor-default">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl"><Layers className="text-emerald-400 w-6 h-6" /></div>
              <div><p className="text-white font-bold">Architecture Structurée</p><p className="text-slate-400 text-sm">Mentions, Parcours & Niveaux</p></div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-fit ml-8 hover:bg-white/10 transition-colors cursor-default">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl"><BookOpen className="text-emerald-400 w-6 h-6" /></div>
              <div><p className="text-white font-bold">Notes & Relevés</p><p className="text-slate-400 text-sm">Génération automatique instantanée</p></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-slate-500 font-medium">
          <p>© 2024 GestNotes. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Aide</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Glassmorphism & Crisp) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile abstract shapes */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-transparent opacity-60 lg:hidden" />

        <div className="w-full max-w-[440px] animate-fade-in relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">GestNotes</h1>
          </div>

          <div className="bg-white/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none border border-white/50 lg:border-none">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {isRegister ? 'Créer un compte' : 'Bienvenue'}
              </h2>
              <p className="text-slate-500 font-medium mt-3">
                {isRegister
                  ? 'Entrez vos informations pour configurer votre accès.'
                  : 'Saisissez vos identifiants pour accéder à votre espace.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="grid grid-cols-2 gap-4 animate-slide-in">
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Nom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        placeholder="Dupont"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        placeholder="Jean"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@universite.fr"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 group-focus-within:text-emerald-600 transition-colors">Mot de passe</label>
                  {!isRegister && <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Oublié ?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium border border-slate-200 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isRegister ? 'Créer mon compte' : 'Se connecter'}
              </button>
            </form>

            <p className="text-sm text-center mt-8 text-slate-500 font-medium">
              {isRegister ? 'Déjà un compte ?' : "Nouveau sur la plateforme ?"}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                {isRegister ? 'Se connecter' : "S'inscrire"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

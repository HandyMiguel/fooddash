// pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, UserPlus, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/* Password strength helper */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: '', color: '' },
    { label: 'Très faible', color: '#EF4444' },
    { label: 'Faible', color: '#F97316' },
    { label: 'Moyen', color: '#F59E0B' },
    { label: 'Fort', color: '#10B981' },
    { label: 'Très fort', color: '#059669' },
  ];
  return { score, ...levels[score] };
}

const FOOD_EMOJIS = ['🍕', '🌯', '🍜', '🥘', '🧆', '🍛', '🥩', '🍱'];

export default function Register() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    role: 'user',
    vehicule: 'Vélo'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = identity, 2 = contact
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        toast.success('Inscription réussie !');
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else if (data.user?.role === 'livreur') {
          navigate('/livreur');
        } else {
          navigate('/menu');
        }
      }, 2200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const canGoStep2 = form.nom.trim() && form.email.trim() && form.password.length >= 6;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white overflow-hidden">

      {/* ── Welcome Modal ── */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/8 rounded-3xl p-10 max-w-xs w-full text-center shadow-2xl animate-bounce-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center mx-auto mb-5 text-4xl shadow-xl shadow-[#FF6B35]/30 animate-bounce">
              🎉
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Bienvenue !</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">Votre compte a été créé avec succès</p>
            <div className="flex items-center justify-center gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF3366]"
                  style={{ animation: 'bounce 1s ease-in-out infinite', animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[58%] relative flex-col items-center justify-center overflow-hidden bg-[#0D0D15]">
        {/* Blobs */}
        <div className="absolute top-[-15%] right-[-10%] w-80 h-80 rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, #7C3AED, #FF3366)', animationDelay: '0s' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 rounded-full opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, #FF6B35, #F59E0B)', animationDelay: '4s' }} />

        {/* Grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(124,58,237,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#FF3366] flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-[#7C3AED]/40 animate-float">
            🎉
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Rejoignez<br />
            <span style={{ background: 'linear-gradient(135deg,#FF6B35,#FF3366,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              des milliers
            </span><br />
            de gourmands
          </h1>
          <p className="text-gray-400 text-base font-medium mb-10 leading-relaxed">
            Créez votre compte gratuitement et commencez à commander vos plats favoris dès maintenant.
          </p>

          {/* Benefits */}
          <div className="flex flex-col gap-3 text-left">
            {[
              { icon: '🚀', text: 'Livraison express en 25 minutes' },
              { icon: '💰', text: 'Offres exclusives membres chaque semaine' },
              { icon: '❤️', text: 'Sauvegardez vos plats favoris' },
              { icon: '📦', text: 'Suivez vos commandes en temps réel' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-3 bg-white/5 border border-white/6 rounded-xl px-4 py-3">
                <span className="text-xl">{b.icon}</span>
                <span className="text-white text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FOOD_EMOJIS.map((emoji, i) => (
            <div key={i} className="absolute text-3xl select-none opacity-25"
              style={{
                top: `${10 + (i * 11) % 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                animation: `float-slow ${5 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
                filter: 'blur(0.5px)',
              }}>
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL – Register Form
      ══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-6">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-[#FF6B35]/30">
              🍔
            </div>
            <h1 className="text-3xl font-black gradient-text-warm">FoodDash</h1>
          </div>

          {/* Header */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] text-xs font-bold mb-4">
              <Sparkles size={12} />
              Inscription gratuite
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
              Créez votre<br />compte 🚀
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-[#FF6B35] font-bold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  step > s
                    ? 'bg-[#10B981] text-white'
                    : step === s
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#FF3366] text-white shadow-lg shadow-[#FF6B35]/30'
                    : 'bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-gray-500'
                }`}>
                  {step > s ? <Check size={13} /> : s}
                </div>
                <span className={`text-xs font-bold transition-colors ${
                  step === s ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {s === 1 ? 'Identité' : 'Contact'}
                </span>
                {s < 2 && (
                  <div className={`flex-1 h-px transition-colors duration-500 ${
                    step > 1 ? 'bg-[#10B981]' : 'bg-gray-200 dark:bg-white/8'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/6 rounded-3xl p-7 shadow-xl shadow-black/5 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4">

              {step === 1 ? (
                <>
                  {/* Rôle */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Je m'inscris en tant que :
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'user' })}
                        className={`py-3 rounded-2xl border text-xs font-black transition-all duration-300 cursor-pointer ${
                          form.role === 'user'
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'border-gray-200 dark:border-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        🍔 Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'livreur' })}
                        className={`py-3 rounded-2xl border text-xs font-black transition-all duration-300 cursor-pointer ${
                          form.role === 'livreur'
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'border-gray-200 dark:border-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        🛵 Livreur
                      </button>
                    </div>
                  </div>

                  {form.role === 'livreur' && (
                    <div className="animate-slide-up">
                      <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                        Moyen de transport *
                      </label>
                      <select
                        name="vehicule"
                        value={form.vehicule}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FF6B35] transition-all appearance-none"
                      >
                        <option value="Vélo" className="text-black">🚲 Vélo</option>
                        <option value="Scooter" className="text-black">🛵 Scooter</option>
                        <option value="Voiture" className="text-black">🚗 Voiture</option>
                        <option value="Trottinette" className="text-black">🛴 Trottinette électrique</option>
                      </select>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Nom complet *
                    </label>
                    <div className="relative group">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      <input
                        type="text"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Email *
                    </label>
                    <div className="relative group">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Mot de passe *
                    </label>
                    <div className="relative group">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                        placeholder="Minimum 6 caractères"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {form.password && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div
                              key={i}
                              className="strength-bar flex-1"
                              style={{ background: i <= strength.score ? strength.color : '#E5E7EB' }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] font-bold" style={{ color: strength.color }}>
                          {strength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    disabled={!canGoStep2}
                    onClick={() => setStep(2)}
                    className="ripple-container w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl gradient-btn text-white font-bold text-sm transition-all duration-300 disabled:opacity-40 disabled:transform-none disabled:shadow-none cursor-pointer mt-2"
                  >
                    Continuer
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  {/* Phone */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Téléphone
                    </label>
                    <div className="relative group">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      <input
                        type="text"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                      Adresse de livraison
                    </label>
                    <div className="relative group">
                      <MapPin size={15} className="absolute left-4 top-5 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                      <textarea
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200 resize-none"
                        placeholder="123 rue de la Paix, Paris…"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/6 border border-gray-200 dark:border-white/8 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ripple-container flex-[2] inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl gradient-btn text-white font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Inscription…
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Créer mon compte
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-400 mt-6 font-medium">
            En créant un compte, vous acceptez nos{' '}
            <span className="text-[#FF6B35] font-bold cursor-pointer hover:underline">CGU</span>
          </p>
        </div>
      </div>
    </div>
  );
}
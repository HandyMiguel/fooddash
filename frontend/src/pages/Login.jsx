// pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const FOOD_EMOJIS = ['🍔', '🍕', '🌮', '🍣', '🥗', '🍜', '🧁', '🍱'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        toast.success('Connecté avec succès !');
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else if (data.user?.role === 'livreur') {
          navigate('/livreur');
        } else {
          navigate('/menu');
        }
      }, 2200);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white overflow-hidden">

      {/* ── Welcome Modal ── */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/8 rounded-3xl p-10 max-w-xs w-full text-center shadow-2xl animate-bounce-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center mx-auto mb-5 text-4xl shadow-xl shadow-[#FF6B35]/30 animate-float">
              👋
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Bon retour !</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium">Nous sommes ravis de vous revoir</p>
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
          LEFT PANEL – Branding Visual
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[58%] relative flex-col items-center justify-center overflow-hidden bg-[#0D0D15]">
        {/* Animated blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, #FF6B35, #FF3366)', animationDelay: '0s' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, #7C3AED, #FF3366)', animationDelay: '3s' }} />
        <div className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full opacity-15 animate-blob"
          style={{ background: 'radial-gradient(circle, #FF3366, #FF6B35)', animationDelay: '6s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,107,53,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-[#FF6B35]/40 animate-pulse-glow">
            🍔
          </div>

          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            La meilleure<br />
            <span className="gradient-text-warm">nourriture</span><br />
            livrée vite
          </h1>
          <p className="text-gray-400 text-base font-medium mb-10 leading-relaxed">
            Commandez vos plats préférés en quelques clics et recevez-les chauds à votre porte.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8">
            {[
              { value: '4.9★', label: 'Note moyenne' },
              { value: '25 min', label: 'Livraison' },
              { value: '500+', label: 'Plats dispo' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Floating food emojis */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {FOOD_EMOJIS.map((emoji, i) => (
              <div
                key={i}
                className="absolute text-3xl select-none opacity-30"
                style={{
                  top: `${10 + (i * 11) % 80}%`,
                  left: `${5 + (i * 13) % 90}%`,
                  animation: `float-slow ${5 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.7}s`,
                  filter: 'blur(0.5px)',
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Review card floating */}
        <div className="absolute bottom-8 left-8 right-8 max-w-xs">
          <div className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">Marie L.</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="text-gray-400 text-[11px] mt-0.5 font-medium line-clamp-1">
                "Livraison ultra-rapide, les plats étaient encore chauds !"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL – Login Form
      ══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-[#FF6B35]/30">
              🍔
            </div>
            <h1 className="text-3xl font-black gradient-text-warm">FoodDash</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold mb-4">
              <Sparkles size={12} />
              Connexion sécurisée
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
              Bon retour<br />parmi nous 👋
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#FF6B35] font-bold hover:underline">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-[#13131A] border border-gray-100 dark:border-white/6 rounded-3xl p-7 shadow-xl shadow-black/5 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-2.5 block">
                  Adresse Email
                </label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF6B35] transition-colors duration-200" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
                    Mot de passe
                  </label>
                  <button type="button" className="text-[11px] text-[#FF6B35] font-bold hover:underline">
                    Oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#FF6B35] transition-colors duration-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] dark:focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/15 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors duration-200 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    rememberMe
                      ? 'bg-[#FF6B35] border-[#FF6B35]'
                      : 'border-gray-300 dark:border-white/15'
                  }`}
                >
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Se souvenir de moi
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="ripple-container w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl gradient-btn text-white font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Se connecter
                    <ArrowRight size={14} className="ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-400 mt-6 font-medium">
            En vous connectant, vous acceptez nos{' '}
            <span className="text-[#FF6B35] font-bold cursor-pointer hover:underline">CGU</span>
            {' '}et notre{' '}
            <span className="text-[#FF6B35] font-bold cursor-pointer hover:underline">Politique de confidentialité</span>
          </p>
        </div>
      </div>
    </div>
  );
}
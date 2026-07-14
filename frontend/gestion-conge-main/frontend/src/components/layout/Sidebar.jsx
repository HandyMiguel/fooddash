import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Layers,
  FileText, CalendarDays, LogOut, Menu, X, ChevronRight, Bell, ArrowUpCircle
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/etudiants', label: 'Étudiants', icon: Users },
  { path: '/enseignants', label: 'Enseignants', icon: GraduationCap },
  { path: '/mentions-parcours', label: 'Mentions & Parcours', icon: BookOpen },
  { path: '/niveaux', label: 'Niveaux', icon: ArrowUpCircle },
  { path: '/modules-matieres', label: 'Modules & Matières', icon: Layers },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/annees-sessions', label: 'Années & Sessions', icon: CalendarDays },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden text-white w-full">
      {/* Decorative top glow */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/20 to-transparent -z-10" />

      {/* Logo / Header */}
      <div className="flex items-center gap-4 px-6 py-8">
        <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transform transition-transform hover:scale-105">
          GN
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex-1">
            <h1 className="text-white font-extrabold text-2xl tracking-tight leading-tight">GestNotes</h1>
            <p className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider mt-0.5">Université</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-90 -z-10" />
              )}
              
              <Icon className={`w-[22px] h-[22px] flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 group-hover:text-emerald-400'}`} />
              
              {!collapsed && <span className="relative z-10">{item.label}</span>}
              
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-800/80 mt-auto bg-slate-900/30 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-4 animate-fade-in group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-700 shadow-inner group-hover:border-emerald-500 transition-colors">
              <span className="text-sm font-bold">{user.nom?.charAt(0)}{user.prenom?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate group-hover:text-emerald-300 transition-colors">{user.nom} {user.prenom}</p>
              <p className="text-xs text-slate-400 truncate font-medium">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 group
            bg-slate-800/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/50 hover:border-red-500/30`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg bg-emerald-600 text-white border border-emerald-500/50 backdrop-blur-md"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-[280px] shadow-2xl transition-transform duration-400 ease-out lg:hidden glass-sidebar ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <div className={`hidden lg:block transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? 'w-[88px]' : 'w-[280px]'}`} />
      <aside
        className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800/50 shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 glass-sidebar ${
          collapsed ? 'w-[88px]' : 'w-[280px]'
        }`}
      >
        {sidebarContent}
        
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-10 w-8 h-8 rounded-full border border-slate-700/50 flex items-center justify-center shadow-lg bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-300 z-50 group hover:scale-110"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'} group-hover:scale-110`} />
        </button>
      </aside>
    </>
  );
}

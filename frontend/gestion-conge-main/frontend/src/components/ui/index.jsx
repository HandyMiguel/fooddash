import { Link } from 'react-router-dom';

/* ── Card ──────────────────────────────────────────────────────────── */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`glass rounded-[var(--radius-xl)] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-5 border-b border-[var(--color-border)]/50 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-xl font-bold tracking-tight text-[var(--color-text)] ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm mt-1.5 text-[var(--color-text-secondary)] font-medium ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

/* ── Button ────────────────────────────────────────────────────────── */
const buttonVariants = {
  primary: `bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 border-transparent`,
  outline: `bg-transparent text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] hover:border-[var(--color-text-muted)]`,
  ghost: `bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)] border-transparent`,
  danger: `bg-[var(--color-danger)] text-white hover:bg-[#b91c1c] shadow-md shadow-[var(--color-danger)]/20 border-transparent`,
  success: `bg-[var(--color-success)] text-white hover:bg-[#047857] shadow-md shadow-[var(--color-success)]/20 border-transparent`,
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius)]',
  md: 'px-4 py-2.5 text-sm rounded-[var(--radius-lg)]',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-lg)]',
};

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const s = buttonSizes[size] || buttonSizes.md;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 border
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-px active:scale-[0.97] active:translate-y-0'}
        ${s} ${v} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────────────────────────── */
export function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="space-y-2 group">
      {label && (
        <label htmlFor={id} className={`block text-sm font-semibold transition-colors duration-200 ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)] group-focus-within:text-[var(--color-primary)]'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-300 outline-none
            bg-[var(--color-bg-input)] shadow-sm
            ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20 focus:border-[var(--color-danger)]' : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'}
            border hover:border-[var(--color-text-muted)] focus:ring-4 ${className}`}
          style={{ color: 'var(--color-text)' }}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-[var(--color-danger)] animate-fade-in">{error}</p>}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────────────── */
export function Select({ label, options = [], error, className = '', id, placeholder = 'Sélectionner...', ...props }) {
  return (
    <div className="space-y-2 group">
      {label && (
        <label htmlFor={id} className={`block text-sm font-semibold transition-colors duration-200 ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)] group-focus-within:text-[var(--color-primary)]'}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-300 outline-none cursor-pointer appearance-none
          bg-[var(--color-bg-input)] shadow-sm
          ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20 focus:border-[var(--color-danger)]' : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'}
          border hover:border-[var(--color-text-muted)] focus:ring-4 ${className}`}
        style={{ color: 'var(--color-text)', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        {...props}
      >
        <option value="" disabled className="text-gray-400">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-[var(--color-danger)] animate-fade-in">{error}</p>}
    </div>
  );
}

/* ── Table ──────────────────────────────────────────────────────────── */
export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm bg-white">
      <table className={`w-full text-sm text-left ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-[var(--color-bg-muted)]/80 backdrop-blur-md sticky top-0 z-10 border-b border-[var(--color-border)]">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-[var(--color-border)]/60">{children}</tbody>;
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={`transition-all duration-200 hover:bg-[var(--color-primary-light)]/30 group ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return <td className={`px-5 py-4 text-[var(--color-text)] font-medium ${className}`}>{children}</td>;
}

/* ── Modal / Dialog ────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
      <div
        className={`relative w-full ${sizes[size]} glass rounded-[var(--radius-xl)] shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/20`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-8 py-6 border-b border-[var(--color-border)]/50">
            {title && <h2 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{title}</h2>}
            {description && <p className="text-sm mt-2 text-[var(--color-text-secondary)] font-medium">{description}</p>}
          </div>
        )}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────── */
const badgeColors = {
  primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]/20',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info)]/20',
  default: 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
};

export function Badge({ children, variant = 'default', className = '' }) {
  const c = badgeColors[variant] || badgeColors.default;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${c} ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────────── */
export function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`rounded-lg relative overflow-hidden bg-slate-200/50 ${className}`}
      style={{ width, height }}
    >
       <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-muted)] flex items-center justify-center mb-5 rotate-3 shadow-sm border border-[var(--color-border)]/50">
        {Icon && <Icon className="w-8 h-8 text-[var(--color-text-muted)] -rotate-3" />}
      </div>
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 tracking-tight">{title}</h3>
      {description && <p className="text-sm font-medium text-[var(--color-text-secondary)] max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Confirm Dialog ────────────────────────────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={message} size="sm">
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]/50 mt-2">
        <Button variant="ghost" onClick={onClose}>Annuler</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────────── */
export function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'primary', loading = false, className = '' }) {
  const colors = {
    primary: 'from-[var(--color-primary-light)] to-transparent text-[var(--color-primary)] placeholder-[var(--color-primary-light)]',
    success: 'from-[var(--color-success-light)] to-transparent text-[var(--color-success)] placeholder-[var(--color-success-light)]',
    warning: 'from-[var(--color-warning-light)] to-transparent text-[var(--color-warning)] placeholder-[var(--color-warning-light)]',
    info: 'from-[var(--color-info-light)] to-transparent text-[var(--color-info)] placeholder-[var(--color-info-light)]',
    danger: 'from-[var(--color-danger-light)] to-transparent text-[var(--color-danger)] placeholder-[var(--color-danger-light)]',
  };
  const c = colors[color] || colors.primary;
  const gradientClass = `bg-gradient-to-br ${c.split(' ')[0]} ${c.split(' ')[1]}`;
  const iconColorClass = c.split(' ')[2];
  const iconBgClass = c.split(' ')[3].replace('placeholder-', 'bg-');

  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      {/* Decorative background gradient */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-50 ${gradientClass} transition-all duration-500 group-hover:scale-150`} />
      
      <CardContent className="py-6 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">{title}</p>
            {loading ? (
              <Skeleton height="36px" width="70px" className="rounded-md mt-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-extrabold text-[var(--color-text)] tracking-tight">{value}</p>
                 {trendLabel && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${trend >= 0 ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'}`}>
                    {trend >= 0 ? '↑' : '↓'} {trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${iconBgClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {Icon && <Icon className={`w-7 h-7 ${iconColorClass}`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

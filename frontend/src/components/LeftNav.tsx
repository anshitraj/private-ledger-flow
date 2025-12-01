import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  Settings, 
  Shield 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/records', icon: FileText, label: 'records' },
  { to: '/verify', icon: ShieldCheck, label: 'verify' },
  { to: '/settings', icon: Settings, label: 'settings' },
  { to: '/admin', icon: Shield, label: 'admin' },
];

export function LeftNav() {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex md:w-64 flex-col gap-3 border-r border-yellow-500/20 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur glass p-6 shadow-gold/20">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
            Navigation
          </h2>
        </div>
        <p className="text-xs text-muted-foreground px-2">
          Quick access menu
        </p>
      </div>
      <div className="space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative overflow-hidden',
                'hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30 hover:shadow-gold/30',
                isActive
                  ? 'bg-gradient-to-r from-yellow-500/25 to-amber-500/20 text-yellow-500 border border-yellow-500/40 shadow-gold'
                  : 'text-muted-foreground border border-transparent hover:border-yellow-500/20'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-r-full"></div>
                )}
                {/* Icon with glow effect */}
                <div className={cn(
                  'relative z-10 flex items-center justify-center',
                  isActive && 'drop-shadow-lg'
                )}>
                  <item.icon className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isActive 
                      ? 'text-yellow-500 scale-110' 
                      : 'text-muted-foreground group-hover:text-yellow-500 group-hover:scale-105'
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-yellow-500/20 blur-md -z-10"></div>
                  )}
                </div>
                {/* Label */}
                <span className={cn(
                  'relative z-10 transition-all duration-200',
                  isActive && 'font-semibold'
                )}>
                  {t(`nav.${item.label}`)}
                </span>
                {/* Hover effect gradient */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      {/* Decorative element */}
      <div className="mt-auto pt-6 border-t border-yellow-500/10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
          <div className="h-0.5 w-4 bg-yellow-500/30 rounded-full"></div>
          <span>Secure & Private</span>
          <div className="h-0.5 w-4 bg-yellow-500/30 rounded-full"></div>
        </div>
      </div>
    </nav>
  );
}

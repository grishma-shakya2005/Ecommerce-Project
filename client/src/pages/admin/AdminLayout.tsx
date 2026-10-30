import { ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { BarChart3, Boxes, FileText, HelpCircle, LogOut, Mail, PackageSearch, Store, Users } from 'lucide-react';
import { clearAdminSession } from './adminApi';

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: PackageSearch },
  { to: '/admin/about', label: 'About', icon: FileText },
  { to: '/admin/team', label: 'Team', icon: Users },
  { to: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
];

export function AdminGuard({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('palpali_admin_token');
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.role === 'admin' && typeof payload.username === 'string';
    } catch {
      isAdmin = false;
    }
  }
  return isAdmin ? <>{children}</> : <Navigate to={token ? '/' : '/admin/login'} replace />;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex text-gray-900">
      <aside className="w-64 bg-[#211810] text-white hidden md:flex flex-col p-5">
        <Link to="/admin" className="flex items-center gap-3 px-3 py-4 mb-8">
          <span className="w-9 h-9 rounded-xl bg-accent text-[#211810] flex items-center justify-center font-bold">P</span>
          <span className="font-serif font-bold text-lg">Palpali Admin</span>
        </Link>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl transition ${isActive ? 'bg-white/15 text-accent' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-3 px-3 py-3 text-white/65 hover:text-white">
          <LogOut size={18} /> Sign out
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 px-6 lg:px-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary font-bold">Store operations</p>
            <h1 className="font-serif text-2xl font-bold">Welcome back, owner</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-primary"><Store size={17} /> View store</Link>
            <button onClick={logout} className="md:hidden text-gray-500" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </header>
        <nav className="md:hidden bg-[#211810] px-4 py-2 flex gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-white/15 text-accent' : 'text-white/70'}`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-6 lg:p-10"><Outlet /></div>
      </main>
    </div>
  );
}

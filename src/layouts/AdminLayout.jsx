import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  BookOpenCheck,
  CalendarDays,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Users,
  X,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { logoutAdmin } from '../features/auth/authSlice';
import { useSyncLanguage } from '../hooks/useLanguage';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages';

const navItems = [
  { key: 'dashboard', path: '', icon: LayoutDashboard },
  { key: 'courses', path: '/courses', icon: BookOpenCheck },
  { key: 'teachers', path: '/teachers', icon: Users },
  { key: 'schedule', path: '/groups', icon: CalendarDays },
  { key: 'applications', path: '/applications', icon: Mail },
  { key: 'testimonials', path: '/testimonials', icon: MessageSquareQuote },
  { key: 'faq', path: '/faq', icon: HelpCircle },
  { key: 'messages', path: '/messages', icon: Mail },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSyncLanguage(lang);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!isSupportedLanguage(lang)) return <Navigate to={`/${DEFAULT_LANGUAGE}/admin`} replace />;

  async function handleLogout() {
    await dispatch(logoutAdmin());
    navigate(`/${lang}/admin/login`, { replace: true });
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        className={`admin-backdrop ${sidebarOpen ? 'is-visible' : ''}`.trim()}
        onClick={() => setSidebarOpen(false)}
        aria-label={t('nav.closeMenu')}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`.trim()}>
        <div className="admin-sidebar__brand">
          <img src="/logo.svg" alt="" width="40" height="40" />
          <div>
            <strong>{t('admin.brand')}</strong>
            <span>{t('admin.title')}</span>
          </div>
          <button type="button" className="icon-button admin-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label={t('nav.closeMenu')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="admin-nav" aria-label={t('nav.adminNav')}>
          {navItems.map(({ key, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={`/${lang}/admin${path}`}
              end={path === ''}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{t(`admin.nav.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link to={`/${lang}`} className="admin-site-link">
            <ExternalLink size={17} aria-hidden="true" />
            {t('admin.nav.viewSite')}
          </Link>
          <div className="admin-user">
            <span className="admin-user__avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            <div>
              <strong>{user?.name || t('admin.welcome')}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="button button--ghost button--block admin-logout" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="icon-button admin-menu-button" onClick={() => setSidebarOpen(true)} aria-label={t('nav.openMenu')} aria-expanded={sidebarOpen}>
            <Menu size={21} aria-hidden="true" />
          </button>
          <span className="admin-topbar__title">{t('admin.title')}</span>
          <div className="admin-topbar__tools">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <span className="admin-topbar__user">{user?.email}</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

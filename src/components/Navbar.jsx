import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, ShieldCheck, X, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Brand } from './Brand';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../hooks/useLanguage';

const links = [
  { key: 'home', path: '' },
  { key: 'courses', path: '/courses' },
  { key: 'teachers', path: '/teachers' },
  { key: 'schedule', path: '/schedule' },
  { key: 'faq', path: '/faq' },
  { key: 'contact', path: '/contact' },
];

export function Navbar() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const favoritesCount = useSelector((state) => state.favorites.courseIds.length);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const currentPath = location.pathname.replace(new RegExp(`^/${lang}`), '') || '/';

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />

        <nav className="site-nav" aria-label={t('nav.siteNav')}>
          {links.map((link) => {
            const target = `/${lang}${link.path}`;
            const active = link.path === '' ? currentPath === '/' : currentPath.startsWith(link.path);
            return (
              <Link key={link.key} to={target} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined}>
                {t(`nav.${link.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            to={`/${lang}/favorites`}
            className="icon-button favorites-link"
            aria-label={t('nav.favorites')}
            title={t('nav.favorites')}
          >
            <Heart size={18} aria-hidden="true" />
            {favoritesCount > 0 ? <span className="favorites-link__count">{favoritesCount}</span> : null}
          </Link>
          <Link to={`/${lang}/admin`} className="icon-button admin-link" aria-label={t('nav.admin')} title={t('nav.admin')}>
            <ShieldCheck size={18} aria-hidden="true" />
          </Link>
          <Link to={`/${lang}/courses`} className="button button--primary button--small nav-enroll">
            {t('nav.courses')}
          </Link>
          <button
            type="button"
            className="icon-button site-header__menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="mobile-navigation" className={`mobile-nav ${open ? 'is-open' : ''}`}>
        <nav className="container" aria-label={t('nav.siteNav')}>
          {links.map((link) => (
            <NavLink
              key={link.key}
              to={`/${lang}${link.path}`}
              end={link.path === ''}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
          <NavLink to={`/${lang}/favorites`}>{t('nav.favorites')}</NavLink>
          <NavLink to={`/${lang}/admin`}>{t('nav.admin')}</NavLink>
          <div className="mobile-nav__tools">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

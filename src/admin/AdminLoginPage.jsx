import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/Seo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { clearAuthError, loginAdmin } from '../features/auth/authSlice';
import { useSyncLanguage } from '../hooks/useLanguage';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages';
import { siteConfig } from '../config/site';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const [values, setValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  useSyncLanguage(lang);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  if (!isSupportedLanguage(lang)) return <Navigate to={`/${DEFAULT_LANGUAGE}/admin/login`} replace />;
  if (auth.status === 'authenticated') return <Navigate to={`/${lang}/admin`} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!values.email.trim()) errors.email = t('form.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = t('form.emailInvalid');
    if (!values.password) errors.password = t('form.required');
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const result = await dispatch(loginAdmin({ email: values.email.trim(), password: values.password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(location.state?.from || `/${lang}/admin`, { replace: true });
    }
  }

  return (
    <>
      <Seo titleKey="meta.adminLogin.title" descriptionKey="meta.adminLogin.description" noIndex />
      <div className="admin-login">
        <div className="admin-login__aside">
          <Link to={`/${lang}`} className="admin-login__brand">
            <img src="/logo.svg" alt="" width="52" height="52" />
            <span>{siteConfig.leavingNote || siteConfig.shortName[lang] || siteConfig.shortName.uz}</span>
          </Link>
          <div className="admin-login__aside-content">
            <span className="admin-login__badge"><ShieldCheck size={17} aria-hidden="true" /> {t('admin.title')}</span>
            <h2>{t('admin.loginTitle')}</h2>
            <p>{t('admin.loginSubtitle')}</p>
          </div>
          <p className="admin-login__copyright">© {new Date().getFullYear()} {siteConfig.shortName[lang] || siteConfig.shortName.uz}</p>
        </div>

        <div className="admin-login__main">
          <div className="admin-login__tools">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
          <div className="admin-login__card">
            <Link to={`/${lang}`} className="admin-login__back">
              <ArrowLeft size={16} aria-hidden="true" />
              {t('admin.backToSite')}
            </Link>
            <h1>{t('admin.loginTitle')}</h1>
            <p>{t('admin.loginSubtitle')}</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="admin-email">{t('admin.email')}</label>
                <div className="input-with-icon">
                  <Mail size={17} aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={values.email}
                    onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                    placeholder="admin@example.com"
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                </div>
                {fieldErrors.email ? <p className="field__error">{fieldErrors.email}</p> : null}
              </div>

              <div className="field">
                <label htmlFor="admin-password">{t('admin.password')}</label>
                <div className="input-with-icon input-with-icon--action">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={values.password}
                    onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                    required
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? t('admin.common.close') : t('admin.password')}
                  >
                    {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
                {fieldErrors.password ? <p className="field__error">{fieldErrors.password}</p> : null}
              </div>

              {auth.error ? (
                <p className="form-error" role="alert">
                  {t(`errors.${auth.error}`, { defaultValue: t('admin.common.generalError') })}
                </p>
              ) : null}

              <button type="submit" className="button button--primary button--block" disabled={auth.status === 'loading'}>
                {auth.status === 'loading' ? (
                  <><Loader2 className="spinner" size={17} aria-hidden="true" />{t('admin.loggingIn')}</>
                ) : t('admin.login')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

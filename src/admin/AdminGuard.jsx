import { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { fetchCurrentAdmin } from '../features/auth/authSlice';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages';

export function AdminGuard({ children }) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const language = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;

  useEffect(() => {
    if (auth.status === 'idle') dispatch(fetchCurrentAdmin());
  }, [auth.status, dispatch]);

  if (auth.status === 'idle' || auth.status === 'loading') {
    return (
      <div className="admin-guard-state" role="status">
        <img src="/logo.svg" alt="" width="54" height="54" />
        <Loader2 className="spinner" size={24} aria-hidden="true" />
        <p>{t('admin.loading')}</p>
      </div>
    );
  }

  if (auth.status !== 'authenticated' || !auth.user) {
    return <Navigate to={`/${language}/admin/login`} replace state={{ from: location.pathname }} />;
  }

  return children;
}

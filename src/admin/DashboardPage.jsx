import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, GraduationCap, Mail, Users } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { adminApi, toPlainError } from '../services/api';
import { formatDateTime } from '../utils/format';
import { useLanguage } from '../hooks/useLanguage';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/State';

const cardConfig = [
  { key: 'totalCourses', icon: BookOpen, tone: 'blue' },
  { key: 'totalTeachers', icon: GraduationCap, tone: 'violet' },
  { key: 'totalStudents', icon: Users, tone: 'green' },
  { key: 'newApplications', icon: Mail, tone: 'amber' },
];

export function DashboardPage() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const language = useLanguage();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    adminApi
      .getStats()
      .then((result) => {
        if (!alive) return;
        setData(result);
        setStatus('succeeded');
      })
      .catch((err) => {
        if (!alive) return;
        setError(toPlainError(err).code);
        setStatus('failed');
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <AdminPageHeader title={t('admin.dashboardPage.title')} subtitle={t('admin.dashboardPage.subtitle')} />

      {status === 'loading' ? <LoadingState /> : null}
      {status === 'failed' ? (
        <ErrorState
          message={t(`errors.${error}`, { defaultValue: t('admin.common.loadError') })}
          onRetry={() => window.location.reload()}
        />
      ) : null}

      {data ? (
        <>
          <div className="admin-stat-grid">
            {cardConfig.map(({ key, icon: Icon, tone }) => (
              <div key={key} className={`admin-stat admin-stat--${tone}`}>
                <span className="admin-stat__icon"><Icon size={22} aria-hidden="true" /></span>
                <div>
                  <strong>{data[key]}</strong>
                  <span>{t(`admin.dashboardPage.${key}`)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-card">
              <div className="admin-card__header">
                <h2>{t('admin.dashboardPage.applicationsByStatus')}</h2>
              </div>
              <div className="status-breakdown">
                {Object.entries(data.applicationsByStatus).map(([statusKey, count]) => {
                  const total = Object.values(data.applicationsByStatus).reduce((sum, value) => sum + value, 0);
                  const percent = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={statusKey} className="status-breakdown__row">
                      <div>
                        <StatusBadge status={statusKey} type="application" />
                        <strong>{count}</strong>
                      </div>
                      <span className="status-breakdown__bar">
                        <span className={`status-breakdown__fill status-breakdown__fill--${statusKey}`} style={{ width: `${percent}%` }} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card__header">
                <h2>{t('admin.dashboardPage.quickActions')}</h2>
              </div>
              <div className="quick-actions">
                <Link to={`/${lang}/admin/courses`} className="quick-action">
                  <BookOpen size={20} aria-hidden="true" />
                  <span>{t('admin.dashboardPage.manageCourses')}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to={`/${lang}/admin/applications`} className="quick-action">
                  <Mail size={20} aria-hidden="true" />
                  <span>{t('admin.dashboardPage.manageApplications')}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to={`/${lang}/admin/messages`} className="quick-action">
                  <Mail size={20} aria-hidden="true" />
                  <span>{t('admin.nav.messages')}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>

          <section className="admin-card">
            <div className="admin-card__header">
              <h2>{t('admin.dashboardPage.latestApplications')}</h2>
              <Link to={`/${lang}/admin/applications`} className="text-link">
                {t('common.viewAll')}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            {data.latestApplications.length ? (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t('admin.applications.student')}</th>
                      <th>{t('admin.applications.course')}</th>
                      <th>{t('admin.applications.status')}</th>
                      <th>{t('admin.applications.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.latestApplications.map((application) => (
                      <tr key={application.id}>
                        <td><Link to={`/${lang}/admin/applications/${application.id}`}>{application.firstName} {application.lastName}</Link></td>
                        <td>{application.course ? application.course[`name_${language}`] || application.course.name_uz : '—'}</td>
                        <td><StatusBadge status={application.status} type="application" /></td>
                        <td>{formatDateTime(application.createdAt, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-empty">{t('admin.dashboardPage.noApplications')}</p>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}

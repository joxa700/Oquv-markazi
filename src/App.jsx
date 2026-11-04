import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminGuard } from './admin/AdminGuard';
import { ScrollToTop } from './components/ScrollToTop';
import { ToastHost } from './components/ToastHost';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TeachersPage } from './pages/TeachersPage';
import { SchedulePage } from './pages/SchedulePage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './admin/AdminLoginPage';
import { DashboardPage } from './admin/DashboardPage';
import { CoursesAdminPage } from './admin/CoursesAdminPage';
import { TeachersAdminPage } from './admin/TeachersAdminPage';
import { GroupsAdminPage } from './admin/GroupsAdminPage';
import { ApplicationsAdminPage } from './admin/ApplicationsAdminPage';
import { ApplicationDetailPage } from './admin/ApplicationDetailPage';
import { TestimonialsAdminPage } from './admin/TestimonialsAdminPage';
import { FaqAdminPage } from './admin/FaqAdminPage';
import { MessagesAdminPage } from './admin/MessagesAdminPage';
import { AdminNotFound } from './admin/AdminNotFound';

function LanguageRedirect() {
  const language = useSelector((state) => state.settings.language);
  return <Navigate to={`/${language}`} replace />;
}

function AdminEntryRedirect() {
  const language = useSelector((state) => state.settings.language);
  return <Navigate to={`/${language}/admin`} replace />;
}

function CatchAllRedirect() {
  const language = useSelector((state) => state.settings.language);
  const location = useLocation();
  return <Navigate to={`/${language}${location.pathname}${location.search}${location.hash}`} replace />;
}

function InvalidLanguageRedirect({ admin = false }) {
  const language = useSelector((state) => state.settings.language);
  return <Navigate to={`/${language}${admin ? '/admin' : ''}`} replace />;
}

function LanguageGuard({ admin = false, children }) {
  const { lang } = useParams();
  if (!['uz', 'ru', 'en'].includes(lang)) return <InvalidLanguageRedirect admin={admin} />;
  return children;
}

export default function App() {
  useTheme();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LanguageRedirect />} />
        <Route path="/admin" element={<AdminEntryRedirect />} />

        <Route path="/:lang" element={<LanguageGuard><PublicLayout /></LanguageGuard>}>
          <Route index element={<HomePage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:slug" element={<CourseDetailPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/:lang/admin/login" element={<LanguageGuard admin><AdminLoginPage /></LanguageGuard>} />
        <Route
          path="/:lang/admin"
          element={
            <LanguageGuard admin>
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            </LanguageGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<CoursesAdminPage />} />
          <Route path="teachers" element={<TeachersAdminPage />} />
          <Route path="groups" element={<GroupsAdminPage />} />
          <Route path="applications" element={<ApplicationsAdminPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="testimonials" element={<TestimonialsAdminPage />} />
          <Route path="faq" element={<FaqAdminPage />} />
          <Route path="messages" element={<MessagesAdminPage />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
      <ToastHost />
    </>
  );
}

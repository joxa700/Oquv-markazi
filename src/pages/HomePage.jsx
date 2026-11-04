import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Code2,
  Languages,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/Reveal';
import { CourseCard } from '../components/CourseCard';
import { TeacherCard } from '../components/TeacherCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { TeacherProfileModal } from '../components/TeacherProfileModal';
import { FaqAccordion } from '../components/FaqAccordion';
import { LoadingState, ErrorState } from '../components/State';
import { fetchCourses } from '../features/courses/coursesSlice';
import { fetchStats, fetchTeachers, fetchTestimonials, fetchFaq } from '../features/content/contentSlice';
import { useLanguage } from '../hooks/useLanguage';
import { useEnrollment } from '../components/EnrollmentProvider';
import { getSiteText } from '../config/site';

const directions = [
  { key: 'english', icon: Languages, tone: 'blue' },
  { key: 'it', icon: Code2, tone: 'violet' },
  { key: 'math', icon: Calculator, tone: 'amber' },
  { key: 'russian', icon: BookOpen, tone: 'rose' },
];

const advantages = ['quality', 'practice', 'care', 'result'];
const methodSteps = ['assess', 'plan', 'learn', 'feedback'];

export function HomePage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const { openEnrollment } = useEnrollment();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const courses = useSelector((state) => state.courses);
  const { teachers, testimonials, faq, stats } = useSelector((state) => state.content);

  useEffect(() => {
    if (courses.lang !== lang || courses.status === 'idle') dispatch(fetchCourses(lang));
    if (teachers.lang !== lang || teachers.status === 'idle') dispatch(fetchTeachers(lang));
    if (testimonials.lang !== lang || testimonials.status === 'idle') dispatch(fetchTestimonials(lang));
    if (faq.lang !== lang || faq.status === 'idle') dispatch(fetchFaq(lang));
    if (stats.status === 'idle') dispatch(fetchStats());
  }, [courses.lang, courses.status, dispatch, faq.lang, faq.status, lang, stats.status, teachers.lang, teachers.status, testimonials.lang, testimonials.status]);

  const statItems = [
    { value: stats.data?.students ?? '—', label: t('home.stats.students') },
    { value: stats.data?.teachers ?? '—', label: t('home.stats.teachers') },
    { value: stats.data?.courses ?? '—', label: t('home.stats.courses') },
  ];

  return (
    <>
      <Seo titleKey="meta.home.title" descriptionKey="meta.home.description" />

      <section className="hero">
        <div className="hero__glow hero__glow--one" aria-hidden="true" />
        <div className="hero__glow hero__glow--two" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__content">
            <Reveal className="hero__badge">
              <Sparkles size={16} aria-hidden="true" />
              <span>{t('home.badge')}</span>
            </Reveal>
            <Reveal as="h1" delay={80} className="hero__title">
              {t('home.heroTitle')}
              <span>{t('home.heroAccent')}</span>
            </Reveal>
            <Reveal as="p" delay={160} className="hero__subtitle">
              {t('home.heroSubtitle')}
            </Reveal>
            <Reveal className="hero__actions" delay={240}>
              <Link to={`/${lang}/courses`} className="button button--primary button--large">
                {t('home.viewCourses')}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <button type="button" className="button button--outline button--large" onClick={() => openEnrollment()}>
                {t('home.enrollNow')}
              </button>
            </Reveal>
            <Reveal as="p" delay={320} className="hero__note">
              <CheckCircle2 size={18} aria-hidden="true" />
              {t('home.heroNote')}
            </Reveal>
          </div>

          <Reveal className="hero__visual" delay={180}>
            <div className="hero__image-wrap">
              <img src="/hero-illustration.svg" alt={getSiteText('name', lang)} width="620" height="620" />
            </div>
            <div className="hero__rating">
              <div className="stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <strong>4.9 / 5</strong>
              <span>{t('common.averageRating')}</span>
            </div>
            <div className="hero__students">
              <div className="avatar-stack" aria-hidden="true">
                <img src="/images/testimonials/student-1.svg" alt="" />
                <img src="/images/testimonials/student-2.svg" alt="" />
                <img src="/images/testimonials/student-3.svg" alt="" />
              </div>
              <span>{t('home.badge')}</span>
            </div>
          </Reveal>
        </div>

        <div className="container">
          <Reveal className="hero-stats" delay={200}>
            {statItems.map((item, index) => (
              <div key={item.label} className="hero-stats__item">
                <strong>{item.value}<span>+</span></strong>
                <span>{item.label}</span>
                {index < statItems.length - 1 ? <i aria-hidden="true" /> : null}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-heading section-heading--center">
            <span className="eyebrow">{t('home.directionsTitle')}</span>
            <h2>{t('home.directionsTitle')}</h2>
            <p>{t('home.directionsSubtitle')}</p>
          </Reveal>
          <div className="direction-grid">
            {directions.map(({ key, icon: Icon, tone }, index) => (
              <Reveal key={key} delay={index * 70}>
                <Link to={`/${lang}/courses?category=${key}`} className={`direction-card direction-card--${tone}`}>
                  <span className="direction-card__icon">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <h3>{t(`home.directions.${key}.title`)}</h3>
                  <p>{t(`home.directions.${key}.description`)}</p>
                  <span className="text-link">
                    {t('home.viewCourses')}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <Reveal className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">{t('home.popularTitle')}</span>
              <h2>{t('home.popularTitle')}</h2>
              <p>{t('home.popularSubtitle')}</p>
            </div>
            <Link to={`/${lang}/courses`} className="button button--outline">
              {t('common.viewAll')}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Reveal>

          {courses.status === 'loading' && courses.items.length === 0 ? <LoadingState /> : null}
          {courses.status === 'failed' && courses.items.length === 0 ? (
            <ErrorState message={t(`errors.${courses.error}`, { defaultValue: t('errors.generic') })} onRetry={() => dispatch(fetchCourses(lang))} />
          ) : null}
          <div className="course-grid">
            {courses.items.slice(0, 6).map((course, index) => (
              <Reveal key={course.id} delay={(index % 3) * 70}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-heading section-heading--center">
            <span className="eyebrow">{t('home.advantagesTitle')}</span>
            <h2>{t('home.advantagesTitle')}</h2>
            <p>{t('home.advantagesSubtitle')}</p>
          </Reveal>
          <div className="advantage-grid">
            {advantages.map((key, index) => (
              <Reveal key={key} className="advantage-card" delay={index * 70}>
                <span className="advantage-card__number">0{index + 1}</span>
                <CheckCircle2 size={22} aria-hidden="true" />
                <h3>{t(`home.advantages.${key}.title`)}</h3>
                <p>{t(`home.advantages.${key}.text`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <Reveal className="section-heading section-heading--center section-heading--light">
            <span className="eyebrow">{t('home.methodTitle')}</span>
            <h2>{t('home.methodTitle')}</h2>
            <p>{t('home.methodSubtitle')}</p>
          </Reveal>
          <div className="method-grid">
            {methodSteps.map((key, index) => (
              <Reveal key={key} className="method-card" delay={index * 80}>
                <span className="method-card__step">{index + 1}</span>
                <h3>{t(`home.method.${key}.title`)}</h3>
                <p>{t(`home.method.${key}.text`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">{t('home.teachersTitle')}</span>
              <h2>{t('home.teachersTitle')}</h2>
              <p>{t('home.teachersSubtitle')}</p>
            </div>
            <Link to={`/${lang}/teachers`} className="button button--outline">
              {t('common.viewAll')}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="teacher-grid">
            {teachers.items.slice(0, 4).map((teacher, index) => (
              <Reveal key={teacher.id} delay={(index % 4) * 70}>
                <TeacherCard teacher={teacher} onOpen={setSelectedTeacher} />
              </Reveal>
            ))}
          </div>
          {teachers.status === 'failed' ? (
            <ErrorState message={t(`errors.${teachers.error}`, { defaultValue: t('errors.generic') })} onRetry={() => dispatch(fetchTeachers(lang))} />
          ) : null}
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <Reveal className="section-heading section-heading--center">
            <span className="eyebrow">{t('home.testimonialsTitle')}</span>
            <h2>{t('home.testimonialsTitle')}</h2>
            <p>{t('home.testimonialsSubtitle')}</p>
          </Reveal>
          <div className="testimonial-grid">
            {testimonials.items.slice(0, 3).map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 80}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container faq-preview">
          <Reveal className="faq-preview__intro">
            <span className="eyebrow">{t('home.faqTitle')}</span>
            <h2>{t('home.faqTitle')}</h2>
            <p>{t('home.faqSubtitle')}</p>
            <Link to={`/${lang}/faq`} className="text-link">
              {t('nav.faq')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <FaqAccordion items={faq.items.slice(0, 5)} />
          </Reveal>
        </div>
      </section>

      <TeacherProfileModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />

      <section className="section cta-section">
        <div className="container">
          <Reveal className="cta-panel">
            <div className="cta-panel__content">
              <span className="cta-panel__icon"><Users size={26} aria-hidden="true" /></span>
              <h2>{t('home.ctaTitle')}</h2>
              <p>{t('home.ctaText')}</p>
            </div>
            <div className="cta-panel__actions">
              <button type="button" className="button button--primary button--large" onClick={() => openEnrollment()}>
                {t('home.ctaButton')}
              </button>
              <Link to={`/${lang}/contact`} className="button button--ghost-light button--large">
                {t('home.ctaSecondary')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

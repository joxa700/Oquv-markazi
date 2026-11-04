import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../server/app.js';
import { prisma } from '../../server/lib/prisma.js';

const ADMIN_EMAIL = 'api-test@nurtalim.uz';
const ADMIN_PASSWORD = 'ApiTest!2026';

const coursePayload = {
  slug: 'api-test-course',
  name_uz: 'API sinov kursi',
  name_ru: 'Курс проверки API',
  name_en: 'API test course',
  description_uz: 'Sinov tavsifi',
  description_ru: 'Описание',
  description_en: 'Description',
  curriculum_uz: '1. Kirish\n2. Amaliyot',
  curriculum_ru: '1. Введение',
  curriculum_en: '1. Introduction',
  category: 'it',
  price: 900000,
  duration_uz: '3 oy',
  duration_ru: '3 месяца',
  duration_en: '3 months',
  lessonsPerWeek: 3,
  startDate: '2026-12-01',
  targetAudience_uz: 'Boshlovchilar',
  targetAudience_ru: 'Новички',
  targetAudience_en: 'Beginners',
  requiredLevel_uz: 'Boshlang‘ich',
  requiredLevel_ru: 'Начальный',
  requiredLevel_en: 'Beginner',
  paymentTerms_uz: 'Har oy',
  paymentTerms_ru: 'Ежемесячно',
  paymentTerms_en: 'Monthly',
  image: null,
  teacherIds: [],
};

let agent;
let courseId;
let teacherId;
let groupId;
let testimonialId;
let faqId;
let applicationId;
let messageId;

beforeAll(async () => {
  await prisma.application.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.group.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.admin.deleteMany();

  await prisma.admin.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
    },
  });

  agent = request.agent(app);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('public API', () => {
  it('reports health', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('protects admin endpoints', async () => {
    const response = await request(app).get('/api/admin/courses').expect(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects invalid login credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs an admin in and returns the current user', async () => {
    const response = await agent
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    expect(response.body.user.email).toBe(ADMIN_EMAIL);

    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user.email).toBe(ADMIN_EMAIL);
  });
});

describe('admin course CRUD', () => {
  it('creates a course', async () => {
    const response = await agent.post('/api/admin/courses').send(coursePayload).expect(201);
    courseId = response.body.id;
    expect(response.body.slug).toBe(coursePayload.slug);
    expect(response.body.lessonsPerWeek).toBe(3);
    expect(response.body.startDate).toBeTruthy();
    expect(response.body.name_uz).toBe(coursePayload.name_uz);
  });

  it('lists admin courses with camelCase operational fields', async () => {
    const response = await agent.get('/api/admin/courses').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].lessonsPerWeek).toBe(3);
    expect(response.body[0]).not.toHaveProperty('lessons_per_week');
  });

  it('returns localized public course summaries', async () => {
    const response = await request(app).get('/api/courses?lang=en').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe(coursePayload.name_en);
    expect(response.body[0]).not.toHaveProperty('name_uz');
  });

  it('falls back to Uzbek for missing translations', async () => {
    const response = await request(app).get('/api/courses?lang=ru').expect(200);
    expect(response.body[0].name).toBe(coursePayload.name_ru);
  });

  it('returns course details by slug', async () => {
    const response = await request(app).get('/api/courses/api-test-course?lang=uz').expect(200);
    expect(response.body.curriculum).toContain('Kirish');
    expect(Array.isArray(response.body.groups)).toBe(true);
    expect(Array.isArray(response.body.teachers)).toBe(true);
  });

  it('returns 404 for unknown course slugs', async () => {
    const response = await request(app).get('/api/courses/missing-course').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('updates a course', async () => {
    const response = await agent
      .patch(`/api/admin/courses/${courseId}`)
      .send({ ...coursePayload, price: 990000, name_en: 'Updated API course' })
      .expect(200);
    expect(response.body.price).toBe(990000);
    expect(response.body.name_en).toBe('Updated API course');
  });

  it('validates corrupted course payloads', async () => {
    const response = await agent
      .post('/api/admin/courses')
      .send({ ...coursePayload, slug: 'INVALID SLUG', price: -5 })
      .expect(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('teacher, group and content CRUD', () => {
  it('creates a teacher linked to the course', async () => {
    const response = await agent
      .post('/api/admin/teachers')
      .send({
        name: 'API Teacher',
        photo: null,
        specialization_uz: 'Ingliz tili',
        specialization_ru: 'Английский язык',
        specialization_en: 'English',
        experienceYears: 5,
        bio_uz: 'Sinov o‘qituvchisi',
        bio_ru: 'Тестовый преподаватель',
        bio_en: 'Test teacher',
        courseIds: [courseId],
      })
      .expect(201);
    teacherId = response.body.id;
    expect(response.body.experienceYears).toBe(5);
    expect(response.body.courseIds).toEqual([courseId]);
  });

  it('creates a group and exposes a readable admin shape', async () => {
    const response = await agent
      .post('/api/admin/groups')
      .send({
        courseId,
        teacherId,
        days: ['mon', 'wed'],
        time: '18:00–19:30',
        capacity: 12,
        enrolledCount: 2,
        level_uz: 'Boshlang‘ich',
        level_ru: 'Начальный',
        level_en: 'Beginner',
        startDate: '2026-12-05',
        status: 'open',
      })
      .expect(201);
    groupId = response.body.id;
    expect(response.body.days).toEqual(['mon', 'wed']);
    expect(response.body.course.id).toBe(courseId);
    expect(response.body.teacher.id).toBe(teacherId);
    expect(response.body.activeApplications).toBe(0);
  });

  it('updates a group', async () => {
    const response = await agent
      .patch(`/api/admin/groups/${groupId}`)
      .send({
        courseId,
        teacherId,
        days: ['tue', 'thu'],
        time: '19:00–20:30',
        capacity: 14,
        enrolledCount: 2,
        level_uz: 'Boshlang‘ich',
        level_ru: 'Начальный',
        level_en: 'Beginner',
        startDate: '2026-12-05',
        status: 'open',
      })
      .expect(200);
    expect(response.body.capacity).toBe(14);
    expect(response.body.days).toEqual(['tue', 'thu']);
  });

  it('creates and updates testimonials', async () => {
    const created = await agent
      .post('/api/admin/testimonials')
      .send({
        author: 'API Student',
        text_uz: 'Zo‘r markaz',
        text_ru: 'Отличный центр',
        text_en: 'Great center',
        rating: 5,
        photo: null,
      })
      .expect(201);
    testimonialId = created.body.id;
    expect(created.body.text_uz).toBe('Zo‘r markaz');

    const updated = await agent
      .patch(`/api/admin/testimonials/${testimonialId}`)
      .send({
        author: 'API Student',
        text_uz: 'Juda zo‘r markaz',
        text_ru: 'Отличный центр',
        text_en: 'Great center',
        rating: 4,
        photo: null,
      })
      .expect(200);
    expect(updated.body.rating).toBe(4);
    expect(updated.body.text_uz).toBe('Juda zo‘r markaz');
  });

  it('creates and updates FAQ items', async () => {
    const created = await agent
      .post('/api/admin/faq')
      .send({
        question_uz: 'API savol?',
        question_ru: 'Вопрос API?',
        question_en: 'API question?',
        answer_uz: 'API javob.',
        answer_ru: 'Ответ API.',
        answer_en: 'API answer.',
        order: 99,
      })
      .expect(201);
    faqId = created.body.id;
    expect(created.body.question_uz).toBe('API savol?');

    const updated = await agent
      .patch(`/api/admin/faq/${faqId}`)
      .send({
        question_uz: 'Yangilangan savol?',
        question_ru: 'Вопрос API?',
        question_en: 'API question?',
        answer_uz: 'API javob.',
        answer_ru: 'Ответ API.',
        answer_en: 'API answer.',
        order: 100,
      })
      .expect(200);
    expect(updated.body.order).toBe(100);
    expect(updated.body.question_uz).toBe('Yangilangan savol?');
  });

  it('returns localized public teacher data', async () => {
    const list = await request(app).get('/api/teachers?lang=en').expect(200);
    expect(list.body.some((teacher) => teacher.name === 'API Teacher')).toBe(true);

    const detail = await request(app).get(`/api/teachers/${teacherId}?lang=en`).expect(200);
    expect(detail.body.specialization).toBe('English');
  });
});

describe('applications and messages', () => {
  it('accepts a public enrollment application', async () => {
    const response = await request(app)
      .post('/api/applications')
      .send({
        firstName: 'Api',
        lastName: 'Tester',
        phone: '+998 90 111 22 33',
        courseId,
        groupId,
        ageOrLevel: '20',
        comment: 'Automated test',
        preferredLanguage: 'en',
      })
      .expect(201);
    applicationId = response.body.id;
    expect(response.body.status).toBe('new');
    expect(response.body.createdAt).toBeTruthy();

    const course = await request(app).get('/api/courses/api-test-course?lang=uz').expect(200);
    const group = course.body.groups.find((item) => item.id === groupId);
    expect(group.seatsLeft).toBe(11);
  });

  it('rejects invalid applications', async () => {
    const response = await request(app)
      .post('/api/applications')
      .send({ firstName: 'A', lastName: 'B', phone: '123', courseId })
      .expect(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lists applications for the admin and updates status', async () => {
    const list = await agent.get('/api/admin/applications').expect(200);
    expect(list.body.some((item) => item.id === applicationId)).toBe(true);

    const response = await agent
      .patch(`/api/admin/applications/${applicationId}`)
      .send({ status: 'contacted' })
      .expect(200);
    expect(response.body.status).toBe('contacted');
  });

  it('accepts a contact message and exposes it in the admin panel', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({
        name: 'API tester',
        email: 'tester@example.com',
        text: 'This is an automated message.',
        language: 'en',
      })
      .expect(201);
    messageId = response.body.id;

    const list = await agent.get('/api/admin/messages').expect(200);
    const message = list.body.find((item) => item.id === messageId);
    expect(message).toBeTruthy();
    expect(message.isRead).toBe(false);
  });

  it('marks messages as read', async () => {
    const response = await agent
      .patch(`/api/admin/messages/${messageId}`)
      .send({ isRead: true })
      .expect(200);
    expect(response.body.isRead).toBe(true);
  });

  it('returns dashboard statistics', async () => {
    const response = await agent.get('/api/admin/stats').expect(200);
    expect(response.body.totalCourses).toBe(1);
    expect(response.body.newApplications).toBe(0);
    expect(response.body.applicationsByStatus.contacted).toBe(1);
  });
});

describe('cleanup', () => {
  it('deletes test records through the admin API', async () => {
    await agent.delete(`/api/admin/applications/${applicationId}`).expect(200);
    await agent.delete(`/api/admin/messages/${messageId}`).expect(200);
    await agent.delete(`/api/admin/groups/${groupId}`).expect(200);
    await agent.delete(`/api/admin/teachers/${teacherId}`).expect(200);
    await agent.delete(`/api/admin/testimonials/${testimonialId}`).expect(200);
    await agent.delete(`/api/admin/faq/${faqId}`).expect(200);
    await agent.delete(`/api/admin/courses/${courseId}`).expect(200);

    const courses = await request(app).get('/api/courses').expect(200);
    expect(courses.body).toHaveLength(0);
  });

  it('logs out', async () => {
    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});

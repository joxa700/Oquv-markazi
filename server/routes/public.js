import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { publicPostRateLimit } from '../middleware/rateLimits.js';
import { validateBody } from '../middleware/validate.js';
import { applicationSchema, contactMessageSchema } from '../validation/schemas.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { notifyNewApplication } from '../utils/telegram.js';
import {
  getLang,
  localizeField,
  serializeCourseDetail,
  serializeCourseSummary,
  serializeFaq,
  serializeGroupPublic,
  serializeTeacher,
  serializeTestimonial,
} from '../utils/serialize.js';

const router = Router();

const groupCountQuery = {
  _count: {
    select: {
      applications: { where: { status: { not: 'rejected' } } },
    },
  },
};

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const category = String(req.query.category || '');
    const courses = await prisma.course.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    res.json(courses.map((course) => serializeCourseSummary(course, lang)));
  }),
);

router.get(
  '/courses/:slug',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: {
        teachers: true,
        groups: {
          include: {
            teacher: true,
            ...groupCountQuery,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!course) throw new AppError('NOT_FOUND', 404);
    res.json(serializeCourseDetail(course, lang));
  }),
);

router.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const teachers = await prisma.teacher.findMany({
      include: { courses: true },
      orderBy: { experienceYears: 'desc' },
    });
    res.json(teachers.map((teacher) => serializeTeacher(teacher, lang)));
  }),
);

router.get(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new AppError('NOT_FOUND', 404);
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { courses: true },
    });
    if (!teacher) throw new AppError('NOT_FOUND', 404);
    res.json(serializeTeacher(teacher, lang));
  }),
);

router.get(
  '/groups',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const where = {};
    const courseId = Number(req.query.courseId);
    if (Number.isInteger(courseId) && courseId > 0) where.courseId = courseId;
    if (req.query.status && ['open', 'full', 'soon'].includes(String(req.query.status))) {
      where.status = String(req.query.status);
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        course: true,
        teacher: true,
        ...groupCountQuery,
      },
      orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
    });
    res.json(groups.map((group) => serializeGroupPublic(group, lang)));
  }),
);

router.get(
  '/testimonials',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    res.json(testimonials.map((testimonial) => serializeTestimonial(testimonial, lang)));
  }),
);

router.get(
  '/faq',
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    const items = await prisma.faqItem.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    res.json(items.map((item) => serializeFaq(item, lang)));
  }),
);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [courses, teachers, groups, enrolled, acceptedApplications] = await Promise.all([
      prisma.course.count(),
      prisma.teacher.count(),
      prisma.group.count(),
      prisma.group.aggregate({ _sum: { enrolledCount: true } }),
      prisma.application.count({ where: { status: 'accepted' } }),
    ]);
    res.json({
      courses,
      teachers,
      groups,
      students: enrolled._sum.enrolledCount || 0,
      acceptedApplications,
    });
  }),
);

router.post(
  '/applications',
  publicPostRateLimit,
  validateBody(applicationSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;

    const application = await runWithRetry(() =>
      prisma.$transaction(async (tx) => {
        const course = await tx.course.findUnique({ where: { id: data.courseId } });
        if (!course) throw new AppError('NOT_FOUND', 404);

        let group = null;
        if (data.groupId) {
          group = await tx.group.findUnique({ where: { id: data.groupId } });
          if (!group || group.courseId !== course.id) {
            throw new AppError('GROUP_NOT_FOUND', 404);
          }
          const activeApplications = await tx.application.count({
            where: { groupId: group.id, status: { not: 'rejected' } },
          });
          const seatsLeft = group.capacity - group.enrolledCount - activeApplications;
          if (group.status === 'full' || seatsLeft <= 0) {
            throw new AppError('GROUP_FULL', 409);
          }
        }

        return tx.application.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            courseId: data.courseId,
            groupId: data.groupId || null,
            ageOrLevel: data.ageOrLevel,
            comment: data.comment,
            preferredLanguage: data.preferredLanguage,
            status: 'new',
          },
        });
      }),
    );

    const courseName = localizeField(
      await prisma.course.findUnique({ where: { id: application.courseId } }),
      'name',
      application.preferredLanguage,
    );
    notifyNewApplication(application, courseName);

    res.status(201).json({
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
    });
  }),
);

router.post(
  '/messages',
  publicPostRateLimit,
  validateBody(contactMessageSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        text: data.text,
        language: data.language,
      },
    });
    res.status(201).json({ id: message.id, createdAt: message.createdAt });
  }),
);

async function runWithRetry(operation, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error?.code !== 'P2034') throw error;
    }
  }
  throw lastError;
}

export default router;

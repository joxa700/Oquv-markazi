import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../utils/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { uploadImage } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import {
  applicationStatusSchema,
  courseSchema,
  faqSchema,
  groupSchema,
  messageReadSchema,
  teacherSchema,
  testimonialSchema,
} from '../validation/schemas.js';
import {
  serializeApplicationAdmin,
  serializeCourseAdmin,
  serializeFaqAdmin,
  serializeGroupAdmin,
  serializeTeacherAdmin,
  serializeTestimonialAdmin,
} from '../utils/serialize.js';

const router = Router();
router.use(requireAdmin);

const groupInclude = {
  course: { select: { id: true, nameUz: true, nameRu: true, nameEn: true } },
  teacher: { select: { id: true, name: true } },
  _count: { select: { applications: { where: { status: { not: 'rejected' } } } } },
};

function courseWriteData(body, isUpdate = false) {
  return {
    slug: body.slug,
    nameUz: body.name_uz,
    nameRu: body.name_ru,
    nameEn: body.name_en,
    descriptionUz: body.description_uz,
    descriptionRu: body.description_ru,
    descriptionEn: body.description_en,
    curriculumUz: body.curriculum_uz,
    curriculumRu: body.curriculum_ru,
    curriculumEn: body.curriculum_en,
    category: body.category,
    price: body.price,
    durationUz: body.duration_uz,
    durationRu: body.duration_ru,
    durationEn: body.duration_en,
    lessonsPerWeek: body.lessonsPerWeek,
    startDate: body.startDate,
    targetAudienceUz: body.targetAudience_uz,
    targetAudienceRu: body.targetAudience_ru,
    targetAudienceEn: body.targetAudience_en,
    requiredLevelUz: body.requiredLevel_uz,
    requiredLevelRu: body.requiredLevel_ru,
    requiredLevelEn: body.requiredLevel_en,
    paymentTermsUz: body.paymentTerms_uz,
    paymentTermsRu: body.paymentTerms_ru,
    paymentTermsEn: body.paymentTerms_en,
    image: body.image,
    teachers: isUpdate
      ? { set: body.teacherIds.map((id) => ({ id })) }
      : { connect: body.teacherIds.map((id) => ({ id })) },
  };
}

function teacherWriteData(body, isUpdate = false) {
  return {
    name: body.name,
    photo: body.photo,
    specializationUz: body.specialization_uz,
    specializationRu: body.specialization_ru,
    specializationEn: body.specialization_en,
    experienceYears: body.experienceYears,
    bioUz: body.bio_uz,
    bioRu: body.bio_ru,
    bioEn: body.bio_en,
    courses: isUpdate
      ? { set: body.courseIds.map((id) => ({ id })) }
      : { connect: body.courseIds.map((id) => ({ id })) },
  };
}

function groupWriteData(body) {
  return {
    courseId: body.courseId,
    teacherId: body.teacherId || null,
    days: JSON.stringify(body.days),
    time: body.time,
    capacity: body.capacity,
    enrolledCount: body.enrolledCount,
    levelUz: body.level_uz,
    levelRu: body.level_ru,
    levelEn: body.level_en,
    startDate: body.startDate,
    status: body.status,
  };
}

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [totalCourses, totalTeachers, totalStudents, newApplications, grouped, latest] =
      await Promise.all([
        prisma.course.count(),
        prisma.teacher.count(),
        prisma.application.count({ where: { status: 'accepted' } }),
        prisma.application.count({ where: { status: 'new' } }),
        prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.application.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: { course: true, group: true },
        }),
      ]);

    const applicationsByStatus = { new: 0, contacted: 0, accepted: 0, rejected: 0 };
    grouped.forEach((entry) => {
      applicationsByStatus[entry.status] = entry._count._all;
    });

    res.json({
      totalCourses,
      totalTeachers,
      totalStudents,
      newApplications,
      applicationsByStatus,
      latestApplications: latest.map(serializeApplicationAdmin),
    });
  }),
);

router.post(
  '/upload',
  uploadImage.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('VALIDATION_ERROR', 422, { image: 'REQUIRED' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  }),
);

router.get(
  '/courses',
  asyncHandler(async (_req, res) => {
    const courses = await prisma.course.findMany({
      include: { teachers: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(courses.map(serializeCourseAdmin));
  }),
);

router.post(
  '/courses',
  validateBody(courseSchema),
  asyncHandler(async (req, res) => {
    const course = await prisma.course.create({
      data: courseWriteData(req.body, false),
      include: { teachers: { select: { id: true } } },
    });
    res.status(201).json(serializeCourseAdmin(course));
  }),
);

router.patch(
  '/courses/:id',
  validateBody(courseSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const course = await prisma.course.update({
      where: { id },
      data: courseWriteData(req.body, true),
      include: { teachers: { select: { id: true } } },
    });
    res.json(serializeCourseAdmin(course));
  }),
);

router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    await prisma.course.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/teachers',
  asyncHandler(async (_req, res) => {
    const teachers = await prisma.teacher.findMany({
      include: { courses: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(teachers.map(serializeTeacherAdmin));
  }),
);

router.post(
  '/teachers',
  validateBody(teacherSchema),
  asyncHandler(async (req, res) => {
    const teacher = await prisma.teacher.create({
      data: teacherWriteData(req.body, false),
      include: { courses: { select: { id: true } } },
    });
    res.status(201).json(serializeTeacherAdmin(teacher));
  }),
);

router.patch(
  '/teachers/:id',
  validateBody(teacherSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.teacher.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const teacher = await prisma.teacher.update({
      where: { id },
      data: teacherWriteData(req.body, true),
      include: { courses: { select: { id: true } } },
    });
    res.json(serializeTeacherAdmin(teacher));
  }),
);

router.delete(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    await prisma.teacher.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/groups',
  asyncHandler(async (_req, res) => {
    const groups = await prisma.group.findMany({
      include: groupInclude,
      orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
    });
    res.json(groups.map(serializeGroupAdmin));
  }),
);

router.post(
  '/groups',
  validateBody(groupSchema),
  asyncHandler(async (req, res) => {
    const group = await prisma.group.create({
      data: groupWriteData(req.body),
      include: groupInclude,
    });
    res.status(201).json(serializeGroupAdmin(group));
  }),
);

router.patch(
  '/groups/:id',
  validateBody(groupSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.group.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const group = await prisma.group.update({
      where: { id },
      data: groupWriteData(req.body),
      include: groupInclude,
    });
    res.json(serializeGroupAdmin(group));
  }),
);

router.delete(
  '/groups/:id',
  asyncHandler(async (req, res) => {
    await prisma.group.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/applications',
  asyncHandler(async (req, res) => {
    const where = {};
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '');
    const courseId = Number(req.query.courseId);
    const dateFrom = String(req.query.dateFrom || '');
    const dateTo = String(req.query.dateTo || '');

    if (status && !['new', 'contacted', 'accepted', 'rejected'].includes(status)) {
      throw new AppError('VALIDATION_ERROR', 422, { status: 'INVALID' });
    }
    if (status) where.status = status;
    if (Number.isInteger(courseId) && courseId > 0) where.courseId = courseId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00.000Z`);
        if (Number.isNaN(from.getTime())) throw new AppError('VALIDATION_ERROR', 422, { dateFrom: 'INVALID_DATE' });
        where.createdAt.gte = from;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999Z`);
        if (Number.isNaN(to.getTime())) throw new AppError('VALIDATION_ERROR', 422, { dateTo: 'INVALID_DATE' });
        where.createdAt.lte = to;
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: { course: true, group: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
    res.json(applications.map(serializeApplicationAdmin));
  }),
);

router.get(
  '/applications/:id',
  asyncHandler(async (req, res) => {
    const application = await prisma.application.findUnique({
      where: { id: Number(req.params.id) },
      include: { course: true, group: true },
    });
    if (!application) throw new AppError('NOT_FOUND', 404);
    res.json(serializeApplicationAdmin(application));
  }),
);

router.patch(
  '/applications/:id',
  validateBody(applicationStatusSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) throw new AppError('NOT_FOUND', 404);

    if (
      application.status === 'rejected' &&
      req.body.status !== 'rejected' &&
      application.groupId
    ) {
      const group = await prisma.group.findUnique({ where: { id: application.groupId } });
      if (!group) throw new AppError('GROUP_NOT_FOUND', 404);
      const activeApplications = await prisma.application.count({
        where: {
          groupId: group.id,
          status: { not: 'rejected' },
          id: { not: application.id },
        },
      });
      const seatsLeft = group.capacity - group.enrolledCount - activeApplications;
      if (group.status === 'full' || seatsLeft <= 0) {
        throw new AppError('GROUP_FULL', 409);
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: req.body.status },
      include: { course: true, group: true },
    });
    res.json(serializeApplicationAdmin(updated));
  }),
);

router.delete(
  '/applications/:id',
  asyncHandler(async (req, res) => {
    await prisma.application.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(testimonials.map(serializeTestimonialAdmin));
  }),
);

router.post(
  '/testimonials',
  validateBody(testimonialSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const testimonial = await prisma.testimonial.create({
      data: {
        author: data.author,
        textUz: data.text_uz,
        textRu: data.text_ru,
        textEn: data.text_en,
        rating: data.rating,
        photo: data.photo,
      },
    });
    res.status(201).json(serializeTestimonialAdmin(testimonial));
  }),
);

router.patch(
  '/testimonials/:id',
  validateBody(testimonialSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        author: data.author,
        textUz: data.text_uz,
        textRu: data.text_ru,
        textEn: data.text_en,
        rating: data.rating,
        photo: data.photo,
      },
    });
    res.json(serializeTestimonialAdmin(testimonial));
  }),
);

router.delete(
  '/testimonials/:id',
  asyncHandler(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/faq',
  asyncHandler(async (_req, res) => {
    const items = await prisma.faqItem.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
    res.json(items.map(serializeFaqAdmin));
  }),
);

router.post(
  '/faq',
  validateBody(faqSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const item = await prisma.faqItem.create({
      data: {
        questionUz: data.question_uz,
        questionRu: data.question_ru,
        questionEn: data.question_en,
        answerUz: data.answer_uz,
        answerRu: data.answer_ru,
        answerEn: data.answer_en,
        order: data.order,
      },
    });
    res.status(201).json(serializeFaqAdmin(item));
  }),
);

router.patch(
  '/faq/:id',
  validateBody(faqSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        questionUz: data.question_uz,
        questionRu: data.question_ru,
        questionEn: data.question_en,
        answerUz: data.answer_uz,
        answerRu: data.answer_ru,
        answerEn: data.answer_en,
        order: data.order,
      },
    });
    res.json(serializeFaqAdmin(item));
  }),
);

router.delete(
  '/faq/:id',
  asyncHandler(async (req, res) => {
    await prisma.faqItem.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

router.get(
  '/messages',
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  }),
);

router.patch(
  '/messages/:id',
  validateBody(messageReadSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 404);
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: req.body.isRead },
    });
    res.json(message);
  }),
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  }),
);

export default router;

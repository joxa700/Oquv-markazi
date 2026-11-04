import { z } from 'zod';
import { LANGUAGE_CODES } from '../../shared/languages.js';
import { isValidUzPhone, normalizeUzPhone } from '../../shared/phone.js';

const CATEGORY_KEYS = ['english', 'it', 'math', 'russian'];
const APPLICATION_STATUSES = ['new', 'contacted', 'accepted', 'rejected'];
const GROUP_STATUSES = ['open', 'full', 'soon'];
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const LEVELS = ['beginner', 'elementary', 'preIntermediate', 'intermediate', 'upperIntermediate', 'advanced'];

const requiredText = (max = 5000) =>
  z.string().trim().min(1, 'REQUIRED').max(max, 'MAX_LENGTH');

const optionalText = (max = 5000) =>
  z
    .string()
    .trim()
    .max(max, 'MAX_LENGTH')
    .optional()
    .nullable()
    .transform((value) => value || null);

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => isValidUzPhone(value), 'INVALID_PHONE')
  .transform((value) => normalizeUzPhone(value));

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || '')
  .refine((value) => !value || isValidUzPhone(value), 'INVALID_PHONE')
  .transform((value) => (value ? normalizeUzPhone(value) : null));

const emailSchema = z
  .string()
  .trim()
  .max(160, 'MAX_LENGTH')
  .email('INVALID_EMAIL');

const optionalEmailSchema = z
  .string()
  .trim()
  .max(160, 'MAX_LENGTH')
  .optional()
  .nullable()
  .transform((value) => value || '')
  .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), 'INVALID_EMAIL')
  .transform((value) => value || null);

const slugSchema = z
  .string()
  .trim()
  .min(2, 'MIN_LENGTH')
  .max(120, 'MAX_LENGTH')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'INVALID');

const imageSchema = z
  .string()
  .trim()
  .max(500, 'MAX_LENGTH')
  .optional()
  .nullable()
  .transform((value) => value || null);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'MIN_LENGTH').max(200, 'MAX_LENGTH'),
});

export const applicationSchema = z.object({
  firstName: requiredText(60).pipe(z.string().min(2, 'MIN_LENGTH')),
  lastName: requiredText(60).pipe(z.string().min(2, 'MIN_LENGTH')),
  phone: phoneSchema,
  courseId: z.coerce.number().int().positive('REQUIRED'),
  groupId: z.coerce.number().int().positive().nullish(),
  ageOrLevel: optionalText(80),
  comment: optionalText(1000),
  preferredLanguage: z.enum(LANGUAGE_CODES, { message: 'INVALID' }).default('uz'),
});

export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2, 'MIN_LENGTH').max(80, 'MAX_LENGTH'),
    phone: optionalPhoneSchema,
    email: optionalEmailSchema,
    text: z.string().trim().min(5, 'MIN_LENGTH').max(2000, 'MAX_LENGTH'),
    language: z.enum(LANGUAGE_CODES, { message: 'INVALID' }).default('uz'),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: 'CONTACT_REQUIRED',
    path: ['phone'],
  });

const courseBaseSchema = z.object({
  slug: slugSchema,
  name_uz: requiredText(160),
  name_ru: optionalText(160),
  name_en: optionalText(160),
  description_uz: requiredText(5000),
  description_ru: optionalText(5000),
  description_en: optionalText(5000),
  curriculum_uz: requiredText(10000),
  curriculum_ru: optionalText(10000),
  curriculum_en: optionalText(10000),
  category: z.enum(CATEGORY_KEYS, { message: 'INVALID' }),
  price: z.coerce.number().int('INVALID_NUMBER').min(0, 'INVALID_NUMBER').max(1000000000, 'INVALID_NUMBER'),
  duration_uz: requiredText(120),
  duration_ru: optionalText(120),
  duration_en: optionalText(120),
  lessonsPerWeek: z.coerce.number().int('INVALID_NUMBER').min(1, 'INVALID_NUMBER').max(14, 'INVALID_NUMBER'),
  startDate: z.coerce.date({ message: 'INVALID_DATE' }),
  targetAudience_uz: requiredText(1000),
  targetAudience_ru: optionalText(1000),
  targetAudience_en: optionalText(1000),
  requiredLevel_uz: requiredText(200),
  requiredLevel_ru: optionalText(200),
  requiredLevel_en: optionalText(200),
  paymentTerms_uz: requiredText(2000),
  paymentTerms_ru: optionalText(2000),
  paymentTerms_en: optionalText(2000),
  image: imageSchema,
  teacherIds: z.array(z.coerce.number().int().positive()).max(60).optional().default([]),
});

export const courseSchema = courseBaseSchema;

export const teacherSchema = z.object({
  name: z.string().trim().min(2, 'MIN_LENGTH').max(120, 'MAX_LENGTH'),
  photo: imageSchema,
  specialization_uz: requiredText(160),
  specialization_ru: optionalText(160),
  specialization_en: optionalText(160),
  experienceYears: z.coerce.number().int('INVALID_NUMBER').min(0, 'INVALID_NUMBER').max(60, 'INVALID_NUMBER'),
  bio_uz: requiredText(5000),
  bio_ru: optionalText(5000),
  bio_en: optionalText(5000),
  courseIds: z.array(z.coerce.number().int().positive()).max(60).optional().default([]),
});

export const groupSchema = z
  .object({
    courseId: z.coerce.number().int().positive('REQUIRED'),
    teacherId: z.coerce.number().int().positive().nullish(),
    days: z.array(z.enum(WEEKDAYS, { message: 'INVALID' })).min(1, 'REQUIRED').max(7, 'INVALID'),
    time: z.string().trim().min(3, 'MIN_LENGTH').max(40, 'MAX_LENGTH'),
    capacity: z.coerce.number().int('INVALID_NUMBER').min(1, 'INVALID_NUMBER').max(500, 'INVALID_NUMBER'),
    enrolledCount: z.coerce.number().int('INVALID_NUMBER').min(0, 'INVALID_NUMBER').max(500, 'INVALID_NUMBER'),
    level_uz: requiredText(120),
    level_ru: optionalText(120),
    level_en: optionalText(120),
    startDate: z.coerce.date({ message: 'INVALID_DATE' }),
    status: z.enum(GROUP_STATUSES, { message: 'INVALID' }),
  })
  .refine((data) => data.enrolledCount <= data.capacity, {
    message: 'INVALID',
    path: ['enrolledCount'],
  });

export const testimonialSchema = z.object({
  author: z.string().trim().min(2, 'MIN_LENGTH').max(120, 'MAX_LENGTH'),
  text_uz: requiredText(2000),
  text_ru: optionalText(2000),
  text_en: optionalText(2000),
  rating: z.coerce.number().int('INVALID_NUMBER').min(1, 'INVALID_NUMBER').max(5, 'INVALID_NUMBER'),
  photo: imageSchema,
});

export const faqSchema = z.object({
  question_uz: requiredText(500),
  question_ru: optionalText(500),
  question_en: optionalText(500),
  answer_uz: requiredText(5000),
  answer_ru: optionalText(5000),
  answer_en: optionalText(5000),
  order: z.coerce.number().int('INVALID_NUMBER').min(0, 'INVALID_NUMBER').max(100000, 'INVALID_NUMBER'),
});

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES, { message: 'INVALID' }),
});

export const messageReadSchema = z.object({
  isRead: z.boolean({ message: 'INVALID' }),
});

export {
  CATEGORY_KEYS,
  APPLICATION_STATUSES,
  GROUP_STATUSES,
  WEEKDAYS,
  LEVELS,
};

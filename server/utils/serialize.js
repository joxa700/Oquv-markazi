import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages.js';

export function getLang(req) {
  const requested = String(req.query.lang || '').toLowerCase();
  return isSupportedLanguage(requested) ? requested : DEFAULT_LANGUAGE;
}

export function localizeField(entity, field, lang) {
  if (!entity) return '';
  const capitalized = lang === 'uz' ? 'Uz' : lang === 'ru' ? 'Ru' : 'En';
  return entity[`${field}${capitalized}`] || entity[`${field}Uz`] || '';
}

export function parseDays(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value || '')
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean);
  }
}

export function getGroupMetrics(group) {
  const activeApplications = group._count?.applications ?? 0;
  const seatsLeft = Math.max(0, group.capacity - group.enrolledCount - activeApplications);
  let status = group.status;
  if (status !== 'soon') {
    if (status === 'full' || seatsLeft <= 0) status = 'full';
    else status = 'open';
  }
  return { activeApplications, seatsLeft, effectiveStatus: status };
}

export function serializeCourseSummary(course, lang) {
  return {
    id: course.id,
    slug: course.slug,
    name: localizeField(course, 'name', lang),
    description: localizeField(course, 'description', lang),
    category: course.category,
    price: course.price,
    duration: localizeField(course, 'duration', lang),
    lessonsPerWeek: course.lessonsPerWeek,
    startDate: course.startDate,
    image: course.image,
  };
}

export function serializeCourseDetail(course, lang) {
  return {
    ...serializeCourseSummary(course, lang),
    curriculum: localizeField(course, 'curriculum', lang),
    targetAudience: localizeField(course, 'targetAudience', lang),
    requiredLevel: localizeField(course, 'requiredLevel', lang),
    paymentTerms: localizeField(course, 'paymentTerms', lang),
    teachers: (course.teachers || []).map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      photo: teacher.photo,
      specialization: localizeField(teacher, 'specialization', lang),
      experienceYears: teacher.experienceYears,
      bio: localizeField(teacher, 'bio', lang),
    })),
    groups: (course.groups || []).map((group) => serializeGroupPublic(group, lang)),
  };
}

export function serializeTeacher(teacher, lang, includeCourses = true) {
  const serialized = {
    id: teacher.id,
    name: teacher.name,
    photo: teacher.photo,
    specialization: localizeField(teacher, 'specialization', lang),
    experienceYears: teacher.experienceYears,
    bio: localizeField(teacher, 'bio', lang),
  };
  if (includeCourses) {
    serialized.courses = (teacher.courses || []).map((course) => ({
      id: course.id,
      slug: course.slug,
      name: localizeField(course, 'name', lang),
      category: course.category,
    }));
  }
  return serialized;
}

export function serializeGroupPublic(group, lang) {
  const { seatsLeft, effectiveStatus, activeApplications } = getGroupMetrics(group);
  return {
    id: group.id,
    course: group.course
      ? {
          id: group.course.id,
          slug: group.course.slug,
          name: localizeField(group.course, 'name', lang),
        }
      : null,
    teacher: group.teacher
      ? {
          id: group.teacher.id,
          name: group.teacher.name,
          photo: group.teacher.photo,
          specialization: localizeField(group.teacher, 'specialization', lang),
        }
      : null,
    days: parseDays(group.days),
    time: group.time,
    capacity: group.capacity,
    enrolledCount: group.enrolledCount,
    activeApplications,
    seatsLeft,
    level: localizeField(group, 'level', lang),
    startDate: group.startDate,
    status: effectiveStatus,
  };
}

export function serializeTestimonial(testimonial, lang) {
  return {
    id: testimonial.id,
    author: testimonial.author,
    text: localizeField(testimonial, 'text', lang),
    rating: testimonial.rating,
    photo: testimonial.photo,
  };
}

export function serializeFaq(item, lang) {
  return {
    id: item.id,
    question: localizeField(item, 'question', lang),
    answer: localizeField(item, 'answer', lang),
    order: item.order,
  };
}

const courseTranslationMap = {
  nameUz: 'name_uz',
  nameRu: 'name_ru',
  nameEn: 'name_en',
  descriptionUz: 'description_uz',
  descriptionRu: 'description_ru',
  descriptionEn: 'description_en',
  curriculumUz: 'curriculum_uz',
  curriculumRu: 'curriculum_ru',
  curriculumEn: 'curriculum_en',
  durationUz: 'duration_uz',
  durationRu: 'duration_ru',
  durationEn: 'duration_en',
  targetAudienceUz: 'target_audience_uz',
  targetAudienceRu: 'target_audience_ru',
  targetAudienceEn: 'target_audience_en',
  requiredLevelUz: 'required_level_uz',
  requiredLevelRu: 'required_level_ru',
  requiredLevelEn: 'required_level_en',
  paymentTermsUz: 'payment_terms_uz',
  paymentTermsRu: 'payment_terms_ru',
  paymentTermsEn: 'payment_terms_en',
};

const teacherTranslationMap = {
  specializationUz: 'specialization_uz',
  specializationRu: 'specialization_ru',
  specializationEn: 'specialization_en',
  bioUz: 'bio_uz',
  bioRu: 'bio_ru',
  bioEn: 'bio_en',
};

const groupTranslationMap = {
  levelUz: 'level_uz',
  levelRu: 'level_ru',
  levelEn: 'level_en',
};

const testimonialTranslationMap = {
  textUz: 'text_uz',
  textRu: 'text_ru',
  textEn: 'text_en',
};

const faqTranslationMap = {
  questionUz: 'question_uz',
  questionRu: 'question_ru',
  questionEn: 'question_en',
  answerUz: 'answer_uz',
  answerRu: 'answer_ru',
  answerEn: 'answer_en',
};

function mapColumnNames(entity, map, skip = []) {
  const result = {};
  Object.entries(entity).forEach(([key, value]) => {
    if (skip.includes(key)) return;
    result[map[key] || key] = value;
  });
  return result;
}

export function serializeCourseAdmin(course) {
  const { teachers, groups: _groups, applications: _applications, ...rest } = course;
  return {
    ...mapColumnNames(rest, courseTranslationMap),
    teacherIds: (teachers || []).map((teacher) => teacher.id),
  };
}

export function serializeTeacherAdmin(teacher) {
  const { courses, groups: _groups, ...rest } = teacher;
  return {
    ...mapColumnNames(rest, teacherTranslationMap),
    courseIds: (courses || []).map((course) => course.id),
  };
}

export function serializeGroupAdmin(group) {
  const { course, teacher, applications: _applications, _count, ...rest } = group;
  return {
    ...mapColumnNames(rest, groupTranslationMap),
    days: parseDays(group.days),
    course: course
      ? { id: course.id, name_uz: course.nameUz, name_ru: course.nameRu, name_en: course.nameEn }
      : null,
    teacher: teacher ? { id: teacher.id, name: teacher.name } : null,
    activeApplications: _count?.applications ?? 0,
  };
}

export function serializeTestimonialAdmin(testimonial) {
  return mapColumnNames(testimonial, testimonialTranslationMap);
}

export function serializeFaqAdmin(item) {
  return mapColumnNames(item, faqTranslationMap);
}

export function serializeApplicationAdmin(application) {
  const { course, group, ...rest } = application;
  return {
    ...rest,
    course: course
      ? {
          id: course.id,
          slug: course.slug,
          name_uz: course.nameUz,
          name_ru: course.nameRu,
          name_en: course.nameEn,
        }
      : null,
    group: group
      ? {
          id: group.id,
          time: group.time,
          days: parseDays(group.days),
          level_uz: group.levelUz,
          level_ru: group.levelRu,
          level_en: group.levelEn,
        }
      : null,
  };
}

export function adminLocalizedField(entity, field, lang) {
  if (!entity) return '';
  const value = entity[`${field}_${lang}`] || entity[`${field}_uz`];
  return value || '';
}

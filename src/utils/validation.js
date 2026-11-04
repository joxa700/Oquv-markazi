import { isValidUzPhone } from '../../shared/phone';

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

export function validateEnrollment(values, t) {
  const errors = {};
  const firstName = String(values.firstName || '').trim();
  const lastName = String(values.lastName || '').trim();

  if (!firstName) errors.firstName = t('form.firstNameRequired');
  else if (firstName.length < 2) errors.firstName = t('form.minLength', { count: 2 });
  else if (firstName.length > 60) errors.firstName = t('form.maxLength', { count: 60 });

  if (!lastName) errors.lastName = t('form.lastNameRequired');
  else if (lastName.length < 2) errors.lastName = t('form.minLength', { count: 2 });
  else if (lastName.length > 60) errors.lastName = t('form.maxLength', { count: 60 });

  if (!values.phone || !isValidUzPhone(values.phone)) {
    errors.phone = t('form.phoneInvalid');
  }

  if (!values.courseId) {
    errors.courseId = t('form.courseRequired');
  }

  if (String(values.comment || '').length > 1000) {
    errors.comment = t('form.maxLength', { count: 1000 });
  }

  if (String(values.ageOrLevel || '').length > 80) {
    errors.ageOrLevel = t('form.maxLength', { count: 80 });
  }

  return errors;
}

export function validateContact(values, t) {
  const errors = {};
  const name = String(values.name || '').trim();
  const message = String(values.message || '').trim();
  const rawPhone = String(values.phone || '').trim();
  const phone = rawPhone === '+998' ? '' : rawPhone;
  const email = String(values.email || '').trim();

  if (!name) errors.name = t('form.required');
  else if (name.length < 2) errors.name = t('form.minLength', { count: 2 });
  else if (name.length > 80) errors.name = t('form.maxLength', { count: 80 });

  if (message.length < 5) errors.message = t('form.messageRequired');
  else if (message.length > 2000) errors.message = t('form.maxLength', { count: 2000 });

  if (phone && !isValidUzPhone(phone)) errors.phone = t('form.phoneInvalid');
  if (email && !isValidEmail(email)) errors.email = t('form.emailInvalid');
  if (!phone && !email) errors.phone = t('contact.contactRequired');

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

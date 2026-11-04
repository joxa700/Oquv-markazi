import { describe, expect, it } from 'vitest';
import { hasErrors, isValidEmail, validateContact, validateEnrollment } from '../../src/utils/validation.js';

const t = (key, options = {}) => (options.count ? `${key}:${options.count}` : key);

describe('validation helpers', () => {
  it('validates email addresses', () => {
    expect(isValidEmail('student@example.com')).toBe(true);
    expect(isValidEmail('student@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('validates enrollment values', () => {
    const errors = validateEnrollment(
      { firstName: 'A', lastName: '', phone: '+99890123456', courseId: '', ageOrLevel: '', comment: '' },
      t,
    );
    expect(errors).toEqual({
      firstName: 'form.minLength:2',
      lastName: 'form.lastNameRequired',
      phone: 'form.phoneInvalid',
      courseId: 'form.courseRequired',
    });
    expect(hasErrors(errors)).toBe(true);
  });

  it('accepts a complete enrollment form', () => {
    const errors = validateEnrollment(
      { firstName: 'Ali', lastName: 'Valiyev', phone: '+998 90 123 45 67', courseId: '1', ageOrLevel: '16', comment: '' },
      t,
    );
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('requires either a phone or an email on the contact form', () => {
    const errors = validateContact({ name: 'Ali', phone: '+998', email: '', message: 'Hello there' }, t);
    expect(errors).toEqual({ phone: 'contact.contactRequired' });
  });

  it('accepts an email-only contact form with the default phone prefix', () => {
    const errors = validateContact(
      { name: 'Ali', phone: '+998', email: 'student@example.com', message: 'Hello there' },
      t,
    );
    expect(errors).toEqual({});
  });

  it('validates contact field lengths and formats', () => {
    const errors = validateContact(
      { name: 'A', phone: '+99890123456', email: 'bad-email', message: 'hi' },
      t,
    );
    expect(errors).toEqual({
      name: 'form.minLength:2',
      message: 'form.messageRequired',
      phone: 'form.phoneInvalid',
      email: 'form.emailInvalid',
    });
  });
});

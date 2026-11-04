import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatPrice,
  normalizeLanguage,
  parseCurriculum,
  toDateInputValue,
} from '../../src/utils/format.js';

describe('format helpers', () => {
  it('falls back to the default language', () => {
    expect(normalizeLanguage('ru')).toBe('ru');
    expect(normalizeLanguage('fr')).toBe('uz');
    expect(normalizeLanguage(undefined)).toBe('uz');
  });

  it('formats numbers and prices per locale', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    expect(formatNumber('not-a-number', 'en')).toBe('0');
    expect(formatPrice(750000, 'en', (key) => (key === 'common.currency' ? "so'm" : key))).toBe("750,000 so'm");
  });

  it('formats valid dates and ignores invalid input', () => {
    expect(formatDate('2026-11-03T12:00:00.000Z', 'en')).toContain('2026');
    expect(formatDate('', 'en')).toBe('');
    expect(formatDate('invalid', 'en')).toBe('');
  });

  it('converts dates for date inputs', () => {
    expect(toDateInputValue('2026-11-03T00:00:00.000Z')).toBe('2026-11-03');
    expect(toDateInputValue(null)).toBe('');
    expect(toDateInputValue('invalid')).toBe('');
  });

  it('splits curriculum lines and drops blanks', () => {
    expect(parseCurriculum('Intro\n\n Lesson 1 \r\nLesson 2 ')).toEqual(['Intro', 'Lesson 1', 'Lesson 2']);
    expect(parseCurriculum('')).toEqual([]);
  });
});

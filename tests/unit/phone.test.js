import { describe, expect, it } from 'vitest';
import {
  extractUzLocalDigits,
  formatUzPhoneDisplay,
  formatUzPhoneInput,
  isValidUzPhone,
  normalizeUzPhone,
} from '../../shared/phone.js';

describe('phone helpers', () => {
  it('extracts nine local digits from any Uzbek format', () => {
    expect(extractUzLocalDigits('+998 (90) 123-45-67')).toBe('901234567');
    expect(extractUzLocalDigits('998901234567')).toBe('901234567');
    expect(extractUzLocalDigits('90 123 45 67')).toBe('901234567');
  });

  it('formats progressive input', () => {
    expect(formatUzPhoneInput('')).toBe('+998');
    expect(formatUzPhoneInput('90')).toBe('+998 90');
    expect(formatUzPhoneInput('9012345')).toBe('+998 90 123 45');
    expect(formatUzPhoneInput('+998901234567')).toBe('+998 90 123 45 67');
  });

  it('normalizes valid numbers and rejects short ones', () => {
    expect(normalizeUzPhone('+998 90 123 45 67')).toBe('+998901234567');
    expect(normalizeUzPhone('90 123 45')).toBeNull();
    expect(isValidUzPhone('+998901234567')).toBe(true);
    expect(isValidUzPhone('+99890123456')).toBe(false);
  });

  it('formats display values', () => {
    expect(formatUzPhoneDisplay('+998901234567')).toBe('+998 90 123 45 67');
    expect(formatUzPhoneDisplay('n/a')).toBe('n/a');
  });
});

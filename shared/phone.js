export function extractUzLocalDigits(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > 9) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
}

export function formatUzPhoneInput(value) {
  const local = extractUzLocalDigits(value);
  let result = '+998';
  if (local.length > 0) result += ` ${local.slice(0, 2)}`;
  if (local.length > 2) result += ` ${local.slice(2, 5)}`;
  if (local.length > 5) result += ` ${local.slice(5, 7)}`;
  if (local.length > 7) result += ` ${local.slice(7, 9)}`;
  return result;
}

export function isValidUzPhone(value) {
  return /^\+998\d{9}$/.test(normalizeUzPhone(value) || '');
}

export function normalizeUzPhone(value) {
  const local = extractUzLocalDigits(value);
  if (local.length !== 9) return null;
  return `+998${local}`;
}

export function formatUzPhoneDisplay(value) {
  const local = extractUzLocalDigits(value);
  if (local.length !== 9) return String(value || '');
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}

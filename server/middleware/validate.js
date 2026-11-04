import { AppError } from '../utils/errors.js';

function normalizeIssueCode(issue) {
  if (issue.code === 'invalid_type' && issue.received === 'undefined') return 'REQUIRED';
  const message = String(issue.message || '');
  if (/^[A-Z][A-Z0-9_]*$/.test(message)) return message;
  if (issue.code === 'invalid_type') return 'INVALID';
  return 'INVALID';
}

export function validateBody(schema) {
  return function validationMiddleware(req, _res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] || 'form';
        if (!fields[field]) fields[field] = normalizeIssueCode(issue);
      }
      return next(new AppError('VALIDATION_ERROR', 422, fields));
    }
    req.body = result.data;
    return next();
  };
}

export function validateQuery(schema) {
  return function queryValidationMiddleware(req, _res, next) {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] || 'query';
        if (!fields[field]) fields[field] = normalizeIssueCode(issue);
      }
      return next(new AppError('VALIDATION_ERROR', 422, fields));
    }
    req.validatedQuery = result.data;
    return next();
  };
}

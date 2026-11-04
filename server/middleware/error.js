import multer from 'multer';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(_req, _res, next) {
  next(new AppError('NOT_FOUND', 404));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        fields: error.fields && Object.keys(error.fields).length ? error.fields : undefined,
      },
    });
  }

  if (error instanceof multer.MulterError) {
    const code = error.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'INVALID_FILE_TYPE';
    return res.status(400).json({ error: { code } });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR' } });
  }

  if (error?.code === 'P2002') {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : String(error.meta?.target || '');
    const code = target.includes('slug') ? 'DUPLICATE_SLUG' : 'VALIDATION_ERROR';
    return res.status(409).json({ error: { code } });
  }

  if (error?.code === 'P2025') {
    return res.status(404).json({ error: { code: 'NOT_FOUND' } });
  }

  if (error?.code === 'P2003') {
    return res.status(409).json({ error: { code: 'VALIDATION_ERROR' } });
  }

  console.error('[server] Unhandled error:', error);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR' } });
}

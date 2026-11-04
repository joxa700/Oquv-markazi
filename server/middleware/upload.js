import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { AppError } from '../utils/errors.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(currentDir, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = allowedTypes[file.mimetype];
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
      return callback(new AppError('INVALID_FILE_TYPE', 400));
    }
    return callback(null, true);
  },
});

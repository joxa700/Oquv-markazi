import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './lib/prisma.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { uploadsDir } from './middleware/upload.js';
import { siteConfig } from '../src/config/site.js';
import { LANGUAGE_CODES } from '../shared/languages.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'", 'https://www.openstreetmap.org'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
  }),
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.get(
  '/sitemap.xml',
  asyncHandlerLocal(async (_req, res) => {
    const courses = await prisma.course.findMany({ select: { slug: true, updatedAt: true } });
    const base = (process.env.PUBLIC_SITE_URL || siteConfig.siteUrl || 'https://nurtalim.example').replace(/\/$/, '');
    const pages = ['', '/courses', '/teachers', '/schedule', '/contact', '/faq', '/favorites'];
    const urls = [];

    for (const page of pages) {
      for (const lang of LANGUAGE_CODES) {
        const alternates = LANGUAGE_CODES.map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(`${base}/${alt}${page}`)}"/>`,
        ).join('\n');
        urls.push(
          `  <url>\n    <loc>${escapeXml(`${base}/${lang}${page}`)}</loc>\n${alternates}\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>`,
        );
      }
    }

    for (const course of courses) {
      const updated = course.updatedAt.toISOString();
      for (const lang of LANGUAGE_CODES) {
        const alternates = LANGUAGE_CODES.map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(`${base}/${alt}/courses/${course.slug}`)}"/>`,
        ).join('\n');
        urls.push(
          `  <url>\n    <loc>${escapeXml(`${base}/${lang}/courses/${course.slug}`)}</loc>\n${alternates}\n    <lastmod>${updated}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
        );
      }
    }

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
    );
  }),
);

const distDir = path.resolve(currentDir, '../dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1h', index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/sitemap.xml') {
      return next();
    }
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

function asyncHandlerLocal(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export default app;

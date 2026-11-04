import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../server/lib/prisma.js';
import { siteConfig } from '../src/config/site.js';
import { LANGUAGE_CODES } from '../shared/languages.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputFile = path.join(rootDir, 'public', 'sitemap.xml');
const base = (process.env.PUBLIC_SITE_URL || siteConfig.siteUrl).replace(/\/$/, '');

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function alternateLinks(pathname) {
  return LANGUAGE_CODES.map(
    (language) => `    <xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(`${base}/${language}${pathname}`)}"/>`,
  ).join('\n');
}

function urlEntry(pathname, { lastmod, priority = '0.8', changefreq = 'weekly' } = {}) {
  return LANGUAGE_CODES.map(
    (language) =>
      `  <url>\n    <loc>${escapeXml(`${base}/${language}${pathname}`)}</loc>\n${alternateLinks(pathname)}${
        lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
      }\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  ).join('\n');
}

async function getCourses() {
  try {
    return await prisma.course.findMany({ select: { slug: true, updatedAt: true } });
  } catch (error) {
    console.warn(`Sitemap: course list unavailable (${error.message}); generating static pages only.`);
    return [];
  }
}

const pages = ['', '/courses', '/teachers', '/schedule', '/contact', '/faq', '/favorites', '/privacy'];
const courses = await getCourses();
const entries = pages.map((page) => urlEntry(page, { priority: page === '' ? '1.0' : '0.8' }));

for (const course of courses) {
  entries.push(
    urlEntry(`/courses/${course.slug}`, {
      lastmod: course.updatedAt.toISOString(),
      priority: '0.7',
      changefreq: 'monthly',
    }),
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;

await fs.mkdir(path.dirname(outputFile), { recursive: true });
await fs.writeFile(outputFile, xml, 'utf8');
await prisma.$disconnect().catch(() => {});
console.log(`Sitemap written: ${path.relative(rootDir, outputFile)} (${pages.length + courses.length} routes × ${LANGUAGE_CODES.length} languages)`);

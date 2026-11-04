import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';

const port = Number(process.env.PORT || 4000);

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be configured with at least 32 characters in production.');
    process.exit(1);
  }
  if (!process.env.CLIENT_URL) {
    console.warn('CLIENT_URL is not set; CORS will allow any origin.');
  }
}

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

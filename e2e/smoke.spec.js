import { test, expect } from '@playwright/test';

test('public pages render without client errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/uz');
  await expect(page.locator('h1')).toContainText('Kelajagingizni');

  await page.goto('/uz/courses');
  await expect(page.locator('h1')).toHaveText('Kurslar');
  await expect(page.locator('.course-card').first()).toBeVisible();

  await page.goto('/uz/courses/umumiy-ingliz-tili');
  await expect(page.locator('h1')).toHaveText('Umumiy ingliz tili');

  await page.goto('/uz/teachers');
  await expect(page.locator('.teacher-card').first()).toBeVisible();

  expect(errors).toEqual([]);
});

test('admin can log in and open the dashboard', async ({ page }) => {
  await page.goto('/uz/admin/login');
  await page.locator('#admin-email').fill('admin@nurtalim.uz');
  await page.locator('#admin-password').fill('NurTalim!2026');
  await page.getByRole('button', { name: 'Kirish' }).click();

  await expect(page).toHaveURL(/\/uz\/admin$/);
  await expect(page.locator('h1')).toHaveText('Dashboard');
  await expect(page.locator('.admin-stat-grid')).toBeVisible();
});

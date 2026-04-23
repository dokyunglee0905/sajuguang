import { test, expect } from '@playwright/test';
import { setup, goToTab } from './_helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('운세: 오늘의 운세 탭 진입 및 타이틀 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');
  await expect(page.locator('text=오늘의 운세').first()).toBeVisible({ timeout: 5000 });
});

test('운세: AI 운세 콘텐츠 로드 (최대 30초)', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');

  // 이미 캐시된 경우 바로 표시
  const alreadyLoaded = await page.locator('text=종합운').isVisible({ timeout: 2000 }).catch(() => false);
  if (!alreadyLoaded) {
    const btn = page.locator('button').filter({ hasText: /오늘의 운세|운세 불러오기|다시/ }).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
    }
    await expect(page.locator('text=종합운')).toBeVisible({ timeout: 30000 });
  }
  await expect(page.locator('text=종합운')).toBeVisible();
});

test('운세: 애정운 카드 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');

  const alreadyLoaded = await page.locator('text=애정운').isVisible({ timeout: 2000 }).catch(() => false);
  if (!alreadyLoaded) {
    const btn = page.locator('button').filter({ hasText: /운세|다시/ }).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
    await expect(page.locator('text=애정운')).toBeVisible({ timeout: 30000 });
  }
  await expect(page.locator('text=애정운')).toBeVisible();
});

test('운세: 오늘의 한마디 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');

  const alreadyLoaded = await page.locator('text=오늘의 한마디').isVisible({ timeout: 2000 }).catch(() => false);
  if (!alreadyLoaded) {
    const btn = page.locator('button').filter({ hasText: /운세|다시/ }).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
    await expect(page.locator('text=오늘의 한마디')).toBeVisible({ timeout: 30000 });
  }
  await expect(page.locator('text=오늘의 한마디')).toBeVisible();
});

test('운세: 금전운 카드 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');

  const alreadyLoaded = await page.locator('text=금전운').isVisible({ timeout: 2000 }).catch(() => false);
  if (!alreadyLoaded) {
    const btn = page.locator('button').filter({ hasText: /운세|다시/ }).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
    await expect(page.locator('text=금전운')).toBeVisible({ timeout: 30000 });
  }
  await expect(page.locator('text=금전운')).toBeVisible();
});

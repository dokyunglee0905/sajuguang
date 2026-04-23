import { test, expect } from '@playwright/test';
import { setup, goToTab } from './_helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('연운: 신년·월별운세 탭 타이틀 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '신년운세');
  await expect(page.locator('text=신년·월별운세')).toBeVisible({ timeout: 5000 });
});

test('연운: 신년운세 탭 기본 선택', async ({ page }) => {
  await setup(page);
  await goToTab(page, '신년운세');
  const currentYear = new Date().getFullYear();
  await expect(page.locator(`text=${currentYear}년 운세`)).toBeVisible({ timeout: 5000 });
});

test('연운: 월별운세 탭 전환', async ({ page }) => {
  await setup(page);
  await goToTab(page, '신년운세');
  await page.locator('text=월별 운세').click();
  await expect(page.locator('text=월별 운세').first()).toBeVisible({ timeout: 5000 });
});

test('연운: 신년운세 AI 콘텐츠 로드 (최대 45초)', async ({ page }) => {
  await setup(page);
  await goToTab(page, '신년운세');

  // 자동 로드됨 — 재물운 또는 총운풀이 텍스트 대기
  await expect(page.locator('text=재물운').first()).toBeVisible({ timeout: 45000 });
});

test('연운: 월별운세 AI 콘텐츠 로드 (최대 45초)', async ({ page }) => {
  await setup(page);
  await goToTab(page, '신년운세');

  // 신년 로드 대기 (짧게)
  await expect(page.locator('text=재물운').first()).toBeVisible({ timeout: 45000 });

  // 월별 탭으로 전환
  await page.locator('text=월별 운세').click();

  // 자동 로드됨 — 이달의흐름 또는 길일 대기
  await expect(
    page.locator('text=이달의흐름').or(page.locator('text=길일').first())
  ).toBeVisible({ timeout: 45000 });
});

import { test, expect } from '@playwright/test';
import { setup } from './_helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('분석: 사주분석 페이지 진입 (홈에서 버튼)', async ({ page }) => {
  await setup(page);
  await page.locator('text=상세 사주분석 보기').click();
  await expect(page).toHaveURL('/analysis', { timeout: 5000 });
});

test('분석: AI 분석 콘텐츠 로드 (최대 60초)', async ({ page }) => {
  await setup(page);
  await page.locator('text=상세 사주분석 보기').click();
  await expect(page).toHaveURL('/analysis', { timeout: 5000 });

  // 섹션 버튼이 나타나면 콘텐츠 로드된 것 (로딩 중에는 섹션 탭이 없음)
  // 또는 카드 타이틀인 "핵심 기질" 대기
  await expect(page.locator('text=핵심 기질').first()).toBeVisible({ timeout: 60000 });
});

test('분석: 일과 적성 섹션 탭 클릭 가능', async ({ page }) => {
  await setup(page);
  await page.locator('text=상세 사주분석 보기').click();

  // 로드 완료 대기
  await expect(page.locator('text=핵심 기질').first()).toBeVisible({ timeout: 60000 });

  // 섹션 탭 클릭
  await page.locator('button').filter({ hasText: '일과 적성' }).click();
  await expect(page.locator('text=일하는 스타일').or(page.locator('text=잘 맞는 분야'))).toBeVisible({ timeout: 5000 });
});

test('분석: 홈으로 복귀 가능', async ({ page }) => {
  await setup(page);
  await page.locator('text=상세 사주분석 보기').click();
  await expect(page).toHaveURL('/analysis', { timeout: 5000 });

  await page.goBack();
  await expect(page).toHaveURL('/home', { timeout: 5000 });
});

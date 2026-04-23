import { test, expect } from '@playwright/test';
import { setup, goToTab } from './_helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('홈: 사주 원국 4기둥 표시', async ({ page }) => {
  await setup(page);
  await expect(page.locator('text=년주')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=월주')).toBeVisible();
  await expect(page.locator('text=일주')).toBeVisible();
  await expect(page.locator('text=시주')).toBeVisible();
});

test('홈: 나의 기운 카드 표시', async ({ page }) => {
  await setup(page);
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 5000 });
});

test('홈: 타고난 성향 카드 표시', async ({ page }) => {
  await setup(page);
  await expect(page.locator('text=타고난 성향')).toBeVisible({ timeout: 5000 });
});

test('홈: 오행 분포 카드 표시', async ({ page }) => {
  await setup(page);
  await expect(page.locator('text=오행 분포')).toBeVisible({ timeout: 5000 });
});

test('홈: 신강신약 표시', async ({ page }) => {
  await setup(page);
  await expect(page.locator('text=신강신약')).toBeVisible({ timeout: 5000 });
});

test('홈: 상세 사주분석 버튼으로 분석 페이지 이동', async ({ page }) => {
  await setup(page);
  await page.locator('text=상세 사주분석 보기').click();
  await expect(page).toHaveURL('/analysis', { timeout: 5000 });
});

test('홈: 다시 입력 버튼으로 온보딩 복귀', async ({ page }) => {
  await setup(page);
  await page.locator('text=다시 입력').click();
  await expect(page).toHaveURL('/', { timeout: 5000 });
});

test('홈: 이름 입력 시 이름 표시', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const nameInput = page.locator('input[placeholder="홍길동"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill('도로시');
  }

  await page.locator('input[placeholder="1990"]').fill('1990');
  await page.locator('input[placeholder="01"]').first().fill('05');
  await page.locator('input[placeholder="01"]').nth(1).fill('15');
  await page.locator('button:has-text("남성")').first().click();
  await page.locator('input[placeholder="00"]').first().fill('10');
  await page.locator('input[placeholder="00"]').nth(1).fill('00');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/home', { timeout: 10000 });

  // AdGate 통과
  const gateBtn = page.locator('text=광고 보고 무료 이용하기');
  if (await gateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gateBtn.click();
  }
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 5000 });

  await expect(page.locator('text=도로시님의 사주')).toBeVisible({ timeout: 5000 });
});

test('홈: 바텀 탭바 4개 탭 표시', async ({ page }) => {
  await setup(page);
  const nav = page.locator('nav');
  await expect(nav.locator('text=홈')).toBeVisible({ timeout: 5000 });
  await expect(nav.locator('text=오늘의 운세')).toBeVisible();
  await expect(nav.locator('text=궁합')).toBeVisible();
  await expect(nav.locator('text=신년운세')).toBeVisible();
});

test('홈: 탭 전환 — 오늘의 운세 탭', async ({ page }) => {
  await setup(page);
  await goToTab(page, '오늘의 운세');
  await expect(page).toHaveURL('/fortune', { timeout: 5000 });
});

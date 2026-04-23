import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 매 테스트 전 localStorage 초기화
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('온보딩: 초기 진입 시 온보딩 화면 표시', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=四柱狂')).toBeVisible({ timeout: 5000 });
});

test('온보딩: 생년월일 입력 후 홈으로 이동', async ({ page }) => {
  await page.goto('/');

  // 이름 입력 (선택)
  const nameInput = page.locator('input[placeholder="홍길동"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill('테스트');
  }

  // 생년월일 입력
  await page.locator('input[placeholder="1990"]').fill('1990');
  await page.locator('input[placeholder="01"]').first().fill('05');
  await page.locator('input[placeholder="01"]').nth(1).fill('15');

  // 성별 선택
  await page.locator('button:has-text("남성")').first().click();

  // 시간 입력
  await page.locator('input[placeholder="00"]').first().fill('10');
  await page.locator('input[placeholder="00"]').nth(1).fill('00');

  // 제출
  await page.locator('button[type="submit"]').click();

  // 홈으로 이동 확인
  await expect(page).toHaveURL('/home', { timeout: 10000 });
});

test('온보딩: 시간 모름 체크박스 동작', async ({ page }) => {
  await page.goto('/');

  await page.locator('text=시간을 모릅니다').click();

  // 시간 입력 필드가 사라지는지 확인
  await expect(page.locator('input[placeholder="00"]').first()).not.toBeVisible();
});

test('온보딩: 필수값 미입력 시 에러 표시', async ({ page }) => {
  await page.goto('/');

  // 아무것도 입력 안 하고 제출
  await page.locator('button[type="submit"]').click();

  // 에러 메시지 확인
  const errorVisible = await page.locator('.error-text').isVisible().catch(() => false);
  expect(errorVisible).toBeTruthy();
});

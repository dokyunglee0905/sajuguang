import { test, expect } from '@playwright/test';

// 온보딩만 완료 (AdGate 통과 안 함)
async function completeOnboarding(page: any) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('input[placeholder="1990"]').fill('1990');
  await page.locator('input[placeholder="01"]').first().fill('05');
  await page.locator('input[placeholder="01"]').nth(1).fill('15');
  await page.locator('button:has-text("남성")').first().click();
  await page.locator('input[placeholder="00"]').first().fill('10');
  await page.locator('input[placeholder="00"]').nth(1).fill('00');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL('/home', { timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('광고게이트: 홈 탭 진입 시 게이트 화면 표시', async ({ page }) => {
  await completeOnboarding(page);
  // /home도 AdGate 안에 있음
  await expect(page.locator('text=2시간 자유이용권')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=광고 보고 무료 이용하기')).toBeVisible();
});

test('광고게이트: 무료이용권 활성화 후 홈 콘텐츠 접근 가능', async ({ page }) => {
  await completeOnboarding(page);
  await page.locator('text=광고 보고 무료 이용하기').click();

  // 게이트 사라지고 홈 콘텐츠 표시
  await expect(page.locator('text=2시간 자유이용권')).not.toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 5000 });
});

test('광고게이트: 패스 활성화 후 다른 탭도 바로 접근 가능', async ({ page }) => {
  await completeOnboarding(page);
  await page.locator('text=광고 보고 무료 이용하기').click();
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 5000 });

  // 궁합 탭으로 이동
  await page.locator('nav button').filter({ hasText: '궁합' }).click();
  await expect(page.locator('text=2시간 자유이용권')).not.toBeVisible({ timeout: 3000 });
});

test('광고게이트: 자유이용권 타이머 표시', async ({ page }) => {
  await completeOnboarding(page);
  await page.locator('text=광고 보고 무료 이용하기').click();
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 5000 });

  // 자유이용권 타이머가 탭바에 표시
  await expect(page.locator('text=자유이용권')).toBeVisible({ timeout: 5000 });
});

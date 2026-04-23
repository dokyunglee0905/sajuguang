import { Page, expect } from '@playwright/test';

// 온보딩 완료 + AdGate 통과 (모든 탭 공통)
export async function setup(page: Page) {
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

  // /home도 AdGate에 감싸져 있음 — 패스 활성화
  const gateBtn = page.locator('text=광고 보고 무료 이용하기');
  if (await gateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gateBtn.click();
  }

  // 홈 콘텐츠 로드 대기
  await expect(page.locator('text=나의 기운')).toBeVisible({ timeout: 10000 });
}

// 특정 탭으로 이동 (탭바 버튼 정확히 클릭)
export async function goToTab(page: Page, tabLabel: string) {
  await page.locator('nav button').filter({ hasText: tabLabel }).click();
}

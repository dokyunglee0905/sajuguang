import { test, expect } from '@playwright/test';
import { setup, goToTab } from './_helpers';

async function fillCompatForm(page: any) {
  await page.locator('input[placeholder="1990"]').fill('1992');
  await page.locator('input[placeholder="01"]').first().fill('08');
  await page.locator('input[placeholder="01"]').nth(1).fill('20');

  // 성별 버튼 (CompatPage의 것)
  const genderBtns = page.locator('button').filter({ hasText: /^여성$|^남성$/ });
  await genderBtns.first().click();

  // 시간 모름
  const unknownCheck = page.locator('text=시간을 모릅니다');
  if (await unknownCheck.isVisible({ timeout: 1000 }).catch(() => false)) {
    await unknownCheck.click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('궁합: 입력 폼 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await expect(page.locator('text=생년월일').first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('input[placeholder="1990"]')).toBeVisible();
});

test('궁합: 필수값 미입력 시 에러 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.error-text')).toBeVisible({ timeout: 3000 });
});

test('궁합: 상대방 정보 입력 후 분석 요청', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await fillCompatForm(page);
  await page.locator('button[type="submit"]').click();

  // 로딩 또는 결과 대기
  await expect(
    page.locator('text=분석하고 있어요').or(page.locator('text=궁합 결과'))
  ).toBeVisible({ timeout: 10000 });
});

test('궁합: 결과에 점수 표시 (최대 30초)', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await fillCompatForm(page);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=궁합 결과')).toBeVisible({ timeout: 30000 });
  // 숫자 점수 (예: "85점")
  await expect(page.locator('text=/\\d+점/')).toBeVisible({ timeout: 5000 });
});

test('궁합: 결과에 오행궁합 항목 표시', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await fillCompatForm(page);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=궁합 결과')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('text=오행 궁합')).toBeVisible({ timeout: 5000 });
});

test('궁합: 다시보기 버튼으로 입력 폼 복귀', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');
  await fillCompatForm(page);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('text=궁합 결과')).toBeVisible({ timeout: 30000 });
  await page.locator('text=← 다시보기').click();
  await expect(page.locator('text=생년월일').first()).toBeVisible({ timeout: 3000 });
});

test('궁합: 관계 유형 선택 가능', async ({ page }) => {
  await setup(page);
  await goToTab(page, '궁합');

  const relationBtns = page.locator('button').filter({ hasText: /연인|배우자|친구|직장동료|가족/ });
  const count = await relationBtns.count();
  expect(count).toBeGreaterThan(0);

  // 연인 선택
  const yeoninBtn = page.locator('button').filter({ hasText: '연인' }).first();
  if (await yeoninBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await yeoninBtn.click();
    // 선택 상태 확인 (active 클래스 또는 색상 변화)
    await expect(yeoninBtn).toBeVisible();
  }
});

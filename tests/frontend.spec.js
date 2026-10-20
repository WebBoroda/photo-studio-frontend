const { test, expect } = require('@playwright/test');
for (const width of [320,390,834,1280,1536]) {
 test(`responsive ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('h1')).toContainText('Простір');
  await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/full-${width}.png`,fullPage:true});
 });
}
test('mobile menu and Escape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('.mobile-menu-trigger').click();await expect(page.locator('#mobile-navigation')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('#mobile-navigation')).toBeHidden();
});
test('theme and gallery',async({page})=>{
 await page.goto('/');await page.locator('.theme-toggle').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.locator('[data-gallery]').first().click();await expect(page.locator('#gallery-modal')).toBeVisible();
});
test('booking demo modal',async({page})=>{
 await page.goto('/');await page.locator('.hero-book').click();await expect(page.locator('#booking-modal')).toBeVisible();
});

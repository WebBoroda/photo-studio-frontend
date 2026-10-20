const {test,expect}=require('@playwright/test');

async function loadPhotography(page){
  await page.goto('/', {waitUntil:'domcontentloaded'});
  // Native lazy loading remains in production. Full-page QA screenshots don't
  // naturally scroll, so preload those images in the test browser only.
  await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(img=>{img.loading='eager'}));
  await expect.poll(async()=>page.evaluate(()=>Array.from(document.querySelectorAll('img[src]')).every(img=>img.complete&&img.naturalWidth>0)),{timeout:15000}).toBe(true);
}
for(const width of [320,390,834,1280,1536]){
  test(`responsive, images and themes ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await loadPhotography(page);
    await expect(page.locator('h1')).toContainText('Простір');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('#benefits-heading')).toBeVisible();
    await expect(page.locator('#equipment-heading')).toBeAttached();
    await page.screenshot({path:`test-results/light-${width}.png`,fullPage:true,animations:'disabled'});
    await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await page.screenshot({path:`test-results/dark-${width}.png`,fullPage:true,animations:'disabled'});
    expect(errors).toEqual([]);
  });
}
test('mobile navigation, Escape and focus state',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await loadPhotography(page);
  const button=page.locator('.mobile-menu-trigger');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#mobile-navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-navigation')).toBeHidden();
  await expect(button).toHaveAttribute('aria-expanded','false');
});
test('gallery categories and dialog controls',async({page})=>{
  await loadPhotography(page);
  await page.locator('[data-filter="portrait"]').click();
  await expect(page.locator('[data-filter="portrait"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-gallery]:visible').first().click();
  await expect(page.locator('#gallery-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#gallery-modal')).toBeHidden();
});
test('demo booking opens and closes',async({page})=>{
  await loadPhotography(page);
  await page.locator('.hero-book').click();
  await expect(page.locator('#booking-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#booking-modal')).toBeHidden();
});
test('hall details, FAQ and shared accent tokens',async({page})=>{
  await loadPhotography(page);
  await page.locator('.hall-foot .btn-white').first().click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.locator('#faq details').first().locator('summary').click();
  await expect(page.locator('#faq details').first()).toHaveAttribute('open','');
  const accent=await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent-gradient').trim());
  expect(accent).toContain('linear-gradient');
});

test('approved Hero decoration, theme switch, no language arrow and persistent booking',async({page})=>{
  await page.setViewportSize({width:1536,height:900});
  await loadPhotography(page);
  await expect(page.locator('.hero-pencil')).toHaveCount(1);
  await expect(page.locator('.nav-actions > .theme-toggle')).toBeVisible();
  await expect(page.locator('.language-btn')).toHaveText('UA');
  await expect(page.locator('.nav-book')).toHaveText('Забронювати');
  await expect(page.locator('.floating-booking')).toBeVisible();
  const hero=await page.locator('.hero').boundingBox();
  const panel=await page.locator('.benefits-panel').boundingBox();
  const title=await page.locator('#hero-heading').boundingBox();
  expect(Math.abs(hero.height-560)).toBeLessThan(15);
  expect(Math.abs(panel.y-500)).toBeLessThan(18);
  expect(Math.abs(title.x-150)).toBeLessThan(20);
  await page.locator('.floating-booking').click();
  await expect(page.locator('#booking-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(()=>{
    document.documentElement.style.scrollBehavior='auto';
    document.querySelector('.site-footer').scrollIntoView();
  });
  await expect(page.locator('.floating-booking')).toHaveClass(/is-footer-hidden/);
});

test('mobile navigation keeps Light/Dark/Auto controls and floating booking',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await loadPhotography(page);
  await expect(page.locator('.nav-actions > .theme-toggle')).toBeVisible();
  await expect(page.locator('.floating-booking')).toBeVisible();
  await expect(page.locator('.floating-booking span')).toBeHidden();
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode','auto');
});

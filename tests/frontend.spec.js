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

test('mobile navigation keeps Light/Dark controls and floating booking',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await loadPhotography(page);
  await expect(page.locator('.nav-actions > .theme-toggle')).toBeVisible();
  await expect(page.locator('.floating-booking')).toBeVisible();
  await expect(page.locator('.floating-booking span')).toBeHidden();
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode','light');
});


// Geometric checkpoints extracted from the approved 1536x1024 Hero reference.
// These complement browser behavior tests: their purpose is to catch unintended
// layout drift before a release can be published.
test('approved 1536px Hero geometry and transparent UI', async ({page})=>{
  await page.setViewportSize({width:1536,height:1024});
  await loadPhotography(page);
  const near=async(sel,position,expected,tolerance)=>{
    const box=await page.locator(sel).first().boundingBox();
    expect(box, `Missing geometry: ${sel}`).not.toBeNull();
    expect(Math.abs(box[position]-expected),`${sel} ${position} expected ${expected}px, got ${box[position]}px`).toBeLessThanOrEqual(tolerance);
  };
  await near('.nav-shell','x',133,3);
  await near('.nav-shell','y',13,3);
  await near('.nav-book','x',1236,5);
  await near('.nav-book','width',160,5);
  await near('.hero-content','x',149,5);
  await near('.hero','height',560,5);
  await near('.benefits-panel','y',501,5);
  await near('.benefit-list','y',596,7);
  await near('.benefit-card','height',249,7);
  await near('.tour-strip','y',857,7);
  await expect(page.locator('.hero-pencil')).toHaveCount(1);
  await expect(page.locator('.nav-actions>.theme-toggle')).toBeVisible();
  await expect(page.locator('.language-btn')).toHaveText('UA');
  await expect(page.locator('.floating-booking')).toBeVisible();
  await page.screenshot({path:'test-results/approved-layout-1536.png',animations:'disabled'});
});

for(const width of [321,359,371,429,639,640,641,767,768,769,899,900,901,1023,1024,1199,1200,1201,1365,1440,1599,1600,1920,2560]){
 test('fluid '+width,async({page})=>{
  await page.setViewportSize({width,height:900});await loadPhotography(page);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 });
}
test('automatic theme initially, only Light Dark after first click',async({browser})=>{
 const context=await browser.newContext({colorScheme:'dark'}),page=await context.newPage();
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('html')).toHaveAttribute('data-theme-mode','auto');
 await page.locator('.theme-toggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme-mode','light');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('.theme-toggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme-mode','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await context.close();
});
test('full-bleed photo, fade and cube',async({page})=>{
 await page.setViewportSize({width:1920,height:900});await loadPhotography(page);
 const a=await page.locator('.hero').boundingBox(),b=await page.locator('.hero-media').boundingBox();
 expect(Math.abs(a.width-b.width)).toBeLessThanOrEqual(1);
 expect(await page.locator('.hero-media').evaluate(el=>getComputedStyle(el).maskImage)).toContain('linear-gradient');
 await expect(page.locator('.benefit-card').first().locator('use[href="#i-cube"]')).toHaveCount(1);
});

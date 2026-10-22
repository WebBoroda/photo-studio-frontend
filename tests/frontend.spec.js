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
test('gallery image changes with a visible fade',async({page})=>{
  await loadPhotography(page);
  await page.locator('[data-gallery]').first().click();
  await page.locator('#gallery-next').click();
  await expect(page.locator('#gallery-modal-image')).toHaveClass(/is-switching/);
  await expect(page.locator('#gallery-modal-image')).not.toHaveClass(/is-switching/);
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

// v1.5: regression coverage for the approved section-navigation and modal behavior.
test('removed pagination and equal horizontal margins across devices',async({page})=>{
  for(const width of [390,768,834,901,1280,1536,1920]){
    await page.setViewportSize({width,height:1024});
    await loadPhotography(page);
    await expect(page.locator('.side-pagination,.pager-number,[data-section-pager]')).toHaveCount(0);
    for(const selector of ['.benefits-panel','.halls-section','#equipment','#gallery','#prices','#reviews','#faq']){
      const box=await page.locator(selector).boundingBox();
      const left=box.x,right=width-(box.x+box.width);
      expect(Math.abs(left-right),`${selector} not centered at ${width}: ${left} vs ${right}`).toBeLessThanOrEqual(2);
    }
  }
});

test('fades begin from bottom and extend high enough behind text',async({page})=>{
  await page.setViewportSize({width:1536,height:1024});await loadPhotography(page);
  const benefit=await page.locator('.benefit-card').first().evaluate(el=>{
    const style=getComputedStyle(el,'::after');return {height:parseFloat(style.height),card:el.clientHeight,gradient:style.backgroundImage};
  });
  expect(benefit.height/benefit.card).toBeGreaterThan(.6);
  expect(benefit.gradient).toContain('linear-gradient');
  const hall=await page.locator('.hall-card').first().evaluate(el=>({
    image:getComputedStyle(el.querySelector('.card-shade')).backgroundImage,
    info:getComputedStyle(el.querySelector('.hall-content')).backgroundImage,
    seam:getComputedStyle(el.querySelector('.hall-content'),'::before').content
  }));
  expect(hall.image).toContain('linear-gradient');
  expect(hall.info).toBe('none');
  expect(hall.seam).toBe('none');
  await expect(page.locator('.gear-card>span').first()).toHaveCSS('background-image',/linear-gradient/);
});

test('scroll-reveal animates heading and cards and honors reduced motion',async({browser})=>{
  const ctx=await browser.newContext({viewport:{width:1280,height:760},reducedMotion:'no-preference'});
  const page=await ctx.newPage();await loadPhotography(page);
  const heading=page.locator('#equipment h2').first();
  const card=page.locator('.gear-card').first();
  await expect(heading).toHaveClass(/reveal-ready/);
  await expect(card).toHaveClass(/reveal-ready/);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-revealed/);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-revealed/);
  await ctx.close();
});

test('tour buttons do not pretend a photo gallery is a video', async ({page})=>{
  await loadPhotography(page);
  await page.locator('.tour-strip [data-tour]').first().click();
  await expect(page.locator('#tour-modal')).toBeVisible();
  await expect(page.locator('#tour-description')).toContainText('ще не додане');
  await expect(page.locator('#tour-prev')).toHaveCount(0);
  await expect(page.locator('.tour-poster img')).toHaveCSS('object-fit','cover');
  await page.keyboard.press('Escape');
  await page.locator('.gear-card').first().click();
  await expect(page.locator('#gallery-modal')).toBeVisible();
  await expect(page.locator('#gallery-modal-title')).toHaveText('Оснащення студії');
});

test('global radius, social links and map route call-to-action', async ({page})=>{
  await page.setViewportSize({width:1536,height:1024});await loadPhotography(page);
  for(const selector of ['.benefits-panel','.halls-section','.equipment-catalog','.final-cta']){
    await expect(page.locator(selector)).toHaveCSS('border-top-left-radius','26px');
  }
  await expect(page.locator('.final-cta')).toHaveCSS('border-bottom-right-radius','26px');
  await expect(page.locator('.footer-social button')).toHaveCount(6);
  await expect(page.locator('.footer-map')).toContainText('Прокласти маршрут');
  await expect(page.locator('.footer-map')).toHaveAttribute('href',/google\.com\/maps\/dir/);
  await expect(page.locator('.all-halls')).toHaveText('Всі зали');
  await expect(page.locator('.all-halls svg')).toHaveCount(0);
});

test('reduced motion keeps sections visible without reveal animation',async({browser})=>{
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const page=await context.newPage();await page.goto('/');
  await expect(page.locator('.reveal-ready')).toHaveCount(0);
  await expect(page.locator('#gallery')).toBeAttached();
  await context.close();
});


test('generated demo images are sharp-sized, all gallery photos have real dimensions',async({page})=>{
  await page.setViewportSize({width:1536,height:900});
  await loadPhotography(page);
  for(const image of await page.locator('.gallery-photo img, .benefit-card img, .gear-card img').all()){
    const dimensions=await image.evaluate(el=>({width:el.naturalWidth,height:el.naturalHeight}));
    expect(dimensions.width).toBeGreaterThanOrEqual(1000);
    expect(dimensions.height).toBeGreaterThanOrEqual(700);
  }
  await expect(page.locator('.gallery-photo-note')).toContainText('створено ШІ');
});

test('fixed booking CTA never hides gallery tiles or tour buttons',async({page})=>{
  await page.setViewportSize({width:1536,height:900});await loadPhotography(page);
  await page.evaluate(()=>scrollTo({top:document.querySelector('.gallery-grid').getBoundingClientRect().top+scrollY-580,behavior:'instant'}));
  await expect(page.locator('.floating-booking')).toHaveClass(/is-content-hidden/);
  await expect(page.locator('.gallery-instagram')).toBeVisible();
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await expect(page.locator('.floating-booking')).not.toHaveClass(/is-content-hidden/);
});

// Regression: a single full-card fade means no hard horizontal join on any room.
for(const scheme of ['light','dark']){
  test(`hall card fade has no overlapping overlay seam (${scheme})`,async({page})=>{
    await page.setViewportSize({width:1536,height:1024});
    await page.emulateMedia({colorScheme:scheme});
    await loadPhotography(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme',scheme);
    for(const card of await page.locator('.hall-card').all()){
      const {shade,content,before,topBorder}=await card.evaluate(el=>({
        shade:getComputedStyle(el.querySelector('.card-shade')).backgroundImage,
        content:getComputedStyle(el.querySelector('.hall-content')).backgroundImage,
        before:getComputedStyle(el.querySelector('.hall-content'),'::before').content,
        topBorder:getComputedStyle(el.querySelector('.hall-content')).borderTopWidth
      }));
      expect(shade).toContain('linear-gradient');
      expect(content).toBe('none');
      expect(before).toBe('none');
      expect(topBorder).toBe('0px');
    }
  });
}

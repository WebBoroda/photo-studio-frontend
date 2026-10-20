const {test,expect}=require('@playwright/test');
for(const [name,width,height] of [['desktop',1536,900],['laptop',1280,800],['tablet',834,1112],['mobile',390,844],['small-mobile',320,700]]){
test('layout '+name,async({page})=>{
 await page.setViewportSize({width,height});
 const errs=[];page.on('pageerror',e=>errs.push(String(e)));
 await page.goto('/');await expect(page.locator('h1')).toContainText('Простір');
 await expect(page.locator('.benefits-panel')).toBeVisible();
 const metrics=await page.evaluate(()=>({v:innerWidth,s:document.documentElement.scrollWidth}));
 expect(metrics.s).toBeLessThanOrEqual(metrics.v+1);
 await page.evaluate(async()=>{
   for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,35))}
   for(const img of document.querySelectorAll('img[src]')){img.loading='eager';await img.decode().catch(()=>{})}
   scrollTo(0,0);
 });
 const missing=await page.evaluate(()=>[...document.images].filter(i=>i.src&&i.naturalWidth===0).map(i=>i.src));
 expect(missing).toEqual([]);expect(errs).toEqual([]);
 await page.screenshot({path:'test-results/visual/'+name+'-light.png',fullPage:true,animations:'disabled'});
 await page.locator('.theme-toggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.screenshot({path:'test-results/visual/'+name+'-dark.png',fullPage:true,animations:'disabled'});
});}
test('dialogs and filters',async({page})=>{
 await page.goto('/');await page.locator('.hero-book').click();
 await expect(page.locator('#booking-modal')).toBeVisible();
 await page.locator('[data-close="booking-modal"]').click();
 await page.locator('[data-filter="portrait"]').click();
 expect(await page.locator('.gallery-photo:not([hidden])').count()).toBeGreaterThan(0);
 await page.locator('.gallery-photo:not([hidden])').first().click();
 await expect(page.locator('#gallery-modal')).toBeVisible();
 await page.locator('[data-close="gallery-modal"]').click();
 await page.locator('[data-room-details]').first().click();
 await expect(page.locator('#room-modal')).toBeVisible();
});
test('mobile menu keyboard',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('.mobile-menu-trigger').click();
 await expect(page.locator('#mobile-navigation')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#mobile-navigation')).toBeHidden();
});

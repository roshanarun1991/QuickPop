import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
let checks=0;const pass=name=>{checks++;console.log('PASS',name);};
try{
 for(const width of [1440,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
  await ctx.addInitScript(()=>{window.QUICKPOP_STATIC=true;});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base);assert(response.ok());await page.locator('.pack').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.pack').count(),20);assert(await page.getByText('YOUR SOLO QUIZ BREAK',{exact:true}).isVisible());pass(`${width}px published home loads in solo mode`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));pass(`${width}px homepage fits`);
  await page.screenshot({path:`test-results/published-home-${width}.png`,fullPage:true});
  for(const count of [6,10]){
   await page.goto(base+'#host/friends');await page.locator('#solo-count').selectOption(String(count));await page.locator('#start-solo').click();
   for(let i=0;i<count;i++){await page.locator('[data-answer]').first().click();if(await page.locator('[data-action="solo-lock"]').count())await page.locator('[data-action="solo-lock"]').click();await page.locator('[data-action="solo-next"]').click();}
   await page.getByText('PRACTICE MAKES BRAGGING RIGHTS',{exact:true}).waitFor();
   assert((await page.locator('.result-title .display').innerText()).includes('/ '+count));pass(`${width}px ${count}-question solo game finishes`);
   const gap=await page.evaluate(()=>document.querySelector('.result-note').getBoundingClientRect().top-document.querySelector('.center-actions').getBoundingClientRect().bottom);assert(gap>=20);
   if(count===10)await page.screenshot({path:`test-results/published-result-${width}.png`,fullPage:true});
  }
  await page.goto(base+'#join/1234');await page.getByText('SOLO NOW.',{exact:false}).waitFor();assert.equal(await page.locator('#join-button').count(),0);pass(`${width}px live-room limitation is explicit`);
  await page.goto(base+'#builder');await page.locator('#quiz-title').waitFor();assert(await page.locator('.footer-credit').isVisible());pass(`${width}px builder and footer work`);
  await page.locator('#theme').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(errors.length,0);pass(`${width}px theme persists without JavaScript exceptions`);
  await ctx.close();
 }
 console.log(`${checks} static-site checks passed at ${base}`);
}finally{await browser.close();}

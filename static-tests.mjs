import {PACKS} from './quiz-bank.js';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
let checks=0;const pass=name=>{checks++;console.log('PASS',name);};
try{
 for(const [width,height] of [[1440,900],[1366,640],[390,667],[320,568],[844,390]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',serviceWorkers:'block'});
  await ctx.addInitScript(()=>{window.QUICKPOP_STATIC=true;});
  const page=await ctx.newPage(),errors=[],apiRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/api/'))apiRequests.push(r.url());});
  const response=await page.goto(base);assert(response.ok());await page.locator('.pack').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.pack').count(),PACKS.length);assert(await page.getByRole('link',{name:'JOIN A QUIZ'}).isVisible());assert(await page.locator('#quick-join').isVisible());assert(await page.locator('.live-note').isVisible());pass(`${width}px published home keeps joining visible`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));pass(`${width}px homepage fits`);
  await page.screenshot({path:`test-results/published-home-${width}.png`,fullPage:true});
  await page.goto(base+'#host/friends');await page.locator('#count').waitFor();assert.equal(await page.locator('#teams').count(),0);
  await page.goto(base+'#join');await page.locator('#pin').waitFor();assert.equal(await page.locator('#team').count(),0);pass(`${width}px team selection is hidden in joining and hosting`);
  for(const count of [6,10]){
   await page.goto(base+'#host/friends');await page.locator('#count').selectOption(String(count));await page.locator('#create-room').click();assert((await page.locator('#form-error').innerText()).includes('not connected yet'));assert(await page.locator('#create-room').isEnabled());await page.locator('[data-practice]').click();
   for(let i=0;i<count;i++){
    await page.locator('[data-answer]').first().click();
    const inView=selector=>page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});
    if(await page.locator('[data-action="solo-lock"]').count()){assert(await inView('[data-action="solo-lock"]'),'Lock in must be visible without scrolling');await page.locator('[data-action="solo-lock"]').click();}
    assert(await inView('[data-action="solo-next"]'),`${width}x${height} Next question must be visible without scrolling`);
    if(i===0&&count===6)await page.screenshot({path:`test-results/solo-next-${width}.png`});
    await page.locator('[data-action="solo-next"]').click();
   }
   await page.getByText('PRACTICE MAKES BRAGGING RIGHTS',{exact:true}).waitFor();
   assert((await page.locator('.result-title .display').innerText()).includes('/ '+count));pass(`${width}px ${count}-question solo game finishes`);
   const gap=await page.evaluate(()=>document.querySelector('.result-note').getBoundingClientRect().top-document.querySelector('.center-actions').getBoundingClientRect().bottom);assert(gap>=20);
   if(count===10)await page.screenshot({path:`test-results/published-result-${width}.png`,fullPage:true});
  }
  await page.goto(base+'#home');await page.locator('#quick-pin').fill('1234');await page.locator('#quick-join button').click();await page.locator('#join-button').waitFor();assert.equal(await page.locator('#pin').inputValue(),'1234');await page.locator('#nickname').fill('Quiz Pal');await page.locator('[data-avatar="2"]').click();assert.equal(await page.locator('[data-avatar="2"]').getAttribute('aria-pressed'),'true');await page.locator('#join-button').click();assert((await page.locator('#form-error').innerText()).includes('not connected yet'));assert(await page.locator('#join-button').isEnabled());assert.equal(apiRequests.length,0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`test-results/published-join-${width}.png`,fullPage:true});pass(`${width}px complete join form works with clear unavailable-server feedback and no API requests`);
  await page.goto(base+'#builder');await page.locator('#quiz-title').waitFor();assert(await page.locator('.footer-credit').isVisible());pass(`${width}px builder and footer work`);
  await page.locator('#theme').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(errors.length,0);pass(`${width}px theme persists without JavaScript exceptions`);
  await ctx.close();
 }
 console.log(`${checks} static-site checks passed at ${base}`);
}finally{await browser.close();}

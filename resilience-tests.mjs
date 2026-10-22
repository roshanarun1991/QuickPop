import {PACKS} from './quiz-bank.js';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
try{
 const animated=await browser.newContext({reducedMotion:'no-preference'}),creditPage=await animated.newPage();
 await creditPage.goto(base);await creditPage.locator('.powered-type').waitFor();await creditPage.evaluate(()=>document.fonts.ready);
 const frames=await creditPage.locator('.powered-type').evaluate(el=>{const a=el.getAnimations()[0];a.pause();return [0,3500,6999].map(time=>{a.currentTime=time;return {width:el.clientWidth,full:el.scrollWidth};});});
 assert(frames[0].width<2&&frames[1].width>=frames[1].full-1&&frames[2].width<2);
 for(const route of ['#host/friends','#join','#builder','#daily']){await creditPage.goto(base+route);assert(await creditPage.locator('.footer-credit').isVisible());}
 console.log('PASS footer types the complete RANS credit, erases it, and appears across routes');
 await animated.close();
 const offline=await browser.newContext({serviceWorkers:'allow'});
 const page=await offline.newPage();
 await page.goto(base);await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.reload();await page.locator('.pack').first().waitFor();
 await offline.setOffline(true);await page.reload();
 await page.locator('.pack').first().waitFor();
 assert.equal(await page.locator('.pack').count(),PACKS.length);
 await page.goto(base+'#practice/friends');await page.locator('[data-answer]').first().click();
 assert(await page.locator('[data-action="solo-next"]').isVisible());
 console.log('PASS cached homepage and solo practice work offline');
 await offline.close();

 const blocked=await browser.newContext({serviceWorkers:'block'});
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
 const p=await blocked.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'#daily');
 for(let i=0;i<5;i++){
  await p.locator('[data-answer]').first().click();
  if(await p.locator('[data-action="solo-lock"]').count())await p.locator('[data-action="solo-lock"]').click();
  await p.locator('[data-action="solo-next"]').click();
 }
 await p.getByText('YOUR DAILY LITTLE WIN',{exact:true}).waitFor();
 assert.equal(errors.length,0);
 console.log('PASS Daily Pop completes when browser storage is blocked');
 await p.locator('#privacy').click();p.once('dialog',dialog=>dialog.accept());
 await p.locator('[data-action="clear-local"]').click();await p.locator('.pack').first().waitFor();
 assert.equal(errors.length,0);
 console.log('PASS privacy reset remains usable with blocked browser storage');
 await blocked.close();
}finally{await browser.close();}

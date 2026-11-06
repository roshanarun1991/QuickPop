import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
await mkdir('test-results',{recursive:true});
let checks=0;const pass=s=>{checks++;console.log('PASS',s);};
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch();try{
  for(const [width,height] of [[320,568],[375,667],[390,844],[768,1024],[844,390],[1366,768]]){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<800,serviceWorkers:'block'});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'#topics');await page.locator('#search').waitFor();
   const font=await page.locator('#search').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(font>=16,'Search must not trigger iOS small-input zoom');
   assert(!(await page.locator('meta[name=viewport]').getAttribute('content')).match(/user-scalable=no|maximum-scale/));
   await page.locator('#search').tap();await page.locator('#search').fill('spices');await page.locator('#search').press('Enter');
   await page.waitForFunction(()=>document.activeElement.id!=='search'&&document.querySelector('#search-suggestions').hidden);
   await page.waitForFunction(()=>{const r=document.querySelector('#topics').getBoundingClientRect();return r.top>=-1&&r.top<70;});
   assert.equal(await page.locator('.pack').count(),1);assert.equal(await page.evaluate(()=>scrollX),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===375)await page.screenshot({path:`test-results/search-${name}.png`,animations:'disabled'});
   await page.getByRole('button',{name:'Clear topic search',exact:true}).tap();assert((await page.locator('.pack').count())>=51);
   await page.locator('#search').fill('logo');await page.locator('#search').press('ArrowDown');await page.locator('#search').press('Enter');assert.equal(await page.locator('#search').inputValue(),'Guess the Logo');
   await page.locator('#search').fill('flag');await page.locator('[data-suggestion="guess-flag"]').tap();assert.equal(await page.locator('#search').inputValue(),'Flag Finder');assert(await page.locator('#search-suggestions').isHidden());
   await page.locator('#search').fill('x'.repeat(180));await page.locator('#search').press('Enter');await page.getByRole('heading',{name:'COMING SOON'}).waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Long search must wrap');
   await page.locator('.empty [data-action=clear-search]').tap();await page.locator('#search').fill('spices');await page.locator('#search').press('Enter');await page.locator('.pack').tap();await page.locator('[data-practice]').tap();await page.locator('[data-answer]').first().tap();
   const next=await page.locator('[data-action=solo-next]').boundingBox();assert(next.y>=0&&next.y+next.height<=height+1,'Next visible after search-to-play');
   assert.deepEqual(errors,[]);pass(`${name} ${width}x${height}: natural-scale search, Enter, suggestions, clearing, long query, gameplay`);
   await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:375,height:667},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'}),page=await ctx.newPage();await page.goto(base);
  assert.equal(await page.locator('.page-enter').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.pack').first().evaluate(e=>getComputedStyle(e).animationName),'none');pass(`${name}: reduced motion respected`);
  await page.goto(base+'#builder');await page.locator('.builder-question').first().waitFor();const fonts=await page.locator('input:not([type=checkbox]):not([type=file]):not([type=range]),textarea,select').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));assert(fonts.every(n=>n>=16));
  await page.goto(base+'#host/spices');await page.locator('[data-practice]').tap();await page.setViewportSize({width:812,height:375});await page.locator('[data-answer]').first().tap();await page.waitForFunction(()=>{const r=document.querySelector('[data-action=solo-next]').getBoundingClientRect();return r.bottom<=innerHeight+1;});await page.setViewportSize({width:375,height:667});await page.waitForFunction(()=>document.querySelector('[data-action=solo-next]').getBoundingClientRect().bottom<=innerHeight+1);pass(`${name}: editing fields and portrait/landscape rotation`);
  if(name==='chromium'){
   const before=await page.evaluate(()=>document.documentElement.style.getPropertyValue('--screen-height'));const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});await page.waitForFunction(()=>visualViewport.scale>1.5);assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--screen-height')),before);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});pass('chromium: user zoom does not collapse the game layout');
  }
  await ctx.close();
  const audioCtx=await browser.newContext({serviceWorkers:'block'});await audioCtx.addInitScript(()=>{window.audioQA=[];window.audioContexts=0;const Native=window.AudioContext||window.webkitAudioContext;if(!Native)return;window.AudioContext=new Proxy(Native,{construct(Target,args){window.audioContexts++;const ctx=new Target(...args),create=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const o=create(),start=o.start.bind(o);o.start=(...args)=>{audioQA.push({type:o.type});return start(...args);};return o;};return ctx;}});});
  const a=await audioCtx.newPage();await a.goto(base);if(await a.evaluate(()=>!!(window.AudioContext||window.webkitAudioContext))){await a.locator('#theme').click();assert.equal(await a.evaluate(()=>audioQA.length),0);await a.locator('#sound').click();await a.waitForFunction(()=>audioQA.length>0);await a.waitForTimeout(160);const n=await a.evaluate(()=>audioQA.length);await a.locator('#theme').click();assert.equal(await a.evaluate(()=>audioQA.length),n+1);assert.equal(await a.evaluate(()=>audioQA.at(-1).type),'square');assert.equal(await a.evaluate(()=>audioContexts),1);await a.locator('#sound').click();const muted=await a.evaluate(()=>audioQA.length);await a.locator('#theme').click();assert.equal(await a.evaluate(()=>audioQA.length),muted);pass(`${name}: pling plays once on click, shares audio context, obeys mute`);}else{assert(await a.locator('#sound').isDisabled());pass(`${name}: unavailable audio has a disabled control`);}await audioCtx.close();
 }finally{await browser.close();}
}
console.log(`${checks} layout and sound checks passed`);

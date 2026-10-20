import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
const report={date:new Date().toISOString(),base,checks:[],accessibility:[],errors:[]};
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
const check=(name,ok=true)=>{assert(ok,name);report.checks.push(name);console.log('PASS',name);};
const pageErrors=[];
async function newPage(viewport={width:1440,height:1000},scheme='light'){
 const context=await browser.newContext({viewport,colorScheme:scheme,serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));return {context,page};
}
async function noOverflow(page,label){check(label,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
async function accessibility(page,label){
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 report.accessibility.push({label,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}))});
 check(`Accessibility: ${label}`,result.violations.length===0);
}
try{
 for(const [width,height] of [[1440,1000],[1024,768],[768,1024],[390,844],[320,740]]){
  const {context,page}=await newPage({width,height});
  await page.goto(base);await page.locator('.pack').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  check(`${width}px: all 20 packs`,await page.locator('.pack').count()===20);check(`${width}px simplified hero`,await page.locator('.hero-art,.ticker').count()===0);check(`${width}px footer credit visible`,await page.locator('.footer-credit').isVisible());
  await noOverflow(page,`${width}px homepage has no horizontal overflow`);
  await page.locator('#search').fill('sweden');check(`${width}px search filters`,await page.locator('.pack').count()===1);
  await page.locator('#search').fill('notherezz');check(`${width}px empty state`,await page.getByText('NO MATCH. YET.').isVisible());
  await page.getByRole('button',{name:'Clear search',exact:true}).click();
  await page.locator('[data-category="Music"]').click();check(`${width}px category filters`,await page.locator('.pack').count()===3);
  await page.locator('[data-category="All"]').click();
  await page.locator('#theme').click();await page.reload();check(`${width}px dark mode persists`,await page.locator('html').getAttribute('data-theme')==='dark');
  await noOverflow(page,`${width}px night mode fits`);
  if(width===390||width===1440)await page.screenshot({path:`test-results/home-${width}-night.png`,fullPage:true});
  if(width===1440)await accessibility(page,'Homepage dark');
  await page.locator('#theme').click();
  if(width===390||width===1440)await page.screenshot({path:`test-results/home-${width}-day.png`,fullPage:true});
  if(width===1440)await accessibility(page,'Homepage light');
  await page.goto(base+'#join/0123');check(`${width}px leading-zero PIN`,await page.locator('#pin').inputValue()==='0123');
  await noOverflow(page,`${width}px join form fits`);
  await page.locator('#pin').fill('a1b2c3');await page.locator('#pin').dispatchEvent('input');check(`${width}px numeric PIN sanitation`,/^\d*$/.test(await page.locator('#pin').inputValue()));
  if(width===390)await accessibility(page,'Mobile join');
  await page.goto(base+'#host/friends');await page.locator('#count').waitFor();check(`${width}px offers six or ten questions`,JSON.stringify(await page.locator('#count option').evaluateAll(options=>options.map(o=>o.value)))===JSON.stringify(['6','10']));await noOverflow(page,`${width}px host setup fits`);
  await page.goto(base+'#builder');await noOverflow(page,`${width}px builder fits`);
  await context.close();
 }
 const solo=await newPage({width:390,height:844});await solo.page.goto(base+'#daily');
 for(let i=0;i<5;i++){
  await solo.page.locator('[data-answer]').first().click();
  if(await solo.page.locator('[data-action="solo-lock"]').count())await solo.page.locator('[data-action="solo-lock"]').click();
  await solo.page.locator('[data-action="solo-next"]').click();
 }
 check('Daily Pop completes five questions',await solo.page.getByText('YOUR DAILY LITTLE WIN',{exact:true}).isVisible());
 await solo.page.reload();check('Daily results survive refresh',await solo.page.getByText('YOUR DAILY LITTLE WIN',{exact:true}).isVisible());
 check('Daily first completed attempt is saved',await solo.page.evaluate(()=>JSON.parse(localStorage.getItem('quickpop-daily')).answers.length===5));
 await accessibility(solo.page,'Daily result mobile');const spacing=await solo.page.evaluate(()=>{const a=document.querySelector('.result-title .center-actions').getBoundingClientRect(),b=document.querySelector('.result-note').getBoundingClientRect();return b.top-a.bottom;});check('Result note clears button shadows',spacing>=20);await solo.page.screenshot({path:'test-results/result-mobile.png',fullPage:true});
 const downloadPromise=solo.page.waitForEvent('download');
 await solo.page.locator('[data-action="download-card"]').click();
 const download=await downloadPromise;await download.saveAs('test-results/result-card.png');
 check('Result image downloads as PNG',download.suggestedFilename()==='quickpop-result.png');
 await solo.page.goto(base+'#builder');
 await solo.page.locator('[data-action="host-custom"]').click();check('Builder refuses incomplete questions',await solo.page.locator('#form-error').isVisible());
 const custom={title:'Office <script>test</script>',questions:Array.from({length:3},(_,i)=>({text:`Which answer is correct in round ${i+1}?`,options:['Correct','Wrong'],correct:[0],fact:'A private, original test question.'}))};
 await solo.page.locator('#import-quiz').setInputFiles({name:'quiz.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(custom))});
 await solo.page.waitForFunction(title=>document.querySelector('#quiz-title')?.value===title,custom.title);check('JSON import preserves safe literal text',await solo.page.locator('#quiz-title').inputValue()===custom.title);
 await solo.page.locator('[data-up="1"]').click();await solo.page.locator('[data-duplicate="1"]').click();check('Builder can reorder and duplicate',await solo.page.locator('.builder-question').count()===4);
 await solo.page.locator('[data-action="practice-custom"]').click();await solo.page.locator('[data-answer]').first().waitFor();check('Custom quiz solo preview works',await solo.page.locator('[data-answer]').count()===2);
 await solo.context.close();

 // Real Worker + Durable Object integration, using independent browser sessions.
 const host=await newPage(),player=await newPage({width:390,height:844});
 await host.page.goto(base+'#host/friends');
 await host.page.locator('#count').selectOption('6');await host.page.locator('#seconds').selectOption('10');
 await host.page.locator('#create-room').click();await host.page.locator('.giant-pin').waitFor({timeout:15000});
 const pin=(await host.page.locator('.giant-pin').innerText()).trim();check('Hosted room receives four-digit PIN',/^\d{4}$/.test(pin));
 check('Lobby renders a join QR',await host.page.locator('#qr').evaluate(c=>c.width>100));
 await player.page.goto(base+`#join/${pin}`);await player.page.locator('#nickname').fill('Browser Fox');await player.page.locator('#join-button').click();
 await player.page.locator('#room-view').waitFor();await host.page.locator('.player-bubble').filter({hasText:'Browser Fox'}).waitFor();
 check('Player appears live on host screen');
 await host.page.locator('[data-action="next"]').click();
 for(let round=0;round<6;round++){
  await player.page.locator('#room-view[data-phase="question"]').waitFor();
  const first=player.page.locator('[data-answer]').first();await first.waitFor();
  await player.page.waitForFunction(()=>!document.querySelector('[data-answer]')?.disabled);
  await first.click();if(await player.page.locator('[data-action="lock-multi"]').count())await player.page.locator('[data-action="lock-multi"]').click();
  await player.page.getByText('✓ ANSWER LOCKED. THE REVEAL IS COMING.').waitFor();
  check(`Live round ${round+1}: player answer locks`);
  if(round===0){await player.page.reload();await player.page.getByText('✓ ANSWER LOCKED. THE REVEAL IS COMING.').waitFor();check('Refresh reconnect retains locked answer and identity');}
  await player.page.locator('#room-view[data-phase="reveal"]').waitFor({timeout:16000});
  check(`Live round ${round+1}: automatic timed reveal`);
  await noOverflow(player.page,`Live round ${round+1}: mobile reveal fits`);
  if(round===0){await accessibility(player.page,'Mobile reveal');await player.page.screenshot({path:'test-results/player-reveal.png',fullPage:true});}
  await host.page.locator('[data-action="next"]').click();
 }
 await player.page.locator('#room-view[data-phase="finished"]').waitFor();
 check('Full game reaches podium');await accessibility(host.page,'Host podium');
 await host.page.screenshot({path:'test-results/host-podium.png',fullPage:true});
 await host.page.locator('[data-action="rematch"]').click();await player.page.locator('#room-view[data-phase="lobby"]').waitFor();
 check('Rematch retains player session');check('Rematch increments series round',await host.page.getByText('YOU’RE HOSTING · ROUND 2').isVisible());
 host.page.once('dialog',d=>d.accept());await host.page.locator('[data-action="close-room"]').click();await player.page.locator('.hero').waitFor();check('Closing a room returns players home');
 await host.context.close();await player.context.close();
 check('No browser JavaScript exceptions',pageErrors.length===0);
}catch(e){report.errors.push({message:e.message,stack:e.stack});console.error(e);process.exitCode=1;}
finally{await browser.close();await writeFile('test-results/browser-report.json',JSON.stringify(report,null,2));console.log(`${report.checks.length} browser checks recorded; ${report.errors.length} failures.`);}

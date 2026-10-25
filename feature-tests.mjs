import AxeBuilder from '@axe-core/playwright';
import {gunzipSync} from 'node:zlib';
import {checkEvidence} from './agent-sources.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {PACKS,chooseDifficulty,difficultyModes} from './quiz-bank.js';
import {validateRequest,validateGenerated} from './agent-schema.js';
import {MEDIA} from './visual-media.js';
import {readFile,mkdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
let checks=0;const pass=s=>{checks++;console.log('PASS',s)};
for(const p of PACKS.filter(p=>!p.id.startsWith('generated-'))){assert.deepEqual(difficultyModes(p),['easy','hard']);const easy=chooseDifficulty(p,'easy'),hard=chooseDifficulty(p,'hard');assert.equal(easy.questions.length,10);assert.equal(hard.questions.length,10);assert(hard.questions.every(q=>!easy.questions.some(e=>e.id===q.id)));}
pass('26 packs have separate ten-question easy and hard banks');
for(const p of PACKS)for(const q of p.questions)if(q.image){assert(MEDIA[q.image]?.svg.includes('<svg'));assert(!/(?:href|src)=["']https?:|<script|onload=/.test(MEDIA[q.image].svg));}
pass('All quiz images are bundled, self-contained SVGs');
const request={action:'generate',requestId:'11111111-1111-4111-8111-111111111111',topic:'Solar System',difficulty:'easy'};
assert.deepEqual(validateRequest(request),request);for(const bad of [{...request,requestId:'../bad'},{...request,topic:'<script>'},{...request,difficulty:'extreme'}])assert.throws(()=>validateRequest(bad));
const quiz=validateGenerated(chooseDifficulty(PACKS.find(p=>p.id==='science'),'easy'),request);assert.equal(quiz.questions.length,10);assert.throws(()=>validateGenerated({...quiz,questions:quiz.questions.slice(1)},request));assert.throws(()=>validateGenerated({...quiz,questions:Array(10).fill(quiz.questions[0])},request));assert.throws(()=>checkEvidence({questions:[{sourceQuote:'An invented source passage about the Sun',options:['Sun'],correct:[0]}]},{text:'Mercury is the closest planet to the Sun.'}));pass('Agent schema rejects invalid requests, incomplete, duplicate and unsupported output');
const browser=await chromium.launch({headless:true});await mkdir('test-results',{recursive:true});
try{for(const width of [390,1440]){
 const ctx=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block',reducedMotion:'reduce'});await ctx.addInitScript(()=>window.QUICKPOP_STATIC=true);const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['#admin','#host/guess-food','#practice/guess-logo/6/hard','#home']){await page.goto(base+route);await page.locator('main h1').waitFor();if(route==='#home')await page.locator('#search').fill('flag');const result=await new AxeBuilder({page}).analyze();assert.deepEqual(result.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id),[]);pass(`${width}px accessible ${route}`);}
 await page.goto(base);await page.locator('#search').fill('logo');await page.getByRole('option').first().waitFor();await page.locator('#search').press('ArrowDown');await page.locator('#search').press('Enter');assert.equal(await page.locator('.pack').count(),1);assert.equal(await page.locator('#search').inputValue(),'Guess the Logo');pass(`${width}px keyboard suggestions select a topic`);
 await page.locator('#search').fill('no-such-topic-xyz');await page.getByRole('heading',{name:'COMING SOON'}).waitFor();await page.locator('[data-action="clear-search"]').click();assert.equal(await page.locator('.pack').count(),PACKS.length);pass(`${width}px missing topic and clear search`);
 for(const id of ['guess-food','guess-logo','guess-flag']){
  await page.goto(base+'#host/'+id);await page.locator('#difficulty').selectOption('hard');await page.locator('#count').selectOption('10');await page.locator('[data-practice]').click();await page.locator('.quiz-picture').waitFor();assert(await page.locator('.quiz-picture').evaluate(i=>i.complete&&i.naturalWidth>0));assert((await page.locator('.eyebrow').last().innerText()).includes('HARD'));await page.locator('[data-answer]').first().click();const r=await page.locator('[data-action="solo-next"]').boundingBox();assert(r.y>=0&&r.y+r.height<=844);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`test-results/${id}-${width}.png`});pass(`${width}px ${id} hard image round and visible Next`);
 }
 for(const id of ['food','guess-food']){
  const seen=new Set(),pack=PACKS.find(p=>p.id===id);
  for(const level of ['easy','hard']){
   await page.goto(base+'#host/'+id);await page.locator('#difficulty').selectOption(level);await page.locator('#count').selectOption('10');await page.locator('[data-practice]').click();
   const questions=chooseDifficulty(pack,level).questions;
   for(const [index,q] of questions.entries()){
    assert.equal(await page.locator('.question-title').innerText(),q.text);
    assert((await page.locator('.eyebrow').last().innerText()).includes(level.toUpperCase()));
    const key=q.image||q.text;assert(!seen.has(key),`${id} repeats a displayed question across modes`);seen.add(key);
    if(q.image)assert(await page.locator('.quiz-picture').evaluate(i=>i.complete&&i.naturalWidth>0));
    for(const answer of q.correct)await page.locator(`[data-answer="${answer}"]`).click();
    if(q.type==='multi')await page.locator('[data-action="solo-lock"]').click();
    assert(await page.getByText('YOU KNOW YOUR STUFF.',{exact:true}).isVisible());
    const next=page.locator('[data-action="solo-next"]');
    assert(await next.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Next must be visible and unobscured');
    if(index===3)await page.screenshot({path:`test-results/${id}-${level}-verified-${width}.png`});
    await next.click();
   }
   assert((await page.locator('.result-title .display').innerText()).includes('10 / 10'));
   pass(`${width}px ${id} ${level}: all ten intended questions, correct scoring and visible Next`);
  }
  assert.equal(seen.size,20);
 }
 await page.goto(base+'#admin');await page.locator('#admin-password').fill('wrong');await page.locator('#admin-login button').click();await page.locator('#admin-error').waitFor();assert(await page.locator('#admin-error').isVisible());
 if(!process.env.QA_ADMIN_PASSWORD){const c=JSON.parse(await readFile('admin-config.json','utf8'));await page.evaluate(hash=>{crypto.subtle.deriveBits=async()=>Uint8Array.from(hash.match(/../g),h=>parseInt(h,16)).buffer},c.hash);}await page.locator('#admin-password').fill(process.env.QA_ADMIN_PASSWORD||'qa-only-unlock');await page.locator('#admin-login button').click();await page.locator('#agent-topic').waitFor();await page.locator('#agent-topic').fill('Solar System');await page.locator('#agent-difficulty').selectOption('hard');await page.locator('#agent-form button').click();const href=await page.locator('#request-link a').getAttribute('href');const parsed=JSON.parse(new URL(href).searchParams.get('body').match(/```json\s*([\s\S]*?)```/)[1]);assert.equal(parsed.difficulty,'hard');assert.equal(parsed.topic,'Solar System');pass(`${width}px admin password and GitHub request preparation`);
 await page.route('https://raw.githubusercontent.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'ready',requestId:parsed.requestId,quiz})}));await page.locator('#check-agent').click();await page.locator('#review-confirm').waitFor();assert.equal(await page.locator('.draft-questions > li').count(),10);assert(await page.locator('#publish-draft').isDisabled());await page.locator('#review-confirm').check();await page.locator('#publish-draft').click();const publishURL=new URL(await page.locator('#publish-link a').getAttribute('href'));assert(publishURL.searchParams.get('title').includes('publish'));const pub=JSON.parse(publishURL.searchParams.get('body').match(/```json\s*([\s\S]*?)```/)[1]);const reviewed=JSON.parse(gunzipSync(Buffer.from(pub.reviewed,'base64url')));assert.equal(reviewed.questions.length,10);await page.locator('.review-editor summary').click();await page.locator('[data-review-fact]').first().fill('A corrected explanation reviewed by the quiz owner.');assert(await page.locator('#publish-draft').isDisabled());await page.locator('#review-confirm').check();await page.locator('#publish-draft').click();await page.locator('#publish-link a').waitFor();await page.screenshot({path:`test-results/admin-${width}.png`});pass(`${width}px ten-question review and explicit publication`);
 assert.equal(errors.length,0,errors.join('\n'));await ctx.close();
}
}finally{await browser.close();}
console.log(`${checks} new-feature checks passed`);


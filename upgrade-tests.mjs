import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {validatePhoto,MAX_PHOTO_CHARS} from './photos.js';
import {validateQuiz} from './engine.js';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
const report={checks:[],errors:[]},pass=name=>{report.checks.push(name);console.log('PASS',name)};
await mkdir('test-results',{recursive:true});
const photo=JSON.parse(await readFile('meme-media.json','utf8'))['meme-doge'].src;
const readMusic=await readFile('music.js','utf8');
for(const bad of ['https://example.com/photo.jpg','data:image/svg+xml;base64,PHN2Zz4=','data:image/jpeg;base64,AAAA','x'.repeat(MAX_PHOTO_CHARS+1)])assert.throws(()=>validatePhoto(bad));
pass('Photo validation rejects remote URLs, SVG, invalid headers and oversized data');
const quiz={title:'Photo QA',questions:Array.from({length:3},(_,i)=>({text:`Which colour is pictured in round ${i+1}?`,options:['Red','Green','Blue','Yellow'],correct:[0],fact:'A photograph test.'}))};
assert.throws(()=>validateQuiz({...quiz,questions:quiz.questions.map(q=>({...q,photo:'data:image/jpeg;base64,AAAA'}))}));
async function inView(page,selector){return page.locator(selector).evaluateAll(es=>es.every(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+.5&&r.left>=0&&r.right<=innerWidth+.5&&r.height>=44&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}
async function post(path,data){const r=await fetch(new URL('api/'+path,base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.status,201);return r.json();}
async function connect(pin,token){const u=new URL(`api/rooms/${pin}/socket`,base);u.protocol=u.protocol==='https:'?'wss:':'ws:';const ws=new WebSocket(u);let state;const listeners=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='state'){state=m.state;for(const f of [...listeners])f(state);}};await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});ws.send(JSON.stringify({type:'auth',token}));const wait=predicate=>state&&predicate(state)?Promise.resolve(state):new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('State timeout')),18000);const f=s=>{if(predicate(s)){clearTimeout(timer);listeners.splice(listeners.indexOf(f),1);resolve(s);}};listeners.push(f);});await wait(()=>true);return{ws,wait,send:(type,data={})=>ws.send(JSON.stringify({type,...data}))};}
for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]){
 const browser=await engine.launch({headless:true});
 try{
  for(const [width,height] of [[375,812],[414,896],[375,635],[320,568],[812,375],[1366,768]]){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<900,serviceWorkers:'block',reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of ['#practice/guess-food/6/hard','#practice/memology/6/easy','#practice/finish-lyrics/6/easy']){
    await page.goto(base+route);await page.locator('[data-answer]').first().waitFor();await page.evaluate(()=>document.fonts.ready);
    assert(await inView(page,'[data-answer]'),`${name} ${width} answers in view`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('[data-answer]').first().tap();
    assert(await inView(page,'[data-action="solo-next"]'),`${name} ${width} Next in view`);
    if(route.includes('memology')){assert(await page.locator('.quiz-picture').evaluate(el=>el.complete&&el.naturalWidth>0));await page.screenshot({path:`test-results/upgrade-${name}-${width}.png`});}
    await page.locator('[data-action="solo-next"]').tap();
    assert((await page.locator('.question-header').innerText()).includes('2 / 6'));
   }
   assert.deepEqual(errors,[]);pass(`${name} ${width}×${height}: one-tap answers and Next for text, food and real meme pictures`);await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:375,height:635},hasTouch:true,isMobile:true,serviceWorkers:'block'}),page=await ctx.newPage();
  await page.goto(base+'#builder');await page.locator('#import-quiz').setInputFiles({name:'quiz.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(quiz))});
  await page.locator('#photo-0').setInputFiles({name:'camera-roll.jpg',mimeType:'image/jpeg',buffer:Buffer.from(photo.split(',')[1],'base64')});await page.locator('.photo-preview').waitFor();await page.locator('#photo-alt-0').fill('A dog in the snow');
  await page.reload();await page.locator('.photo-preview').waitFor();const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('quickpop-draft')));validatePhoto(stored.questions[0].photo);assert.equal(stored.questions[0].photoAlt,'A dog in the snow');
  const downloading=page.waitForEvent('download');await page.locator('[data-action="export-quiz"]').click();const downloaded=await downloading;const data=JSON.parse(await readFile(await downloaded.path(),'utf8'));assert.equal(data.questions[0].photo,stored.questions[0].photo);
  await page.locator('[data-remove-photo="0"]').click();assert.equal(await page.locator('.photo-preview').count(),0);await page.locator('#import-quiz').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('.photo-preview').waitFor();
  await page.locator('[data-action="practice-custom"]').click();await page.locator('.quiz-picture').waitFor();assert(await page.locator('.quiz-picture').evaluate(i=>i.complete&&i.naturalWidth>0));pass(`${name}: camera-roll compression, description, reload, export, remove, import and solo preview`);
  // Exercise real audio synthesis through the same module; no remote audio requests.
  await page.goto(base);if(await page.evaluate(()=>!!(window.AudioContext||window.webkitAudioContext))){await page.route('**/music-qa.js',r=>r.fulfill({contentType:'text/javascript',body:readMusic}));
  await page.evaluate(async()=>{const {createMusic}=await import('./music-qa.js');window.qaMusic=createMusic();});
  await page.evaluate(()=>{qaMusic.enable(true);qaMusic.play(true);document.querySelector('#sound').addEventListener('click',()=>qaMusic.unlock(),{once:true});});await page.locator('#sound').click();await page.waitForFunction(()=>qaMusic.status().running);assert((await page.evaluate(()=>qaMusic.status())).playing);await page.evaluate(()=>{qaMusic.volume(.2);qaMusic.enable(false);});assert.equal((await page.evaluate(()=>qaMusic.status())).enabled,false);await page.evaluate(()=>qaMusic.play(false));pass(`${name}: original audio starts, volume changes and mute works`);}else{assert(await page.locator('#sound').isDisabled());pass(`${name}: audio unavailable in this test engine; sound control gracefully disabled (audio playback not tested)`);}
  await ctx.close();
  const longContext=await browser.newContext({viewport:{width:320,height:568},serviceWorkers:'block'}),longPage=await longContext.newPage();
  const longQuiz={...quiz,questions:quiz.questions.map((q,i)=>({...q,text:('A detailed custom question '+i+' ').repeat(7).slice(0,230),options:['First','Second','Third','Fourth'].map(x=>(x+' long answer ').repeat(7).slice(0,100))}))};
  await longPage.goto(base+'#builder');await longPage.locator('#import-quiz').setInputFiles({name:'long.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(longQuiz))});await longPage.locator('[data-action="practice-custom"]').click();await longPage.locator('[data-answer]').first().click();assert(await inView(longPage,'[data-action="solo-next"]'));assert(await longPage.evaluate(()=>scrollY===0));await longContext.close();pass(name+': longest custom content keeps Next accessible on a small screen');
  // Regression: another player's answer arrives between pointer-down and pointer-up.
  const room=await post('rooms',{custom:quiz,settings:{count:3,seconds:10,shuffle:false}}),host=await connect(room.pin,room.token),otherInfo=await post(`rooms/${room.pin}/join`,{name:'Other QA'}),other=await connect(room.pin,otherInfo.token);
  const touch=await browser.newContext({viewport:{width:375,height:635},hasTouch:true,isMobile:true,serviceWorkers:'block'}),p=await touch.newPage();
  try{
   await p.goto(base+`#join/${room.pin}`);await p.locator('#nickname').fill('Touch QA');await p.locator('#join-button').click();await p.locator('#room-view[data-phase=lobby]').waitFor();host.send('next');await p.waitForFunction(()=>document.querySelector('[data-answer]')?.disabled===false);
   const element=await p.locator('[data-answer]').first().elementHandle(),box=await element.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();other.send('answer',{index:0,choices:[0]});await p.waitForFunction(()=>document.querySelector('#answered-count')?.textContent==='1');assert(await element.evaluate(el=>el===document.querySelector('[data-answer]')));await p.mouse.up();await p.getByText('✓ ANSWER LOCKED. THE REVEAL IS COMING.').waitFor();assert.equal(await p.locator('[data-answer][aria-pressed=true]').count(),1);pass(`${name}: incoming player updates preserve answer DOM and a held tap locks exactly once`);
   await p.reload();await p.getByText('✓ ANSWER LOCKED. THE REVEAL IS COMING.').waitFor();pass(`${name}: reload preserves locked answer`);
  }finally{host.send('close');await touch.close();host.ws.close();other.ws.close();}
 }catch(e){report.errors.push({browser:name,message:e.message});console.error(e);process.exitCode=1;}finally{await browser.close();}
}
await writeFile('test-results/upgrade-report.json',JSON.stringify(report,null,2));
console.log(`${report.checks.length} upgrade checks; ${report.errors.length} failures.`);

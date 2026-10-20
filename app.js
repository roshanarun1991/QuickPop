import {PACKS,CATEGORIES,AVATARS,dailyPack} from './quiz-bank.js';
import {validateQuiz,cleanName} from './engine.js';
import QRCode from 'qrcode';
const $=s=>document.querySelector(s),main=$('#main'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shapes=['▲','●','■','◆'],colors=['blue','yellow','green','pink'];
const staticHost=location.hostname.endsWith('.github.io')||globalThis.QUICKPOP_STATIC===true;
const liveUnavailable='Live multiplayer is not connected yet. You can explore the setup now; joining and starting rooms will work once the game server is connected. Solo play and Daily Pop are ready.';
const liveNotice=()=>staticHost?`<p class="notice live-note">${liveUnavailable}</p>`:'';
const memory=new Map();
const read=(key,fallback)=>{if(memory.has(key))return memory.get(key);try{return JSON.parse(localStorage.getItem(`quickpop-${key}`))??fallback;}catch{return fallback;}};
const write=(key,value)=>{memory.set(key,value);try{localStorage.setItem(`quickpop-${key}`,JSON.stringify(value));return true;}catch{toast('Playing without browser storage. Keep this tab open; export drafts to keep them.');return false;}};
let selectedCategory='All',search='',avatar=0,socket=null,current=null,session=null,offset=0,retryTimer=null,retries=0,solo=null,sound=read('sound',false),busy=false,lastVersion=-1;
let draft=read('draft',{title:'Our office knows best',questions:[blankQuestion(),blankQuestion(),blankQuestion()]});
function blankQuestion(){return {text:'',options:['','','',''],correct:[0],fact:''};}
function toast(message){const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,5000);}
function error(message){if(message===liveUnavailable&&$('.live-note'))$('.live-note').hidden=true;const el=$('#form-error');if(el){el.textContent=message;el.hidden=false;el.tabIndex=-1;el.focus();}else toast(message);}
function setPage(html){main.innerHTML=html;main.focus({preventScroll:true});window.scrollTo(0,0);}
function fieldError(){return '<p id="form-error" class="notice error" role="alert" hidden></p>';}
function modal(title,html){$('#modal-content').innerHTML=`<h2 id="modal-title">${esc(title)}</h2>${html}`;$('#modal').showModal();}
function closeConnection(){clearTimeout(retryTimer);if(socket){socket.onopen=socket.onmessage=socket.onerror=socket.onclose=null;socket.close();socket=null;}current=null;session=null;lastVersion=-1;}
async function api(path,data){
  if(staticHost)throw Error(liveUnavailable);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(`./api/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
    const body=await response.json().catch(()=>({error:'Live rooms are unavailable right now. Practice and Daily Pop still work.'}));
    if(!response.ok)throw Error(body.error||'Please try again.');return body;
  }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('Connection interrupted. Check your internet and try again.');throw e;}
  finally{clearTimeout(timeout);}
}
function themeDark(){return document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;}
function updateThemeButton(){$('#theme').textContent=themeDark()?'☀':'☾';$('#theme').setAttribute('aria-label',`Switch to ${themeDark()?'day':'night'} mode`);}
$('#theme').onclick=()=>{const value=themeDark()?'light':'dark';document.documentElement.dataset.theme=value;try{localStorage.setItem('quickpop-theme',value);}catch{}updateThemeButton();};
updateThemeButton();matchMedia('(prefers-color-scheme:dark)').addEventListener('change',updateThemeButton);
function updateSound(){$('#sound').innerHTML=`${sound?'♪':'♫'} <span>Sound ${sound?'on':'off'}</span>`;$('#sound').setAttribute('aria-label',`Turn sound ${sound?'off':'on'}`);$('#sound').setAttribute('aria-pressed',sound);}
$('#sound').onclick=()=>{sound=!sound;write('sound',sound);updateSound();if(sound)beep(true);};updateSound();
function beep(good){if(!sound)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=good?660:220;g.gain.setValueAtTime(.06,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);o.start();o.stop(ctx.currentTime+.2);o.onended=()=>ctx.close();}catch{}}
$('#modal-close').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))$('#modal').close();});
$('#privacy').onclick=()=>modal('Good fun. Small footprint.',`
 <p>No accounts, ads or analytics trackers. Your theme, nickname, practice results, quiz drafts and room recovery tokens stay in this browser.</p>
 <p>Live games send nicknames, answers and scores to the hosted game server. Room data is deleted when the host closes it, after 10 minutes on the final screen, or when its time limit expires. Short-lived, hashed network counters help limit PIN guessing.</p>
 <p>A room PIN is an invitation, not a password. Share it with your group. Hosts can remove players before starting; games lock when they start.</p>
 <p>Live scoring uses answer arrival time at the server. Network speed can make a small difference; choose <b>accuracy scoring</b> for a more relaxed game. This is a social game, not a secure examination.</p>
 <p>Daily Pop changes at midnight UTC. Local results can be cleared with your browser data. Hosting providers necessarily process network requests.</p>
 <button class="btn paper" data-action="clear-local">Clear my QuickPop data</button>`);
function home(){
 const daily=read('daily',{}),today=new Date().toISOString().slice(0,10),done=daily.date===today;
 setPage(`<div class="page">
 <section class="hero hero-simple"><div><div class="eyebrow">✳ YOUR NEXT COFFEE BREAK, UPGRADED.</div><h1>SMALL TALK.<br><span class="highlight">BIG QUIZ ENERGY.</span></h1><p>Round up your people. Pick a topic.<br>Find out who knows a little too much.</p><div class="hero-actions"><a class="btn" href="#topics">LET’S PLAY <span>↘</span></a><a class="btn paper" href="#join">I HAVE A PIN ↗</a></div><div class="hero-proof mono"><span>NO ACCOUNTS</span><span>JUST A NICKNAME</span><span>100% GOOD COMPANY</span></div></div>
</section>
 <section class="home-tools" aria-label="Quick ways to play"><div class="daily-card"><span class="orb" aria-hidden="true">✳</span><div><div class="eyebrow">YOUR DAILY LITTLE WIN</div><h3>DAILY POP</h3><p>${done?`${daily.correct}/5 today · ${daily.streak||1}-day streak`:'5 questions. A fresh mix every day.'}</p></div><a class="btn paper small" href="#daily">${done?'RESULTS':'PLAY SOLO'} ↗</a></div><div class="join-card"><div><div class="eyebrow">YOUR PEOPLE ARE WAITING</div><h3>GOT A GAME PIN?</h3></div><form id="quick-join"><label class="sr" for="quick-pin">Four-digit game PIN</label><input id="quick-pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="0000" aria-label="Four-digit game PIN" required><button class="btn paper" type="submit">JOIN ↗</button></form></div></section>
 <section id="topics"><div class="section-top"><div><div class="eyebrow">PICK YOUR SPECIAL SUBJECT</div><h2>WHAT’S YOUR THING?</h2></div><div class="search"><label class="sr" for="search">Search quiz topics</label><input id="search" type="search" placeholder="Search your obsession..." value="${esc(search)}"></div></div>
 <div class="filters" aria-label="Quiz categories">${['All',...CATEGORIES].map(c=>`<button class="chip" data-category="${esc(c)}" aria-pressed="${selectedCategory===c}">${esc(c)}</button>`).join('')}</div><div id="packs" class="pack-grid"></div><p class="hint" id="pack-count" aria-live="polite"></p></section>
 <section class="create-banner"><div><div class="eyebrow">MAKE IT PERSONAL</div><h2>INSIDE JOKES. OUTSIDE KNOWLEDGE.</h2><p>The office coffee order. That legendary team trip. Make a private quiz for the people who were there.</p></div><a class="btn paper" href="#builder">CREATE YOUR OWN +</a></section>
 <section class="how-grid" aria-label="How to play"><article><span class="step-no">01</span><div><h3>PICK A TOPIC</h3><p>Pop culture, places, food and a few friendly rivalries.</p></div></article><article><span class="step-no">02</span><div><h3>SHARE THE PIN</h3><p>Your colleagues join on their phones. No downloads.</p></div></article><article><span class="step-no">03</span><div><h3>LET IT GET COMPETITIVE</h3><p>Answer, reveal, celebrate. A rematch is always an option.</p></div></article></section></div>`);
 if(staticHost)document.querySelector('.home-tools').insertAdjacentHTML('afterend',liveNotice());
 renderPacks();
 if($('#quick-join')){$('#quick-join').onsubmit=e=>{e.preventDefault();location.hash=`join/${$('#quick-pin').value}`;};$('#quick-pin').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);}
 $('#search').oninput=e=>{search=e.target.value;renderPacks();};
 if(location.hash==='#topics')$('#topics').scrollIntoView();
}
function renderPacks(){
 const matches=PACKS.filter(p=>(selectedCategory==='All'||p.category===selectedCategory)&&`${p.title} ${p.category} ${p.description}`.toLowerCase().includes(search.toLowerCase().trim()));
 $('#packs').innerHTML=matches.length?matches.map(p=>`<button class="pack" data-pack="${p.id}" aria-label="Play ${esc(p.title)}"><div class="pack-art ${p.color}"><span class="pack-index">PACK ${String(PACKS.indexOf(p)+1).padStart(2,'0')}</span><span class="pack-icon" aria-hidden="true">${p.icon}</span><span class="pack-tag">${esc(p.category)}</span></div><div class="pack-info"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="pack-meta"><span>${p.questions.length} QUESTIONS · MIXED</span><span>↗</span></div></div></button>`).join(''):'<div class="empty" style="grid-column:1/-1"><h3>NO MATCH. YET.</h3><p>Try another topic or make your own.</p><button class="btn paper" data-action="clear-search">Clear search</button></div>';
 $('#pack-count').textContent=`${matches.length} of ${PACKS.length} original quiz packs`;
}
function getPack(id){return id==='custom'?validateQuiz(draft):PACKS.find(p=>p.id===id);}
function hostSetup(id){
 let pack;try{pack=getPack(id);}catch(e){location.hash='builder';toast(e.message);return;}
 if(!pack){location.hash='home';return;}
 setPage(`<div class="page narrow"><a class="back" href="#home">← ALL TOPICS</a><div class="panel"><div class="setup-head"><div class="setup-icon ${pack.color||'pink'}">${pack.icon||'✎'}</div><div><div class="eyebrow">${esc(pack.category||'YOUR OWN CREATION')}</div><h1>${esc(pack.title)}</h1><p>${pack.questions.length} original questions · play at your pace</p></div></div><p>${esc(pack.description||'Made for your people. Ready for the big screen.')}</p>
 ${liveNotice()}<form id="host-form">${fieldError()}<div class="two-col"><div class="field"><label for="count">Questions</label><select id="count">${(id==='custom'?[6,10,pack.questions.length].filter((n,i,a)=>n<=pack.questions.length&&a.indexOf(n)===i):[6,10]).map(n=>`<option value="${n}" ${n===Math.min(6,pack.questions.length)?'selected':''}>${n} questions</option>`).join('')}</select></div><div class="field"><label for="seconds">Time per question</label><select id="seconds"><option value="10">10 seconds · Quick</option><option value="15" selected>15 seconds · Classic</option><option value="20">20 seconds · Relaxed</option><option value="30">30 seconds · Extra time</option></select></div></div>
 <details class="details"><summary>MAKE IT YOUR KIND OF GAME</summary><label class="checkline"><input id="accuracy" type="checkbox">Accuracy scoring — no speed bonus</label><label class="checkline"><input id="auto" type="checkbox">Automatically continue after each reveal</label><label class="checkline"><input id="host-plays" type="checkbox">I’m playing on this screen too</label><div class="field"><label for="host-name">My nickname (if playing)</label><input id="host-name" value="Quiz Captain" maxlength="16"></div></details>
 <p class="hint">Up to 200 players. The room locks when you start. Correct answers are revealed together.</p><div class="actions"><button class="btn" id="create-room" type="submit">START A ROOM ↗</button><button class="btn paper" type="button" data-practice="${esc(id)}">TRY SOLO FIRST</button></div></form></div></div>`);
 $('#host-form').onsubmit=async e=>{
   e.preventDefault();if(busy)return;busy=true;const b=$('#create-room');b.disabled=true;b.textContent='MAKING ROOM…';
   try{const result=await api('rooms',{...(id==='custom'?{custom:pack}:{pack:id}),settings:{count:Number($('#count').value),seconds:Number($('#seconds').value),accuracy:$('#accuracy').checked,auto:$('#auto').checked,teams:false,hostPlays:$('#host-plays').checked,hostName:$('#host-name').value}});saveSession(result);location.hash=`room/${result.pin}`;}
   catch(e){error(e.message);}finally{busy=false;if(b.isConnected){b.disabled=false;b.textContent='START A ROOM ↗';}}
 };
}
const randomName=()=>`${['Disco','Fika','Quiz','Lucky','Turbo','Cosmic'][Math.floor(Math.random()*6)]} ${['Fox','Panda','Pickle','Tiger','Otter','Kiwi'][Math.floor(Math.random()*6)]}`;
function joinScreen(pin=''){

 setPage(`<div class="page narrow"><a class="back" href="#home">← BACK TO THE GOOD STUFF</a><div class="panel"><div class="eyebrow">A LITTLE PIN. A LOT OF POTENTIAL.</div><h1 style="font-size:58px;margin:12px 0">YOU’RE IN THE<br>RIGHT PLACE.</h1>${liveNotice()}<form id="join-form">${fieldError()}<div class="field"><label for="pin">Four-digit game PIN</label><input class="pin-input" id="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="0000" value="${esc(pin.replace(/\D/g,'').slice(0,4))}" required></div><div class="field"><label for="nickname">Your nickname</label><div style="display:flex;gap:12px"><input id="nickname" maxlength="16" value="${esc(read('nickname',randomName()))}" required autocomplete="off"><button class="btn square paper" type="button" data-action="random-name" aria-label="Suggest a nickname">⚄</button></div></div><div class="field"><label>Pick your game face</label><div class="avatar-grid">${AVATARS.map((a,i)=>`<button type="button" class="avatar-btn" data-avatar="${i}" aria-label="Avatar ${i+1}: ${a}" aria-pressed="${avatar===i}">${a}</button>`).join('')}</div></div><button class="btn cyan" type="submit" id="join-button" style="width:100%">LET ME IN ↗</button><p class="hint">Use a nickname, not your full name. No account needed.</p></form></div></div>`);
 $('#pin').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);
 $('#join-form').onsubmit=async e=>{
  e.preventDefault();if(busy)return;busy=true;const b=$('#join-button');b.disabled=true;
  try{const name=cleanName($('#nickname').value),pin=$('#pin').value;if(!/^\d{4}$/.test(pin))throw Error('Enter the four digits from the host’s screen.');
   if(staticHost)throw Error(liveUnavailable);
   const existing=read('sessions',{})[pin];
   if(existing&&confirm('You have a saved session for this PIN. Reconnect to it?')){location.hash=`room/${pin}`;return;}
   const result=await api(`rooms/${pin}/join`,{name,avatar,team:0});write('nickname',name);saveSession(result);location.hash=`room/${pin}`;
  }catch(e){error(e.message);}finally{busy=false;b.disabled=false;}
 };
}
function saveSession(value){const all=read('sessions',{}),now=Date.now();for(const [pin,s] of Object.entries(all))if(now-s.at>7200000)delete all[pin];all[value.pin]={...value,at:now};write('sessions',all);}
function roomRoute(pin){
 session=read('sessions',{})[pin];if(!session){location.hash=`join/${pin}`;return;}
 setPage('<div class="page narrow"><div class="panel"><h1 style="font-size:45px">FINDING YOUR PEOPLE…</h1><p>Connecting to your quiz room.</p><a href="#join" class="btn paper">Back to join</a></div></div>');
 connectRoom();
}
function connectRoom(){
 if(!session)return;const url=new URL(`./api/rooms/${session.pin}/socket`,location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';
 socket=new WebSocket(url);
 socket.onopen=()=>{retries=0;socket.send(JSON.stringify({type:'auth',token:session.token}));connectionStatus(true);};
 socket.onmessage=e=>{
  let msg;try{msg=JSON.parse(e.data);}catch{return;}
  if(msg.type==='state'){
   offset=msg.state.serverNow-Date.now();
   if(current?.index!==msg.state.index||current?.round!==msg.state.round)multi=[];
   current=msg.state;
   if(current.version!==lastVersion||!$('#room-view')){const previousPhase=$('#room-view')?.dataset.phase;lastVersion=current.version;renderRoom();if(current.phase==='reveal'&&previousPhase!=='reveal'&&current.self)beep(current.self.last?.correct);}
   connectionStatus(true);
  }else if(msg.type==='error'){
   toast(msg.message);
   if(/session.*(expired|ended)|Join again/i.test(msg.message)){const all=read('sessions',{});delete all[session.pin];write('sessions',all);closeConnection();location.hash='join';}
  }else if(msg.type==='closed'){closeConnection();location.hash='home';toast('That room has closed. A new quiz is one tap away.');}
 };
 socket.onclose=()=>{
  if(!session)return;connectionStatus(false);
  if(retries++<7){retryTimer=setTimeout(connectRoom,Math.min(8000,1000*retries));}
  else{setPage(`<div class="page narrow"><div class="panel"><h2>LET’S RECONNECT.</h2><p>The room may have closed, or your connection dropped. Your score is safe while the room is active.</p><button class="btn" data-action="reconnect">Try again</button> <a class="btn paper" href="#join">Join another room</a></div></div>`);}
 };
 socket.onerror=()=>connectionStatus(false);
}
function connectionStatus(connected){const el=$('#connection');if(el){el.textContent=connected?'LIVE & CONNECTED':'RECONNECTING…';el.classList.toggle('offline',!connected);}const now=Date.now()+offset;document.querySelectorAll('[data-answer]').forEach(b=>{if(!solo&&current?.phase==='question')b.disabled=!connected||!current.self||!!current.self.locked||now<current.startAt||now>=current.deadline;});}
function send(type,extra={}){
 if(!socket||socket.readyState!==WebSocket.OPEN){toast('Reconnecting. Give us a moment before trying again.');return;}
 socket.send(JSON.stringify({type,...extra}));
}
function shareLink(pin){const url=new URL(location.href);url.hash=`join/${pin}`;return url.toString();}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied. Send it to your people!');}catch{modal('Copy this link',`<div class="field"><input readonly value="${esc(text)}" aria-label="Link to copy" onclick="this.select()"></div>`);}}
function boardHtml(s){
 const rows=s.board.slice(0,10),self=s.board.find(p=>p.id===s.self?.id),max=Math.max(1,...s.board.map(p=>p.score));
 if(self&&self.rank>10)rows.push(self);
 return `<div class="board">${rows.map(p=>`<div class="board-row" ${p.id===s.self?.id?'aria-label="Your rank"':''}><div class="board-fill" style="width:${Math.max(3,p.score/max*100)}%"></div><span class="board-rank">${p.rank===1?'♛':p.rank}</span><span class="board-avatar">${AVATARS[p.avatar]}</span><span class="board-name">${esc(p.name)}${p.id===s.self?.id?' (you)':''}<br><span class="gain">${p.change>0?'↑ '+p.change:p.change<0?'↓ '+Math.abs(p.change):'—'} ${p.points?'· +'+p.points:''}</span></span><span class="board-score">${p.score.toLocaleString()} <small style="font:10px var(--mono)">PTS</small></span></div>`).join('')}</div>`;
}
function teamHtml(s){
 if(!s.settings.teams)return '';
 const teams=['Blue','Yellow','Green','Pink'].map((name,i)=>({name,total:s.board.filter(p=>p.team===i).reduce((a,p)=>a+p.score,0)})).sort((a,b)=>b.total-a.total);
 return `<div class="badge-strip">${teams.map(t=>`<span class="badge">TEAM ${t.name.toUpperCase()} · ${t.total}</span>`).join('')}</div>`;
}
function renderRoom(){
 const s=current;if(!s)return;
 const top=`<div class="room-top"><div><div class="eyebrow">${s.host?'YOU’RE HOSTING':'YOU’RE PLAYING'} · ROUND ${s.round}</div><h1>${esc(s.title)}</h1><span id="connection" class="connection">LIVE & CONNECTED</span></div><div class="room-meta">GAME PIN <b>${s.pin}</b><br>${s.board.length} PLAYERS<br>${s.host?'<button class="text-button" data-action="close-room">Close room</button>':'<a class="text-button" href="#home">Leave screen</a>'}</div></div>`;
 let body='';
 if(s.phase==='lobby')body=`<div class="lobby-layout"><div class="pin-card"><div class="eyebrow">OPEN QUICKPOP. ENTER THIS PIN.</div><div class="giant-pin">${s.pin}</div><canvas id="qr" class="qr" aria-label="QR code to join this room"></canvas><button class="btn paper" data-action="copy-room">COPY INVITE LINK ↗</button></div><div class="panel"><div class="eyebrow">THE GANG’S GETTING TOGETHER</div><h2 style="margin:14px 0">${s.host?'READY WHEN<br>YOU ARE.':'YOU’RE IN!<br>FIND YOUR GAME FACE.'}</h2><p>${s.host?'Share the PIN or QR code. Start when everyone is here.':'Keep this screen open. The host will start the game.'}</p><div class="players">${s.board.map(p=>`<div class="player-bubble"><span class="avatar">${AVATARS[p.avatar]}</span>${esc(p.name)}${s.host?`<button class="kick" data-kick="${p.id}" aria-label="Remove ${esc(p.name)}">×</button>`:''}</div>`).join('')||'<p class="muted">Waiting for the first brave player…</p>'}</div>${s.host?`<button class="btn" data-action="next" ${s.board.length?'':'disabled'}>LET’S GET QUIZZICAL ↗</button>`:'<div class="notice">Your score will follow you if you refresh this page.</div>'}<p class="hint">${s.settings.accuracy?'Accuracy scoring':'Speed scoring'} · ${s.settings.seconds} seconds · ${s.total} questions</p></div></div>`;
 else if(s.phase==='question')body=`<div class="game-layout">${questionHtml(s.question,s.index,s.total,true)}${s.self?`<div class="answer-grid">${answersHtml(s.question,s.self.locked?s.self.choices:multi,s.self.locked)}</div>${s.question.type==='multi'&&!s.self.locked?'<div class="actions center-actions"><button class="btn" data-action="lock-multi">LOCK IN MY ANSWERS ✓</button></div>':''}<div class="lock-note" id="lock-status">${s.self.locked?'✓ ANSWER LOCKED. THE REVEAL IS COMING.':'TRUST YOUR FIRST INSTINCT.'}</div>`:`<div class="answer-grid">${answersHtml(s.question,[],true)}</div>`}<p class="question-note"><span id="answered-count">${s.answered}</span> OF ${s.board.length} ANSWERED · CORRECT ANSWERS REVEAL TOGETHER</p></div>`;
 else if(s.phase==='reveal')body=`<div class="game-layout"><div class="eyebrow">QUESTION ${s.index+1} / ${s.total} · THE REVEAL</div><h2 class="question-title">${esc(s.question.text)}</h2><div class="answer-grid">${answersHtml(s.question,s.self?.last?.choices||[],true,true)}</div>${s.self?`<div class="feedback ${s.self.last?.correct?'':'wrong'}"><h2>${s.self.last?.correct?'NICE ONE! +'+s.self.last.points:'NEXT ONE’S YOURS.'}</h2><p>${s.self.last?.correct?`${s.self.streak} correct in a row`:'No points this time. There’s always a comeback.'}</p></div>`:''}<p class="notice">${esc(s.question.fact)}</p><h2 style="margin-top:32px">THE LEADERBOARD</h2>${boardHtml(s)}${teamHtml(s)}${s.host?`<div class="actions"><button class="btn" data-action="next">${s.index===s.total-1?'SHOW THE PODIUM':'NEXT QUESTION'} ↗</button></div>`:'<p class="hint">Stay here for the next round.</p>'}${s.settings.auto?'<p class="hint">The next screen starts automatically.</p>':''}</div>`;
 else if(s.phase==='finished'){
  const podium=[s.board[1],s.board[0],s.board[2]];
  body=`<div class="game-layout"><div class="result-title"><div class="confetti" aria-hidden="true">✳ ✦ ✳</div><div class="eyebrow">OFFICIALLY UNOFFICIAL CHAMPIONS</div><h1>THAT’S A WRAP!</h1><p>${esc(s.title)} · ${s.total} questions · ${s.board.length} very good sports</p></div><div class="podium">${podium.map((p,i)=>p?`<div class="podium-person ${i===1?'first':i===2?'third':''}"><span class="avatar">${AVATARS[p.avatar]}</span><b>${esc(p.name)}</b><div class="podium-block">${p.rank===1?'♛ ':''}${p.rank}<br><small style="font:14px var(--mono)">${p.score} PTS</small></div></div>`:'').join('')}</div>${s.self?selfAward(s):''}${teamHtml(s)}${boardHtml(s)}<div class="actions center-actions">${s.host?'<button class="btn" data-action="rematch">ONE MORE ROUND ↻</button>':''}<button class="btn cyan" data-action="share-result">SHARE THE GOOD NEWS ↗</button><a class="btn paper" href="#home">MORE TOPICS</a></div><p class="hint" style="text-align:center">Room closes in 10 minutes. A rematch keeps your group together.</p></div>`;
 }
 if(s.phase==='reveal'&&s.distribution)body=body.replace('<p class="notice">',`<div class="distribution" aria-label="Answers chosen">${s.distribution.map((n,i)=>`<div>${shapes[i]}<b>${n}</b>VOTE${n===1?'':'S'}</div>`).join('')}</div><p class="notice">`);
 main.innerHTML=`<div class="page" id="room-view" data-phase="${s.phase}">${top}${body}</div>`;
 if(s.phase==='lobby')QRCode.toCanvas($('#qr'),shareLink(s.pin),{width:190,margin:1,color:{dark:'#161713',light:'#ffffff'}}).catch(()=>toast('QR unavailable. Use the PIN or invite link.'));
 if(s.phase==='question'){updateTimer();if(s.self?.locked)document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);}
 if(s.phase==='finished'){recordLiveResult(s);addCardButton();}
}
function questionHtml(q,index,total,timed){
 return `<div class="question-header"><span>QUESTION ${index+1} / ${total}</span><span id="time-label">${timed?'GET READY':'TAKE YOUR TIME'}</span></div>${timed?'<div class="timer-track" role="progressbar" aria-label="Time remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div class="timer-fill"></div></div>':''}<h2 class="question-title">${esc(q.text)}</h2>${q.image?'<svg class="quiz-image" role="img" aria-label="A blue flag with a yellow cross" viewBox="0 0 160 100"><rect width="160" height="100" fill="#006AA7"/><path d="M50 0h20v100H50zM0 40h160v20H0z" fill="#FECC00"/></svg>':''}<p class="question-note">${q.type==='multi'?'PICK ALL CORRECT ANSWERS, THEN LOCK IN':'PICK ONE ANSWER'}</p>`;
}
function answersHtml(q,selected=[],disabled=false,revealed=false){
 return q.options.map((option,i)=>`<button class="answer ${colors[i]} ${selected.includes(i)?'selected':''} ${revealed?(q.correct.includes(i)?'correct':selected.includes(i)?'chosen-wrong':'incorrect'):''}" data-answer="${i}" aria-pressed="${selected.includes(i)}" ${disabled?'disabled':''}><span class="shape" aria-hidden="true">${shapes[i]}</span><span>${esc(option)}</span>${revealed?`<span class="sr">${q.correct.includes(i)?'Correct answer':'Incorrect answer'}</span>`:''}</button>`).join('');
}
function updateTimer(){
 if(current?.phase!=='question')return;const now=Date.now()+offset,remaining=Math.max(0,current.deadline-now),before=current.startAt-now,percent=Math.min(100,remaining/(current.settings.seconds*1000)*100);
 const fill=$('.timer-fill'),label=$('#time-label');if(fill){fill.style.width=`${percent}%`;fill.classList.toggle('urgent',remaining<5000);fill.parentElement.setAttribute('aria-valuenow',Math.round(percent));}
 if(label)label.textContent=before>0?`READY IN ${Math.ceil(before/1000)}`:remaining>0?`${Math.ceil(remaining/1000)} SECONDS`:'REVEALING…';
 if(before>0||remaining===0)document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);
 else if(current.self&&!current.self.locked&&socket?.readyState===1)document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=false);
}
setInterval(updateTimer,100);
function selfAward(s){const p=s.board.find(p=>p.id===s.self.id);return `<div class="badge-strip"><span class="badge">#${p.rank} OF ${s.board.length}</span><span class="badge">${p.correctCount}/${s.total} CORRECT</span>${p.rank===1?'<span class="badge">♛ FIRST PLACE ENERGY</span>':''}${p.bestStreak>=3?'<span class="badge">🔥 ON A ROLL</span>':''}${p.wins?`<span class="badge">${p.wins} SERIES WIN${p.wins===1?'':'S'}</span>`:''}</div>`;}
function recordLiveResult(s){if(!s.self)return;const p=s.board.find(p=>p.id===s.self.id),stats=read('stats',{});stats[s.packId]=Math.max(stats[s.packId]||0,p.score);write('stats',stats);}
function soloStart(id,count){
 const daily=id==='daily',date=new Date().toISOString().slice(0,10),done=read('daily',{});
 if(daily&&done.date===date){solo={...done,done:true,pack:dailyPack(date),daily:true,date};soloResult();return;}
 let pack=daily?dailyPack(date):getPack(id);if(!pack){location.hash='home';return;}if(!daily&&[6,10].includes(Number(count)))pack={...pack,questions:pack.questions.slice(0,Number(count))};
 const saved=daily?read('daily-progress',null):null;
 solo={pack,daily,date,index:0,correct:0,answers:[],selected:[],revealed:false,...(saved?.date===date?{index:saved.index,correct:saved.correct,answers:saved.answers}:{} )};
 if(solo.index>=pack.questions.length){soloResult();return;}renderSolo();
}
function renderSolo(){
 const s=solo,q=s.pack.questions[s.index];
 setPage(`<div class="page narrow solo-page"><a class="back" href="#home">← BACK TO TOPICS</a><div class="eyebrow">${s.daily?'DAILY POP · '+s.date:'SOLO PRACTICE · NO TIMER'}</div><h1 style="font-size:42px;margin:13px 0 25px">${esc(s.pack.title)}</h1><div class="solo-progress">${s.pack.questions.map((_,i)=>`<span class="solo-dot ${i<s.index?'done':i===s.index?'active':''}"></span>`).join('')}</div>${questionHtml(q,s.index,s.pack.questions.length,false)}<div class="answer-grid">${answersHtml(q,s.selected,s.revealed,s.revealed)}</div>${q.type==='multi'&&!s.revealed?'<div class="solo-dock" role="region" aria-label="Quiz controls"><div class="solo-dock-inner"><p>Pick your answers<br><span>Then lock them in</span></p><button class="btn" data-action="solo-lock">LOCK IN ✓</button></div></div>':''}${s.revealed?`<div class="feedback ${s.wasCorrect?'':'wrong'}"><h2>${s.wasCorrect?'YOU KNOW YOUR STUFF.':'A NEW FACT FOR THE FIKA TABLE.'}</h2><p>${esc(q.fact)}</p></div><div class="solo-dock" role="region" aria-label="Quiz controls"><div class="solo-dock-inner"><p aria-live="polite">${s.wasCorrect?'Correct!':'Answer revealed'}<br><span>Question ${s.index+1} / ${s.pack.questions.length}</span></p><button class="btn" data-action="solo-next">${s.index===s.pack.questions.length-1?'SEE MY RESULT':'NEXT QUESTION'} ↗</button></div></div>`:'<p class="hint" style="text-align:center">No rush. Enjoy the question.</p>'}</div>`);
}
function soloLock(){
 const s=solo;if(!s.selected.length){toast('Pick at least one answer.');return;}
 if(s.revealed)return;const q=s.pack.questions[s.index];
 s.wasCorrect=[...s.selected].sort().join(',')===[...q.correct].sort().join(',');if(s.wasCorrect)s.correct++;s.revealed=true;s.answers.push(s.wasCorrect);beep(s.wasCorrect);
 if(s.daily)write('daily-progress',{date:s.date,index:s.index+1,correct:s.correct,answers:s.answers});
 renderSolo();
}
function soloResult(){
 const s=solo;
 if(s.daily&&!s.done){
  const previous=read('daily',{}),yesterday=new Date(Date.parse(s.date+'T00:00:00Z')-86400000).toISOString().slice(0,10);
  s.streak=previous.date===yesterday?(previous.streak||1)+1:previous.date===s.date?previous.streak||1:1;
  write('daily',{date:s.date,correct:s.correct,answers:s.answers,streak:s.streak});s.done=true;
 }
 setPage(`<div class="page narrow"><div class="result-title"><div class="confetti" aria-hidden="true">✳ ✦ ✳</div><div class="eyebrow">${s.daily?'YOUR DAILY LITTLE WIN':'PRACTICE MAKES BRAGGING RIGHTS'}</div><h1>${s.correct===s.pack.questions.length?'YOU ABSOLUTE<br>KNOW-IT-ALL.':'GOOD QUIZ.<br>GREAT COMPANY.'}</h1><div class="display" style="font-size:75px">${s.correct}<span class="muted"> / ${s.pack.questions.length}</span></div><p>${esc(s.pack.title)}${s.daily?' · '+s.date:''}</p><p style="font-size:29px;letter-spacing:6px" aria-label="${s.correct} correct answers">${s.answers.map(v=>v?'🟩':'⬜').join('')}</p>${s.daily?`<div class="badge-strip"><span class="badge">🔥 ${s.streak||1}-DAY STREAK</span><span class="badge">NEXT POP: MIDNIGHT UTC</span></div>`:''}<div class="actions center-actions"><button class="btn cyan" data-action="share-result">SHARE MY RESULT ↗</button><a class="btn paper" href="#home">FIND ANOTHER QUIZ</a></div><p class="hint result-note">Saved on this device. No account. No leaderboard pressure.</p></div></div>`);
 addCardButton();
}
function addCardButton(){
 const button=document.createElement('button');button.className='btn paper';button.dataset.action='download-card';button.textContent='SAVE RESULT IMAGE ↓';
 main.querySelector('.center-actions')?.append(button);
}
async function downloadCard(){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#F3EAD5';ctx.fillRect(0,0,1080,1080);ctx.fillStyle='#161713';ctx.fillRect(62,62,956,956);ctx.fillStyle='#FFFAF0';ctx.fillRect(45,45,956,956);ctx.lineWidth=6;ctx.strokeStyle='#161713';ctx.strokeRect(45,45,956,956);
 ctx.fillStyle='#161713';ctx.font='90px Anton';ctx.fillText('QUICKPOP',90,180);
 ctx.fillStyle='#FF5F91';ctx.fillRect(90,230,865,145);ctx.fillStyle='#161713';ctx.font='70px Anton';ctx.fillText('BIG QUIZ ENERGY.',115,330);
 const p=current?.board.find(p=>p.id===current.self?.id)||current?.board[0];
 const title=solo?solo.pack.title:current?.title||'Our quiz',score=solo?`${solo.correct} / ${solo.pack.questions.length}`:`${p?.score||0} PTS`;
 ctx.font='bold 40px Arial';ctx.fillText(title.slice(0,36),90,470,860);ctx.font='150px Anton';ctx.fillText(score,90,660,850);
 ctx.font='32px "Courier Prime"';ctx.fillText(solo?(solo.daily?solo.date:'SOLO PRACTICE'):`${current?.board.length||0} PLAYERS. EXCELLENT COMPANY.`,90,760,850);
 ctx.fillStyle='#5DD9E7';ctx.fillRect(90,830,865,100);ctx.fillStyle='#161713';ctx.font='28px "Courier Prime"';ctx.fillText('NO ACCOUNTS. JUST YOUR PEOPLE.',115,893,815);
 canvas.toBlob(blob=>{if(!blob){toast('Could not create the image. Try sharing the text instead.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='quickpop-result.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
}
async function shareResult(){
 let text;
 if(solo)text=`QuickPop ${solo.daily?solo.date:solo.pack.title}\n${solo.correct}/${solo.pack.questions.length} · ${solo.answers.map(x=>x?'🟩':'⬜').join('')}\n`;
 else{const p=current?.board.find(p=>p.id===current.self?.id)||current?.board[0];text=`QuickPop · ${current.title}\n${p?.name||'Our group'}: ${p?.score||0} points! ${current.board.length} players, excellent company.\n`;}
 const url=new URL(location.href);url.hash='home';
 try{if(navigator.share){await navigator.share({title:'QuickPop',text,url:url.toString()});return;}}catch(e){if(e.name==='AbortError')return;}
 await copy(text+url);
}
function builder(){
 setPage(`<div class="page narrow"><a class="back" href="#home">← BACK TO TOPICS</a><div class="eyebrow">THE BEST TOPIC? YOUR PEOPLE.</div><h1 style="font-size:60px;margin:14px 0">MAKE IT<br>AN INSIDE QUIZ.</h1><p>Write 3–20 questions. Tick the correct answer — or more than one for a multi-select. Your draft stays on this device.</p>${fieldError()}<div class="field"><label for="quiz-title">Quiz title</label><input id="quiz-title" maxlength="60" value="${esc(draft.title)}"></div><div id="builder-questions">${draft.questions.map((q,i)=>`<section class="builder-question" data-question="${i}"><header><h3>QUESTION ${String(i+1).padStart(2,'0')}</h3><div class="builder-tools"><button class="btn paper small" data-up="${i}" ${i===0?'disabled':''} aria-label="Move question ${i+1} up">↑</button><button class="btn paper small" data-duplicate="${i}" aria-label="Duplicate question ${i+1}">+</button><button class="btn paper small" data-delete="${i}" aria-label="Delete question ${i+1}">×</button></div></header><div class="field"><label for="q-${i}">The question</label><textarea id="q-${i}" data-qtext="${i}" maxlength="240">${esc(q.text)}</textarea></div>${q.options.map((o,j)=>`<div class="option-editor"><input type="checkbox" data-correct="${i}:${j}" aria-label="Question ${i+1}, answer ${j+1} is correct" ${q.correct.includes(j)?'checked':''}><input type="text" data-option="${i}:${j}" aria-label="Question ${i+1}, answer ${j+1}" maxlength="100" placeholder="Answer ${j+1}" value="${esc(o)}"></div>`).join('')}<div class="field"><label for="fact-${i}">A fun fact for the reveal (optional)</label><input id="fact-${i}" data-fact="${i}" maxlength="280" value="${esc(q.fact)}"></div></section>`).join('')}</div><button class="btn paper" data-action="add-question" ${draft.questions.length>=20?'disabled':''}>ADD A QUESTION +</button><div class="notice">No public publishing or tracking. Export a JSON copy to keep your quiz or send it to another host. Only your live room receives it when you start.</div><div class="builder-tools"><button class="text-button" data-action="export-quiz">Export quiz file</button><label class="text-button" style="cursor:pointer">Import quiz file<input id="import-quiz" type="file" accept=".json,application/json" hidden></label></div><div class="builder-bottom"><div class="actions"><button class="btn" data-action="host-custom">HOST MY QUIZ ↗</button><button class="btn paper" data-action="practice-custom">PREVIEW SOLO</button></div></div></div>`);
 $('#quiz-title').oninput=e=>{draft.title=e.target.value;write('draft',draft);};
 $('#import-quiz').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>35000)throw Error('Choose a quiz file smaller than 35 KB.');draft=validateQuiz(JSON.parse(await file.text()));write('draft',draft);builder();toast('Quiz imported. Make it your own!');}catch(e){error(e.message);}};
}
main.addEventListener('input',e=>{
 const t=e.target;if(t.dataset.qtext!==undefined)draft.questions[+t.dataset.qtext].text=t.value;
 else if(t.dataset.option){const[i,j]=t.dataset.option.split(':').map(Number);draft.questions[i].options[j]=t.value;}
 else if(t.dataset.fact!==undefined)draft.questions[+t.dataset.fact].fact=t.value;
 else return;write('draft',draft);
});
main.addEventListener('change',e=>{if(e.target.dataset.correct){const[i,j]=e.target.dataset.correct.split(':').map(Number),q=draft.questions[i];q.correct=e.target.checked?[...new Set([...q.correct,j])]:q.correct.filter(x=>x!==j);write('draft',draft);}});
let multi=[];
document.addEventListener('click',async e=>{
 const t=e.target.closest('button,a');if(!t)return;
 if(t.dataset.pack){location.hash=`host/${t.dataset.pack}`;return;}
 if(t.dataset.category){selectedCategory=t.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===selectedCategory));renderPacks();return;}
 if(t.dataset.practice){location.hash=`practice/${t.dataset.practice}/${$('#count')?.value||6}`;return;}
 if(t.dataset.avatar!==undefined){avatar=+t.dataset.avatar;document.querySelectorAll('[data-avatar]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.avatar===avatar));return;}
 if(t.dataset.kick){if(confirm('Remove this player from the lobby?'))send('kick',{id:t.dataset.kick});return;}
 if(t.dataset.answer!==undefined){
  const n=+t.dataset.answer;
  if(solo){if(solo.revealed)return;if(solo.pack.questions[solo.index].type==='multi'){solo.selected=solo.selected.includes(n)?solo.selected.filter(x=>x!==n):[...solo.selected,n];t.classList.toggle('selected',solo.selected.includes(n));t.setAttribute('aria-pressed',solo.selected.includes(n));}else{solo.selected=[n];soloLock();}}
  else if(current?.self&&!current.self.locked){if(current.phase!=='question'||Date.now()+offset<current.startAt||Date.now()+offset>=current.deadline)return;if(current.question.type==='multi'){multi=multi.includes(n)?multi.filter(x=>x!==n):[...multi,n];t.classList.toggle('selected',multi.includes(n));t.setAttribute('aria-pressed',multi.includes(n));}else{document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);send('answer',{choices:[n],index:current.index});}}
  return;
 }
 for(const action of ['up','duplicate','delete'])if(t.dataset[action]!==undefined){
  const i=+t.dataset[action];if(action==='up'&&i>0)[draft.questions[i-1],draft.questions[i]]=[draft.questions[i],draft.questions[i-1]];
  if(action==='duplicate'&&draft.questions.length<20)draft.questions.splice(i+1,0,structuredClone(draft.questions[i]));
  if(action==='delete'&&confirm('Delete this question?'))draft.questions.splice(i,1);
  write('draft',draft);builder();return;
 }
 switch(t.dataset.action){
 case 'clear-search': search='';selectedCategory='All';home();break;
 case 'random-name':$('#nickname').value=randomName();break;
 case 'copy-room':copy(shareLink(current.pin));break;
 case 'next':multi=[];send('next');break;
 case 'lock-multi':if(!multi.length)toast('Choose at least one answer.');else send('answer',{choices:multi,index:current.index});break;
 case 'close-room':if(confirm('Close this room for everyone and delete its scores?'))send('close');break;
 case 'rematch':multi=[];send('rematch');break;
 case 'reconnect':retries=0;connectRoom();break;
 case 'solo-lock':soloLock();break;
 case 'solo-next':solo.index++;solo.selected=[];solo.revealed=false;if(solo.index>=solo.pack.questions.length)soloResult();else renderSolo();break;
 case 'share-result':shareResult();break;
 case 'download-card':downloadCard();break;
 case 'add-question':if(draft.questions.length<20){draft.questions.push(blankQuestion());write('draft',draft);builder();document.querySelector('.builder-question:last-child').scrollIntoView();}break;
 case 'host-custom':case 'practice-custom':
  try{validateQuiz(draft);location.hash=t.dataset.action==='host-custom'?'host/custom':'practice/custom';}catch(e){error(e.message);}break;
 case 'export-quiz':
  try{const quiz=validateQuiz(draft),url=URL.createObjectURL(new Blob([JSON.stringify(quiz,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='quickpop-my-quiz.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error(e.message);}break;
 case 'clear-local':
  if(confirm('Clear your local drafts, results, preferences and room sessions? Export drafts first if needed.')){memory.clear();try{for(const key of Object.keys(localStorage))if(key.startsWith('quickpop-'))localStorage.removeItem(key);}catch{}$('#modal').close();closeConnection();location.hash='home';location.reload();}break;
 }
});
function route(){
 const parts=location.hash.slice(1).split('/'),name=parts[0]||'home',id=parts[1]||'';
 closeConnection();solo=null;multi=[];busy=false;
 if(name==='host')hostSetup(id);
 else if(name==='join')joinScreen(id);
 else if(name==='room'&&/^\d{4}$/.test(id))roomRoute(id);
 else if(name==='daily')soloStart('daily');
 else if(name==='practice'){try{soloStart(id,parts[2]);}catch(e){location.hash='builder';toast(e.message);}}
 else if(name==='builder')builder();
 else home();
}
window.addEventListener('hashchange',route);
window.addEventListener('online',()=>{if(session&&(!socket||socket.readyState>1)){clearTimeout(retryTimer);retries=0;connectRoom();}});
route();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

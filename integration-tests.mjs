import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8787/';
if(!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(base)&&process.env.ALLOW_LIVE_QA!=='yes')throw Error('Load tests default to localhost. Set ALLOW_LIVE_QA=yes only for an explicitly authorized remote QA run.');
let checks=0;
const check=(name,ok=true)=>{assert(ok,name);checks++;console.log('PASS',name);};
async function post(path,data){const r=await fetch(new URL('api/'+path,base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return{status:r.status,data:await r.json()};}
async function client(pin,token){
 const url=new URL(`api/rooms/${pin}/socket`,base);url.protocol=url.protocol==='https:'?'wss:':'ws:';
 const ws=new WebSocket(url),messages=[],waiters=[];
 ws.addEventListener('message',event=>{const m=JSON.parse(event.data);messages.push(m);for(const w of [...waiters])if(w.p(m)){clearTimeout(w.timer);waiters.splice(waiters.indexOf(w),1);w.resolve(m);}});
 const wait=p=>{const m=messages.findLast(p);if(m)return Promise.resolve(m);return new Promise((resolve,reject)=>{const w={p,resolve,timer:setTimeout(()=>reject(Error('WebSocket response timed out')),15000)};waiters.push(w);});};
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.send(JSON.stringify({type:'auth',token}));await wait(m=>m.type==='state'||m.type==='error');
 return{ws,messages,wait,send:(type,data={})=>ws.send(JSON.stringify({type,...data}))};
}
const sockets=[];
try{
 const created=await post('rooms',{pack:'sweden',settings:{count:3,seconds:10}});
 check('Create endpoint returns 201',created.status===201);
 const{pin,token}=created.data;
 const invalid=await post(`rooms/${pin}/join`,{name:'<script>alert(1)'});
 check('Server rejects unsafe nickname',invalid.status===400);
 const players=[];
 for(let batch=0;batch<10;batch++){
  const results=await Promise.all(Array.from({length:20},(_,i)=>post(`rooms/${pin}/join`,{name:`QA ${batch*20+i}`,avatar:i%8,team:i%4})));
  for(const result of results){assert.equal(result.status,201);players.push(result.data);}
 }
 check('200 players join one room without office-IP throttling',players.length===200);
 const full=await post(`rooms/${pin}/join`,{name:'Player 201'});
 check('Player 201 is rejected with a friendly capacity error',full.status===400&&full.data.error.includes('full'));
 const host=await client(pin,token);sockets.push(host.ws);
 for(let batch=0;batch<10;batch++){
  const results=await Promise.all(players.slice(batch*20,batch*20+20).map(p=>client(pin,p.token)));
  sockets.push(...results.map(c=>c.ws));
  for(const c of results)assert.equal(c.messages.findLast(m=>m.type==='state').state.board.length,200);
 }
 check('200 independent player WebSockets receive the complete lobby');
 const attacker=await client(pin,'invalid-token');sockets.push(attacker.ws);
 check('Invalid token receives no game state',attacker.messages.some(m=>m.type==='error')&&!attacker.messages.some(m=>m.type==='state'));
 host.send('next');const state=(await host.wait(m=>m.type==='state'&&m.state.phase==='question')).state;
 check('Question payload excludes answer key and explanations',!('correct'in state.question)&&!('fact'in state.question));
 const late=await post(`rooms/${pin}/join`,{name:'Latecomer'});
 check('Started rooms reject late joins',late.status===400&&late.data.error.includes('started'));
 const unauthorized=await client(pin,players[0].token);sockets.push(unauthorized.ws);unauthorized.send('next');
 check('Players cannot advance the host screen',(await unauthorized.wait(m=>m.type==='error')).message.includes('host'));
 host.send('close');await host.wait(m=>m.type==='closed');
 const closed=await post(`rooms/${pin}/join`,{name:'After close'});
 check('Closed room deletes its state and refuses joins',closed.status===410);
 const badOrigin=await fetch(new URL('api/rooms',base),{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:JSON.stringify({pack:'friends'})});
 check('Cross-origin room creation is refused',badOrigin.status===403);
 const oversize=await post('rooms',{custom:'x'.repeat(40000)});
 check('Oversized custom quizzes rejected',oversize.status===400);
 console.log(`${checks} server integration and load checks passed.`);
}finally{for(const ws of sockets)try{ws.close();}catch{}}

import {MAX_QUIZ_BYTES} from './photos.js';
import {PACKS} from './quiz-bank.js';
import {createRoom,joinRoom,startQuestion,answerQuestion,reveal,rematch,view,IDLE_MS} from './engine.js';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function body(request,max=MAX_QUIZ_BYTES+100000) {
  if(Number(request.headers.get('Content-Length'))>max) throw Error('This quiz is too large.');
  const reader=request.body?.getReader();if(!reader)throw Error('Missing request body.');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('This quiz is too large.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const text=new TextDecoder().decode(bytes);
  try{return JSON.parse(text);}catch{throw Error('That request could not be read.');}
}
const directory=env=>env.DIRECTORY.get(env.DIRECTORY.idFromName('quickpop-directory-v1'));
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
    if(url.pathname==='/api/health') return json({ok:true,service:'QuickPop',version:'2.0.0',maxPlayers:25});
    const origin=request.headers.get('Origin');
    if(origin&&origin!==url.origin) return json({error:'Please use the QuickPop website to play.'},403);
    try {
      if(url.pathname==='/api/rooms'&&request.method==='POST') {
        const input=await body(request);
        const pack=input.custom?input.custom:PACKS.find(p=>p.id===input.pack);
        if(!pack) return json({error:'Choose a quiz first.'},400);
        return directory(env).fetch(new Request('https://internal/create',{method:'POST',body:JSON.stringify({pack,settings:input.settings,ip:request.headers.get('CF-Connecting-IP')||'local'})}));
      }
      const match=url.pathname.match(/^\/api\/rooms\/(\d{4})\/(join|socket)$/);
      if(!match)return json({error:'That game action does not exist.'},404);
      if((match[2]==='join'&&request.method!=='POST')||(match[2]==='socket'&&request.headers.get('Upgrade')?.toLowerCase()!=='websocket'))return json({error:'Unsupported request.'},405);
      // One serialized registry owns the active PINs. No KV eventual-consistency collisions.
      const lookup=await directory(env).fetch(new Request('https://internal/lookup',{method:'POST',body:JSON.stringify({pin:match[1],ip:request.headers.get('CF-Connecting-IP')||'local'})}));
      if(!lookup.ok)return lookup;
      const {id}=await lookup.json();
      const stub=env.ROOMS.get(env.ROOMS.idFromString(id));
      return stub.fetch(request);
    } catch(error) { return json({error:error.message||'Please try again.'},400); }
  }
};
export class RoomDirectory {
  constructor(ctx,env) {this.ctx=ctx;this.env=env;}
  async fetch(request) {
    return this.ctx.blockConcurrencyWhile(async()=>{
      const input=await body(request),now=Date.now(),action=new URL(request.url).pathname;
      // Salt the IP-derived short-lived counters; do not persist raw IP addresses.
      let salt=await this.ctx.storage.get('salt');
      if(!salt){salt=crypto.randomUUID();await this.ctx.storage.put('salt',salt);}
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+input.ip)))].map(x=>x.toString(16).padStart(2,'0')).join('');
      const key=`rate:${hash}:${action}`,rate=await this.ctx.storage.get(key);
      const max=action==='/create'?12:10;
      if(rate&&rate.until>now&&rate.count>=max)return json({error:'A few too many attempts. Wait a minute and try again.'},429);
      if(action==='/lookup') {
        const entry=await this.ctx.storage.get(`pin:${input.pin}`);
        if(!entry||entry.expires<now){await this.ctx.storage.put(key,{count:rate&&rate.until>now?rate.count+1:1,until:now+60000});if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(now+60000);return json({error:'No room with that PIN. Check the big screen!'},404);}
        return json(entry);
      }
      if(action!=='/create')return json({error:'Not found'},404);
      await this.ctx.storage.put(key,{count:rate&&rate.until>now?rate.count+1:1,until:now+60000});
      let pin;
      for(let tries=0;tries<100;tries++) {
        const candidate=String(crypto.getRandomValues(new Uint32Array(1))[0]%10000).padStart(4,'0');
        const existing=await this.ctx.storage.get(`pin:${candidate}`);
        if(!existing||existing.expires<now){pin=candidate;break;}
      }
      if(!pin)return json({error:'The party is busy. Please try again in a moment.'},503);
      const room=createRoom(pin,input.pack,input.settings,now);
      if(input.settings?.hostPlays){const host=joinRoom(room,{name:input.settings.hostName||'Quiz Captain',avatar:0});host.token=room.hostToken;}
      const id=this.env.ROOMS.newUniqueId();
      const response=await this.env.ROOMS.get(id).fetch(new Request('https://internal/init',{method:'POST',body:JSON.stringify(room)}));
      if(!response.ok)return response;
      // Reserve for the room's maximum lifetime. A completed PIN is not reused early.
      await this.ctx.storage.put(`pin:${pin}`,{id:id.toString(),expires:now+IDLE_MS});
      if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(now+60000);
      return json({pin,token:room.hostToken},201);
    });
  }
  async alarm() {
    const now=Date.now();
    for(const [key,value] of await this.ctx.storage.list()) {
      if(key.startsWith('rate:')&&value.until<now||key.startsWith('pin:')&&value.expires<now)await this.ctx.storage.delete(key);
    }
    if((await this.ctx.storage.list()).size>1)await this.ctx.storage.setAlarm(now+60000);
  }
}
export class QuizRoom {
  constructor(ctx,env) {
    this.ctx=ctx;this.env=env;this.room=null;
    this.ready=ctx.blockConcurrencyWhile(async()=>{this.room=await ctx.storage.get('room');});
  }
  async save() {
    await this.ctx.storage.put('room',this.room);
    const r=this.room;
    await this.ctx.storage.setAlarm(Math.min(r.expiresAt,r.phase==='question'?r.deadline:r.phase==='reveal'&&r.settings.auto?r.nextAt:r.expiresAt));
  }
  broadcast() {
    for(const socket of this.ctx.getWebSockets()) {
      const auth=socket.deserializeAttachment();
      if(!auth?.token)continue;
      try{socket.send(JSON.stringify({type:'state',state:view(this.room,auth.token)}));}
      catch{try{socket.close(4001,'Session ended');}catch{}}
    }
  }
  async fetch(request) {
    await this.ready;
    return this.ctx.blockConcurrencyWhile(async()=>{
      const url=new URL(request.url);
      if(url.hostname==='internal'&&url.pathname==='/init') {
        if(this.room)return json({error:'Room already exists'},409);
        this.room=await request.json();await this.save();return json({ok:true});
      }
      if(!this.room||Date.now()>this.room.expiresAt)return json({error:'This room has closed. Start a fresh one!'},410);
      if(url.pathname.endsWith('/join')) {
        try{
          const player=joinRoom(this.room,await body(request,1000));
          await this.save();this.broadcast();return json({pin:this.room.pin,token:player.token},201);
        }catch(e){return json({error:e.message},400);}
      }
      if(url.pathname.endsWith('/socket')) {
        if(this.ctx.getWebSockets().length>=450)return json({error:'Too many open connections. Close another tab.'},429);
        const pair=new WebSocketPair(),[client,server]=Object.values(pair);
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment({token:null,messages:0,window:Date.now()});
        server.send(JSON.stringify({type:'hello'}));
        return new Response(null,{status:101,webSocket:client});
      }
      return json({error:'Not found'},404);
    });
  }
  async webSocketMessage(socket,data) {
    await this.ready;
    return this.ctx.blockConcurrencyWhile(async()=>{
      try{
        if(!this.room||Date.now()>this.room.expiresAt)throw Error('This room has closed.');
        if(typeof data!=='string'||data.length>1500)throw Error('That message is too large.');
        const msg=JSON.parse(data),auth=socket.deserializeAttachment(),now=Date.now();
        if(now-auth.window>10000){auth.window=now;auth.messages=0;}
        if(++auth.messages>40)throw Error('Slow down a little.');
        if(msg.type==='auth'){
          view(this.room,msg.token);auth.token=msg.token;socket.serializeAttachment(auth);
          socket.send(JSON.stringify({type:'state',state:view(this.room,auth.token)}));return;
        }
        socket.serializeAttachment(auth);
        if(!auth.token)throw Error('Join the room before playing.');
        const host=auth.token===this.room.hostToken,p=this.room.players.find(p=>p.token===auth.token);
        if(!host&&!p)throw Error('Your room session has ended.');
        if(reveal(this.room,now))await this.save();
        switch(msg.type) {
          case 'answer':
            if(!p)throw Error('Join on your phone to answer.');
            answerQuestion(this.room,p,msg.choices,msg.index,now);break;
          case 'next': if(!host)throw Error('Only the host can advance.');startQuestion(this.room,now);break;
          case 'rematch': if(!host)throw Error('Only the host can rematch.');rematch(this.room,now);break;
          case 'kick':
            if(!host||this.room.phase!=='lobby')throw Error('Players can be removed by the host in the lobby.');
            this.room.players=this.room.players.filter(p=>p.id!==msg.id);this.room.version++;break;
          case 'close':
            if(!host)throw Error('Only the host can end a room.');
            await this.destroy();return;
          case 'ping': socket.send(JSON.stringify({type:'pong',serverNow:now}));return;
          default: throw Error('Unknown game action.');
        }
        await this.save();this.broadcast();
      }catch(e){try{socket.send(JSON.stringify({type:'error',message:e.message}));}catch{}}
    });
  }
  async alarm() {
    await this.ready;
    await this.ctx.blockConcurrencyWhile(async()=>{
      if(!this.room)return;
      const now=Date.now();
      if(now>=this.room.expiresAt){await this.destroy();return;}
      if(this.room.phase==='question')reveal(this.room,now);
      else if(this.room.phase==='reveal'&&this.room.settings.auto&&now>=this.room.nextAt)startQuestion(this.room,now);
      await this.save();this.broadcast();
    });
  }
  async destroy(){
    for(const s of this.ctx.getWebSockets()){try{s.send(JSON.stringify({type:'closed'}));s.close(1000,'Room closed');}catch{}}
    this.room=null;await this.ctx.storage.deleteAlarm();await this.ctx.storage.deleteAll();
  }
  webSocketClose(socket,code,reason){try{socket.close(code,reason);}catch{}}
  webSocketError(socket){try{socket.close(1011,'Reconnect to continue');}catch{}}
}

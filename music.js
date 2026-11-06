// Original QuickPop synth composition. No recordings, samples or third-party music.
export function createMusic(){
 let ctx,master,effects,timer,next=0,step=0,enabled=false,playing=false,volume=.22,lastEffect=-1;
 function unlock(){
  if(!enabled)return;
  try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);effects=ctx.createGain();effects.connect(ctx.destination);}if(ctx.state!=='running')ctx.resume().then(()=>{next=0;sync();}).catch(()=>{});sync();}catch{}
 }
 const bass=[110,110,130.81,98],arp=[0,7,12,7,3,10,15,10];
 function tone(hz,at,length,level,type='triangle'){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;o.connect(g);g.connect(master);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(level,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.start(at);o.stop(at+length+.02);
 }
 function schedule(){if(!ctx||ctx.state!=='running'||!enabled||!playing||document.hidden)return;
  if(next<ctx.currentTime)next=ctx.currentTime+.03;
  while(next<ctx.currentTime+.16){const root=bass[Math.floor(step/16)%4];tone(root*2**(arp[step%8]/12),next,.13,.12);if(step%4===0){tone(root/2,next,.3,.24,'sine');tone(65,next,.09,.22,'sine');}if(step%4===2)tone(1760,next,.035,.025,'square');next+=60/132/4;step++;}
 }
 function sync(){clearInterval(timer);if(master)master.gain.setTargetAtTime(enabled&&playing&&!document.hidden?volume:0,ctx.currentTime,.04);if(effects)effects.gain.setTargetAtTime(enabled&&!document.hidden?volume/.22:0,ctx.currentTime,.01);if(enabled&&playing&&!document.hidden)timer=setInterval(schedule,40);}
 document.addEventListener('visibilitychange',()=>{next=0;sync();});
 return {
  unlock,
  // The.AI.Blog's short square-wave pling, adapted to QuickPop's shared volume/mute.
  effect(type='click'){
   if(!enabled||!volume||document.hidden)return;unlock();if(!ctx||!effects)return;
   const now=ctx.currentTime;if(now-lastEffect<.035)return;lastEffect=now;
   const o=ctx.createOscillator(),g=ctx.createGain(),result=type==='correct'||type==='incorrect';
   o.type=result?'sine':'square';o.frequency.setValueAtTime(type==='tab'||type==='correct'?660:type==='incorrect'?220:440,now);
   if(!result)o.frequency.exponentialRampToValueAtTime(type==='tab'?990:620,now+.055);
   g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(result ? .06 : .045,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+(result ? .18 : .105));
   o.connect(g);g.connect(effects);o.onended=()=>{o.disconnect();g.disconnect();};o.start(now);o.stop(now+(result ? .2 : .12));
  },
  enable(value){enabled=value;sync();},
  play(value){if(playing===value)return;playing=value;next=0;sync();},
  volume(value){volume=Math.max(0,Math.min(.5,Number(value)*.5));sync();},
  status(){return {enabled,playing,volume,running:ctx?.state==='running'};}
 };
}

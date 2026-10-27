// Original QuickPop synth composition. No recordings, samples or third-party music.
export function createMusic(){
 let ctx,master,timer,next=0,step=0,enabled=false,playing=false,volume=.22;
 const bass=[110,110,130.81,98],arp=[0,7,12,7,3,10,15,10];
 function tone(hz,at,length,level,type='triangle'){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz;o.connect(g);g.connect(master);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(level,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.start(at);o.stop(at+length+.02);
 }
 function schedule(){if(!ctx||ctx.state!=='running'||!enabled||!playing||document.hidden)return;
  if(next<ctx.currentTime)next=ctx.currentTime+.03;
  while(next<ctx.currentTime+.16){const root=bass[Math.floor(step/16)%4];tone(root*2**(arp[step%8]/12),next,.13,.12);if(step%4===0){tone(root/2,next,.3,.24,'sine');tone(65,next,.09,.22,'sine');}if(step%4===2)tone(1760,next,.035,.025,'square');next+=60/132/4;step++;}
 }
 function sync(){clearInterval(timer);if(master)master.gain.setTargetAtTime(enabled&&playing&&!document.hidden?volume:0,ctx.currentTime,.04);if(enabled&&playing&&!document.hidden)timer=setInterval(schedule,40);}
 document.addEventListener('visibilitychange',()=>{next=0;sync();});
 return {
  unlock(){if(!enabled||ctx?.state==='running')return;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);}ctx.resume().then(()=>{next=0;sync();}).catch(()=>{});}catch{}},
  enable(value){enabled=value;sync();},
  play(value){if(playing===value)return;playing=value;next=0;sync();},
  volume(value){volume=Math.max(0,Math.min(.5,Number(value)*.5));sync();},
  status(){return {enabled,playing,volume,running:ctx?.state==='running'};}
 };
}

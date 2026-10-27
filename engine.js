import {validatePhoto,MAX_QUIZ_BYTES} from './photos.js';
import {MEDIA} from './visual-media.js';
export const MAX_PLAYERS = 25;
export const IDLE_MS = 2 * 60 * 60 * 1000;
export const FINISH_MS = 10 * 60 * 1000;
export const token = () => crypto.randomUUID() + crypto.randomUUID();
export const clone = value => JSON.parse(JSON.stringify(value));
export function shuffle(values, random = Math.random) {
  const out = [...values];
  for (let i=out.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
}
export function cleanName(input) {
  const name=String(input??'').normalize('NFKC').trim().replace(/\s+/g,' ');
  if(!name || [...name].length>16 || /[<>\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(name)) throw Error('Choose a nickname of 1–16 characters, without special control characters.');
  if(/\b(fuck|shit|cunt|nigger|bitch|asshole)\b/i.test(name)) throw Error('Keep nicknames friendly. Try another one.');
  return name;
}
export function validateQuiz(value) {
  if(!value || typeof value.title!=='string' || value.title.trim().length<2 || value.title.length>60) throw Error('Give your quiz a title of 2–60 characters.');
  if(!Array.isArray(value.questions)||value.questions.length<3||value.questions.length>20) throw Error('A quiz needs 3–20 questions.');
  if(new TextEncoder().encode(JSON.stringify(value)).length>MAX_QUIZ_BYTES)throw Error('This quiz is too large. Remove a few photos or use smaller images.');
  const questions=value.questions.map((q,i)=>{
    if(typeof q.text!=='string'||q.text.trim().length<4||q.text.length>240) throw Error(`Question ${i+1} needs 4–240 characters.`);
    if(!Array.isArray(q.options)||q.options.length<2||q.options.length>4||q.options.some(x=>typeof x!=='string'||!x.trim()||x.length>100)) throw Error(`Question ${i+1} needs 2–4 short answers.`);
    if(new Set(q.options.map(x=>x.trim().toLowerCase())).size!==q.options.length) throw Error(`Question ${i+1} has duplicate answers.`);
    if(!Array.isArray(q.correct)||!q.correct.length||q.correct.some(n=>!Number.isInteger(n)||n<0||n>=q.options.length)||new Set(q.correct).size!==q.correct.length) throw Error(`Mark the correct answer(s) for question ${i+1}.`);
    return {id:String(q.id||i).slice(0,100),text:q.text.trim(),options:q.options.map(x=>x.trim()),correct:[...q.correct],type:q.correct.length>1?'multi':q.options.length===2?'boolean':'single',fact:String(q.fact||'').slice(0,280),image:Object.hasOwn(MEDIA,q.image)?q.image:null,photo:validatePhoto(q.photo),photoAlt:String(q.photoAlt||'Your quiz photo').slice(0,180),clue:String(q.clue||'').slice(0,300),difficulty:['easy','hard'].includes(q.difficulty)?q.difficulty:value.difficulty==='hard'?'hard':'easy'};
  });
  return {id:String(value.id||'custom').slice(0,64),title:value.title.trim(),icon:'✎',color:'pink',difficulty:value.difficulty==='hard'?'hard':'easy',questions};
}
export function createRoom(pin,pack,settings={},now=Date.now()) {
  const quiz=validateQuiz(pack);
  if(settings.difficulty){if(!['easy','hard'].includes(settings.difficulty))throw Error('Choose easy or hard.');quiz.questions=quiz.questions.filter(q=>q.difficulty===settings.difficulty);if(!quiz.questions.length)throw Error('No questions at that difficulty.');}
  const count=Math.max(3,Math.min(quiz.questions.length,Number(settings.count)||quiz.questions.length));
  const seconds=[10,15,20,30].includes(Number(settings.seconds))?Number(settings.seconds):15;
  return {pin,id:crypto.randomUUID(),hostToken:token(),title:quiz.title,packId:quiz.id,
    questions:(settings.shuffle===false?quiz.questions:shuffle(quiz.questions)).slice(0,count).map(q=>{
      const order=shuffle(q.options.map((_,i)=>i));
      return {...q,options:order.map(i=>q.options[i]),correct:order.map((i,j)=>q.correct.includes(i)?j:-1).filter(i=>i>=0)};
    }),settings:{seconds,auto:settings.auto===true,accuracy:settings.accuracy===true,teams:settings.teams===true},
    players:[],phase:'lobby',index:-1,startAt:0,deadline:0,expiresAt:now+IDLE_MS,hardEnd:now+IDLE_MS,round:1,version:0};
}
export function joinRoom(room,input,now=Date.now()) {
  if(room.phase!=='lobby') throw Error('This quiz has started. Join the next round!');
  if(room.players.length>=MAX_PLAYERS) throw Error(`This room is full (${MAX_PLAYERS} players).`);
  const name=cleanName(input.name);
  if(room.players.some(p=>p.name.toLowerCase()===name.toLowerCase())) throw Error('That nickname is taken in this room. Add a twist!');
  const player={id:crypto.randomUUID(),token:token(),name,avatar:Number.isInteger(input.avatar)&&input.avatar>=0&&input.avatar<8?input.avatar:0,
    team:room.settings.teams&&[0,1,2,3].includes(input.team)?input.team:0,score:0,time:0,streak:0,bestStreak:0,correctCount:0,last:null,answer:null,previousRank:0,wins:0};
  room.players.push(player);room.expiresAt=Math.min(room.hardEnd,now+IDLE_MS);room.version++;
  return player;
}
export function ranking(room) {
  return [...room.players].sort((a,b)=>b.score-a.score||a.time-b.time||a.name.localeCompare(b.name));
}
export function startQuestion(room,now=Date.now()) {
  if(!['lobby','reveal'].includes(room.phase)) throw Error('This round cannot start yet.');
  if(!room.players.length) throw Error('At least one player needs to join.');
  if(room.index+1>=room.questions.length) {
    room.phase='finished';room.expiresAt=Math.min(room.hardEnd,now+FINISH_MS);
    const winner=ranking(room)[0]; if(winner) winner.wins++;
    room.version++;return;
  }
  ranking(room).forEach((p,i)=>p.previousRank=i+1);
  room.index++;room.phase='question';room.startAt=now+1500;room.deadline=room.startAt+room.settings.seconds*1000;
  room.players.forEach(p=>{p.answer=null;p.last=null;});room.expiresAt=Math.min(room.hardEnd,now+IDLE_MS);room.version++;
}
export function answerQuestion(room,player,choices,questionIndex,now=Date.now()) {
  if(room.phase!=='question'||questionIndex!==room.index||now<room.startAt||now>room.deadline) throw Error('That question is not accepting answers.');
  if(player.answer) throw Error('Your answer is already locked.');
  const q=room.questions[room.index];
  if(!Array.isArray(choices)||!choices.length||choices.some(n=>!Number.isInteger(n)||n<0||n>=q.options.length)||new Set(choices).size!==choices.length||(q.type!=='multi'&&choices.length!==1)) throw Error('Choose a valid answer.');
  player.answer={choices:[...choices],elapsed:now-room.startAt};room.version++;
}
export function scoreAnswer(correct,elapsed,limit,streak,accuracy=false) {
  if(!correct) return 0;
  const base=accuracy?1000:1000-500*Math.min(1,Math.max(0,elapsed/limit));
  return Math.round(base*(streak>=5?1.2:streak>=3?1.1:1));
}
export function reveal(room,now=Date.now()) {
  if(room.phase!=='question'||now<room.deadline) return false;
  const q=room.questions[room.index],expected=[...q.correct].sort().join(',');
  for(const p of room.players) {
    const correct=!!p.answer&&[...p.answer.choices].sort().join(',')===expected;
    p.streak=correct?p.streak+1:0;p.bestStreak=Math.max(p.bestStreak,p.streak);
    const elapsed=p.answer?.elapsed??room.settings.seconds*1000;
    const points=scoreAnswer(correct,elapsed,room.settings.seconds*1000,p.streak,room.settings.accuracy);
    p.score+=points;p.time+=elapsed;if(correct)p.correctCount++;
    p.last={correct,points,choices:p.answer?.choices||[],elapsed};
  }
  room.phase='reveal';room.nextAt=now+5000;room.version++;return true;
}
export function rematch(room,now=Date.now()) {
  if(room.phase!=='finished') throw Error('Finish this game before a rematch.');
  room.phase='lobby';room.index=-1;room.round++;room.questions=shuffle(room.questions);
  room.players.forEach(p=>Object.assign(p,{score:0,time:0,streak:0,bestStreak:0,correctCount:0,last:null,answer:null,previousRank:0}));
  room.expiresAt=Math.min(room.hardEnd,now+IDLE_MS);room.version++;
}
export function view(room,authToken,now=Date.now()) {
  const host=room.hostToken===authToken,p=room.players.find(p=>p.token===authToken);
  if(!host&&!p) throw Error('Your room session has expired. Join again.');
  const revealAnswer=['reveal','finished'].includes(room.phase),q=room.questions[room.index];
  const board=ranking(room).map((row,i)=>({id:row.id,name:row.name,avatar:row.avatar,team:row.team,score:row.score,rank:i+1,change:row.previousRank?row.previousRank-i-1:0,points:revealAnswer?row.last?.points||0:0,wins:row.wins,correctCount:row.correctCount,bestStreak:row.bestStreak}));
  const question=q?{text:q.text,options:q.options,type:q.type,image:q.image,photo:q.photo,photoAlt:q.photoAlt,clue:q.clue,...(revealAnswer?{correct:q.correct,fact:q.fact}:{})}:null;
  return {pin:room.pin,roomId:room.id,title:room.title,packId:room.packId,phase:room.phase,index:room.index,total:room.questions.length,round:room.round,
    settings:room.settings,serverNow:now,startAt:room.startAt,deadline:room.deadline,nextAt:room.nextAt,expiresAt:room.expiresAt,host,board,question,
    answered:room.players.filter(p=>p.answer).length,self:p?{id:p.id,locked:!!p.answer,choices:p.answer?.choices||[],streak:p.streak,last:revealAnswer?p.last:null}:null,
    distribution:revealAnswer&&q?q.options.map((_,i)=>room.players.filter(p=>p.answer?.choices.includes(i)).length):null,version:room.version};
}

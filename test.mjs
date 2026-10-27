import test from 'node:test';
import assert from 'node:assert/strict';
import {PACKS,dailyPack,chooseDifficulty} from './quiz-bank.js';
import {createRoom,joinRoom,startQuestion,answerQuestion,reveal,scoreAnswer,ranking,rematch,view,validateQuiz,cleanName,MAX_PLAYERS} from './engine.js';
const now=100000;
function setup(settings={}){const room=createRoom('0123',PACKS[0],{shuffle:false,...settings},now);const player=joinRoom(room,{name:'Fika Fox',avatar:1},now);return {room,player};}
test('All topic packs have valid unique question records',()=>{
 assert(PACKS.length>=50);const ids=new Set();
 for(const p of PACKS){validateQuiz(p);assert.equal(new Set(p.questions.map(q=>q.text+q.image)).size,p.questions.length,`Repeated question in ${p.id}`);assert(p.questions.length>=10&&p.questions.length<=20);assert(p.source.startsWith('https://'));for(const q of p.questions){assert(!ids.has(q.id));ids.add(q.id);assert(q.fact.length>5);}}
 assert(ids.size>=990);assert(new Set(PACKS.flatMap(p=>p.questions.map(q=>q.correct[0]))).size===4);
});
test('Daily Pop deterministic, five distinct questions, date changes',()=>{const a=dailyPack('2026-10-20'),b=dailyPack('2026-10-20');assert.deepEqual(a,b);assert.equal(new Set(a.questions.map(q=>q.id)).size,5);assert.notDeepEqual(a.questions,dailyPack('2026-10-21').questions);});

test('Question content is unique despite punctuation, case and spacing differences',()=>{
 const normalize=s=>s.normalize('NFKD').toLowerCase().replace(/[^\p{Letter}\p{Number}\p{Extended_Pictographic}]/gu,'');
 for(const pack of PACKS){const seen=new Set();for(const q of pack.questions){
  const key=normalize(q.text)+'|'+(q.image||'');
  assert(!seen.has(key),`Repeated content in ${pack.id}: ${q.text}`);seen.add(key);
 }}
});

test('Previously repeated facts occur only once within their topic',()=>{
 // Match the tested fact across paraphrases, including reverse questions.
 // Only the prompt and correct answers count: distractors may reuse a name.
 const subjects={
  friends:[/ursula/i,/marcel/i],abba:[/final countdown/i],nineties:[/jagged little pill/i],
  eurovision:[/c[eé]line dion/i],sweden:[/pippi longstocking/i],
  food:[/risotto/i,/tahini/i,/pesto/i,/saffron/i,/kimchi/i],
  diwali:[/lakshmi.*prosperity|prosperity.*lakshmi/i,/rangoli/i,/\bdiya\b.*small|small.*\bdiya\b/i],
  holi:[/\bgulal\b/i,/\bgujiya\b/i,/young devotee|figure.*devotion/i],
  midsommar:[/små grodorna/i,/herring/i,/strawberr/i],
  halloween:[/who wrote.*frankenstein/i],retro:[/company.*sonic/i]
 };
 for(const [id,patterns] of Object.entries(subjects)){
  const pack=PACKS.find(p=>p.id===id);
  for(const pattern of patterns){const matches=pack.questions.filter(q=>pattern.test([q.text,...q.correct.map(i=>q.options[i])].join(' ')));
   assert.equal(matches.length,1,`${id} repeats or loses the reviewed fact ${pattern}: ${matches.map(q=>q.text).join('; ')}`);
  }
 }
});

test('Food difficulty levels and picture rounds have separate answer subjects',()=>{
 for(const id of ['food','guess-food','guess-logo','guess-flag']){
  const pack=PACKS.find(p=>p.id===id),easy=chooseDifficulty(pack,'easy'),hard=chooseDifficulty(pack,'hard');
  assert.equal(easy.questions.length,10);assert.equal(hard.questions.length,10);
  const answers=new Set(easy.questions.flatMap(q=>q.correct.map(i=>q.options[i].toLowerCase())));
  for(const q of hard.questions){for(const i of q.correct)assert(!answers.has(q.options[i].toLowerCase()),`${id} reuses ${q.options[i]} across difficulty levels`);
   if(q.image)assert(!easy.questions.some(e=>e.image===q.image),`${id} reuses a picture`);
  }
 }
});

test('Every pack supports complete six- and ten-question games without repetition',()=>{
 for(const pack of PACKS)for(const count of [6,10]){
  const room=createRoom('1234',pack,{count},now),player=joinRoom(room,{name:'Quiz Fox'},now);
  assert.equal(room.questions.length,count);assert.equal(new Set(room.questions.map(q=>q.text+q.image)).size,count);
  for(let i=0;i<count;i++){startQuestion(room,now+i*20000);answerQuestion(room,player,room.questions[i].correct,i,room.startAt+200);reveal(room,room.deadline);}
  startQuestion(room,now+count*20000);assert.equal(room.phase,'finished');assert.equal(player.correctCount,count);
 }
});
test('Validate quiz rejects malformed inputs and duplicate options',()=>{for(const invalid of [null,{}, {...PACKS[0],questions:[]},{...PACKS[0],questions:[...PACKS[0].questions.slice(1),{text:'Choose this',options:['Same','same'],correct:[0]}]}])assert.throws(()=>validateQuiz(invalid));});
test('Nickname validation and display safety',()=>{assert.equal(cleanName('  Fika   Fox '),'Fika Fox');for(const s of ['', '<script>', 'a'.repeat(17),'test\u202eevil','fuck'])assert.throws(()=>cleanName(s));});
test('PIN keeps leading zero; host token is independent of PIN',()=>{const{room}=setup();assert.equal(room.pin,'0123');assert(room.hostToken.length>=64);assert.notEqual(room.hostToken,room.pin);});
test('Lobby rejects duplicate names and enforces capacity 25',()=>{const{room}=setup();assert.throws(()=>joinRoom(room,{name:'fika fox'}));for(let i=1;i<MAX_PLAYERS;i++)joinRoom(room,{name:'Player '+i},now);assert.equal(room.players.length,25);assert.throws(()=>joinRoom(room,{name:'Too many'}));});
test('Start requires a player and locks new joins',()=>{assert.throws(()=>startQuestion(createRoom('1234',PACKS[0]),now));const{room}=setup();startQuestion(room,now);assert.throws(()=>joinRoom(room,{name:'Late'}));assert.equal(room.startAt,now+1500);});
test('Only the current question in its server time window accepts answers',()=>{const{room,player}=setup();startQuestion(room,now);assert.throws(()=>answerQuestion(room,player,[0],0,now));assert.throws(()=>answerQuestion(room,player,[0],1,now+2000));assert.throws(()=>answerQuestion(room,player,[0],0,room.deadline+1));});
test('Duplicate answers cannot change the first locked answer',()=>{const{room,player}=setup();startQuestion(room,now);answerQuestion(room,player,[0],0,now+2000);assert.throws(()=>answerQuestion(room,player,[1],0,now+2001));assert.deepEqual(player.answer.choices,[0]);});
test('Malformed answers rejected without locking a player',()=>{const{room,player}=setup();startQuestion(room,now);for(const a of [[],[99],[-1],['0'],[0,0],[0,1]])assert.throws(()=>answerQuestion(room,player,a,0,now+2000));assert.equal(player.answer,null);});
test('Live payloads never reveal correct answers, facts or tokens',()=>{const{room,player}=setup();startQuestion(room,now);answerQuestion(room,player,room.questions[0].correct,0,now+2000);const v=view(room,player.token,now+2100);assert(!('correct'in v.question));assert(!('fact'in v.question));assert.equal(v.self.last,null);assert.equal(v.board[0].score,0);assert.equal(v.distribution,null);assert(!JSON.stringify(v).includes(player.token));assert(!JSON.stringify(v).includes(room.hostToken));assert.throws(()=>view(room,'wrong-token'));});
test('Scoring endpoints and streak bonuses',()=>{assert.equal(scoreAnswer(true,0,15000,1),1000);assert.equal(scoreAnswer(true,15000,15000,1),500);assert.equal(scoreAnswer(false,0,15000,5),0);assert.equal(scoreAnswer(true,0,15000,3),1100);assert.equal(scoreAnswer(true,0,15000,5),1200);assert.equal(scoreAnswer(true,14000,15000,1,true),1000);});
test('Reveal only at deadline; scores once; no answer scores zero',()=>{const{room,player}=setup();joinRoom(room,{name:'No Answer'},now);startQuestion(room,now);answerQuestion(room,player,room.questions[0].correct,0,room.startAt+1000);assert.equal(reveal(room,room.deadline-1),false);assert.equal(reveal(room,room.deadline),true);const score=player.score;assert(score>=500);assert.equal(room.players[1].score,0);assert.equal(reveal(room,room.deadline+1),false);assert.equal(player.score,score);assert.deepEqual(view(room,player.token).question.correct,room.questions[0].correct);});
test('Multi-select is all-or-nothing, independent of order',()=>{const multi={...PACKS[0],questions:PACKS[0].questions.filter(q=>q.type==='multi')};multi.questions=Array.from({length:3},()=>structuredClone(multi.questions[0]));const room=createRoom('1111',multi,{shuffle:false},now),a=joinRoom(room,{name:'All'},now),b=joinRoom(room,{name:'Some'},now);startQuestion(room,now);const correct=room.questions[0].correct;answerQuestion(room,a,[...correct].reverse(),0,room.startAt+100);answerQuestion(room,b,[correct[0]],0,room.startAt+100);reveal(room,room.deadline);assert(a.score>0);assert.equal(b.score,0);});
test('Tie-breaker orders lower total answer time first',()=>{const{room,player}=setup();const b=joinRoom(room,{name:'B'},now);player.score=b.score=1000;player.time=3000;b.time=1000;assert.equal(ranking(room)[0].id,b.id);});
test('Rematch retains players and series wins; resets round scores',()=>{const{room,player}=setup({count:3});for(let i=0;i<3;i++){startQuestion(room,now+i*20000);answerQuestion(room,player,room.questions[i].correct,i,room.startAt+200);reveal(room,room.deadline);}startQuestion(room,now+60000);assert.equal(room.phase,'finished');assert.equal(player.wins,1);rematch(room,now+61000);assert.equal(room.players.length,1);assert.equal(player.wins,1);assert.equal(player.score,0);assert.equal(room.phase,'lobby');assert.equal(room.round,2);});
test('Room lifetime never grows beyond registry reservation',()=>{const{room}=setup();const hardEnd=room.hardEnd;joinRoom(room,{name:'Later'},now+60000);startQuestion(room,now+120000);assert.equal(room.expiresAt,hardEnd);});
test('The source pack is never mutated when a room is shuffled',()=>{const before=JSON.stringify(PACKS[0]);setup();assert.equal(JSON.stringify(PACKS[0]),before);});

test('Live rooms select only the requested difficulty',()=>{for(const pack of PACKS){for(const level of ['easy','hard']){if(!pack.questions.some(q=>q.difficulty===level))continue;const room=createRoom('1234',pack,{difficulty:level,count:10},now);assert.equal(room.questions.length,10);assert(room.questions.every(q=>q.difficulty===level));}}assert.throws(()=>createRoom('1234',PACKS[0],{difficulty:'invalid'},now));});

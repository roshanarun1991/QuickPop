import test from 'node:test';
import assert from 'node:assert/strict';
import {generateQuiz} from './agent-generate.mjs';
import {checkEvidence} from './agent-sources.mjs';
import {sourceClues} from './agent-clues.mjs';
const facts=['Mercury is the closest planet to the Sun in our solar system.','Venus has a dense atmosphere composed mainly of carbon dioxide.','Earth is the third planet from the Sun in our solar system.','Mars is commonly called the Red Planet because of its iron-rich surface.','Jupiter is the largest planet in our solar system by diameter.','Saturn is well known for its prominent ring system of ice particles.','Uranus rotates with its axis tilted strongly relative to its orbit.','Neptune is the outermost of the eight planets in our solar system.','Sun is the name of the star at the centre of our solar system.','Moon is the usual name for the natural satellite of planet Earth.'];
const candidate=i=>({text:`Which object is described in reference fact ${i+1}?`,options:[facts[i].split(' ')[0],'Pluto','Ceres','Eris'],correct:[0],fact:facts[i],sourceIndex:i});
test('Agent streams output, retains valid questions and attaches exact source excerpts',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{
  if(String(url).startsWith('https://en.wikipedia.org/'))return Response.json(new URL(url).searchParams.get('list')?{query:{search:[{title:'Solar System'}]}}:{query:{pages:{1:{title:'Solar System',extract:facts.join(' ')}}}});
  assert.equal(String(url),'http://127.0.0.1:11434/api/chat');const body=JSON.parse(options.body);assert.equal(body.stream,true);
  const questions=calls++===0?[...Array.from({length:9},(_,i)=>candidate(i)),{...candidate(9),sourceIndex:999}]:[candidate(9)];
  const json=JSON.stringify({questions}),middle=Math.floor(json.length/2);return new Response([json.slice(0,middle),json.slice(middle)].map(content=>JSON.stringify({message:{content}})).join('\n')+'\n');
 };
 try{const result=await generateQuiz({topic:'Solar System',difficulty:'easy',requestId:'11111111-1111-4111-8111-111111111111'});assert.equal(calls,2);assert.equal(result.quiz.questions.length,10);assert.equal(result.quiz.questions[9].reference.quote,facts[9]);assert(result.quiz.questions.every(q=>q.reference.url.startsWith('https://en.wikipedia.org/wiki/')));}finally{globalThis.fetch=original;}
});
test('Evidence validation rejects unknown sources and absent answers',()=>{
 const ref={facts:[{index:0,text:facts[0]}]};assert.equal(checkEvidence({questions:[candidate(0)]},ref)[0],facts[0]);assert.throws(()=>checkEvidence({questions:[{...candidate(0),sourceIndex:20}]},ref));assert.throws(()=>checkEvidence({questions:[{...candidate(0),options:['Jupiter','Venus','Earth','Mars']}]},ref));
});
test('Source-based fallback fills ten supported, distinct multiple-choice clues',()=>{
 const ref={url:'https://en.wikipedia.org/wiki/Solar_System',facts:[...facts,'The reference mentions Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Sun and Moon.'].map((text,index)=>({text,index}))};
 const clues=sourceClues(ref,[],10,'easy');assert.equal(clues.length,10);assert.equal(new Set(clues.map(q=>q.text)).size,10);
 for(const q of clues){assert(q.text.includes('____'));assert(q.reference.quote.includes(q.options[0]));assert.equal(new Set(q.options).size,4);assert(q.options.slice(1).every(o=>!q.reference.quote.includes(o)));assert(q.text.length<=240);}
 assert(sourceClues(ref,clues,1,'easy').every(q=>!clues.some(old=>old.reference.quote===q.reference.quote)));
});

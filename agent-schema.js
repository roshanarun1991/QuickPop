import {validateQuiz} from './engine.js';
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function validateRequest(input){
 if(!input||!['generate','publish'].includes(input.action)||!UUID.test(input.requestId||''))throw Error('Invalid quiz request.');
 if(input.action==='publish')return {action:'publish',requestId:input.requestId};
 const topic=String(input.topic||'').normalize('NFKC').trim();
 if(topic.length<3||topic.length>100||/[\u0000-\u001f<>]/.test(topic))throw Error('Use a topic of 3–100 characters without markup.');
 if(!['easy','hard'].includes(input.difficulty))throw Error('Choose easy or hard.');
 return {action:'generate',requestId:input.requestId,topic,difficulty:input.difficulty};
}
export function validateGenerated(value,request){
 const quiz=validateQuiz({...value,difficulty:request.difficulty});
 if(quiz.questions.length!==10)throw Error('The generator must return exactly 10 questions.');
 const seen=new Set();
 for(const [i,q] of quiz.questions.entries()){
  q.id=`generated-${request.requestId}-${i}`;
  if(q.options.length!==4||q.correct.length!==1)throw Error('Generated questions need four choices and one correct answer.');
  if(q.fact.trim().length<10)throw Error('Every answer needs an explanation.');
  const key=q.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  if(seen.has(key))throw Error('The generator repeated a question.');seen.add(key);
  q.difficulty=request.difficulty;q.image=null;q.clue='';
 }
 return {...quiz,id:`generated-${request.requestId}`,title:quiz.title,category:'Community Quizzes',icon:'✦',color:'violet',description:`${request.topic} · ${request.difficulty} · AI drafted, owner reviewed`,difficulty:request.difficulty};
}

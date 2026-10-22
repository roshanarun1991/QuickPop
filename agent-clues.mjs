// A deterministic, source-based fallback when the free model returns unusable items.
// Each answer is removed from its original sentence; no new factual claim is invented.
const stop=new Set(['The','This','That','These','Those','It','Its','They','Their','There','Here','However','Although','Since','During','Most','Many','Some','Other','Each','All','In','On','At','As','For','From','After','Before','By','With','Without','Both','Together','Inside','Outside','Within','Beyond','Between','Among','About','Around','Through','Unlike','While','When','Where','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Several','Currently','Generally','According','Over','Under','More','Less','Known','Including']);
const terms=text=>[...text.matchAll(/\b[A-Z][a-z]+(?:[ -][A-Z][a-z]+)*\b|\b\d{3,4}\b/g)].map(m=>m[0].replace(/^The /,'')).filter(s=>s.length>2&&!stop.has(s));
export function sourceClues(reference,accepted,count,difficulty){
 const used=new Set(accepted.map(q=>q.reference?.quote));
 const pool=[...new Set(reference.facts.flatMap(f=>terms(f.text)))].filter(t=>reference.facts.some(f=>f.text.indexOf(t)>0));
 const facts=reference.facts.filter(f=>!used.has(f.text)&&f.text.length<=215&&!/^(These|This|Those|That|Here|There|They|Their|It|Its|Such|Both|Four other|At this point)\b|\b(this|that) (line|region|process|material)\b/.test(f.text));
 facts.sort((a,b)=>difficulty==='hard'?b.text.length-a.text.length:a.text.length-b.text.length);
 const result=[],answers=new Set(accepted.flatMap(q=>q.correct.map(i=>q.options[i])));
 for(const f of facts){
  const names=terms(f.text).filter(t=>pool.includes(t)).sort((a,b)=>Number(answers.has(a))-Number(answers.has(b)));
  for(const answer of names){
   const choices=pool.filter(s=>s!==answer&&!f.text.includes(s)&&/^\d+$/.test(s)===/^\d+$/.test(answer));
   if(choices.length<3)continue;
   const text=`Fill the gap: ${f.text.replace(answer,'____')}`;
   result.push({text,options:[answer,...choices.slice(0,3)],correct:[0],fact:f.text,reference:{url:reference.url,quote:f.text},generationMethod:'reference-clue'});
   answers.add(answer);used.add(f.text);break;
  }
  if(result.length===count)break;
 }
 return result;
}

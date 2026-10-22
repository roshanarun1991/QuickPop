const headers={'User-Agent':'QuickPopQuiz/1.0 (https://github.com/roshanarun1991/QuickPop; educational quiz drafts)'};
async function query(params){const url=new URL('https://en.wikipedia.org/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',...params});const r=await fetch(url,{headers,signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('The free reference source is unavailable. Try again later.');const data=await r.json();if(data.error)throw Error('Reference search failed.');return data.query;}
export async function referenceFor(topic){
 const result=await query({list:'search',srsearch:topic,srlimit:'3',srnamespace:'0'});
 const titles=result?.search?.map(p=>p.title).filter(t=>!t.includes('(disambiguation)'));
 if(!titles?.length)throw Error('No reference article found. Try a more specific topic.');
 const result2=await query({prop:'extracts',explaintext:'1',redirects:'1',titles:titles[0]});
 const page=Object.values(result2?.pages||{}).find(p=>p.extract?.length>500);
 if(!page)throw Error('Not enough reference material for ten questions. Try a more specific topic.');
 const text=page.extract.slice(0,24000).replace(/^=.+=$/gm,'').replace(/\s+/g,' ');const facts=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(text)].map(x=>x.segment.trim()).filter(x=>x.length>=40&&x.length<=400).slice(0,80).map((text,index)=>({index,text}));if(facts.length<10)throw Error('Not enough reference facts. Try a more specific topic.');
 return {facts,title:page.title,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ','_'))}`,text:page.extract.slice(0,9000),license:'CC BY-SA 4.0',retrievedAt:new Date().toISOString()};
}
export const normalizeEvidence=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function checkEvidence(value,reference){return (value.questions||[]).map(q=>{const fact=reference.facts?.find(f=>f.index===q.sourceIndex);const answer=normalizeEvidence(q.options?.[q.correct?.[0]]).replace(/^(the|a|an) /,'');if(!fact||!answer||!normalizeEvidence(fact.text).includes(answer))throw Error('Choose a valid sourceIndex and copy the correct answer phrase exactly from that fact.');return fact.text;});}

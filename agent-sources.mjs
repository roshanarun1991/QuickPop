const headers={'User-Agent':'QuickPopQuiz/1.0 (https://github.com/roshanarun1991/QuickPop; educational quiz drafts)'};
async function query(params){const url=new URL('https://en.wikipedia.org/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',...params});const r=await fetch(url,{headers,signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('The free reference source is unavailable. Try again later.');const data=await r.json();if(data.error)throw Error('Reference search failed.');return data.query;}
export async function referenceFor(topic){
 const result=await query({list:'search',srsearch:topic,srlimit:'3',srnamespace:'0'});
 const titles=result?.search?.map(p=>p.title).filter(t=>!t.includes('(disambiguation)'));
 if(!titles?.length)throw Error('No reference article found. Try a more specific topic.');
 const result2=await query({prop:'extracts',explaintext:'1',redirects:'1',titles:titles[0]});
 const page=Object.values(result2?.pages||{}).find(p=>p.extract?.length>500);
 if(!page)throw Error('Not enough reference material for ten questions. Try a more specific topic.');
 return {title:page.title,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ','_'))}`,text:page.extract.slice(0,9000),license:'CC BY-SA 4.0',retrievedAt:new Date().toISOString()};
}
export const normalizeEvidence=s=>String(s).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function checkEvidence(value,reference){for(const q of value.questions||[]){const quote=normalizeEvidence(q.sourceQuote),answer=normalizeEvidence(q.options?.[q.correct?.[0]]);if(quote.length<20||quote.length>400||!normalizeEvidence(reference.text).includes(quote)||!quote.includes(answer))throw Error('Each question needs an exact reference excerpt containing its correct answer. Copy a short supporting sentence from the provided source.');}}

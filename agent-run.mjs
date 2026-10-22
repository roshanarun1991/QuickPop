import {generateQuiz} from './agent-generate.mjs';
import {gunzipSync} from 'node:zlib';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {validateRequest,validateGenerated} from './agent-schema.js';
const stage=process.argv[2],owner=process.env.GITHUB_REPOSITORY_OWNER,repo=process.env.GITHUB_REPOSITORY;
const out=async(key,value)=>{if(process.env.GITHUB_OUTPUT)await writeFile(process.env.GITHUB_OUTPUT,`${key}=${value}\n`,{flag:'a'});};
const save=async(id,data)=>{await mkdir('agent-drafts',{recursive:true});await writeFile(`agent-drafts/${id}.json`,JSON.stringify(data,null,2)+'\n');};
const comment=async(text)=>{if(!process.env.GITHUB_TOKEN)return;const issue=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8')).issue;const response=await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`,{method:'POST',headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:JSON.stringify({body:text})});if(!response.ok)console.log('Could not add a status comment; see the Actions log.');};
if(stage==='prepare'){
 const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
 if(event.sender?.login!==owner||event.issue?.user?.login!==owner||process.env.GITHUB_ACTOR!==owner)throw Error('Only the repository owner may run the quiz agent.');
 const match=event.issue.body?.match(/```json\s*([\s\S]*?)```/);if(!match)throw Error('Missing request JSON.');
 const request=validateRequest(JSON.parse(match[1]));
 request.issueNumber=event.issue.number;request.source=event.issue.html_url;request.createdAt=new Date().toISOString();
 await writeFile('agent-request.tmp.json',JSON.stringify(request));await out('action',request.action);await out('request_id',request.requestId);
 if(request.action==='generate')await save(request.requestId,{...request,status:'generating'});
}else if(stage==='generate'){
 const request=JSON.parse(await readFile('agent-request.tmp.json','utf8'));
 const {quiz,reference}=await generateQuiz(request);
 await save(request.requestId,{...request,status:'ready',model:'qwen2.5:3b',reviewRequired:true,reference,quiz,completedAt:new Date().toISOString()});
 await comment(`Your 10-question ${request.difficulty} draft is ready. Open [QuickPop Admin](https://roshanarun1991.github.io/QuickPop/#admin), check the request, and review every answer before publishing. Request ID: ${request.requestId}. AI drafts can contain factual errors.`);
}else if(stage==='publish'){
 const request=JSON.parse(await readFile('agent-request.tmp.json','utf8'));
 const draft=JSON.parse(await readFile(`agent-drafts/${request.requestId}.json`,'utf8'));
 if(!['ready','published'].includes(draft.status)||draft.requestId!==request.requestId)throw Error('That draft is not ready to publish.');
 const reviewed=request.reviewed?JSON.parse(gunzipSync(Buffer.from(request.reviewed,'base64url'),{maxOutputLength:40000}).toString('utf8')):draft.quiz;
 const quiz=validateGenerated(reviewed,draft);quiz.source=draft.reference?.url||draft.quiz.source||draft.source;
 const packs=JSON.parse(await readFile('generated-packs.json','utf8'));
 const existing=packs.findIndex(p=>p.id===quiz.id);if(existing<0)packs.push(quiz);else packs[existing]=quiz;
 await writeFile('generated-packs.json',JSON.stringify(packs,null,2)+'\n');
 await save(request.requestId,{...draft,quiz,status:'published',publishedAt:new Date().toISOString()});
 await comment('The reviewed quiz has been added to the catalogue. Automated QA and GitHub Pages deployment run next. If QA fails, the currently published website stays unchanged.');
}else if(stage==='fail'){
 try{const r=JSON.parse(await readFile('agent-request.tmp.json','utf8'));if(r.action==='generate')await save(r.requestId,{...r,status:'failed',error:'The free generator could not finish this request. Check the GitHub Actions log and submit a fresh request. No paid fallback was used.'});await comment('The quiz agent could not complete this request. See the Actions log for details. You can submit a new request from Admin.');}catch{console.log('No validated request to update.');}
}else throw Error('Unknown agent stage.');

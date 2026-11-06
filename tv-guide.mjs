// Rebuild the 16:9 TV guide: npm run build, then node tv-guide.mjs.
import {chromium} from 'playwright';
import QRCode from 'qrcode';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
const target='https://quickpop.rans-quiz.workers.dev/#join';
const qr=await QRCode.toDataURL(target,{errorCorrectionLevel:'H',margin:4,scale:16,color:{dark:'#161713',light:'#ffffff'}});
const font=async name=>'data:font/woff2;base64,'+(await readFile(`dist/${name}.woff2`)).toString('base64');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url('${await font('anton')}')}@font-face{font-family:Courier;src:url('${await font('courier')}')}
*{box-sizing:border-box}body{margin:0;width:1920px;height:1080px;background:#f3ead5;color:#161713;font-family:Arial,sans-serif;padding:64px 80px;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #161713;padding-bottom:26px}.brand{font:64px/1 Anton;letter-spacing:-1px}.brand span{background:#ffd928;padding:0 7px}.brand b{color:#ff5f91;font-weight:400}.tag{font:22px Courier;letter-spacing:1px}
.layout{display:grid;grid-template-columns:1fr 580px;gap:72px;margin-top:44px}h1{font:94px/1.08 Anton;margin:0 0 30px;letter-spacing:-1px}h1 span{background:#ff5f91;display:inline-block;padding:0 14px 8px;rotate:-1deg}.steps{display:grid;gap:23px;margin-top:36px}.step{display:flex;gap:24px;align-items:center}.num{width:66px;height:66px;border:3px solid #161713;box-shadow:4px 4px 0 #161713;display:grid;place-items:center;font:36px Anton;flex:none}.step:nth-child(1) .num{background:#5dd9e7}.step:nth-child(2) .num{background:#ffd928}.step:nth-child(3) .num{background:#b591f7}.step:nth-child(4) .num{background:#7fd06d}.step h2{font:31px/1.15 Anton;letter-spacing:.2px;margin:0 0 6px}.step p{font:24px/1.25 Arial;margin:0}.scan{background:#5dd9e7;border:3px solid #161713;box-shadow:10px 10px 0 #161713;padding:28px;text-align:center;align-self:start}.scan h2{font:47px/1 Anton;margin:0 0 22px}.scan img{display:block;width:460px;height:460px;max-width:100%;margin:0 auto;background:white}.scan p{font:20px/1.4 Courier;margin:20px 0 0}.scan .small{font:18px/1.4 Arial;margin:12px 0 0}.bottom{position:absolute;left:80px;right:80px;bottom:54px;display:flex;justify-content:space-between;gap:32px;border-top:3px solid #161713;padding-top:24px}.host{font:21px/1.4 Arial;max-width:1120px}.host b{font-family:Courier}.credit{font:18px/1.5 Courier;text-align:right;white-space:nowrap}
</style></head><body>
<header class="top"><div class="brand">QUICK<span>POP</span><b>✳</b></div><div class="tag">NO DOWNLOADS. NO ACCOUNTS. JUST PLAY.</div></header>
<main class="layout"><section><h1>PHONES OUT.<br><span>GAME ON.</span></h1><div class="steps">
<div class="step"><span class="num">1</span><div><h2>SCAN THE CODE</h2><p>Open your phone camera. Point it at the square.</p></div></div>
<div class="step"><span class="num">2</span><div><h2>TYPE THE GAME PIN</h2><p>Use the 4 numbers your host shows you.</p></div></div>
<div class="step"><span class="num">3</span><div><h2>PICK A FUN NAME & JOIN</h2><p>Tap “Let me in”. Wait for your host to start.</p></div></div>
<div class="step"><span class="num">4</span><div><h2>TAP YOUR ANSWER</h2><p>“Pick 2”? Tap two. Answers lock in by themselves!</p></div></div>
</div></section><aside class="scan"><h2>SCAN TO JOIN ↗</h2><img src="${qr}" alt="QR code to join QuickPop"><p>quickpop.rans-quiz.workers.dev</p><p class="small">Playing alone? Open the site, pick a topic<br>and tap “Try solo first”.</p></aside></main>
<footer class="bottom"><div class="host"><b>HOSTING?</b> Open QuickPop → pick a topic → Start a room → share the PIN.<br>Once everyone is in, start the game. Up to 25 players!</div><div class="credit">MADE FOR THE PEOPLE AROUND YOU.<br>Powered by Roshan Arun Designs</div></footer></body></html>`;
const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});await page.setContent(html);await page.evaluate(()=>document.fonts.ready);await page.locator('.scan img').evaluate(i=>i.decode());
 assert(await page.evaluate(()=>document.querySelector('.layout').getBoundingClientRect().bottom<document.querySelector('.bottom').getBoundingClientRect().top));
 await page.screenshot({path:'quickpop-tv.png'});
 // Decode the actual exported image at both 4K and HD display sizes.
 for(const [width,height] of [[3840,2160],[1920,1080]]){
  const resized=await page.evaluate(async({src,width,height})=>{const i=new Image();i.src=src;await i.decode();const c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').drawImage(i,0,0,width,height);return c.toDataURL('image/png').split(',')[1];},{src:'data:image/png;base64,'+(await readFile('quickpop-tv.png')).toString('base64'),width,height});
  const pixels=PNG.sync.read(Buffer.from(resized,'base64'));assert.equal(jsQR(new Uint8ClampedArray(pixels.data),width,height)?.data,target);console.log(`PASS exported ${width}x${height} QR decodes to ${target}`);
 }
}finally{await browser.close();}
const png=PNG.sync.read(await readFile('quickpop-tv.png'));assert.equal(png.width,3840);assert.equal(png.height,2160);
console.log('TV guide: quickpop-tv.png (3840×2160)');

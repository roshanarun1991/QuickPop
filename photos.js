export const MAX_PHOTO_CHARS=70000;
export const MAX_QUIZ_BYTES=1100000;
export function validatePhoto(value){
 if(value==null||value==='')return null;
 if(typeof value!=='string'||value.length>MAX_PHOTO_CHARS||!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error('Use a compressed JPEG or PNG photo (up to 50 KB).');
 const data=value.split(',')[1];
 if(!(value.startsWith('data:image/jpeg;')&&data.startsWith('/9j/')||value.startsWith('data:image/png;')&&data.startsWith('iVBORw0KGgo')))throw Error('That photo is not a valid JPEG or PNG.');
 return value;
}
export async function preparePhoto(file){
 if(!file||file.size>15*1024*1024)throw Error('Choose a photo smaller than 15 MB.');
 if(!/^image\//.test(file.type))throw Error('Choose a picture from your photo library.');
 const url=URL.createObjectURL(file),img=new Image();
 try{
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('This image format cannot be opened here. Save it as JPEG or PNG and try again.'));img.src=url;});
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  for(const edge of [640,480,320]){
   const scale=Math.min(1,edge/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   for(const quality of [.8,.6,.4]){const result=canvas.toDataURL('image/jpeg',quality);if(result.length<=MAX_PHOTO_CHARS)return validatePhoto(result);}
  }
  throw Error('This picture is too detailed. Crop it and try again.');
 }finally{URL.revokeObjectURL(url);}
}

import {FOOD,FLAGS} from './visual-media.js';
import {LOGOS} from './logo-media.js';
const make=(id,title,category,icon,color,description,entries,question,source)=>({id,title,category,icon,color,description,source,difficulty:'Easy + Hard',questions:entries.map((item,i)=>{
 const distractors=entries.filter(x=>x.answer!==item.answer).filter((x,j,a)=>a.findIndex(y=>y.answer===x.answer)===j);
 const others=[0,1,2].map(j=>distractors[(i*3+j)%distractors.length].answer);
 return {id:`${id}-${i}`,text:item.text||question,options:[item.answer,...others],correct:[0],fact:item.fact||`${item.answer} — ${item.clue}`,type:'single',difficulty:i<10?'easy':'hard',image:item.image||null,clue:item.clue||''};
})});
const currencies=[['United States','US dollar','USD'],['United Kingdom','Pound sterling','GBP'],['Japan','Japanese yen','JPY'],['India','Indian rupee','INR'],['Sweden','Swedish krona','SEK'],['Norway','Norwegian krone','NOK'],['Switzerland','Swiss franc','CHF'],['Canada','Canadian dollar','CAD'],['Australia','Australian dollar','AUD'],['Germany','Euro','EUR'],['Czechia','Czech koruna','CZK'],['Hungary','Hungarian forint','HUF'],['Poland','Polish złoty','PLN'],['Thailand','Thai baht','THB'],['Vietnam','Vietnamese đồng','VND'],['Indonesia','Indonesian rupiah','IDR'],['Mexico','Mexican peso','MXN'],['Brazil','Brazilian real','BRL'],['South Africa','South African rand','ZAR'],['South Korea','South Korean won','KRW']];
const artists=[
 ['Taylor Swift','Which artist released the albums 1989 and Folklore?','1989 and Folklore are Taylor Swift studio albums.'],
 ['Beyoncé','Which artist released Lemonade and was a member of Destiny’s Child?','Beyoncé released Lemonade in 2016.'],
 ['Adele','Which singer released the albums 19, 21 and 25?','Adele named these albums after ages in her life.'],
 ['Michael Jackson','Which artist released Thriller and Bad?','Both are Michael Jackson albums.'],
 ['Madonna','Which singer released Like a Virgin and Ray of Light?','Madonna released Ray of Light in 1998.'],
 ['Ed Sheeran','Which singer released Shape of You and the album Divide?','Shape of You appears on Ed Sheeran’s Divide.'],
 ['Lady Gaga','Which singer released The Fame and Chromatica?','Lady Gaga released The Fame in 2008.'],
 ['Elton John','Which pianist and singer is associated with Rocket Man and Tiny Dancer?','Both songs are associated with Elton John.'],
 ['Bob Marley','Which Jamaican artist recorded with the Wailers?','Bob Marley and the Wailers are central figures in reggae.'],
 ['Dolly Parton','Which singer wrote Jolene and I Will Always Love You?','Dolly Parton wrote both songs.'],
 ['Nina Simone','Which artist recorded the debut album Little Girl Blue?','Nina Simone’s debut studio album was Little Girl Blue.'],
 ['Kate Bush','Which artist released the albums Hounds of Love and The Dreaming?','Kate Bush released Hounds of Love in 1985.'],
 ['Joni Mitchell','Which artist released Blue and Court and Spark?','Joni Mitchell released Blue in 1971.'],
 ['Prince','Which artist released the albums Sign o’ the Times and Purple Rain?','Prince released Sign o’ the Times in 1987.'],
 ['David Bowie','Which artist adopted the Ziggy Stardust persona?','Ziggy Stardust is a David Bowie persona.'],
 ['Björk','Which Icelandic singer released Vespertine and Debut?','Björk released Vespertine in 2001.'],
 ['Sade','Which singer fronts the band that released Diamond Life?','Sade Adu fronts the band Sade.'],
 ['Fela Kuti','Which Nigerian musician was a pioneer of Afrobeat?','Fela Kuti was a key pioneer of Afrobeat.'],
 ['Ravi Shankar','Which Indian sitar player collaborated with George Harrison?','Ravi Shankar helped introduce Indian classical music to new audiences.'],
 ['Cesária Évora','Which Cape Verdean singer was known as the Barefoot Diva?','Cesária Évora was celebrated for singing morna.']
];
const science=[['Which planet is known for its prominent ring system?','Saturn'],['Which gas do plants take in during photosynthesis?','Carbon dioxide'],['What is the chemical symbol for gold?','Au'],['Which organ pumps blood around the human body?','Heart'],['How many legs does an insect have?','Six'],['What force keeps planets in orbit around the Sun?','Gravity'],['What is the nearest star to Earth?','The Sun'],['What is frozen water commonly called?','Ice'],['Which instrument measures temperature?','Thermometer'],['What is the centre of an atom called?','Nucleus'],['Which particle has a negative electric charge?','Electron'],['What is the SI unit of electrical resistance?','Ohm'],['Which element has atomic number 6?','Carbon'],['What is the process of a solid turning directly into a gas called?','Sublimation'],['Which organelle is associated with cellular respiration?','Mitochondrion'],['What is the SI unit of force?','Newton'],['Which law relates voltage, current and resistance?','Ohm’s law'],['Which planet has the moon Titan?','Saturn'],['Which type of electromagnetic radiation has a shorter wavelength than visible violet light?','Ultraviolet'],['What is the chemical formula of methane?','CH₄']];
export const TOPIC_PACKS=[
 make('guess-food','Guess the Food','Picture Rounds','🍽','orange','A feast for your eyes. Name the illustrated dish.',FOOD.map(f=>({answer:f.name,image:`food-${f.id}`,clue:f.alt})), 'Which food is illustrated?','https://www.britannica.com/topic/food'),
 make('guess-logo','Guess the Logo','Picture Rounds','◈','violet','Familiar marks. Surprisingly tricky names.',LOGOS.map(l=>({answer:l.name,image:`logo-${l.slug}`,clue:l.clue,fact:`${l.name}. ${l.clue}`})),'Which brand or project uses this mark?','https://simpleicons.org/'),
 make('guess-flag','Flag Finder','Picture Rounds','⚑','blue','Spot the country from its flag.',FLAGS.map(([id,name,alt])=>({answer:name,image:`flag-${id}`,clue:alt})),'Which country does this flag represent?','https://www.britannica.com/topic/flag-heraldry'),
 make('currencies','Currency Quest','Around the World','¤','green','From familiar notes to less familiar currency names.',currencies.map(([country,answer,code])=>({answer,text:`What currency is used in ${country}?`,fact:`${country} uses the ${answer.toLowerCase()} (${code}).`})),'','https://www.iso.org/iso-4217-currency-codes.html'),
 make('guess-artist','Guess the Artist','Music','♫','pink','Albums, stage names and unmistakable clues.',artists.map(([answer,text,fact])=>({answer,text,fact})),'','https://www.britannica.com/art/popular-music'),
 make('science','Science Spark','Games & Geek','⚗','cyan','A little curiosity. A lot of light-bulb moments.',science.map(([text,answer])=>({text,answer,fact:`${answer} is the answer to this science question.`})),'','https://www.britannica.com/science/science')
];

import {EXTRA} from './extra-questions.js';
import {HARD} from './hard-questions.js';
import {TOPIC_PACKS} from './topic-packs.js';
import generated from './generated-packs.json' with {type:'json'};
// Original wording. Stable, general-audience facts; descriptive topic names, no franchise artwork.
const p = (id,title,category,icon,color,description,rows,source) => ({
  id,title,category,icon,color,description,source,difficulty:'Mixed',questions:rows.map((r,i)=>({
    id:`${id}-${i}`,text:r[0],options:r[1],correct:Array.isArray(r[2])?r[2]:[r[2]??0],
    fact:r[3]||'',type:Array.isArray(r[2])&&r[2].length>1?'multi':r[1].length===2?'boolean':'single',image:r[4]||null
  }))
});
export const PACKS = [
 p('friends','Friends','TV & Film','☕','yellow','The one with your competitive colleagues.',[
 ['What is the name of the friends’ regular coffee shop?',['Central Perk','Daily Grind','Coffee Corner','Monk’s'],0,'Central Perk is the group’s familiar meeting spot.'],
 ['Which character works as a palaeontologist?',['Ross','Joey','Chandler','Mike'],0,'Ross studies prehistoric life.'],
 ['Who performs “Smelly Cat”?',['Phoebe','Rachel','Monica','Janice'],0,'Phoebe brings her very distinctive songs to Central Perk.'],
 ['Which two characters are siblings?',['Ross and Monica','Joey and Rachel','Phoebe and Chandler','Monica and Joey'],0,'Ross and Monica are the Geller siblings.'],
 ['Joey’s profession is acting.',['True','False'],0,'One of Joey’s roles is Dr. Drake Ramoray.'],
 ['Which TWO are members of the main six friends?',['Rachel','Gunther','Chandler','Janice'],[0,2],'Rachel and Chandler are two of the six central characters.']
 ],'https://www.warnerbros.com/tv/friends'),
 p('thrones','Game of Thrones','TV & Film','♜','pink','Houses, dragons and a little friendly rivalry.',[
 ['Which house uses the words “Winter Is Coming”?',['Stark','Lannister','Tyrell','Martell'],0,'The Stark family rules from Winterfell.'],
 ['What is the name of the Stark family’s ancestral home?',['Winterfell','Highgarden','Dragonstone','Casterly Rock'],0,'Winterfell is in the North.'],
 ['Which creature appears on the Targaryen sigil?',['A dragon','A lion','A wolf','A stag'],0,'The Targaryen sigil depicts a three-headed dragon.'],
 ['Who is nicknamed the Imp?',['Tyrion','Jaime','Bran','Samwell'],0,'Tyrion is a member of House Lannister.'],
 ['The Night’s Watch guards the Wall.',['True','False'],0,'The Wall separates the Seven Kingdoms from the far North.'],
 ['Which TWO names belong to Stark sisters?',['Arya','Sansa','Cersei','Margaery'],[0,1],'Arya and Sansa are daughters of Ned and Catelyn Stark.']
 ],'https://www.hbo.com/game-of-thrones'),
 p('movie-night','Movie Night','TV & Film','🎬','cyan','Big-screen favourites. Small-screen bragging rights.',[
 ['In Jurassic Park, what kind of animals are brought back?',['Dinosaurs','Dodos','Mammoths','Sabre-toothed cats'],0,'The park’s attractions are genetically recreated dinosaurs.'],
 ['Which film features a ship named the Black Pearl?',['Pirates of the Caribbean','Titanic','Jaws','Moana'],0,'The Black Pearl is closely associated with Captain Jack Sparrow.'],
 ['In The Matrix, which colour pill does Neo take?',['Red','Blue','Green','Yellow'],0,'The red pill leads Neo out of the simulation.'],
 ['Which film features the character Marty McFly?',['Back to the Future','Ghostbusters','The Goonies','Groundhog Day'],0,'Marty travels through time in a modified DeLorean.'],
 ['E.T. wants to phone home.',['True','False'],0,'“E.T. phone home” is one of the film’s best-known lines.'],
 ['What is the name of the cowboy toy in Toy Story?',['Woody','Buzz','Rex','Andy'],0,'Woody is a pull-string cowboy doll.']
 ],'https://www.britannica.com/art/motion-picture'),
 p('wizard-world','Wizard World','TV & Film','⚡','violet','A little knowledge. A lot of magic.',[
 ['Which school does Harry Potter attend?',['Hogwarts','Nevermore','Xavier’s School','Brakebills'],0,'Hogwarts is a school of witchcraft and wizardry.'],
 ['What is the name of Harry’s owl?',['Hedwig','Fawkes','Crookshanks','Scabbers'],0,'Hedwig is a snowy owl.'],
 ['Which sport is played on flying broomsticks?',['Quidditch','Gobstones','Wizard chess','Polo'],0,'Quidditch players chase several different balls.'],
 ['Who is the Hogwarts groundskeeper when Harry first arrives?',['Hagrid','Filch','Snape','Lupin'],0,'Hagrid helps introduce Harry to the wizarding world.'],
 ['Hermione’s surname is Granger.',['True','False'],0,'Hermione Granger is one of Harry’s closest friends.'],
 ['Which TWO are Hogwarts houses?',['Ravenclaw','Slytherin','Winterfell','Narnia'],[0,1],'Hogwarts has four houses, including Ravenclaw and Slytherin.']
 ],'https://www.harrypotter.com/'),
 p('animation','Animation Station','TV & Film','🎈','green','Tiny details from larger-than-life adventures.',[
 ['What kind of fish is Nemo?',['Clownfish','Goldfish','Tuna','Seahorse'],0,'Nemo and Marlin are clownfish.'],
 ['Which animal is Po in Kung Fu Panda?',['A panda','A tiger','A fox','A bear cub named Baloo'],0,'Po dreams of becoming a kung fu master.'],
 ['In Frozen, who is Anna’s sister?',['Elsa','Ariel','Belle','Merida'],0,'Elsa has magical powers associated with ice and snow.'],
 ['Which film follows a rat who loves cooking?',['Ratatouille','Brave','Cars','Up'],0,'Remy dreams of cooking in a Paris restaurant.'],
 ['WALL-E is a robot.',['True','False'],0,'WALL-E is a waste-collecting robot.'],
 ['What lifts the house into the air in Up?',['Balloons','Kites','Propellers','A rocket'],0,'A huge cluster of balloons carries Carl’s house.']
 ],'https://www.pixar.com/feature-films'),
 p('abba','ABBA & Swedish Pop','Music','✦','yellow','Dancing queens, pop hooks and Swedish exports.',[
 ['Which song won Eurovision for ABBA in 1974?',['Waterloo','Dancing Queen','Mamma Mia','SOS'],0,'ABBA won Eurovision in Brighton with Waterloo.'],
 ['How many members were in ABBA’s classic line-up?',['Four','Three','Five','Six'],0,'The name uses the initials of Agnetha, Björn, Benny and Anni-Frid.'],
 ['Which ABBA song begins with a title referring to a dancing royal?',['Dancing Queen','Super Trouper','Fernando','Chiquitita'],0,'Dancing Queen was released in 1976.'],
 ['Which country did the duo Roxette come from?',['Sweden','Norway','Denmark','Finland'],0,'Roxette featured Marie Fredriksson and Per Gessle.'],
 ['Avicii was a Swedish DJ and producer.',['True','False'],0,'Avicii was the stage name of Tim Bergling.'],
 ['Which TWO are ABBA song titles?',['Take a Chance on Me','The Winner Takes It All','Wonderwall','Poker Face'],[0,1],'Both selected songs are ABBA singles.']
 ],'https://abbasite.com/'),
 p('nineties','90s Mixtape','Music','📼','pink','No streaming. Just very good memories.',[
 ['Which British group sang Wannabe?',['Spice Girls','All Saints','Sugababes','Atomic Kitten'],0,'Wannabe was the Spice Girls’ debut single.'],
 ['Which band released Nevermind in 1991?',['Nirvana','Blur','Oasis','Radiohead'],0,'Nevermind includes Smells Like Teen Spirit.'],
 ['Who sang …Baby One More Time?',['Britney Spears','Christina Aguilera','Madonna','Mariah Carey'],0,'It was Britney Spears’ debut single.'],
 ['Which band released Wonderwall?',['Oasis','Pulp','Suede','The Verve'],0,'Wonderwall appears on (What’s the Story) Morning Glory?'],
 ['The Backstreet Boys are a vocal group.',['True','False'],0,'The group formed in Orlando in the 1990s.'],
 ['Which singer performed My Heart Will Go On for Titanic?',['Céline Dion','Whitney Houston','Cher','Shania Twain'],0,'The song became closely associated with the 1997 film.']
 ],'https://www.britannica.com/art/rock-music'),
 p('eurovision','Eurovision Energy','Music','🎤','cyan','Big choruses. Bigger opinions.',[
 ['Which country won Eurovision with ABBA in 1974?',['Sweden','UK','France','Ireland'],0,'Waterloo gave Sweden its first Eurovision victory.'],
 ['Which country hosted the first Eurovision in 1956?',['Switzerland','Italy','Belgium','Germany'],0,'The first contest was held in Lugano.'],
 ['Which country did Måneskin represent when they won?',['Italy','Finland','France','Norway'],0,'Måneskin won the 2021 contest.'],
 ['Which song did Loreen win with in 2012?',['Euphoria','Tattoo','Heroes','Satellite'],0,'Loreen later won again with Tattoo in 2023.'],
 ['Australia has competed in Eurovision.',['True','False'],0,'Australia first competed in 2015.'],
 ['Which country did Lordi represent in their 2006 victory?',['Finland','Iceland','Sweden','Estonia'],0,'Hard Rock Hallelujah won for Finland.']
 ],'https://eurovision.tv/history'),
 p('sweden','Hej, Sweden!','Around the World','🇸🇪','blue','Fika-level friendly. Final-round competitive.',[
 ['Which country’s flag is shown?',['Sweden','Finland','Denmark','Norway'],0,'Sweden’s flag has a yellow Nordic cross on a blue field.','flag-sweden'],
 ['What is Sweden’s capital?',['Stockholm','Gothenburg','Malmö','Uppsala'],0,'Stockholm sits across islands connected by bridges.'],
 ['What is fika most closely associated with?',['A coffee break','An ice bath','A train ticket','A folk dance'],0,'Fika is a social break, often with coffee and something sweet.'],
 ['Which currency is used in Sweden?',['Swedish krona','Euro','Danish krone','Swiss franc'],0,'The currency code is SEK.'],
 ['The Nobel Peace Prize is presented in Stockholm.',['True','False'],1,'The Peace Prize is presented in Oslo; the other Nobel prizes are presented in Stockholm.'],
 ['Which TWO cities are in Sweden?',['Gothenburg','Malmö','Bergen','Turku'],[0,1],'Bergen is in Norway; Turku is in Finland.']
 ],'https://sweden.se/'),
 p('india','Incredible India','Around the World','🇮🇳','orange','Landmarks, flavours and familiar favourites.',[
 ['Which city is India’s capital?',['New Delhi','Mumbai','Kolkata','Chennai'],0,'New Delhi is the seat of India’s national government.'],
 ['In which city is the Taj Mahal?',['Agra','Jaipur','Delhi','Hyderabad'],0,'The Taj Mahal stands beside the Yamuna River in Agra.'],
 ['What appears in the centre of India’s flag?',['A blue wheel','A green star','An orange sun','A white lotus'],0,'The Ashoka Chakra has 24 spokes.'],
 ['Which of these is a classical Indian string instrument?',['Sitar','Oboe','Trombone','Accordion'],0,'The sitar is a plucked string instrument.'],
 ['India’s currency is the rupee.',['True','False'],0,'Its currency code is INR.'],
 ['Which TWO are Indian states?',['Kerala','Gujarat','Kathmandu','Colombo'],[0,1],'Kathmandu and Colombo are cities outside India.']
 ],'https://knowindia.india.gov.in/'),
 p('capitals','Capital Ideas','Around the World','🌍','green','Your lunch-break trip around the world.',[
 ['What is the capital of Japan?',['Tokyo','Kyoto','Osaka','Nagoya'],0,'Tokyo is Japan’s capital.'],
 ['What is the capital of Canada?',['Ottawa','Toronto','Vancouver','Montreal'],0,'Ottawa lies on the Ottawa River.'],
 ['What is the capital of Australia?',['Canberra','Sydney','Melbourne','Perth'],0,'Canberra was developed as the national capital.'],
 ['Which country has Lisbon as its capital?',['Portugal','Spain','Italy','Greece'],0,'Lisbon is on the estuary of the Tagus River.'],
 ['Rio de Janeiro is Brazil’s current capital.',['True','False'],1,'Brasília has been Brazil’s capital since 1960.'],
 ['Which TWO cities are national capitals?',['Helsinki','Oslo','Bergen','Tampere'],[0,1],'Helsinki is Finland’s capital and Oslo is Norway’s.']
 ],'https://www.britannica.com/topic/list-of-national-capitals-2034153'),
 p('food','Food Passport','Around the World','🍜','yellow','A tasty reason to disagree politely.',[
 ['Which ingredient forms the base of traditional hummus?',['Chickpeas','Rice','Potatoes','Lentils'],0,'Hummus commonly combines chickpeas with tahini, lemon and garlic.'],
 ['Sushi rice is traditionally seasoned with what?',['Vinegar','Cocoa','Mustard','Cream'],0,'The seasoned rice is central to sushi.'],
 ['Which country is strongly associated with paella?',['Spain','Poland','Japan','Canada'],0,'Paella originated in the Valencia region.'],
 ['What is tofu made from?',['Soybeans','Wheat','Milk','Chickpeas'],0,'Tofu is made by coagulating soy milk.'],
 ['Saffron comes from a flower.',['True','False'],0,'Saffron consists of dried stigmas from the saffron crocus.'],
 ['Which TWO foods are normally made using fermentation?',['Yogurt','Kimchi','Plain boiled rice','Freshly sliced apple'],[0,1],'Fermentation helps create their characteristic flavours.']
 ],'https://www.britannica.com/topic/food'),
 p('diwali','Diwali Lights','Festivals','🪔','orange','Light, celebration and traditions that vary.',[
 ['Diwali is widely known as the festival of what?',['Lights','Snow','Kites only','Rain'],0,'Light is a central symbol in many Diwali traditions.'],
 ['What is a diya?',['A small lamp','A drum','A scarf','A sweet'],0,'Traditional diyas are often oil lamps made from clay.'],
 ['What is rangoli commonly used for?',['Decorative floor patterns','Making music','Writing recipes','Building boats'],0,'Patterns may use coloured powders, flowers or other materials.'],
 ['Which greeting is commonly used for the festival?',['Happy Diwali','Happy Halloween','God Jul','Glad midsommar'],0,'Greetings vary across languages and communities.'],
 ['Every community celebrates Diwali in exactly the same way.',['True','False'],1,'Stories, customs and celebrations differ by region and community.'],
 ['Which goddess is associated with prosperity in many Diwali celebrations?',['Lakshmi','Athena','Isis','Freyja'],0,'Lakshmi is honoured in many Hindu Diwali traditions.']
 ],'https://www.britannica.com/topic/Diwali-Hindu-festival'),
 p('holi','Holi Colour Club','Festivals','🎨','pink','A colourful celebration of spring.',[
 ['Holi is particularly associated with which season in India?',['Spring','Autumn','Winter','Monsoon only'],0,'Holi is commonly celebrated as spring arrives.'],
 ['What are the coloured powders used in Holi often called?',['Gulal','Garam masala','Saffron threads','Henna paste'],0,'Gulal refers to coloured powder used during celebrations.'],
 ['What is Holika Dahan associated with?',['A bonfire','An ice sculpture','A boat race','A harvest auction'],0,'Bonfires are lit in this observance before the colour celebrations.'],
 ['Which pair is closely linked to Holi traditions in Braj?',['Radha and Krishna','Rama and Hanuman','Shiva and Ganesha','Arjuna and Bhima'],0,'Braj has distinctive traditions connected with Radha and Krishna.'],
 ['Holi is celebrated only within India.',['True','False'],1,'Communities celebrate Holi in many countries.'],
 ['What is a considerate rule at a workplace colour celebration?',['Ask before applying colour','Throw colour at everyone','Ignore allergies','Use unknown chemicals'],0,'Consent and skin-safe materials help everyone enjoy the celebration.']
 ],'https://www.britannica.com/topic/Holi'),
 p('midsommar','Midsummer Mood','Festivals','🌼','green','Flowers, long evenings and one famous frog dance.',[
 ['What is commonly raised at a Swedish Midsummer celebration?',['A decorated maypole','A Christmas tree','A giant lantern','A snow tower'],0,'The midsommarstång is decorated with greenery and flowers.'],
 ['Which fruit is strongly associated with Swedish Midsummer desserts?',['Strawberries','Mangoes','Pomegranates','Dates'],0,'Strawberries and cream are a familiar favourite.'],
 ['What does “Små grodorna” mean?',['The little frogs','The tall trees','The white clouds','The happy birds'],0,'The song accompanies a playful dance.'],
 ['Which season is Midsummer in?',['Summer','Winter','Autumn','Spring'],0,'It is celebrated near the summer solstice.'],
 ['A flower crown is a familiar Midsummer accessory.',['True','False'],0,'Many people make crowns from flowers and greenery.'],
 ['Which TWO foods are common at a Swedish Midsummer meal?',['Pickled herring','New potatoes','Mooncakes','Thanksgiving stuffing'],[0,1],'Menus vary, but herring and new potatoes are traditional staples.']
 ],'https://sweden.se/culture/celebrations/midsummer'),
 p('christmas','Christmas Crackers','Festivals','🎄','green','A festive round for the whole table.',[
 ['In A Christmas Carol, what is Scrooge’s first name?',['Ebenezer','Edward','Edmund','Ernest'],0,'Charles Dickens created Ebenezer Scrooge.'],
 ['What colour is Rudolph’s famous nose?',['Red','Blue','Green','Purple'],0,'Rudolph is the red-nosed reindeer.'],
 ['Which plant is traditionally associated with a Christmas kiss?',['Mistletoe','Basil','Lavender','Cactus'],0,'Mistletoe features in this custom.'],
 ['In Sweden, on which December date is Christmas Eve?',['24','25','26','31'],0,'Julafton falls on 24 December.'],
 ['The Nutcracker is a ballet.',['True','False'],0,'Tchaikovsky composed its music.'],
 ['Which TWO are names of Santa’s reindeer in the traditional poem?',['Dasher','Dancer','Simba','Nemo'],[0,1],'Dasher and Dancer appear in A Visit from St. Nicholas.']
 ],'https://www.britannica.com/topic/Christmas'),
 p('halloween','Halloween After Hours','Festivals','🎃','orange','Spooky enough. Safe for the lunch room.',[
 ['On which date is Halloween?',['31 October','1 October','5 November','30 November'],0,'Halloween falls on the last day of October.'],
 ['What is a carved, lit pumpkin often called?',['Jack-o’-lantern','Fire apple','Moon basket','Candle melon'],0,'Turnips were also traditionally carved in parts of Ireland and Britain.'],
 ['Which animal is traditionally associated with vampires?',['Bat','Otter','Swan','Rabbit'],0,'Bat imagery is a familiar part of vampire folklore.'],
 ['Who wrote the novel Frankenstein?',['Mary Shelley','Bram Stoker','Agatha Christie','Jane Austen'],0,'Frankenstein was first published in 1818.'],
 ['Spiders are insects.',['True','False'],1,'Spiders are arachnids; they have eight legs.'],
 ['Which TWO are fictional supernatural creatures?',['Werewolves','Vampires','Owls','Bats'],[0,1],'Owls and bats are real animals.']
 ],'https://www.britannica.com/topic/Halloween'),
 p('retro','Retro Arcade','Games & Geek','👾','violet','Insert imaginary coin. Bring actual skills.',[
 ['What does Pac-Man eat in the maze?',['Dots','Coins','Rings','Mushrooms'],0,'Pac-Man clears dots while avoiding ghosts.'],
 ['Which character is the main hero of most Legend of Zelda games?',['Link','Zelda','Ganondorf','Tingle'],0,'Link is usually the playable hero.'],
 ['Which company created the Sonic the Hedgehog series?',['Sega','Nintendo','Atari','Sony'],0,'Sonic debuted in 1991.'],
 ['How many squares make up a standard Tetris tetromino?',['Four','Three','Five','Six'],0,'Each tetromino consists of four connected squares.'],
 ['Mario’s brother is Luigi.',['True','False'],0,'Luigi is often shown in green.'],
 ['Which TWO are Nintendo game series?',['Mario','The Legend of Zelda','Halo','Sonic the Hedgehog'],[0,1],'Halo originated with Bungie; Sonic is a Sega series.']
 ],'https://www.nintendo.com/us/gaming-systems/history/'),
 p('board-games','Board Meeting','Games & Geek','♟','cyan','The only meeting where taking a turn is fun.',[
 ['How many squares are on a standard chessboard?',['64','60','72','81'],0,'A chessboard has eight rows and eight columns.'],
 ['Which chess piece moves in an L shape?',['Knight','Bishop','Rook','King'],0,'The knight can jump over other pieces.'],
 ['How many points is a blank tile worth in English-language Scrabble?',['Zero','One','Two','Five'],0,'A blank can represent a letter but has no point value.'],
 ['In Monopoly, which space do players pass to collect their regular salary?',['GO','Jail','Free Parking','Chance'],0,'Passing GO normally earns the player money.'],
 ['In standard chess, White moves first.',['True','False'],0,'White makes the first move.'],
 ['Which chess piece moves only along diagonals?',['Bishop','Rook','Queen','Knight'],0,'Only the bishop moves exclusively diagonally. The queen can also move along ranks and files.']
 ],'https://www.fide.com/'),
 p('tech','Tech Time Machine','Games & Geek','💾','blue','From floppy disks to the World Wide Web.',[
 ['Who invented the World Wide Web?',['Tim Berners-Lee','Alan Turing','Steve Jobs','Ada Lovelace'],0,'Berners-Lee developed the Web while working at CERN.'],
 ['What does the B in USB stand for?',['Bus','Byte','Board','Binary'],0,'USB stands for Universal Serial Bus.'],
 ['Which number system uses only 0 and 1?',['Binary','Decimal','Hexadecimal','Roman numerals'],0,'Binary is base two.'],
 ['Which company introduced the iPhone in 2007?',['Apple','Nokia','Motorola','IBM'],0,'Apple introduced the first iPhone in 2007.'],
 ['The internet and the World Wide Web are exactly the same thing.',['True','False'],1,'The Web is one service that runs over the internet.'],
 ['Which TWO are programming languages?',['Python','JavaScript','HDMI','USB'],[0,1],'HDMI and USB are interface standards.']
 ],'https://home.cern/science/computing/birth-web')
];
for(const pack of PACKS){
 const rows=EXTRA[pack.id];
 if(!rows||rows.length!==4)throw Error('Every pack needs four additional questions.');
 for(const [i,[text,answer,b,c,d,fact]] of rows.entries())pack.questions.push({id:pack.id+'-'+(i+6),text,options:[answer,b,c,d],correct:[0],fact,type:'single',image:null});
}
for(const pack of PACKS){for(const q of pack.questions)q.difficulty='easy';pack.questions.push(...HARD[pack.id]);pack.difficulty='Easy + Hard';}
PACKS.push(...TOPIC_PACKS,...generated);
export const difficultyModes=pack=>[...new Set(pack.questions.map(q=>q.difficulty||pack.difficulty||'easy'))].filter(x=>['easy','hard'].includes(x));
export function chooseDifficulty(pack,level='easy'){
 const questions=pack.questions.filter(q=>(q.difficulty||pack.difficulty||'easy')===level);
 if(!questions.length)throw Error(`This quiz has no ${level} questions yet. Choose another difficulty.`);
 return {...pack,difficulty:level,questions};
}
// Deterministically vary answer positions for solo play. Live rooms shuffle again.
for(const pack of PACKS)for(const [i,q] of pack.questions.entries()){
 const shift=([...pack.id].reduce((n,c)=>n+c.charCodeAt(0),0)+i*3)%q.options.length;
 const order=q.options.map((_,j)=>(j+shift)%q.options.length);
 q.options=order.map(j=>q.options[j]);
 q.correct=order.map((old,j)=>q.correct.includes(old)?j:-1).filter(j=>j>=0);
}
export const CATEGORIES = [...new Set(PACKS.map(p=>p.category))];
export const AVATARS = ['🐯','🦊','🐸','🐼','🐙','🦄','🐨','🐧'];
export function dailyPack(date = new Date().toISOString().slice(0,10)) {
  let seed = [...date].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0);
  const rows=PACKS.flatMap(p=>p.questions);
  const selected=[];
  while(selected.length<5) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const q=rows[seed%rows.length];
    if(!selected.includes(q)) selected.push(q);
  }
  return {id:`daily-${date}`,title:'Daily Pop',icon:'✦',color:'yellow',description:'Five questions. One daily brag.',questions:selected};
}

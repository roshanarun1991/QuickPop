// Original harder questions. First option is correct before quiz-bank shuffles it.
const rows={
friends:`What is Chandler's middle name?|Muriel|Francis|Joseph|Charles
What is the name of Joey's stuffed penguin?|Hugsy|Waddles|Pingu|Snowball
Who officiates at Monica and Chandler's wedding?|Joey|Ross|Gunther|Richard
What is the name of Ross's first wife?|Carol|Susan|Emily|Julie
What is the name of Rachel's daughter?|Emma|Ella|Erica|Emily
Who plays Phoebe Buffay?|Lisa Kudrow|Courteney Cox|Jennifer Aniston|Maggie Wheeler
What is the surname of Monica's boyfriend Richard?|Burke|Green|Geller|Stevens
Which character moves to Yemen to avoid Janice?|Chandler|Joey|Ross|Gunther
Which actor plays Gunther?|James Michael Tyler|Paul Rudd|Hank Azaria|Tom Selleck
What is Joey's soap-opera character's surname?|Ramoray|Romano|Reynolds|Rossini`,
thrones:`What is the ancestral seat of House Tyrell?|Highgarden|Riverrun|Sunspear|The Eyrie
What is Arya's sword called?|Needle|Ice|Oathkeeper|Longclaw
What is Jon Snow's Valyrian-steel sword called?|Longclaw|Heartsbane|Widow's Wail|Dark Sister
Who is called the Onion Knight?|Davos Seaworth|Jorah Mormont|Bronn|Barristan Selmy
Which city is associated with the Iron Bank?|Braavos|Pentos|Qarth|Volantis
What is House Martell's seat?|Sunspear|Storm's End|Pyke|Dragonstone
Who is Brienne's father?|Selwyn Tarth|Randyll Tarly|Jeor Mormont|Balon Greyjoy
Which material is also known as obsidian in the series?|Dragonglass|Valyrian steel|Gold|Iron
Which house's words are We Do Not Sow?|Greyjoy|Tully|Arryn|Baratheon
Who is nicknamed the Queen of Thorns?|Olenna Tyrell|Cersei Lannister|Lysa Arryn|Ellaria Sand`,
'movie-night':`Who directed Spirited Away?|Hayao Miyazaki|Akira Kurosawa|Satoshi Kon|Isao Takahata
Which film features the character Rick Blaine?|Casablanca|Citizen Kane|Vertigo|The Third Man
What is the spacecraft in Alien called?|Nostromo|Discovery One|Endurance|Icarus
Who composed the main score for The Good, the Bad and the Ugly?|Ennio Morricone|John Williams|Hans Zimmer|Bernard Herrmann
Which film includes the fictional newspaper The Daily Planet?|Superman|Batman|Spider-Man|Iron Man
Who directed Seven Samurai?|Akira Kurosawa|Yasujiro Ozu|Kenji Mizoguchi|Hayao Miyazaki
Which film features a computer named HAL 9000?|2001: A Space Odyssey|Solaris|Blade Runner|Moon
Which actor plays Amélie in the 2001 film?|Audrey Tautou|Marion Cotillard|Juliette Binoche|Léa Seydoux
Who directed the 1927 film Metropolis?|Fritz Lang|F. W. Murnau|Sergei Eisenstein|Charlie Chaplin
Which film won Best Picture at the 2020 Oscars?|Parasite|1917|Joker|The Irishman`,
'wizard-world':`What is the core of Harry's first wand?|Phoenix feather|Dragon heartstring|Unicorn hair|Veela hair
Which vault stores the Philosopher's Stone before Hagrid collects it?|713|687|711|394
What is the name of the Hogwarts poltergeist?|Peeves|Binns|Firenze|Flitwick
What is Hermione's cat called?|Crookshanks|Scabbers|Trevor|Errol
What is the name of the Hogwarts librarian?|Irma Pince|Pomona Sprout|Poppy Pomfrey|Rolanda Hooch
Which form does Harry's Patronus take?|Stag|Otter|Hare|Phoenix
What is the name of Hagrid's three-headed dog?|Fluffy|Fang|Norbert|Aragog
Who wrote Fantastic Beasts and Where to Find Them within the wizarding world?|Newt Scamander|Gilderoy Lockhart|Bathilda Bagshot|Quirinus Quirrell
Which founder's relic is a diadem?|Rowena Ravenclaw|Helga Hufflepuff|Godric Gryffindor|Salazar Slytherin
Which potion brings good luck?|Felix Felicis|Polyjuice Potion|Veritaserum|Amortentia`,
animation:`What is the name of the critic in Ratatouille?|Anton Ego|Auguste Gusteau|Alfredo Linguini|Skinner
What is the name of the city in Monsters, Inc.?|Monstropolis|Metroville|Zootopia|San Fransokyo
What is the family surname in The Incredibles?|Parr|Parker|Porter|Perry
Which studio made The Iron Giant?|Warner Bros.|Pixar|DreamWorks|Studio Ghibli
Who is the protagonist of Spirited Away?|Chihiro|Satsuki|Kiki|Nausicaä
What is the dragon's name in How to Train Your Dragon?|Toothless|Hookfang|Stormfly|Barf
What is the robot's name in Big Hero 6?|Baymax|Hiro|Tadashi|Wasabi
Which Pixar film features the character Héctor?|Coco|Luca|Soul|Brave
What is the name of the explorer admired by Carl in Up?|Charles Muntz|Russell Jones|John Silver|Henry Waternoose
What is the name of the kingdom in Tangled?|Corona|Arendelle|DunBroch|Atlantica`,
abba:`Which ABBA member's first name is Anni-Frid?|Lyngstad|Fältskog|Andersson|Ulvaeus
What was ABBA's 2021 studio album called?|Voyage|Arrival|The Visitors|Super Trouper
Which ABBA album features a helicopter on its cover?|Arrival|Ring Ring|Waterloo|Voulez-Vous
Which Swedish duo included Per Gessle?|Roxette|Ace of Base|The Knife|First Aid Kit
What was Avicii's birth name?|Tim Bergling|Tim Söderlund|Tobias Karlsson|Björn Berg
Which Swedish singer released Dancing on My Own in 2010?|Robyn|Tove Lo|Lykke Li|Zara Larsson
Which ABBA member was born in Norway?|Anni-Frid|Agnetha|Benny|Björn
What is the surname of ABBA member Agnetha?|Fältskog|Lyngstad|Ulvaeus|Andersson
Which album contains ABBA's One of Us?|The Visitors|Arrival|Waterloo|Ring Ring
Which Swedish band released Lovefool in 1996?|The Cardigans|Roxette|Kent|Europe`,
nineties:`Which band released the 1995 album Different Class?|Pulp|Radiohead|Blur|Oasis
Which band released the 1998 album Mezzanine?|Massive Attack|Portishead|Air|Garbage
Which group released the album Dummy?|Portishead|Massive Attack|Air|Tricky
Who sang Torn on the hit 1997 recording?|Natalie Imbruglia|Natalie Merchant|Lisa Loeb|Sheryl Crow
Which band released Parklife?|Blur|Oasis|Suede|Pulp
What is the title of Lauryn Hill's 1998 solo album?|The Miseducation of Lauryn Hill|The Score|Mama's Gun|Baduizm
Which group released No Scrubs?|TLC|Destiny's Child|En Vogue|SWV
Which band released the album Ten?|Pearl Jam|Nirvana|Soundgarden|Alice in Chains
Which artist released the 1997 album Homogenic?|Björk|PJ Harvey|Tori Amos|Kate Bush
Which band recorded Common People?|Pulp|Blur|Oasis|The Verve`,
eurovision:`Which country won Eurovision in 1969 with Lenny Kuhr?|Netherlands|Belgium|Germany|Denmark
Who won Eurovision for Portugal in 2017?|Salvador Sobral|Duncan Laurence|Conchita Wurst|Netta
Which country won Eurovision in 2004 with Ruslana?|Ukraine|Poland|Moldova|Latvia
What was Alexander Rybak's 2009 winning song?|Fairytale|Satellite|Heroes|Only Teardrops
Which city hosted Eurovision 1974?|Brighton|London|Edinburgh|Birmingham
How many countries tied for first place in Eurovision 1969?|Four|Two|Three|Five
Which country did Daði og Gagnamagnið represent in 2021?|Iceland|Denmark|Norway|Finland
Which language was used for Ireland’s 1972 entry Ceol an Ghrá?|Irish|French|Italian|Spanish
Which country won Eurovision 2007 with Molitva?|Serbia|Croatia|Slovenia|Bulgaria
What was Loreen's winning song in 2023?|Tattoo|Euphoria|Statements|My Heart Is Refusing Me`,
sweden:`Which Swedish province contains the city of Lund?|Skåne|Dalarna|Småland|Värmland
Which lake is Sweden's largest by surface area?|Vänern|Vättern|Mälaren|Hjälmaren
Which Swedish island is the largest?|Gotland|Öland|Orust|Hisingen
What is the Swedish parliament called?|Riksdag|Storting|Folketing|Althing
What is the currency subdivision of one Swedish krona called?|Öre|Cent|Penny|Pence
Which city is associated with the historic Falu copper mine?|Falun|Kiruna|Umeå|Örebro
Which scientist developed the Celsius temperature scale?|Anders Celsius|Carl Linnaeus|Alfred Nobel|Svante Arrhenius
What is the name of Sweden's highest mountain?|Kebnekaise|Sarek|Åreskutan|Helags
Which strait does the bridge from Malmö to Copenhagen cross?|Öresund|Skagerrak|Kattegat|Great Belt
Which Swedish province gives the Dala horse its name?|Dalarna|Skåne|Halland|Blekinge`,
india:`Which Indian state contains the ruins of Hampi?|Karnataka|Kerala|Odisha|Assam
Which instrument is associated with Ustad Bismillah Khan?|Shehnai|Sitar|Sarod|Tabla
Which city is called the Pink City?|Jaipur|Jodhpur|Udaipur|Bikaner
Which Indian classical dance form originated in Kerala and uses elaborate makeup?|Kathakali|Kathak|Odissi|Kuchipudi
Which Indian state is famous for the Hornbill Festival?|Nagaland|Punjab|Gujarat|Goa
Which river flows through Varanasi?|Ganges|Yamuna|Godavari|Narmada
Which Indian scientist won the Nobel Prize in Physics in 1930?|C. V. Raman|Homi Bhabha|S. N. Bose|Vikram Sarabhai
Which Mughal emperor commissioned the Taj Mahal?|Shah Jahan|Akbar|Jahangir|Babur
Which script is commonly used to write Hindi?|Devanagari|Gurmukhi|Tamil|Bengali
Which Indian state has Shillong as its capital?|Meghalaya|Mizoram|Manipur|Tripura`,
capitals:`What is the capital of Bhutan?|Thimphu|Paro|Kathmandu|Dhaka
What is the capital of Laos?|Vientiane|Luang Prabang|Hanoi|Phnom Penh
What is the capital of Kyrgyzstan?|Bishkek|Dushanbe|Tashkent|Astana
What is the capital of Tajikistan?|Dushanbe|Bishkek|Ashgabat|Samarkand
What is the capital of Georgia?|Tbilisi|Batumi|Yerevan|Baku
What is the capital of Armenia?|Yerevan|Tbilisi|Baku|Gyumri
What is the capital of Montenegro?|Podgorica|Kotor|Budva|Skopje
What is the capital of Slovenia?|Ljubljana|Bratislava|Zagreb|Sarajevo
What is the capital of Oman?|Muscat|Salalah|Manama|Doha
What is the capital of Ethiopia?|Addis Ababa|Asmara|Nairobi|Kampala`,
food:`Which cheese is traditionally used in a classic Greek salad?|Feta|Halloumi|Manchego|Pecorino
What primarily makes choux pastry puff up in the oven?|Steam|Yeast fermentation|Whipped egg whites|Baking powder
Which fermented soybean paste is used in Japanese soup?|Miso|Tahini|Gochujang|Harissa
Which two ingredients form a traditional roux?|Flour and fat|Egg yolks and oil|Sugar and water|Cream and chocolate
What does the culinary term julienne describe?|Cutting into thin matchsticks|Cooking in a sealed bag|Folding in whipped cream|Reducing a stock
Which French sauce is made from butter and egg yolks with lemon?|Hollandaise|Béchamel|Velouté|Espagnole
Which mixture is the basis of a traditional chocolate ganache?|Chocolate and cream|Cocoa powder and water|Butter and icing sugar|Egg whites and sugar
Which fruit is dried to make a prune?|Plum|Apricot|Peach|Fig
Which acid is characteristic of citrus fruits?|Citric acid|Lactic acid|Acetic acid|Tartaric acid
What is used around a dish when cooking it in a bain-marie?|A water bath|A bed of dry salt|An ice bath|A layer of hot sand`,
diwali:`Which festival commonly opens the five-day Diwali celebrations?|Dhanteras|Janmashtami|Navaratri|Makar Sankranti
Which goddess is central to the major Bengali puja held on Diwali's new moon?|Kali|Saraswati|Sita|Radha
Which festival day commonly honours the bond between brothers and sisters after Diwali?|Bhai Dooj|Holi|Raksha Bandhan|Janmashtami
In Jain tradition, Diwali commemorates the nirvana of whom?|Mahavira|Rishabhanatha|Parshvanatha|Neminatha
Which Sikh observance often coincides with Diwali?|Bandi Chhor Divas|Vaisakhi|Hola Mohalla|Gurpurab of Guru Nanak
Which city is traditionally associated with Rama's homecoming?|Ayodhya|Mathura|Varanasi|Ujjain
Which Sikh Guru is associated with Bandi Chhor Divas?|Guru Hargobind|Guru Nanak|Guru Angad|Guru Amar Das
Govardhan Puja recalls Krishna lifting what to shelter villagers?|A hill|A temple|A tree|A chariot
Which lunar month contains Diwali in many Hindu calendars?|Kartika|Chaitra|Shravana|Phalguna
Which deity is commonly worshipped alongside Lakshmi during Diwali?|Ganesha|Hanuman|Kartikeya|Brahma`,
holi:`What is thrown during Phoolon Wali Holi in Vrindavan?|Flower petals|Rice grains|Paper confetti|Sand
Which Hindu month is associated with Holi?|Phalguna|Kartika|Shravana|Ashadha
What was the name of Prahlada's father in the Holika story?|Hiranyakashipu|Dasharatha|Vasudeva|Pandu
Which pair of places is famous for Lathmar Holi?|Barsana and Nandgaon|Jaipur and Ajmer|Patna and Gaya|Kochi and Thrissur
Which martial festival is celebrated by Sikhs around the time of Holi?|Hola Mohalla|Baisakhi|Lohri|Maghi
Which drink is often flavoured with nuts and spices during Holi?|Thandai|Rasam|Kahwa|Kokum sherbet
Which Indian state celebrates the spring festival Yaoshang around Holi?|Manipur|Goa|Gujarat|Kerala
Which Bengali spring celebration is associated with Shantiniketan?|Basanta Utsav|Bihu|Onam|Lohri
What does the Hindi word rang mean in the Holi context?|Colour|Fire|Water|Music
Which lunar phase is associated with the night of Holika Dahan?|Full moon|New moon|First quarter|Last quarter`,
midsommar:`On which weekday is Swedish Midsummer Eve celebrated today?|Friday|Thursday|Saturday|Sunday
In one Swedish Midsummer tradition, how many kinds of flowers are placed under a pillow?|Seven|Three|Twelve|Twenty
Which spirit, often flavoured with caraway or dill, may be served as Midsummer snaps?|Aquavit|Calvados|Grappa|Tequila
The traditional date of Midsummer Day, 24 June, is linked to the feast of which saint?|John the Baptist|Patrick|Nicholas|George
Which flower is known as prästkrage in Swedish?|Oxeye daisy|Rose|Tulip|Sunflower
Which herb commonly accompanies new potatoes at Midsummer?|Dill|Rosemary|Sage|Coriander
What is a Swedish snapsvisa?|A drinking song|A flower crown|A potato dish|A folk costume
Which event is Midsummer season close to in the northern hemisphere?|Summer solstice|Winter solstice|Spring equinox|Autumn equinox
Which line of latitude marks the approximate southern limit of the midnight sun at the June solstice?|Arctic Circle|Tropic of Cancer|Equator|Tropic of Capricorn
What are the flowers under a Midsummer pillow traditionally said to help you dream about?|A future spouse|A buried treasure|Next year's weather|A distant journey`,
christmas:`Which country is associated with the Christmas sweet bread panettone?|Italy|Spain|Portugal|Austria
What is the name of the ballet featuring the Sugar Plum Fairy?|The Nutcracker|Swan Lake|Giselle|Coppélia
Who composed the ballet The Nutcracker?|Pyotr Ilyich Tchaikovsky|Igor Stravinsky|Sergei Prokofiev|Johann Strauss II
What is the name of the German Christmas fruit bread dusted with sugar?|Stollen|Brioche|Focaccia|Challah
What is a bûche de Noël shaped like?|A log|A star|A bell|A wreath
What is the name of Scrooge's former business partner?|Jacob Marley|Bob Cratchit|Fezziwig|Fred
Which saint is associated with the origins of Santa Claus?|Saint Nicholas|Saint Patrick|Saint George|Saint Andrew
Which spice is traditionally pushed into oranges to make fragrant pomanders?|Cloves|Cumin|Fennel|Mustard seeds
In The Twelve Days of Christmas, what is given on the fifth day?|Gold rings|Calling birds|French hens|Swans
Which Swedish saffron bun is associated with Saint Lucia's Day?|Lussekatt|Semla|Kanelbulle|Chokladboll`,
halloween:`Who wrote the novella The Turn of the Screw?|Henry James|Bram Stoker|Mary Shelley|H. G. Wells
Who wrote The Legend of Sleepy Hollow?|Washington Irving|Bram Stoker|Mary Shelley|Edgar Allan Poe
What is the name of the scientist in Frankenstein?|Victor Frankenstein|Henry Jekyll|Abraham Van Helsing|Dorian Gray
Which ancient Celtic festival is associated with Halloween's history?|Samhain|Beltane|Imbolc|Lughnasadh
What is the collective noun traditionally used for a group of crows?|Murder|Parliament|Pride|School
Which animal is associated with the term lycanthropy?|Wolf|Bat|Cat|Raven
What date is All Saints' Day in the Western Christian calendar?|1 November|31 October|2 November|30 October
Which vegetable was traditionally carved into lanterns in Ireland before pumpkins became common?|Turnip|Carrot|Beetroot|Parsnip
Who wrote The Raven?|Edgar Allan Poe|Walt Whitman|Robert Frost|William Blake
Which novel features the character Jonathan Harker?|Dracula|Frankenstein|The Picture of Dorian Gray|The Invisible Man`,
retro:`Which classic arcade game features the spaceship called the Vic Viper?|Gradius|Galaga|Asteroids|Defender
Which arcade game introduced Mario under the name Jumpman?|Donkey Kong|Mario Bros.|Pac-Man|Space Invaders
Where was Alexey Pajitnov working when he created Tetris?|Soviet Academy of Sciences|Nintendo|Sega|Atari Games
What is the princess's name in the main Legend of Zelda series?|Zelda|Peach|Daisy|Rosalina
What is the title of the first main Metroid game?|Metroid|Super Metroid|Metroid Prime|Metroid Fusion
Which character is the protagonist of the Metroid series?|Samus Aran|Lara Croft|Jill Valentine|Chun-Li
Which game features ghosts named Blinky and Pinky?|Pac-Man|Q*bert|Dig Dug|Frogger
Which Nintendo console used cartridges and a three-pronged controller?|Nintendo 64|GameCube|Wii|SNES
What does the abbreviation RPG stand for in gaming?|Role-playing game|Rapid puzzle game|Real player graphics|Random platform generator
Which company released the Mega Drive console?|Sega|Sony|Nintendo|NEC`,
'board-games':`How many points is Q worth in standard English Scrabble?|10|8|5|4
What happens to the colour of the square occupied by a knight after each legal move?|It always changes square colour|It always stays on one colour|Only when capturing|Only on its first move
What is the only chess move that moves two pieces at once?|Castling|En passant|Promotion|Forking
Which chess rule allows a special pawn capture immediately after a two-square pawn advance?|En passant|Castling|Stalemate|Promotion
How many tiles are in a standard double-six domino set?|28|21|36|49
In Go, what term describes a group with only one liberty remaining?|Atari|Seki|Komi|Joseki
What is the standard board size in modern tournament Go?|19 by 19|8 by 8|15 by 15|21 by 21
In chess, what is a position with no legal move but no check called?|Stalemate|Checkmate|Zugzwang|Pin
How many points is Z worth in standard English Scrabble?|10|8|6|4
Which colour moves first in standard Go?|Black|White|Red|Chosen by a die`,
tech:`What does the H in HTML stand for?|HyperText|High-level|Hosted|Hierarchical
Which computer scientist is associated with the first published algorithm intended for the Analytical Engine?|Ada Lovelace|Grace Hopper|Katherine Johnson|Margaret Hamilton
What does DNS stand for?|Domain Name System|Digital Network Service|Data Number Standard|Direct Node Storage
Which protocol commonly secures HTTP traffic?|TLS|FTP|SMTP|ARP
What does a hexadecimal digit represent in bits?|4|2|8|16
Which Unix command lists directory contents?|ls|cd|pwd|mkdir
What is the default port for HTTPS?|443|80|22|53
Who developed the C programming language?|Dennis Ritchie|Bjarne Stroustrup|Guido van Rossum|James Gosling
What does SQL stand for?|Structured Query Language|Simple Queue Logic|Sequential Question List|Standard Quick Lookup
Which data structure follows last in, first out?|Stack|Queue|Tree|Graph`
};
export const HARD=Object.fromEntries(Object.entries(rows).map(([id,text])=>[id,text.split('\n').map((row,i)=>{const [text,...options]=row.split('|');return {id:`${id}-hard-${i}`,text,options,correct:[0],type:'single',difficulty:'hard',fact:`${options[0]} is the correct answer.`,image:null};})]));

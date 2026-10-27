// Original clues. Ten distinct Easy and ten distinct Hard questions per pack.
const packs=[];
function add(id,title,category,icon,description,source,rows){
 const entries=rows.trim().split('\n').map(r=>r.split('|'));
 if(entries.length!==20)throw Error(`${id} needs 20 questions`);
 packs.push({id,title,category,icon,color:['pink','cyan','yellow','violet'][packs.length%4],description,source,difficulty:'Easy + Hard',questions:entries.map(([text,answer,fact,image],i)=>{
  const pool=[...new Set(entries.map(r=>r[1]))].filter(a=>a!==answer);
  const options=pool.length===1?[answer,pool[0]]:[answer,...[0,1,2].map(n=>pool[(i*3+n)%pool.length])];
  return{id:`${id}-${i}`,text,options,correct:[0],fact:fact||`The answer is ${answer}.`,image:image||null,type:options.length===2?'boolean':'single',difficulty:i<10?'easy':'hard'};
 })});
}
add('finish-lyrics','Finish the Lyrics','Music','♪','Old-school singalongs. Public-domain words, maximum confidence.','https://www.gutenberg.org/ebooks/10607',`
Twinkle, twinkle, little ___|star
Mary had a little ___|lamb
Humpty Dumpty sat on a ___|wall
Hickory, dickory, ___|dock
Row, row, row your ___|boat
London Bridge is falling ___|down
Jack and Jill went up the ___|hill
Baa, baa, black sheep, have you any ___?|wool
Hey diddle diddle, the cat and the ___|fiddle
Little Miss Muffet sat on a ___|tuffet
Sing a song of sixpence, a pocket full of ___|rye
Lavender’s blue, dilly dilly, lavender’s ___|green
Oranges and lemons, say the bells of St. ___|Clement’s
Little Boy Blue, come blow your ___|horn
Goosey, goosey, gander, whither shall I ___?|wander
Ride a cock-horse to Banbury ___|Cross
Wee Willie Winkie runs through the ___|town
Simple Simon met a ___|pieman
Old Mother Hubbard went to the ___|cupboard
Three little kittens, they lost their ___|mittens
`);
add('one-clue-movies','Movie in One Clue','TV & Film','🎬','One clue. One film. No opening credits to help.','https://www.bfi.org.uk/',`
A great white shark terrorises Amity Island. Which film?|Jaws
A boy befriends a stranded alien who wants to phone home. Which film?|E.T. the Extra-Terrestrial
A rat secretly cooks in a Paris restaurant. Which film?|Ratatouille
A green ogre rescues Princess Fiona. Which film?|Shrek
A spinning top tests whether a dream has ended. Which film?|Inception
A doomed ocean liner carries Jack and Rose. Which film?|Titanic
A clownfish father searches for his son. Which film?|Finding Nemo
A teenager drives a time-travelling DeLorean. Which film?|Back to the Future
A boy discovers his whole life is a television programme. Which film?|The Truman Show
A lonely rubbish-compacting robot leaves Earth. Which film?|WALL-E
A hotel concierge and his lobby boy chase a stolen painting. Which film?|The Grand Budapest Hotel
A musician and an actress fall in love in Los Angeles. Which 2016 film?|La La Land
A linguist tries to communicate with visiting heptapods. Which film?|Arrival
A detective investigates the death of novelist Harlan Thrombey. Which film?|Knives Out
A drummer trains under the terrifying Terence Fletcher. Which film?|Whiplash
A woman fights tax chaos across alternate universes. Which film?|Everything Everywhere All at Once
A man with memory loss uses tattoos to investigate a murder. Which film?|Memento
A poor family infiltrates the wealthy Park household. Which film?|Parasite
A cynical weatherman keeps reliving 2 February. Which film?|Groundhog Day
An insurance clerk lends his apartment to his bosses. Which 1960 film?|The Apartment
`);
add('bollywood-hollywood','Bollywood vs Hollywood','TV & Film','🎥','Pick the industry. Then settle the film-night debate.','https://www.bfi.org.uk/',`
Which industry produced Dilwale Dulhania Le Jayenge?|Bollywood
Which industry produced Jurassic Park?|Hollywood
Which industry produced 3 Idiots?|Bollywood
Which industry produced The Dark Knight?|Hollywood
Which industry produced Sholay?|Bollywood
Which industry produced Barbie (2023)?|Hollywood
Which industry produced Kabhi Khushi Kabhie Gham...?|Bollywood
Which industry produced The Matrix?|Hollywood
Which industry produced Dangal?|Bollywood
Which industry produced Home Alone?|Hollywood
Which industry produced Andhadhun?|Bollywood
Which industry produced The Prestige?|Hollywood
Which industry produced Swades?|Bollywood
Which industry produced Eternal Sunshine of the Spotless Mind?|Hollywood
Which industry produced Dil Chahta Hai?|Bollywood
Which industry produced The Social Network?|Hollywood
Which industry produced Zindagi Na Milegi Dobara?|Bollywood
Which industry produced The Devil Wears Prada?|Hollywood
Which industry produced Queen (2013)?|Bollywood
Which industry produced The Breakfast Club?|Hollywood
`);
add('memology','Memology','Internet & Pop','😼','Real meme pictures and internet archaeology. How online are you?','https://commons.wikimedia.org/wiki/Category:Internet_memes',`
Which meme family is pictured here?|Doge|Doge captions pair a Shiba Inu with playful, broken grammar.|meme-doge
Which famously unimpressed feline is pictured here?|Grumpy Cat|Grumpy Cat became famous for her permanently grumpy-looking expression.|meme-grumpy
An unexpected link to Never Gonna Give You Up is called what?|Rickrolling
Which meme cat asks whether it can have a cheeseburger?|LOLcat
Which meme depicts a small dog saying everything is fine while a room burns?|This Is Fine
Which rainbow-trailing animated cat has a pastry body?|Nyan Cat
Which distracted person is central to the famous three-person street-photo meme?|Distracted Boyfriend
Which meme baby clenches a fist in triumph?|Success Kid
Which cartoon sea creature often appears in a mocking alternating-case meme?|SpongeBob SquarePants
What does a reaction GIF usually communicate?|An emotional response
In meme culture, what does an expanding-brain sequence exaggerate?|Increasing enlightenment
Which Richard Dawkins book introduced the word meme in 1976?|The Selfish Gene
Which meme format groups stereotypical objects for a person or situation?|Starter pack
What is a copypasta?|Text repeatedly copied online
What does a deep-fried meme deliberately exaggerate?|Compression and visual distortion
Which meme format contrasts anticipation with what actually happened?|Expectation vs reality
What does the Drake two-panel format usually contrast?|Rejection and approval
What is an image macro?|A picture with overlaid caption text
Which meme format presents one person as the only dissenter in a crowd?|Unpopular opinion
Which animal stars in the Keyboard Cat video?|A cat at a keyboard
`);
add('celebrity-plot-twists','Celebrity Plot Twists','Internet & Pop','🌟','Stage names, award surprises and public pop-culture moments.','https://www.oscars.org/oscars/ceremonies/2017',`
Who played Hannah Montana before becoming a solo pop star?|Miley Cyrus
Which performer’s real first name is Stefani?|Lady Gaga
Which singer played Ally in A Star Is Born (2018)?|Lady Gaga
Who portrayed Iron Man in the Marvel Cinematic Universe?|Robert Downey Jr.
Which singer is also known as Queen Bey?|Beyoncé
Which actor played both Jack Sparrow and Edward Scissorhands?|Johnny Depp
Which wrestler became the actor nicknamed The Rock?|Dwayne Johnson
Which actor played Barbie opposite Ryan Gosling’s Ken?|Margot Robbie
Which singer’s first name is Robyn and surname is Fenty?|Rihanna
Which actor played Wednesday Addams in Netflix’s Wednesday?|Jenna Ortega
Which film actually won Best Picture after the 2017 Oscars envelope mix-up?|Moonlight
Which actor won an Oscar for playing Stephen Hawking?|Eddie Redmayne
Which Oscar-winning actor was born Eric Marlon Bishop?|Jamie Foxx
Which musician was born Reginald Kenneth Dwight?|Elton John
Which actor was born Neta-Lee Hershlag?|Natalie Portman
Which actor won an Oscar for playing Freddie Mercury?|Rami Malek
Which actor won Best Actress for Everything Everywhere All at Once?|Michelle Yeoh
Which filmmaker became the first woman to win the directing Oscar?|Kathryn Bigelow
Which actor played Gollum using motion capture?|Andy Serkis
Which actor voiced Princess Poppy in Trolls (2016)?|Anna Kendrick
`);
add('fake-or-real','Fake or Real?','Internet & Pop','🕵','Pop-culture tall tales. Call the bluff.','https://www.oscars.org/',`
Real or fake: Daniel Radcliffe played Harry Potter in the eight main films.|Real
Real or fake: Beyoncé was a member of the Spice Girls.|Fake|Beyoncé was a member of Destiny’s Child.
Real or fake: Taylor Swift released an album called 1989.|Real
Real or fake: Darth Vader is Luke Skywalker’s uncle.|Fake|Darth Vader is Luke’s father.
Real or fake: Adele released albums titled 19, 21 and 25.|Real
Real or fake: Shrek is a blue dragon.|Fake|Shrek is a green ogre.
Real or fake: Rihanna launched the beauty brand Fenty Beauty.|Real
Real or fake: The Friends coffee shop is named Central Park.|Fake|It is Central Perk.
Real or fake: The Beatles came from Liverpool.|Real
Real or fake: Pikachu is a water-type Pokémon.|Fake|Pikachu is an Electric-type Pokémon.
Real or fake: La La Land won the 2017 Best Picture Oscar.|Fake|Moonlight won; La La Land was mistakenly announced first.
Real or fake: Nicolas Cage and Francis Ford Coppola are related.|Real|Coppola is Cage’s uncle.
Real or fake: Elton John was born Reginald Dwight.|Real
Real or fake: Frankenstein is the original novel’s name for the monster’s creator.|Real|Victor Frankenstein creates the creature.
Real or fake: The original Star Wars film premiered in 1987.|Fake|It premiered in 1977.
Real or fake: David Bowie played the Goblin King in Labyrinth.|Real
Real or fake: The silent-film star Charlie Chaplin was born in Australia.|Fake|Chaplin was born in London.
Real or fake: ABBA won Eurovision with Dancing Queen.|Fake|ABBA won in 1974 with Waterloo.
Real or fake: The first feature-length Toy Story was released in 1995.|Real
Real or fake: Audrey Hepburn and Katharine Hepburn were sisters.|Fake|They were not sisters.
`);
add('sitcoms','Sitcom Showdown','TV & Film','📺','The people, workplaces and catchphrases you know too well.','https://www.nbc.com/',`
Which sitcom follows the paper company Dunder Mifflin?|The Office
Which sitcom features detective Jake Peralta?|Brooklyn Nine-Nine
Which sitcom features Leslie Knope in Pawnee?|Parks and Recreation
Which sitcom centres on Sheldon Cooper and Leonard Hofstadter?|The Big Bang Theory
Which sitcom follows the Dunphy, Pritchett and Tucker families?|Modern Family
Which sitcom features Ted Mosby telling his children a long story?|How I Met Your Mother
Which sitcom features the Belcher family’s burger restaurant?|Bob’s Burgers
Which sitcom follows the yellow family of Springfield?|The Simpsons
Which sitcom stars a wealthy family stranded in a town they own?|Schitt’s Creek
Which sitcom takes place around a Boston bar where everybody knows your name?|Cheers
Which sitcom features Eleanor Shellstrop and a mysterious afterlife?|The Good Place
Which sitcom follows the teachers at a Philadelphia public school?|Abbott Elementary
Which sitcom is set at Greendale Community College?|Community
Which sitcom features Liz Lemon and the fictional show TGS?|30 Rock
Which sitcom follows the dysfunctional Bluth family?|Arrested Development
Which sitcom features Seattle radio psychiatrist Dr Crane?|Frasier
Which sitcom follows teenagers during the Troubles in Northern Ireland?|Derry Girls
Which sitcom follows vampires sharing a home on Staten Island?|What We Do in the Shadows
Which sitcom features Jessica Day moving into a loft with three men?|New Girl
Which sitcom follows employees of the Cloud 9 store?|Superstore
`);
add('marvel','Marvel Mayhem','TV & Film','🦸','Heroes, gadgets and suspiciously powerful stones.','https://www.marvel.com/characters',`
Which hero carries a vibranium shield?|Captain America
Which hero uses a hammer named Mjolnir?|Thor
Who becomes a giant green hero when transformed?|Hulk
Which hero’s civilian identity is Peter Parker?|Spider-Man
Which hero rules Wakanda as T’Challa?|Black Panther
Which hero’s suit is built by Tony Stark?|Iron Man
Which Guardian repeatedly says his own three-word name?|Groot
Which Guardian is a genetically altered raccoon?|Rocket
Which villain collects the Infinity Stones in Avengers: Infinity War?|Thanos
Which hero can shrink using Pym Particles?|Ant-Man
What is Doctor Strange’s first name?|Stephen
Which fictional metal is bonded to Wolverine’s skeleton?|Adamantium
What is the name of the red android created in Avengers: Age of Ultron?|Vision
Which hero is also known as Wanda Maximoff?|Scarlet Witch
What is Loki’s title associated with?|Mischief
Which city is home to Daredevil’s Hell’s Kitchen neighbourhood?|New York City
Who is the Winter Soldier’s civilian identity?|Bucky Barnes
What is the name of Black Panther’s tech-savvy sister?|Shuri
Which Guardian is also known as Peter Quill?|Star-Lord
Which MCU organisation’s initials expand to Strategic Homeland Intervention, Enforcement and Logistics Division?|S.H.I.E.L.D.
`);
add('star-wars','Star Wars Squad','TV & Film','🌌','A quiz break in a galaxy far, far away.','https://www.starwars.com/databank',`
What is Luke Skywalker’s home planet at the start of the original film?|Tatooine
Who is Han Solo’s Wookiee co-pilot?|Chewbacca
Which small green Jedi master trains Luke?|Yoda
What is the spherical battle station in the original Star Wars called?|Death Star
What weapon is most associated with Jedi Knights?|Lightsaber
Which princess sends a message through R2-D2?|Leia
What is Han Solo’s famous ship?|Millennium Falcon
Which gold-coloured droid specialises in protocol?|C-3PO
Which masked villain breathes mechanically?|Darth Vader
What is the mystical energy field used by Jedi called?|The Force
Which planet is the site of the opening battle in The Empire Strikes Back?|Hoth
Which bounty hunter wears distinctive green Mandalorian armour in the original trilogy?|Boba Fett
What is Emperor Palpatine’s Sith name?|Darth Sidious
Which planet hosts the clone army’s creation facilities?|Kamino
Who kills Qui-Gon Jinn in The Phantom Menace?|Darth Maul
What is the name of the Wookiee homeworld?|Kashyyyk
Who is the Mon Calamari admiral associated with spotting a trap?|Admiral Ackbar
Which city floats above the planet Bespin?|Cloud City
What is the desert planet where Rey lives in The Force Awakens?|Jakku
Who is the pilot known as Red Five at the first Death Star battle?|Luke Skywalker
`);
add('disney','Disney Deep Cuts','TV & Film','🏰','From enchanted castles to unexpectedly tricky sidekicks.','https://movies.disney.com/',`
Which princess loses a glass slipper?|Cinderella
Which Disney character has a nose that grows when he lies?|Pinocchio
Which princess has seven dwarf companions?|Snow White
Which film features Elsa and Anna?|Frozen
Which lion is the son of Mufasa?|Simba
Which mermaid dreams of living on land?|Ariel
What kind of animal is Dumbo?|An elephant
Which princess lives with a cursed prince in an enchanted castle?|Belle
Which film follows a girl who takes her father’s place in an army?|Mulan
Which film features a street thief and a magical lamp?|Aladdin
What is the name of the firefly in The Princess and the Frog?|Ray
Which animal is Yzma accidentally transformed into near the end of The Emperor’s New Groove?|A cat
What is the name of the rooster in Moana?|Heihei
Which city is the setting of The Princess and the Frog?|New Orleans
What is the name of the villain in The Little Mermaid?|Ursula
Which film features the characters Kida and Milo Thatch?|Atlantis: The Lost Empire
What is the name of Rapunzel’s chameleon companion?|Pascal
Which Disney film reimagines Treasure Island in space?|Treasure Planet
What is the name of the dragon who helps Mulan?|Mushu
Which film features a family with magical gifts in Colombia?|Encanto
`);
add('football','Football Fever','Sport','⚽','Goals, grounds and the rules everyone argues about.','https://www.theifab.com/laws/latest/',`
How many players may one football team have on the pitch at kick-off?|11
What colour card sends a player off?|Red
How many minutes is a standard senior match, excluding added time and extra time?|90
What is scoring three goals in one match called?|A hat-trick
Which player may handle the ball inside their own penalty area?|Goalkeeper
How many points is a win worth in most modern league tables?|3
What restarts play after the entire ball crosses a touchline?|A throw-in
Which country hosted the men’s 2014 World Cup?|Brazil
Which country won the men’s 2022 World Cup?|Argentina
What is the standard interval between men’s FIFA World Cups?|4 years
How far is the penalty mark from the goal line in metres?|11 metres
What is the maximum scheduled extra time in a standard knockout match?|30 minutes
How many players is the minimum for a team to continue a match under IFAB laws?|7
Which country won the first men’s World Cup in 1930?|Uruguay
Which club is traditionally nicknamed the Rossoneri?|AC Milan
Which club plays at Anfield?|Liverpool
Which country did Zinedine Zidane represent internationally?|France
Which goalkeeper won the men’s Ballon d’Or in 1963?|Lev Yashin
Which country won UEFA Euro 2004?|Greece
Which club is associated with the nickname Die Roten and Munich?|Bayern Munich
`);
add('sports','Sports Mix-Up','Sport','🏅','Court, track, pool or pitch: pick your arena.','https://olympics.com/en/sports/',`
Which sport uses a shuttlecock?|Badminton
Which sport uses a puck on ice?|Ice hockey
Which sport awards a score called a hole-in-one?|Golf
Which sport includes the butterfly stroke?|Swimming
Which sport uses terms such as love and deuce?|Tennis
Which sport features a pommel horse?|Artistic gymnastics
Which sport uses a foil, épée or sabre?|Fencing
Which sport involves sweeping ice ahead of a stone?|Curling
Which sport has a scrum and a try?|Rugby union
Which sport combines running, cycling and swimming?|Triathlon
Which sport uses a velodrome?|Track cycling
Which athletics event involves a hop, step and jump?|Triple jump
Which winter sport combines cross-country skiing and rifle shooting?|Biathlon
Which sport uses an ergometer to simulate its main movement indoors?|Rowing
Which sport uses the scoring terms ippon and waza-ari?|Judo
Which sport has a discipline called bouldering?|Sport climbing
Which sport is associated with the Madison event?|Track cycling
Which athletics discipline involves a Fosbury flop?|High jump
Which sport uses wickets and overs?|Cricket
Which sport includes a penalty called travelling for moving illegally with the ball?|Basketball
`);
add('landmarks','Where on Earth?','World','🗺','Landmark clues for your imaginary next holiday.','https://whc.unesco.org/en/list/',`
In which city would you find the Eiffel Tower?|Paris
In which country is the Taj Mahal?|India
In which city is the Colosseum?|Rome
In which country is Machu Picchu?|Peru
In which city is the Statue of Liberty?|New York City
In which country is the Great Pyramid of Giza?|Egypt
In which city is the Sagrada Família?|Barcelona
In which country is the Great Wall?|China
In which city is the Sydney Opera House?|Sydney
In which country is the ancient city of Petra?|Jordan
In which country is the temple complex Angkor Wat?|Cambodia
In which country is the Alhambra palace complex?|Spain
In which city is the ancient Acropolis?|Athens
In which country is the rock-hewn church complex at Lalibela?|Ethiopia
In which country is the historic sanctuary of Borobudur?|Indonesia
In which country is the ancient site of Chichén Itzá?|Mexico
In which country is the medieval city of Carcassonne?|France
In which country is the archaeological site of Hegra?|Saudi Arabia
In which country is the Giant’s Causeway, within Northern Ireland?|United Kingdom
In which country is the historic city of Dubrovnik?|Croatia
`);
add('animals','Animal Antics','Nature','🦦','Cute faces. Surprisingly competitive facts.','https://nationalzoo.si.edu/animals',`
Which land animal is the tallest?|Giraffe
Which bird is famously associated with waddling on Antarctic ice?|Penguin
Which mammal lays eggs and has a duck-like bill?|Platypus
Which animal changes colour and has independently moving eyes?|Chameleon
Which animal builds dams with branches?|Beaver
Which big cat is known for a male’s mane?|Lion
Which animal has eight arms and three hearts?|Octopus
Which animal is the largest living mammal?|Blue whale
Which marsupial carries its young in a pouch and hops?|Kangaroo
Which insect produces honey in hives?|Honey bee
Which mammal is capable of sustained powered flight?|Bat
Which animal has a long, spiralling tusk that is an enlarged tooth?|Narwhal
Which primate has a conspicuous red-and-blue face in adult males?|Mandrill
Which egg-laying mammal has spines and a long tongue?|Echidna
Which animal has cube-shaped droppings?|Wombat
Which marine mammal is known for floating on its back and using rocks to open shellfish?|Sea otter
Which bird can fly backwards as well as hover?|Hummingbird
Which large lizard is native to several Indonesian islands including Komodo?|Komodo dragon
Which African mammal has striped legs but is related to the giraffe?|Okapi
Which amphibian retains external gills as an adult in its usual aquatic form?|Axolotl
`);
add('coffee','Coffee Break Club','Food & Drink','☕','Your office fuel deserves its own quiz.','https://sca.coffee/',`
Which concentrated coffee is brewed under pressure?|Espresso
Which coffee drink adds hot water to espresso?|Americano
Which drink combines espresso, steamed milk and a foamy top, traditionally in roughly equal parts?|Cappuccino
What is coffee without caffeine usually called?|Decaf
Which ingredient makes a café mocha chocolatey?|Cocoa or chocolate
What is the common Italian term for espresso marked with a little milk?|Macchiato
What is the vessel with a mesh plunger called?|French press
What is the name of coffee brewed slowly in cold water?|Cold brew
Which plant part contains the coffee beans?|The fruit or cherry
Which hot drink is made from tea leaves rather than coffee beans?|Tea
What is the golden foam on a freshly pulled espresso called?|Crema
What is a shorter, more concentrated espresso extraction called?|Ristretto
What is an espresso poured over ice cream called?|Affogato
Which species name belongs to coffee often called robusta?|Coffea canephora
Which paper-filter brewer was designed by Peter Schlumbohm?|Chemex
What does a coffee refractometer help measure?|Dissolved solids concentration
What is the first gas-releasing wetting stage of a pour-over called?|Bloom
Which processing method dries coffee fruit with the beans still inside?|Natural processing
What is the professional tasting and assessment of coffee called?|Cupping
Which espresso variable describes the mass of dry ground coffee used?|Dose
`);
add('chocolate','Chocolate Obsession','Food & Drink','🍫','A sweet subject with a surprisingly serious Hard round.','https://www.icco.org/',`
Which plant supplies the beans used to make chocolate?|Cacao
Which chocolate type typically includes milk solids?|Milk chocolate
Which chocolate type contains cocoa butter but no cocoa solids?|White chocolate
What is a common nut filling in a chocolate-hazelnut spread?|Hazelnut
Which dessert is traditionally a dense chocolate square?|Brownie
What is the name of a small chocolate confection often dusted in cocoa?|Truffle
What flavour is paired with chocolate in an After Eight-style sweet?|Mint
Which French word describes a mixture of chocolate and cream?|Ganache
What is frozen chocolate-flavoured dairy dessert commonly called?|Chocolate ice cream
What is a hollow chocolate shape commonly given at Easter?|An egg
Which process aligns cocoa-butter crystals for shine and snap?|Tempering
Which long mixing process develops chocolate texture and flavour?|Conching
What are crushed pieces of shelled cocoa beans called?|Cocoa nibs
Which fat is naturally extracted from cocoa beans?|Cocoa butter
What does the cocoa percentage on dark chocolate usually include?|Cocoa solids and cocoa butter
Which process darkens cocoa with an alkaline treatment?|Dutch processing
What is a pale streaky coating caused by fat migration or poor temper called?|Fat bloom
What is the chocolate-making term for separating shells from cracked beans?|Winnowing
What is the scientific genus name of the cacao tree?|Theobroma
What chocolate type contains enough added cocoa butter to be useful for thin coatings?|Couverture
`);
add('pokemon','Pokémon Party','Games & Geek','⚡','Choose your answer. It might be super effective.','https://www.pokemon.com/us/pokedex',`
What type is Pikachu?|Electric
Which original starter has a plant bulb on its back?|Bulbasaur
Which original starter has a flame on its tail?|Charmander
Which original starter is a small blue turtle?|Squirtle
What device is commonly used to catch Pokémon?|Poké Ball
Which Pokémon is known for singing listeners to sleep?|Jigglypuff
Which Pokémon can transform its shape to copy others?|Ditto
Which Pokémon is famous for sleeping and blocking paths?|Snorlax
Which Pokémon has several different evolutions, including Vaporeon?|Eevee
Which fish Pokémon evolves into Gyarados?|Magikarp
What is the first evolved form of Chikorita?|Bayleef
Which Pokémon is number 150 in the National Pokédex?|Mewtwo
Which type has no effect against Normal-type Pokémon when using a damaging move under ordinary conditions?|Ghost
Which Pokémon evolves from Feebas?|Milotic
Which item evolves an Eevee into Jolteon?|Thunder Stone
Which region is the setting of Pokémon Gold and Silver?|Johto
Which Pokémon is known as the Aura Pokémon?|Lucario
Which Pokémon evolves from Nincada alongside a possible Shedinja?|Ninjask
Which Steel/Psychic Pokémon evolves from Beldum via Metang?|Metagross
Which legendary Pokémon appears on the original Pokémon Silver box?|Lugia
`);
add('weather','Weather or Not','Nature','⛈','Cloudy with a chance of bragging rights.','https://www.metoffice.gov.uk/weather/learn-about/weather',`
What is water falling from clouds as liquid drops called?|Rain
What is a cloud at ground level called?|Fog
What instrument measures air temperature?|Thermometer
What is frozen precipitation made of ice balls called?|Hail
What is the sound produced by rapidly expanding air around lightning called?|Thunder
What do we call moving air?|Wind
What colourful arc can form when sunlight interacts with raindrops?|Rainbow
What is the process of liquid water becoming water vapour?|Evaporation
What is a prolonged period of unusually hot weather called?|Heatwave
What is snow blown by strong wind with very poor visibility called?|Blizzard
What instrument measures atmospheric pressure?|Barometer
What instrument measures wind speed?|Anemometer
What are lines of equal pressure on a weather map called?|Isobars
Which cloud type is strongly associated with thunderstorms?|Cumulonimbus
What temperature marks air becoming saturated at a given pressure?|Dew point
What is the boundary between contrasting air masses called?|Front
What is the change directly from water vapour into ice called?|Deposition
What describes a rotating storm over warm tropical oceans?|Tropical cyclone
What is the sheltering dry area downwind of a mountain range called?|Rain shadow
What atmospheric layer contains most everyday weather?|Troposphere
`);
add('books','Book Club Chaos','Arts & Words','📚','Famous stories, unforgettable names and literary flexing.','https://www.gutenberg.org/',`
Who wrote Pride and Prejudice?|Jane Austen
Who wrote the Harry Potter novels?|J. K. Rowling
Who wrote The Hobbit?|J. R. R. Tolkien
Who wrote Charlie and the Chocolate Factory?|Roald Dahl
Who wrote Alice’s Adventures in Wonderland?|Lewis Carroll
Who wrote The Adventures of Sherlock Holmes?|Arthur Conan Doyle
Who wrote Romeo and Juliet?|William Shakespeare
Who wrote The Cat in the Hat?|Dr. Seuss
Who wrote The Lion, the Witch and the Wardrobe?|C. S. Lewis
Who wrote A Christmas Carol?|Charles Dickens
Who wrote One Hundred Years of Solitude?|Gabriel García Márquez
Who wrote Things Fall Apart?|Chinua Achebe
Who wrote The Handmaid’s Tale?|Margaret Atwood
Who wrote The God of Small Things?|Arundhati Roy
Who wrote The Master and Margarita?|Mikhail Bulgakov
Who wrote The Remains of the Day?|Kazuo Ishiguro
Who wrote Beloved?|Toni Morrison
Who wrote The Metamorphosis?|Franz Kafka
Who wrote The Name of the Rose?|Umberto Eco
Who wrote The House of the Spirits?|Isabel Allende
`);
add('art','Art Attack','Arts & Words','🎨','Big masterpieces. Tiny time to remember the artist.','https://www.metmuseum.org/art/collection',`
Who painted the Mona Lisa?|Leonardo da Vinci
Who painted The Starry Night?|Vincent van Gogh
Who painted The Persistence of Memory with melting clocks?|Salvador Dalí
Who painted The Scream?|Edvard Munch
Who painted the ceiling of the Sistine Chapel?|Michelangelo
Who painted Girl with a Pearl Earring?|Johannes Vermeer
Who painted Guernica?|Pablo Picasso
Who painted many Water Lilies canvases?|Claude Monet
Who created the Campbell’s Soup Cans series?|Andy Warhol
Who painted The Birth of Venus?|Sandro Botticelli
Who painted The Garden of Earthly Delights?|Hieronymus Bosch
Who painted Las Meninas?|Diego Velázquez
Who created the woodblock print The Great Wave off Kanagawa?|Katsushika Hokusai
Who painted Nighthawks?|Edward Hopper
Who painted The Two Fridas?|Frida Kahlo
Who painted The Kiss, completed around 1908?|Gustav Klimt
Who painted A Sunday Afternoon on the Island of La Grande Jatte?|Georges Seurat
Who painted American Gothic?|Grant Wood
Who painted The Son of Man with an apple obscuring a face?|René Magritte
Who painted The Night Watch?|Rembrandt
`);
add('languages','Say What?','Arts & Words','💬','Hello, thanks and false friends from around the world.','https://en.wiktionary.org/',`
In which language is hola a common greeting?|Spanish
In which language is bonjour a common greeting?|French
In which language is danke a common word for thanks?|German
In which language is grazie a common word for thanks?|Italian
In which language is arigatō a common expression of thanks?|Japanese
In which language is hej a common greeting, and tack means thanks?|Swedish
In which language is obrigado a common expression of thanks?|Portuguese
In which language is nǐ hǎo a common greeting?|Mandarin Chinese
In which language is annyeonghaseyo a polite greeting?|Korean
In which language is kiitos the word for thanks?|Finnish
What does the Spanish word embarazada mean?|Pregnant
What does the French word actuellement mean?|Currently
What does the German word Gift mean?|Poison
What does the Italian word camera usually mean?|Room
What does the Swedish word rolig mean?|Fun or funny
What does the Norwegian word rolig commonly mean?|Calm or quiet
What does the French word librairie mean?|Bookshop
What does the Spanish word éxito mean?|Success
What does the German word bekommen mean?|To receive
What does the Portuguese word pasta commonly mean in a computing context?|Folder
`);
add('internet-slang','Internet Slang School','Internet & Pop','💻','Decode the group chat before it decodes you.','https://www.merriam-webster.com/',`
What does LOL commonly stand for?|Laughing out loud
What does BRB stand for?|Be right back
What does DM commonly mean on social platforms?|Direct message
What does IRL stand for?|In real life
What does TBH stand for?|To be honest
What does FOMO stand for?|Fear of missing out
What does BTW stand for?|By the way
What does IMO stand for?|In my opinion
What does FAQ stand for?|Frequently asked questions
What does TIL stand for?|Today I learned
What does TL;DR stand for?|Too long; didn’t read
What does IYKYK stand for?|If you know, you know
What does ELI5 request?|Explain like I’m five
What does ICYMI stand for?|In case you missed it
What does AFAIK stand for?|As far as I know
What does YMMV stand for?|Your mileage may vary
What does OP usually mean in a discussion thread?|Original poster
What does OOTD stand for in fashion posts?|Outfit of the day
What does NGL stand for?|Not gonna lie
What does GOAT mean when praising a performer?|Greatest of all time
`);
add('emoji-movies','Emoji Movie Night','TV & Film','🍿','Tiny symbols. Big-screen guesses.','https://www.bfi.org.uk/',`
Which film fits these clues: 🦁 👑?|The Lion King
Which film fits these clues: 🧊 👸 ⛄?|Frozen
Which film fits these clues: 🐼 🥋?|Kung Fu Panda
Which film fits these clues: 🐀 👨‍🍳 🇫🇷?|Ratatouille
Which film fits these clues: 🦈 🏖️?|Jaws
Which film fits these clues: 👽 🚲 🌕?|E.T. the Extra-Terrestrial
Which film fits these clues: 🏠 🎈 👴?|Up
Which film fits these clues: 🚢 🧊 💔?|Titanic
Which film fits these clues: 🐠 🔍 🌊?|Finding Nemo
Which film fits these clues: 🧙 💍 🌋?|The Lord of the Rings
Which film fits these clues: 👠 👿 👜?|The Devil Wears Prada
Which film fits these clues: 🥁 👨‍🏫 😤?|Whiplash
Which film fits these clues: 💤 🌀 🏙️?|Inception
Which film fits these clues: 👨 🖥️ 💊?|The Matrix
Which film fits these clues: 🏨 🗻 🪓?|The Shining
Which film fits these clues: 🏠 👦 🪤 🎄?|Home Alone
Which film fits these clues: 👩‍🚀 🌎 🛰️?|Gravity
Which film fits these clues: 🤖 🗑️ 🌱?|WALL-E
Which film fits these clues: 🏴‍☠️ 🚢 🐙?|Pirates of the Caribbean
Which film fits these clues: 🦖 🧬 🏝️?|Jurassic Park
`);
export const PARTY_PACKS=packs;

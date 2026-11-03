const rows=[
['Which whole spice is shown?',['Cloves','Cumin seeds','Green cardamom'],0,'Cloves are dried flower buds.','cloves'],
['Which spice gives curries and dals their golden-yellow colour?',['Turmeric','Cumin','Cinnamon'],0,'Turmeric gives dishes a golden-yellow colour.'],
['Which seeds are shown?',['Caraway','Fennel','Cumin'],0,'Caraway is called kummin in Swedish.','caraway'],
['Which fragrant green pod is often added to chai?',['Cardamom','Clove','Black pepper'],0,'Green cardamom adds a fragrant aroma to chai.','cardamom'],
['Name the star-shaped spice in the photograph.',['Star anise','Bay leaf','Cinnamon'],0,'Star anise has a distinctive star-shaped fruit.','star-anise'],
['Which tiny seeds are heated in oil until they pop?',['Mustard seeds','Saffron','Turmeric'],0,'Mustard seeds are often popped in hot oil for tempering.'],
['Which spice is the dried inner bark of a tree?',['Cinnamon','Cloves','Black pepper'],0,'Cinnamon comes from the inner bark of cinnamon trees.'],
['This spice is kummin in Swedish. Which drink is associated with its flavour?',['Akvavit','Glögg','Cider'],0,'Caraway is one of the characteristic flavourings of akvavit.','caraway-close'],
['Kryddpeppar means allspice. What is this spice?',['A dried berry','A blend of spices','A cardamom pod'],0,'Allspice is a dried berry, not a spice mixture.','allspice'],
['A Swedish recipe asks for spiskummin. Which spice should you use?',['Caraway','Cumin','Fennel'],1,'Spiskummin means cumin. Kummin means caraway.'],
['To release more aroma from green cardamom for baking, what is a good first step?',['Lightly crush the pods','Soak in cold water','Toast until black'],0,'Lightly crushing the pods exposes the aromatic seeds.'],
['Which trio appears together in a Swedish pickled-herring recipe?',['Allspice, cloves, bay leaf','Cardamom, cinnamon, saffron','Cumin, turmeric, mustard'],0,'Allspice, cloves and bay leaf are a traditional pickling combination.']
];
export const SPICES={id:'spices',title:'Spices — Diwali at Aruns',category:'Food & Drink',icon:'🌶',color:'orange',description:'12 questions from your Diwali challenge, with real spice photos and a Swedish twist.',source:'https://github.com/roshanarun1991/QuickPop',difficulty:'easy',questions:rows.map(([text,options,answer,fact,image],i)=>({id:`spices-${i}`,text,options,correct:[answer],fact,image:image?'spice-'+image:null,type:'single',difficulty:'easy'}))};

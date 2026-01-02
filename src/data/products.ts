import { Product, Bilder } from '@/types/product';
export const products: Product[] = [
  {
    id: '1',
    name: 'Citronlemonad box',
    description: 'Citronlemonad när den är som bäst. En 3 liter bag in box med en härlig smak av citroner från medelhavet. Färskpressad citron gör den helt underbar att dricka.',
    unitPrice: 180,           // what user sees
    casePrice: 720,          // what they actually pay when ordering 1 case
    caseSize: 4,
    unitLabel: 'Box',
    unit: '3 liter per förpackning',
    category: 'lemonade',
    image: '/drinkmix.github.io//Citronlemonad.jpeg',
  },
  {
    id: '2',
    name: 'Jordgubbslemonad box',
    description: '3 liters Jordgubbslemonad på riktiga jordgubbar. Får en att längta tillbaka till barndomen',
    unitPrice: 180,           // what user sees
    casePrice: 720,          // what they actually pay when ordering 1 case
    caseSize: 4,
    unitLabel: 'Box',
    unit: '3 liter per förpacking',
    category: 'lemonade',
    image: '/drinkmix.github.io//Jordgubbslemonad3-liter.jpeg',
  },
  {
    id: '3',
    name: 'Sockerlag original',
    description: 'Klassisk sockerlag som innehåller Socker, vatten samt konserveringsmedel E 202',
    unitPrice: 59,           // what user sees
    casePrice: 1416,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'Sockerlag',
    image: '/drinkmix.github.io//Sockerlag-original.jpeg',
  },
  {
    id: '4',
    name: 'Sockerlag Färska Hallon',
    description: 'En sockerlag med smak av Hallon. Hallonsockerlag ger en härlig fruktig och söt smak som passar perfekt i många drinkar!',
    unitPrice: 59,           // what user sees
    casePrice: 1416,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'Sockerlag',
    image: '/drinkmix.github.io//Sockerlag-Farska-Hallon.jpeg',
  },
  {
    id: '5',
    name: 'Sockerlag Rabarber',
    description: 'Sockerlag gjort på Rabarber. Innehåller Rabarber Socker Vatten samt konserveringsmedel E 202',
    unitPrice: 59,           // what user sees
    casePrice: 1416,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'Sockerlag',
    image: '/drinkmix.github.io//Sockerlag-rabarber.jpeg',
  },
  {
    id: '6',
    name: 'Sockerlag Mynta',
    description: 'En sockerlag med smaker av klassisk mynta idealisk för att skapa en fräscha drinkar',
    unitPrice: 59,           // what user sees
    casePrice: 1416,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'Sockerlag',
    image: '/drinkmix.github.io//Sockerlag-mynta.jpeg',
  },
  {
    id: '7',
    name: 'Sockerlag Havtorn',
    description: 'Sockerlag av det klassiska bäret Havtorn',
    unitPrice: 59,           // what user sees
    casePrice: 1416,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'Sockerlag',
    image: '/drinkmix.github.io//Sockerlag-havtorn.jpeg',
  },
  {
    id: '8',
    name: 'Cascara',
    description: 'I denna flaska möts hantverk från två världar. Cascara, det torkade fruktköttet från kaffebäret – kommer från I am Coffees egna odlingar i Guinea. Cascara ger en naturligt fruktig smak med toner av röda bär. Cascaran macereras och blandas till likör av DrinkMix i det lilla fiskesamhället Glommen. Resultatet är en unik likör där kaffeplantans frukt står i centrum. Avnjut den som den är, eller använd den som drinkingrediens.',
    unitPrice: 279,           // what user sees
    casePrice: 1674,          // what they actually pay when ordering 1 case
    caseSize: 6,
    unitLabel: 'Flaska',
    unit: '6 stycken per låda',
    category: 'liquers',
    image: '/drinkmix.github.io//Cascara.jpeg',
  },
  {
    id: '9',
    name: 'Limoncello',
    description: 'Flaskan innehåller en frisk, solkysst citronlikör med rötterna i Medelhavet men med hjärtat djupt förankrat i svensk hantverkstradition. Perfekt att avnjuta välkyld som avec – eller som en strålande ingrediens i dina favoritdrinkar. I det lilla fiskesamhället Glommen, strax utanför Falkenberg, skalas och förbereds citronerna för hand innan de varsamt macereras i alkohol för att locka fram sin intensiva och naturliga smak.  Resultatet är en magisk svensk limoncello som tar dig raka vägen till känslan av en solig sommar i Italien.',
    unitPrice: 279,           // what user sees
    casePrice: 1674,          // what they actually pay when ordering 1 case
    caseSize: 6,
    unitLabel: 'Flaska',
    unit: '6 stycken per låda',
    category: 'liquers',
    image: '/drinkmix.github.io//Limoncello.jpeg',
   
  },
  {
    id: '10',
    name: 'Jordgubbslemonad',
    description: 'Får en att längta tillbaka till barndomen',
    unitPrice: 20,           // what user sees
    casePrice: 480,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'lemonade',
    image: '/drinkmix.github.io//Jordgubbslemonad.jpeg',
   
  },
  {
    id: '11',
    name: 'Citron/ingefäralemonad',
    description: 'Citronlemonad när den är som bäst. Färskpressad citron gör den helt underbar att dricka.',
    unitPrice: 20,           // what user sees
    casePrice: 480,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'lemonade',
    image: '/drinkmix.github.io//Citron-Ingefaralemonad.jpeg',
  },
  {
    id: '12',
    name: 'Citronlemonad box 5% alkohol',
    description: 'Citronlemonad när den är som bäst. En 3 liter bag in box med en härlig smak av citroner från medelhavet. Färskpressad citron gör den helt underbar att dricka.',
    unitPrice: 250,           // what user sees
    casePrice: 1000,          // what they actually pay when ordering 1 case
    caseSize: 4,
    unitLabel: 'Box',
    unit: '3 liter per förpackning',
    category: 'lemonade',
    image: '/drinkmix.github.io//Citronlemonad.jpeg',
    showInAll: false,  

  },
  {
    id: '13',
    name: 'Jordgubbslemonad box 5% alkohol',
    description: '3 liters Jordgubbslemonad på riktiga jordgubbar. Får en att längta tillbaka till barndomen',
    unitPrice: 250,           // what user sees
    casePrice: 1000,          // what they actually pay when ordering 1 case
    caseSize: 4,
    unitLabel: 'Box',
    unit: '3 liter per förpacking',
    category: 'lemonade',
    image: '/drinkmix.github.io//Jordgubbslemonad3-liter.jpeg',
    showInAll: false,  
  },
  {
    id: '14',
    name: 'Jordgubbslemonad 5% alkohol',
    description: 'Får en att längta tillbaka till barndomen',
    unitPrice: 28,           // what user sees
    casePrice: 672,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'lemonade',
    image: '/drinkmix.github.io//Jordgubbslemonad.jpeg',
    showInAll: false,  
  },
  {
    id: '15',
    name: 'Citron/ingefäralemonad 5% alkohol',
    description: 'Citronlemonad när den är som bäst. Färskpressad citron gör den helt underbar att dricka.',
    unitPrice: 28,           // what user sees
    casePrice: 672,          // what they actually pay when ordering 1 case
    caseSize: 24,
    unitLabel: 'Flaska',
    unit: '24 stycken per flak',
    category: 'lemonade',
    image: '/drinkmix.github.io//Citron-Ingefaralemonad.jpeg',
    showInAll: false,  
  },
]
  export const bilder: Bilder[] = [
  {
    id: '1',
    name: 'Citronlemonad box',
    price: 720,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Citronlemonad.jpeg',
  },
  {
    id: '2',
    name: 'Jordgubbslemonad box',    
    price: 720,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Jordgubbslemonad3-liter.jpeg',
  },
  {
    id: '3',
    name: 'Sockerlag original',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Sockerlag-original.jpeg',
  },
  {
    id: '4',
    name: 'Sockerlag Färska Hallon',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Sockerlag-Farska-Hallon.jpeg',
  },
  {
    id: '5',
    name: 'Sockerlag Rabarber',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Sockerlag-rabarber.jpeg',
  },
  {
    id: '6',
    name: 'Sockerlag Mynta',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Sockerlag-mynta.jpeg',
  },
  {
    id: '7',
    name: 'Sockerlag Havtorn',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Sockerlag-havtorn.jpeg',
  },
  {
    id: '8',
    name: 'Cascara',
    price: 1674,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Cascara.jpeg',
  },
  {
    id: '9',
    name: 'Limoncello',
    price: 1674,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Limoncello.jpeg',
  },
  {
    id: '10',
    name: 'Jordgubbslemonad',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Jordgubbslemonad.jpeg',
  },
  {
    id: '11',
    name: 'Citron/ingefäralemonad',
    price: 480,
    category: 'Produktbilder',
    image: '/drinkmix.github.io//Citron-Ingefaralemonad.jpeg',
  }
];

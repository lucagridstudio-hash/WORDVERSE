import type { MotifKey, Pos, TerritoryDef, TerritoryTheme, WordEntry } from '../types';

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Curated vocabulary. Every example sentence is written so that it contains the
 * English word verbatim, which is what the Missing Word mode blanks out.
 * Translations were checked by hand: no generated content is mixed in here.
 */
const makeWords = (prefix: string) =>
  (rows: Array<[string, string, Pos, string, string[]?]>): WordEntry[] =>
    rows.map(([en, it, pos, example, variants]) => ({
      id: `${prefix}:${slug(en)}`,
      en,
      it,
      pos,
      example,
      ...(variants ? { variants } : {}),
    }));

const foodWords = makeWords('food')([
  ['breakfast', 'colazione', 'noun', 'I usually have eggs for breakfast on Sunday.'],
  ['recipe', 'ricetta', 'noun', 'My grandmother gave me the recipe for this cake.'],
  ['knife', 'coltello', 'noun', 'Use a sharp knife to cut the bread.'],
  ['fork', 'forchetta', 'noun', 'She ate the salad with a small fork.'],
  ['spoon', 'cucchiaio', 'noun', 'You need a spoon to eat the hot soup.'],
  ['plate', 'piatto', 'noun', 'Put the pasta on a clean plate.'],
  ['flour', 'farina', 'noun', 'We need flour to make the bread.'],
  ['butter', 'burro', 'noun', 'Melt the butter in the pan before you add the eggs.'],
  ['cheese', 'formaggio', 'noun', 'This cheese comes from the mountains of Italy.'],
  ['vegetables', 'verdure', 'noun', 'I buy fresh vegetables at the market every Saturday.'],
  ['oven', 'forno', 'noun', 'The cake is in the oven, heating at 180 degrees.'],
  ['dessert', 'dolce', 'noun', 'We had ice cream for dessert.'],
  ['boil', 'bollire', 'verb', 'Boil the water before you add the pasta.'],
  ['fry', 'friggere', 'verb', 'Fry the onions in olive oil for two minutes.'],
  ['taste', 'assaggiare', 'verb', 'Taste the sauce and add a little salt.'],
  ['slice', 'affettare', 'verb', 'Slice the bread and put it on the table.'],
  ['spicy', 'piccante', 'adjective', 'This curry is too spicy for me.'],
  ['delicious', 'delizioso', 'adjective', 'The soup was delicious, so I asked for more.'],
]);

const artWords = makeWords('art')([
  ['painting', 'dipinto', 'noun', 'This painting hangs in the museum in Florence.'],
  ['brush', 'pennello', 'noun', 'Clean the brush with water after you use the paint.'],
  ['canvas', 'tela', 'noun', 'The artist stretched the canvas over a wooden frame.'],
  ['sculpture', 'scultura', 'noun', 'The marble sculpture stands in the middle of the square.'],
  ['gallery', 'galleria', 'noun', 'We visited a small gallery near the river.'],
  ['sketch', 'schizzo', 'noun', 'He made a quick sketch of the old building.'],
  ['colour', 'colore', 'noun', 'Blue is my favourite colour.', ['color']],
  ['design', 'design', 'noun', 'The design of this chair is simple and modern.'],
  ['pattern', 'motivo', 'noun', 'The pattern on the fabric is made of small flowers.'],
  ['frame', 'cornice', 'noun', 'The photo looks better in a wooden frame.'],
  ['exhibition', 'mostra', 'noun', 'The museum holds an exhibition of modern art.'],
  ['portrait', 'ritratto', 'noun', 'The portrait shows a woman in a blue dress.'],
  ['background', 'sfondo', 'noun', 'The background of the painting is deep blue.'],
  ['shape', 'forma', 'noun', 'A triangle is a shape with three sides.'],
  ['draw', 'disegnare', 'verb', 'I like to draw animals in my notebook.'],
  ['paint', 'dipingere', 'verb', 'They paint the walls white every summer.'],
  ['creative', 'creativo', 'adjective', 'She is a creative person who writes and paints.'],
  ['modern', 'moderno', 'adjective', 'The city has many modern buildings made of glass.'],
]);

const funWords = makeWords('fun')([
  ['game', 'gioco', 'noun', 'We played a board game all evening.'],
  ['puzzle', 'rompicapo', 'noun', 'This puzzle has a thousand pieces.'],
  ['player', 'giocatore', 'noun', 'Each player throws the dice once.'],
  ['dice', 'dado', 'noun', 'Roll the dice and move your token.'],
  ['rule', 'regola', 'noun', 'The first rule of the game is to keep the score.'],
  ['score', 'punteggio', 'noun', 'Our team has the highest score of the match.'],
  ['winner', 'vincitore', 'noun', 'The winner receives a small golden cup.'],
  ['challenge', 'sfida', 'noun', 'Learning these words is a good challenge.'],
  ['teamwork', 'lavoro di squadra', 'noun', 'Teamwork is more important than luck.'],
  ['hobby', 'passatempo', 'noun', 'Photography is my favourite hobby.'],
  ['card', 'carta', 'noun', 'Pick a card from the deck.'],
  ['treasure', 'tesoro', 'noun', 'The map leads to a hidden treasure.'],
  ['laugh', 'ridere', 'verb', 'The children laugh at the funny story.'],
  ['win', 'vincere', 'verb', 'They win the match with a last-minute goal.'],
  ['lose', 'perdere', 'verb', 'Nobody wants to lose the final match.'],
  ['guess', 'indovinare', 'verb', 'Guess the answer before the timer stops.'],
  ['play', 'giocare', 'verb', "Let's play one more round before dinner."],
  ['tricky', 'insidioso', 'adjective', 'The last question was really tricky.'],
]);

const techWords = makeWords('tech')([
  ['computer', 'computer', 'noun', 'The computer in the classroom is very slow.'],
  ['keyboard', 'tastiera', 'noun', 'Type your name on the keyboard.'],
  ['screen', 'schermo', 'noun', 'The screen is too bright in this room.'],
  ['password', 'password', 'noun', 'Choose a password that nobody can guess.'],
  ['battery', 'batteria', 'noun', 'The battery of my laptop is almost empty.'],
  ['software', 'software', 'noun', 'This software helps students to learn new words.'],
  ['device', 'dispositivo', 'noun', 'This device works with a small battery.'],
  ['charger', 'caricabatterie', 'noun', 'I forgot my phone charger at home.'],
  ['network', 'rete', 'noun', 'The network is slow in the basement.'],
  ['update', 'aggiornamento', 'noun', 'The new update fixes many small problems.'],
  ['browser', 'browser', 'noun', 'Open the page in a different browser.'],
  ['download', 'scaricare', 'verb', 'You can download the file from the website.'],
  ['upload', 'caricare', 'verb', 'Upload the photo before you close the app.'],
  ['click', 'cliccare', 'verb', 'Click on the link to open the page.'],
  ['save', 'salvare', 'verb', 'Save the document before you close it.'],
  ['share', 'condividere', 'verb', 'Share the file with your teacher.'],
  ['digital', 'digitale', 'adjective', 'We keep all the photos in digital format.'],
  ['wireless', 'senza fili', 'adjective', 'The wireless connection works in every room.'],
]);

const workWords = makeWords('work')([
  ['job', 'lavoro', 'noun', 'She found a new job in a bookstore.'],
  ['salary', 'stipendio', 'noun', 'The salary is good, but the hours are long.'],
  ['meeting', 'riunione', 'noun', 'The meeting starts at nine in the morning.'],
  ['colleague', 'collega', 'noun', 'My colleague speaks three languages.'],
  ['manager', 'responsabile', 'noun', 'Our manager answers all the emails herself.'],
  ['interview', 'colloquio', 'noun', 'He has a job interview on Monday.'],
  ['deadline', 'scadenza', 'noun', 'The deadline for the project is Friday.'],
  ['office', 'ufficio', 'noun', 'The office is on the third floor.'],
  ['customer', 'cliente', 'noun', 'The customer asked for a discount.'],
  ['engineer', 'ingegnere', 'noun', 'The engineer designed a new bridge.'],
  ['lawyer', 'avvocato', 'noun', 'A lawyer must know the law very well.'],
  ['nurse', 'infermiere', 'noun', 'The nurse checked my temperature.'],
  ['task', 'compito', 'noun', 'Finish this task before you leave.'],
  ['hire', 'assumere', 'verb', 'The company wants to hire two new people.'],
  ['apply', 'candidarsi', 'verb', 'You should apply for that position today.'],
  ['earn', 'guadagnare', 'verb', 'Freelancers earn money on each project.'],
  ['retire', 'andare in pensione', 'verb', 'My father plans to retire next year.'],
  ['busy', 'occupato', 'adjective', 'The director is busy until lunchtime.'],
  ['skilled', 'qualificato', 'adjective', 'We need a skilled worker for this job.'],
]);

const placeWords = makeWords('places')([
  ['city', 'città', 'noun', 'Milan is a busy city in the north of Italy.'],
  ['village', 'villaggio', 'noun', 'The village has only one shop and a church.'],
  ['bridge', 'ponte', 'noun', 'The old bridge crosses the river.'],
  ['square', 'piazza', 'noun', 'People meet in the square in front of the cathedral.'],
  ['museum', 'museo', 'noun', 'The museum is closed on Mondays.'],
  ['library', 'biblioteca', 'noun', 'You can borrow books from the library.'],
  ['market', 'mercato', 'noun', 'The market opens early on Saturday morning.'],
  ['neighbourhood', 'quartiere', 'noun', 'This neighbourhood has small cafés and quiet streets.', ['neighborhood']],
  ['traffic', 'traffico', 'noun', 'The traffic in the centre is terrible at eight.'],
  ['pavement', 'marciapiede', 'noun', 'Walk on the pavement, not on the road.', ['sidewalk']],
  ['skyscraper', 'grattacielo', 'noun', 'The new skyscraper is the tallest building in the city.'],
  ['statue', 'statua', 'noun', 'A bronze statue stands in the middle of the park.'],
  ['crowd', 'folla', 'noun', 'A crowd of tourists waited outside the museum.'],
  ['visit', 'visitare', 'verb', 'Tourists visit the cathedral every day.'],
  ['cross', 'attraversare', 'verb', 'Cross the street when the light is green.'],
  ['noisy', 'rumoroso', 'adjective', 'The street is very noisy at night.'],
  ['crowded', 'affollato', 'adjective', 'The station is always crowded at rush hour.'],
  ['ancient', 'antico', 'adjective', 'The ancient walls surround the old town.'],
  ['local', 'locale', 'adjective', 'We ate in a local restaurant near the port.'],
]);

const sportWords = makeWords('sports')([
  ['athlete', 'atleta', 'noun', 'The athlete trains six days a week.'],
  ['coach', 'allenatore', 'noun', 'The coach spoke to the team before the match.'],
  ['match', 'partita', 'noun', 'The match starts at six tonight.'],
  ['referee', 'arbitro', 'noun', 'The referee gave a yellow card to the captain.'],
  ['goal', 'gol', 'noun', 'He scored the winning goal in the last minute.'],
  ['race', 'gara', 'noun', 'She won the race by two seconds.'],
  ['teammate', 'compagno di squadra', 'noun', 'My teammate passed me the ball.'],
  ['gym', 'palestra', 'noun', 'I go to the gym three times a week.'],
  ['muscle', 'muscolo', 'noun', 'The muscle in my leg hurts after the run.'],
  ['trophy', 'trofeo', 'noun', 'The captain lifted the trophy above her head.'],
  ['stretch', 'allungare', 'verb', 'Stretch your legs before you start running.'],
  ['train', 'allenarsi', 'verb', 'They train every morning at the stadium.'],
  ['score', 'segnare', 'verb', 'It is not easy to score against this team.'],
  ['compete', 'competere', 'verb', 'Teams from ten countries compete in the championship.'],
  ['practise', 'esercitarsi', 'verb', 'You must practise every day to improve.', ['practice']],
  ['injured', 'infortunato', 'adjective', 'The player is injured and cannot play on Sunday.'],
  ['strong', 'forte', 'adjective', 'A strong swimmer can cross the lake easily.'],
  ['tired', 'stanco', 'adjective', 'After the marathon I was completely tired.'],
]);

const travelWords = makeWords('travel')([
  ['journey', 'viaggio', 'noun', 'The journey to the coast takes three hours.'],
  ['luggage', 'bagaglio', 'noun', 'My luggage was too heavy for the flight.'],
  ['ticket', 'biglietto', 'noun', 'I bought a return ticket to Venice.'],
  ['platform', 'binario', 'noun', 'The train to Rome leaves from platform four.'],
  ['passport', 'passaporto', 'noun', 'Show your passport at the border.'],
  ['departure', 'partenza', 'noun', 'The departure is delayed by twenty minutes.'],
  ['arrival', 'arrivo', 'noun', 'Our arrival is scheduled for eight in the evening.'],
  ['passenger', 'passeggero', 'noun', 'Each passenger can take one small bag.'],
  ['subway', 'metropolitana', 'noun', 'Take the subway to reach the centre quickly.', ['underground', 'metro']],
  ['ferry', 'traghetto', 'noun', 'The ferry crosses the lake in an hour.'],
  ['route', 'percorso', 'noun', 'This route is longer but much quieter.'],
  ['suitcase', 'valigia', 'noun', 'I packed my suitcase the night before.'],
  ['book', 'prenotare', 'verb', 'Book the hotel early, because prices rise in summer.'],
  ['board', 'salire a bordo', 'verb', 'Passengers board the plane thirty minutes before departure.'],
  ['delay', 'ritardo', 'noun', 'The delay was caused by heavy snow.'],
  ['abroad', 'all\'estero', 'adverb', 'She studied abroad for six months.'],
  ['comfortable', 'comodo', 'adjective', 'The seats on this train are comfortable.'],
  ['expensive', 'costoso', 'adjective', 'The flight was expensive during the holidays.'],
  ['fast', 'veloce', 'adjective', 'A fast train connects the two cities.'],
]);

const natureWords = makeWords('nature')([
  ['forest', 'foresta', 'noun', 'The forest is full of tall pine trees.'],
  ['mountain', 'montagna', 'noun', 'The mountain is covered with snow in winter.'],
  ['river', 'fiume', 'noun', 'A long river runs through the valley.'],
  ['valley', 'valle', 'noun', 'The valley is green in spring.'],
  ['island', 'isola', 'noun', 'This island has no cars and no roads.'],
  ['beach', 'spiaggia', 'noun', 'The beach is empty in the early morning.'],
  ['wildlife', 'fauna selvatica', 'noun', 'The park protects the wildlife of the region.'],
  ['pollution', 'inquinamento', 'noun', 'Pollution in the city is a serious problem.'],
  ['climate', 'clima', 'noun', 'The climate here is warm and dry.'],
  ['energy', 'energia', 'noun', 'The sun gives us clean energy.'],
  ['sunlight', 'luce del sole', 'noun', 'The plants need sunlight to grow.'],
  ['recycle', 'riciclare', 'verb', 'We recycle plastic, glass and paper at home.'],
  ['waste', 'sprecare', 'verb', "Don't waste water when you wash the dishes."],
  ['protect', 'proteggere', 'verb', 'We must protect the bees and other insects.'],
  ['plant', 'piantare', 'verb', 'They plant a tree every spring.'],
  ['renewable', 'rinnovabile', 'adjective', 'Wind energy is renewable and clean.'],
  ['wild', 'selvatico', 'adjective', 'Wild animals live in this part of the park.'],
  ['peaceful', 'tranquillo', 'adjective', 'The lake is peaceful in the early morning.'],
  ['endangered', 'in via di estinzione', 'adjective', 'The panda is an endangered species.'],
]);

const homeWords = makeWords('home')([
  ['kitchen', 'cucina', 'noun', 'The kitchen is the warmest room in the house.'],
  ['bedroom', 'camera da letto', 'noun', 'My bedroom has a small window and a desk.'],
  ['balcony', 'balcone', 'noun', 'We drink coffee on the balcony in summer.'],
  ['furniture', 'mobili', 'noun', 'The furniture in the living room is old.'],
  ['wardrobe', 'armadio', 'noun', 'I keep my winter coats in the wardrobe.'],
  ['fridge', 'frigorifero', 'noun', 'There is some milk in the fridge.', ['refrigerator']],
  ['laundry', 'bucato', 'noun', 'I do the laundry on Saturday morning.'],
  ['neighbour', 'vicino di casa', 'noun', 'Our neighbour waters the plants when we are away.', ['neighbor']],
  ['rent', 'affitto', 'noun', 'The rent includes water and heating.'],
  ['curtain', 'tenda', 'noun', 'Close the curtain, the sun is in my eyes.'],
  ['chores', 'faccende', 'noun', 'We share the household chores between us.'],
  ['wake', 'svegliarsi', 'verb', 'I wake up at seven every morning.'],
  ['iron', 'stirare', 'verb', 'I have to iron this shirt before the meeting.'],
  ['sweep', 'spazzare', 'verb', 'Sweep the floor before the guests arrive.'],
  ['lock', 'chiudere a chiave', 'verb', 'Remember to lock the door when you leave.'],
  ['upstairs', 'di sopra', 'adverb', 'The bedrooms are upstairs, on the first floor.'],
  ['tidy', 'ordinato', 'adjective', 'Her desk is always clean and tidy.'],
  ['cosy', 'accogliente', 'adjective', 'The little living room is warm and cosy.', ['cozy']],
  ['empty', 'vuoto', 'adjective', 'The bottle is empty, so I will buy another one.'],
]);

const theme = (deep: string, mid: string, accent: string): TerritoryTheme => ({ deep, mid, accent });

export const territories: TerritoryDef[] = [
  {
    id: 'food',
    name: 'Food & Cooking',
    it: 'Cibo e cucina',
    description: 'Ingredienti, utensili e sapori della cucina di ogni giorno.',
    theme: theme('#241008', '#5a2a14', '#f4a261'),
    motif: 'food',
    map: { x: 12, y: 46 },
    words: foodWords,
  },
  {
    id: 'art',
    name: 'Art & Design',
    it: 'Arte e design',
    description: 'Colori, forme e il linguaggio della creatività.',
    theme: theme('#1b1030', '#40215e', '#c084fc'),
    motif: 'art',
    map: { x: 24, y: 16 },
    words: artWords,
  },
  {
    id: 'fun',
    name: 'Fun & Games',
    it: 'Gioco e divertimento',
    description: 'Regole, sfide e passatempi da condividere.',
    theme: theme('#2a0f22', '#5c1c3d', '#fb7185'),
    motif: 'fun',
    map: { x: 48, y: 16 },
    words: funWords,
  },
  {
    id: 'tech',
    name: 'Technology',
    it: 'Tecnologia',
    description: 'Dispositivi, rete e gesti digitali quotidiani.',
    theme: theme('#08202e', '#0e4055', '#38bdf8'),
    motif: 'tech',
    map: { x: 72, y: 16 },
    words: techWords,
  },
  {
    id: 'work',
    name: 'Work & Professions',
    it: 'Lavoro e professioni',
    description: 'Uffici, mestieri e vita professionale.',
    theme: theme('#241b08', '#4c3510', '#f0c36b'),
    motif: 'work',
    map: { x: 22, y: 76 },
    words: workWords,
  },
  {
    id: 'places',
    name: 'Places & Cities',
    it: 'Luoghi e città',
    description: 'Strade, piazze e spazi delle nostre città.',
    theme: theme('#171a3d', '#33326d', '#a5b4fc'),
    motif: 'places',
    map: { x: 36, y: 46 },
    words: placeWords,
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    it: 'Sport e fitness',
    description: 'Allenamento, gare e spirito di squadra.',
    theme: theme('#0a2418', '#124a2e', '#4ade80'),
    motif: 'sports',
    map: { x: 47, y: 76 },
    words: sportWords,
  },
  {
    id: 'travel',
    name: 'Travel & Transport',
    it: 'Viaggi e trasporti',
    description: 'Biglietti, bagagli e rotte verso lontano.',
    theme: theme('#0b1e38', '#153d66', '#60a5fa'),
    motif: 'travel',
    map: { x: 60, y: 46 },
    words: travelWords,
  },
  {
    id: 'nature',
    name: 'Nature & Environment',
    it: 'Natura e ambiente',
    description: 'Paesaggi, clima e rispetto del pianeta.',
    theme: theme('#0b241f', '#14513f', '#34d399'),
    motif: 'nature',
    map: { x: 85, y: 46 },
    words: natureWords,
  },
  {
    id: 'home',
    name: 'Home & Daily Life',
    it: 'Casa e vita quotidiana',
    description: 'Stanze, faccende e ritmi della vita in casa.',
    theme: theme('#2a1620', '#542434', '#eaa79a'),
    motif: 'home',
    map: { x: 72, y: 76 },
    words: homeWords,
  },
];

export const customTheme = theme('#0c1a2c', '#1c3a52', '#5eead4');

export const territoryById = (id: string): TerritoryDef | undefined =>
  territories.find((t) => t.id === id);

export const allSeedWords = territories.flatMap((t) => t.words);

export const posLabel: Record<Pos, string> = {
  noun: 'sostantivo',
  verb: 'verbo',
  adjective: 'aggettivo',
  adverb: 'avverbio',
};

export const motifKeys: MotifKey[] = [
  'food',
  'art',
  'fun',
  'tech',
  'work',
  'places',
  'sports',
  'travel',
  'nature',
  'home',
];

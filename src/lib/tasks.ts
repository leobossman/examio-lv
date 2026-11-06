/** Starter task bank. Types: mc (izvēle), short (īsā atbilde), open (2. daļa ar soļiem). */
export type Task = {
  id: string; subject: string; grades: string[]; type: "mc" | "short" | "open";
  q: string; options?: string[]; answer: string; explain: string; steps?: string[]; points?: number;
};
const ALL = ["9. klase", "10. klase", "11. klase", "12. klase", "Absolvents"];
const HS = ["10. klase", "11. klase", "12. klase", "Absolvents"];
const SR = ["10. klase", "12. klase", "Absolvents"];

export const TASKS: Task[] = [
  // Matemātika
  { id: "m1", subject: "Matemātika", grades: ALL, type: "mc", q: "Atrisini: 3x − 7 = 11", options: ["x = 4", "x = 6", "x = 18", "x = 3"], answer: "x = 6", explain: "3x = 18 ⇒ x = 6." },
  { id: "m2", subject: "Matemātika", grades: ALL, type: "short", q: "Taisnleņķa trijstūra katetes ir 6 un 8. Cik gara ir hipotenūza?", answer: "10", explain: "c = √(6² + 8²) = √100 = 10." },
  { id: "m3", subject: "Matemātika", grades: HS, type: "short", q: "Aprēķini sin 30° vērtību (decimāldaļskaitlis).", answer: "0.5", explain: "sin 30° = 1/2 = 0,5." },
  { id: "m4", subject: "Matemātika", grades: HS, type: "mc", q: "Kvadrātvienādojuma x² − 5x + 6 = 0 saknes ir:", options: ["1 un 6", "2 un 3", "−2 un −3", "5 un 6"], answer: "2 un 3", explain: "Vjeta teorēma: x₁+x₂=5, x₁·x₂=6 ⇒ 2 un 3." },
  { id: "m5", subject: "Matemātika", grades: ["12. klase", "Absolvents", "10. klase"], type: "short", q: "Atrodi atvasinājumu f(x) = x³ punktā x = 2.", answer: "12", explain: "f'(x) = 3x² ⇒ f'(2) = 12." },
  { id: "m6", subject: "Matemātika", grades: ALL, type: "open", points: 4, q: "Prece maksāja 80 €. Cenu paaugstināja par 25 %, pēc tam samazināja par 20 %. Kāda ir gala cena? Pamato.", answer: "80 €", explain: "Procentu izmaiņas nesaskaitās tieši.", steps: ["80 · 1,25 = 100 € (1 p.)", "100 · 0,8 = 80 € (1 p.)", "Pareizi pieraksti procentu reizinātāji (1 p.)", "Secinājums: cena nemainījās (1 p.)"] },
  { id: "m7", subject: "Matemātika", grades: HS, type: "open", points: 3, q: "Atrisini nevienādību x² − 4 > 0.", answer: "x < −2 vai x > 2", explain: "Parabola zari uz augšu.", steps: ["Saknes: x = ±2 (1 p.)", "Intervālu metode / skice (1 p.)", "Atbilde: x ∈ (−∞; −2) ∪ (2; +∞) (1 p.)"] },
  // Latviešu valoda
  { id: "l1", subject: "Latviešu valoda", grades: ALL, type: "mc", q: "Kurā teikumā komats lietots pareizi?", options: ["Es zinu, ka viņš nāks.", "Es zinu ka, viņš nāks.", "Es, zinu ka viņš nāks.", "Es zinu ka viņš, nāks."], answer: "Es zinu, ka viņš nāks.", explain: "Palīgteikumu ar saikli 'ka' atdala ar komatu pirms saikļa." },
  { id: "l2", subject: "Latviešu valoda", grades: ALL, type: "short", q: "Ieraksti vārda 'galds' daudzskaitļa ģenitīvu.", answer: "galdu", explain: "1. deklinācija: dsk. ģen. -u → galdu." },
  { id: "l3", subject: "Latviešu valoda", grades: ALL, type: "mc", q: "Kurš ir sinonīms vārdam 'drosmīgs'?", options: ["bailīgs", "varonīgs", "kluss", "slinks"], answer: "varonīgs", explain: "Varonīgs — tuvas nozīmes vārds." },
  { id: "l4", subject: "Latviešu valoda", grades: HS, type: "open", points: 5, q: "Uzraksti argumentētu viedokli (5–7 teikumi): 'Vai jauniešiem vajadzētu lasīt vairāk grāmatu?'", answer: "", explain: "Vērtē pēc struktūras un argumentācijas.", steps: ["Skaidra tēze (1 p.)", "Vismaz 2 argumenti (2 p.)", "Piemērs no pieredzes/literatūras (1 p.)", "Secinājums (1 p.)"] },
  // Angļu valoda
  { id: "e1", subject: "Angļu valoda", grades: ALL, type: "mc", q: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes", explain: "Present Simple, 3. pers. vsk. → -es." },
  { id: "e2", subject: "Angļu valoda", grades: ALL, type: "short", q: "Write the past simple of 'buy'.", answer: "bought", explain: "Neregulārais darbības vārds: buy – bought – bought." },
  { id: "e3", subject: "Angļu valoda", grades: HS, type: "mc", q: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], answer: "were", explain: "2. tipa nosacījuma teikums: If + were." },
  { id: "e4", subject: "Angļu valoda", grades: HS, type: "open", points: 5, q: "Write a short email (60–80 words) to a friend inviting them to a concert.", answer: "", explain: "Self-check using criteria.", steps: ["Greeting & closing (1 p.)", "Purpose clearly stated (1 p.)", "Details: date, place (1 p.)", "Grammar accuracy (1 p.)", "Word count (1 p.)"] },
  // Fizika
  { id: "f1", subject: "Fizika", grades: SR, type: "short", q: "Ķermenis ar masu 2 kg paātrinās ar 3 m/s². Kāds spēks (N) uz to darbojas?", answer: "6", explain: "F = m·a = 2·3 = 6 N." },
  { id: "f2", subject: "Fizika", grades: SR, type: "mc", q: "Kāda ir sprieguma mērvienība?", options: ["Ampērs", "Volts", "Oms", "Vats"], answer: "Volts", explain: "Spriegumu mēra voltos (V)." },
  { id: "f3", subject: "Fizika", grades: SR, type: "open", points: 3, q: "Rezistoram 10 Ω pievadīts 20 V spriegums. Aprēķini strāvu un jaudu.", answer: "2 A, 40 W", explain: "Oma likums un jauda.", steps: ["I = U/R = 2 A (1 p.)", "P = U·I (1 p.)", "P = 40 W (1 p.)"] },
  // Ķīmija
  { id: "k1", subject: "Ķīmija", grades: SR, type: "mc", q: "Ūdens ķīmiskā formula ir:", options: ["H₂O₂", "HO", "H₂O", "OH₂"], answer: "H₂O", explain: "2 ūdeņraža atomi + 1 skābekļa atoms." },
  { id: "k2", subject: "Ķīmija", grades: SR, type: "short", q: "Cik g/mol ir NaCl molmasa? (Na=23, Cl=35,5)", answer: "58.5", explain: "23 + 35,5 = 58,5 g/mol." },
  { id: "k3", subject: "Ķīmija", grades: SR, type: "mc", q: "Šķīdums ar pH 3 ir:", options: ["bāzisks", "neitrāls", "skābs", "sāļš"], answer: "skābs", explain: "pH < 7 — skāba vide." },
  // Bioloģija
  { id: "b1", subject: "Bioloģija", grades: HS, type: "mc", q: "Kurā šūnas organoīdā notiek fotosintēze?", options: ["Mitohondrijā", "Hloroplastā", "Ribosomā", "Kodolā"], answer: "Hloroplastā", explain: "Hloroplasti satur hlorofilu." },
  { id: "b2", subject: "Bioloģija", grades: HS, type: "short", q: "Cik hromosomu ir cilvēka somatiskajā šūnā?", answer: "46", explain: "23 pāri = 46 hromosomas." },
  { id: "b3", subject: "Bioloģija", grades: HS, type: "open", points: 3, q: "Krusto Aa × Aa. Kāda ir pēcnācēju fenotipu attiecība?", answer: "3:1", explain: "Mendeļa 2. likums.", steps: ["Pennetta režģis: AA, Aa, Aa, aa (1 p.)", "Genotipi 1:2:1 (1 p.)", "Fenotipi 3:1 (1 p.)"] },
  // Vēsture
  { id: "v1", subject: "Vēsture", grades: SR, type: "short", q: "Kurā gadā proklamēja Latvijas Republiku?", answer: "1918", explain: "1918. gada 18. novembrī." },
  { id: "v2", subject: "Vēsture", grades: SR, type: "mc", q: "Baltijas ceļš notika:", options: ["1987", "1989", "1991", "1990"], answer: "1989", explain: "1989. gada 23. augustā." },
  { id: "v3", subject: "Vēsture", grades: SR, type: "open", points: 4, q: "Izskaidro 2 cēloņus, kāpēc sākās Pirmais pasaules karš.", answer: "", explain: "Vērtē cēloņu skaidrojumu.", steps: ["Nosaukts 1. cēlonis (piem., alianšu sistēma) (1 p.)", "Tas paskaidrots (1 p.)", "Nosaukts 2. cēlonis (piem., Sarajevas atentāts) (1 p.)", "Tas paskaidrots (1 p.)"] },
  // Sociālās zinības
  { id: "s1", subject: "Sociālās zinības", grades: SR, type: "mc", q: "Kas Latvijā pieņem likumus?", options: ["Valdība", "Saeima", "Prezidents", "Tiesa"], answer: "Saeima", explain: "Likumdevēja vara — Saeima." },
  { id: "s2", subject: "Sociālās zinības", grades: SR, type: "short", q: "Cik deputātu ir Saeimā?", answer: "100", explain: "Satversmes 5. pants." },
  // Ģeogrāfija
  { id: "g1", subject: "Ģeogrāfija", grades: SR, type: "mc", q: "Latvijas garākā upe tās teritorijā ir:", options: ["Daugava", "Gauja", "Venta", "Lielupe"], answer: "Gauja", explain: "Gauja (452 km) pilnībā Latvijā." },
  { id: "g2", subject: "Ģeogrāfija", grades: SR, type: "short", q: "Kartes mērogs 1:100 000. Cik km atbilst 3 cm kartē?", answer: "3", explain: "1 cm = 1 km ⇒ 3 km." },
  // Kultūra un māksla
  { id: "km1", subject: "Kultūra un māksla", grades: SR, type: "mc", q: "Kurš gleznoja 'Monu Lizu'?", options: ["Mikelandželo", "Leonardo da Vinči", "Rafaels", "Van Gogs"], answer: "Leonardo da Vinči", explain: "Renesanses meistars Leonardo." },
  { id: "km2", subject: "Kultūra un māksla", grades: SR, type: "mc", q: "Brīvības pieminekļa tēlnieks ir:", options: ["K. Zāle", "J. Rozentāls", "V. Purvītis", "T. Zaļkalns"], answer: "K. Zāle", explain: "Kārlis Zāle, 1935." },
  // Dizains un tehnoloģijas
  { id: "d1", subject: "Dizains un tehnoloģijas", grades: SR, type: "mc", q: "Kurš ir dizaina procesa pirmais solis?", options: ["Prototips", "Problēmas izpēte", "Testēšana", "Ražošana"], answer: "Problēmas izpēte", explain: "Vispirms izprot lietotāja vajadzības." },
  { id: "d2", subject: "Dizains un tehnoloģijas", grades: SR, type: "open", points: 3, q: "Apraksti, kā uzlabotu skolas mugursomu. Nosauc problēmu, risinājumu un materiālu.", answer: "", explain: "Pašnovērtējums.", steps: ["Problēma (1 p.)", "Risinājums (1 p.)", "Pamatota materiāla izvēle (1 p.)"] },
  // Programmēšana
  { id: "p1", subject: "Programmēšana", grades: SR, type: "short", q: "Ko izvadīs Python: print(7 // 2)?", answer: "3", explain: "// ir veselā dalīšana." },
  { id: "p2", subject: "Programmēšana", grades: SR, type: "mc", q: "Kura datu struktūra darbojas pēc LIFO?", options: ["Rinda", "Steks", "Saraksts", "Koks"], answer: "Steks", explain: "Last In, First Out — steks." },
  { id: "p3", subject: "Programmēšana", grades: SR, type: "open", points: 3, q: "Uzraksti funkciju, kas atgriež saraksta lielāko skaitli, neizmantojot max().", answer: "", explain: "Pašnovērtējums.", steps: ["Mainīgais ar pirmo elementu (1 p.)", "Cikls ar salīdzināšanu (1 p.)", "Pareiza atgriešana (1 p.)"] },
];

export const norm = (s: string) => s.trim().toLowerCase().replace(",", ".").replace(/\s+/g, " ");
export const tasksFor = (subject: string, grade: string) => TASKS.filter((t) => t.subject === subject && t.grades.includes(grade));

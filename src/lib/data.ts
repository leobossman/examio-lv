export const subjects12 = [
  "Matemātika", "Latviešu valoda", "Angļu valoda", "Fizika", "Ķīmija", "Bioloģija",
  "Vēsture", "Sociālās zinības", "Ģeogrāfija", "Kultūra un māksla",
  "Dizains un tehnoloģijas", "Programmēšana",
];
export const subjects9 = ["Matemātika", "Latviešu valoda", "Angļu valoda", "Vēsture"];
export const levels = ["Optimālais", "Augstākais"] as const;

export const projected = [
  { subject: "Matemātika", level: "Optimālais", score: 74 },
  { subject: "Latviešu valoda", level: "Optimālais", score: 81 },
  { subject: "Angļu valoda", level: "Augstākais", score: 68 },
  { subject: "Fizika", level: "Optimālais", score: 62 },
];

export const programs = [
  { name: "LU — Datorzinātnes", need: 72 },
  { name: "RTU — Inženierzinātnes", need: 65 },
  { name: "RSU — Medicīna", need: 85 },
];

export const leaderboard = [
  { name: "Elīza K.", xp: 4820, streak: 21 },
  { name: "Tu", xp: 4310, streak: 14 },
  { name: "Mārtiņš B.", xp: 4105, streak: 9 },
  { name: "Anete L.", xp: 3770, streak: 12 },
  { name: "Roberts Z.", xp: 3390, streak: 5 },
];

export const flashcards = [
  { front: "Pitagora teorēma", back: "a² + b² = c²", subject: "Matemātika" },
  { front: "Latvijas neatkarības proklamēšana", back: "1918. gada 18. novembris", subject: "Vēsture" },
  { front: "Ņūtona 2. likums", back: "F = m · a", subject: "Fizika" },
  { front: "Kvadrātvienādojuma saknes", back: "x = (−b ± √D) / 2a", subject: "Matemātika" },
  { front: "Fotosintēze", back: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", subject: "Bioloģija" },
  { front: "Baltijas ceļš", back: "1989. gada 23. augusts", subject: "Vēsture" },
];

export const weekly = [
  { day: "P", min: 45, score: 62 }, { day: "O", min: 70, score: 66 },
  { day: "T", min: 30, score: 64 }, { day: "C", min: 90, score: 71 },
  { day: "Pk", min: 55, score: 73 }, { day: "S", min: 120, score: 76 },
  { day: "Sv", min: 20, score: 75 },
];

export const weakSpots = [
  { topic: "Trigonometrija", value: 42 },
  { topic: "Komatu lietošana", value: 55 },
  { topic: "Elektrība", value: 48 },
  { topic: "Starpkaru periods", value: 63 },
  { topic: "Ģeometrija", value: 58 },
];

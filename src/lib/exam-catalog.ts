/** Central exam catalog — edit grades, subjects and levels here only. */
export const GRADES = ["9. klase", "10. klase", "11. klase", "12. klase", "Absolvents"] as const;
export type Grade = (typeof GRADES)[number];

const CE_SUBJECTS = [
  "Matemātika", "Latviešu valoda", "Angļu valoda", "Fizika", "Ķīmija", "Bioloģija",
  "Vēsture", "Sociālās zinības", "Ģeogrāfija", "Kultūra un māksla",
  "Dizains un tehnoloģijas", "Programmēšana",
];
const CE_LEVELS = ["Vispārīgais", "Optimālais", "Augstākais"];

export type GradeCatalog = { subjects: string[]; levels: string[]; label: string; studyOnly?: boolean };

export const EXAM_CATALOG: Record<Grade, GradeCatalog> = {
  "9. klase": { label: "9. klases eksāmeni", subjects: ["Matemātika", "Latviešu valoda", "Angļu valoda"], levels: ["9. klases pārbaudes darbs"] },
  "10. klase": { label: "Mācos jau tagad", subjects: CE_SUBJECTS, levels: ["Mācos jau tagad"], studyOnly: true },
  "11. klase": { label: "11. klases eksāmeni", subjects: ["Matemātika", "Latviešu valoda", "Angļu valoda", "Bioloģija"], levels: ["Optimālais"] },
  "12. klase": { label: "12. klases CE", subjects: CE_SUBJECTS, levels: CE_LEVELS },
  "Absolvents": { label: "CE absolventiem", subjects: CE_SUBJECTS, levels: CE_LEVELS },
};

export function catalogFor(grade: string | null | undefined): GradeCatalog {
  return EXAM_CATALOG[(grade as Grade)] ?? EXAM_CATALOG["12. klase"];
}

/** Next 3 exam sessions (exams are in May–June; after June the next session is next year). */
export function nextExamYears(now = new Date()): number[] {
  const start = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return [start, start + 1, start + 2];
}

/** Approximate exam start date for a subject in a given year (placeholder dates). */
export function examDate(subject: string, year: number): Date {
  const day: Record<string, string> = { "Matemātika": "05-24", "Latviešu valoda": "05-20", "Angļu valoda": "05-27" };
  return new Date(`${year}-${day[subject] ?? "06-02"}T09:00:00+03:00`);
}

/** Locative form for "Līdz CE …" text. */
export const subjectLocative = (s: string) =>
  ({ "Matemātika": "matemātikā", "Latviešu valoda": "latviešu valodā", "Angļu valoda": "angļu valodā", "Bioloģija": "bioloģijā", "Fizika": "fizikā", "Ķīmija": "ķīmijā", "Vēsture": "vēsturē", "Ģeogrāfija": "ģeogrāfijā", "Programmēšana": "programmēšanā" } as Record<string, string>)[s] ?? s;

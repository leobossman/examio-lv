/** Starter task bank. Types: mc (izvēle), short (īsā atbilde), open (2. daļa ar soļiem). */
export type Task = {
  id: string; subject: string; grades: string[]; type: "mc" | "short" | "open";
  q: string; options?: string[]; answer: string; explain: string; steps?: string[]; points?: number;
};
export const norm = (s: string) => s.trim().toLowerCase().replace(",", ".").replace(/\s+/g, " ");


// Static testimonials for the home page. Bilingual so both locales read well.
// Placeholder social proof — swap for Eri's real client reviews when available.

export type Testimonial = {
  quote_en: string;
  quote_sv: string;
  author: string;
  service_en: string;
  service_sv: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote_en:
      "The calmest hour of my month. My nails have never looked this considered.",
    quote_sv:
      "Månadens lugnaste timme. Mina naglar har aldrig sett så genomtänkta ut.",
    author: "Anna L.",
    service_en: "Gel Manicure",
    service_sv: "Gelmanikyr",
  },
  {
    quote_en:
      "Eri mapped my brows to my face — subtle, natural, exactly right.",
    quote_sv:
      "Eri formade mina bryn efter mitt ansikte — subtilt, naturligt, precis rätt.",
    author: "Maria B.",
    service_en: "Brow Lamination",
    service_sv: "Bryn-laminering",
  },
  {
    quote_en:
      "Unhurried, precise, and warm. It feels like a small ritual, not an appointment.",
    quote_sv:
      "Stressfritt, exakt och varmt. Det känns som en liten ritual, inte ett besök.",
    author: "Johanna S.",
    service_en: "Brow Tint & Shape",
    service_sv: "Brynfärg & formning",
  },
];

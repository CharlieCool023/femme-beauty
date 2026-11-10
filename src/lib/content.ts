export const SERVICE_CATEGORIES = [
  "Wig Installation",
  "Wig Making",
  "Braids",
  "Hair Care",
  "Nails",
  "Lashes",
  "Gele",
  "Makeup",
] as const;

export const CUSTOM_CATEGORIES = [
  "Wig making",
  "Wig fixing & styling",
  "Braids",
  "Lashes",
  "Nails",
  "Gele",
  "Makeup",
  "Something else",
] as const;

export const PRODUCT_CATEGORIES = ["Wigs", "Hair", "Nails", "Lashes", "Accessories"] as const;

export const CATEGORY_BLURB: Record<string, string> = {
  Wigs: "Ready-to-wear units and custom builds, made to your measurements.",
  Hair: "Raw bundles, frontals and closures for your next install.",
  Nails: "Press-on sets and pro kit, finished by hand.",
  Lashes: "Strips, clusters and adhesive for salon results at home.",
  Accessories: "The small things that hold the whole look together.",
};

export const SERVICE_BLURB: Record<string, string> = {
  "Wig Installation": "Frontals, closures and revamps — melted, plucked and styled.",
  "Wig Making": "A unit built on your measurements, not a size chart.",
  Braids: "Tension-free braids and twists, hair included.",
  "Hair Care": "Wash, treatment and styling that respects your hair.",
  Nails: "Gel, acrylic and custom press-ons with a clean finish.",
  Lashes: "Classic to volume, applied lash by lash.",
  Gele: "Hand-tied gele, finished to hold all day.",
  Makeup: "Soft glam to bridal — matched to your skin and your outfit.",
};

export type GalleryItem = { title: string; tag: string; category: string };

export const GALLERY: GalleryItem[] = [
  { title: "Bone straight, middle part", tag: "Wig install", category: "Wigs" },
  { title: "Soft body wave, glueless", tag: "Wig install", category: "Wigs" },
  { title: "Deep wave, side sweep", tag: "Custom unit", category: "Wigs" },
  { title: "Chrome French, almond", tag: "Gel manicure", category: "Nails" },
  { title: "Custom press-ons, short", tag: "Press-on set", category: "Nails" },
  { title: "Volume set, wispy", tag: "Lash extensions", category: "Lashes" },
  { title: "Hybrid set, natural", tag: "Lash extensions", category: "Lashes" },
  { title: "Knotless, waist length", tag: "Braids", category: "Braids" },
  { title: "Boho braids, soft curl", tag: "Braids", category: "Braids" },
];

export const FAQS = [
  {
    q: "Do I need an appointment?",
    a: "Yes — Femme Beauty is appointment only. Booking online takes about two minutes and gives you an instant reference. Walk-ins can't be guaranteed a slot.",
  },
  {
    q: "How does the deposit work?",
    a: "A deposit (usually 30% of the service price) secures your slot. After you book, we send the transfer details on WhatsApp; once received, your appointment is confirmed and you pay the balance in the studio.",
  },
  {
    q: "Can I move or cancel my appointment?",
    a: "Yes. Message us on WhatsApp at least 48 hours before your slot to move it once at no cost. Cancellations inside 48 hours keep the deposit, because that time can't be resold.",
  },
  {
    q: "Do you deliver products?",
    a: "Yes — nationwide across Nigeria. Lagos orders on in-stock items are dispatched same day. Made-to-order units and custom sets are quoted with a timeline before you pay.",
  },
  {
    q: "Which hair do you use?",
    a: "Raw Vietnamese and Cambodian hair for our ready-to-wear and custom units. HD lace on frontals and closures so the hairline melts properly.",
  },
  {
    q: "Can you install hair I bought elsewhere?",
    a: "Absolutely. Book a wig install or sew-in and bring your unit along — we'll assess the lace and density first and tell you honestly what finish is achievable.",
  },
];

export type Policy = {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const POLICIES: Policy[] = [
  {
    slug: "cancellation",
    title: "Booking & Cancellation Policy",
    intro:
      "Clear rules keep the calendar fair for everyone. Here's exactly how bookings, deposits and changes work at Femme Beauty.",
    updated: "November 2026",
    sections: [
      {
        heading: "Deposits",
        body: [
          "A deposit of 30% of the service price (50% for custom wig builds) is required to confirm an appointment. The deposit is deducted from your final bill.",
          "Deposits are paid by bank transfer. Your slot is held for 48 hours from the time we send payment details; after that it may be released to the waitlist.",
        ],
      },
      {
        heading: "Rescheduling",
        body: [
          "You may move an appointment once, free of charge, with at least 48 hours' notice.",
          "Changes made inside 48 hours are subject to availability and a ₦5,000 rescheduling fee.",
        ],
      },
      {
        heading: "Cancellations and no-shows",
        body: [
          "Cancel with 48 hours' notice and your deposit is refunded in full or held as credit for 90 days — your choice.",
          "Cancellations inside 48 hours, and no-shows, forfeit the deposit.",
          "If we ever need to move your appointment, you'll be offered priority rebooking or a full refund.",
        ],
      },
      {
        heading: "Late arrivals",
        body: [
          "Please arrive five minutes early. A grace period of 15 minutes applies; after that we may need to shorten the service or reschedule to protect the next client's time.",
        ],
      },
    ],
  },
  {
    slug: "delivery",
    title: "Delivery & Returns",
    intro:
      "How your wigs, hair, nails and lashes get to you — and what happens if something isn't right.",
    updated: "November 2026",
    sections: [
      {
        heading: "Lagos delivery",
        body: [
          "In-stock items ordered before 2pm are dispatched the same day. Delivery within Lagos is typically 24–48 hours, arranged by bike or courier and quoted by area.",
        ],
      },
      {
        heading: "Nationwide delivery",
        body: [
          "We ship across Nigeria through trusted courier partners. Delivery is 2–4 working days depending on your state, with tracking shared on WhatsApp.",
        ],
      },
      {
        heading: "Made-to-order items",
        body: [
          "Custom wigs and press-on sets are made after your consultation. Timelines are confirmed in writing before your deposit; typical builds take 7–14 working days.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "For hygiene reasons, hair, lashes, nails and accessories cannot be returned once opened or worn.",
          "If an item arrives damaged or differs from what you ordered, contact us within 48 hours with photos and we'll repair, replace or refund it.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Notice",
    intro:
      "We collect the minimum we need to run your appointment and your order — nothing more.",
    updated: "November 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Your name, phone number, optional email address, and any notes you add to a booking (for example cap size or a preferred style).",
          "Appointment history and payment records, so we can look after you properly and keep accurate accounts.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "To confirm, remind you about and manage appointments; to fulfil orders; and to send service updates on WhatsApp or email.",
          "We do not sell your data, and we only share it with delivery partners when an order requires it.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to see, correct or delete the personal data we hold about you at any time by messaging +234 806 389 6895 or emailing femmebeautybysyl@gmail.com.",
          "We keep booking records for as long as needed for accounting and legal obligations, then remove them.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "The public site uses only the cookies needed to remember your session and keep forms working. The admin dashboard uses a secure sign-in cookie.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    intro: "The short, readable version of the agreement between you and Femme Beauty.",
    updated: "November 2026",
    sections: [
      {
        heading: "Bookings",
        body: [
          "A booking is a request until confirmed by Femme Beauty. Confirmation happens once your deposit is received and we acknowledge it.",
          "Service prices shown online are current at the time of booking. If a service needs extra work (for example additional bundles), we'll quote and agree it with you before starting.",
        ],
      },
      {
        heading: "Products",
        body: [
          "Product shades and textures can vary slightly between batches — that's the nature of raw hair and hand-finished nails.",
          "Prices are in Nigerian Naira and may change without notice; the price at the time of your order applies.",
        ],
      },
      {
        heading: "Care and aftercare",
        body: [
          "We'll always explain how to care for your install or set. Damage caused by unapproved products, heat misuse or improper aftercare isn't covered.",
        ],
      },
      {
        heading: "Contact",
        body: [
          "Questions about these terms: +234 806 389 6895, femmebeautybysyl@gmail.com, or 16 Shiro Street, Ajib, Fadeyi, Lagos.",
        ],
      },
    ],
  },
];

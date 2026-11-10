import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)?\s*$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] ?? "").trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const prisma = new PrismaClient();

const OFFSET = 60;
const pad = (n: number) => String(n).padStart(2, "0");

function todayStr() {
  const s = new Date(Date.now() + OFFSET * 60_000);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + days);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

function toUtc(dateStr: string, minutes: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes - OFFSET));
}

type SeedService = {
  slug: string;
  name: string;
  category: string;
  description: string;
  durationMin: number;
  price: number;
  featured?: boolean;
  depositPct?: number;
};

const services: SeedService[] = [
  // Wig installation
  {
    slug: "frontal-wig-install",
    name: "Frontal Wig Install",
    category: "Wig Installation",
    description:
      "Melted HD frontal, customised to your hairline and styled to your parting. Includes glue-down, baby hairs and a finish that photographs beautifully.",
    durationMin: 120,
    price: 45000,
    featured: true,
  },
  {
    slug: "closure-sew-in",
    name: "Closure Sew-In",
    category: "Wig Installation",
    description: "A secure, flat sew-in finished with a natural-looking closure.",
    durationMin: 150,
    price: 35000,
  },
  {
    slug: "wig-revamp",
    name: "Wig Revamp & Restyle",
    category: "Wig Installation",
    description:
      "Bring your unit back to life: wash, deep condition, re-lace, pluck and restyle.",
    durationMin: 90,
    price: 18000,
    featured: true,
  },
  {
    slug: "wig-install-styling",
    name: "Wig Install + Custom Styling",
    category: "Wig Installation",
    description:
      "Frontal install with a bespoke finish — sleek, waves, or soft curls sculpted for your face shape.",
    durationMin: 150,
    price: 55000,
  },
  // Wig making
  {
    slug: "custom-wig-consultation",
    name: "Custom Wig Consultation",
    category: "Wig Making",
    description:
      "Measurements, cap construction and hair selection for a unit made exactly to you. Fee is credited to your custom order.",
    durationMin: 45,
    price: 10000,
    featured: true,
  },
  {
    slug: "custom-wig-making",
    name: "Custom Wig Making",
    category: "Wig Making",
    description:
      "Hand-made to your measurements and preferred density. Consultation fee secures your build slot; balance on collection.",
    durationMin: 60,
    price: 120000,
    depositPct: 50,
  },
  // Braids
  {
    slug: "knotless-braids",
    name: "Knotless Braids",
    category: "Braids",
    description:
      "Feather-light, tension-free braids in your choice of length and size. Hair included.",
    durationMin: 240,
    price: 38000,
    featured: true,
  },
  {
    slug: "cornrows-feed-in",
    name: "Cornrows & Feed-Ins",
    category: "Braids",
    description: "Neat, long-lasting cornrows or feed-in rows, styled to your preference.",
    durationMin: 90,
    price: 15000,
  },
  {
    slug: "passion-twists",
    name: "Passion Twists",
    category: "Braids",
    description: "Soft, bouncy twists with a natural curl at the ends.",
    durationMin: 210,
    price: 32000,
  },
  {
    slug: "boho-braids",
    name: "Boho Braids",
    category: "Braids",
    description: "Knotless braids with curly boho pieces for a fuller, softer look.",
    durationMin: 270,
    price: 45000,
  },
  // Hair care
  {
    slug: "wash-treatment-blowdry",
    name: "Wash, Treatment & Blow-Dry",
    category: "Hair Care",
    description: "Deep cleanse, steam treatment and a smooth blow-dry.",
    durationMin: 75,
    price: 15000,
  },
  {
    slug: "silk-press",
    name: "Silk Press",
    category: "Hair Care",
    description: "A sleek, swingy silk press with heat protection — no relaxer needed.",
    durationMin: 90,
    price: 20000,
  },
  {
    slug: "scalp-detox",
    name: "Scalp Detox & Treatment",
    category: "Hair Care",
    description: "Clarifying scalp treatment for build-up, flakes or a tender scalp.",
    durationMin: 60,
    price: 12000,
  },
  // Nails
  {
    slug: "gel-manicure",
    name: "Gel Manicure",
    category: "Nails",
    description:
      "Shape, cuticle care and long-wear gel colour. Chrome, French or art on request.",
    durationMin: 60,
    price: 9000,
    featured: true,
  },
  {
    slug: "acrylic-full-set",
    name: "Acrylic Full Set",
    category: "Nails",
    description: "Sculpted acrylic extensions in any shape — almond, square, coffin.",
    durationMin: 90,
    price: 18000,
  },
  {
    slug: "gel-pedicure",
    name: "Gel Pedicure",
    category: "Nails",
    description: "Full pedicure with callus care and a chip-resistant gel finish.",
    durationMin: 75,
    price: 12000,
  },
  {
    slug: "press-on-application",
    name: "Press-On Set Application",
    category: "Nails",
    description: "Your custom press-ons, fitted properly so they last weeks not days.",
    durationMin: 45,
    price: 7000,
  },
  // Lashes
  {
    slug: "classic-lash-set",
    name: "Classic Lash Set",
    category: "Lashes",
    description: "One extension per natural lash for a clean, everyday lift.",
    durationMin: 90,
    price: 15000,
  },
  {
    slug: "hybrid-lash-set",
    name: "Hybrid Lash Set",
    category: "Lashes",
    description: "Classic and volume fans mixed for texture and fullness.",
    durationMin: 105,
    price: 20000,
  },
  {
    slug: "volume-lash-set",
    name: "Volume Lash Set",
    category: "Lashes",
    description: "Handmade fans for a full, fluffy, camera-ready set.",
    durationMin: 120,
    price: 25000,
    featured: true,
  },
  {
    slug: "lash-refill",
    name: "Lash Refill (2–3 weeks)",
    category: "Lashes",
    description: "Top-up for sets done at Femme Beauty.",
    durationMin: 60,
    price: 9000,
  },
  {
    slug: "gele-tying",
    name: "Gele Tying",
    category: "Gele",
    description:
      "Hand-tied gele, steamed and pinned to hold all day. Bring your fabric or choose from ours.",
    durationMin: 45,
    price: 15000,
    featured: true,
  },
  {
    slug: "bridal-gele",
    name: "Bridal Gele & Finishing",
    category: "Gele",
    description: "A sculpted bridal gele with a touch-up kit, done on the day or ahead of time.",
    durationMin: 60,
    price: 25000,
  },
  {
    slug: "soft-glam-makeup",
    name: "Soft Glam Makeup",
    category: "Makeup",
    description: "Skin-matched base, a soft eye and a lip that lasts the day.",
    durationMin: 90,
    price: 25000,
    featured: true,
  },
  {
    slug: "bridal-makeup",
    name: "Bridal Makeup",
    category: "Makeup",
    description: "Long-wear bridal glam with lashes included and a trial option.",
    durationMin: 120,
    price: 45000,
  },
  {
    slug: "bridal-glam-package",
    name: "Bridal Glam: Makeup + Gele",
    category: "Makeup",
    description: "Makeup and gele together, timed for your ceremony and finished for photographs.",
    durationMin: 180,
    price: 70000,
  },
  {
    slug: "occasion-hair-styling",
    name: "Special Occasion Styling",
    category: "Hair Care",
    description: "A finished style for a wedding, shoot or dinner — curls, sleek or an updo.",
    durationMin: 60,
    price: 18000,
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAt?: number;
  sku: string;
  status?: string;
  variants?: { label: string; price: number }[];
  featured?: boolean;
};

const products: SeedProduct[] = [
  {
    slug: "bone-straight-frontal-wig",
    name: "Bone Straight 13x4 Frontal Wig",
    category: "Wigs",
    description:
      "Our best-selling everyday unit. Silky bone straight hair on a 13x4 HD frontal, pre-plucked with a natural hairline. 180% density, adjustable band inside.",
    price: 285000,
    compareAt: 320000,
    sku: "FB-WIG-BS13",
    status: "IN_STOCK",
    featured: true,
    variants: [
      { label: '18"', price: 265000 },
      { label: '20"', price: 285000 },
      { label: '22"', price: 305000 },
      { label: '24"', price: 335000 },
    ],
  },
  {
    slug: "body-wave-closure-wig",
    name: "Body Wave 5x5 Closure Wig",
    category: "Wigs",
    description:
      "Soft, bouncy body wave on a 5x5 transparent closure. Glueless fit with combs and an adjustable strap — ready in minutes.",
    price: 195000,
    sku: "FB-WIG-BW5",
    status: "IN_STOCK",
    featured: true,
    variants: [
      { label: '16"', price: 175000 },
      { label: '18"', price: 195000 },
      { label: '20"', price: 215000 },
    ],
  },
  {
    slug: "deep-wave-frontal-wig",
    name: "Deep Wave 13x6 Frontal Wig",
    category: "Wigs",
    description:
      "Defined deep waves with a generous 13x6 frontal for deep side partings. Made to order in your preferred length and density.",
    price: 320000,
    sku: "FB-WIG-DW13",
    status: "MADE_TO_ORDER",
    variants: [
      { label: '20"', price: 320000 },
      { label: '22"', price: 345000 },
      { label: '24"', price: 375000 },
    ],
  },
  {
    slug: "pixie-curl-bob",
    name: "Pixie Curl Bob Wig",
    category: "Wigs",
    description:
      "A short, playful curl pattern on a comfortable cap. The easiest way to switch up your look without a big chop.",
    price: 145000,
    sku: "FB-WIG-PCB",
    status: "IN_STOCK",
    variants: [
      { label: '12"', price: 145000 },
      { label: '14"', price: 160000 },
    ],
  },
  {
    slug: "burgundy-99j-wig",
    name: "99J Burgundy Coloured Wig",
    category: "Wigs",
    description:
      "Rich 99J burgundy, hand-coloured and toned. A statement unit that still reads wearable for everyday.",
    price: 210000,
    sku: "FB-WIG-99J",
    status: "SOLD_OUT",
    variants: [
      { label: '18"', price: 210000 },
      { label: '20"', price: 230000 },
    ],
  },
  {
    slug: "hd-lace-frontal-13x4",
    name: "HD Lace Frontal 13x4",
    category: "Hair",
    description:
      "Barely-there HD Swiss lace, pre-plucked and bleached knots. Matches a wide range of skin tones.",
    price: 95000,
    sku: "FB-HAIR-FR13",
    status: "IN_STOCK",
  },
  {
    slug: "raw-bone-straight-bundle",
    name: "Raw Vietnamese Bone Straight Bundle",
    category: "Hair",
    description:
      "Single-donor raw hair, full from weft to tip. Holds a press, takes colour, and lasts years with care.",
    price: 85000,
    sku: "FB-HAIR-RBS",
    status: "IN_STOCK",
    featured: true,
    variants: [
      { label: '16"', price: 75000 },
      { label: '18"', price: 85000 },
      { label: '20"', price: 95000 },
      { label: '22"', price: 105000 },
    ],
  },
  {
    slug: "hd-5x5-closure",
    name: "5x5 HD Closure",
    category: "Hair",
    description: "Melt-ready 5x5 closure with a natural scalp appearance.",
    price: 65000,
    sku: "FB-HAIR-CL5",
    status: "IN_STOCK",
  },
  {
    slug: "raw-deep-wave-bundle",
    name: "Raw Deep Wave Bundle",
    category: "Hair",
    description: "Deep, springy waves with excellent memory. Sold per bundle.",
    price: 88000,
    sku: "FB-HAIR-RDW",
    status: "IN_STOCK",
    variants: [
      { label: '18"', price: 88000 },
      { label: '20"', price: 98000 },
    ],
  },
  {
    slug: "custom-press-on-set",
    name: "Custom Press-On Nail Set",
    category: "Nails",
    description:
      "Made to your measurements in any shape, length and design. Reusable, with application kit included.",
    price: 12000,
    sku: "FB-NAIL-PO",
    status: "MADE_TO_ORDER",
    featured: true,
    variants: [
      { label: "Short", price: 10000 },
      { label: "Medium", price: 12000 },
      { label: "Long", price: 15000 },
    ],
  },
  {
    slug: "builder-gel-kit",
    name: "Builder Gel Starter Kit",
    category: "Nails",
    description:
      "Everything for a salon-level gel overlay at home: builder gel, base, top coat, lamp and tools.",
    price: 25000,
    sku: "FB-NAIL-KIT",
    status: "IN_STOCK",
  },
  {
    slug: "3d-mink-strip-lashes",
    name: "3D Mink Strip Lashes",
    category: "Lashes",
    description:
      "Reusable 3D mink lashes with a flexible band. Soft, fluffy and easy to apply.",
    price: 4500,
    sku: "FB-LASH-3D",
    status: "IN_STOCK",
    variants: [
      { label: "Natural", price: 4500 },
      { label: "Dramatic", price: 5000 },
    ],
  },
  {
    slug: "cluster-lash-tray",
    name: "Cluster Lash Tray",
    category: "Lashes",
    description:
      "Individual clusters for DIY sets at home. Mixed lengths in one tray.",
    price: 6000,
    sku: "FB-LASH-CL",
    status: "IN_STOCK",
    featured: true,
  },
  {
    slug: "pro-lash-adhesive",
    name: "Pro Lash Adhesive",
    category: "Lashes",
    description: "Salon-strength adhesive with a 48-hour hold. For professional use.",
    price: 3500,
    sku: "FB-LASH-GL",
    status: "SOLD_OUT",
  },
  {
    slug: "wig-cap-3pack",
    name: "Wig Cap (Pack of 3)",
    category: "Accessories",
    description: "Breathable stocking caps — the quiet essential under every install.",
    price: 2000,
    sku: "FB-ACC-CAP",
    status: "IN_STOCK",
  },
  {
    slug: "edge-control-kit",
    name: "Edge Control & Brush Kit",
    category: "Accessories",
    description: "Strong-hold edge control with a soft brush for a clean finish.",
    price: 4000,
    sku: "FB-ACC-EDGE",
    status: "IN_STOCK",
  },
];

const settings: Record<string, string> = {
  businessName: "Femme Beauty",
  legalName: "Femme Beauty Hairs",
  tagline: "Hair, nails & lashes — made for you.",
  phone: "+234 806 389 6895",
  phoneAlt: "+234 901 129 8219",
  whatsapp: "+2348063896895",
  email: "femmebeautybysyl@gmail.com",
  instagram: "https://www.instagram.com/femmebeauty_ng",
  instagramHandle: "@femmebeauty_ng",
  tiktok: "https://www.tiktok.com/@beautybysylvia",
  tiktokHandle: "Beauty by Sylvia",
  address: "16 Shiro Street, Ajib, Fadeyi, Lagos",
  area: "Fadeyi, Lagos",
  mapsQuery: "16 Shiro Street, Fadeyi, Lagos, Nigeria",
  depositPct: "30",
  holdMinutes: "120",
  cancellationHours: "48",
  bankName: "GTBank",
  accountName: "Femme Beauty Hairs",
  accountNumber: "0000000000",
  deliveryNote:
    "Nationwide delivery across Nigeria. Lagos same-day dispatch on in-stock items.",
  bookingNote: "Appointments only — no walk-ins. A deposit confirms your slot.",
  aboutStory:
    "Femme Beauty is a Lagos hair and beauty studio built around one idea: you should leave feeling like the best version of yourself. From custom-made wigs to nails and lashes, everything is done by hand, with your measurements, your hair, your life in mind.",
};

async function main() {
  console.log("Seeding Femme Beauty…");

  const adminEmail = process.env.ADMIN_EMAIL ?? "femmebeautybysyl@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("Set ADMIN_PASSWORD in .env before seeding (at least 8 characters).");
    process.exit(1);
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Syl",
      passwordHash: hashSync(adminPassword, 10),
      role: "OWNER",
    },
  });

  let staff = await prisma.staff.findFirst({ where: { name: "Syl" } });
  if (!staff) {
    staff = await prisma.staff.create({
      data: {
        name: "Syl",
        title: "Founder & Lead Stylist",
        bio: "Hair, nails and lashes — made by hand, for you.",
        sortOrder: 0,
      },
    });
  }

  const existingHours = await prisma.availability.count({ where: { staffId: staff.id } });
  if (existingHours === 0) {
    await prisma.availability.createMany({
      data: [1, 2, 3, 4, 5, 6].map((weekday) => ({
        staffId: staff.id,
        weekday,
        startMin: 540, // 9:00
        endMin: 1140, // 19:00
      })),
    });
  }

  for (const [index, service] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        ...service,
        featured: service.featured ?? false,
        sortOrder: index,
      },
    });
  }

  // Internal slot used by the "request something custom" flow — never listed publicly.
  const customService = await prisma.service.findUnique({ where: { slug: "custom-request" } });
  if (!customService) {
    await prisma.service.create({
      data: {
        slug: "custom-request",
        name: "Custom request",
        category: "Custom",
        description:
          "A client-described appointment. Read the brief, quote a price, then confirm.",
        durationMin: 90,
        price: 0,
        depositPct: 0,
        hidden: true,
        active: true,
        sortOrder: 999,
      },
    });
  }

  for (const [index, product] of products.entries()) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        compareAt: product.compareAt ?? null,
        sku: product.sku,
        status: product.status ?? "IN_STOCK",
        variantsJson: JSON.stringify(product.variants ?? []),
        featured: product.featured ?? false,
        sortOrder: index,
      },
    });
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "Adaeze O.",
          service: "Frontal Wig Install",
          text: "Syl melted my frontal so well people thought it was my hair. Three weeks in and it still looks fresh.",
          rating: 5,
        },
        {
          name: "Tolu B.",
          service: "Gel Manicure",
          text: "The neatest gel set I've had in Lagos. Booked on the site in two minutes and got a reminder the day before.",
          rating: 5,
        },
        {
          name: "Chiamaka E.",
          service: "Volume Lashes",
          text: "My lashes lasted through a whole holiday. Femme Beauty is the only place I trust now.",
          rating: 5,
        },
      ],
    });
  }

  if ((await prisma.appointment.count()) === 0) {
    const today = todayStr();
    const demo = [
      {
        name: "Adaeze Okafor",
        phone: "08031234567",
        email: "adaeze.okafor@example.com",
        serviceSlug: "frontal-wig-install",
        date: addDays(today, 1),
        minutes: 660,
        status: "CONFIRMED",
        depositPaid: true,
        note: "Please use a middle part, and I'd like the baby hairs soft.",
      },
      {
        name: "Tolu Bakare",
        phone: "08127654321",
        email: "tolu.bakare@example.com",
        serviceSlug: "gel-manicure",
        date: addDays(today, 2),
        minutes: 840,
        status: "AWAITING_DEPOSIT",
        depositPaid: false,
        note: "Chrome French tips, almond shape.",
      },
      {
        name: "Chiamaka Eze",
        phone: "09055551234",
        email: null,
        serviceSlug: "volume-lash-set",
        date: addDays(today, 3),
        minutes: 630,
        status: "PENDING",
        depositPaid: false,
        note: "First time getting lashes — something not too heavy.",
      },
    ];

    for (const item of demo) {
      const service = await prisma.service.findUnique({ where: { slug: item.serviceSlug } });
      if (!service) continue;
      const customer =
        (await prisma.customer.findFirst({ where: { phone: item.phone } })) ??
        (await prisma.customer.create({
          data: { name: item.name, phone: item.phone, email: item.email },
        }));
      const start = toUtc(item.date, item.minutes);
      await prisma.appointment.create({
        data: {
          reference: `FB-DEMO${Math.floor(Math.random() * 90 + 10)}`,
          customerId: customer.id,
          staffId: staff.id,
          serviceId: service.id,
          start,
          end: new Date(start.getTime() + service.durationMin * 60_000),
          status: item.status,
          price: service.price,
          depositDue: Math.round((service.price * 0.3) / 100) * 100,
          depositPaid: item.depositPaid,
          customerNote: item.note,
          source: "ADMIN",
          internalNote: "Sample booking — edit or delete anytime.",
          holdExpiresAt:
            item.status === "PENDING"
              ? new Date(Date.now() + 7 * 24 * 60 * 60_000)
              : null,
        },
      });
    }

    const boneStraight = await prisma.product.findUnique({
      where: { slug: "bone-straight-frontal-wig" },
    });
    const clusters = await prisma.product.findUnique({
      where: { slug: "cluster-lash-tray" },
    });

    if (boneStraight) {
      await prisma.orderIntent.create({
        data: {
          productId: boneStraight.id,
          productName: boneStraight.name,
          variant: '20"',
          amount: 285000,
          customerName: "Blessing A.",
          phone: "08029998877",
          note: "Asked if it can arrive before Friday.",
          status: "NEW",
        },
      });
    }
    if (clusters) {
      await prisma.orderIntent.create({
        data: {
          productId: clusters.id,
          productName: clusters.name,
          amount: 6000,
          customerName: "Ify N.",
          phone: "07033445566",
          status: "CONTACTED",
        },
      });
    }
  }

  console.log("Done. Admin login:", adminEmail);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Seed data for local development.
 *
 * ⚠️  EVERY STORE BELOW IS SYNTHETIC. The names, phone numbers and addresses are
 * invented placeholders so the UI has something realistic to render. They are
 * NOT real businesses and must never be published.
 *
 * Replace with real data via the Google Places API (facts: name, address, phone,
 * hours, geo) plus first-party photography and shop-supplied rate cards.
 *
 * The *prices* are researched market benchmarks for Delhi NCR and are broadly
 * accurate — those are worth keeping as the `Service.benchmark*` fallbacks.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot seed.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const HOURS_STANDARD = JSON.stringify({
  mon: "11:00-20:00",
  tue: "11:00-20:00",
  wed: "11:00-20:00",
  thu: "11:00-20:00",
  fri: "11:00-20:00",
  sat: "11:00-20:30",
  sun: "closed",
});

const HOURS_MARKET = JSON.stringify({
  mon: "closed",
  tue: "10:30-19:30",
  wed: "10:30-19:30",
  thu: "10:30-19:30",
  fri: "10:30-19:30",
  sat: "10:30-19:30",
  sun: "10:30-19:30",
});

const HOURS_ALLWEEK = JSON.stringify({
  mon: "10:00-20:00",
  tue: "10:00-20:00",
  wed: "10:00-20:00",
  thu: "10:00-20:00",
  fri: "10:00-20:00",
  sat: "10:00-21:00",
  sun: "11:00-19:00",
});

const CITIES = [
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    sortOrder: 0,
    blurb:
      "From Chandni Chowk's fabric lanes to South Ex's bespoke suiting, Delhi has the deepest custom clothing ecosystem in India.",
  },
  {
    slug: "gurugram",
    name: "Gurugram",
    state: "Haryana",
    lat: 28.4595,
    lng: 77.0266,
    sortOrder: 1,
    blurb:
      "Corporate suiting, quick-turnaround alterations and a fast-growing bridal boutique scene across the sectors and DLF phases.",
  },
  {
    slug: "noida",
    name: "Noida",
    state: "Uttar Pradesh",
    lat: 28.5355,
    lng: 77.391,
    sortOrder: 2,
    blurb:
      "Sector markets packed with everyday tailoring, boutique ethnic wear and value fabric shops.",
  },
];

const LOCALITIES: Record<string, { slug: string; name: string; lat?: number; lng?: number }[]> = {
  delhi: [
    { slug: "lajpat-nagar", name: "Lajpat Nagar", lat: 28.5677, lng: 77.2433 },
    { slug: "karol-bagh", name: "Karol Bagh", lat: 28.6519, lng: 77.1909 },
    { slug: "chandni-chowk", name: "Chandni Chowk", lat: 28.6506, lng: 77.2303 },
    { slug: "south-extension", name: "South Extension", lat: 28.5697, lng: 77.2223 },
    { slug: "greater-kailash", name: "Greater Kailash", lat: 28.5494, lng: 77.2425 },
    { slug: "shahpur-jat", name: "Shahpur Jat", lat: 28.5507, lng: 77.2113 },
    { slug: "rohini", name: "Rohini", lat: 28.7495, lng: 77.0565 },
    { slug: "dwarka", name: "Dwarka", lat: 28.5921, lng: 77.046 },
    { slug: "hauz-khas", name: "Hauz Khas", lat: 28.5494, lng: 77.2001 },
    { slug: "kamla-nagar", name: "Kamla Nagar", lat: 28.6814, lng: 77.2065 },
  ],
  gurugram: [
    { slug: "sector-14", name: "Sector 14", lat: 28.4664, lng: 77.0308 },
    { slug: "sushant-lok", name: "Sushant Lok", lat: 28.4663, lng: 77.0722 },
    { slug: "dlf-phase-3", name: "DLF Phase 3", lat: 28.4938, lng: 77.0926 },
  ],
  noida: [
    { slug: "sector-18", name: "Sector 18", lat: 28.5708, lng: 77.3261 },
    { slug: "sector-50", name: "Sector 50", lat: 28.5748, lng: 77.3673 },
  ],
};

/**
 * Services double as SEO landing pages and as the fallback price benchmark when
 * a shop hasn't given us their rate card yet.
 */
const SERVICES = [
  // Tailors
  { slug: "shirt-stitching", name: "Shirt Stitching", category: "tailors", benchmarkMin: 450, benchmarkMax: 900, aliases: ["shirt silai", "formal shirt"], description: "Made-to-measure formal and casual shirts stitched to your measurements." },
  { slug: "trouser-stitching", name: "Trouser Stitching", category: "tailors", benchmarkMin: 600, benchmarkMax: 1200, aliases: ["pant stitching", "formal pants"], description: "Formal trousers and chinos cut and stitched to fit." },
  { slug: "suit-stitching", name: "Suit Stitching", category: "tailors", benchmarkMin: 4500, benchmarkMax: 14000, aliases: ["coat pant", "two piece suit", "three piece suit"], description: "Two-piece and three-piece bespoke suits, canvassed or fused." },
  { slug: "blazer-stitching", name: "Blazer Stitching", category: "tailors", benchmarkMin: 3000, benchmarkMax: 6500, aliases: ["jacket stitching", "sports coat"], description: "Single and double-breasted blazers made to measure." },
  { slug: "sherwani-stitching", name: "Sherwani Stitching", category: "tailors", benchmarkMin: 6000, benchmarkMax: 18000, aliases: ["groom sherwani", "indo western"], description: "Groom and occasion sherwanis with hand embroidery options." },
  { slug: "kurta-pyjama-stitching", name: "Kurta Pyjama Stitching", category: "tailors", benchmarkMin: 900, benchmarkMax: 2000, aliases: ["kurta silai", "pathani"], description: "Everyday and occasion kurta sets." },
  { slug: "blouse-stitching", name: "Blouse Stitching", category: "tailors", benchmarkMin: 500, benchmarkMax: 2500, aliases: ["saree blouse", "designer blouse", "padded blouse"], description: "Saree blouses from simple to fully padded designer cuts." },
  { slug: "lehenga-stitching", name: "Lehenga Stitching", category: "tailors", benchmarkMin: 3500, benchmarkMax: 12000, aliases: ["lehenga silai", "ghagra"], description: "Lehenga skirt, blouse and dupatta stitching from your fabric." },
  { slug: "salwar-suit-stitching", name: "Salwar Suit Stitching", category: "tailors", benchmarkMin: 800, benchmarkMax: 1800, aliases: ["suit silai", "churidar"], description: "Salwar kameez, churidar and palazzo sets." },
  { slug: "anarkali-stitching", name: "Anarkali Stitching", category: "tailors", benchmarkMin: 1800, benchmarkMax: 4500, aliases: ["anarkali suit"], description: "Floor-length and knee-length anarkalis with flare panelling." },
  { slug: "gown-stitching", name: "Gown Stitching", category: "tailors", benchmarkMin: 2500, benchmarkMax: 6500, aliases: ["evening gown", "western gown"], description: "Evening and cocktail gowns made to measure." },
  { slug: "saree-fall-pico", name: "Saree Fall & Pico", category: "tailors", benchmarkMin: 120, benchmarkMax: 250, aliases: ["fall pico", "saree finishing"], description: "Fall stitching and pico edging for sarees." },
  { slug: "alterations", name: "Alterations", category: "tailors", benchmarkMin: 150, benchmarkMax: 600, aliases: ["fitting", "resize", "altering"], description: "Resizing, hemming, taking in and letting out." },

  // Boutiques
  { slug: "bridal-lehenga", name: "Bridal Lehenga", category: "boutiques", benchmarkMin: 60000, benchmarkMax: 300000, aliases: ["wedding lehenga", "dulhan lehenga"], description: "Custom bridal lehengas with hand embroidery." },
  { slug: "designer-lehenga", name: "Designer Lehenga", category: "boutiques", benchmarkMin: 25000, benchmarkMax: 90000, aliases: ["party lehenga", "reception lehenga"], description: "Occasion and reception lehengas from boutique labels." },
  { slug: "indo-western", name: "Indo-Western Wear", category: "boutiques", benchmarkMin: 8000, benchmarkMax: 28000, aliases: ["fusion wear", "draped gown"], description: "Fusion silhouettes blending ethnic and western cuts." },
  { slug: "party-gown", name: "Party Gown", category: "boutiques", benchmarkMin: 6000, benchmarkMax: 22000, aliases: ["cocktail gown", "evening dress"], description: "Boutique cocktail and reception gowns." },

  // Fabric
  { slug: "suiting-fabric", name: "Suiting Fabric", category: "fabric-shops", benchmarkMin: 1200, benchmarkMax: 4500, aliases: ["wool suiting", "suit cloth"], description: "Wool, wool-blend and poly-viscose suiting by the metre." },
  { slug: "shirting-fabric", name: "Shirting Fabric", category: "fabric-shops", benchmarkMin: 250, benchmarkMax: 900, aliases: ["shirt cloth", "cotton shirting"], description: "Cotton, poplin and twill shirting by the metre." },
  { slug: "silk-fabric", name: "Silk Fabric", category: "fabric-shops", benchmarkMin: 450, benchmarkMax: 15000, aliases: ["raw silk", "banarasi", "chanderi"], description: "Raw silk, banarasi, chanderi and tussar." },
  { slug: "linen-fabric", name: "Linen Fabric", category: "fabric-shops", benchmarkMin: 700, benchmarkMax: 1800, aliases: ["pure linen", "linen blend"], description: "Pure and blended linen for summer suiting and shirting." },
  { slug: "lehenga-fabric", name: "Lehenga Fabric", category: "fabric-shops", benchmarkMin: 800, benchmarkMax: 6000, aliases: ["embroidered fabric", "net fabric"], description: "Embroidered net, georgette and velvet for lehengas." },

  // Rental
  { slug: "sherwani-rental", name: "Sherwani on Rent", category: "rental-shops", benchmarkMin: 3000, benchmarkMax: 12000, aliases: ["sherwani rent", "groom wear rent"], description: "Groom and guest sherwanis on rent, typically 3-4 day hire." },
  { slug: "lehenga-rental", name: "Lehenga on Rent", category: "rental-shops", benchmarkMin: 5000, benchmarkMax: 25000, aliases: ["lehenga rent", "bridal rent"], description: "Designer and bridal lehengas on rent." },
  { slug: "gown-rental", name: "Gown on Rent", category: "rental-shops", benchmarkMin: 2500, benchmarkMax: 9000, aliases: ["gown rent", "dress rent"], description: "Evening, cocktail and pre-wedding shoot gowns." },
  { slug: "tuxedo-rental", name: "Tuxedo & Suit on Rent", category: "rental-shops", benchmarkMin: 2500, benchmarkMax: 8000, aliases: ["suit rent", "tux rent"], description: "Tuxedos, dinner jackets and formal suits on rent." },
];

type SeedPrice = {
  service?: string;
  label: string;
  min?: number;
  max?: number;
  unit?: string;
  note?: string;
  source?: "shop" | "menu" | "estimate";
};

type SeedStore = {
  slug: string;
  name: string;
  category: string;
  city: string;
  locality: string;
  about: string;
  address: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  phone: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  specialities: string[];
  materials?: string[];
  hours?: string;
  priceMin?: number;
  priceMax?: number;
  turnaroundDays?: number;
  homeVisit?: boolean;
  homeVisitFee?: number;
  rateCardVerified?: boolean;
  verified?: boolean;
  featured?: boolean;
  establishedYear?: number;
  prices: SeedPrice[];
};

const STORES: SeedStore[] = [
  // ─────────────────────────── TAILORS ───────────────────────────
  {
    slug: "raghav-bespoke-tailors-south-extension",
    name: "Raghav Bespoke Tailors",
    category: "tailors",
    city: "delhi",
    locality: "south-extension",
    about:
      "Third-generation menswear tailors working out of a first-floor workroom in South Extension II. Known for canvassed suit construction and a two-trial process on every jacket. Walk in with fabric or pick from their in-house suiting book.",
    address: "F-12, First Floor, South Extension Part II, New Delhi",
    pincode: "110049",
    lat: 28.5697,
    lng: 77.2223,
    phone: "+91 99999 00001",
    whatsapp: "+91 99999 00001",
    instagram: "https://instagram.com/example",
    specialities: ["Menswear", "Bespoke Suits", "Canvassed Construction", "Wedding Suiting"],
    materials: ["Wool", "Linen", "Cotton", "Tweed"],
    hours: HOURS_STANDARD,
    priceMin: 900,
    priceMax: 22000,
    turnaroundDays: 14,
    homeVisit: true,
    homeVisitFee: 300,
    rateCardVerified: true,
    verified: true,
    featured: true,
    establishedYear: 1978,
    prices: [
      { service: "suit-stitching", label: "Two-piece suit (canvassed)", min: 9500, max: 16000, note: "Excludes fabric. 2 trials included." },
      { service: "suit-stitching", label: "Three-piece suit", min: 12500, max: 22000, note: "Excludes fabric." },
      { service: "blazer-stitching", label: "Blazer / sports jacket", min: 6500, max: 11000 },
      { service: "trouser-stitching", label: "Formal trouser", min: 1400, max: 2200 },
      { service: "shirt-stitching", label: "Formal shirt", min: 900, max: 1500 },
      { service: "alterations", label: "Jacket alteration", min: 400, max: 1200 },
    ],
  },
  {
    slug: "sharma-tailors-lajpat-nagar",
    name: "Sharma Tailors",
    category: "tailors",
    city: "delhi",
    locality: "lajpat-nagar",
    about:
      "Busy neighbourhood tailoring shop in Central Market, Lajpat Nagar. Fast turnaround on ladies' suits, blouses and alterations. Popular for same-week blouse stitching before wedding season.",
    address: "Shop 46, Central Market, Lajpat Nagar II, New Delhi",
    pincode: "110024",
    lat: 28.5677,
    lng: 77.2433,
    phone: "+91 99999 00002",
    whatsapp: "+91 99999 00002",
    specialities: ["Ladies Tailoring", "Blouses", "Quick Turnaround", "Alterations"],
    materials: ["Cotton", "Georgette", "Silk", "Crepe"],
    hours: HOURS_MARKET,
    priceMin: 150,
    priceMax: 4500,
    turnaroundDays: 5,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    establishedYear: 1996,
    prices: [
      { service: "blouse-stitching", label: "Saree blouse (basic)", min: 550, max: 800 },
      { service: "blouse-stitching", label: "Designer padded blouse", min: 1300, max: 2400 },
      { service: "salwar-suit-stitching", label: "Salwar suit / churidar", min: 850, max: 1500 },
      { service: "anarkali-stitching", label: "Anarkali (floor length)", min: 2200, max: 4500 },
      { service: "saree-fall-pico", label: "Saree fall & pico", min: 150, max: 200 },
      { service: "alterations", label: "Basic alteration", min: 150, max: 400 },
    ],
  },
  {
    slug: "azad-tailoring-house-karol-bagh",
    name: "Azad Tailoring House",
    category: "tailors",
    city: "delhi",
    locality: "karol-bagh",
    about:
      "Karol Bagh institution specialising in groom wear. Sherwanis, bandhgalas and Indo-western sets with in-house zardozi and aari embroidery. Book 6 weeks ahead in wedding season.",
    address: "2458, Ajmal Khan Road, Karol Bagh, New Delhi",
    pincode: "110005",
    lat: 28.6519,
    lng: 77.1909,
    phone: "+91 99999 00003",
    whatsapp: "+91 99999 00003",
    specialities: ["Groom Wear", "Sherwani", "Zardozi", "Bandhgala", "Hand Embroidery"],
    materials: ["Raw Silk", "Brocade", "Velvet", "Jacquard"],
    hours: HOURS_ALLWEEK,
    priceMin: 1500,
    priceMax: 45000,
    turnaroundDays: 21,
    homeVisit: true,
    homeVisitFee: 500,
    rateCardVerified: true,
    verified: true,
    featured: true,
    establishedYear: 1985,
    prices: [
      { service: "sherwani-stitching", label: "Sherwani (stitching only)", min: 8500, max: 18000, note: "Excludes fabric and embroidery." },
      { service: "sherwani-stitching", label: "Sherwani with zardozi work", min: 22000, max: 45000, note: "Embroidery priced by design." },
      { service: "kurta-pyjama-stitching", label: "Bandhgala jacket", min: 5500, max: 9500 },
      { service: "kurta-pyjama-stitching", label: "Kurta pyjama set", min: 1500, max: 3200 },
      { service: "suit-stitching", label: "Indo-western set", min: 9000, max: 20000 },
    ],
  },
  {
    slug: "precision-fit-tailors-rohini",
    name: "Precision Fit Tailors",
    category: "tailors",
    city: "delhi",
    locality: "rohini",
    about:
      "Modern tailoring studio in Rohini Sector 7 with a digital measurement record — repeat customers can reorder without a second fitting. Offers home measurement across North and West Delhi.",
    address: "Shop 12, Sector 7 Market, Rohini, New Delhi",
    pincode: "110085",
    lat: 28.7495,
    lng: 77.0565,
    phone: "+91 99999 00004",
    whatsapp: "+91 99999 00004",
    specialities: ["Home Measurement", "Formal Wear", "Repeat Orders", "Corporate Uniforms"],
    materials: ["Poly-viscose", "Cotton", "Wool Blend"],
    hours: HOURS_STANDARD,
    priceMin: 500,
    priceMax: 12000,
    turnaroundDays: 10,
    homeVisit: true,
    homeVisitFee: 200,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "shirt-stitching", label: "Formal shirt", min: 600, max: 950 },
      { service: "trouser-stitching", label: "Formal trouser", min: 800, max: 1300 },
      { service: "suit-stitching", label: "Two-piece suit", min: 6500, max: 12000 },
      { service: "blazer-stitching", label: "Blazer", min: 4000, max: 6500 },
      { service: "alterations", label: "Alteration (per garment)", min: 200, max: 500 },
    ],
  },
  {
    slug: "the-hem-line-greater-kailash",
    name: "The Hem Line",
    category: "tailors",
    city: "delhi",
    locality: "greater-kailash",
    about:
      "Contemporary womenswear atelier in GK-1 M Block. Western silhouettes, structured gowns and workwear. Consultation-led — they will talk you out of a bad neckline.",
    address: "M-42, M Block Market, Greater Kailash I, New Delhi",
    pincode: "110048",
    lat: 28.5494,
    lng: 77.2425,
    phone: "+91 99999 00005",
    whatsapp: "+91 99999 00005",
    instagram: "https://instagram.com/example",
    specialities: ["Western Wear", "Gowns", "Workwear", "Pattern Drafting"],
    materials: ["Crepe", "Satin", "Linen", "Wool Blend"],
    hours: HOURS_STANDARD,
    priceMin: 1200,
    priceMax: 14000,
    turnaroundDays: 12,
    homeVisit: false,
    rateCardVerified: false,
    verified: true,
    prices: [
      { service: "gown-stitching", label: "Evening gown", min: 4500, max: 9500, source: "estimate", note: "Indicative — shop has not shared a rate card yet." },
      { service: "gown-stitching", label: "Cocktail dress", min: 3000, max: 6000, source: "estimate" },
      { service: "blouse-stitching", label: "Structured blouse", min: 1800, max: 3200, source: "estimate" },
    ],
  },
  {
    slug: "capital-stitch-studio-sector-14",
    name: "Capital Stitch Studio",
    category: "tailors",
    city: "gurugram",
    locality: "sector-14",
    about:
      "Corporate-focused tailoring near Sector 14 market. Bulk uniform orders, quick suit alterations and same-day hemming for the office crowd.",
    address: "SCO 22, Sector 14 Market, Gurugram, Haryana",
    pincode: "122001",
    lat: 28.4664,
    lng: 77.0308,
    phone: "+91 99999 00006",
    whatsapp: "+91 99999 00006",
    specialities: ["Corporate Uniforms", "Express Alterations", "Formal Wear"],
    materials: ["Poly-viscose", "Cotton"],
    hours: HOURS_STANDARD,
    priceMin: 200,
    priceMax: 11000,
    turnaroundDays: 7,
    homeVisit: true,
    homeVisitFee: 250,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "shirt-stitching", label: "Formal shirt", min: 700, max: 1100 },
      { service: "suit-stitching", label: "Two-piece suit", min: 7000, max: 11000 },
      { service: "alterations", label: "Same-day hemming", min: 200, max: 450, note: "Drop before 12pm." },
    ],
  },
  {
    slug: "anjali-couture-tailors-sector-18",
    name: "Anjali Couture Tailors",
    category: "tailors",
    city: "noida",
    locality: "sector-18",
    about:
      "Ladies' tailoring studio in Sector 18 focused on occasion wear — lehenga stitching, heavy blouses and festive suits. Two fittings included on all occasion orders.",
    address: "Shop 214, Second Floor, Sector 18 Market, Noida, UP",
    pincode: "201301",
    lat: 28.5708,
    lng: 77.3261,
    phone: "+91 99999 00007",
    whatsapp: "+91 99999 00007",
    specialities: ["Occasion Wear", "Lehenga Stitching", "Heavy Blouses", "Festive Suits"],
    materials: ["Georgette", "Net", "Silk", "Velvet"],
    hours: HOURS_ALLWEEK,
    priceMin: 600,
    priceMax: 15000,
    turnaroundDays: 15,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "lehenga-stitching", label: "Lehenga set (skirt + blouse + dupatta)", min: 5500, max: 13000, note: "From your fabric." },
      { service: "blouse-stitching", label: "Heavy designer blouse", min: 1800, max: 3500 },
      { service: "anarkali-stitching", label: "Anarkali", min: 2400, max: 4800 },
      { service: "salwar-suit-stitching", label: "Festive salwar suit", min: 1200, max: 2200 },
    ],
  },

  // ────────────────────────── BOUTIQUES ──────────────────────────
  {
    slug: "meher-atelier-shahpur-jat",
    name: "Meher Atelier",
    category: "boutiques",
    city: "delhi",
    locality: "shahpur-jat",
    about:
      "Bridal couture studio tucked into the Shahpur Jat lanes. Hand-embroidered lehengas built over 8–14 weeks with a dedicated design consultation. Appointment only.",
    address: "182, Shahpur Jat, New Delhi",
    pincode: "110049",
    lat: 28.5507,
    lng: 77.2113,
    phone: "+91 99999 00008",
    whatsapp: "+91 99999 00008",
    website: "https://example.com",
    instagram: "https://instagram.com/example",
    specialities: ["Bridal Couture", "Hand Embroidery", "Appointment Only", "Trousseau"],
    materials: ["Raw Silk", "Velvet", "Organza", "Tissue"],
    hours: HOURS_STANDARD,
    priceMin: 45000,
    priceMax: 350000,
    turnaroundDays: 70,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    featured: true,
    establishedYear: 2011,
    prices: [
      { service: "bridal-lehenga", label: "Bridal lehenga (hand embroidered)", min: 145000, max: 350000, note: "8–14 week lead time." },
      { service: "designer-lehenga", label: "Reception / sangeet lehenga", min: 65000, max: 140000 },
      { service: "indo-western", label: "Indo-western drape set", min: 45000, max: 85000 },
    ],
  },
  {
    slug: "saanjh-boutique-hauz-khas",
    name: "Saanjh Boutique",
    category: "boutiques",
    city: "delhi",
    locality: "hauz-khas",
    about:
      "Contemporary ethnic label in Hauz Khas Village. Ready-to-wear festive edits plus made-to-order suits and gowns. Strong on handloom and block print.",
    address: "27, Hauz Khas Village, New Delhi",
    pincode: "110016",
    lat: 28.5494,
    lng: 77.2001,
    phone: "+91 99999 00009",
    whatsapp: "+91 99999 00009",
    website: "https://example.com",
    instagram: "https://instagram.com/example",
    specialities: ["Handloom", "Block Print", "Ready to Wear", "Made to Order"],
    materials: ["Chanderi", "Cotton Silk", "Linen", "Mul"],
    hours: HOURS_ALLWEEK,
    priceMin: 3500,
    priceMax: 45000,
    turnaroundDays: 21,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "designer-lehenga", label: "Handloom lehenga set", min: 28000, max: 45000 },
      { service: "indo-western", label: "Indo-western co-ord set", min: 9500, max: 18000 },
      { service: "party-gown", label: "Occasion gown", min: 12000, max: 24000 },
    ],
  },
  {
    slug: "rangrez-studio-sushant-lok",
    name: "Rangrez Studio",
    category: "boutiques",
    city: "gurugram",
    locality: "sushant-lok",
    about:
      "Gurugram boutique known for reception gowns and cocktail wear. Offers a fitting-at-home service for orders above ₹25,000.",
    address: "C-Block Market, Sushant Lok Phase I, Gurugram, Haryana",
    pincode: "122009",
    lat: 28.4663,
    lng: 77.0722,
    phone: "+91 99999 00010",
    whatsapp: "+91 99999 00010",
    instagram: "https://instagram.com/example",
    specialities: ["Cocktail Wear", "Reception Gowns", "Home Fitting", "Pre-wedding Shoots"],
    materials: ["Satin", "Tulle", "Sequin", "Crepe"],
    hours: HOURS_STANDARD,
    priceMin: 8000,
    priceMax: 90000,
    turnaroundDays: 30,
    homeVisit: true,
    homeVisitFee: 0,
    rateCardVerified: false,
    verified: true,
    prices: [
      { service: "party-gown", label: "Reception gown", min: 18000, max: 42000, source: "estimate" },
      { service: "indo-western", label: "Cocktail indo-western", min: 14000, max: 30000, source: "estimate" },
    ],
  },
  {
    slug: "noor-couture-kamla-nagar",
    name: "Noor Couture",
    category: "boutiques",
    city: "delhi",
    locality: "kamla-nagar",
    about:
      "Value-focused boutique near North Campus serving students and young professionals. Festive ethnic sets at accessible prices with quick made-to-order turnaround.",
    address: "Shop 8, Kamla Nagar Market, New Delhi",
    pincode: "110007",
    lat: 28.6814,
    lng: 77.2065,
    phone: "+91 99999 00011",
    whatsapp: "+91 99999 00011",
    specialities: ["Budget Friendly", "Festive Wear", "Quick Turnaround", "Student Discounts"],
    materials: ["Georgette", "Cotton", "Rayon"],
    hours: HOURS_MARKET,
    priceMin: 2500,
    priceMax: 22000,
    turnaroundDays: 14,
    homeVisit: false,
    rateCardVerified: true,
    verified: false,
    prices: [
      { service: "designer-lehenga", label: "Festive lehenga set", min: 12000, max: 22000 },
      { service: "party-gown", label: "Party gown", min: 6000, max: 12000 },
      { service: "indo-western", label: "Indo-western set", min: 4500, max: 9000 },
    ],
  },

  // ───────────────────────── FABRIC SHOPS ─────────────────────────
  {
    slug: "kapoor-fabrics-chandni-chowk",
    name: "Kapoor Fabrics",
    category: "fabric-shops",
    city: "delhi",
    locality: "chandni-chowk",
    about:
      "Wholesale and retail fabric house in Katra Neel, Chandni Chowk. Deep stock of raw silk, banarasi and brocade. Bring a swatch and they will match it.",
    address: "1247, Katra Neel, Chandni Chowk, New Delhi",
    pincode: "110006",
    lat: 28.6506,
    lng: 77.2303,
    phone: "+91 99999 00012",
    whatsapp: "+91 99999 00012",
    specialities: ["Wholesale", "Raw Silk", "Banarasi", "Brocade", "Swatch Matching"],
    materials: ["Raw Silk", "Banarasi", "Brocade", "Chanderi", "Tissue"],
    hours: HOURS_MARKET,
    priceMin: 250,
    priceMax: 15000,
    turnaroundDays: 0,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    featured: true,
    establishedYear: 1962,
    prices: [
      { service: "silk-fabric", label: "Raw silk", min: 480, max: 1400, unit: "per metre" },
      { service: "silk-fabric", label: "Banarasi silk", min: 2800, max: 15000, unit: "per metre" },
      { service: "silk-fabric", label: "Chanderi", min: 650, max: 1900, unit: "per metre" },
      { service: "lehenga-fabric", label: "Embroidered net", min: 900, max: 4500, unit: "per metre" },
    ],
  },
  {
    slug: "delhi-suiting-house-karol-bagh",
    name: "Delhi Suiting House",
    category: "fabric-shops",
    city: "delhi",
    locality: "karol-bagh",
    about:
      "Suiting and shirting specialist stocking imported wool alongside domestic poly-viscose. In-house tailoring tie-up if you want fabric and stitching in one stop.",
    address: "8/14, Padam Singh Road, Karol Bagh, New Delhi",
    pincode: "110005",
    lat: 28.6519,
    lng: 77.1909,
    phone: "+91 99999 00013",
    whatsapp: "+91 99999 00013",
    specialities: ["Suiting", "Shirting", "Imported Wool", "Stitching Tie-up"],
    materials: ["Wool", "Poly-viscose", "Cotton", "Linen"],
    hours: HOURS_ALLWEEK,
    priceMin: 250,
    priceMax: 6000,
    turnaroundDays: 0,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "suiting-fabric", label: "Poly-viscose suiting", min: 550, max: 1100, unit: "per metre" },
      { service: "suiting-fabric", label: "Pure wool suiting (imported)", min: 2400, max: 6000, unit: "per metre" },
      { service: "shirting-fabric", label: "Cotton shirting", min: 280, max: 750, unit: "per metre" },
      { service: "linen-fabric", label: "Pure linen", min: 850, max: 1800, unit: "per metre" },
    ],
  },
  {
    slug: "sundar-textiles-dwarka",
    name: "Sundar Textiles",
    category: "fabric-shops",
    city: "delhi",
    locality: "dwarka",
    about:
      "Neighbourhood fabric shop in Dwarka Sector 6 covering everyday cottons, uniform material and dress fabric. Good for quick, no-fuss purchases without a Chandni Chowk trip.",
    address: "Shop 33, Sector 6 Market, Dwarka, New Delhi",
    pincode: "110075",
    lat: 28.5921,
    lng: 77.046,
    phone: "+91 99999 00014",
    whatsapp: "+91 99999 00014",
    specialities: ["Everyday Cotton", "Uniform Fabric", "Dress Material"],
    materials: ["Cotton", "Rayon", "Poly-cotton"],
    hours: HOURS_STANDARD,
    priceMin: 150,
    priceMax: 1200,
    turnaroundDays: 0,
    homeVisit: false,
    rateCardVerified: false,
    verified: false,
    prices: [
      { service: "shirting-fabric", label: "Cotton shirting", min: 250, max: 600, unit: "per metre", source: "estimate" },
      { service: "silk-fabric", label: "Art silk", min: 320, max: 700, unit: "per metre", source: "estimate" },
    ],
  },
  {
    slug: "fabindia-lane-textiles-sector-50",
    name: "Lane Textiles",
    category: "fabric-shops",
    city: "noida",
    locality: "sector-50",
    about:
      "Compact fabric store in Sector 50 with a curated handloom and linen selection. Small stock but well chosen — favoured by local boutique owners.",
    address: "Shop 4, Sector 50 Market, Noida, UP",
    pincode: "201301",
    lat: 28.5748,
    lng: 77.3673,
    phone: "+91 99999 00015",
    whatsapp: "+91 99999 00015",
    specialities: ["Handloom", "Linen", "Curated Selection"],
    materials: ["Linen", "Khadi", "Cotton Silk"],
    hours: HOURS_STANDARD,
    priceMin: 300,
    priceMax: 2200,
    turnaroundDays: 0,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "linen-fabric", label: "Pure linen", min: 900, max: 1700, unit: "per metre" },
      { service: "silk-fabric", label: "Cotton silk", min: 480, max: 1100, unit: "per metre" },
    ],
  },

  // ───────────────────────── RENTAL SHOPS ─────────────────────────
  {
    slug: "shaadi-wardrobe-rentals-lajpat-nagar",
    name: "Shaadi Wardrobe Rentals",
    category: "rental-shops",
    city: "delhi",
    locality: "lajpat-nagar",
    about:
      "Wedding wear rental with a large sherwani and lehenga range. Standard hire is 4 days including one alteration. Security deposit refundable on return.",
    address: "Shop 91, Amar Colony Market, Lajpat Nagar IV, New Delhi",
    pincode: "110024",
    lat: 28.5677,
    lng: 77.2433,
    phone: "+91 99999 00016",
    whatsapp: "+91 99999 00016",
    instagram: "https://instagram.com/example",
    specialities: ["Wedding Rentals", "Sherwani", "Lehenga", "Free Alteration"],
    materials: ["Silk", "Velvet", "Brocade"],
    hours: HOURS_ALLWEEK,
    priceMin: 2500,
    priceMax: 25000,
    turnaroundDays: 1,
    homeVisit: false,
    rateCardVerified: true,
    verified: true,
    featured: true,
    prices: [
      { service: "sherwani-rental", label: "Groom sherwani", min: 6000, max: 14000, unit: "per event", note: "4-day hire. ₹10,000 refundable deposit." },
      { service: "sherwani-rental", label: "Guest sherwani", min: 3000, max: 6000, unit: "per event" },
      { service: "lehenga-rental", label: "Bridal lehenga", min: 15000, max: 25000, unit: "per event" },
      { service: "lehenga-rental", label: "Party lehenga", min: 5500, max: 12000, unit: "per event" },
    ],
  },
  {
    slug: "the-borrowed-closet-dlf-phase-3",
    name: "The Borrowed Closet",
    category: "rental-shops",
    city: "gurugram",
    locality: "dlf-phase-3",
    about:
      "Designer rental studio in DLF Phase 3 stocking labelled gowns and cocktail wear. Try-at-home available within Gurugram for a flat fee.",
    address: "Unit 7, DLF Phase 3, Gurugram, Haryana",
    pincode: "122010",
    lat: 28.4938,
    lng: 77.0926,
    phone: "+91 99999 00017",
    whatsapp: "+91 99999 00017",
    website: "https://example.com",
    instagram: "https://instagram.com/example",
    specialities: ["Designer Labels", "Try at Home", "Cocktail Wear", "Pre-wedding Shoots"],
    materials: ["Satin", "Sequin", "Tulle"],
    hours: HOURS_STANDARD,
    priceMin: 2500,
    priceMax: 30000,
    turnaroundDays: 1,
    homeVisit: true,
    homeVisitFee: 500,
    rateCardVerified: true,
    verified: true,
    prices: [
      { service: "gown-rental", label: "Designer gown", min: 4500, max: 12000, unit: "per event", note: "3-day hire." },
      { service: "lehenga-rental", label: "Designer lehenga", min: 12000, max: 30000, unit: "per event" },
      { service: "tuxedo-rental", label: "Tuxedo", min: 4000, max: 8000, unit: "per event" },
    ],
  },
  {
    slug: "occasion-hire-rohini",
    name: "Occasion Hire",
    category: "rental-shops",
    city: "delhi",
    locality: "rohini",
    about:
      "Budget-friendly rental option in Rohini for family functions. Wide size range including plus sizes, and menswear from ₹2,500 per event.",
    address: "Shop 5, Sector 3 Market, Rohini, New Delhi",
    pincode: "110085",
    lat: 28.7495,
    lng: 77.0565,
    phone: "+91 99999 00018",
    whatsapp: "+91 99999 00018",
    specialities: ["Budget Friendly", "Plus Sizes", "Family Functions", "Menswear"],
    materials: ["Silk Blend", "Velvet"],
    hours: HOURS_ALLWEEK,
    priceMin: 1500,
    priceMax: 12000,
    turnaroundDays: 1,
    homeVisit: false,
    rateCardVerified: false,
    verified: false,
    prices: [
      { service: "sherwani-rental", label: "Sherwani", min: 2500, max: 6500, unit: "per event", source: "estimate" },
      { service: "lehenga-rental", label: "Lehenga", min: 4000, max: 10000, unit: "per event", source: "estimate" },
      { service: "tuxedo-rental", label: "Formal suit", min: 2500, max: 5000, unit: "per event", source: "estimate" },
    ],
  },
];

/** Cover images available in /public/images. Cycled per category. */
const COVER_BY_CATEGORY: Record<string, string> = {
  tailors: "/images/tailor.webp",
  boutiques: "/images/boutique.webp",
  "fabric-shops": "/images/fabric.webp",
  "rental-shops": "/images/rental.webp",
};

async function main() {
  console.log("Clearing existing data…");
  // Order matters — children first.
  await db.priceItem.deleteMany();
  await db.storeImage.deleteMany();
  await db.review.deleteMany();
  await db.claim.deleteMany();
  await db.visitBooking.deleteMany();
  await db.store.deleteMany();
  await db.service.deleteMany();
  await db.locality.deleteMany();
  await db.city.deleteMany();
  await db.storeSuggestion.deleteMany();

  console.log("Seeding cities and localities…");
  const cityIds: Record<string, string> = {};
  const localityIds: Record<string, string> = {};

  for (const c of CITIES) {
    const city = await db.city.create({
      data: {
        slug: c.slug,
        name: c.name,
        state: c.state,
        lat: c.lat,
        lng: c.lng,
        blurb: c.blurb,
        sortOrder: c.sortOrder,
      },
    });
    cityIds[c.slug] = city.id;

    for (const l of LOCALITIES[c.slug] ?? []) {
      const loc = await db.locality.create({
        data: {
          slug: l.slug,
          name: l.name,
          cityId: city.id,
          lat: l.lat,
          lng: l.lng,
        },
      });
      localityIds[`${c.slug}/${l.slug}`] = loc.id;
    }
  }

  console.log("Seeding services…");
  const serviceIds: Record<string, string> = {};
  for (const [i, s] of SERVICES.entries()) {
    const svc = await db.service.create({
      data: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        description: s.description,
        aliases: JSON.stringify(s.aliases ?? []),
        benchmarkMin: s.benchmarkMin,
        benchmarkMax: s.benchmarkMax,
        sortOrder: i,
      },
    });
    serviceIds[s.slug] = svc.id;
  }

  console.log("Seeding stores…");
  for (const s of STORES) {
    const cover = COVER_BY_CATEGORY[s.category];
    const store = await db.store.create({
      data: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        cityId: cityIds[s.city],
        localityId: localityIds[`${s.city}/${s.locality}`] ?? null,
        about: s.about,
        address: s.address,
        pincode: s.pincode,
        lat: s.lat,
        lng: s.lng,
        phone: s.phone,
        whatsapp: s.whatsapp,
        website: s.website,
        instagram: s.instagram,
        mapUrl: s.lat && s.lng ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}` : null,
        specialities: JSON.stringify(s.specialities),
        materials: JSON.stringify(s.materials ?? []),
        openingHours: s.hours ?? HOURS_STANDARD,
        priceMin: s.priceMin,
        priceMax: s.priceMax,
        turnaroundDays: s.turnaroundDays,
        homeVisit: s.homeVisit ?? false,
        homeVisitFee: s.homeVisitFee,
        rateCardVerified: s.rateCardVerified ?? false,
        verified: s.verified ?? false,
        featured: s.featured ?? false,
        establishedYear: s.establishedYear,
        coverImage: cover,
        // ratingAvg / ratingCount deliberately left null — we do not fabricate reviews.
      },
    });

    for (const [i, p] of s.prices.entries()) {
      await db.priceItem.create({
        data: {
          storeId: store.id,
          serviceId: p.service ? serviceIds[p.service] ?? null : null,
          label: p.label,
          priceMin: p.min,
          priceMax: p.max,
          unit: p.unit ?? "per piece",
          note: p.note,
          source: p.source ?? "shop",
          sortOrder: i,
        },
      });
    }

    // Gallery placeholders. Real listings need first-party photography — these
    // reuse the category art purely so layouts can be evaluated.
    const gallery = [
      { url: cover, alt: `${s.name} — shopfront`, caption: "Shopfront" },
      { url: cover, alt: `${s.name} — work sample`, caption: "Recent work" },
      { url: cover, alt: `${s.name} — inside the store`, caption: "Inside the store" },
    ];
    for (const [i, g] of gallery.entries()) {
      await db.storeImage.create({
        data: {
          storeId: store.id,
          url: g.url,
          alt: g.alt,
          caption: g.caption,
          credit: "Placeholder",
          sortOrder: i,
        },
      });
    }
  }

  const counts = {
    cities: await db.city.count(),
    localities: await db.locality.count(),
    services: await db.service.count(),
    stores: await db.store.count(),
    priceItems: await db.priceItem.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

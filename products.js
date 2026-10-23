/* =========================================================
   SHOP SETTINGS
   Day-to-day product and price changes happen in the Google Sheet
   (see productsSheet below). This file holds settings that rarely change.
   ========================================================= */

const SHOP = {
  name: "TinyBlossom",
  tagline: "Gentle things for tiny humans",

  // Currency shown before prices, e.g. "$", "£", "€"
  currency: "$",

  // Orders are sent to this WhatsApp number (country code + number, digits only).
  // US numbers start with 1. Leave "" to turn WhatsApp ordering off.
  whatsapp: "19296917782",

  // Orders can also be sent as a normal text message (SMS) to this number.
  // Leave "" to turn text ordering off.
  sms: "+19296917782",

  // Orders can also be sent by email. Leave "" to turn email ordering off.
  email: "",

  // Shown in the footer / contact section
  location: "United States",
  instagram: "",   // e.g. "https://instagram.com/tinyblossom"
  facebook: "",    // e.g. "https://facebook.com/tinyblossom"

  // Link to the Google Sheet that lists the products and prices.
  // The sheet must be shared as "Anyone with the link: Viewer".
  // If it can't be reached, the products listed at the bottom of this file are shown instead.
  productsSheet: "https://docs.google.com/spreadsheets/d/1hCV8NAPxs6GK89541TshvlNX2kjkiQ3CDqMqhBYML5k/edit",

  // Shipping and sales tax are worked out per order and texted to the customer
  // to approve before they pay. Optionally offer free shipping above an amount
  // (0 = off). Example: 75 means orders of $75+ ship free.
  freeShippingOver: 0,

  // Shown on the policies page
  returnDays: 14,
  policiesUpdated: "October 23, 2026",

  // Payment choices shown at checkout. Add, remove or rename freely.
  paymentOptions: [
    "Zelle / Venmo / Cash App (we'll text you the details)",
    "PayPal (we'll send you an invoice)",
  ],
};

/* =========================================================
   BACKUP PRODUCTS
   Shown only if the Google Sheet above is not set or can't be reached.
   - id: any unique short word (no spaces)
   - category: must match one of the CATEGORIES below
   - image: put a photo in the "images" folder and write e.g. "images/onesie.jpg".
            Leave "" to show a line drawing instead.
   - badge: optional little label like "New" or "Bestseller"
   - inStock: true or false
   ========================================================= */

const CATEGORIES = ["Clothing", "Feeding", "Bath & Care", "Sleep", "Toys"];

const PRODUCTS = [
  {
    id: "onesie-set",
    name: "Organic Cotton Onesie Set (3 pack)",
    category: "Clothing",
    price: 24.99,
    oldPrice: 29.99,
    emoji: "👕",
    color: "#FCE7DC",
    image: "",
    badge: "Bestseller",
    inStock: true,
    sizes: ["0-3m", "3-6m", "6-12m"],
    description: "Soft, breathable 100% organic cotton with snap buttons for easy changes. Gentle on sensitive skin.",
  },
  {
    id: "knit-cap",
    name: "Hand-Knit Wool Cap",
    category: "Clothing",
    price: 14.99,
    emoji: "🧢",
    color: "#E4EFE7",
    image: "",
    badge: "Handmade",
    inStock: true,
    sizes: ["0-6m", "6-12m"],
    description: "Warm, cozy and handmade. Keeps little ears snug in the cold months.",
  },
  {
    id: "socks",
    name: "Non-Slip Baby Socks (5 pairs)",
    category: "Clothing",
    price: 12.99,
    emoji: "🧦",
    color: "#E6ECF8",
    image: "",
    inStock: true,
    sizes: ["0-6m", "6-12m", "1-2y"],
    description: "Stretchy cotton socks with grippy soles for first steps.",
  },
  {
    id: "bottle",
    name: "Anti-Colic Feeding Bottle 240ml",
    category: "Feeding",
    price: 14.99,
    emoji: "🍼",
    color: "#FFF4D6",
    image: "",
    inStock: true,
    description: "BPA-free with a slow-flow nipple and anti-colic vent to reduce gas and fussiness.",
  },
  {
    id: "bib-set",
    name: "Waterproof Silicone Bibs (2 pack)",
    category: "Feeding",
    price: 12.99,
    emoji: "🥣",
    color: "#FCE7DC",
    image: "",
    badge: "New",
    inStock: true,
    description: "Wipe-clean silicone bibs with a deep pocket that catches spills.",
  },
  {
    id: "spoons",
    name: "Soft-Tip Weaning Spoons (4 pack)",
    category: "Feeding",
    price: 8.99,
    emoji: "🥄",
    color: "#E4EFE7",
    image: "",
    inStock: true,
    description: "Gentle silicone tips for baby's first foods. Dishwasher safe.",
  },
  {
    id: "towel",
    name: "Hooded Bamboo Bath Towel",
    category: "Bath & Care",
    price: 22.99,
    emoji: "🛁",
    color: "#E6ECF8",
    image: "",
    inStock: true,
    description: "Ultra-soft, super absorbent bamboo towel with a cute hood to keep baby warm after bath.",
  },
  {
    id: "lotion",
    name: "Gentle Baby Lotion 200ml",
    category: "Bath & Care",
    price: 11.99,
    emoji: "🧴",
    color: "#FFF4D6",
    image: "",
    inStock: true,
    description: "Fragrance-free, dermatologist-tested moisturiser for delicate skin.",
  },
  {
    id: "swaddle",
    name: "Muslin Swaddle Blanket",
    category: "Sleep",
    price: 18.99,
    oldPrice: 22.99,
    emoji: "🌙",
    color: "#E6ECF8",
    image: "",
    badge: "Bestseller",
    inStock: true,
    description: "Lightweight, breathable muslin. Perfect for swaddling, nursing cover or tummy time.",
  },
  {
    id: "sleeping-bag",
    name: "Cozy Sleeping Bag",
    category: "Sleep",
    price: 34.99,
    emoji: "😴",
    color: "#E4EFE7",
    image: "",
    inStock: false,
    sizes: ["0-6m", "6-18m"],
    description: "Wearable blanket that keeps baby warm all night without loose bedding.",
  },
  {
    id: "teddy",
    name: "Plush Teddy Bear",
    category: "Toys",
    price: 16.99,
    emoji: "🧸",
    color: "#FCE7DC",
    image: "",
    inStock: true,
    description: "Extra-soft, safety-stitched eyes. A first best friend.",
  },
  {
    id: "rattle",
    name: "Wooden Rattle & Teether",
    category: "Toys",
    price: 9.99,
    emoji: "🪀",
    color: "#FFF4D6",
    image: "",
    badge: "Handmade",
    inStock: true,
    description: "Natural wood with a non-toxic finish. Soothes sore gums and entertains.",
  },
];

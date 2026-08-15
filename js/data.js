/* =============================================================================
   data.js — Mock database for Northstar Retail Co.
   -----------------------------------------------------------------------------
   • Pure data layer. No DOM access here — app.js consumes these constants.
   • Order dates are generated RELATIVE to "today" so the demo never expires
     (eligibility windows, ETAs and timelines stay correct whenever it runs).
   • When adding new fixtures, keep shapes identical so app.js renderers
     don't need changes.
   ========================================================================== */

/** Returns a Date object n days in the past (keeps fixtures evergreen). */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 14, 0, 0);
  return d;
}

/** Short date formatter used inside timeline strings. */
const fmtTick = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* -----------------------------------------------------------------------------
   PRODUCTS — rendered on catalogue.html and the home "Fresh off the shelf"
   strip. `art` maps to an SVG key in app.js > ART; `tint` is the card swatch.
   --------------------------------------------------------------------------- */
const PRODUCTS = [
  { id: 'p-01', name: 'Classic Denim Jacket', category: 'Apparel',    price: 89.00,  tag: 'Bestseller', art: 'jacket',  tint: '#EDF2F8', blurb: 'Stone-washed 12 oz denim with brass hardware.' },
  { id: 'p-02', name: 'Wireless Earbuds',     category: 'Audio',      price: 59.00,  tag: 'New',        art: 'earbuds', tint: '#FAEEF0', blurb: '36-hour battery, active noise cancelling, pocket case.' },
  { id: 'p-03', name: 'Canvas Sneakers',      category: 'Footwear',   price: 49.00,  tag: '',           art: 'sneaker', tint: '#EEF3EF', blurb: 'Vulcanised sole, organic cotton upper, true to size.' },
  { id: 'p-04', name: 'Field Canvas Tote',    category: 'Accessories',price: 32.00,  tag: '',           art: 'tote',    tint: '#F4F1EA', blurb: '18 oz waxed canvas - swallows a 16" laptop whole.' },
  { id: 'p-05', name: 'Summit Steel Bottle',  category: 'Accessories',price: 24.00,  tag: '',           art: 'bottle',  tint: '#EAF2F5', blurb: '750 ml double-wall steel. Cold 24 h, hot 12 h.' },
  { id: 'p-06', name: 'Pulse Sport Watch',    category: 'Accessories',price: 119.00, tag: 'Low stock',  art: 'watch',   tint: '#F3F0F5', blurb: 'Sapphire face, 10-day battery, 5 ATM water rating.' },
];

/* -----------------------------------------------------------------------------
   ORDERS — fixtures for tracking.html & returns.html.
   stage: 1 = Order Placed · 2 = Processing · 3 = Shipped · 4 = Delivered
   --------------------------------------------------------------------------- */

          /* [[COMMENTED OUT - NOT NEEDED AFTER BACKEND]] */

   /* const ORDERS = [
  {
    id: 'NST-1001', email: 'demo@northstar.co', placed: daysAgo(8),
    stage: 3, status: 'In Transit', carrier: 'FedEx',
    eta: '2 days', lastLocation: 'Distribution Hub — Columbus, OH',
    items: [{ productId: 'p-01', qty: 1 }],
    timeline: [
      { time: fmtTick(daysAgo(8)) + ' · 9:14 AM',  label: 'Order placed',        note: 'Payment confirmed',               done: true },
      { time: fmtTick(daysAgo(7)) + ' · 2:03 PM',  label: 'Processing',          note: 'Picked & packed at Newark, DE',   done: true },
      { time: fmtTick(daysAgo(5)) + ' · 8:47 AM',  label: 'Shipped',             note: 'Handed to FedEx',                 done: true },
      { time: fmtTick(daysAgo(1)) + ' · 11:26 PM', label: 'In transit',          note: 'Scanned at Columbus hub',         done: true },
      { time: '—',                                  label: 'Out for delivery',    note: 'Pending',                         done: false },
    ],
  },
  {
    id: 'NST-1002', email: 'demo@northstar.co', placed: daysAgo(15),
    stage: 4, status: 'Delivered', carrier: 'USPS',
    eta: 'Delivered yesterday', lastLocation: 'Front porch — signed photo on file',
    items: [{ productId: 'p-02', qty: 1 }, { productId: 'p-03', qty: 1 }],
    timeline: [
      { time: fmtTick(daysAgo(15)) + ' · 10:02 AM', label: 'Order placed',     note: 'Payment confirmed',              done: true },
      { time: fmtTick(daysAgo(13)) + ' · 4:31 PM',  label: 'Shipped',          note: 'Handed to USPS',                 done: true },
      { time: fmtTick(daysAgo(4))  + ' · 7:55 AM',  label: 'In transit',       note: 'Arrived at local facility',      done: true },
      { time: fmtTick(daysAgo(1))  + ' · 1:42 PM',  label: 'Delivered',        note: 'Left at front door',             done: true },
    ],
  },
  {
    id: 'NST-1003', email: 'demo@northstar.co', placed: daysAgo(3),
    stage: 2, status: 'Processing', carrier: 'Pending assignment',
    eta: 'Ships within 24 hours', lastLocation: 'Fulfillment Center — Newark, DE',
    items: [{ productId: 'p-04', qty: 2 }],
    timeline: [
      { time: fmtTick(daysAgo(3)) + ' · 6:20 PM', label: 'Order placed', note: 'Payment confirmed',        done: true },
      { time: fmtTick(daysAgo(2)) + ' · 9:05 AM', label: 'Processing',   note: 'Waiting for pick batch',   done: true },
      { time: '—', label: 'Shipped',   note: 'Pending', done: false },
      { time: '—', label: 'Delivered', note: 'Pending', done: false },
    ],
  },
  {
    id: 'NST-1004', email: 'demo@northstar.co', placed: daysAgo(46),
    stage: 4, status: 'Delivered', carrier: 'FedEx',
    eta: 'Delivered 40 days ago', lastLocation: 'Mailroom — delivered',
    items: [{ productId: 'p-06', qty: 1 }],
    timeline: [
      { time: fmtTick(daysAgo(46)) + ' · 8:30 AM',  label: 'Order placed', note: 'Payment confirmed', done: true },
      { time: fmtTick(daysAgo(43)) + ' · 1:12 PM',  label: 'Shipped',      note: 'Handed to FedEx',   done: true },
      { time: fmtTick(daysAgo(40)) + ' · 10:18 AM', label: 'Delivered',    note: 'Signed by resident',done: true },
    ],
  },
]; */

/* -----------------------------------------------------------------------------
   RETURN_RULES — the mock rules engine consumed by returns.html.
   Add reason-specific messaging to `notesByReason` as policy evolves.
   --------------------------------------------------------------------------- */
const RETURN_RULES = {
  windowDays: 30,
  refundTime: '3–5 business days',
  condition: 'Items must be unworn, unwashed and in original packaging.',
  notesByReason: {
    'Damaged Item': 'Prepaid label included — refund expedited on scan.',
    'Wrong Size':   'Free size exchange available at the catalogue.',
    'Changed Mind': 'No restocking fee — that is not the Northstar way.',
    'Arrived Late': 'Shipping fees refunded along with the item.',
    'Other':        'Our (fictional) team reviews notes within a day.',
  },
};

/* FAQ copy shown when a tracking lookup fails (deflection instead of a ticket). */
const FAQS = [
  { q: 'Where do I find my order ID?', a: 'It is in your confirmation email, formatted like NST-1042. Receipts from pickup orders start with NST too.' },
  { q: 'Tracking has not updated in days', a: 'Carriers occasionally skip scans between hubs. If nothing moves for 3 business days, start a return or flag the order — we resolve it on the spot.' },
  { q: 'I entered the wrong address', a: 'Orders still in "Processing" can be re-routed from the checkout confirmation. Shipped packages can be redirected through the carrier using the tracking number on your label.' },
  { q: 'I still need a human', a: 'Email support@northstar.co with your order ID attached. First response lands within the hour — but 93% of requests never need it.' },
];

/* Scrolling utility-bar messages (rendered by app.js into #ticker-track). */
const TICKER = [
  'FREE SHIPPING ON ORDERS OVER $75',
  'NST-1001 DEPARTED COLUMBUS HUB — ON SCHEDULE',
  '93% OF RETURNS RESOLVED WITHOUT AN AGENT',
  'FIELD CANVAS TOTE BACK IN STOCK',
  'AVERAGE ORDER LOOKUP: 8 SECONDS',
  '30-DAY HASSLE-FREE RETURN WINDOW',
];
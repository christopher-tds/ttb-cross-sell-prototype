/* Prototype data. Everything the page shows that would come from Shopify or
   Tagalys lives here, so the markup and behavior files never hard-code products.
   Names, prices, options and photos are taken from thetiebar.com (checked Oct 26, 2026).
   Each product notes its live handle: thetiebar.com/product/<handle>. */

/* Live product photos, served by Shopify's CDN at the width asked for. */
const CDN = "https://cdn.shopify.com/s/files/1/0505/7019/9217/";
const cdn = (path, width = 600) => `${CDN}${path}${path.includes("?") ? "&" : "?"}width=${width}`;

/* ---------------------------------------------------------------------------
   IMAGE SLOTS
   Every image on the page is listed here. `src: null` draws a flat gray
   placeholder labeled with `label`. The slot's size and aspect ratio come from
   the layout, not the file, so swapping a photo never moves anything.
   --------------------------------------------------------------------------- */
window.TTB_IMAGES = {
  // PDP gallery: tie-1861-0054 (featured, two half-width, then one full)
  "gallery-1": { label: "Tie", alt: "Grosgrain Solid Burgundy Tie", src: cdn("files/PDP_tie-1861-0054_main_93b8a797-427b-451b-8b80-a54959c02223.jpg?v=1741197303", 1200) },
  "gallery-2": { label: "Tie detail", alt: "Grosgrain Solid Burgundy Tie, knotted", src: cdn("files/PDP_tie-1861-0054_1_5e8c6e7e-4584-4d95-a336-3a2130167eed.jpg?v=1741197303", 800) },
  "gallery-3": { label: "Tie fabric", alt: "Grosgrain Solid Burgundy Tie, fabric close-up", src: cdn("products/tie-1861-0054_2.jpg?v=1741197303", 800) },
  "gallery-4": { label: "Lifestyle", alt: "Grosgrain Solid Burgundy Tie, rolled", src: cdn("products/tie-1861-0054_3.jpg?v=1741197303", 1200) },

  // Cross-sell products (1:1 on tiles, 80px square in the sheet summary card)
  "dress-shirt":   { label: "Dress shirt", src: cdn("files/PDP_Q424_shr-2955-0003_main_958f2a82-ea5d-43b0-be37-0e9e3fcf8922.jpg?v=1778174899") },
  "pocket-square": { label: "Pocket square", src: cdn("products/pcs-3649-0003.jpg?v=1680901292") },
  "tie-bar":       { label: "Tie bar", src: cdn("products/C778.jpg?v=1613765878") },
  "socks":         { label: "Socks", src: cdn("files/SCK-5366-0054.jpg?v=1685456710") },
  "polo":          { label: "Polo", src: cdn("files/PDP_Q425_pol-6052-0634_main_8171dcd2-c19e-494a-99c1-dd8877e3e0b4.jpg?v=1767886520") },
  "belt":          { label: "Belt", src: cdn("files/PDP_Q124_blt-5572-0079_main.jpg?v=1711743711") },
  "sale-shirt":    { label: "Dress shirt", src: cdn("products/SHR-3972-0212_main.jpg?v=1790880577") },
  "shoelaces":     { label: "Shoelaces", src: cdn("products/SL34.jpg?v=1613768129") },
  "sweater":       { label: "Sweater", src: cdn("files/PDP_Q426_swt-6169-0592_main.jpg?v=1791299820") },
  "jacket":        { label: "Jacket", src: cdn("files/PDP_Q126_jck-5788-0606_main_029f54f0-846c-46b1-9b1b-133166e7dee7.jpg?v=1773931656") },
  "pants":         { label: "Pants", src: cdn("files/PDP_Q324_pnt-5516-0251_main.jpg?v=1722545672") },
};

/* ---------------------------------------------------------------------------
   PRODUCTS
   type     product type, shown on image placeholders
   promo    optional promo line under the name ("3 for $160")
   compareAt + percentOff  turn on sale pricing
   colors   swatches; omit for no color picker. A color with `src` and `title` swaps the
            sheet's summary photo and name when picked, and one with `price` (plus
            `compareAt`/`percentOff` when on sale) swaps the price. Colors without
            their own handle noted are stand-ins.
   options  dropdowns; `half: true` pairs two side by side, as in the frames
   sheet    opens the options sheet from the tile (dress shirts and belts). Everything
            else is quick add: the tile button adds the default size and color
            straight to the bag, and the photo and name link to the PDP.
   --------------------------------------------------------------------------- */
const SHIRT_OPTIONS = [
  { label: "Fit", half: true, values: ["Standard", "Trim"], value: "Standard" },
  { label: "Necksize", half: true, values: ["14.5", "15", "15.5", "16", "16.5", "17", "17.5", "18"], value: "15.5" },
  { label: "Sleeve Length", values: ["32/33", "34/35", "36/37"], value: "34/35" },
];
const TOP_SIZES = ["XS", "S", "M", "L", "XL"];

window.TTB_PRODUCTS = {
  "dress-shirt": { // shr-2955-0003
    type: "Dress shirt",
    sheet: true,
    name: "Pinpoint Solid - Point Collar White Non-Iron Dress Shirt",
    promo: "3 for $160",
    price: 68,
    colors: [ // shr-2955-0003, -0201: the only two live colors
      { name: "White", hex: "#ffffff", title: "Pinpoint Solid - Point Collar White Non-Iron Dress Shirt", src: cdn("files/PDP_Q424_shr-2955-0003_main_958f2a82-ea5d-43b0-be37-0e9e3fcf8922.jpg?v=1778174899") },
      { name: "Light Blue", hex: "#d6e2f3", title: "Pinpoint Solid - Point Collar Light Blue Non-Iron Dress Shirt", src: cdn("files/PDP_Q424_shr-2955-0201_main_6d.jpg?v=1776963756") },
    ],
    options: SHIRT_OPTIONS,
  },
  "pocket-square": { // pcs-3649-0003
    type: "Pocket square",
    name: "Solid White Cotton Pocket Square",
    price: 14,
  },
  "tie-bar": { // tbr-0542-0002, -0385, -0387: all three colors are live
    type: "Tie bar",
    name: "Brushed Straight Silver Tie Bar",
    price: 15,
    colors: [
      { name: "Silver", hex: "#c9cbcd", title: "Brushed Straight Silver Tie Bar", src: cdn("products/C778.jpg?v=1613765878") },
      { name: "Gun Metal", hex: "#5a5d60", title: "Brushed Straight Gun Metal Tie Bar", src: cdn("files/PDP_tbr-0542-0385_main.jpg?v=1757342246") },
      { name: "Rose Gold", hex: "#c99a86", title: "Brushed Straight Rose Gold Tie Bar", src: cdn("files/PDP_tbr-0542-0387_main_1.jpg?v=1757342341") },
    ],
  },
  "socks": { // sck-5366-0054
    type: "Socks",
    name: "Solid Pique Burgundy Dress Socks",
    price: 14,
    colors: [
      { name: "Burgundy", hex: "#5e1720" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "Charcoal", hex: "#3c3d3f" },
    ],
  },
  "polo": { // pol-6052-0634
    type: "Polo",
    name: "Heritage Tipped Chive Polo",
    promo: "3 for $150",
    price: 58,
    colors: [
      { name: "Chive", hex: "#2f5233" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "White", hex: "#ffffff" },
    ],
    options: [{ label: "Size", values: TOP_SIZES, value: "M" }],
  },
  "belt": { // blt-5572-0079
    type: "Belt",
    sheet: true, // short size sheet, per the Asana test plan
    name: "Classic Leather Chocolate Brown Belt",
    price: 38,
    options: [{ label: "Size", values: ["Small", "Medium", "Large"], value: "Medium" }],
  },
  "sale-shirt": { // shr-3972-0212, on sale on the live site
    type: "Dress shirt",
    sheet: true,
    name: "Textured Solid - Semi Spread Collar Light Pink Non-Iron Dress Shirt",
    price: 45.5,
    compareAt: 65,
    percentOff: 30,
    colors: [ // shr-3972-0212, -0003, -0201, -0197: only Light Pink is on sale
      { name: "Light Pink", hex: "#f3d9dc", price: 45.5, compareAt: 65, percentOff: 30, title: "Textured Solid - Semi Spread Collar Light Pink Non-Iron Dress Shirt", src: cdn("products/SHR-3972-0212_main.jpg?v=1790880577") },
      { name: "White", hex: "#ffffff", price: 68, title: "Textured Solid - Semi Spread Collar White Non-Iron Dress Shirt", src: cdn("files/PDP_shr-3972-0003_main.jpg?v=1778175109") },
      { name: "Light Blue", hex: "#d6e2f3", price: 68, title: "Textured Solid - Semi Spread Collar Light Blue Non-Iron Dress Shirt", src: cdn("products/shr-3972-0201_main.jpg?v=1790880986") },
      { name: "Lavender", hex: "#dcd3ea", price: 68, title: "Textured Solid - Semi Spread Collar Lavender Non-Iron Dress Shirt", src: cdn("files/shr-3972-0197_01.jpg?v=1793133672") },
    ],
    options: [SHIRT_OPTIONS[0], { ...SHIRT_OPTIONS[1], values: [...SHIRT_OPTIONS[1].values, "18.5"] }, SHIRT_OPTIONS[2]],
  },
  "shoelaces": { // shl-0815-0005
    type: "Shoelaces",
    name: "Brown Colored Shoelaces",
    price: 3,
    options: [{ label: "Size", values: ["One pair - 30 in.", "One pair - 36 in."], value: "One pair - 30 in." }],
  },
  "sweater": { // swt-6169-0592
    type: "Sweater",
    name: "The Backroom Navy Quarter Zip Sweater",
    price: 108,
    colors: [
      { name: "Navy", hex: "#1f2a44" },
      { name: "Oatmeal", hex: "#d8cbb3" },
      { name: "Charcoal", hex: "#3c3d3f" },
    ],
    options: [{ label: "Size", values: TOP_SIZES, value: "M" }],
  },
  "jacket": { // jck-5788-0606
    type: "Jacket",
    name: "The Lakeshore Linen Flax Jacket",
    price: 268,
    colors: [
      { name: "Flax", hex: "#cdb79a" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "Olive", hex: "#5b5e3c" },
    ],
    options: [
      { label: "Fit", half: true, values: ["Regular", "Long"], value: "Regular" },
      { label: "Size", half: true, values: ["36", "38", "40", "42", "44", "46"], value: "40" },
    ],
  },
  "pants": { // pnt-5516-0251
    type: "Pants",
    name: "The Lakeshore Wool Chalk Stripe Charcoal Pants",
    price: 128,
    colors: [
      { name: "Charcoal", hex: "#3c3d3f" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "Gray", hex: "#8a8d90" },
    ],
    options: [
      { label: "Waist Size", half: true, values: ["28", "30", "31", "32", "33", "34", "36", "38"], value: "31" },
      { label: "Inseam Length", half: true, values: ["30", "32", "34"], value: "32" },
    ],
  },
};

/* Product mixes for the control panel. 3-column shows the first 3, 2x2 shows 4. */
window.TTB_MIXES = {
  tie: { label: "Tie page", products: ["dress-shirt", "pocket-square", "tie-bar", "socks"] },
  mixed: { label: "Mixed", products: ["polo", "belt", "sale-shirt", "shoelaces"] },
  all: { label: "All types", products: ["sweater", "jacket", "pants"] },
};

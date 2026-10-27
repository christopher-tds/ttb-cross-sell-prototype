/* Tie Bar PDP cross-sell prototype: widget, product sheet/modal, bag count,
   and the prototype controls (state kept in the URL hash). */
(() => {
  const ICONS = window.TTB_ICONS;
  const IMAGES = window.TTB_IMAGES;
  const PRODUCTS = window.TTB_PRODUCTS;
  const MIXES = window.TTB_MIXES;

  const isEmbed = new URLSearchParams(location.search).has("embed");
  if (isEmbed) document.documentElement.classList.add("is-embed");

  const DEFAULTS = { style: "current", layout: "3col", mix: "tie", view: "desktop" };
  const ALLOWED = {
    style: ["current", "sleek"],
    layout: ["3col", "2x2"],
    mix: Object.keys(MIXES),
    view: ["desktop", "mobile"],
  };
  const mobileQuery = window.matchMedia("(max-width: 799.98px)");

  /* ------------------------------ helpers ------------------------------ */
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
  const money = (n) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function fillIcons(root = document) {
    root.querySelectorAll("[data-icon]:empty").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  }

  // One renderer for every image slot, so real images drop in via data.js only.
  function slot(key, { decorative = false } = {}) {
    const s = IMAGES[key] || { label: key };
    if (s.src) return `<div class="ph"><img src="${esc(s.src)}" alt="${decorative ? "" : esc(s.alt || s.label)}" loading="lazy"></div>`;
    return `<div class="ph" ${decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(s.alt || s.label + " image placeholder")}"`}><span>${esc(s.label)}</span></div>`;
  }

  function priceHTML(p, { withOff = false } = {}) {
    if (p.compareAt) {
      return `<p class="price"><s><span class="sr-only">Regular price: </span>${money(p.compareAt)}</s>` +
        `<span class="price__sale"><span class="sr-only">Sale price: </span>${money(p.price)}</span>` +
        (withOff && p.percentOff ? `<span class="price__off">${p.percentOff}% off</span>` : "") + `</p>`;
    }
    return `<p class="price">${money(p.price)}</p>`;
  }

  /* ------------------------------- state ------------------------------- */
  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const s = { ...DEFAULTS };
    for (const k in ALLOWED) if (ALLOWED[k].includes(params.get(k))) s[k] = params.get(k);
    return s;
  }
  function writeHash(s) {
    const h = new URLSearchParams(s).toString();
    if (location.hash.slice(1) !== h) history.replaceState(null, "", "#" + h);
  }
  let state = readHash();

  /* ------------------------------ widget ------------------------------- */
  const xs = document.getElementById("xs");
  const grid = document.getElementById("xs-grid");

  function renderWidget() {
    xs.dataset.style = state.style;
    xs.dataset.layout = state.layout;
    const count = state.layout === "2x2" ? 4 : 3;
    const ids = MIXES[state.mix].products.slice(0, count);
    grid.innerHTML = ids.map((id) => {
      const p = PRODUCTS[id];
      const quick = !p.sheet;
      const plusLabel = quick ? `Add ${p.name} to cart` : `Choose options for ${p.name}`;
      // Quick-add products link the photo and name to the PDP ("#" in the prototype); shirts open the sheet.
      const opener = (cls, html, extra = "") => quick
        ? `<a href="#" class="${cls}" data-pdp-link ${extra}>${html}</a>`
        : `<button type="button" class="${cls}" data-open ${extra}>${html}</button>`;
      return `<li>
        <article class="card" data-id="${id}">
          <div class="card__media">
            ${opener("card__link", slot(id, { decorative: true }), 'tabindex="-1" aria-hidden="true"')}
            <button type="button" class="card__plus" ${quick ? "data-quick" : "data-open"} aria-label="${esc(plusLabel)}">${icon("plus")}</button>
          </div>
          <div class="card__info">
            ${opener("card__name", esc(p.name))}
            ${p.promo ? `<p class="card__promo">${esc(p.promo)}</p>` : ""}
            ${priceHTML(p)}
          </div>
          <div class="card__foot">
            <button type="button" class="btn-outline" ${quick ? "data-quick" : "data-open"} aria-label="${esc(quick ? `Add ${p.name} to cart` : `Add to cart: choose options for ${p.name}`)}">Add to cart</button>
          </div>
        </article>
      </li>`;
    }).join("");
  }

  grid.addEventListener("click", (e) => {
    // Like the live card, the details area (name, promo, price) acts like the name.
    const btn = e.target.closest("button, a") || e.target.closest(".card__info")?.querySelector(".card__name");
    if (!btn) return;
    if (btn.hasAttribute("data-pdp-link")) { e.preventDefault(); return; } // placeholder PDP link
    const id = btn.closest(".card").dataset.id;
    if (btn.hasAttribute("data-quick")) quickAdd(btn, id);
    else if (btn.hasAttribute("data-open")) openSheet(id, btn);
  });

  // Quick add: everything except dress shirts goes straight to the bag.
  function quickAdd(btn, id) {
    if (btn.classList.contains("is-added")) return;
    addToBag(1);
    const isPlus = btn.classList.contains("card__plus");
    const before = btn.innerHTML;
    btn.classList.add("is-added");
    // In: instant, so the tap feels confirmed. Out: the check dissolves, then the default dissolves back.
    btn.innerHTML = `<span class="btn-swap">${isPlus ? icon("check") : `${icon("check")} Added`}</span>`;
    announce(`${PRODUCTS[id].name} added to cart`);
    setTimeout(() => {
      const reset = () => { btn.classList.remove("is-added"); btn.innerHTML = before; };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return reset();
      // Timers (not animation promises) drive the steps, so a background tab can't leave it stuck on the check.
      btn.firstElementChild.style.opacity = 0;
      setTimeout(() => {
        btn.classList.remove("is-added"); // background fades back on its own 200ms transition
        btn.innerHTML = `<span class="btn-swap" style="opacity:0">${before}</span>`;
        const span = btn.firstElementChild;
        span.getBoundingClientRect(); // commit opacity 0 so the fade-in runs
        span.style.opacity = 1;
        setTimeout(() => (btn.innerHTML = before), 170);
      }, 150);
    }, 2000);
  }

  /* --------------------------- sheet / modal --------------------------- */
  const sheet = document.getElementById("sheet");
  const panel = sheet.querySelector(".sheet__panel");
  const body = document.getElementById("sheet-body");
  let returnFocus = null;
  let closing = false;

  // CTA carries the line total, like the live PDP button ("Add to Cart - $3").
  const ctaHTML = (total) => `<span>Add to cart</span> <span aria-hidden="true">-</span> <span data-total>${money(Math.round(total * 100) / 100)}</span>`;

  function sheetHTML(id) {
    const p = PRODUCTS[id];
    const sel = { color: p.colors ? p.colors[0].name : null, qty: 1 };
    // Summary card links to the product's PDP (a placeholder "#" in the prototype).
    let h = `<a class="sum" href="#" data-pdp-link>
      <div class="sum__media">${slot(id, { decorative: true })}</div>
      <div class="sum__info">
        <p class="sum__name">${esc(p.name)}</p>
        ${p.promo ? `<p class="card__promo">${esc(p.promo)}</p>` : ""}
        ${priceHTML(p, { withOff: true })}
      </div>
    </a>`;

    if (p.colors) {
      h += `<fieldset class="swatch-set"><legend>Color: <b data-color-name>${esc(sel.color)}</b></legend><div class="swatches">` +
        p.colors.map((c, i) => `<label class="swatch" title="${esc(c.name)}">
          <input type="radio" name="color" value="${esc(c.name)}" ${i === 0 ? "checked" : ""} aria-label="${esc(c.name)}">
          <i style="--c:${c.hex}"></i></label>`).join("") +
        `</div></fieldset>`;
    }

    if (p.options) {
      h += `<div class="opts">` + p.options.map((o, i) => {
        const fid = `opt-${i}`;
        return `<div class="fld${o.half ? " fld--half" : ""}">
          <label class="fld__label" for="${fid}">${esc(o.label)}</label>
          <div class="select"><select id="${fid}" name="${esc(o.label)}">${o.values.map((v) =>
            `<option${v === o.value ? " selected" : ""}>${esc(v)}</option>`).join("")}</select><span data-icon="caret-down"></span></div>
        </div>`;
      }).join("") + `</div>`;
    }

    h += `<div class="buy">
      <div class="qty" role="group" aria-label="Quantity">
        <button type="button" data-qty="-1" aria-label="Decrease quantity" disabled>${icon("minus")}</button>
        <output aria-live="polite" aria-label="Quantity">1</output>
        <button type="button" data-qty="1" aria-label="Increase quantity">${icon("plus")}</button>
      </div>
      <button type="button" class="btn-primary" data-add>${ctaHTML(p.price)}</button>
    </div>`;
    return h;
  }

  function openSheet(id, trigger) {
    returnFocus = trigger;
    PRODUCTS[id].colors?.forEach((c) => c.src && (new Image().src = c.src)); // preload so swatch swaps are instant
    body.innerHTML = sheetHTML(id);
    fillIcons(body);
    sheet.dataset.id = id;
    closing = false;
    sheet.classList.remove("is-open");
    sheet.showModal();
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add("is-open")));
  }

  function closeSheet() {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.remove("is-open");
    const done = () => {
      sheet.close();
      closing = false;
      // Return focus to the tile control that opened the sheet (the card may have re-rendered).
      const target = returnFocus && document.contains(returnFocus) ? returnFocus
        : grid.querySelector(`.card[data-id="${sheet.dataset.id}"] .card__name`);
      target?.focus({ preventScroll: true });
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduce ? done() : setTimeout(done, 260);
  }

  sheet.addEventListener("cancel", (e) => { e.preventDefault(); closeSheet(); }); // Esc
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(); });

  // The picked color can carry its own name, photo and price (a sale often covers one color only).
  function selection() {
    const p = PRODUCTS[sheet.dataset.id];
    const picked = body.querySelector('input[name="color"]:checked')?.value;
    const c = p.colors?.find((x) => x.name === picked) || {};
    const price = "price" in c ? { price: c.price, compareAt: c.compareAt, percentOff: c.percentOff } : {};
    return { ...p, ...price, name: c.title || p.name, src: c.src };
  }
  const qtyNow = () => Number(body.querySelector(".qty output").textContent);
  const updateTotal = () => (body.querySelector("[data-total]").textContent = money(Math.round(selection().price * qtyNow() * 100) / 100));

  body.addEventListener("change", (e) => {
    if (e.target.name !== "color") return;
    body.querySelector("[data-color-name]").textContent = e.target.value;
    const sel = selection();
    const img = body.querySelector(".sum__media img");
    if (sel.src && img) img.src = sel.src;
    body.querySelector(".sum__name").textContent = sel.name;
    body.querySelector(".sum .price").outerHTML = priceHTML(sel, { withOff: true });
    updateTotal();
  });

  body.addEventListener("click", (e) => {
    // Placeholder PDP link: keep "#" from wiping the prototype's state in the URL.
    if (e.target.closest("[data-pdp-link]")) { e.preventDefault(); return; }
    const q = e.target.closest("[data-qty]");
    if (q) {
      const out = body.querySelector(".qty output");
      const n = Math.max(1, Number(out.textContent) + Number(q.dataset.qty));
      out.textContent = n;
      body.querySelector('[data-qty="-1"]').disabled = n <= 1;
      updateTotal();
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add && !add.classList.contains("is-added")) {
      const qty = Number(body.querySelector(".qty output").textContent);
      add.classList.add("is-added");
      add.innerHTML = `<span data-icon="check"></span> Added`;
      fillIcons(add);
      addToBag(qty);
      announce(`${qty} ${selection().name} added to cart`);
      setTimeout(closeSheet, 700);
    }
  });

  /* -------------------------------- bag -------------------------------- */
  const bagCount = document.getElementById("bag-count");
  const bagButton = document.getElementById("bag-button");
  let bag = 0;
  function addToBag(n) {
    bag += n;
    bagCount.textContent = bag;
    bagCount.hidden = bag === 0;
    bagButton.setAttribute("aria-label", `Bag, ${bag} item${bag === 1 ? "" : "s"}`);
    bagCount.classList.remove("is-bump");
    void bagCount.offsetWidth;
    bagCount.classList.add("is-bump");
  }

  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  function announce(msg) { live.textContent = ""; setTimeout(() => (live.textContent = msg), 50); }

  /* ------------------------------ gallery ------------------------------ */
  document.querySelectorAll("[data-slot]").forEach((el) => (el.innerHTML = slot(el.dataset.slot)));
  const track = document.querySelector(".gallery__track");
  const dots = document.querySelectorAll(".gallery__dots i");
  track.addEventListener("scroll", () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((d, j) => d.classList.toggle("is-on", i === j));
  }, { passive: true });

  // Buy stack color swatches (static, from the Figma frame's tie colorways)
  const TIE_COLORS = ["#8b8fc4", "#141a2b", "#16204a", "#1e7fd9", "#8ea6bf", "#2c4560", "#4c5d55", "#4f4128", "#b6d4d4", "#225a3c", "#6e7c5b", "#9aa585",
    "#77b0a6", "#2d5a2b", "#efeedd", "#d09415", "#c47a2c", "#a9752c", "#c95170", "#c35a3c", "#b98a7a", "#c94a3a", "#9a5032", "#7a3b12",
    "#7c3418", "#9a857a", "#7c3418", "#5a3a26", "#e6d2b5", "#7a5e5a", "#b39a98", "#a8473f", "#7b1428", "#4a0f18", "#7b3a3e", "#4a0f22"];
  document.getElementById("pdp-swatches").innerHTML =
    TIE_COLORS.map((c, i) => `<i style="background:${c}"${i === 33 ? ' class="is-on"' : ""}></i>`).join("");

  /* ------------------------ controls + viewport ------------------------ */
  const ctl = document.getElementById("ctl");
  const stage = document.getElementById("phone-stage");
  const frame = document.getElementById("phone-frame");

  function syncControls() {
    ctl.querySelectorAll(".ctl__seg").forEach((seg) => {
      seg.querySelectorAll("button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.value === state[seg.dataset.key])));
    });
  }

  function applyView() {
    const phone = !isEmbed && state.view === "mobile" && !mobileQuery.matches;
    document.documentElement.classList.toggle("is-phone-preview", phone);
    stage.hidden = !phone;
    fitPhone();
    if (phone) {
      const src = `index.html?embed#${new URLSearchParams({ ...state, view: "mobile" })}`;
      if (!frame.getAttribute("src")) frame.setAttribute("src", src);
      else if (frame.contentWindow) frame.contentWindow.location.hash = new URLSearchParams({ ...state, view: "mobile" }).toString();
    }
  }

  // 868 = phone body height (844 screen + 2 x 12 bezel); keep 32px of air above and below.
  function fitPhone() {
    const s = Math.min(1, (window.innerHeight - 64) / 868, (window.innerWidth - 32) / 414);
    stage.style.setProperty("--phone-scale", s.toFixed(3));
  }
  window.addEventListener("resize", fitPhone);

  function apply() {
    writeHash(state);
    syncControls();
    if (sheet.open) { sheet.close(); sheet.classList.remove("is-open"); }
    renderWidget();
    applyView();
  }

  ctl.addEventListener("click", (e) => {
    const b = e.target.closest(".ctl__seg button");
    if (b) { state = { ...state, [b.closest(".ctl__seg").dataset.key]: b.dataset.value }; apply(); return; }
    if (e.target.closest("#ctl-toggle")) {
      const collapsed = ctl.classList.toggle("is-collapsed");
      e.target.closest("#ctl-toggle").setAttribute("aria-expanded", String(!collapsed));
    }
  });

  window.addEventListener("hashchange", () => { state = readHash(); apply(); });
  mobileQuery.addEventListener("change", applyView);

  // On a real phone the open panel would cover the widget, so start collapsed there.
  if (mobileQuery.matches) {
    ctl.classList.add("is-collapsed");
    document.getElementById("ctl-toggle").setAttribute("aria-expanded", "false");
  }

  fillIcons();
  apply();

  /* --------------- live reload (local preview server only) --------------- */
  if (["localhost", "127.0.0.1"].includes(location.hostname) && !isEmbed && "EventSource" in window) {
    new EventSource("/__reload").onmessage = () => location.reload();
  }
})();

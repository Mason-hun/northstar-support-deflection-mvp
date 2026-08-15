/* =============================================================================
   app.js — Shared logic for Northstar Retail Co.
   -----------------------------------------------------------------------------
   Architecture (all vanilla ES6, no dependencies):
     Store      – cart state persisted in localStorage ('northstar_cart_v1')
     OrderDB    – read layer merging data.js fixtures with live mock orders
                  created at checkout (kept in sessionStorage so a freshly
                  placed order is genuinely trackable in the same session)
     UI         – toasts, cart badge, scroll-reveal, count-up stats
     Renderers  – product cards + inline SVG "image placeholders" (ART map)
     Pages      – one init function per page, dispatched off <body data-page>

   Convention: DOM queries go through $ / $$ helpers; all listeners are
   delegated so dynamically rendered cards behave identically.
   ========================================================================== */
(() => {
  'use strict';


          /* ((*****ADDED FOR BACKEND*****)) */

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  /* ---------- Tiny DOM helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const money = (n) => '$' + n.toFixed(2);
  const fmtFull = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysSince = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  /* ==========================================================================
     STORE — cart persistence (survives page navigation, cleared on order)
     ========================================================================== */
  const Store = {
    KEY: 'northstar_cart_v1',
    read() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
    write(items) {
      try { localStorage.setItem(this.KEY, JSON.stringify(items)); } catch { /* private-mode fallback: state lives for this page only */ }
      document.dispatchEvent(new CustomEvent('cart:change'));
    },
    add(id, qty = 1) {
      const items = this.read();
      const row = items.find(i => i.id === id);
      row ? row.qty += qty : items.push({ id, qty });
      this.write(items);
    },
    setQty(id, qty) {
      if (qty <= 0) return this.remove(id);
      const items = this.read();
      const row = items.find(i => i.id === id);
      if (row) row.qty = qty;
      this.write(items);
    },
    remove(id)    { this.write(this.read().filter(i => i.id !== id)); },
    clear()       { this.write([]); },
    count()       { return this.read().reduce((n, i) => n + i.qty, 0); },
    subtotal()    { return this.read().reduce((s, i) => { const p = PRODUCTS.find(p => p.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0); },
  };

  /* ==========================================================================
     ORDERDB — single source of truth for order lookups
     ========================================================================== */


        /* (((****ADDED FOR BACKEND****))) */    

  const OrderDB = {
  LIVE_KEY: 'northstar_live_orders',
  clean(raw) { return String(raw).replace(/#/g, '').trim(); },
  live() {
    try {
      return JSON.parse(sessionStorage.getItem(this.LIVE_KEY) || '[]')
        .map(o => ({ ...o, placed: new Date(o.placed) }));
    } catch { return []; }
  },
  addLive(order) {
    try { sessionStorage.setItem(this.LIVE_KEY, JSON.stringify([...this.live(), order])); } catch {}
  },
  async find(rawId) {
    const id = this.clean(rawId);
    if (!id) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`);
      if (!response.ok) return this.live().find(o => o.id === id) || null; // Fallback to session orders if 404
      
      const data = await response.json();
      
      // Normalize Django JSON response fields to match app.js renderer expectations
      return {
        id: data.order_id || id,
        status: data.status || 'Processing',
        stage: data.stage || (data.status === 'Shipped' ? 3 : data.status === 'Delivered' ? 4 : 2),
        carrier: data.carrier || 'Standard Carrier',
        eta: data.expected_delivery || data.eta || '3-5 business days',
        lastLocation: data.last_location || 'Fulfillment Center',
        placed: data.placed ? new Date(data.placed) : new Date(),
        timeline: data.timeline || [
          { time: 'Recent', label: 'Order Confirmed', note: 'Processed by system', done: true }
        ],
        items: data.items || []
      };
    } catch (err) {
      console.error('API Error:', err);
      return this.live().find(o => o.id === id) || null;
    }
  },
};

          /* (((***REMOVE BELOW***))) */

  /* const OrderDB = {
    LIVE_KEY: 'northstar_live_orders',
    clean(raw) { return String(raw).replace(/#/g, '').trim().toUpperCase(); },
    live() {
      try {
        return JSON.parse(sessionStorage.getItem(this.LIVE_KEY) || '[]')
          .map(o => ({ ...o, placed: new Date(o.placed) })); // revive dates
      } catch { return []; }
    },
    addLive(order) {
      try { sessionStorage.setItem(this.LIVE_KEY, JSON.stringify([...this.live(), order])); } catch {}
    },
    find(rawId) {
      const id = this.clean(rawId);
      return ORDERS.find(o => o.id === id) || this.live().find(o => o.id === id) || null;
    },
  }; */



    /* ((((INTERGRATION CHANGE for below code))))
    async find(rawId) {
  const id = this.clean(rawId);
  try {
    const res = await fetch(`/api/orders/${id}/`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
} */



    

  /* ==========================================================================
     UI — toasts, badge, reveal-on-scroll, count-up
     ========================================================================== */
  function toast(msg) {
    let root = $('#toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.setAttribute('aria-live', 'polite');
      document.body.appendChild(root);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="toast-ico">✓</span><span>${msg}</span>`;
    root.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3000);
  }

  /** Sync every header badge; pass pop=true for the bounce animation. */
  function refreshBadge(pop = false) {
    const n = Store.count();
    $$('[data-cart-count]').forEach(el => {
      el.textContent = n;
      if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    });
  }

  /* IntersectionObserver drives both .reveal fade-ins and [data-count] stats */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.hasAttribute('data-count') && !en.target.dataset.done) {
        en.target.dataset.done = '1';
        countUp(en.target);
      }
      io.unobserve(en.target);
    });
  }, { threshold: 0.18 });
  const observeReveals = (scope = document) => {
    $$('.reveal:not(.in)', scope).forEach(el => io.observe(el));
    $$('[data-count]:not([data-done])', scope).forEach(el => io.observe(el));
  };

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
    const t0 = performance.now(), dur = 1100;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ==========================================================================
     RENDERERS — product art + card templates
     ========================================================================== */
  const S = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  const ART = { // Inline SVG placeholders — swap for real photography later
    jacket:  `<svg viewBox="0 0 120 120" ${S}><path d="M44 26 60 20l16 6 18 11-9 18-8-5v46H39V50l-8 5-9-18z"/><path d="M60 34v62M52 34l8-10 8 10"/><path stroke="#A81D34" d="M54 62h5M61 62h5M54 74h5M61 74h5"/></svg>`,
    earbuds: `<svg viewBox="0 0 120 120" ${S}><circle cx="45" cy="42" r="13"/><rect x="39" y="55" width="12" height="27" rx="6"/><circle cx="80" cy="52" r="13"/><rect x="74" y="65" width="12" height="27" rx="6"/><path stroke="#A81D34" d="M30 100h60"/></svg>`,
    sneaker: `<svg viewBox="0 0 120 120" ${S}><path d="M16 78c0-9 7-13 15-15l14-4c7-2 11-7 13-12l7 5c4 9 14 15 24 17 9 2 15 6 15 12v5H16z"/><path d="M16 86h88"/><path stroke="#A81D34" d="m52 52 9 8m-1-14 9 8"/></svg>`,
    tote:    `<svg viewBox="0 0 120 120" ${S}><path d="M32 44h56l-5 48H37z"/><path d="M48 44v-7a12 12 0 0 1 24 0v7"/><circle cx="60" cy="68" r="3.5" fill="#A81D34" stroke="none"/></svg>`,
    bottle:  `<svg viewBox="0 0 120 120" ${S}><rect x="46" y="34" width="28" height="62" rx="13"/><rect x="50" y="18" width="20" height="10" rx="3"/><path d="M52 34v-6h16v6"/><path stroke="#A81D34" d="M46 62h28"/></svg>`,
    watch:   `<svg viewBox="0 0 120 120" ${S}><circle cx="60" cy="60" r="21"/><path d="M60 50v10l7 5"/><path d="m49 40 2-16h18l2 16m-22 40 2 16h18l2-16"/><rect x="81" y="55" width="6" height="10" rx="2" stroke="#A81D34"/></svg>`,
  };

  function productCard(p) {
    return `
    <article class="card product-card reveal" data-cat="${p.category}">
      <div class="art" style="background:${p.tint}">
        ${ART[p.art] || ''}
        ${p.tag ? `<span class="art-tag">${p.tag}</span>` : ''}
      </div>
      <div class="p-body">
        <div class="p-top"><span class="p-cat">${p.category}</span><span class="p-price">${money(p.price)}</span></div>
        <h3 class="p-name">${p.name}</h3>
        <p class="p-blurb">${p.blurb}</p>
        <button class="btn btn-outline btn-sm btn-add" data-add="${p.id}">Add to Cart</button>
      </div>
    </article>`;
  }

  /* ==========================================================================
     GLOBAL — header, nav, ticker, badge, footer plumbing
     ========================================================================== */
  function initGlobal() {
    // Header shadow on scroll
    const head = $('#site-head');
    addEventListener('scroll', () => head && head.classList.toggle('scrolled', scrollY > 6), { passive: true });

    // Mobile nav drawer
    const toggle = $('#nav-toggle');
    toggle?.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.site-nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

    // Ticker: two identical groups so the -50% translate loops seamlessly
    const track = $('#ticker-track');
    if (track) {
      const group = `<div class="tick-group">${TICKER.map(t => `<span>${t}</span>`).join('<span class="tick-sep">✦</span>')}<span class="tick-sep">✦</span></div>`;
      track.innerHTML = group + group;
    }

    // Footer year + mock newsletter
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    $('#news-form')?.addEventListener('submit', e => {
      e.preventDefault();
      toast("You're on the list — welcome to the North.");
      e.target.reset();
    });

    refreshBadge();
    observeReveals();
  }

  /* Delegated Add-to-Cart (works for server-rendered AND JS-rendered cards) */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    Store.add(btn.dataset.add);
    const p = PRODUCTS.find(x => x.id === btn.dataset.add);
    toast(`${p.name} added to cart`);
    btn.classList.add('added');
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'Add to Cart'; }, 1400);
  });
  document.addEventListener('cart:change', () => refreshBadge(true));

  /* ==========================================================================
     PAGE: HOME — stats are observed via [data-count]; hero is CSS-animated
     ========================================================================== */
  function initHome() {
    const picks = $('#home-picks');
    if (picks) { picks.innerHTML = PRODUCTS.slice(0, 3).map(productCard).join(''); observeReveals(picks); }
  }

  /* ==========================================================================
     PAGE: CATALOGUE — category chips + price sort, client-side only
     ========================================================================== */
  function initCatalogue() {
    const grid = $('#product-grid');
    if (!grid) return;
    let cat = 'All', sort = 'featured';

    function paint() {
      let list = PRODUCTS.filter(p => cat === 'All' || p.category === cat);
      if (sort === 'asc')  list = [...list].sort((a, b) => a.price - b.price);
      if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
      grid.innerHTML = list.map(productCard).join('');
      $('#p-count').textContent = `${list.length} item${list.length !== 1 ? 's' : ''}`;
      observeReveals(grid);
    }
    $$('.chip[data-cat]').forEach(c => c.addEventListener('click', () => {
      cat = c.dataset.cat;
      $$('.chip[data-cat]').forEach(x => x.classList.toggle('active', x === c));
      paint();
    }));
    $('#sort-select')?.addEventListener('change', e => { sort = e.target.value; paint(); });
    paint();
  }

  /* ==========================================================================
     PAGE: CHECKOUT — live summary, qty steppers, mock order generation
     ========================================================================== */
  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    let justOrdered = false;
    const SHIP_FEE = 6.95, FREE_SHIP_AT = 75;

    function renderSummary() {
      const box = $('#summary-items');
      const items = Store.read();

      if (!items.length) {
        box.innerHTML = justOrdered
          ? `<div class="sum-empty">✓ Order placed — summary cleared.</div>`
          : `<div class="sum-empty">Your cart is empty.
               <a class="btn btn-outline btn-sm" href="catalogue.html">Browse the catalogue</a>
               <button class="link-arrow" id="load-sample" type="button">Load a sample cart <span>→</span></button>
             </div>`;
        $('#load-sample')?.addEventListener('click', () => {
          Store.add('p-01'); Store.add('p-02'); Store.add('p-05');
          toast('Sample cart loaded');
        });
      } else {
        box.innerHTML = items.map(({ id, qty }) => {
          const p = PRODUCTS.find(x => x.id === id);
          return `
          <div class="sum-row">
            <div class="sum-thumb" style="background:${p.tint}">${ART[p.art]}</div>
            <div class="sum-info"><b>${p.name}</b><span class="mono">${money(p.price)} each</span></div>
            <div class="qty-ctl">
              <button type="button" data-step="-1" data-id="${id}" aria-label="Decrease">−</button>
              <span>${qty}</span>
              <button type="button" data-step="1" data-id="${id}" aria-label="Increase">+</button>
            </div>
            <button type="button" class="sum-del" data-del="${id}" aria-label="Remove">×</button>
          </div>`;
        }).join('');
      }

      const sub = Store.subtotal();
      const ship = sub === 0 || sub >= FREE_SHIP_AT ? 0 : SHIP_FEE;
      $('#sum-sub').textContent = money(sub);
      $('#sum-ship').textContent = ship === 0 ? (sub ? 'FREE' : '—') : money(ship);
      $('#sum-total').textContent = money(sub + ship);
    }

    // Delegated qty / remove / sample controls inside the aside
    $('#summary-items').addEventListener('click', e => {
      const step = e.target.closest('[data-step]');
      const del  = e.target.closest('[data-del]');
      if (step) {
        const row = Store.read().find(i => i.id === step.dataset.id);
        if (row) Store.setQty(step.dataset.id, row.qty + Number(step.dataset.step));
      }
      if (del) Store.remove(del.dataset.del);
    });
    document.addEventListener('cart:change', renderSummary);
    renderSummary();

    // Submit → mint a unique mock order ID and persist it for tracking.html
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!Store.read().length) { toast('Your cart is empty — add an item first'); return; }

      let id;
      do { id = 'NST-' + (9000 + Math.floor(Math.random() * 999)); } while (OrderDB.find(id));



        /* ((((BACKEND INTEGRATION))))
        const res = await fetch('/api/orders/create/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: Store.read(),
    // Add form address / email inputs here
  })
});
const newOrder = await res.json();
const id = newOrder.id; // Real DB Order ID */




      OrderDB.addLive({
        id, placed: new Date(), stage: 1,
        status: 'Order Placed', carrier: 'Pending assignment',
        eta: 'Ships within 24 hours', lastLocation: 'Fulfillment Center — Newark, DE',
        items: Store.read(),
        timeline: [{ time: 'Just now', label: 'Order placed', note: 'Payment confirmed (mock)', done: true }],
      });

      Store.clear();
      justOrdered = true;
      renderSummary();

      // Swap form for the success panel
      $('#checkout-form-card').hidden = true;
      const panel = $('#order-success');
      panel.hidden = false;
      $('#success-id').textContent = '#' + id;
      $('#track-link').setAttribute('href', `tracking.html?id=${id}`);
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Order placed — no real charge, promise');
    });

    // Copy order ID to clipboard
    $('#copy-id')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#success-id').textContent.replace('#', '')); toast('Order ID copied'); }
      catch { toast('Copy failed — select it manually'); }
    });
  }

  /* ==========================================================================
     PAGE: TRACKING — lookup, 4-stage tracker, timeline, deflection FAQs
     ========================================================================== */
  function initTracking() {
    const form = $('#track-form');
    if (!form) return;
    const result = $('#track-result');
    const STAGES = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

    // Deep-link support: checkout.html?id=NST-1234 prefills the lookup
    const qp = new URLSearchParams(location.search).get('id');
    if (qp) { $('#track-id').value = qp; $('#track-email').value = 'demo@northstar.co'; }

    // One-click demo IDs
    $$('.try-id').forEach(chip => chip.addEventListener('click', () => {
      $('#track-id').value = chip.dataset.id;
      $('#track-email').value = 'demo@northstar.co';
      form.requestSubmit();
    }));

    function renderStatus(order) {
      const chip = order.stage === 4 ? 'chip-ok' : order.stage === 1 ? 'chip-idle' : 'chip-move';
      const pct = ((order.stage - 1) / (STAGES.length - 1)) * 100;

      result.innerHTML = `
      <div class="track-result card">
        <div class="tr-head">
          <div><span class="eyebrow">Order</span><h2>#${order.id}</h2></div>
          <span class="status-chip ${chip}">${order.status}</span>
        </div>
        <dl class="tr-grid">
          <div><dt>Carrier</dt><dd>${order.carrier}</dd></div>
          <div><dt>Estimated delivery</dt><dd>${order.eta}</dd></div>
          <div><dt>Last location</dt><dd>${order.lastLocation}</dd></div>
          <div><dt>Placed</dt><dd>${fmtFull(order.placed)}</dd></div>
        </dl>
        <div class="tracker" aria-label="Shipment progress: stage ${order.stage} of 4">
          <span class="fill" id="track-fill"></span>
          ${STAGES.map((s, i) => {
            const n = i + 1;
            const cls = n < order.stage ? 'done' : n === order.stage ? (order.stage === 4 ? 'done' : 'current') : '';
            return `<div class="tstep ${cls}">
              <span class="tdot">${n < order.stage || order.stage === 4 ? '✓' : n}</span>
              <span class="tlabel">${s}</span>
            </div>`;
          }).join('')}
        </div>
        <ol class="timeline">
          ${order.timeline.map(t => `
            <li class="tl-item ${t.done ? 'done' : ''}">
              <time>${t.time}</time><b>${t.label}</b><p>${t.note}</p>
            </li>`).join('')}
        </ol>
      </div>`;

      // Animate the connector line after paint
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $('#track-fill').style.width = `calc((100% - 60px) * ${pct / 100})`;
      }));
    }

    function renderUnknown(rawId) {
      result.innerHTML = `
      <div class="track-result">
        <div class="banner error shake">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A81D34" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.34c-.7.28-.9.8-.9 1.66M12 17h.01"/></svg>
          <div>
            <h3>We couldn't find order “${rawId || '—'}”</h3>
            <p>Double-check the confirmation email — IDs look like <b class="mono">NST-1042</b>. Before you reach out, one of these usually fixes it:</p>
          </div>
        </div>
        <div class="faq-list">
          ${FAQS.map(f => `<details class="faq"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}
        </div>
      </div>`;
    }


    
    /* ((((BACKEND INTERGRATION)))) */

    form.addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('#track-id').value;

  // Render a quick loading state for smooth UX
  result.innerHTML = `<div class="card p-body"><p>Searching for order #${id}...</p></div>`;

  const order = await OrderDB.find(id);
  order ? renderStatus(order) : renderUnknown(id.trim());
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

        /* (***remove below one****) */


    /* form.addEventListener('submit', e => {
      e.preventDefault();
      const id = $('#track-id').value;
      const order = OrderDB.find(id);
      order ? renderStatus(order) : renderUnknown(id.trim());
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }); */

    if (qp) form.requestSubmit(); // auto-run when arriving from checkout
  }

  /* ==========================================================================
     PAGE: RETURNS — 3-step wizard + eligibility rules engine + label output
     ========================================================================== */
  function initReturns() {
    const form = $('#return-step1');
    if (!form) return;
    const state = { order: null, reason: '' };
    let timers = [];

    function gotoStep(n) {
      $$('.wz-panel').forEach(p => p.hidden = Number(p.dataset.step) !== n);
      $$('.wstep').forEach(w => {
        const s = Number(w.dataset.ws);
        w.classList.toggle('active', s === n);
        w.classList.toggle('done', s < n);
      });
    }



          /* ((((BACKEND INTEGRATION)))) */

  form.addEventListener('submit', async e => {
  e.preventDefault();
  const orderId = $('#ret-order').value;
  const err = $('#ret-error');

  const order = await OrderDB.find(orderId);
  if (!order) {
    err.hidden = false;
    err.classList.remove('shake'); void err.offsetWidth; err.classList.add('shake');
    return;
  }

  err.hidden = true;
  state.order = order;
  state.reason = $('#ret-reason').value;

  // Format purchase date as YYYY-MM-DD for backend parameter
  const purchaseDate = new Date(order.placed).toISOString().split('T')[0];
  const category = 'clothing'; // Default category endpoint, e.g., clothing/electronics/furniture

  try {
    const res = await fetch(`${API_BASE_URL}/returns/${category}/check?purchase_date=${purchaseDate}`);
    if (res.ok) {
      const checkResult = await res.json();
      state.isEligible = checkResult.is_eligible ?? checkResult.eligible;
    }
  } catch (apiErr) {
    console.warn('Backend return check failed, using local rule fallback:', apiErr);
  }

  gotoStep(2);
  runChecks();
});


        /* ((**remove below one**)) */




    /* Step 1 → validate order exists, then run the animated eligibility check */
    /* form.addEventListener('submit', e => {
      e.preventDefault();
      const order = OrderDB.find($('#ret-order').value);
      const err = $('#ret-error');
      if (!order) {
        err.hidden = false;
        err.classList.remove('shake'); void err.offsetWidth; err.classList.add('shake');
        return;
      }
      err.hidden = true;
      state.order = order;
      state.reason = $('#ret-reason').value;
      gotoStep(2);
      runChecks();
    }); */

    function runChecks() {
      const age = daysSince(state.order.placed);
      const eligible = age <= RETURN_RULES.windowDays;
      const rows = [
        { label: `Order #${state.order.id} located in our records`, ok: true },
        { label: `Placed ${fmtFull(state.order.placed)} — ${age} day${age === 1 ? '' : 's'} old (window: ${RETURN_RULES.windowDays} days)`, ok: eligible },
        { label: `Return reason logged: “${state.reason}”`, ok: true },
      ];
      const list = $('#check-list');
      list.innerHTML = rows.map(r => `<li><span class="ck-ico"><i class="spinner"></i></span><span>${r.label}</span></li>`).join('');

      timers.forEach(clearTimeout); timers = [];
      $$('#check-list li').forEach((li, i) => {
        timers.push(setTimeout(() => li.classList.add('show'), i * 620));
        timers.push(setTimeout(() => {
          li.classList.add(rows[i].ok ? 'ok' : 'fail');
          li.querySelector('.ck-ico').textContent = rows[i].ok ? '✓' : '✕';
        }, i * 620 + 480));
      });
      timers.push(setTimeout(() => { gotoStep(3); renderOutcome(eligible, age); }, rows.length * 620 + 900));
    }

    /* Step 3 — eligible: label + refund estimate · ineligible: policy deflection */
    function renderOutcome(eligible, age) {
      const out = $('#step3-outcome');
      const o = state.order;

      if (!eligible) {
        const windowEnd = new Date(new Date(o.placed).getTime() + RETURN_RULES.windowDays * 86400000);
        out.innerHTML = `
          <div class="banner error"><div>
            <h3>This order is outside the ${RETURN_RULES.windowDays}-day return window</h3>
            <p>#${o.id} was placed <b>${age} days ago</b>. The window closed on <b>${fmtFull(windowEnd)}</b>, so our system can't issue a label automatically — no agent override exists, which keeps prices low for everyone.</p>
          </div></div>
          <div class="ineligible-panel">
            <h3>Still have options, though:</h3>
            <ul>
              <li><b>Exchange instead</b> — exchanges are accepted past the window at <a class="link-arrow" href="catalogue.html">the catalogue <span>→</span></a></li>
              <li><b>Manufacturer warranty</b> — defects after 30 days route to the maker, and we'll forward your file.</li>
              <li><b>Gift-card credit</b> — items in sellable condition can earn a +10% store credit. Email support@northstar.co with your order ID.</li>
            </ul>
          </div>
          <div class="label-actions"><button class="btn btn-outline" id="ret-restart">Start another return</button></div>`;
      } else {
        const rma = 'RMA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        const lines = o.items.map(i => ({ p: PRODUCTS.find(x => x.id === i.productId), qty: i.qty }));
        const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
        const note = RETURN_RULES.notesByReason[state.reason] || '';

        const labelHtml = `
        <div class="ship-label" id="label-print">
          <div class="sl-top"><b>★ NORTHSTAR RETURNS</b><span>${rma}</span></div>
          <div class="barcode" aria-hidden="true"></div>
          <div class="sl-row"><span>ORDER</span><b>#${o.id}</b></div>
          <div class="sl-row"><span>REASON</span><b>${state.reason.toUpperCase()}</b></div>
          <div class="sl-row"><span>SHIP TO</span><b>NORTHSTAR RETURNS CENTER<br>48 COMMERCE WAY, NEWARK DE 19702</b></div>
          <div class="sl-row"><span>FROM</span><b>____________________________</b></div>
          <div class="sl-note">ATTACH TO OUTSIDE OF PARCEL · DROP AT ANY CARRIER POINT · ${RETURN_RULES.condition.toUpperCase()}</div>
        </div>`;

        out.innerHTML = `
          <div class="banner success"><div>
            <h3>Good news — #${o.id} is eligible for return</h3>
            <p>${RETURN_RULES.notesByReason[state.reason] || 'Label and refund estimate are ready below.'} Refunds land within ${RETURN_RULES.refundTime} of the first carrier scan.</p>
          </div></div>
          <div class="outcome-grid">
            ${labelHtml}
            <div>
              <span class="eyebrow">Refund estimate</span>
              <table class="refund-table">
                <thead><tr><th>Item</th><th>Amount</th></tr></thead>
                <tbody>
                  ${lines.map(l => `<tr><td>${l.p.name} × ${l.qty}</td><td>${money(l.p.price * l.qty)}</td></tr>`).join('')}
                  <tr><td>Return shipping label</td><td>${state.reason === 'Damaged Item' ? 'FREE' : 'Prepaid (mock)'}</td></tr>
                  <tr class="total"><td>Estimated refund</td><td>${money(total)}</td></tr>
                </tbody>
              </table>
              ${note ? `<p style="font-size:13px;color:var(--muted);margin-top:10px">ℹ ${note}</p>` : ''}
              <div class="label-actions">
                <button class="btn btn-primary" id="print-label">Print label</button>
                <button class="btn btn-outline" id="download-label">Download .txt</button>
                <button class="btn btn-outline" id="ret-restart">Start another return</button>
              </div>
            </div>
          </div>`;

        $('#print-label').addEventListener('click', () => window.print()); // @media print isolates #label-print
        $('#download-label').addEventListener('click', () => {
          const txt = [
            'NORTHSTAR RETAIL CO. — RETURN LABEL', '='.repeat(40),
            `RMA: ${rma}`, `ORDER: #${o.id}`, `REASON: ${state.reason}`,
            'SHIP TO: Northstar Returns Center, 48 Commerce Way, Newark DE 19702',
            '', RETURN_RULES.condition,
          ].join('\n');
          const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
          const a = Object.assign(document.createElement('a'), { href: url, download: `northstar-${rma}.txt` });
          a.click();
          URL.revokeObjectURL(url);
          toast('Label downloaded');
        });
      }
      $('#ret-restart')?.addEventListener('click', () => { form.reset(); gotoStep(1); });
    }

    gotoStep(1);
  }

  /* ==========================================================================
     ROUTER — dispatches on <body data-page>
     ========================================================================== */
  const PAGES = { home: initHome, catalogue: initCatalogue, checkout: initCheckout, tracking: initTracking, returns: initReturns };
  document.addEventListener('DOMContentLoaded', () => {
    initGlobal();
    PAGES[document.body.dataset.page]?.();
  });
})();
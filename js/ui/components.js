/* Wspólne komponenty interfejsu. Widoki składają HTML z tych funkcji, żeby cała aplikacja wyglądała spójnie. */
CT.afterRender = {};
CT.ui = {
  state: {
    channel: "all", railOpen: false,
    calMode: "month", calMonth: null, calWeek: null, calStatus: "", calBrand: "",
    feedChannel: null, videoTrack: "both", draft: null, replyTo: null, device: "mobile",
    filters: {},
  },
};
CT.actions = {};
CT.views = {};

(() => {
  const U = CT.ui;
  const R = () => CT.repo;
  const D = CT.dates;

  U.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const esc = U.esc;
  U.nl2br = (s) => esc(s).replace(/\n/g, "<br>");
  U.plural = (n, one, few, many) => (n === 1 ? one : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many));
  U.money = (n) => (n == null || n === "" || isNaN(n) ? "brak" : new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 2 }).format(Number(n)));
  U.num = (n) => (n == null || n === "" || isNaN(n) ? "brak" : new Intl.NumberFormat("pl-PL").format(Number(n)));
  U.pct = (x) => (x == null || isNaN(x) ? "brak" : new Intl.NumberFormat("pl-PL", { style: "percent", maximumFractionDigits: 1 }).format(x));
  U.label = (pairs, v) => { const p = pairs.find((x) => x[0] === v); return p ? p[1] : v || ""; };

  /* --- powiadomienie chwilowe --- */
  let toastT;
  U.toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 4200);
  };

  /* --- okno dialogowe --- */
  U.dialog = (html, opts = {}) => {
    const d = document.getElementById("dlg");
    d.className = opts.wide ? "wide" : "";
    d.innerHTML = `<div class="dlg-in"><button class="dlg-x" data-act="dlg-close" aria-label="Zamknij">×</button>${html}</div>`;
    if (!d.open) d.showModal();
    if (opts.onMount) opts.onMount(d);
    U.hydrate(d);
    const f = d.querySelector("input:not([type=hidden]):not([type=checkbox]),textarea,select"); if (f) f.focus();
    return d;
  };
  U.closeDialog = () => { const d = document.getElementById("dlg"); if (d.open) d.close(); };
  /* Potwierdzenie w oknie aplikacji (zamiast window.confirm, które bywa blokowane). */
  U.confirm = (text, yesLabel, onYes, danger) => {
    U.dialog(`<h2>Potwierdź</h2><p>${esc(text)}</p><div class="dfoot"><span class="grow"></span><button class="btn ghost" data-act="dlg-close">Anuluj</button><button class="btn ${danger ? "danger" : "primary"}" data-role="yes">${esc(yesLabel || "Tak")}</button></div>`);
    document.querySelector('#dlg [data-role="yes"]').addEventListener("click", () => { U.closeDialog(); onYes(); });
  };
  CT.actions["dlg-close"] = () => U.closeDialog();

  /* --- słowniki opcji --- */
  U.opt = {
    brands: () => R().list("brands").map((b) => [b.id, b.name + (b.active === false ? " (nieaktywna)" : "")]),
    channels: (activeOnly) => R().list("channels", (c) => !activeOnly || c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => [c.id, c.name + (c.active === false ? " (do decyzji)" : "")]),
    pillars: () => R().list("pillars").map((p) => [p.id, p.name]),
    posts: () => R().list("posts").sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).map((p) => [p.id, p.title]),
    campaigns: () => R().list("campaigns").map((c) => [c.id, c.name]),
    assets: () => R().list("assets").map((a) => [a.id, a.name]),
    topics: () => R().list("topics").map((t) => [t.id, t.title]),
    roles: () => Object.keys(CT.config.roles).map((k) => [k, R().userLabel(k)]),
    videoStatuses: () => (R().settings().videoStatuses || CT.config.defaultVideoStatuses).map((s) => [s, s]),
    platforms: () => Object.entries(CT.config.platforms).map(([k, v]) => [k, v.label]),
    days: () => [1, 2, 3, 4, 5, 6, 0].map((d) => [d, D.DOW_FULL[d]]),
  };
  U.nameOf = (coll, id, field = "name") => { const o = R().get(coll, id); return o ? o[field] : ""; };

  /* --- znaczniki statusów i kanałów --- */
  U.dot = (sid) => { const m = CT.rules.statusMeta(sid); return `<i class="dot${sid === "szkic" ? " hollow" : ""}" style="--s:${m.color}" title="${esc(m.label)}"></i>`; };
  U.badge = (sid) => { const m = CT.rules.statusMeta(sid); return `<span class="badge" style="--s:${m.color}">${U.dot(sid)}${esc(m.label)}</span>`; };
  U.platShort = (ch) => (ch && CT.config.platforms[ch.platform] ? CT.config.platforms[ch.platform].short : "");
  U.mono = (ch, size = "") => (ch ? `<span class="mono ${size}" style="--c:${ch.color}">${esc(ch.mono || "?")}<span class="plat">${esc(U.platShort(ch))}</span></span>` : "");
  U.nlBadge = (st) => { const c = CT.config.nlStatusColors[st] || "#999"; return `<span class="badge" style="--s:${c}"><i class="dot${st === "pomysl" ? " hollow" : ""}" style="--s:${c}"></i>${esc(U.label(CT.config.nlStatuses, st))}</span>`; };
  U.chTag = (ch) => (ch ? `<span class="chtag" style="--c:${ch.color}">${esc(ch.name)}</span>` : "");

  /* --- miniatury materiałów: src uzupełnia hydrate() z IndexedDB --- */
  U.thumb = (a, cls = "") => {
    if (!a) return "";
    if (a.type === "image") return `<img class="${cls}" data-asset-src="${a.id}" alt="${esc(a.name)}">`;
    if (a.type === "video") return `<video class="${cls}" data-asset-src="${a.id}" muted playsinline preload="metadata"></video>`;
    return `<span class="filetype ${cls}">${esc((a.type || "plik").toUpperCase())}</span>`;
  };
  U.hydrate = async (root = document) => {
    for (const el of root.querySelectorAll("[data-asset-src]:not([data-h])")) {
      el.setAttribute("data-h", "1");
      const a = R().get("assets", el.getAttribute("data-asset-src"));
      if (!a || !a.blobKey) continue;
      try { const u = await CT.files.url(a.blobKey); if (u) el.src = u; } catch (e) { el.replaceWith(Object.assign(document.createElement("span"), { className: "filetype", textContent: "brak pliku" })); }
    }
  };

  /* --- wgrywanie plików do Biblioteki materiałów --- */
  function readMeta(file) {
    return new Promise((resolve) => {
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "inny";
      const base = { type, mime: file.type, size: file.size };
      if (type !== "image" && type !== "video") return resolve(base);
      const url = URL.createObjectURL(file);
      const done = (w, h, extra = {}) => { URL.revokeObjectURL(url); resolve({ ...base, width: w || null, height: h || null, ...extra }); };
      if (type === "image") { const i = new Image(); i.onload = () => done(i.naturalWidth, i.naturalHeight); i.onerror = () => done(); i.src = url; }
      else { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight, { duration: Math.round(v.duration) }); v.onerror = () => done(); v.src = url; }
    });
  }
  const ratioLabel = (w, h) => { if (!w || !h) return ""; const g = (a, b) => (b ? g(b, a % b) : a); const k = g(w, h); const r = `${w / k}:${h / k}`; return r.length > 7 ? (w / h).toFixed(2) + ":1" : r; };
  U.uploadFiles = async (fileList, extra = {}) => {
    const created = [];
    /* W nieaktualnej karcie nie zapisujemy plików: metadane i tak nie trafiłyby do danych. */
    if (R().isStale()) { U.toast("Dane zmieniono w innej karcie. Kliknij „Odśwież”, a potem wgraj plik ponownie."); return created; }
    for (const file of Array.from(fileList || [])) {
      try {
        const meta = await readMeta(file);
        const key = "f_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        await CT.files.put(key, file);
        const orient = meta.width && meta.height ? (meta.width > meta.height ? "pozioma" : meta.width < meta.height ? "pionowa" : "kwadrat") : "";
        created.push(R().addAsset({ name: file.name, blobKey: key, ...meta, ratio: ratioLabel(meta.width, meta.height), orientation: orient,
          brandId: extra.brandId || "", channelId: extra.channelId || "", source: extra.source || "in-house", description: "", tags: [], license: "" }));
      } catch (e) {
        console.error(e);
        U.toast(`Nie udało się zapisać pliku ${file.name}. Ta przeglądarka może blokować przechowywanie plików.`);
      }
    }
    if (created.length) U.toast(`Dodano do biblioteki: ${created.length} ${U.plural(created.length, "plik", "pliki", "plików")}.`);
    return created;
  };

  /* --- formularze (silnik dla prostych modułów) --- */
  function fieldHtml(f, val) {
    const id = "ff_" + f.k;
    const req = f.req ? "required" : "";
    const hint = f.hint ? `<small class="hint">${esc(f.hint)}</small>` : "";
    const lab = `<label for="${id}">${esc(f.label)}${f.req ? " *" : ""}</label>`;
    const wrap = (inner) => `<div class="field${f.wide ? " wide" : ""}">${lab}${inner}${hint}</div>`;
    const opts = typeof f.options === "function" ? f.options() : f.options || [];
    switch (f.type) {
      case "textarea": return wrap(`<textarea id="${id}" data-k="${f.k}" rows="${f.rows || 3}" ${req} placeholder="${esc(f.ph || "")}">${esc(val ?? "")}</textarea>`);
      case "select": return wrap(`<select id="${id}" data-k="${f.k}" ${req}>${f.req ? "" : `<option value="">${esc(f.blank || "Brak")}</option>`}${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val ?? "") ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`);
      case "multi": {
        const set = new Set((val || []).map(String));
        return `<div class="field wide"><span class="flabel">${esc(f.label)}</span><div class="checks" data-k="${f.k}" data-type="multi">${opts.length ? opts.map(([v, l]) => `<label class="check"><input type="checkbox" value="${esc(v)}" ${set.has(String(v)) ? "checked" : ""}> ${esc(l)}</label>`).join("") : `<small class="hint">Brak pozycji do wyboru.</small>`}</div>${hint}</div>`;
      }
      case "days": {
        const set = new Set((val || []).map(Number));
        return `<div class="field wide"><span class="flabel">${esc(f.label)}</span><div class="checks" data-k="${f.k}" data-type="days">${U.opt.days().map(([v, l]) => `<label class="check"><input type="checkbox" value="${v}" ${set.has(v) ? "checked" : ""}> ${esc(l)}</label>`).join("")}</div>${hint}</div>`;
      }
      case "checkbox": return `<div class="field"><label class="check big"><input type="checkbox" data-k="${f.k}" ${val ? "checked" : ""}> ${esc(f.label)}</label>${hint}</div>`;
      case "tags": return wrap(`<input id="${id}" data-k="${f.k}" data-type="tags" value="${esc((val || []).join(", "))}" placeholder="oddziel przecinkami">`);
      case "number": return wrap(`<input id="${id}" type="number" step="${f.step || "any"}" min="${f.min ?? ""}" data-k="${f.k}" data-type="number" value="${val ?? ""}" ${req}>`);
      default: return wrap(`<input id="${id}" type="${f.type || "text"}" data-k="${f.k}" value="${esc(val ?? "")}" ${req} placeholder="${esc(f.ph || "")}" ${f.max ? `maxlength="${f.max}"` : ""}>`);
    }
  }
  U.fieldsHtml = (fields, values = {}) => `<div class="fgrid">${fields.map((f) => (f.section ? `<h4 class="fsec">${esc(f.section)}</h4>` : fieldHtml(f, values[f.k]))).join("")}</div>`;
  U.readFields = (root, fields) => {
    const out = {};
    for (const f of fields) {
      if (f.section) continue;
      const el = root.querySelector(`[data-k="${f.k}"]`); if (!el) continue;
      if (f.type === "multi") out[f.k] = [...el.querySelectorAll("input:checked")].map((i) => i.value);
      else if (f.type === "days") out[f.k] = [...el.querySelectorAll("input:checked")].map((i) => Number(i.value));
      else if (f.type === "checkbox") out[f.k] = el.checked;
      else if (f.type === "number") out[f.k] = el.value === "" ? null : Number(el.value);
      else if (f.type === "tags") out[f.k] = el.value.split(",").map((s) => s.trim()).filter(Boolean);
      else out[f.k] = el.value.trim();
    }
    return out;
  };
  /* Otwiera formularz w oknie. onSave(values) może zwrócić false, żeby okno zostało otwarte. */
  U.openForm = ({ title, fields, values = {}, onSave, onDelete, saveLabel = "Zapisz", intro = "", extraHtml = "" }) => {
    U.dialog(`<form class="dform" novalidate>
      <h2>${esc(title)}</h2>${intro ? `<p class="muted">${intro}</p>` : ""}
      ${U.fieldsHtml(fields, values)}${extraHtml}
      <div class="dfoot">${onDelete ? `<button type="button" class="btn ghost danger" data-role="del">Usuń</button>` : ""}<span class="grow"></span>
        <button type="button" class="btn ghost" data-act="dlg-close">Anuluj</button><button type="submit" class="btn primary">${esc(saveLabel)}</button></div>
    </form>`, { wide: fields.length > 8 });
    const d = document.getElementById("dlg");
    const form = d.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const vals = U.readFields(form, fields);
      const missing = fields.filter((f) => f.req && (vals[f.k] === "" || vals[f.k] == null || (Array.isArray(vals[f.k]) && !vals[f.k].length)));
      if (missing.length) { U.toast(`Uzupełnij: ${missing.map((m) => m.label).join(", ")}.`); const el = form.querySelector(`[data-k="${missing[0].k}"]`); if (el && el.focus) el.focus(); return; }
      if (onSave(vals) !== false) U.closeDialog();
    });
    const del = d.querySelector('[data-role="del"]');
    if (del) del.addEventListener("click", () => {
      if (del.dataset.armed) { onDelete(); U.closeDialog(); return; }
      del.dataset.armed = "1"; del.textContent = "Kliknij ponownie, aby usunąć"; del.classList.add("armed");
    });
  };

  /* --- kafelki liczbowe (pastelowe) --- */
  U.delta = (cur, prev, unit) => {
    if (!cur && !prev) return `bez zmian vs ${unit}`;
    const d = cur - prev;
    return d === 0 ? `bez zmian vs ${unit}` : `${d > 0 ? "▲ +" : "▼ "}${d} vs ${unit}`;
  };
  U.tile = ({ tone, label, value, sub, key, on, chip: chipText }) => {
    const cf = CT.rules.channelFilter(); const ch = cf ? R().get("channels", cf) : null;
    const chip = chipText ? `<span class="tchip">${esc(chipText)}</span>` : ch ? `<span class="tchip"><i class="cd" style="background:${ch.color}"></i>${esc(ch.name)}</span>` : `<span class="tchip">Wszystkie kanały</span>`;
    return `<button class="ptile t-${tone}${on ? " on" : ""}" data-act="tile" data-k="${key}"><span class="tl">${esc(label)}</span>${chip}<b class="tv">${value}</b><small class="ts">${esc(sub || "")}</small></button>`;
  };

  /* --- elementy widoków --- */
  U.head = (title, desc = "", actions = "") => `<div class="vhead"><div><h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ""}</div><div class="vactions">${actions}</div></div>`;
  U.empty = (text, action = "") => `<div class="emptybox"><p>${esc(text)}</p>${action}</div>`;
  U.filterVal = (view, key, def = "") => ((U.state.filters[view] || {})[key] ?? def);
  U.filterSelect = (view, key, label, options, blank = "Wszystkie") => `<label class="fsel"><span>${esc(label)}</span><select data-filter="${view}.${key}"><option value="">${esc(blank)}</option>${options.map(([v, l]) => `<option value="${esc(v)}" ${String(U.filterVal(view, key)) === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  U.filterSearch = (view, ph = "Szukaj…") => `<label class="fsel search"><span>Szukaj</span><input type="search" data-filter="${view}.q" value="${esc(U.filterVal(view, "q"))}" placeholder="${esc(ph)}"></label>`;
  U.match = (q, ...fields) => !q || fields.join(" ").toLowerCase().includes(String(q).toLowerCase());
  U.listItems = (items, empty) => (items.length ? `<ul class="alist">${items.map((it) => `<li><button data-route="${esc(it.route)}">${it.status ? U.dot(it.status) : `<i class="dot task"></i>`}<span><b>${esc(it.title)}</b><small>${esc(it.sub)}</small></span></button></li>`).join("")}</ul>` : `<p class="muted small">${esc(empty)}</p>`);

  /* --- podgląd publikacji (poglądowy, nie identyczny z platformą) --- */
  U.preview = (v, post, ch, device = "mobile") => {
    const plat = (ch && ch.platform) || "facebook";
    const brand = ch ? R().get("brands", ch.brandId) : null;
    const name = (brand && brand.name) || (ch && ch.name) || "Profil";
    const assets = (v.assetIds || []).map((id) => R().get("assets", id)).filter(Boolean);
    const fmt = String(v.format || "Post").toLowerCase().replace(/[^a-z]/g, "");
    const full = [v.text, v.cta, v.hashtags].filter((x) => x && x.trim()).join("\n\n");
    const clip = full.length > 220 ? full.slice(0, 220) + "…" : full;
    const media = assets.length
      ? `<div class="pv-media f-${fmt} p-${plat}">${U.thumb(assets[0])}${assets.length > 1 ? `<span class="pv-count">1/${assets.length}</span><span class="pv-dots">${assets.slice(0, 10).map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</span>` : ""}</div>`
      : `<div class="pv-media f-${fmt} p-${plat} none"><span>Brak materiału</span></div>`;
    const av = `<span class="pv-av" style="background:${(ch && ch.color) || "#7A2040"}">${esc((ch && ch.mono) || "")}</span>`;
    const when = `${v.date ? D.fmtDay(v.date) : ""}${v.time ? " " + v.time : ""}`;
    const linkBox = v.link ? `<div class="pv-link"><small>${esc(v.link.replace(/^https?:\/\//, "").split("/")[0])}</small><b>${esc(post ? post.title : "")}</b></div>` : "";
    let body;
    if (plat === "instagram") {
      body = `<div class="pv-head">${av}<b>${esc(name.toLowerCase().replace(/\s+/g, ""))}</b></div>${media}
        <div class="pv-ig-actions"><span>♡</span><span>💬</span><span>↗</span><span class="r">🔖</span></div>
        <div class="pv-text"><b>${esc(name.toLowerCase().replace(/\s+/g, ""))}</b> ${U.nl2br(clip) || `<span class="muted">Brak tekstu</span>`}</div><div class="pv-when">${esc(when)}</div>`;
    } else {
      body = `<div class="pv-head">${av}<div><b>${esc(name)}</b><small>${plat === "linkedin" ? "Strona firmowa, " : ""}${esc(when)}</small></div></div>
        <div class="pv-text">${U.nl2br(clip) || `<span class="muted">Brak tekstu</span>`}</div>${media}${linkBox}
        <div class="pv-bar"><span>${plat === "linkedin" ? "Poleć" : "Lubię to"}</span><span>Komentarz</span><span>${plat === "linkedin" ? "Wyślij" : "Udostępnij"}</span></div>`;
    }
    return `<div class="pv pv-${plat} dev-${device}">${body}</div>`;
  };
})();

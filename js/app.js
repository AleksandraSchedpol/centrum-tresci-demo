/* Powłoka aplikacji: routing (#/grupa/zakładka), górna nawigacja modułów, panel kanałów po prawej,
   globalna obsługa zdarzeń (kliknięcia, filtry, drag & drop). */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc;
  const R = () => CT.repo;
  const RL = () => CT.rules;

  const MEM = CT.config.routerMode === "memory";
  let memPath = "dashboard/start";
  CT.go = (route) => {
    if (MEM) { memPath = route; CT.render(); return; }
    const h = "#/" + route; if (location.hash === h) CT.render(); else location.hash = h;
  };

  function parseRoute() {
    const h = MEM ? memPath : location.hash.replace(/^#\/?/, "");
    const [path, q] = h.split("?");
    const parts = path.split("/").filter(Boolean);
    return { parts, q: new URLSearchParams(q || ""), path };
  }
  function resolve(r) {
    if (r.parts[0] === "post") return { group: "studio", tab: null, key: "post" };
    const g = CT.config.nav.find((n) => n.id === r.parts[0]) || CT.config.nav[0];
    const tab = g.tabs.find((t) => t[0] === r.parts[1]) ? r.parts[1] : g.tabs[0][0];
    return { group: g.id, tab, key: `${g.id}/${tab}` };
  }

  function renderTopbar(cur) {
    const cf = RL().channelFilter();
    const notif = R().list("notifications", (n) => n.forRole === R().role() && !n.read).length;
    document.getElementById("topbar").innerHTML = `
      <a class="brandmark" href="#/dashboard/start" aria-label="Dashboard">Centrum treści</a>${CT.config.preview ? `<span class="tag" title="Dane testowe, zapisywane tylko w Twojej przeglądarce">Podgląd</span>` : ""}
      <nav class="groups" aria-label="Moduły">${CT.config.nav.filter((g) => g.id !== "ustawienia").map((g) => `<a class="grp${g.id === cur.group ? " on" : ""}" href="#/${g.id}/${g.tabs[0][0]}"${g.id === cur.group ? ' aria-current="page"' : ""}>${esc(g.label)}</a>`).join("")}</nav>
      <span id="gs-slot"></span>
      <span class="grow"></span>
      <a class="bell${cur.group === "ustawienia" ? " on" : ""}" href="#/ustawienia/marki" aria-label="Ustawienia" title="Ustawienia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.4l2 1.2M17.8 15.4l2 1.2M4.2 16.6l2-1.2M17.8 8.6l2-1.2"/></svg></a>
      <a class="bell" href="#/workspace/powiadomienia" aria-label="Powiadomienia: ${notif} nieprzeczytanych" title="Powiadomienia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>${notif ? `<span class="cnt hot">${notif}</span>` : ""}</a>
      <span class="filterpill" title="Filtr z panelu kanałów">${cf ? esc(R().chName(cf)) : "Wszystkie kanały"}</span>
      <button class="btn small railtoggle" data-act="rail-open" aria-label="Pokaż kanały">Kanały</button>`;
  }
  /* ---------- wyszukiwarka globalna (element trwały, przenoszony między renderami) ---------- */
  const gs = document.createElement("div");
  gs.className = "gsearch";
  gs.innerHTML = `<input type="search" id="gs-input" placeholder="Szukaj wszystkiego" aria-label="Szukaj w całym centrum treści" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="gs-results"><kbd>Ctrl K</kbd><div class="gs-results" id="gs-results" role="listbox" hidden></div>`;
  const gsInput = gs.querySelector("input"); const gsBox = gs.querySelector(".gs-results");
  let gsItems = []; let gsActive = 0;
  function searchAll(raw) {
    const q = raw.trim().toLowerCase(); if (q.length < 2) return [];
    const m = (...f) => f.filter(Boolean).join(" ").toLowerCase().includes(q);
    const out = [];
    const add = (group, list) => list.slice(0, 6).forEach((x) => out.push({ group, ...x }));
    add("Posty", R().list("posts", (p) => m(p.title, p.concept, p.goal, p.notes) || R().list("versions", (v) => v.postId === p.id && m(v.text, v.cta, v.hashtags)).length)
      .map((p) => ({ label: p.title, sub: R().list("versions", (v) => v.postId === p.id).map((v) => R().chName(v.channelId)).join(", ") || "brak wersji", go: () => CT.go(`post/${p.id}`) })));
    add("Bank tematów", R().list("topics", (t) => m(t.title, t.description, t.hook, t.notes)).map((t) => ({ label: t.title, sub: U.label(CT.config.topicStatuses, t.status), go: () => { CT.go("studio/tematy"); CT.forms.topic(t); } })));
    add("Materiały", R().list("assets", (a) => m(a.name, a.description, (a.tags || []).join(" "), a.license)).map((a) => ({ label: a.name, sub: [a.type, a.width ? `${a.width}×${a.height}` : ""].filter(Boolean).join(", "), go: () => { CT.go("studio/biblioteka"); CT.actions["asset-open"]({ dataset: { id: a.id } }); } })));
    add("Newslettery", R().list("newsletters", (n) => m(n.title, n.subject, n.preheader, n.content, n.notes)).map((n) => ({ label: n.title, sub: `${(R().get("nlLists", n.listId) || {}).name || "Newsletter"}, ${n.date ? D.fmtFull(n.date) : "bez daty"}`, go: () => CT.go(`newsletter/plan?nl=${n.id}`) })));
    add("Wideo", R().list("videos", (x) => m(x.title, x.hook, x.script, x.prompt)).map((x) => ({ label: x.title, sub: `${x.track === "ai" ? "AI Video" : "In-house"}, ${x.status}`, go: () => { CT.go("studio/wideo"); CT.forms.video(x); } })));
    add("Zadania", R().list("tasks", (k) => m(k.title, k.description)).map((k) => ({ label: k.title, sub: U.label(CT.config.taskStatuses, k.status), go: () => { CT.go("workspace/zadania"); CT.forms.task(k); } })));
    add("Kampanie", R().list("campaigns", (c) => m(c.name, c.goal, c.description)).map((c) => ({ label: c.name, sub: U.label(CT.config.campaignStatuses, c.status), go: () => { CT.go("performance/reklamy"); CT.forms.campaign(c); } })));
    add("Okazje", R().list("events", (e) => m(e.title, e.notes)).map((e) => ({ label: e.title, sub: D.fmtFull(e.date), go: () => CT.go("brand/okazje") })));
    add("Konkurencja", R().list("competitors", (c) => m(c.name, c.industry, c.observations, c.notes)).map((c) => ({ label: c.name, sub: c.industry || "", go: () => CT.go("brand/konkurencja") })));
    return out;
  }
  function gsRender() {
    gsItems = searchAll(gsInput.value); gsActive = 0;
    if (gsInput.value.trim().length < 2) { gsBox.hidden = true; gsInput.setAttribute("aria-expanded", "false"); return; }
    let html = ""; let last = "";
    gsItems.forEach((it, i) => {
      if (it.group !== last) { html += `<div class="gs-group">${esc(it.group)}</div>`; last = it.group; }
      html += `<button type="button" class="gs-item${i === gsActive ? " on" : ""}" role="option" data-gs="${i}"><b>${esc(it.label)}</b><small>${esc(it.sub || "")}</small></button>`;
    });
    gsBox.innerHTML = html || `<p class="gs-empty">Brak wyników dla „${esc(gsInput.value.trim())}”.</p>`;
    gsBox.hidden = false; gsInput.setAttribute("aria-expanded", "true");
  }
  function gsPick(i) { const it = gsItems[i]; if (!it) return; gsBox.hidden = true; gsInput.value = ""; gsInput.blur(); it.go(); }
  gsInput.addEventListener("input", gsRender);
  gsInput.addEventListener("focus", () => { if (gsInput.value.trim().length >= 2) gsRender(); });
  gsInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!gsItems.length) return;
      gsActive = (gsActive + (e.key === "ArrowDown" ? 1 : -1) + gsItems.length) % gsItems.length;
      gsBox.querySelectorAll(".gs-item").forEach((b, i) => b.classList.toggle("on", i === gsActive));
      const on = gsBox.querySelector(".gs-item.on"); if (on) on.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") { e.preventDefault(); gsPick(gsActive); }
    else if (e.key === "Escape") { gsBox.hidden = true; gsInput.blur(); }
  });
  gsBox.addEventListener("mousedown", (e) => { const b = e.target.closest("[data-gs]"); if (b) { e.preventDefault(); gsPick(Number(b.dataset.gs)); } });
  document.addEventListener("mousedown", (e) => { if (!gs.contains(e.target)) gsBox.hidden = true; });
  document.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); gsInput.focus(); gsInput.select(); } });

  function renderSubtabs(cur) {
    const g = CT.config.nav.find((n) => n.id === cur.group);
    document.getElementById("subtabs").innerHTML = `<div class="tabs">${g.tabs.map(([id, l]) => `<a class="tab${id === cur.tab ? " on" : ""}" href="#/${g.id}/${id}"${id === cur.tab ? ' aria-current="page"' : ""}>${esc(l)}</a>`).join("")}</div>`;
  }
  function renderRail() {
    const s = R().settings(); const cf = U.state.channel;
    const chs = R().list("channels").sort((a, b) => (a.order || 0) - (b.order || 0));
    const waiting = R().list("versions", (v) => v.status === "do_akceptacji").length;
    const att = (c) => R().list("versions", (v) => v.channelId === c.id && RL().needsAttention(v)).length;
    const item = (attrs, icon, label, on, badge, extra = "") => `<button class="ritem${on ? " on" : ""} ${extra}" ${attrs} title="${esc(label)}"${on ? ' aria-current="true"' : ""}>${icon}<span class="rlabel">${esc(label)}</span>${badge ? `<span class="rbadge">${badge}</span>` : ""}</button>`;
    const svg = (p) => `<span class="ricon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${p}</svg></span>`;
    const el = document.getElementById("rail");
    el.innerHTML = `<div class="rtop"><a class="rlogo" href="#/dashboard/start" title="Dashboard" aria-label="Dashboard">C</a><button class="rcollapse" data-act="rail-collapse" aria-label="${s.railCollapsed ? "Rozwiń panel" : "Zwiń panel"}">${s.railCollapsed ? "‹" : "›"}</button><button class="rclose" data-act="rail-close" aria-label="Zamknij panel">×</button></div>
      ${item('data-act="set-channel" data-id="all"', svg('<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/>'), "Wszystkie kanały", cf === "all")}
      ${item('data-act="go" data-route="workspace/akceptacje"', svg('<path d="M5 12.5l4.2 4L19 7"/>'), "Akceptacja", false, waiting || "")}
      <div class="rsep"></div><div class="rhead">Profile</div>
      ${chs.map((c) => item(`data-act="set-channel" data-id="${c.id}"`, `<span class="ricon">${U.mono(c)}</span>`, c.name + (c.active === false ? " (do decyzji)" : ""), cf === c.id, att(c) || "", c.active === false ? "pending" : "")).join("")}
      <div class="rsep"></div><div class="rhead">Skróty</div>
      ${item('data-act="go" data-route="studio/harmonogram"', svg('<path d="M4 6h16M4 12h16M4 18h10"/>'), "Harmonogram", false)}
      ${item('data-act="go" data-route="studio/feed"', svg('<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'), "Podgląd feedu", false)}
      ${item('data-act="go" data-route="post/new"', svg('<path d="M12 5v14M5 12h14"/>'), "Nowy post", false)}
      <span class="grow"></span>
      <div class="rrole"><span class="rhead">Widok roli (demo)</span><div class="segs">${Object.keys(CT.config.roles).map((r) => `<button class="seg${s.role === r ? " on" : ""}" data-act="set-role" data-role="${r}" title="${esc(R().userLabel(r))}">${r === "smm" ? "SMM" : "Przełożony"}</button>`).join("")}</div></div>`;
  }

  let lastKey = "";
  CT.render = () => {
    const r = parseRoute(); const cur = resolve(r);
    if (!r.q.get("task")) U.state.taskOpened = null;
    const active = document.activeElement;
    const focusFilter = active && active.dataset && active.dataset.filter ? { f: active.dataset.filter, s: active.selectionStart } : null;
    const app = document.getElementById("app");
    app.classList.toggle("rail-collapsed", !!R().settings().railCollapsed);
    app.classList.toggle("rail-open", !!U.state.railOpen);
    document.getElementById("scrim").hidden = !U.state.railOpen;
    const gsFocused = document.activeElement === gsInput;
    renderTopbar(cur); renderSubtabs(cur); renderRail();
    const slot = document.getElementById("gs-slot"); if (slot) slot.replaceWith(gs);
    if (gsFocused) gsInput.focus();
    const view = document.getElementById("view");
    const fn = CT.views[cur.key];
    const staleBar = R().isStale() ? `<div class="notice warn stalebar" role="alert"><span><b>Dane zmieniono w innej karcie przeglądarki.</b> Zapis jest wstrzymany, żeby nie nadpisać tamtych zmian. Odśwież, aby wczytać aktualne dane: niezapisane szkice w karcie posta zostaną zachowane.</span><button class="btn small primary" data-act="data-refresh">Odśwież</button></div>` : "";
    try { view.innerHTML = staleBar + (fn ? fn(r) : U.empty("Ten widok nie istnieje.")); }
    catch (e) { console.error(e); view.innerHTML = staleBar + `<div class="notice warn">Widok nie mógł się wyświetlić: ${esc(e.message)}. Sprawdź konsolę przeglądarki.</div>`; }
    const after = cur.key === "post" ? CT.afterRender[r.parts[1] === "new" ? "post-new" : "post-edit"] : CT.afterRender[cur.key];
    if (after) after(r);
    U.hydrate(view);
    const routeKey = r.path;
    if (routeKey !== lastKey) {
      /* Wyjście z karty posta nie jest blokowane: szkic zostaje w pamięci sesji i wróci po powrocie. */
      if (lastKey.startsWith("post/") && CT.ui.onLeavePost) CT.ui.onLeavePost(lastKey.split("/")[1]);
      window.scrollTo(0, 0); lastKey = routeKey;
      /* animacja wejścia tylko przy zmianie zakładki, nie przy każdej zmianie danych */
      view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter");
      clearTimeout(CT._enterT); CT._enterT = setTimeout(() => view.classList.remove("enter"), 700);
    }
    if (focusFilter) { const el = view.querySelector(`[data-filter="${focusFilter.f}"]`); if (el) { el.focus(); try { if (focusFilter.s != null) el.setSelectionRange(focusFilter.s, focusFilter.s); } catch (e) {} } }
    document.title = `${(CT.config.nav.find((g) => g.id === cur.group) || {}).label || "Centrum treści"}: Centrum treści social media`;
  };

  /* --- akcje panelu --- */
  CT.actions["set-channel"] = (el) => { U.state.channel = el.dataset.id; U.state.railOpen = false; CT.render(); };
  CT.actions["set-role"] = (el) => { R().setSettings({ role: el.dataset.role }); U.toast(`Widok roli: ${R().userLabel(el.dataset.role)} (demonstracja, bez logowania).`); };
  CT.actions["rail-collapse"] = () => R().setSettings({ railCollapsed: !R().settings().railCollapsed });
  CT.actions["rail-open"] = () => { U.state.railOpen = true; CT.render(); };
  CT.actions["rail-close"] = () => { U.state.railOpen = false; CT.render(); };
  CT.actions["go"] = (el) => { U.state.railOpen = false; CT.go(el.dataset.route); };

  /* --- zdarzenia globalne --- */
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (link && !link.hasAttribute("data-act")) {
      const href = link.getAttribute("href") || "";
      if (MEM && href.startsWith("#/")) { e.preventDefault(); U.state.railOpen = false; CT.go(href.slice(2)); }
      return; /* zwykłe linki (także wewnątrz klikalnych wierszy) */
    }
    const a = e.target.closest("[data-act]");
    if (a && !a.matches("select,input")) {
      const fn = CT.actions[a.dataset.act];
      if (fn) { e.preventDefault(); fn(a, e); }
      return;
    }
    const r = e.target.closest("[data-route]");
    if (r) { e.preventDefault(); CT.go(r.dataset.route); }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.actChange) { const fn = CT.actions[el.dataset.actChange]; if (fn) fn(el, e); return; }
    if (el.dataset && el.dataset.filter && el.tagName === "SELECT") setFilter(el);
    if (el.dataset && el.dataset.filter && el.type === "date") setFilter(el);
  });
  let ft;
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.filter && el.type === "search") { clearTimeout(ft); ft = setTimeout(() => setFilter(el), 180); }
  });
  function setFilter(el) {
    const [view, key] = el.dataset.filter.split(".");
    U.state.filters[view] = U.state.filters[view] || {};
    U.state.filters[view][key] = el.value;
    CT.render();
  }
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches('[role="button"][data-route]')) { e.preventDefault(); CT.go(e.target.dataset.route); }
  });
  document.getElementById("scrim").addEventListener("click", () => { U.state.railOpen = false; CT.render(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && U.state.railOpen) { U.state.railOpen = false; CT.render(); } });

  /* --- drag & drop --- */
  let drag = null;
  document.addEventListener("dragstart", (e) => {
    const el = e.target.closest("[data-drag]"); if (!el || el.getAttribute("draggable") !== "true") return;
    const [kind, id] = el.dataset.drag.split(":");
    drag = { kind, id };
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id);
    el.classList.add("dragging");
  });
  document.addEventListener("dragend", (e) => { drag = null; document.querySelectorAll(".over,.dragging").forEach((x) => x.classList.remove("over", "dragging")); });
  document.addEventListener("dragover", (e) => {
    if (!drag) return;
    const z = e.target.closest("[data-drop]"); if (!z) return;
    const [zk] = z.dataset.drop.split(":");
    if ((zk === "day" && ["version", "topic"].includes(drag.kind)) || (zk === "feed" && drag.kind === "feed") || (zk === "stage" && drag.kind === "version")) { e.preventDefault(); z.classList.add("over"); }
  });
  document.addEventListener("dragleave", (e) => { const z = e.target.closest("[data-drop]"); if (z && !z.contains(e.relatedTarget)) z.classList.remove("over"); });
  document.addEventListener("drop", (e) => {
    const z = e.target.closest("[data-drop]"); if (!z || !drag) return;
    e.preventDefault(); z.classList.remove("over");
    const [zk, zid] = z.dataset.drop.split(":"); const d = drag; drag = null;
    const h = CT.dropHandlers && CT.dropHandlers[zk]; if (h) h(d.kind, d.id, zid);
  });

  /* --- zmiany z innej karty i niezapisane szkice --- */
  CT.actions["data-refresh"] = () => {
    R().reload();
    U.toast("Wczytano aktualne dane. Niezapisane szkice zostały zachowane.");
    CT.render();
  };
  /* Zapis w nieaktualnej karcie przerywa akcję błędem StaleError: pokazujemy komunikat zamiast błędu w konsoli. */
  const staleMsg = (err) => { if (err && err.stale) { U.toast(err.message); CT.render(); return true; } return false; };
  window.addEventListener("error", (e) => { if (staleMsg(e.error)) e.preventDefault(); });
  window.addEventListener("unhandledrejection", (e) => { if (staleMsg(e.reason)) e.preventDefault(); });
  window.addEventListener("storage", (e) => { if (e.key === CT.config.storageKey || e.key === null) R().markStale(); });
  window.addEventListener("beforeunload", (e) => {
    if (CT.ui.hasUnsavedDrafts && CT.ui.hasUnsavedDrafts()) { e.preventDefault(); e.returnValue = ""; }
  });

  /* --- start --- */
  if (!MEM) window.addEventListener("hashchange", CT.render);
  try { R().init(); }
  catch (e) { console.error(e); document.getElementById("view").innerHTML = `<div class="notice warn">Nie udało się wczytać danych: ${esc(e.message)}</div>`; return; }
  R().subscribe(() => CT.render());
  R().onStale(() => setTimeout(CT.render, 0));
  if (!MEM && !location.hash) location.hash = "#/dashboard/start";
  CT.render();
  CT.files.available().then((ok) => { if (!ok) U.toast("Ta przeglądarka blokuje przechowywanie plików. Biblioteka materiałów może nie działać po otwarciu z dysku: uruchom aplikację przez lokalny serwer (instrukcja w README)."); });
})();

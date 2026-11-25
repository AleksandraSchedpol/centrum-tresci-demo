/* Brand Center, Workspace, Marketing Performance, AI Content Assistant, Ustawienia. */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc, C = CT.config;
  const R = () => CT.repo;
  const RL = () => CT.rules;

  /* ================= BRAND CENTER ================= */
  const BOOK_FIELDS = [
    { k: "description", label: "Opis marki", type: "textarea", wide: true }, { k: "character", label: "Charakter marki", type: "textarea", wide: true, rows: 2 },
    { k: "audience", label: "Grupa docelowa", type: "textarea", wide: true, rows: 2 }, { k: "tone", label: "Ton komunikacji", type: "textarea", wide: true, rows: 2 },
    { k: "values", label: "Najważniejsze wartości", type: "textarea", wide: true, rows: 2 }, { k: "rules", label: "Zasady komunikacji", type: "textarea", wide: true, rows: 3 },
    { k: "banned", label: "Zakazane lub niezalecane sformułowania", type: "textarea", wide: true, rows: 3, hint: "Np. twierdzenia środowiskowe bez pokrycia (EmpCo), nazwy innych marek." },
    { k: "links", label: "Linki i materiały referencyjne", type: "textarea", wide: true, rows: 2 },
  ];
  CT.views["brand/marki"] = () => {
    const bf = RL().brandFilter();
    const brands = R().list("brands", (b) => !bf || b.id === bf);
    const row = (label, val) => `<dt>${esc(label)}</dt><dd>${val ? U.nl2br(val) : `<span class="muted">do uzupełnienia</span>`}</dd>`;
    return U.head("Księga marek", "Zasady komunikacji każdej marki. Te informacje będą też źródłem dla przyszłego asystenta treści.")
      + `<div class="bookgrid">${brands.map((b) => `<article class="card book" style="--c:${b.color}"><div class="cardhead"><h2>${esc(b.name)}</h2><button class="btn small" data-act="book-edit" data-id="${b.id}">Edytuj</button></div>
        <dl>${BOOK_FIELDS.map((f) => row(f.label, b[f.k])).join("")}</dl></article>`).join("")}</div>`;
  };
  CT.actions["book-edit"] = (el) => { const b = R().get("brands", el.dataset.id); U.openForm({ title: `Księga marki: ${b.name}`, fields: BOOK_FIELDS, values: b, onSave: (v) => { R().update("brands", b.id, v); U.toast("Zapisano księgę marki."); } }); };

  const PILLAR_FIELDS = [
    { k: "name", label: "Nazwa", req: true }, { k: "color", label: "Kolor", type: "color" }, { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands(), blank: "Wszystkie marki" },
    { k: "share", label: "Docelowy udział (%)", type: "number", min: 0 }, { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 },
    { k: "goal", label: "Cel", wide: true }, { k: "examples", label: "Przykładowe tematy", type: "textarea", wide: true, rows: 3 },
  ];
  CT.views["brand/filary"] = () => {
    const bf = RL().brandFilter();
    const ps = R().list("pillars", (p) => !bf || !p.brandId || p.brandId === bf);
    const totalShare = ps.reduce((s, p) => s + (Number(p.share) || 0), 0);
    return U.head("Filary komunikacji", "Filary są dostępne przy tworzeniu posta i liczą się w Mix filarów (Analityka, Raporty).", `<button class="btn primary" data-act="pillar-new">Dodaj filar</button>`)
      + (totalShare && totalShare !== 100 ? `<div class="notice warn">Suma docelowych udziałów to ${totalShare}%, a nie 100%.</div>` : "")
      + (ps.length ? `<div class="pillgrid">${ps.map((p) => `<button class="card pillar" style="--c:${p.color || "#7A2040"}" data-act="pillar-edit" data-id="${p.id}"><h3>${esc(p.name)}</h3>
          <p class="small">${esc(p.description || "")}</p><p class="muted small">${p.brandId ? esc(U.nameOf("brands", p.brandId)) : "Wszystkie marki"}${p.share != null ? `, cel: ${p.share}%` : ""}</p></button>`).join("")}</div>` : U.empty("Brak filarów."));
  };
  CT.actions["pillar-new"] = () => U.openForm({ title: "Nowy filar", fields: PILLAR_FIELDS, values: { color: "#7A2040" }, onSave: (v) => { R().add("pillars", v, "pl"); } });
  CT.actions["pillar-edit"] = (el) => { const p = R().get("pillars", el.dataset.id); U.openForm({ title: "Edytuj filar", fields: PILLAR_FIELDS, values: p, onSave: (v) => R().update("pillars", p.id, v), onDelete: () => R().remove("pillars", p.id) }); };

  const FORMAT_FIELDS = [
    { k: "name", label: "Nazwa", req: true }, { k: "platform", label: "Platforma", type: "select", options: () => U.opt.platforms(), req: true },
    { k: "kind", label: "Rodzaj", type: "select", options: C.formatKinds, req: true }, { k: "type", label: "Typ publikacji", ph: "np. Post, Karuzela", hint: "Formaty publikacji oddzielone przecinkami: służą do kontroli plików w karcie posta." },
    { k: "width", label: "Szerokość (px)", type: "number" }, { k: "height", label: "Wysokość (px)", type: "number" }, { k: "ratio", label: "Proporcje" },
    { k: "orientation", label: "Orientacja", type: "select", options: C.orientations }, { k: "purpose", label: "Przeznaczenie", wide: true },
    { k: "source", label: "Źródło informacji", wide: true }, { k: "updated", label: "Data aktualizacji", type: "date" }, { k: "notes", label: "Uwagi", type: "textarea", wide: true, rows: 2 },
  ];
  CT.views["brand/formaty"] = () => {
    const fs = R().list("formats");
    const table = (kind, title) => { const rows = fs.filter((f) => f.kind === kind).sort((a, b) => (a.platform + a.name).localeCompare(b.platform + b.name));
      return `<section class="card"><h2>${title}</h2>${rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Platforma</th><th>Nazwa</th><th>Typ</th><th>Wymiary</th><th>Proporcje</th><th>Źródło</th><th>Aktualizacja</th></tr></thead><tbody>
        ${rows.map((f) => `<tr class="click" data-act="format-edit" data-id="${f.id}"><td>${esc(U.label(U.opt.platforms(), f.platform))}</td><td><b>${esc(f.name)}</b></td><td>${esc(f.type || "")}</td><td>${f.width && f.height ? `${f.width}×${f.height}` : ""}</td><td>${esc(f.ratio || "")}</td><td class="small">${esc(f.source || "")}</td><td>${f.updated ? D.fmtFull(f.updated) : `<span class="warntext small">niezweryfikowane</span>`}</td></tr>`).join("")}
        </tbody></table></div>` : `<p class="muted small">Brak formatów.</p>`}</section>`; };
    return U.head("Biblioteka formatów", "Wymiary per platforma. Wartości początkowe są do weryfikacji w dokumentacji platform: po sprawdzeniu uzupełnij datę aktualizacji.", `<button class="btn primary" data-act="format-new">Dodaj format</button>`)
      + table("organiczny", "Formaty organiczne") + table("reklamowy", "Formaty reklamowe");
  };
  CT.actions["format-new"] = () => U.openForm({ title: "Nowy format", fields: FORMAT_FIELDS, values: { kind: "organiczny", platform: "instagram" }, onSave: (v) => R().add("formats", v, "fm") });
  CT.actions["format-edit"] = (el) => { const f = R().get("formats", el.dataset.id); U.openForm({ title: "Edytuj format", fields: FORMAT_FIELDS, values: f, onSave: (v) => R().update("formats", f.id, v), onDelete: () => R().remove("formats", f.id) }); };

  const EVENT_FIELDS = [
    { k: "title", label: "Nazwa", req: true, wide: true }, { k: "date", label: "Data", type: "date", req: true }, { k: "type", label: "Rodzaj", type: "select", options: C.eventTypes },
    { k: "brandIds", label: "Marki", type: "multi", options: () => U.opt.brands() }, { k: "notes", label: "Notatki", type: "textarea", wide: true, rows: 2 },
  ];
  CT.views["brand/okazje"] = () => {
    const t = D.today(); const bf = RL().brandFilter();
    const evs = R().list("events", (e) => !bf || !(e.brandIds || []).length || e.brandIds.includes(bf)).sort((a, b) => a.date.localeCompare(b.date));
    const up = evs.filter((e) => e.date >= t); const past = evs.filter((e) => e.date < t).reverse();
    const row = (e) => `<tr><td>${D.fmtFull(e.date)}</td><td><button class="linkbtn strong" data-act="event-edit" data-id="${e.id}">${esc(e.title)}</button></td><td>${esc(U.label(C.eventTypes, e.type))}</td>
      <td class="small">${(e.brandIds || []).map((id) => esc(U.nameOf("brands", id))).join(", ") || "Wszystkie"}</td><td><button class="btn small" data-act="event-topic" data-id="${e.id}">Utwórz temat</button></td></tr>`;
    return U.head("Kalendarz okazji", "Święta, dni tematyczne, wydarzenia branżowe i terminy firmowe. Okazje pokazują się też w Harmonogramie.", `<button class="btn primary" data-act="event-new">Dodaj okazję</button>`)
      + `<section class="card"><h2>Nadchodzące</h2>${up.length ? `<div class="tblwrap"><table class="tbl"><tbody>${up.map(row).join("")}</tbody></table></div>` : `<p class="muted small">Brak nadchodzących okazji.</p>`}</section>`
      + (past.length ? `<details class="card"><summary><h2>Minione (${past.length})</h2></summary><div class="tblwrap"><table class="tbl"><tbody>${past.map(row).join("")}</tbody></table></div></details>` : "");
  };
  CT.actions["event-new"] = () => U.openForm({ title: "Nowa okazja", fields: EVENT_FIELDS, values: { date: D.today(), brandIds: [] }, onSave: (v) => R().add("events", v, "evt") });
  CT.actions["event-edit"] = (el) => { const e = R().get("events", el.dataset.id); U.openForm({ title: "Edytuj okazję", fields: EVENT_FIELDS, values: e, onSave: (v) => R().update("events", e.id, v), onDelete: () => R().remove("events", e.id) }); };
  CT.actions["event-topic"] = (el) => { const e = R().get("events", el.dataset.id); CT.forms.topic(null, { title: e.title, description: `Okazja: ${e.title}, ${D.fmtFull(e.date)}. ${e.notes || ""}`.trim(), brandId: (e.brandIds || [])[0] || RL().brandFilter() || "" }); };

  const COMP_FIELDS = [
    { k: "name", label: "Nazwa", req: true }, { k: "industry", label: "Branża" }, { k: "links", label: "Linki do profili", type: "textarea", wide: true, rows: 2 },
    { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 }, { k: "observations", label: "Obserwacje", type: "textarea", wide: true, rows: 3 },
    { k: "inspirations", label: "Inspiracje", type: "textarea", wide: true, rows: 2 }, { k: "examples", label: "Przykładowe działania", type: "textarea", wide: true, rows: 2 },
    { k: "notes", label: "Notatki", type: "textarea", wide: true, rows: 2 },
  ];
  CT.views["brand/konkurencja"] = () => {
    const V = "konkurencja"; const q = U.filterVal(V, "q");
    const cs = R().list("competitors", (c) => U.match(q, c.name, c.industry, c.observations, c.notes)).sort((a, b) => a.name.localeCompare(b.name, "pl"));
    const links = (s) => (s || "").split(/\s+/).filter((x) => /^https?:\/\//.test(x)).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0])}</a>`).join(", ");
    return U.head("Konkurencja", "Baza obserwowanych marek. Wpisy uzupełniasz ręcznie: aplikacja nie monitoruje profili automatycznie.", `<button class="btn primary" data-act="comp-new">Dodaj markę</button>`)
      + `<div class="filters">${U.filterSearch(V)}</div>`
      + (cs.length ? `<div class="bookgrid">${cs.map((c) => `<article class="card"><div class="cardhead"><h2>${esc(c.name)}</h2><button class="btn small" data-act="comp-edit" data-id="${c.id}">Edytuj</button></div>
          <p class="muted small">${esc(c.industry || "")}</p>${c.links ? `<p class="small">${links(c.links)}</p>` : ""}${c.observations ? `<p class="small">${U.nl2br(c.observations)}</p>` : ""}</article>`).join("")}</div>`
        : U.empty("Brak obserwowanych marek.", `<button class="btn primary" data-act="comp-new">Dodaj markę</button>`));
  };
  CT.actions["comp-new"] = () => U.openForm({ title: "Nowa marka do obserwacji", fields: COMP_FIELDS, onSave: (v) => R().add("competitors", v, "cp") });
  CT.actions["comp-edit"] = (el) => { const c = R().get("competitors", el.dataset.id); U.openForm({ title: "Edytuj", fields: COMP_FIELDS, values: c, onSave: (v) => R().update("competitors", c.id, v), onDelete: () => R().remove("competitors", c.id) }); };

  /* ================= WORKSPACE ================= */
  CT.views["workspace/akceptacje"] = () => {
    const V = "akceptacje"; const f = (k) => U.filterVal(V, k);
    const st = f("status") || "do_akceptacji";
    const isAppr = R().role() === "przelozony";
    const rows = R().list("versions", (v) => RL().inFilter(v) && (st === "all" ? ["do_akceptacji", "poprawki", "zatwierdzony"].includes(v.status) : v.status === st)
      && (!f("brand") || (R().get("channels", v.channelId) || {}).brandId === f("brand")) && (!f("from") || v.date >= f("from")) && (!f("to") || v.date <= f("to")))
      .sort((a, b) => a.date.localeCompare(b.date));
    return U.head("Akceptacje", isAppr ? "Posty czekające na Twoją decyzję. Zatwierdź albo odeślij z uwagami." : "Stan akceptacji Twoich postów.")
      + `<div class="filters"><label class="fsel"><span>Status</span><select data-filter="${V}.status"><option value="do_akceptacji" ${st === "do_akceptacji" ? "selected" : ""}>Do akceptacji</option><option value="poprawki" ${st === "poprawki" ? "selected" : ""}>Poprawki</option><option value="zatwierdzony" ${st === "zatwierdzony" ? "selected" : ""}>Zatwierdzone</option><option value="all" ${st === "all" ? "selected" : ""}>Wszystkie w procesie</option></select></label>
        ${RL().brandFilter() ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}<label class="fsel"><span>Od</span><input type="date" data-filter="${V}.from" value="${esc(f("from"))}"></label><label class="fsel"><span>Do</span><input type="date" data-filter="${V}.to" value="${esc(f("to"))}"></label></div>`
      + (rows.length ? `<div class="apgrid">${rows.map((v) => { const p = R().get("posts", v.postId) || {}; const ch = R().get("channels", v.channelId);
          return `<article class="card apcard"><div class="appv">${U.preview(v, p, ch, "mobile")}</div><div class="apbody">
            <div class="cardhead"><a class="ptitle" href="#/post/${v.postId}?v=${v.id}">${esc(p.title)}</a>${U.badge(RL().displayStatus(v))}</div>
            <p class="muted small">${esc(ch ? ch.name : "")}, ${D.fmtDay(v.date)}${v.time ? " " + esc(v.time) : ""}, ${esc(v.format)}</p>
            ${R().list("comments", (c) => c.versionId === v.id && !c.resolved).length ? `<p class="small">Otwarte komentarze: ${R().list("comments", (c) => c.versionId === v.id && !c.resolved).length}</p>` : ""}
            <div class="btnrow">${isAppr && v.status === "do_akceptacji" ? `<button class="btn ok" data-act="ver-approve" data-id="${v.id}">Zatwierdź</button><button class="btn danger" data-act="ver-changes" data-id="${v.id}">Zgłoś poprawki</button>` : ""}<a class="btn ghost" href="#/post/${v.postId}?v=${v.id}">Otwórz kartę</a></div></div></article>`; }).join("")}</div>`
        : U.empty("Brak postów w tym statusie."));
  };

  CT.views["workspace/zadania"] = (r) => {
    const V = "zadania"; const f = (k) => U.filterVal(V, k);
    const bf = RL().brandFilter();
    const open = r.q.get("task"); if (open && R().get("tasks", open) && !U.state.taskOpened) { U.state.taskOpened = open; setTimeout(() => CT.forms.task(R().get("tasks", open)), 0); }
    const ks = R().list("tasks", (k) => (!bf || !k.brandId || k.brandId === bf) && (!f("brand") || k.brandId === f("brand")) && (!f("owner") || k.owner === f("owner")) && U.match(f("q"), k.title, k.description));
    const t = D.today();
    const cols = C.taskStatuses.filter(([s]) => f("showDone") === "1" || !["zakonczone", "anulowane"].includes(s));
    return U.head("Zadania", "Zadania można powiązać z postem, kampanią lub materiałem. Zadania z terminem pojawiają się na Dashboardzie.", `<button class="btn primary" data-act="quick-task">Dodaj zadanie</button>`)
      + `<div class="filters">${U.filterSearch(V)}${bf ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "owner", "Odpowiedzialny", U.opt.roles())}${U.filterSelect(V, "showDone", "Zakończone", [["1", "Pokaż"]], "Ukryj")}</div>`
      + `<div class="board">${cols.map(([s, l]) => { const items = ks.filter((k) => k.status === s).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
          return `<section class="bcol"><h3>${esc(l)} <span class="cnt">${items.length}</span></h3>${items.map((k) => `<button class="card tcard${k.due && k.due < t && !["zakonczone", "anulowane"].includes(k.status) ? " overdue" : ""}" data-act="task-edit" data-id="${k.id}">
            <b>${esc(k.title)}</b><small>${[k.due ? "termin " + D.fmtDay(k.due) : "", U.label(C.priorities, k.priority), k.owner ? R().userLabel(k.owner) : ""].filter(Boolean).map(esc).join(", ")}</small>
            ${k.postId && R().get("posts", k.postId) ? `<small>Post: ${esc(U.nameOf("posts", k.postId, "title"))}</small>` : ""}${k.campaignId && R().get("campaigns", k.campaignId) ? `<small>Kampania: ${esc(U.nameOf("campaigns", k.campaignId))}</small>` : ""}</button>`).join("") || `<p class="muted small">Brak</p>`}</section>`; }).join("")}</div>`;
  };
  CT.actions["task-edit"] = (el) => CT.forms.task(R().get("tasks", el.dataset.id));

  CT.views["workspace/komentarze"] = () => {
    const V = "komentarze"; const st = U.filterVal(V, "st") || "open";
    const cms = R().list("comments", (c) => { const v = R().get("versions", c.versionId); return v && RL().inFilter(v) && !c.parentId && (st === "all" || (st === "open" ? !c.resolved : c.resolved)); })
      .sort((a, b) => b.at.localeCompare(a.at));
    return U.head("Komentarze", "Wszystkie wątki komentarzy przypisane do wersji kanałowych.")
      + `<div class="filters"><label class="fsel"><span>Pokaż</span><select data-filter="${V}.st"><option value="open" ${st === "open" ? "selected" : ""}>Otwarte</option><option value="resolved" ${st === "resolved" ? "selected" : ""}>Rozwiązane</option><option value="all" ${st === "all" ? "selected" : ""}>Wszystkie</option></select></label></div>`
      + (cms.length ? `<div class="stack">${cms.map((c) => { const v = R().get("versions", c.versionId); const n = R().list("comments", (x) => x.parentId === c.id).length;
          return `<article class="card cmtrow${c.resolved ? " resolved" : ""}"><div class="cardhead"><a class="ptitle" href="#/post/${v.postId}?v=${v.id}">${esc(R().postTitle(v))}</a><span class="muted small">${esc(R().chName(v.channelId))}</span></div>
            <p>${U.nl2br(c.text)}</p><p class="muted small">${esc(c.author)}, ${D.fmtTs(c.at)}, ${esc(U.label(C.commentTargets, c.target))}${n ? `, odpowiedzi: ${n}` : ""}</p>
            <div class="btnrow"><button class="btn small ghost" data-act="cm-resolve" data-id="${c.id}" data-val="${c.resolved ? "0" : "1"}">${c.resolved ? "Otwórz ponownie" : "Oznacz jako rozwiązany"}</button></div></article>`; }).join("")}</div>`
        : U.empty("Brak komentarzy."));
  };

  CT.views["workspace/historia"] = () => {
    const V = "historia"; const q = U.filterVal(V, "q"); const type = U.filterVal(V, "type");
    const evs = R().list("versions", RL().inFilter).flatMap((v) => (v.history || []).map((e) => ({ e, v })))
      .filter(({ e, v }) => (!type || e.type === type) && U.match(q, e.desc, e.user, R().postTitle(v)))
      .sort((a, b) => b.e.at.localeCompare(a.e.at)).slice(0, 300);
    const L = CT.ui.HIST_LABELS;
    return U.head("Historia działań", "Dziennik zmian ze wszystkich wersji kanałowych (ostatnie 300 zdarzeń).")
      + `<div class="filters">${U.filterSearch(V)}${U.filterSelect(V, "type", "Zdarzenie", Object.entries(L))}</div>`
      + (evs.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Kiedy</th><th>Post</th><th>Kanał</th><th>Zdarzenie</th><th>Szczegóły</th><th>Kto</th></tr></thead><tbody>
        ${evs.map(({ e, v }) => `<tr class="click" data-route="post/${v.postId}?v=${v.id}"><td class="small">${D.fmtTs(e.at)}</td><td>${esc(R().postTitle(v))}</td><td>${esc(R().chName(v.channelId))}</td><td>${esc(L[e.type] || e.type)}</td>
          <td class="small">${esc(e.desc || "")}${e.from != null || e.to != null ? `: ${esc(CT.ui.fmtHistVal(e.type, e.from))} → ${esc(CT.ui.fmtHistVal(e.type, e.to))}` : ""}</td><td class="small">${esc(e.user)}</td></tr>`).join("")}
      </tbody></table></div>` : U.empty("Brak zdarzeń."));
  };

  CT.views["workspace/powiadomienia"] = () => {
    const role = R().role(); const t = D.today(); const tm = D.addDays(t, 1);
    const ns = R().list("notifications", (n) => n.forRole === role).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 100);
    const vs = R().list("versions", (v) => RL().inFilter(v) && !RL().FINAL.includes(v.status));
    const live = [];
    vs.filter((v) => v.date === tm && !["zatwierdzony", "zaplanowany"].includes(v.status)).forEach((v) => live.push({ status: v.status, title: R().postTitle(v), sub: `${R().chName(v.channelId)}: publikacja jutro, post nie jest zatwierdzony`, route: `post/${v.postId}?v=${v.id}` }));
    vs.filter((v) => RL().isLate(v)).forEach((v) => live.push({ status: RL().displayStatus(v), title: R().postTitle(v), sub: `${R().chName(v.channelId)}: opóźnienie, termin ${D.fmtDay(v.date)}`, route: `post/${v.postId}?v=${v.id}` }));
    R().list("tasks", (k) => k.due && k.due < t && !["zakonczone", "anulowane"].includes(k.status)).forEach((k) => live.push({ status: null, title: k.title, sub: `Zadanie po terminie (${D.fmtDay(k.due)})`, route: `workspace/zadania?task=${k.id}` }));
    return U.head("Powiadomienia", `Powiadomienia w aplikacji dla roli: ${esc(R().userLabel())}. Wysyłka e-mail będzie możliwa w Etapie 3.`, ns.some((n) => !n.read) ? `<button class="btn" data-act="nt-all">Oznacz wszystkie jako przeczytane</button>` : "")
      + `<section class="card"><h2>Na teraz <span class="cnt">${live.length}</span></h2>${U.listItems(live, "Brak terminów wymagających reakcji.")}</section>`
      + `<section class="card"><h2>Zdarzenia</h2>${ns.length ? `<ul class="alist">${ns.map((n) => `<li class="${n.read ? "read" : "unread"}"><button data-act="nt-open" data-id="${n.id}"><i class="dot${n.read ? " hollow" : ""}" style="--s:var(--wine)"></i><span><b>${esc(n.text)}</b><small>${D.fmtTs(n.at)}</small></span></button></li>`).join("")}</ul>` : `<p class="muted small">Brak powiadomień.</p>`}</section>`;
  };
  CT.actions["nt-open"] = (el) => { const n = R().get("notifications", el.dataset.id); R().markRead(n.id); if (n.route) CT.go(n.route); };
  CT.actions["nt-all"] = () => R().markAllRead(R().role());

  /* ================= PERFORMANCE ================= */
  const METRICS = [["reach", "Zasięg"], ["impressions", "Wyświetlenia"], ["reactions", "Reakcje"], ["comments", "Komentarze"], ["shares", "Udostępnienia"], ["clicks", "Kliknięcia"], ["saves", "Zapisania"]];
  function pillarMix(vs) {
    const counts = {}; vs.forEach((v) => { const p = R().get("posts", v.postId); const k = (p && p.pillarId) || "_none"; counts[k] = (counts[k] || 0) + 1; });
    const total = vs.length || 1;
    const rows = R().list("pillars").map((p) => [p, counts[p.id] || 0]).concat(counts._none ? [[{ name: "Bez filaru", color: "#B7A6AF" }, counts._none]] : []);
    return rows.length ? rows.map(([p, n]) => `<div class="bar"><span>${esc(p.name)}</span><span>${n} (${U.pct(n / total)}${p.share != null ? `, cel ${p.share}%` : ""})</span><div class="track"><div class="fill" style="width:${(n / total) * 100}%;background:${p.color || "var(--wine)"}"></div></div></div>`).join("") : `<p class="muted small">Brak filarów.</p>`;
  }
  /* ---------- Analityka: wykresy, wnioski i objaśnienia ---------- */
  const GLOSS = [
    ["Zasięg", "Ilu różnych ludzi zobaczyło post przynajmniej raz. Jedna osoba liczy się tylko raz."],
    ["Wyświetlenia", "Ile razy post się wyświetlił. Jedna osoba mogła zobaczyć go kilka razy, więc ta liczba jest równa zasięgowi albo większa."],
    ["Reakcje, komentarze, udostępnienia", "Co zrobili ludzie. Reakcja to polubienie lub inna reakcja, komentarz to odpowiedź pod postem, udostępnienie to przekazanie go dalej. Komentarze i udostępnienia świadczą o większym zainteresowaniu niż sama reakcja."],
    ["Kliknięcia", "Wszystkie kliknięcia w post: w link, zdjęcie albo „Zobacz więcej”. To znak zainteresowania, ale nie to samo co wejścia na stronę."],
    ["Zaangażowanie (ER)", "Z każdych 100 osób, które zobaczyły post, tyle zareagowało, skomentowało, udostępniło lub zapisało go. Wzór: (reakcje + komentarze + udostępnienia + zapisania) ÷ zasięg."],
    ["Powtórzenia", "Wyświetlenia ÷ zasięg. Pokazuje, ile razy średnio ta sama osoba widziała post."],
  ];
  const READ_TIPS = [
    "Porównuj z własną średnią, a nie z liczbami z internetu. Najważniejsze pytanie to: czy ten post poszedł lepiej czy gorzej niż nasz typowy.",
    "Porównuj podobne rzeczy: ten sam kanał i podobny format (zdjęcie ze zdjęciem, film z filmem).",
    "Strony różnej wielkości porównuj po zaangażowaniu (ER), nie po zasięgu. Większa strona ma większy zasięg z natury.",
    "Zasięg mówi, do ilu osób dotarliśmy. ER mówi, czy treść ich zainteresowała. Kliknięcia mówią, czy chcieli dowiedzieć się więcej.",
    "Kilka postów to orientacja, nie wyrok. Dopiero powtarzający się wzór z wielu tygodni coś znaczy.",
    "Liczby to wartości łączne od publikacji posta do dnia pobrania danych, dlatego świeże posty mogą jeszcze rosnąć.",
  ];
  const num = (x) => Number(x) || 0;
  const interOf = (r) => num(r.reactions) + num(r.comments) + num(r.shares) + num(r.saves);
  const recOf = (v) => R().list("analytics", (a) => a.versionId === v.id)[0] || null;
  const fmtPct = (x) => (x == null ? "brak" : U.pct(x));
  function anRange(sel) {
    const t = D.today();
    if (!/^\d{4}-\d{2}$/.test(sel || "")) return { from: D.addDays(t, -29), to: t, label: "ostatnie 30 dni", prevFrom: D.addDays(t, -59), prevTo: D.addDays(t, -30), prevLabel: "poprzednie 30 dni", month: t.slice(0, 7) };
    const pm = D.addMonths(sel, -1);
    return { from: D.monthStart(sel), to: D.monthEnd(sel), label: D.monthLabel(sel), prevFrom: D.monthStart(pm), prevTo: D.monthEnd(pm), prevLabel: D.monthLabel(pm), month: sel };
  }
  /* Publikacje z wpisanymi wynikami (zasięg > 0) w zakresie dat. */
  function anData(from, to) {
    const items = R().list("versions", (v) => RL().inFilter(v) && v.status === "opublikowany" && v.date >= from && v.date <= to)
      .map((v) => ({ v, r: recOf(v) })).filter((x) => x.r && num(x.r.reach) > 0)
      .map((x) => ({ ...x, inter: interOf(x.r), er: interOf(x.r) / num(x.r.reach) }));
    const sum = (k) => items.reduce((s, x) => s + num(x.r[k]), 0);
    const reach = sum("reach"); const inter = items.reduce((s, x) => s + x.inter, 0);
    return { items, reach, impressions: sum("impressions"), inter, clicks: sum("clicks"), reactions: sum("reactions"), comments: sum("comments"), shares: sum("shares"), saves: sum("saves"), er: reach ? inter / reach : null };
  }
  const groupBy = (items, keyFn) => { const m = new Map(); items.forEach((x) => { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); }); return [...m.entries()]; };
  const avgReach = (xs) => xs.reduce((s, x) => s + num(x.r.reach), 0) / (xs.length || 1);
  const erOf = (xs) => { const r = xs.reduce((s, x) => s + num(x.r.reach), 0); return r ? xs.reduce((s, x) => s + x.inter, 0) / r : null; };
  const fmtLabel = (f) => (f === "Reels" ? "Reels (filmy)" : f === "Post" ? "Posty ze zdjęciem" : f);

  function insightsFor(d) {
    const out = []; const items = d.items; if (!items.length) return out;
    const title = (x) => `„${R().postTitle(x.v)}” (${R().chName(x.v.channelId)})`;
    const byEr = items.slice().sort((a, b) => b.er - a.er); const best = byEr[0];
    if (items.length > 1 && d.er) {
      const tiny = num(best.r.reach) < (d.reach / items.length) * 0.5;
      out.push(`Najwyższe zaangażowanie ma ${title(best)}: ${fmtPct(best.er)}, przy średniej ${fmtPct(d.er)} dla wszystkich postów. Czyli z 100 osób, które je zobaczyły, ${U.num(Math.round(best.er * 100))} wchodziło w interakcję.${tiny ? ` Uwaga: ten post dotarł tylko do ${U.num(best.r.reach)} osób, więc przy tak małej grupie wynik łatwo o przypadek.` : ""}`);
    }
    const byReach = items.slice().sort((a, b) => num(b.r.reach) - num(a.r.reach)); const top = byReach[0];
    out.push(`Największy zasięg ma ${title(top)}: dotarł do ${U.num(top.r.reach)} osób (średnio na post: ${U.num(Math.round(d.reach / items.length))}).`);
    const byClick = items.slice().sort((a, b) => num(b.r.clicks) - num(a.r.clicks))[0];
    if (num(byClick.r.clicks) > 0) out.push(`Najwięcej kliknięć zebrał ${title(byClick)}: ${U.num(byClick.r.clicks)}. To znak, że treść chciano zobaczyć dokładniej.`);
    const chans = groupBy(items, (x) => x.v.channelId);
    if (chans.length > 1) out.push(`Kanały: ${chans.map(([id, xs]) => `${R().chName(id)}, średni zasięg ${U.num(Math.round(avgReach(xs)))}, zaangażowanie ${fmtPct(erOf(xs))}`).join("; ")}. Strony są różnej wielkości, dlatego uczciwie porównuje się zaangażowanie.`);
    const fmts = groupBy(items, (x) => x.v.format);
    if (fmts.length > 1) out.push(`Formaty: ${fmts.map(([f, xs]) => `${fmtLabel(f)}: ${xs.length} ${U.plural(xs.length, "post", "posty", "postów")}, średni zasięg ${U.num(Math.round(avgReach(xs)))}, zaangażowanie ${fmtPct(erOf(xs))}`).join("; ")}.`);
    if (d.inter > 0) {
      const share = (n) => U.pct(n / d.inter);
      out.push(`Z ${U.num(d.inter)} interakcji ${share(d.reactions)} to reakcje, ${share(d.shares)} to udostępnienia, a komentarzy jest ${U.num(d.comments)}.${d.comments / d.inter < 0.05 ? " Komentarze to najrzadsza forma kontaktu: pytanie do odbiorców na końcu posta może to zmienić." : ""}`);
    }
    if (items.length < 20) out.push(`Uwaga: to ${items.length} ${U.plural(items.length, "post", "posty", "postów")}. Traktuj wnioski jako orientację, nie jako regułę.`);
    return out;
  }
  const barRow = (label, sub, parts, valueHtml) => `<div class="abar"><div class="abar-l"><b>${esc(label)}</b><small>${esc(sub)}</small></div><div class="abar-t">${parts}</div><div class="abar-v">${valueHtml}</div></div>`;
  const delta = (cur, prev, unit, hasPrev, fmt = U.num) => {
    if (!hasPrev || !prev) return "";
    const d = cur - prev; if (d === 0) return `bez zmian vs ${unit}`;
    return `${d > 0 ? "▲ +" : "▼ "}${fmt(d)} vs ${unit}`;
  };

  CT.views["performance/analityka"] = () => {
    const V = "analityka"; const sel = U.filterVal(V, "m") || "30d"; const rg = anRange(sel);
    const cur = anData(rg.from, rg.to); const prev = anData(rg.prevFrom, rg.prevTo); const hasPrev = prev.items.length > 0;
    const months = Array.from({ length: 12 }, (_, i) => D.addMonths(D.today().slice(0, 7), -i)).map((m) => [m, D.monthLabel(m)]);
    const pubAll = R().list("versions", (v) => RL().inFilter(v) && v.status === "opublikowany" && v.date >= rg.from && v.date <= rg.to).sort((a, b) => a.date.localeCompare(b.date));
    const planned = R().list("versions", (v) => RL().inFilter(v) && v.status !== "anulowany" && v.date >= rg.from && v.date <= rg.to);
    const chs = R().list("channels", (c) => c.active !== false && (!RL().channelFilter() || c.id === RL().channelFilter()));
    const src = cur.items.map((x) => x.r.source).find(Boolean);
    const helpBtn = R().settings().hideAnHelp ? `<button class="btn ghost" data-act="anhelp-show">Jak czytać ten ekran</button>` : "";
    const help = R().settings().hideAnHelp ? "" : `<section class="card explain"><div class="cardhead"><h2>Jak czytać ten ekran</h2><button class="btn small ghost" data-act="anhelp-hide">Ukryj</button></div>
      <div class="explain-g"><div><h3>Co oznaczają liczby</h3><dl>${GLOSS.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join("")}</dl></div>
      <div><h3>Jak je odczytywać</h3><ol>${READ_TIPS.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div></div></section>`;

    let body;
    if (!cur.items.length) {
      body = `<div class="emptybox"><p>Brak wyników dla opublikowanych postów w okresie: ${esc(rg.label)}.</p><p class="small">Wyniki wpisz poniżej w sekcji „Wpisz lub popraw wyniki” (np. z Meta Business Suite). Wykresy pojawią się od razu.</p></div>`;
    } else {
      const items = cur.items;
      const maxImp = Math.max(...items.map((x) => num(x.r.impressions) || num(x.r.reach)), 1);
      const reachRows = items.slice().sort((a, b) => num(b.r.reach) - num(a.r.reach)).map((x) => barRow(R().postTitle(x.v), `${R().chName(x.v.channelId)}, ${D.fmtDay(x.v.date)}`,
        `<div class="abar-f imp" style="width:${(num(x.r.impressions || x.r.reach) / maxImp) * 100}%"></div><div class="abar-f reach" style="width:${(num(x.r.reach) / maxImp) * 100}%"></div>`,
        `<b>${U.num(x.r.reach)}</b><small>${U.num(x.r.impressions)} wyśw.</small>`)).join("");
      const maxEr = Math.max(...items.map((x) => x.er), 0.0001); const avgPos = cur.er != null ? (cur.er / maxEr) * 100 : null;
      const erRows = items.slice().sort((a, b) => b.er - a.er).map((x) => barRow(R().postTitle(x.v), `${R().chName(x.v.channelId)}, ${D.fmtDay(x.v.date)}`,
        `<div class="abar-f er${cur.er != null && x.er >= cur.er ? " above" : ""}" style="width:${(x.er / maxEr) * 100}%"></div>${avgPos != null ? `<i class="abar-avg" style="left:${Math.min(avgPos, 100)}%" title="Średnia: ${fmtPct(cur.er)}"></i>` : ""}`,
        `<b>${fmtPct(x.er)}</b><small>${U.num(x.inter)} interakcji</small>`)).join("");
      const chanCards = groupBy(items, (x) => x.v.channelId).map(([id, xs]) => { const c = R().get("channels", id); return `<div class="achan" style="--c:${(c && c.color) || "var(--wine)"}"><div class="achan-h">${U.chTag(c)}<span class="muted small">${xs.length} ${U.plural(xs.length, "post", "posty", "postów")}</span></div>
        <div class="achan-n"><div><b>${U.num(Math.round(avgReach(xs)))}</b><span>średni zasięg</span></div><div><b>${fmtPct(erOf(xs))}</b><span>zaangażowanie</span></div><div><b>${U.num(xs.reduce((s, x) => s + num(x.r.clicks), 0))}</b><span>kliknięcia</span></div></div></div>`; }).join("");
      const segs = [["Reakcje", cur.reactions, "var(--wine)"], ["Komentarze", cur.comments, "var(--warn)"], ["Udostępnienia", cur.shares, "var(--ok)"], ["Zapisania", cur.saves, "var(--mauve)"]].filter(([, n]) => n > 0);
      const segTotal = segs.reduce((s, [, n]) => s + n, 0) || 1;
      const struct = segs.length ? `<div class="astack" role="img" aria-label="Struktura interakcji">${segs.map(([l, n, c]) => `<span style="width:${(n / segTotal) * 100}%;background:${c}" title="${l}: ${n}"></span>`).join("")}</div>
        <ul class="alegend">${segs.map(([l, n, c]) => `<li><i style="background:${c}"></i>${l}: <b>${U.num(n)}</b> (${U.pct(n / segTotal)})</li>`).join("")}</ul>` : `<p class="muted small">Brak interakcji do pokazania.</p>`;
      const ins = insightsFor(cur);
      body = `<div class="akpis">
          <div class="akpi"><b>${U.num(cur.reach)}</b><span>Łączny zasięg</span><p>Suma osób z poszczególnych postów. Ta sama osoba mogła zobaczyć kilka postów.</p><small>${esc(delta(cur.reach, prev.reach, rg.prevLabel, hasPrev))}</small></div>
          <div class="akpi"><b>${U.num(cur.impressions)}</b><span>Wyświetlenia</span><p>Ile razy łącznie wyświetlono posty. Średnio ${cur.reach ? (cur.impressions / cur.reach).toFixed(1).replace(".", ",") : "brak"} razy na osobę.</p><small>${esc(delta(cur.impressions, prev.impressions, rg.prevLabel, hasPrev))}</small></div>
          <div class="akpi"><b>${U.num(cur.inter)}</b><span>Interakcje</span><p>Reakcje, komentarze, udostępnienia i zapisania razem. Kliknięcia: ${U.num(cur.clicks)}.</p><small>${esc(delta(cur.inter, prev.inter, rg.prevLabel, hasPrev))}</small></div>
          <div class="akpi accent"><b>${fmtPct(cur.er)}</b><span>Zaangażowanie (ER)</span><p>Z 100 osób, które zobaczyły posty, tyle wchodziło w interakcję. Liczone z sumy, nie ze średniej z postów.</p><small>${esc(delta(cur.er, prev.er, rg.prevLabel, hasPrev && prev.er != null, (d) => (Math.abs(d) * 100).toFixed(1).replace(".", ",") + " p.p."))}</small></div>
        </div>
        <section class="card"><h2>Wnioski w skrócie</h2><ul class="insights">${ins.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
        <div class="agrid">
          <section class="card"><h2>Ilu osobom pokazał się każdy post</h2><p class="muted small">Ciemny słupek to zasięg (osoby), jasny to wyświetlenia (razy). Im większa różnica, tym częściej ta sama osoba widziała post.</p>
            <div class="alegend inline"><span><i style="background:var(--wine)"></i>Zasięg</span><span><i style="background:color-mix(in srgb, var(--wine) 28%, var(--card))"></i>Wyświetlenia</span></div><div class="abars">${reachRows}</div></section>
          <section class="card"><h2>Który post zainteresował najbardziej</h2><p class="muted small">Zaangażowanie (ER) każdego posta. Pionowa kreska to średnia wszystkich postów${cur.er != null ? ` (${fmtPct(cur.er)})` : ""}. Słupki powyżej średniej są wyróżnione.</p>
            <div class="abars">${erRows}</div></section>
        </div>
        <div class="agrid">
          <section class="card"><h2>Porównanie kanałów</h2><p class="muted small">Różnej wielkości strony porównuj po zaangażowaniu, a nie po zasięgu.</p><div class="achans">${chanCards}</div></section>
          <section class="card"><h2>Co robili odbiorcy</h2><p class="muted small">Struktura interakcji (bez kliknięć). Pokazuje, czy ludzie tylko reagują, czy też komentują i udostępniają.</p>${struct}</section>
        </div>`;
    }

    const rec = (v) => recOf(v) || {};
    const editTable = pubAll.length ? `<div class="tblwrap"><table class="tbl metrics"><thead><tr><th>Post</th>${METRICS.map(([, l]) => `<th>${l}</th>`).join("")}<th>ER</th><th></th></tr></thead><tbody>
        ${pubAll.map((v) => { const r = rec(v); const er = RL().engagement(r);
          return `<tr data-row="${v.id}"><td><a href="#/post/${v.postId}?v=${v.id}">${esc(R().postTitle(v))}</a><br><small class="muted">${esc(R().chName(v.channelId))}, ${D.fmtDay(v.date)}</small></td>
            ${METRICS.map(([k]) => `<td><input type="number" min="0" data-m="${k}" value="${r[k] ?? ""}" aria-label="${k}"></td>`).join("")}<td>${er != null ? U.pct(er) : "brak"}</td><td><button class="btn small" data-act="an-save" data-id="${v.id}">Zapisz</button></td></tr>`; }).join("")}
        </tbody></table></div><p class="muted small">ER = (reakcje + komentarze + udostępnienia + zapisania) / zasięg.</p>` : `<p class="muted small">Brak potwierdzonych publikacji w tym okresie.</p>`;
    const resultsTable = cur.items.length ? `<section class="card"><h2>Wyniki każdego posta <span class="cnt">${cur.items.length}</span></h2><div class="tblwrap"><table class="tbl"><thead><tr><th>Post</th><th>Zasięg</th><th>Wyświetlenia</th><th>Reakcje</th><th>Komentarze</th><th>Udostępnienia</th><th>Kliknięcia</th><th>ER</th></tr></thead><tbody>
        ${cur.items.slice().sort((a, b) => a.v.date.localeCompare(b.v.date)).map((x) => `<tr><td><a href="#/post/${x.v.postId}?v=${x.v.id}"><b>${esc(R().postTitle(x.v))}</b></a><br><small class="muted">${esc(R().chName(x.v.channelId))}, ${D.fmtDay(x.v.date)}</small></td>
          <td>${U.num(x.r.reach)}</td><td>${U.num(x.r.impressions)}</td><td>${U.num(x.r.reactions)}</td><td>${U.num(x.r.comments)}</td><td>${U.num(x.r.shares)}</td><td>${U.num(x.r.clicks)}</td><td><b>${fmtPct(x.er)}</b></td></tr>`).join("")}
        </tbody></table></div></section>` : "";

    return U.head("Analityka", "Wyniki opublikowanych postów w czytelnej formie. Liczby wpisujesz ręcznie, np. z Meta Business Suite lub statystyk LinkedIna. Automatyczne pobieranie to Etap 3.", helpBtn)
      + help
      + `<div class="filters"><label class="fsel"><span>Okres</span><select data-filter="${V}.m"><option value="30d" ${sel === "30d" || !/^\d{4}-\d{2}$/.test(sel) ? "selected" : ""}>Ostatnie 30 dni</option>${months.map(([m, l]) => `<option value="${m}" ${m === sel ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>`
      + (src ? `<p class="muted small asrc">Źródło danych: ${esc(src)}. To wartości łączne od publikacji do dnia pobrania danych.</p>` : "")
      + body + resultsTable
      + `<details class="card editres"${cur.items.length ? "" : " open"}><summary><h2>Wpisz lub popraw wyniki</h2></summary>${editTable}</details>`
      + `<div class="grid2"><section class="card"><h2>Obserwujący na koniec miesiąca</h2><p class="muted small">Miesiąc: ${esc(D.monthLabel(rg.month))}</p>${chs.map((c) => { const r = R().list("analytics", (a) => a.channelId === c.id && a.period === rg.month && !a.versionId && a.followers != null)[0] || {};
          return `<div class="inrow" data-row="${c.id}"><span>${U.chTag(c)}</span><input type="number" min="0" data-m="followers" value="${r.followers ?? ""}" aria-label="Obserwujący"><button class="btn small" data-act="an-fol" data-id="${c.id}" data-m="${rg.month}">Zapisz</button></div>`; }).join("")}</section>
        <section class="card"><h2>Mix filarów</h2><p class="muted small">Posty w okresie „${esc(rg.label)}” (bez anulowanych): ${planned.length}</p>${pillarMix(planned)}</section></div>`;
  };
  CT.actions["anhelp-hide"] = () => R().setSettings({ hideAnHelp: true });
  CT.actions["anhelp-show"] = () => R().setSettings({ hideAnHelp: false });
  CT.actions["an-save"] = (el) => {
    const row = el.closest("[data-row]"); const vals = {};
    row.querySelectorAll("[data-m]").forEach((i) => { vals[i.dataset.m] = i.value === "" ? null : Number(i.value); });
    const v = R().get("versions", el.dataset.id);
    R().upsertAnalytics({ versionId: v.id }, { ...vals, channelId: v.channelId, period: v.date.slice(0, 7) }); U.toast("Zapisano wyniki.");
  };
  CT.actions["an-fol"] = (el) => { const i = el.closest("[data-row]").querySelector("[data-m]"); R().upsertAnalytics({ channelId: el.dataset.id, period: el.dataset.m, versionId: undefined }, { followers: i.value === "" ? null : Number(i.value) }); U.toast("Zapisano liczbę obserwujących."); };

  function reportData(range, brand) {
    const [a, b] = range;
    const inR = (v) => RL().inFilter(v) && v.date >= a && v.date <= b && (!brand || (R().get("channels", v.channelId) || {}).brandId === brand);
    const planned = R().list("versions", (v) => inR(v) && v.status !== "anulowany");
    const pub = planned.filter((v) => v.status === "opublikowany");
    const recs = pub.map((v) => ({ v, r: R().list("analytics", (x) => x.versionId === v.id)[0] })).filter((x) => x.r);
    const sum = (k) => recs.reduce((s, x) => s + (Number(x.r[k]) || 0), 0);
    const top = recs.map((x) => ({ ...x, er: RL().engagement(x.r) })).filter((x) => x.er != null).sort((p, q) => q.er - p.er).slice(0, 5);
    return { planned, pub, recs, sum, top };
  }
  CT.views["performance/raporty"] = () => {
    const V = "raporty"; const kind = U.filterVal(V, "kind") || "m"; const brand = U.filterVal(V, "brand");
    const ym = D.today().slice(0, 7);
    let opts, val, range, prevRange, label;
    if (kind === "q") {
      opts = Array.from({ length: 6 }, (_, i) => D.quarterOf(D.addMonths(ym, -3 * i))).map((q) => [q, q.replace("-", " ")]);
      val = U.filterVal(V, "p") || opts[0][0]; if (!/Q/.test(val)) val = opts[0][0];
      range = D.quarterRange(val); const pq = D.quarterOf(D.addMonths(range[0].slice(0, 7), -3)); prevRange = D.quarterRange(pq); label = val.replace("-", " ");
    } else {
      opts = Array.from({ length: 12 }, (_, i) => D.addMonths(ym, -i)).map((m) => [m, D.monthLabel(m)]);
      val = U.filterVal(V, "p") || ym; if (/Q/.test(val)) val = ym;
      range = [D.monthStart(val), D.monthEnd(val)]; const pm = D.addMonths(val, -1); prevRange = [D.monthStart(pm), D.monthEnd(pm)]; label = D.monthLabel(val);
    }
    const cur = reportData(range, brand); const prev = reportData(prevRange, brand);
    const diff = (a, b) => (b ? `${a - b >= 0 ? "+" : ""}${a - b} vs poprzedni okres` : "brak danych z poprzedniego okresu");
    const realization = cur.planned.length ? cur.pub.length / cur.planned.length : null;
    U.state.lastReport = { label, cur, prev, realization, brand };
    return U.head("Raporty", "Raport z rzeczywistych danych: plan, publikacje i wyniki wpisane w Analityce.", `<button class="btn" data-act="rep-copy">Kopiuj raport</button>`)
      + `<div class="filters"><label class="fsel"><span>Okres</span><select data-filter="${V}.kind"><option value="m" ${kind === "m" ? "selected" : ""}>Miesięczny</option><option value="q" ${kind === "q" ? "selected" : ""}>Kwartalny</option></select></label>
        <label class="fsel"><span>Zakres</span><select data-filter="${V}.p">${opts.map(([v, l]) => `<option value="${v}" ${v === val ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
        ${RL().brandFilter() ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}</div>`
      + `<div class="kpis">
          <div class="kpi"><b>${cur.pub.length}</b><span>publikacji</span><small>${esc(diff(cur.pub.length, prev.pub.length))}</small></div>
          <div class="kpi"><b>${realization != null ? U.pct(realization) : "brak"}</b><span>realizacji planu</span><small>${cur.pub.length} z ${cur.planned.length} zaplanowanych</small></div>
          <div class="kpi"><b>${U.num(cur.sum("reach"))}</b><span>łączny zasięg</span><small>z ${cur.recs.length} publikacji z wynikami</small></div>
          <div class="kpi"><b>${U.num(cur.sum("reactions") + cur.sum("comments") + cur.sum("shares") + cur.sum("saves"))}</b><span>interakcji</span><small>reakcje, komentarze, udostępnienia, zapisania</small></div>
        </div>
        <div class="grid2"><section class="card"><h2>Najlepsze publikacje</h2>${cur.top.length ? `<ol class="toplist">${cur.top.map((x) => `<li><a href="#/post/${x.v.postId}?v=${x.v.id}">${esc(R().postTitle(x.v))}</a><small>${esc(R().chName(x.v.channelId))}, ER ${U.pct(x.er)}, zasięg ${U.num(x.r.reach)}</small></li>`).join("")}</ol>` : `<p class="muted small">Brak publikacji z wpisanymi wynikami.</p>`}</section>
        <section class="card"><h2>Udział filarów</h2>${pillarMix(cur.planned)}</section></div>`;
  };
  CT.actions["rep-copy"] = async () => {
    const r = U.state.lastReport; if (!r) return;
    const txt = [`Raport: ${r.label}${r.brand ? ", " + U.nameOf("brands", r.brand) : ""}`, `Publikacje: ${r.cur.pub.length} (poprzedni okres: ${r.prev.pub.length})`,
      `Realizacja planu: ${r.realization != null ? U.pct(r.realization) : "brak"} (${r.cur.pub.length} z ${r.cur.planned.length})`, `Łączny zasięg: ${U.num(r.cur.sum("reach"))}`, "", "Najlepsze publikacje:"]
      .concat(r.cur.top.map((x, i) => `${i + 1}. ${R().postTitle(x.v)} (${R().chName(x.v.channelId)}), ER ${U.pct(x.er)}`)).join("\n");
    try { await navigator.clipboard.writeText(txt); U.toast("Skopiowano raport."); } catch (e) { U.dialog(`<h2>Raport</h2><textarea class="copybox" rows="14">${esc(txt)}</textarea>`); }
  };

  /* Reklamy i kampanie */
  const CAMPAIGN_FIELDS = [
    { k: "name", label: "Nazwa", req: true, wide: true }, { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands(), req: true },
    { k: "platform", label: "Platforma", type: "select", options: C.campaignPlatforms, req: true }, { k: "status", label: "Status", type: "select", options: C.campaignStatuses, req: true },
    { k: "goal", label: "Cel", wide: true }, { k: "audience", label: "Grupa docelowa", type: "textarea", wide: true, rows: 2 },
    { k: "budget", label: "Budżet (PLN)", type: "number", min: 0 }, { k: "start", label: "Data rozpoczęcia", type: "date" }, { k: "end", label: "Data zakończenia", type: "date" },
    { k: "owner", label: "Odpowiedzialny", type: "select", options: () => U.opt.roles() }, { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 },
    { k: "postIds", label: "Powiązane posty", type: "multi", options: () => U.opt.posts() }, { k: "assetIds", label: "Materiały", type: "multi", options: () => U.opt.assets() },
    { section: "Wyniki (wpisywane ręcznie)" },
    { k: "spend", label: "Wydatki (PLN)", type: "number", min: 0 }, { k: "reach", label: "Zasięg", type: "number", min: 0 }, { k: "impressions", label: "Wyświetlenia", type: "number", min: 0 },
    { k: "clicks", label: "Kliknięcia", type: "number", min: 0 }, { k: "conversions", label: "Konwersje", type: "number", min: 0 }, { k: "otherMetrics", label: "Inne metryki", type: "textarea", wide: true, rows: 2 },
  ];
  CT.forms.campaign = (c) => U.openForm({ title: c ? "Edytuj kampanię" : "Nowa kampania", fields: CAMPAIGN_FIELDS,
    values: c || { status: "plan", platform: "meta", owner: "smm", brandId: RL().brandFilter() || "" },
    onSave: (v) => { if (c) R().update("campaigns", c.id, v); else R().add("campaigns", { ...v, creatives: [] }, "cmp"); U.toast("Zapisano kampanię."); },
    onDelete: c ? () => R().remove("campaigns", c.id) : null });
  const kpi = (c) => ({ ctr: c.impressions ? c.clicks / c.impressions : null, cpc: c.clicks ? c.spend / c.clicks : null, cpm: c.impressions ? (c.spend / c.impressions) * 1000 : null });
  CT.views["performance/reklamy"] = () => {
    const V = "reklamy"; const f = (k) => U.filterVal(V, k); const bf = RL().brandFilter();
    const cs = R().list("campaigns", (c) => (!bf || c.brandId === bf) && (!f("brand") || c.brandId === f("brand")) && (!f("status") || c.status === f("status"))).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
    return U.head("Reklamy i kampanie", "Plan kampanii, kreacje i wyniki wpisywane ręcznie. Integracje z API reklamowym to Etap 3.", `<button class="btn primary" data-act="quick-campaign">Dodaj kampanię</button>`)
      + `<div class="filters">${bf ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "status", "Status", C.campaignStatuses)}</div>`
      + (cs.length ? `<div class="stack">${cs.map((c) => { const k = kpi(c);
          return `<article class="card"><div class="cardhead"><button class="linkbtn strong" data-act="camp-edit" data-id="${c.id}">${esc(c.name)}</button><span class="tag">${esc(U.label(C.campaignStatuses, c.status))}</span></div>
            <p class="muted small">${esc(U.nameOf("brands", c.brandId))}, ${esc(U.label(C.campaignPlatforms, c.platform))}${c.start ? `, ${D.fmtFull(c.start)} – ${c.end ? D.fmtFull(c.end) : "bez daty końca"}` : ""}${c.goal ? `, cel: ${esc(c.goal)}` : ""}</p>
            <div class="kpis small"><div class="kpi"><b>${U.money(c.budget)}</b><span>budżet</span></div><div class="kpi"><b>${U.money(c.spend)}</b><span>wydatki</span></div>
              <div class="kpi"><b>${U.pct(k.ctr)}</b><span>CTR</span></div><div class="kpi"><b>${U.money(k.cpc)}</b><span>CPC</span></div><div class="kpi"><b>${U.money(k.cpm)}</b><span>CPM</span></div><div class="kpi"><b>${U.num(c.conversions)}</b><span>konwersje</span></div></div>
            <div class="btnrow"><button class="btn small" data-act="camp-creatives" data-id="${c.id}">Kreacje (${(c.creatives || []).length})</button>${(c.postIds || []).filter((id) => R().get("posts", id)).map((id) => `<a class="btn small ghost" href="#/post/${id}">${esc(U.nameOf("posts", id, "title"))}</a>`).join("")}</div></article>`; }).join("")}</div>`
        : U.empty("Brak kampanii.", `<button class="btn primary" data-act="quick-campaign">Dodaj kampanię</button>`));
  };
  CT.actions["camp-edit"] = (el) => CT.forms.campaign(R().get("campaigns", el.dataset.id));
  const CREATIVE_FIELDS = [{ k: "name", label: "Nazwa lub wariant", req: true }, { k: "assetId", label: "Grafika lub wideo", type: "select", options: () => U.opt.assets() },
    { k: "text", label: "Tekst reklamy", type: "textarea", wide: true, rows: 3 }, { k: "result", label: "Wynik / ocena", type: "textarea", wide: true, rows: 2 }];
  CT.actions["camp-creatives"] = (el) => {
    const c = R().get("campaigns", el.dataset.id); const cr = c.creatives || [];
    U.dialog(`<h2>Kreacje: ${esc(c.name)}</h2>${cr.length ? `<div class="stack">${cr.map((x, i) => `<div class="card crow"><span class="crth">${x.assetId && R().get("assets", x.assetId) ? U.thumb(R().get("assets", x.assetId)) : ""}</span><div><b>${esc(x.name)}</b><p class="small">${U.nl2br(x.text || "")}</p>${x.result ? `<p class="muted small">Wynik: ${esc(x.result)}</p>` : ""}</div>
      <span class="btnrow"><button class="btn small" data-act="cr-edit" data-id="${c.id}" data-i="${i}">Edytuj</button><button class="btn small ghost danger" data-act="cr-del" data-id="${c.id}" data-i="${i}">Usuń</button></span></div>`).join("")}</div>` : `<p class="muted small">Brak kreacji.</p>`}
      <div class="dfoot"><span class="grow"></span><button class="btn primary" data-act="cr-edit" data-id="${c.id}" data-i="-1">Dodaj kreację</button></div>`, { wide: true });
  };
  CT.actions["cr-edit"] = (el) => {
    const c = R().get("campaigns", el.dataset.id); const i = Number(el.dataset.i); const cr = (c.creatives || []).slice();
    U.openForm({ title: i < 0 ? "Nowa kreacja" : "Edytuj kreację", fields: CREATIVE_FIELDS, values: i < 0 ? {} : cr[i],
      onSave: (v) => { if (i < 0) cr.push({ id: "cr_" + Date.now().toString(36), ...v }); else cr[i] = { ...cr[i], ...v }; R().update("campaigns", c.id, { creatives: cr }); setTimeout(() => CT.actions["camp-creatives"]({ dataset: { id: c.id } }), 0); } });
  };
  CT.actions["cr-del"] = (el) => { const c = R().get("campaigns", el.dataset.id); const i = Number(el.dataset.i); U.confirm("Usunąć kreację?", "Usuń", () => { const cr = (c.creatives || []).filter((_, j) => j !== i); R().update("campaigns", c.id, { creatives: cr }); CT.actions["camp-creatives"]({ dataset: { id: c.id } }); }, true); };

  CT.views["performance/budzety"] = () => {
    const V = "budzety"; const y = U.filterVal(V, "y") || D.today().slice(0, 4); const bf = RL().brandFilter();
    const cs = R().list("campaigns", (c) => (!bf || c.brandId === bf) && ((c.start || "").startsWith(y) || (c.end || "").startsWith(y)));
    const brands = R().list("brands", (b) => !bf || b.id === bf);
    const years = Array.from(new Set(R().list("campaigns").map((c) => (c.start || "").slice(0, 4)).filter(Boolean).concat([D.today().slice(0, 4)]))).sort().reverse();
    const sum = (arr, k) => arr.reduce((s, c) => s + (Number(c[k]) || 0), 0);
    return U.head("Budżety", "Budżety i wydatki kampanii wpisane w module Reklamy i kampanie.")
      + `<div class="filters"><label class="fsel"><span>Rok</span><select data-filter="${V}.y">${years.map((x) => `<option ${x === y ? "selected" : ""}>${x}</option>`).join("")}</select></label></div>`
      + `<div class="kpis">${brands.map((b) => { const bc = cs.filter((c) => c.brandId === b.id); const bud = sum(bc, "budget"), sp = sum(bc, "spend");
          return `<div class="kpi" style="--c:${b.color}"><b>${U.money(sp)}</b><span>${esc(b.name)}: wydatki</span><small>z budżetu ${U.money(bud)}${bud ? ` (${U.pct(sp / bud)})` : ""}</small></div>`; }).join("")}</div>`
      + (cs.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Kampania</th><th>Marka</th><th>Okres</th><th>Budżet</th><th>Wydatki</th><th>Wykorzystanie</th></tr></thead><tbody>
        ${cs.map((c) => `<tr class="click" data-act="camp-edit" data-id="${c.id}"><td><b>${esc(c.name)}</b></td><td>${esc(U.nameOf("brands", c.brandId))}</td><td class="small">${c.start ? D.fmtFull(c.start) : ""}${c.end ? " – " + D.fmtFull(c.end) : ""}</td><td>${U.money(c.budget)}</td><td>${U.money(c.spend)}</td>
          <td>${c.budget ? `<div class="track sm"><div class="fill${c.spend > c.budget ? " over" : ""}" style="width:${Math.min(100, ((c.spend || 0) / c.budget) * 100)}%"></div></div><small>${U.pct((c.spend || 0) / c.budget)}</small>` : "brak budżetu"}</td></tr>`).join("")}
      </tbody></table></div>` : U.empty("Brak kampanii w tym roku."));
  };

  /* ================= AI CONTENT ASSISTANT (planowany) ================= */
  CT.views["ai/asystent"] = () => {
    const fx = [["Generator pomysłów", "Propozycje tematów na podstawie filarów, okazji i Księgi marek."], ["Generator postów", "Szkic tekstu wersji kanałowej z tematu i celu."],
      ["Adaptacja do kanałów", "Jedna treść przepisana na Facebook, Instagram i LinkedIn."], ["CTA i hashtagi", "Warianty wezwań do działania i zestawy hashtagów."],
      ["Scenariusze Reels i wideo", "Scenariusz z listą ujęć do modułu Wideo Content."], ["Prompty do grafiki i wideo", "Prompty do narzędzi AI zgodne z zasadami marki."]];
    return U.head("AI Content Assistant", "Moduł planowany. W Etapie 1 aplikacja nie łączy się z żadnym modelem AI, więc niczego tu nie generuje.")
      + `<div class="notice">Gdy moduł zostanie podłączony, będzie korzystał z Księgi marek, filarów i Banku tematów. Do tego czasu treści przygotowujesz w karcie posta.</div>`
      + `<div class="pillgrid">${fx.map(([t, d]) => `<div class="card planned"><h3>${esc(t)}</h3><p class="small">${esc(d)}</p><span class="tag">Planowane</span></div>`).join("")}</div>`;
  };

  /* ================= USTAWIENIA ================= */
  const BRAND_FIELDS = [{ k: "name", label: "Nazwa", req: true }, { k: "color", label: "Kolor", type: "color" }, { k: "active", label: "Marka aktywna", type: "checkbox" }, { k: "description", label: "Krótki opis", type: "textarea", wide: true, rows: 2 }];
  CT.views["ustawienia/marki"] = () => U.head("Marki", "Dodawanie, edycja i dezaktywacja marek. Zasady komunikacji edytujesz w Brand Center.", `<button class="btn primary" data-act="brand-new">Dodaj markę</button>`)
    + `<div class="tblwrap"><table class="tbl"><thead><tr><th>Marka</th><th>Kanały</th><th>Status</th></tr></thead><tbody>${R().list("brands").map((b) => `<tr class="click" data-act="brand-edit" data-id="${b.id}"><td><span class="swatch" style="background:${b.color}"></span><b>${esc(b.name)}</b></td><td>${R().list("channels", (c) => c.brandId === b.id).map((c) => esc(c.name)).join(", ")}</td><td>${b.active === false ? "Nieaktywna" : "Aktywna"}</td></tr>`).join("")}</tbody></table></div>`;
  CT.actions["brand-new"] = () => U.openForm({ title: "Nowa marka", fields: BRAND_FIELDS, values: { active: true, color: "#7A2040" }, onSave: (v) => R().add("brands", { ...v, character: "", audience: "", tone: "", values: "", rules: "", banned: "", links: "" }, "br") });
  CT.actions["brand-edit"] = (el) => { const b = R().get("brands", el.dataset.id); U.openForm({ title: "Edytuj markę", fields: BRAND_FIELDS, values: b, onSave: (v) => R().update("brands", b.id, v),
    onDelete: R().list("channels", (c) => c.brandId === b.id).length ? null : () => R().remove("brands", b.id) }); };

  const CHANNEL_FIELDS = [
    { k: "name", label: "Nazwa profilu", req: true, wide: true }, { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands(), req: true },
    { k: "platform", label: "Platforma", type: "select", options: () => U.opt.platforms(), req: true }, { k: "mono", label: "Oznaczenie (1–2 znaki)", max: 2 },
    { k: "color", label: "Kolor", type: "color" }, { k: "order", label: "Kolejność w panelu", type: "number" }, { k: "active", label: "Kanał aktywny", type: "checkbox", hint: "Nieaktywny kanał zostaje w panelu z dopiskiem „do decyzji”." },
    { k: "note", label: "Notatka o kanale", wide: true },
    { section: "Rytm publikacji" },
    { k: "perWeek", label: "Postów tygodniowo (cel)", type: "number", min: 0 }, { k: "preferredTime", label: "Preferowana godzina", type: "time" },
    { k: "feedDays", label: "Dni postów", type: "days" }, { k: "storiesDays", label: "Dni stories", type: "days" },
    { k: "noFeedWeekend", label: "W weekend tylko stories", type: "checkbox" }, { k: "storiesPerDay", label: "Maks. stories dziennie", type: "number", min: 0 },
  ];
  const RH = ["perWeek", "preferredTime", "feedDays", "storiesDays", "noFeedWeekend", "storiesPerDay"];
  const flatCh = (c) => ({ ...c, ...(c.rhythm || {}) });
  const packCh = (v) => { const out = { ...v, rhythm: {} }; RH.forEach((k) => { out.rhythm[k] = v[k]; delete out[k]; }); return out; };
  CT.views["ustawienia/kanaly"] = () => U.head("Kanały i rytm publikacji", "Profile w panelu po prawej. Rytm publikacji zasila ostrzeżenia w Harmonogramie i luki na Dashboardzie: alerty informują, niczego nie blokują.", `<button class="btn primary" data-act="ch-new">Dodaj kanał</button>`)
    + `<div class="tblwrap"><table class="tbl"><thead><tr><th>Kanał</th><th>Marka</th><th>Platforma</th><th>Rytm</th><th>Status</th></tr></thead><tbody>${R().list("channels").sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => { const r = c.rhythm || {};
      const rh = [r.perWeek ? `${r.perWeek} posty/tydz.` : "", (r.feedDays || []).length ? "posty: " + r.feedDays.map((d) => D.DOWS[(d + 6) % 7]).join(", ") : "", (r.storiesDays || []).length ? "stories: " + r.storiesDays.map((d) => D.DOWS[(d + 6) % 7]).join(", ") : "", r.noFeedWeekend ? "weekend tylko stories" : "", r.storiesPerDay ? `maks. ${r.storiesPerDay} stories/dzień` : ""].filter(Boolean).join("; ");
      return `<tr class="click" data-act="ch-edit" data-id="${c.id}"><td>${U.mono(c, "sm")} <b>${esc(c.name)}</b></td><td>${esc(U.nameOf("brands", c.brandId))}</td><td>${esc(CT.config.platforms[c.platform] ? CT.config.platforms[c.platform].label : c.platform)}</td><td class="small">${esc(rh || "nie ustawiono")}</td><td>${c.active === false ? "Do decyzji" : "Aktywny"}</td></tr>`; }).join("")}</tbody></table></div>`;
  CT.actions["ch-new"] = () => U.openForm({ title: "Nowy kanał", fields: CHANNEL_FIELDS, values: { active: true, color: "#7A2040", platform: "facebook", order: R().list("channels").length + 1, feedDays: [], storiesDays: [] },
    onSave: (v) => { R().add("channels", packCh(v), "ch"); U.toast("Dodano kanał."); } });
  CT.actions["ch-edit"] = (el) => { const c = R().get("channels", el.dataset.id); U.openForm({ title: "Edytuj kanał", fields: CHANNEL_FIELDS, values: flatCh(c), onSave: (v) => R().update("channels", c.id, packCh(v)),
    onDelete: R().list("versions", (v) => v.channelId === c.id).length ? null : () => R().remove("channels", c.id) }); };

  CT.views["ustawienia/uzytkownicy"] = () => {
    const s = R().settings();
    return U.head("Użytkownicy i role", "Etap 1 działa na jednym urządzeniu. Przełącznik ról w panelu kanałów służy wyłącznie do demonstracji widoków: to nie jest logowanie ani zabezpieczenie dostępu.")
      + `<section class="card"><form id="usersform">${U.fieldsHtml([{ k: "smm", label: "Nazwa roli: Social Media Manager", req: true }, { k: "przelozony", label: "Nazwa roli: Przełożony", req: true }], s.users)}
        <div class="dfoot"><span class="grow"></span><button class="btn primary" type="submit">Zapisz</button></div></form>
        <p class="muted small">Prawdziwe konta, logowanie i uprawnienia wymagają wspólnej bazy danych (Etap 2).</p></section>`;
  };
  CT.afterRender["ustawienia/uzytkownicy"] = () => { const f = document.getElementById("usersform"); if (f) f.addEventListener("submit", (e) => { e.preventDefault(); const v = U.readFields(f, [{ k: "smm" }, { k: "przelozony" }]); if (!v.smm || !v.przelozony) { U.toast("Uzupełnij obie nazwy."); return; } R().setSettings({ users: v }); U.toast("Zapisano."); }); };

  CT.views["ustawienia/statusy"] = () => {
    const s = R().settings(); const ov = s.statusOverrides || {};
    return U.head("Statusy", "Możesz zmienić nazwy i kolory. Kolejności i zestawu statusów nie zmieniamy, bo od nich zależą alerty, archiwum i unieważnianie akceptacji.")
      + `<section class="card"><form id="statform"><div class="tblwrap"><table class="tbl"><thead><tr><th>Status</th><th>Nazwa</th><th>Kolor</th><th>Rodzaj</th></tr></thead><tbody>
        ${CT.config.statuses.map((st) => `<tr><td>${U.badge(st.id)}</td><td><input data-st="${st.id}" data-f="label" value="${esc((ov[st.id] || {}).label || "")}" placeholder="${esc(st.label)}"></td><td><input type="color" data-st="${st.id}" data-f="color" value="${esc((ov[st.id] || {}).color || st.color)}"></td><td class="small">${st.derived ? "Wyliczany z terminu" : "Zapisywany"}</td></tr>`).join("")}
        </tbody></table></div><h4 class="fsec">Statusy produkcji wideo</h4><div class="field wide"><label for="vst">Jeden status w linii</label><textarea id="vst" rows="6">${esc((s.videoStatuses || []).join("\n"))}</textarea></div>
        <div class="dfoot"><span class="grow"></span><button class="btn primary" type="submit">Zapisz</button></div></form></section>`;
  };
  CT.afterRender["ustawienia/statusy"] = () => { const f = document.getElementById("statform"); if (!f) return; f.addEventListener("submit", (e) => {
    e.preventDefault(); const ov = {};
    f.querySelectorAll("[data-st]").forEach((i) => { const base = CT.config.statuses.find((s) => s.id === i.dataset.st); ov[i.dataset.st] = ov[i.dataset.st] || {}; const val = i.value.trim(); if (val && val !== base[i.dataset.f]) ov[i.dataset.st][i.dataset.f] = val; });
    const vst = document.getElementById("vst").value.split("\n").map((x) => x.trim()).filter(Boolean);
    R().setSettings({ statusOverrides: ov, videoStatuses: vst.length ? vst : CT.config.defaultVideoStatuses.slice() }); U.toast("Zapisano statusy."); }); };

  const BRIEF_FIELDS = [
    { k: "enabled", label: "Briefing włączony (na razie widok w aplikacji)", type: "checkbox" }, { k: "time", label: "Godzina wysyłki", type: "time" },
    { k: "days", label: "Dni tygodnia", type: "days" }, { k: "recipient", label: "Odbiorca (e-mail)", type: "email" }, { k: "onlyAlerts", label: "Wysyłaj tylko, gdy są alerty", type: "checkbox" },
    { section: "Zakres informacji" },
    { k: "s_today", label: "Publikacje na dziś", type: "checkbox" }, { k: "s_confirm", label: "Wymagające potwierdzenia", type: "checkbox" }, { k: "s_late", label: "Opóźnione", type: "checkbox" },
    { k: "s_approvals", label: "Oczekujące na akceptację", type: "checkbox" }, { k: "s_fixes", label: "Poprawki", type: "checkbox" }, { k: "s_tasks", label: "Zadania na dziś", type: "checkbox" }, { k: "s_next2", label: "Kolejne 2 dni", type: "checkbox" },
  ];
  CT.views["ustawienia/powiadomienia"] = () => {
    const b = R().settings().briefing; const vals = { ...b }; Object.entries(b.scope || {}).forEach(([k, v]) => { vals["s_" + k] = v; });
    return U.head("Powiadomienia i briefing", "Konfiguracja porannego briefingu. Automatyczna wysyłka e-mail wymaga serwera i dostawcy poczty: zostanie podłączona w Etapie 3, ustawienia już się zapisują.")
      + `<section class="card"><form id="briefform">${U.fieldsHtml(BRIEF_FIELDS, vals)}<div class="dfoot"><a class="btn ghost" href="#/dashboard/briefing">Zobacz briefing</a><span class="grow"></span><button class="btn primary" type="submit">Zapisz</button></div></form></section>`;
  };
  CT.afterRender["ustawienia/powiadomienia"] = () => { const f = document.getElementById("briefform"); if (!f) return; f.addEventListener("submit", (e) => {
    e.preventDefault(); const v = U.readFields(f, BRIEF_FIELDS); const scope = {};
    Object.keys(v).filter((k) => k.startsWith("s_")).forEach((k) => { scope[k.slice(2)] = v[k]; delete v[k]; });
    R().setSettings({ briefing: { ...v, scope } }); U.toast("Zapisano ustawienia briefingu."); }); };

  CT.views["ustawienia/dane"] = () => {
    const kb = (CT.storage.sizeBytes() / 1024).toFixed(0);
    const demo = R().list("posts", (p) => p.demo).length + R().list("topics", (t) => t.demo).length + R().list("tasks", (t) => t.demo).length;
    return U.head("Dane i kopia", "Etap 1 zapisuje dane w tej przeglądarce na tym komputerze. Wyczyszczenie danych przeglądarki usuwa też dane aplikacji: rób kopię regularnie.")
      + `<div class="grid2"><section class="card"><h2>Kopia zapasowa</h2><p class="small">Plik JSON z postami, wersjami, historią, tematami, zadaniami, kampaniami i ustawieniami. <b>Nie zawiera plików z Biblioteki materiałów.</b></p>
          <div class="btnrow"><button class="btn primary" data-act="data-export">Pobierz kopię</button><label class="btn">Przywróć z kopii<input type="file" accept="application/json,.json" hidden data-act-change="data-import"></label></div>
          <p class="muted small">Rozmiar danych: ${kb} KB.</p></section>
        <section class="card"><h2>Dane demonstracyjne</h2><p class="small">Przykładowe posty, tematy i zadanie (${demo}). Marki, kanały, filary, formaty i okazje zostają.</p>
          <div class="btnrow"><button class="btn" data-act="data-demo" ${demo ? "" : "disabled"}>Usuń dane demonstracyjne</button><button class="btn ghost danger" data-act="data-reset">Przywróć stan początkowy</button></div></section></div>`;
  };
  function downloadJSON(name) {
    const blob = new Blob([R().exportJSON()], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  CT.actions["data-export"] = () => {
    if (CT.config.preview) { U.dialog(`<h2>Kopia danych</h2><p class="muted">W podglądzie online pobieranie plików nie działa. Skopiuj tekst i zapisz go jako plik .json.</p><textarea class="copybox" rows="14" readonly>${esc(R().exportJSON())}</textarea>`, { wide: true }); return; }
    downloadJSON(`centrum-tresci-kopia-${D.today()}.json`);
    U.toast("Pobrano kopię danych.");
  };
  CT.actions["data-import"] = (el) => {
    const file = el.files && el.files[0]; if (!file) return;
    el.value = "";
    if (R().isStale()) { U.toast("Dane zmieniono w innej karcie. Kliknij „Odśwież” przed przywróceniem kopii."); return; }
    const backupNote = CT.config.preview ? "" : " Najpierw pobierzemy kopię obecnych danych (plik z datą i godziną w nazwie).";
    U.confirm(`Przywrócenie zastąpi wszystkie obecne dane danymi z kopii.${backupNote} Kontynuować?`, "Pobierz kopię i przywróć", () => {
      const rd = new FileReader();
      rd.onload = () => {
        let obj;
        try { obj = JSON.parse(rd.result); } catch (e) { U.toast("Nie udało się przywrócić: plik nie jest poprawnym JSON."); return; }
        if (!obj || !obj.meta || !Array.isArray(obj.posts) || !Array.isArray(obj.versions)) { U.toast("Nie udało się przywrócić: to nie jest kopia Centrum treści."); return; }
        /* Kopia bezpieczeństwa obecnych danych, zanim cokolwiek nadpiszemy. */
        if (!CT.config.preview) downloadJSON(`centrum-tresci-kopia-przed-przywroceniem-${D.today()}_${D.nowTime().replace(":", "-")}.json`);
        try { R().importJSON(obj); U.toast("Przywrócono dane z kopii. Kopia poprzednich danych jest w pobranych plikach."); }
        catch (e) { if (!e.stale) U.toast("Nie udało się przywrócić: " + e.message); else throw e; }
      };
      rd.readAsText(file);
    }, true);
  };
  CT.actions["data-demo"] = () => U.confirm("Usunąć dane demonstracyjne?", "Usuń dane demo", () => { R().clearDemo(); U.toast("Usunięto dane demonstracyjne."); }, true);
  CT.actions["data-reset"] = () => U.confirm("Przywrócić stan początkowy? Wszystkie Twoje dane zostaną usunięte. Najpierw pobierz kopię.", "Przywróć stan początkowy", () => { R().resetAll(); U.toast("Przywrócono stan początkowy."); }, true);
})();

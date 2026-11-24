/* Newslettery: Plan wysyłek, Bank tematów, Grafiki, Statystyki, Listy.
   Wydanie newslettera (kolekcja newsletters) należy do listy (nlLists: Newsletter BOK, MailerLite).
   Tematy pochodzą z tego samego Banku tematów co social media (pole targets zawiera "newsletter"). */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc, C = CT.config;
  const R = () => CT.repo;

  const lists = () => R().list("nlLists");
  const listOf = (n) => R().get("nlLists", n.listId) || {};
  const nlTopics = () => R().list("topics", (t) => (t.targets || []).includes("newsletter"));
  const variantOpts = () => Array.from(new Set(lists().flatMap((l) => l.variants || []))).map((v) => [v, v]);
  const imageAssets = () => R().list("assets", (a) => a.type === "image").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((a) => [a.id, a.name]);

  const NL_FIELDS = [
    { k: "title", label: "Temat wydania", req: true, wide: true },
    { k: "listId", label: "Lista", type: "select", options: () => lists().map((l) => [l.id, l.name]), req: true },
    { k: "variant", label: "Wersja", type: "select", options: variantOpts },
    { k: "date", label: "Planowana data wysyłki", type: "date" },
    { k: "status", label: "Status", type: "select", options: C.nlStatuses, req: true },
    { k: "audience", label: "Odbiorcy", type: "select", options: [["B2B", "B2B"], ["B2C", "B2C"]] },
    { k: "goal", label: "Cel wydania" },
    { k: "subject", label: "Temat maila", wide: true, max: 150 },
    { k: "preheader", label: "Preheader", wide: true, max: 150 },
    { k: "content", label: "Treść lub moduły", type: "textarea", wide: true, rows: 6, hint: "Sekcje w kolejności. Newsletter nie może być przeładowany treścią." },
    { k: "cta", label: "CTA" }, { k: "link", label: "Link", type: "url" },
    { k: "topicId", label: "Temat z banku", type: "select", options: () => nlTopics().map((t) => [t.id, t.title]) },
    { k: "assetIds", label: "Grafiki (z biblioteki)", type: "multi", options: imageAssets },
    { k: "postIds", label: "Powiązane posty social media", type: "multi", options: () => U.opt.posts() },
    { k: "notes", label: "Uwagi", type: "textarea", wide: true, rows: 2 },
  ];
  const HL = { utworzenie_newslettera: "Utworzenie", zmiana_daty: "Zmiana daty", zmiana_statusu_nl: "Zmiana statusu", zmiana_materialow: "Zmiana grafik" };
  const fmtH = (type, x) => (x == null || x === "" ? "brak" : type === "zmiana_daty" ? D.fmtFull(x) : type === "zmiana_statusu_nl" ? U.label(C.nlStatuses, x) : x);

  CT.forms.newsletter = (n, preset = {}) => {
    const l = n ? listOf(n) : R().get("nlLists", preset.listId) || lists()[0] || {};
    const assets = n ? (n.assetIds || []).map((id) => R().get("assets", id)).filter(Boolean) : [];
    const hist = n ? (n.history || []).slice().reverse() : [];
    U.openForm({
      title: n ? "Wydanie newslettera" : "Zaplanuj wydanie", fields: NL_FIELDS,
      values: n || { status: "pomysl", listId: l.id, audience: l.audience || "B2B", variant: (l.variants || [])[0] || "", ...preset },
      intro: l.note ? `Lista ${esc(l.name || "")}: ${esc(l.note)}` : "",
      extraHtml: (assets.length ? `<h4 class="fsec">Grafiki wydania</h4><div class="nlthumbs">${assets.map((a) => `<span>${U.thumb(a)}</span>`).join("")}</div>` : "")
        + (hist.length ? `<h4 class="fsec">Historia</h4><ul class="hist">${hist.map((e) => `<li><b>${esc(HL[e.type] || e.type)}</b> <span class="muted small">${esc(e.user)}, ${D.fmtTs(e.at)}</span><div class="small">${esc(e.desc || "")}${e.from != null || e.to != null ? `: ${esc(fmtH(e.type, e.from))} → ${esc(fmtH(e.type, e.to))}` : ""}</div></li>`).join("")}</ul>` : ""),
      saveLabel: n ? "Zapisz" : "Zaplanuj",
      onSave: (vals) => { R().saveNewsletter(n ? n.id : null, vals); U.toast(n ? "Zapisano wydanie." : "Zaplanowano wydanie."); },
      onDelete: n ? () => { R().deleteNewsletter(n.id); U.toast("Usunięto wydanie."); } : null,
    });
  };
  CT.actions["nl-open"] = (el) => { const n = R().get("newsletters", el.dataset.id); if (n) CT.forms.newsletter(n); };
  CT.actions["nl-new"] = (el) => CT.forms.newsletter(null, el.dataset.list ? { listId: el.dataset.list } : {});
  CT.actions["nl-upload"] = async (el) => {
    const n = R().get("newsletters", el.dataset.id); if (!n) return;
    const created = await U.uploadFiles(el.files, { brandId: "", channelId: "" });
    created.forEach((a) => R().update("assets", a.id, { tags: Array.from(new Set([...(a.tags || []), "newsletter"])) }));
    if (created.length) R().saveNewsletter(n.id, { assetIds: (n.assetIds || []).concat(created.map((a) => a.id)) });
  };

  /* ================= PLAN WYSYŁEK ================= */
  function nlCard(n) {
    const a = R().get("assets", (n.assetIds || [])[0]); const l = listOf(n);
    const late = n.date && n.date < D.today() && !["wyslany", "anulowany"].includes(n.status);
    return `<article class="nlcard${n.status === "anulowany" ? " cancelled" : ""}" style="--c:${l.color || "#7A2040"}">
      <button class="nlmain" data-act="nl-open" data-id="${n.id}">
        <span class="nlth">${a ? U.thumb(a) : `<span class="ph">${esc(l.short || "NL")}</span>`}</span>
        <span class="nltx"><small>${n.date ? D.fmtFull(n.date) : "bez terminu"}${n.variant ? `, ${esc(n.variant)}` : ""}</small>
          <b>${esc(n.title)}</b>${n.subject ? `<small class="subj">${esc(n.subject)}</small>` : ""}
          <span class="nlbadges">${U.nlBadge(n.status)}${late ? `<span class="badge" style="--s:#9E2430"><i class="dot" style="--s:#9E2430"></i>Po terminie</span>` : ""}</span></span>
      </button>
      <label class="linkbtn nlup">Dodaj grafikę<input type="file" hidden accept="image/*" data-act-change="nl-upload" data-id="${n.id}"></label>
    </article>`;
  }
  CT.views["newsletter/plan"] = (r) => {
    const V = "nlplan"; const st = U.state;
    const open = r.q.get("nl"); if (open && R().get("newsletters", open) && st.nlOpened !== open) { st.nlOpened = open; setTimeout(() => CT.forms.newsletter(R().get("newsletters", open)), 0); }
    if (!r.q.get("nl")) st.nlOpened = null;
    const t = D.today(); if (!st.nlMonth) st.nlMonth = t.slice(0, 7);
    const ym = st.nlMonth; const lf = U.filterVal(V, "list"); const focus = st.nlFocus || "";
    const all = R().list("newsletters", (n) => !lf || n.listId === lf);
    const prep = all.filter((n) => ["pomysl", "w_przygotowaniu"].includes(n.status));
    const inMonth = all.filter((n) => n.date && n.date.startsWith(ym) && n.status !== "anulowany");
    const next = all.filter((n) => n.date && n.date >= t && !["wyslany", "anulowany"].includes(n.status)).sort((a, b) => a.date.localeCompare(b.date))[0];
    const sentM = all.filter((n) => n.status === "wyslany" && n.date && n.date.startsWith(ym)).length;
    const sentP = all.filter((n) => n.status === "wyslany" && n.date && n.date.startsWith(D.addMonths(ym, -1))).length;
    const chip = lf ? (R().get("nlLists", lf) || {}).name : "Wszystkie listy";
    const tiles = `<div class="ptiles">
      ${U.tile({ tone: "pink", key: "nl-prep", label: "W przygotowaniu", value: prep.length, sub: "pomysły i wydania w pracy", chip, on: focus === "nl-prep" })}
      ${U.tile({ tone: "sage", key: "nl-month", label: `Zaplanowane: ${D.MONTHS[Number(ym.slice(5)) - 1].toLowerCase()}`, value: inMonth.length, sub: "wydania z datą w miesiącu", chip, on: focus === "nl-month" })}
      ${U.tile({ tone: "sand", key: "nl-next", label: "Najbliższa wysyłka", value: next ? D.fmtDay(next.date) : "brak", sub: next ? next.title : "nic nie zaplanowano", chip })}
      ${U.tile({ tone: "lilac", key: "nl-sent", label: "Wysłane w miesiącu", value: sentM, sub: U.delta(sentM, sentP, "poprzedni miesiąc"), chip, on: focus === "nl-sent" })}
    </div>`;
    const pass = (n) => (focus === "nl-prep" ? ["pomysl", "w_przygotowaniu"].includes(n.status) : focus === "nl-sent" ? n.status === "wyslany" : true);
    const ls = lists().filter((l) => !lf || l.id === lf);
    /* Ostrzeżenie: ten sam temat na obu listach w odstępie poniżej 7 dni (newslettery mają się uzupełniać, nie powielać). */
    const dup = [];
    const withTopic = R().list("newsletters", (n) => n.topicId && n.date && n.status !== "anulowany");
    withTopic.forEach((a) => withTopic.forEach((b) => {
      if (a.id < b.id && a.topicId === b.topicId && a.listId !== b.listId && Math.abs(D.toUTC(a.date) - D.toUTC(b.date)) < 7 * 864e5) dup.push(a.title);
    }));
    const cols = ls.map((l) => {
      const items = all.filter((n) => n.listId === l.id && pass(n));
      const dated = items.filter((n) => n.date && n.date.startsWith(ym)).sort((a, b) => a.date.localeCompare(b.date));
      const undated = items.filter((n) => !n.date);
      return `<section class="nlcol" style="--c:${l.color || "#7A2040"}"><div class="cardhead"><h2><i class="cd" style="background:${l.color}"></i>${esc(l.name)} <span class="cnt">${dated.length}</span></h2><button class="btn small" data-act="nl-new" data-list="${l.id}">Zaplanuj</button></div>
        <p class="muted small">${esc(l.tool || "")}${l.audience ? `, ${esc(l.audience)}` : ""}</p>
        ${dated.length ? dated.map(nlCard).join("") : `<p class="muted small pempty">Brak wydań w tym miesiącu.</p>`}
        ${undated.length ? `<h3 class="nlsub">Bez terminu</h3>${undated.map(nlCard).join("")}` : ""}</section>`;
    }).join("");
    return U.head("Plan wysyłek", "Wydania newsletterów obok siebie, lista przy liście: łatwo sprawdzić, czy BOK i MailerLite się uzupełniają, a nie powtarzają.", `<button class="btn primary" data-act="nl-new">Zaplanuj wydanie</button>`)
      + tiles
      + `<div class="toolbar"><div class="pager"><button class="icon" data-act="nl-prev" aria-label="Poprzedni miesiąc">‹</button><b>${esc(D.monthLabel(ym))}</b><button class="icon" data-act="nl-next" aria-label="Następny miesiąc">›</button><button class="btn ghost small" data-act="nl-today">Dziś</button></div>
          ${U.filterSelect(V, "list", "Lista", lists().map((l) => [l.id, l.name]))}${focus ? `<button class="btn ghost small" data-act="nl-clear">Pokaż wszystkie statusy</button>` : ""}</div>`
      + (dup.length ? `<div class="notice warn">Ten sam temat na dwóch listach w odstępie krótszym niż 7 dni: ${dup.map(esc).join(", ")}. Upewnij się, że treści się uzupełniają, a nie powtarzają.</div>` : "")
      + (ls.length ? `<div class="nlcols">${cols}</div>` : U.empty("Brak list newsletterowych. Dodaj je w zakładce Listy."));
  };
  CT.actions["nl-prev"] = () => { U.state.nlMonth = D.addMonths(U.state.nlMonth, -1); CT.render(); };
  CT.actions["nl-next"] = () => { U.state.nlMonth = D.addMonths(U.state.nlMonth, 1); CT.render(); };
  CT.actions["nl-today"] = () => { U.state.nlMonth = D.today().slice(0, 7); CT.render(); };
  CT.actions["nl-clear"] = () => { U.state.nlFocus = ""; CT.render(); };

  /* ================= BANK TEMATÓW NEWSLETTERA ================= */
  CT.views["newsletter/tematy"] = () => {
    const V = "nltematy"; const f = (k) => U.filterVal(V, k);
    const rows = nlTopics().filter((t) => (!f("list") || (t.nlListIds || []).includes(f("list"))) && (!f("status") || t.status === f("status")) && U.match(f("q"), t.title, t.description, t.notes))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return U.head("Bank tematów newslettera", "Ten sam Bank tematów co w social media: temat może służyć obu kanałom. Tu widzisz tematy przeznaczone na newsletter.",
        `<button class="btn primary" data-act="nl-topic-new">Dodaj temat</button>`)
      + `<div class="filters">${U.filterSearch(V)}${U.filterSelect(V, "list", "Lista", lists().map((l) => [l.id, l.name]))}${U.filterSelect(V, "status", "Status", C.topicStatuses)}</div>`
      + (rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Temat</th><th>Listy</th><th>Status</th><th>Wydania</th><th></th></tr></thead><tbody>
        ${rows.map((t) => `<tr class="click" data-act="topic-edit" data-id="${t.id}"><td><b>${esc(t.title)}</b>${t.description ? `<br><small class="muted">${esc(t.description)}</small>` : ""}${t.notes ? `<br><small class="warntext">${esc(t.notes)}</small>` : ""}</td>
          <td class="small">${(t.nlListIds || []).map((id) => esc((R().get("nlLists", id) || {}).name || "")).join(", ") || "<span class='muted'>brak</span>"}</td>
          <td>${esc(U.label(C.topicStatuses, t.status))}</td>
          <td class="small">${(t.nlIds || []).map((id) => R().get("newsletters", id)).filter(Boolean).map((n) => `${esc(listOf(n).short || "")}: ${n.date ? D.fmtDay(n.date) : "bez terminu"}`).join("<br>") || "<span class='muted'>brak</span>"}</td>
          <td><button class="btn small" data-act="nl-from-topic" data-id="${t.id}">Zaplanuj wydanie</button></td></tr>`).join("")}
      </tbody></table></div>` : U.empty("Brak tematów newsletterowych.", `<button class="btn primary" data-act="nl-topic-new">Dodaj temat</button>`));
  };
  CT.actions["nl-topic-new"] = () => CT.forms.topic(null, { targets: ["newsletter"], channelIds: [], nlListIds: lists().slice(0, 1).map((l) => l.id) });
  CT.actions["nl-from-topic"] = (el, e) => {
    e.stopPropagation();
    const t = R().get("topics", el.dataset.id);
    CT.forms.newsletter(null, { title: t.title, topicId: t.id, listId: (t.nlListIds || [])[0] || (lists()[0] || {}).id, goal: t.goal || "", content: t.description || "", notes: t.notes || "" });
  };

  /* ================= GRAFIKI ================= */
  CT.views["newsletter/grafiki"] = () => {
    const V = "nlgraf"; const lf = U.filterVal(V, "list");
    const used = {}; R().list("newsletters").forEach((n) => (n.assetIds || []).forEach((id) => { (used[id] = used[id] || []).push(n); }));
    const items = R().list("assets", (a) => (used[a.id] || (a.tags || []).includes("newsletter")) && (!lf || (used[a.id] || []).some((n) => n.listId === lf)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const fmts = R().list("formats", (f) => f.kind === "newsletter");
    return U.head("Grafiki newsletterów", "Grafiki podpięte do wydań i oznaczone tagiem „newsletter”. Pliki są w Bibliotece materiałów, więc możesz ich użyć także w postach.",
        `<label class="btn primary">Dodaj grafiki<input type="file" multiple hidden accept="image/*" data-act-change="nl-lib-upload"></label>`)
      + (fmts.length ? `<div class="notice">${fmts.map((f) => `<b>${esc(f.name)}</b>: ${f.width} × ${f.height} px${f.notes ? `. ${esc(f.notes)}` : ""}`).join("<br>")}</div>` : "")
      + `<div class="filters">${U.filterSelect(V, "list", "Lista", lists().map((l) => [l.id, l.name]))}</div>`
      + (items.length ? `<div class="libgrid">${items.map((a) => { const ns = used[a.id] || []; const fit = fmts.some((f) => a.width && f.width && Math.abs(a.width / a.height - f.width / f.height) < 0.02);
          return `<button class="libitem" data-act="asset-open" data-id="${a.id}"><span class="libth">${U.thumb(a)}</span><b>${esc(a.name)}</b>
            <small>${a.width ? `${a.width}×${a.height}${fmts.length ? (fit ? ", format BOK" : ", inny format") : ""}` : ""}</small>
            <small>${ns.length ? ns.map((n) => esc(`${listOf(n).short || ""}: ${n.title}`)).join("; ") : "niepodpięta do wydania"}</small></button>`; }).join("")}</div>`
        : U.empty("Brak grafik newsletterowych. Dodaj je tutaj albo z karty wydania w Planie wysyłek."));
  };
  CT.actions["nl-lib-upload"] = async (el) => {
    const created = await U.uploadFiles(el.files, { brandId: "", channelId: "" });
    created.forEach((a) => R().update("assets", a.id, { tags: Array.from(new Set([...(a.tags || []), "newsletter"])) }));
  };

  /* ================= STATYSTYKI ================= */
  const NL_METRICS = [["sent", "Wysłano (adresów)"], ["opens", "Otwarcia (%)"], ["clicks", "Kliknięcia (%)"], ["unsubs", "Wypisania"]];
  CT.views["newsletter/statystyki"] = () => {
    const sent = R().list("newsletters", (n) => n.status === "wyslany").sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const avg = (arr, k) => { const v = arr.map((n) => (n.stats || {})[k]).filter((x) => x != null && x !== ""); return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null; };
    return U.head("Statystyki newsletterów", "Wyniki wpisujesz ręcznie z MailerLite i z raportu BOK. Automatyczne pobieranie z MailerLite to rozszerzenie na później.")
      + `<div class="kpis">${lists().map((l) => { const ns = sent.filter((n) => n.listId === l.id); const o = avg(ns, "opens"); const c = avg(ns, "clicks");
          return `<div class="kpi" style="--c:${l.color}"><b>${o != null ? o.toFixed(1).replace(".", ",") + "%" : "brak"}</b><span>${esc(l.name)}: średnie otwarcia</span><small>kliknięcia ${c != null ? c.toFixed(1).replace(".", ",") + "%" : "brak"}, wydań z wynikami: ${ns.filter((n) => (n.stats || {}).opens != null && (n.stats || {}).opens !== "").length}</small></div>`; }).join("")}</div>`
      + (sent.length ? `<section class="card"><h2>Wysłane wydania</h2><div class="tblwrap"><table class="tbl metrics"><thead><tr><th>Wydanie</th>${NL_METRICS.map(([, l]) => `<th>${l}</th>`).join("")}<th></th></tr></thead><tbody>
        ${sent.map((n) => `<tr data-row="${n.id}"><td><button class="linkbtn strong" data-act="nl-open" data-id="${n.id}">${esc(n.title)}</button><br><small class="muted">${esc(listOf(n).name || "")}, ${n.date ? D.fmtFull(n.date) : ""}</small></td>
          ${NL_METRICS.map(([k]) => `<td><input type="number" min="0" step="any" data-m="${k}" value="${(n.stats || {})[k] ?? ""}" aria-label="${k}"></td>`).join("")}
          <td><button class="btn small" data-act="nl-stats" data-id="${n.id}">Zapisz</button></td></tr>`).join("")}
        </tbody></table></div></section>` : U.empty("Brak wysłanych wydań. Status „Wysłany” ustawisz w karcie wydania."));
  };
  CT.actions["nl-stats"] = (el) => {
    const row = el.closest("[data-row]"); const stats = {};
    row.querySelectorAll("[data-m]").forEach((i) => { stats[i.dataset.m] = i.value === "" ? null : Number(i.value); });
    R().update("newsletters", el.dataset.id, { stats }); U.toast("Zapisano wyniki.");
  };

  /* ================= LISTY ================= */
  const LIST_FIELDS = [
    { k: "name", label: "Nazwa listy", req: true }, { k: "short", label: "Skrót (np. BOK)", max: 6 },
    { k: "tool", label: "Narzędzie wysyłki" }, { k: "audience", label: "Odbiorcy", type: "select", options: [["B2B", "B2B"], ["B2C", "B2C"], ["B2B i B2C", "B2B i B2C"]] },
    { k: "color", label: "Kolor", type: "color" }, { k: "active", label: "Lista aktywna", type: "checkbox" },
    { k: "variants", label: "Wersje wydania", type: "tags", wide: true, hint: "Np. Pełna wersja, Biuletyn BOK." },
    { k: "note", label: "Zasady listy", type: "textarea", wide: true, rows: 3, hint: "Wyświetlają się przy planowaniu każdego wydania." },
  ];
  CT.views["newsletter/listy"] = () => U.head("Listy newsletterowe", "Listy i ich zasady. Odbiorcy B2C pojawią się tu dopiero po decyzji o komunikacji B2C.", `<button class="btn primary" data-act="nl-list-new">Dodaj listę</button>`)
    + `<div class="bookgrid">${lists().map((l) => `<article class="card book" style="--c:${l.color}"><div class="cardhead"><h2>${esc(l.name)}</h2><button class="btn small" data-act="nl-list-edit" data-id="${l.id}">Edytuj</button></div>
      <dl><dt>Narzędzie</dt><dd>${esc(l.tool || "")}</dd><dt>Odbiorcy</dt><dd>${esc(l.audience || "")}</dd><dt>Wersje wydania</dt><dd>${(l.variants || []).map(esc).join(", ") || "brak"}</dd><dt>Zasady</dt><dd>${l.note ? U.nl2br(l.note) : "brak"}</dd>
      <dt>Wydania</dt><dd>${R().list("newsletters", (n) => n.listId === l.id).length}</dd></dl></article>`).join("")}</div>`;
  CT.actions["nl-list-new"] = () => U.openForm({ title: "Nowa lista", fields: LIST_FIELDS, values: { active: true, audience: "B2B", color: "#7A2040", variants: [] }, onSave: (v) => R().add("nlLists", v, "nl") });
  CT.actions["nl-list-edit"] = (el) => { const l = R().get("nlLists", el.dataset.id); U.openForm({ title: "Edytuj listę", fields: LIST_FIELDS, values: l, onSave: (v) => R().update("nlLists", l.id, v),
    onDelete: R().list("newsletters", (n) => n.listId === l.id).length ? null : () => R().remove("nlLists", l.id) }); };

  /* Kafelki planu wysyłek */
  const prevTile = CT.actions["tile"];
  CT.actions["tile"] = (el) => {
    const k = el.dataset.k;
    if (k && k.startsWith("nl-")) { U.state.nlFocus = ["nl-prep", "nl-sent"].includes(k) && U.state.nlFocus !== k ? k : ""; if (k === "nl-month") U.state.nlFocus = ""; CT.render(); return; }
    prevTile(el);
  };
})();

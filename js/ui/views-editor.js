/* Karta posta: pełnoekranowy widok roboczy. Lewa kolumna: edycja posta i wersji kanałowych.
   Prawa kolumna: podgląd na żywo (sticky).
   Niezapisane zmiany są szkicami w CT.drafts (sessionStorage), osobno dla posta, każdej wersji i komentarza:
   przetrwają przerysowanie widoku, przejście do innej zakładki i odświeżenie strony. Szkic pamięta updatedAt
   rekordu, od którego powstał. Jeśli rekord zmieniono gdzie indziej (inna karta), szkic dostaje flagę konfliktu
   i nic nie zapisujemy, dopóki użytkownik nie wybierze: zachować szkic czy go odrzucić. */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc;
  const R = () => CT.repo;
  const RL = () => CT.rules;
  const DR = CT.drafts;

  /* ---------- szkice ---------- */
  const vKey = (v) => `post/${v.postId}/v/${v.id}`;
  const pKey = (pid) => `post/${pid}/post`;
  const cKey = (v) => `post/${v.postId}/c/${v.id}`;
  const NEW_KEY = "post/new";
  const differs = (vals, rec) => Object.keys(vals).some((k) => JSON.stringify(vals[k] ?? "") !== JSON.stringify(rec[k] ?? ""));
  const FIELD_LABELS = { channelId: "Kanał", date: "Data", time: "Godzina", format: "Format", text: "Tekst", cta: "CTA", hashtags: "Hashtagi", link: "Link",
    internalNotes: "Uwagi wewnętrzne", assetIds: "Materiały", title: "Temat posta", brandId: "Marka", pillarId: "Filar", goal: "Cel", concept: "Opis koncepcji",
    topicId: "Temat z banku", campaignId: "Kampania", notes: "Uwagi" };
  const diffLabels = (vals, rec) => Object.keys(vals).filter((k) => JSON.stringify(vals[k] ?? "") !== JSON.stringify(rec[k] ?? "")).map((k) => FIELD_LABELS[k] || k);

  /* Zapis szkicu rekordu (wersji albo posta). Bazą jest updatedAt z chwili powstania szkicu. */
  function putDraft(key, rec, vals) {
    const old = DR.get(key);
    if (!differs(vals, rec)) { DR.del(key); return; }
    DR.set(key, { vals, base: old ? old.base : rec.updatedAt, conflict: old ? !!old.conflict : false, at: D.nowISO() });
  }
  const vDraft = (v) => DR.get(vKey(v));
  const pDraft = (pid) => DR.get(pKey(pid));
  const putVDraft = (v, vals) => putDraft(vKey(v), v, vals);
  const cDraft = (v) => DR.get(cKey(v)) || { text: "", target: "tresc", replyTo: null, replyText: "" };
  function putCDraft(v, patch) {
    const d = { ...cDraft(v), ...patch };
    if (!d.text && !d.replyTo && !d.replyText) DR.del(cKey(v)); else DR.set(cKey(v), d);
  }
  /* Przegląd szkiców po wczytaniu danych (start aplikacji, „Odśwież”): wykrycie zmian zrobionych gdzie indziej. */
  function reviewDrafts(markConflicts) {
    let orphans = 0;
    DR.keys("post/").forEach((k) => {
      const [, pid, kind, vid] = k.split("/");
      if (pid === "new") return;
      const d = DR.get(k); if (!d) return;
      const rec = kind === "post" ? R().get("posts", pid) : R().get("versions", vid);
      if (kind === "c") { if (!rec) DR.del(k); return; }
      if (!rec) { orphans++; DR.del(k); return; }
      if (!differs(d.vals, rec)) { DR.del(k); return; }
      if (d.base !== rec.updatedAt) {
        if (markConflicts) d.conflict = true; else if (!d.conflict) d.base = rec.updatedAt;
        DR.set(k, d);
      }
    });
    return orphans;
  }
  R().onLoad(() => { const n = reviewDrafts(true); if (n) setTimeout(() => U.toast(`Usunięto ${n} ${U.plural(n, "szkic", "szkice", "szkiców")}: post lub wersja zostały usunięte w innej karcie.`), 0); });
  /* Zmiany zapisane w tej karcie przesuwają bazę szkiców bez konfliktu (np. zmiana statusu przy otwartym szkicu). */
  R().subscribe(() => reviewDrafts(false));

  const draftLive = (k) => { const d = DR.get(k); if (!d) return false; return k.includes("/c/") ? !!(d.text || d.replyText) : true; };
  U.hasUnsavedDrafts = () => DR.keys("post/").some(draftLive);
  U.onLeavePost = (pid) => {
    const live = DR.keys(`post/${pid}/`).filter(draftLive).length + (pid === "new" && draftLive(NEW_KEY) ? 1 : 0);
    if (!live) return;
    const p = R().get("posts", pid);
    U.toast(pid === "new" ? "Niezapisany nowy post został zachowany jako szkic. Wróci po ponownym otwarciu formularza."
      : `Niezapisane zmiany w „${p ? p.title : "poście"}” zostały zachowane jako szkic. Wrócą po otwarciu posta.`);
  };

  const POST_FIELDS = [
    { k: "title", label: "Temat posta", req: true, wide: true, max: 160 },
    { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands(), req: true },
    { k: "pillarId", label: "Filar treści", type: "select", options: () => U.opt.pillars() },
    { k: "goal", label: "Cel publikacji", wide: true },
    { k: "concept", label: "Opis koncepcji", type: "textarea", wide: true },
    { k: "topicId", label: "Temat z banku", type: "select", options: () => U.opt.topics() },
    { k: "campaignId", label: "Kampania", type: "select", options: () => U.opt.campaigns() },
    { k: "notes", label: "Uwagi wewnętrzne (post)", type: "textarea", wide: true, rows: 2 },
  ];

  /* ---------- nowy post ---------- */
  function viewNew() {
    /* Nowe wejście (z tematu, z dnia w kalendarzu) zastępuje stary szkic nowego posta. */
    if (U.state.newPostPrefill || U.state.newPostDate) DR.del(NEW_KEY);
    const nd = DR.get(NEW_KEY);
    const pre = (nd && nd.vals) || U.state.newPostPrefill || {};
    const cf = RL().channelFilter();
    const chs = R().list("channels", (c) => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const preCh = (nd && nd.channelIds) || pre.channelIds || (cf ? [cf] : []);
    const date = (nd && nd.date) || U.state.newPostDate || D.today();
    const brandId = pre.brandId || (cf ? R().get("channels", cf).brandId : "");
    return `<div class="crumbs"><a href="#/studio/posty">Karty postów</a> / Nowy post</div>
      ${U.head("Nowy post", "Post to koncepcja. Wersje kanałowe (Facebook, Instagram, LinkedIn) mają własne treści, terminy i akceptację.")}
      ${nd ? `<div class="notice warn"><b>Niezapisane zmiany: zapisz albo odrzuć.</b> Formularz przywrócono ze szkicu. <button type="button" class="btn small ghost" data-act="np-discard">Odrzuć szkic</button></div>` : ""}
      <form class="card newpost" id="newpost">
        ${U.fieldsHtml(POST_FIELDS, { ...pre, brandId })}
        <h4 class="fsec">Wersje kanałowe</h4>
        <div class="checks" id="np-ch">${chs.map((c) => `<label class="check"><input type="checkbox" value="${c.id}" ${preCh.includes(c.id) ? "checked" : ""}> ${esc(c.name)}</label>`).join("")}</div>
        <div class="fgrid">
          <div class="field"><label for="np-date">Data publikacji *</label><input id="np-date" type="date" value="${esc(date)}" required></div>
          <div class="field"><label for="np-time">Godzina</label><input id="np-time" type="time" value="${esc((nd && nd.time) || "")}"></div>
          <div class="field"><label for="np-fmt">Format</label><select id="np-fmt">${CT.config.postFormats.map((f) => `<option ${nd && nd.format === f ? "selected" : ""}>${esc(f)}</option>`).join("")}</select></div>
        </div>
        <div class="dfoot"><span class="grow"></span><button type="button" class="btn ghost" data-act="np-cancel">Anuluj</button><button class="btn primary" type="submit">Utwórz post</button></div>
      </form>`;
  }
  CT.actions["np-discard"] = () => { DR.del(NEW_KEY); U.state.newPostPrefill = null; U.state.newPostDate = null; CT.render(); };
  CT.actions["np-cancel"] = () => { DR.del(NEW_KEY); U.state.newPostPrefill = null; U.state.newPostDate = null; CT.go("studio/harmonogram"); };
  CT.afterRender["post-new"] = () => {
    const f = document.getElementById("newpost"); if (!f) return;
    const saveNewDraft = () => DR.set(NEW_KEY, { vals: U.readFields(f, POST_FIELDS), channelIds: [...f.querySelectorAll("#np-ch input:checked")].map((i) => i.value),
      date: document.getElementById("np-date").value, time: document.getElementById("np-time").value, format: document.getElementById("np-fmt").value, at: D.nowISO() });
    /* Prefill (z tematu, z dnia w kalendarzu) od razu staje się szkicem: przetrwa kolejne przerysowania. */
    if (U.state.newPostPrefill || U.state.newPostDate) { saveNewDraft(); U.state.newPostPrefill = null; U.state.newPostDate = null; }
    f.addEventListener("input", saveNewDraft);
    f.addEventListener("change", saveNewDraft);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const vals = U.readFields(f, POST_FIELDS);
      const chIds = [...document.querySelectorAll("#np-ch input:checked")].map((i) => i.value);
      const date = document.getElementById("np-date").value;
      if (!vals.title || !vals.brandId) { U.toast("Uzupełnij temat i markę."); return; }
      if (!chIds.length) { U.toast("Zaznacz co najmniej jeden kanał."); return; }
      if (!date) { U.toast("Wybierz datę publikacji."); return; }
      const time = document.getElementById("np-time").value; const format = document.getElementById("np-fmt").value;
      const { post, versions } = R().createPost(vals, chIds.map((channelId) => ({ channelId, date, time: time || undefined, format })));
      DR.del(NEW_KEY); U.state.newPostPrefill = null; U.state.newPostDate = null;
      U.toast("Utworzono post."); CT.go(`post/${post.id}?v=${versions[0].id}`);
    });
  };

  /* ---------- edycja posta ---------- */
  const VFIELDS = ["channelId", "date", "time", "format", "text", "cta", "hashtags", "link", "internalNotes"];
  /* Przełożony (widok tylko do odczytu) zawsze widzi zapisaną wersję, nie szkic SMM. */
  const ro = () => R().role() === "przelozony";
  function current(v) {
    const d = ro() ? null : vDraft(v);
    return d ? { ...v, ...d.vals } : v;
  }
  function readVersionForm(v) {
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : undefined; };
    const vals = {};
    VFIELDS.forEach((k) => { const x = g("v-" + k); if (x !== undefined) vals[k] = k === "text" ? x : x.trim(); });
    const d = vDraft(v);
    vals.assetIds = d && d.vals.assetIds ? d.vals.assetIds.slice() : (v.assetIds || []).slice();
    return vals;
  }
  function isDirty(v) { const d = vDraft(v); return !!d && differs(d.vals, v); }
  const inConflict = (v) => { const d = vDraft(v); return !!d && !!d.conflict; };
  const CONFLICT_MSG = "Najpierw rozstrzygnij szkic: zachowaj go albo odrzuć (komunikat w karcie wersji).";
  const HIST_LABELS = { utworzenie_posta: "Utworzenie posta", utworzenie_wersji: "Utworzenie wersji", edycja_posta: "Edycja posta", edycja_tresci: "Edycja treści",
    zmiana_materialow: "Zmiana materiałów", zmiana_daty: "Zmiana daty", zmiana_godziny: "Zmiana godziny", zmiana_kanalu: "Zmiana kanału",
    wyslano_do_akceptacji: "Wysłano do akceptacji", zatwierdzono: "Zatwierdzono", poprawki: "Zgłoszono poprawki", komentarz: "Komentarz",
    komentarz_rozwiazany: "Komentarz rozwiązany", komentarz_otwarty: "Komentarz otwarty ponownie", zmiana_statusu: "Zmiana statusu",
    opublikowano: "Potwierdzenie publikacji", link_publikacji: "Link do publikacji", anulowano: "Anulowanie", uniewaznienie_akceptacji: "Unieważnienie akceptacji",
    duplikacja: "Duplikacja wersji", zmiana_kolejnosci_feedu: "Kolejność w feedzie" };
  CT.ui.HIST_LABELS = HIST_LABELS;
  const fmtVal = (type, x) => {
    if (x == null || x === "") return "brak";
    if (type === "zmiana_daty") return D.fmtFull(x);
    if (/status|akcept|opublik|poprawki|zatwierdz|anul|uniewazn/.test(type)) { const m = CT.config.statuses.find((s) => s.id === x); return m ? RL().statusMeta(x).label : x; }
    return x;
  };
  CT.ui.fmtHistVal = fmtVal;

  function processBlock(v, cur) {
    const role = R().role(); const st = v.status; const ds = RL().displayStatus(v);
    const b = (act, label, cls = "") => `<button type="button" class="btn ${cls}" data-act="${act}" data-id="${v.id}">${label}</button>`;
    let acts = "";
    if (role === "przelozony") {
      acts = st === "do_akceptacji" ? b("ver-approve", "Zatwierdź", "ok") + b("ver-changes", "Zgłoś poprawki", "danger")
        : `<p class="muted small">Przyciski akceptacji pojawią się, gdy wersja zostanie wysłana do akceptacji. Możesz dodać komentarz poniżej.</p>`;
    } else {
      if (["szkic", "w_przygotowaniu", "poprawki"].includes(st)) acts += b("ver-send", "Wyślij do akceptacji", "primary");
      if (st === "zatwierdzony") acts += b("ver-scheduled", "Oznacz jako zaplanowany");
      if (!RL().FINAL.includes(st)) acts += b("ver-publish", "OPUBLIKOWANO", "publish");
      if (st === "opublikowany") acts += b("ver-link", v.publishedUrl ? "Zmień link do publikacji" : "Dodaj link do publikacji");
      if (st === "anulowany") acts += b("ver-restore", "Przywróć jako szkic", "ghost");
      else if (st !== "opublikowany") acts += b("ver-cancel", "Anuluj publikację", "ghost");
    }
    const appr = v.approval ? `<p class="small">Zatwierdzono: ${esc(v.approval.by)}, ${D.fmtTs(v.approval.at)}</p>` : "";
    const pub = v.publishedAt ? `<p class="small">Opublikowano (potwierdzenie): ${D.fmtTs(v.publishedAt)}. Termin planowany: ${D.fmtFull(v.date)}${v.time ? " " + esc(v.time) : ""}.${v.publishedUrl ? ` <a href="${esc(v.publishedUrl)}" target="_blank" rel="noopener">Otwórz post</a>` : ""}</p>` : "";
    const statusSel = role === "smm" && ["szkic", "w_przygotowaniu"].includes(st)
      ? `<label class="fsel"><span>Etap pracy</span><select data-act-change="ver-stage" data-id="${v.id}"><option value="szkic" ${st === "szkic" ? "selected" : ""}>Szkic</option><option value="w_przygotowaniu" ${st === "w_przygotowaniu" ? "selected" : ""}>W przygotowaniu</option></select></label>` : "";
    return `<section class="card"><h2>Akceptacja i publikacja</h2>
      <div class="procrow">${U.badge(ds)}${ds !== st ? `<span class="muted small">(zapisany status: ${esc(RL().statusMeta(st).label)})</span>` : ""}${statusSel}</div>
      ${st === "zaplanowany" ? `<p class="muted small">${esc(RL().statusMeta("zaplanowany").hint || "")}</p>` : ""}
      ${appr}${pub}<div class="btnrow">${acts}</div></section>`;
  }

  function commentsBlock(v) {
    const cd = cDraft(v);
    const cms = R().list("comments", (c) => c.versionId === v.id).sort((a, b) => a.at.localeCompare(b.at));
    const roots = cms.filter((c) => !c.parentId);
    const one = (c, reply) => `<div class="cmt${c.resolved ? " resolved" : ""}${reply ? " reply" : ""}">
        <div class="cmthead"><b>${esc(c.author)}</b><span class="muted small">${D.fmtTs(c.at)}</span>${reply ? "" : `<span class="tag">${esc(U.label(CT.config.commentTargets, c.target))}</span>`}${c.resolved ? `<span class="tag ok">Rozwiązany</span>` : ""}</div>
        <p>${U.nl2br(c.text)}</p>
        ${reply ? "" : `<div class="cmtacts"><button type="button" class="linkbtn" data-act="cm-reply" data-id="${c.id}">Odpowiedz</button><button type="button" class="linkbtn" data-act="cm-resolve" data-id="${c.id}" data-val="${c.resolved ? "0" : "1"}">${c.resolved ? "Otwórz ponownie" : "Oznacz jako rozwiązany"}</button></div>`}
        ${!reply && cd.replyTo === c.id ? `<div class="replyform"><textarea id="reply-text" rows="2" placeholder="Twoja odpowiedź">${esc(cd.replyText || "")}</textarea><button type="button" class="btn small primary" data-act="cm-reply-send" data-id="${c.id}" data-v="${v.id}">Wyślij odpowiedź</button></div>` : ""}
      </div>${cms.filter((r) => r.parentId === c.id).map((r) => one(r, true)).join("")}`;
    const open = roots.filter((c) => !c.resolved).length;
    return `<section class="card"><h2>Komentarze <span class="cnt">${open}</span></h2>
      ${roots.length ? roots.map((c) => one(c, false)).join("") : `<p class="muted small">Brak komentarzy do tej wersji.</p>`}
      <div class="cmtnew"><select id="cm-target" aria-label="Czego dotyczy komentarz">${CT.config.commentTargets.map(([k, l]) => `<option value="${k}" ${cd.target === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
        <textarea id="cm-text" rows="2" placeholder="Dodaj komentarz do tej wersji">${esc(cd.text || "")}</textarea>
        <button type="button" class="btn small" data-act="cm-add" data-id="${v.id}">Dodaj komentarz</button></div></section>`;
  }

  function historyBlock(v, p) {
    const evs = (v.history || []).map((e) => ({ ...e, scope: "wersja" })).concat((p.history || []).map((e) => ({ ...e, scope: "post" })))
      .sort((a, b) => b.at.localeCompare(a.at));    return `<section class="card"><h2>Historia</h2>${evs.length ? `<ul class="hist">${evs.map((e) => `<li><b>${esc(HIST_LABELS[e.type] || e.type)}</b> <span class="muted small">${esc(e.user)}, ${D.fmtTs(e.at)}${e.scope === "post" ? ", post" : ""}</span>
      <div class="small">${esc(e.desc || "")}${e.from != null || e.to != null ? `: ${esc(fmtVal(e.type, e.from))} → ${esc(fmtVal(e.type, e.to))}` : ""}</div></li>`).join("")}</ul>` : `<p class="muted small">Brak zdarzeń.</p>`}</section>`;
  }

  /* Komunikat szkicu: zwykły (zapisz albo odrzuć) albo konflikt (rekord zmieniono gdzie indziej, wymagany wybór). */
  function draftNotice(d, rec, keepAct, dropAct, id, what) {
    if (!d) return "";
    if (d.conflict) {
      const diff = diffLabels(d.vals, rec);
      return `<div class="notice warn" role="alert"><b>${what === "Post" ? "Post został zmieniony" : "Ta wersja została zmieniona"} od czasu, gdy zacząłeś szkic</b> (np. w innej karcie przeglądarki). Formularz pokazuje Twój szkic${diff.length ? `; różni się od aktualnej wersji w polach: ${esc(diff.join(", "))}` : ""}. Dopóki nie wybierzesz, nic nie zostanie zapisane.
        <div class="btnrow"><button type="button" class="btn small primary" data-act="${keepAct}" data-id="${id}">Zachowaj mój szkic</button><button type="button" class="btn small ghost" data-act="${dropAct}" data-id="${id}">Odrzuć szkic i pokaż aktualną wersję</button></div></div>`;
    }
    return `<div class="notice warn"><b>Niezapisane zmiany: zapisz albo odrzuć.</b>${d.at ? ` <span class="small">Szkic z ${esc(D.fmtTs(d.at))}.</span>` : ""}</div>`;
  }

  function viewEdit(r) {
    const p = R().get("posts", r.parts[1]);
    if (!p) return U.head("Nie znaleziono posta") + U.empty("Ten post nie istnieje albo został usunięty.", `<a class="btn" href="#/studio/posty">Karty postów</a>`);
    const vs = R().list("versions", (v) => v.postId === p.id).sort((a, b) => ((R().get("channels", a.channelId) || {}).order || 0) - ((R().get("channels", b.channelId) || {}).order || 0));
    let vid = r.q.get("v"); if (!vs.some((v) => v.id === vid)) vid = vs[0] && vs[0].id;
    const v = vs.find((x) => x.id === vid);
    const role = R().role(); const ro = role === "przelozony";
    const pd = ro ? null : pDraft(p.id);
    const pDirty = !!pd && differs(pd.vals, p);
    const tabs = vs.map((x) => { const ch = R().get("channels", x.channelId); return `<a class="vtab${x.id === vid ? " on" : ""}" href="#/post/${p.id}?v=${x.id}">${U.mono(ch, "sm")}<span>${esc(ch ? ch.name : "Kanał")}</span>${U.dot(RL().displayStatus(x))}${!ro && x.id !== vid && isDirty(x) ? `<span class="tag" title="Niezapisane zmiany w tej wersji">szkic</span>` : ""}</a>`; }).join("");
    let left = `<div class="crumbs"><a href="#/studio/posty">Karty postów</a> / ${esc(p.title)}</div>
      <section class="card"><div class="cardhead"><h2>Post: koncepcja</h2>${ro ? "" : `<button type="button" class="btn ghost small danger" data-act="post-del" data-id="${p.id}">Usuń post</button>`}</div>
        ${pDirty ? draftNotice(pd, p, "post-draft-keep", "post-draft-drop", p.id, "Post") : ""}
        <form id="postform">${U.fieldsHtml(POST_FIELDS, pDirty ? { ...p, ...pd.vals } : p)}${ro ? "" : `<div class="dfoot"><span class="grow"></span>${pDirty && !pd.conflict ? `<button type="button" class="btn ghost" data-act="post-draft-drop" data-id="${p.id}">Odrzuć zmiany</button>` : ""}<button class="btn" type="submit">Zapisz post</button></div>`}</form></section>
      <section class="card"><div class="cardhead"><h2>Wersje kanałowe</h2>${ro ? "" : `<button type="button" class="btn small" data-act="ver-add" data-id="${p.id}">Dodaj wersję</button>`}</div><div class="vtabs">${tabs || `<p class="muted small">Brak wersji. Dodaj pierwszą.</p>`}</div></section>`;
    let right = "";
    if (v) {
      const cur = current(v); const ch = R().get("channels", cur.channelId);
      const dirty = !ro && isDirty(v);
      const assets = (cur.assetIds || []).map((id) => R().get("assets", id)).filter(Boolean);
      const dis = ro ? "disabled" : "";
      const warn = RL().warnings(cur).concat(RL().issues(cur).map((x) => "Uwaga: " + x));
      left += `<section class="card" id="verform" data-vid="${v.id}"><div class="cardhead"><h2>Wersja: ${esc(ch ? ch.name : "")}</h2>
          ${ro ? "" : `<span class="btnrow"><button type="button" class="btn ghost small" data-act="ver-dup" data-id="${v.id}">Duplikuj wersję</button><button type="button" class="btn ghost small danger" data-act="ver-del" data-id="${v.id}">Usuń wersję</button></span>`}</div>
        ${dirty ? draftNotice(vDraft(v), v, "ver-draft-keep", "ver-discard", v.id, "Wersja") : ""}
        ${warn.length ? `<div class="notice">${warn.map(esc).join("<br>")}</div>` : ""}
        <div class="fgrid">
          <div class="field"><label for="v-channelId">Kanał</label><select id="v-channelId" data-live ${dis}>${U.opt.channels().map(([id, n]) => `<option value="${id}" ${id === cur.channelId ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>
          <div class="field"><label for="v-format">Format</label><select id="v-format" data-live ${dis}>${CT.config.postFormats.map((f) => `<option ${f === cur.format ? "selected" : ""}>${esc(f)}</option>`).join("")}</select></div>
          <div class="field"><label for="v-date">Data publikacji *</label><input id="v-date" type="date" value="${esc(cur.date)}" data-live ${dis}></div>
          <div class="field"><label for="v-time">Godzina</label><input id="v-time" type="time" value="${esc(cur.time || "")}" data-live ${dis}></div>
          <div class="field wide"><label for="v-text">Tekst posta</label><textarea id="v-text" rows="7" data-live ${dis}>${esc(cur.text)}</textarea><small class="hint">${(cur.text || "").length} znaków</small></div>
          <div class="field wide"><label for="v-cta">CTA</label><input id="v-cta" value="${esc(cur.cta)}" data-live ${dis}></div>
          <div class="field"><label for="v-hashtags">Hashtagi</label><input id="v-hashtags" value="${esc(cur.hashtags)}" data-live ${dis}></div>
          <div class="field"><label for="v-link">Link</label><input id="v-link" type="url" value="${esc(cur.link)}" placeholder="https://" data-live ${dis}></div>
          <div class="field wide"><label for="v-internalNotes">Uwagi wewnętrzne (wersja)</label><textarea id="v-internalNotes" rows="2" data-live ${dis}>${esc(cur.internalNotes)}</textarea></div>
        </div>
        <h4 class="fsec">Materiały</h4>
        <div class="matlist">${assets.length ? assets.map((a) => { const fc = RL().fileChecks(a, cur);
          return `<div class="mat"><div class="matth">${U.thumb(a)}</div><div class="matinfo"><b>${esc(a.name)}</b><small>${esc(a.type)}${a.width ? `, ${a.width}×${a.height}` : ""}${a.ratio ? ` (${esc(a.ratio)})` : ""}</small>${fc.map((x) => `<small class="warntext">${esc(x)}</small>`).join("")}</div>${ro ? "" : `<button type="button" class="icon" data-act="ver-unlink" data-id="${a.id}" aria-label="Odłącz materiał">×</button>`}</div>`; }).join("") : `<p class="muted small">Brak materiałów w tej wersji.</p>`}</div>
        ${ro ? "" : `<div class="btnrow"><button type="button" class="btn small" data-act="ver-pick" data-id="${v.id}">Dodaj z biblioteki</button><label class="btn small">Wgraj plik<input type="file" multiple hidden accept="image/*,video/*,application/pdf" data-act-change="ver-upload" data-id="${v.id}"></label></div>`}
        ${ro ? "" : `<div class="dfoot sticky-save"><span class="muted small">${dirty ? "Niezapisane zmiany" : "Zapisane"}</span><span class="grow"></span>${dirty ? `<button type="button" class="btn ghost" data-act="ver-discard" data-id="${v.id}">Odrzuć zmiany</button>` : ""}<button type="button" class="btn primary" data-act="ver-save" data-id="${v.id}">Zapisz wersję</button></div>`}
      </section>
      ${processBlock(v, cur)}${commentsBlock(v)}${historyBlock(v, p)}`;
      const dev = U.state.device;
      right = `<div class="pvpanel"><div class="pvbar"><b>Podgląd</b><span class="muted small">${esc(ch ? CT.config.platforms[ch.platform].label : "")}</span><span class="grow"></span>
        <div class="segs"><button class="seg${dev === "mobile" ? " on" : ""}" data-act="pv-dev" data-dev="mobile">Telefon</button><button class="seg${dev === "desktop" ? " on" : ""}" data-act="pv-dev" data-dev="desktop">Komputer</button></div></div>
        <div id="livepv">${U.preview(cur, p, ch, dev)}</div><p class="muted small">Podgląd poglądowy. Wygląd w aplikacji platformy może się różnić.</p></div>`;
    } else {
      right = `<div class="pvpanel">${U.empty("Dodaj wersję kanałową, żeby zobaczyć podgląd.")}</div>`;
    }
    return `<div class="editor"><div class="ed-left">${left}</div><aside class="ed-right">${right}</aside></div>`;
  }

  CT.views["post"] = (r) => (r.parts[1] === "new" ? viewNew() : viewEdit(r));

  CT.afterRender["post-edit"] = (r) => {
    const pid = r.parts[1];
    const pf = document.getElementById("postform");
    if (pf) {
      pf.addEventListener("submit", (e) => {
        e.preventDefault();
        const d = pDraft(pid); if (d && d.conflict) { U.toast(CONFLICT_MSG); return; }
        const vals = U.readFields(pf, POST_FIELDS);
        if (!vals.title || !vals.brandId) { U.toast("Uzupełnij temat i markę."); return; }
        R().savePost(pid, vals); DR.del(pKey(pid)); U.toast("Zapisano post.");
      });
      /* Każda zmiana pól posta trafia do szkicu: przerysowanie widoku jej nie skasuje. */
      const keepPost = () => { const p = R().get("posts", pid); if (p && !ro()) putDraft(pKey(pid), p, U.readFields(pf, POST_FIELDS)); };
      pf.addEventListener("input", keepPost);
      pf.addEventListener("change", keepPost);
    }
    const vf = document.getElementById("verform"); if (!vf) return;
    const vid = vf.dataset.vid;
    vf.addEventListener("input", (e) => {
      if (!e.target.hasAttribute("data-live")) return;
      const v = R().get("versions", vid); if (!v) return;
      putVDraft(v, readVersionForm(v));
      const cur = current(v); const ch = R().get("channels", cur.channelId);
      const pv = document.getElementById("livepv"); if (pv) { pv.innerHTML = U.preview(cur, R().get("posts", v.postId), ch, U.state.device); U.hydrate(pv); }
      if (e.target.id === "v-text") { const h = e.target.parentElement.querySelector(".hint"); if (h) h.textContent = `${e.target.value.length} znaków`; }
      const lab = vf.querySelector(".sticky-save .muted"); if (lab) lab.textContent = isDirty(v) ? "Niezapisane zmiany" : "Zapisane";
    });
    vf.addEventListener("change", (e) => { if (e.target.hasAttribute("data-live") && e.target.tagName === "SELECT") CT.render(); });
    /* Wpisywany komentarz i odpowiedź też są szkicem. */
    const v0 = R().get("versions", vid);
    const cmText = document.getElementById("cm-text"); const cmTarget = document.getElementById("cm-target");
    if (v0 && cmText) cmText.addEventListener("input", () => putCDraft(v0, { text: cmText.value }));
    if (v0 && cmTarget) cmTarget.addEventListener("change", () => putCDraft(v0, { target: cmTarget.value }));
    const rp = document.getElementById("reply-text");
    if (v0 && rp) rp.addEventListener("input", () => putCDraft(v0, { replyText: rp.value }));
  };

  /* ---------- akcje ---------- */
  const curVid = () => { const f = document.getElementById("verform"); return f ? f.dataset.vid : null; };
  const vOf = (el) => R().get("versions", el.dataset.id);
  /* Odświeża szkic wartościami z formularza (jeśli formularz tej wersji jest na ekranie). */
  const syncDraft = (v) => { if (v && curVid() === v.id && !ro()) putVDraft(v, readVersionForm(v)); };
  const invalidMsg = "akceptacja została unieważniona, wersja wróciła do akceptacji.";
  function saveIfDirty(v) {
    if (inConflict(v)) { U.toast(CONFLICT_MSG); return false; }
    if (!isDirty(v)) return true;
    const vals = vDraft(v).vals;
    if (!vals.date) { U.toast("Wybierz datę publikacji."); return false; }
    const res = R().saveVersion(v.id, vals); DR.del(vKey(v));
    if (res.invalidated) U.toast(`Zmieniono zatwierdzoną wersję: ${invalidMsg}`);
    return true;
  }
  CT.actions["ver-save"] = (el) => {
    const v = vOf(el); if (!v) return;
    syncDraft(v);
    if (inConflict(v)) { U.toast(CONFLICT_MSG); return; }
    if (!isDirty(v)) { U.toast("Brak zmian do zapisania."); return; }
    const vals = vDraft(v).vals;
    if (!vals.date) { U.toast("Wybierz datę publikacji."); return; }
    const res = R().saveVersion(v.id, vals); DR.del(vKey(v));
    U.toast(res.invalidated ? `Zapisano. Zmieniono zatwierdzoną wersję: ${invalidMsg}` : "Zapisano wersję.");
  };
  CT.actions["ver-discard"] = (el) => { const v = vOf(el); if (v) DR.del(vKey(v)); CT.render(); };
  CT.actions["ver-draft-keep"] = (el) => {
    const v = vOf(el); const d = v && vDraft(v); if (!d) return;
    DR.set(vKey(v), { ...d, conflict: false, base: v.updatedAt });
    U.toast("Zachowano szkic. Zapisanie go zastąpi aktualną wersję."); CT.render();
  };
  CT.actions["post-draft-keep"] = (el) => {
    const p = R().get("posts", el.dataset.id); const d = p && pDraft(p.id); if (!d) return;
    DR.set(pKey(p.id), { ...d, conflict: false, base: p.updatedAt });
    U.toast("Zachowano szkic. Zapisanie go zastąpi aktualne dane posta."); CT.render();
  };
  CT.actions["post-draft-drop"] = (el) => { DR.del(pKey(el.dataset.id)); CT.render(); };
  CT.actions["ver-stage"] = (el) => { const v = vOf(el); syncDraft(v); if (v && saveIfDirty(v)) R().setStatus(v.id, el.value, "Zmiana etapu pracy"); else CT.render(); };
  CT.actions["ver-send"] = (el) => {
    const v = vOf(el); if (!v) return;
    syncDraft(v);
    if (!saveIfDirty(v)) return;
    const fresh = R().get("versions", v.id);
    if ((!fresh.text || !fresh.text.trim()) && !(fresh.assetIds || []).length) { U.toast("Dodaj tekst lub materiał przed wysłaniem do akceptacji."); return; }
    R().sendForApproval(v.id); U.toast("Wysłano do akceptacji.");
  };
  CT.actions["ver-approve"] = (el) => { R().approve(el.dataset.id); U.toast("Zatwierdzono."); };
  CT.actions["ver-changes"] = (el) => {
    U.openForm({ title: "Zgłoś poprawki", saveLabel: "Odeślij z uwagami", fields: [{ k: "note", label: "Co trzeba poprawić?", type: "textarea", req: true, wide: true, rows: 4 }],
      onSave: (vals) => { R().requestChanges(el.dataset.id, vals.note); U.toast("Odesłano z uwagami."); } });
  };
  CT.actions["ver-scheduled"] = (el) => { syncDraft(vOf(el)); R().setStatus(el.dataset.id, "zaplanowany", "Oznaczono jako zaplanowany w narzędziu platformy"); U.toast("Oznaczono jako zaplanowany."); };
  CT.actions["ver-publish"] = (el) => {
    const v = vOf(el); if (!v) return;
    syncDraft(v);
    if (isDirty(v)) { U.toast("Najpierw zapisz albo odrzuć zmiany w wersji."); return; }
    const open = () => U.openForm({ title: "Potwierdź publikację", saveLabel: "OPUBLIKOWANO", intro: "Zapiszemy rzeczywisty czas potwierdzenia. Termin planowany pozostanie bez zmian.",
      fields: [{ k: "url", label: "Link do opublikowanego posta (opcjonalnie)", type: "url", wide: true }],
      onSave: (vals) => { R().markPublished(v.id, vals.url); U.toast("Oznaczono jako opublikowany. Wersja trafiła do archiwum."); } });
    if (!["zatwierdzony", "zaplanowany"].includes(v.status)) U.confirm("Ta wersja nie jest zatwierdzona. Czy na pewno oznaczyć ją jako opublikowaną?", "Tak, przejdź dalej", open);
    else open();
  };
  CT.actions["ver-link"] = (el) => {
    const v = vOf(el);
    U.openForm({ title: "Link do publikacji", fields: [{ k: "url", label: "Adres posta", type: "url", req: true, wide: true }], values: { url: v.publishedUrl },
      onSave: (vals) => { R().setPublishedUrl(v.id, vals.url); U.toast("Zapisano link."); } });
  };
  CT.actions["ver-cancel"] = (el) => { syncDraft(vOf(el)); U.confirm("Anulować publikację tej wersji?", "Anuluj publikację", () => { R().setStatus(el.dataset.id, "anulowany", "Anulowano publikację", "anulowano"); U.toast("Anulowano."); }, true); };
  CT.actions["ver-restore"] = (el) => { R().setStatus(el.dataset.id, "szkic", "Przywrócono jako szkic"); };
  CT.actions["ver-add"] = (el) => {
    syncDraft(R().get("versions", curVid()));
    const used = R().list("versions", (v) => v.postId === el.dataset.id).map((v) => v.channelId);
    const opts = U.opt.channels(true).filter(([id]) => !used.includes(id));
    if (!opts.length) { U.toast("Post ma już wersje dla wszystkich aktywnych kanałów."); return; }
    U.openForm({ title: "Dodaj wersję kanałową", saveLabel: "Dodaj wersję", fields: [
      { k: "channelId", label: "Kanał", type: "select", options: opts, req: true }, { k: "date", label: "Data publikacji", type: "date", req: true },
      { k: "time", label: "Godzina", type: "time" }, { k: "format", label: "Format", type: "select", options: CT.config.postFormats.map((f) => [f, f]), req: true }],
      values: { date: D.today(), format: "Post" },
      onSave: (vals) => { const v = R().addVersion(el.dataset.id, { ...vals, time: vals.time || undefined }); CT.go(`post/${el.dataset.id}?v=${v.id}`); } });
  };
  CT.actions["ver-dup"] = (el) => {
    const v = vOf(el); syncDraft(v);
    U.openForm({ title: "Duplikuj wersję", intro: "Nowa wersja dostanie kopię zapisanej treści i materiałów. Niezapisane zmiany zostają w szkicu tej wersji. Dalsze zmiany w jednej wersji nie zmienią drugiej.", saveLabel: "Duplikuj",
      fields: [{ k: "channelId", label: "Kanał nowej wersji", type: "select", options: U.opt.channels(true), req: true }],
      onSave: (vals) => { const nv = R().duplicateVersion(v.id, vals.channelId); CT.go(`post/${v.postId}?v=${nv.id}`); } });
  };
  CT.actions["ver-del"] = (el) => { const v = vOf(el); U.confirm("Usunąć tę wersję kanałową razem z komentarzami? Post i inne wersje zostaną.", "Usuń wersję", () => { R().deleteVersion(v.id); DR.del(vKey(v)); DR.del(cKey(v)); CT.go(`post/${v.postId}`); }, true); };
  CT.actions["post-del"] = (el) => U.confirm("Usunąć cały post ze wszystkimi wersjami i komentarzami?", "Usuń post", () => { R().deletePost(el.dataset.id); DR.clear(`post/${el.dataset.id}/`); CT.go("studio/posty"); U.toast("Usunięto post."); }, true);
  CT.actions["ver-unlink"] = (el) => {
    const v = R().get("versions", curVid()); if (!v) return;
    const vals = readVersionForm(v); vals.assetIds = vals.assetIds.filter((x) => x !== el.dataset.id);
    putVDraft(v, vals); CT.render();
  };
  CT.actions["ver-pick"] = (el) => {
    const v = vOf(el); syncDraft(v); const vals = readVersionForm(v);
    const all = R().list("assets").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    U.dialog(`<h2>Dodaj z biblioteki</h2>${all.length ? `<div class="pickgrid">${all.map((a) => `<label class="pick"><input type="checkbox" value="${a.id}" ${vals.assetIds.includes(a.id) ? "checked" : ""}><span class="pickth">${U.thumb(a)}</span><small>${esc(a.name)}</small></label>`).join("")}</div>` : U.empty("Biblioteka jest pusta. Wgraj plik w wersji albo w Bibliotece materiałów.")}
      <div class="dfoot"><span class="grow"></span><button class="btn ghost" data-act="dlg-close">Anuluj</button><button class="btn primary" data-act="pick-ok" data-id="${v.id}">Dodaj zaznaczone</button></div>`, { wide: true });
  };
  CT.actions["pick-ok"] = (el) => {
    const v = vOf(el); const vals = readVersionForm(v);
    const ids = [...document.querySelectorAll("#dlg .pick input:checked")].map((i) => i.value);
    vals.assetIds = Array.from(new Set(vals.assetIds.filter((x) => ids.includes(x)).concat(ids)));
    putVDraft(v, vals); U.closeDialog(); CT.render();
  };
  CT.actions["ver-upload"] = async (el) => {
    const v = vOf(el); syncDraft(v); const vals = readVersionForm(v); const ch = R().get("channels", vals.channelId);
    const created = await U.uploadFiles(el.files, { brandId: ch ? ch.brandId : "", channelId: vals.channelId });
    const fresh = R().get("versions", v.id); if (!fresh) return;
    const now = readVersionForm(fresh); now.assetIds = now.assetIds.concat(created.map((a) => a.id));
    putVDraft(fresh, now); CT.render();
  };
  CT.actions["pv-dev"] = (el) => { U.state.device = el.dataset.dev; syncDraft(R().get("versions", curVid())); CT.render(); };
  CT.actions["cm-add"] = (el) => {
    const t = document.getElementById("cm-text").value.trim(); if (!t) { U.toast("Wpisz treść komentarza."); return; }
    const v = vOf(el); syncDraft(v);
    R().addComment(el.dataset.id, { text: t, target: document.getElementById("cm-target").value });
    putCDraft(v, { text: "", target: "tresc" });
    CT.render();
  };
  CT.actions["cm-reply"] = (el) => {
    const v = R().get("versions", curVid()); if (!v) return;
    syncDraft(v);
    const cd = cDraft(v);
    putCDraft(v, cd.replyTo === el.dataset.id ? { replyTo: null, replyText: "" } : { replyTo: el.dataset.id, replyText: cd.replyTo === el.dataset.id ? cd.replyText : "" });
    CT.render();
  };
  CT.actions["cm-reply-send"] = (el) => {
    const t = (document.getElementById("reply-text") || {}).value; if (!t || !t.trim()) { U.toast("Wpisz odpowiedź."); return; }
    const v = R().get("versions", el.dataset.v); syncDraft(v);
    R().addComment(el.dataset.v, { text: t.trim(), parentId: el.dataset.id });
    if (v) putCDraft(v, { replyTo: null, replyText: "" });
    CT.render();
  };
  CT.actions["cm-resolve"] = (el) => { syncDraft(R().get("versions", curVid())); R().resolveComment(el.dataset.id, el.dataset.val === "1"); };
})();

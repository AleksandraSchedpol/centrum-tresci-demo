/* Content Studio: Bank tematów, Karty postów, Archiwum, Biblioteka materiałów, Wideo Content.
   Formularze współdzielone z Dashboardem są w CT.forms. */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc, C = CT.config;
  const R = () => CT.repo;
  const RL = () => CT.rules;
  CT.forms = {};

  /* ================= BANK TEMATÓW ================= */
  const TOPIC_FIELDS = [
    { k: "title", label: "Tytuł", req: true, wide: true },
    { k: "description", label: "Opis", type: "textarea", wide: true },
    { k: "hook", label: "Pomysł / hook", wide: true },
    { k: "goal", label: "Cel komunikacyjny" },
    { k: "pillarId", label: "Filar treści", type: "select", options: () => U.opt.pillars() },
    { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands() },
    { k: "priority", label: "Priorytet", type: "select", options: C.priorities },
    { k: "status", label: "Status", type: "select", options: C.topicStatuses, req: true },
    { k: "targets", label: "Przeznaczenie", type: "multi", options: C.topicTargets },
    { k: "channelIds", label: "Docelowe kanały social media", type: "multi", options: () => U.opt.channels() },
    { k: "nlListIds", label: "Listy newsletterowe", type: "multi", options: () => R().list("nlLists").map((l) => [l.id, l.name]) },
    { k: "assetIds", label: "Powiązane materiały", type: "multi", options: () => U.opt.assets() },
    { k: "notes", label: "Uwagi", type: "textarea", wide: true, rows: 2 },
  ];
  CT.forms.topic = (t, preset = {}) => U.openForm({
    title: t ? "Edytuj temat" : "Nowy temat", fields: TOPIC_FIELDS,
    values: t || { status: "nowy", priority: "sredni", targets: ["social"], brandId: RL().brandFilter() || "", channelIds: RL().channelFilter() ? [RL().channelFilter()] : [], nlListIds: [], ...preset },
    onSave: (vals) => { if (!vals.targets.length) vals.targets = ["social"]; if (t) R().update("topics", t.id, vals); else R().add("topics", { ...vals, postIds: [], nlIds: [] }, "tp"); U.toast("Zapisano temat."); },
    onDelete: t ? () => R().remove("topics", t.id) : null,
  });
  CT.views["studio/tematy"] = () => {
    const V = "tematy"; const f = (k) => U.filterVal(V, k);
    const bf = RL().brandFilter();
    const rows = R().list("topics", (t) => (t.targets || ["social"]).includes("social") && (!bf || !t.brandId || t.brandId === bf) && (!f("brand") || t.brandId === f("brand")) && (!f("status") || t.status === f("status"))
      && (!f("priority") || t.priority === f("priority")) && (!f("pillar") || t.pillarId === f("pillar")) && U.match(f("q"), t.title, t.description, t.hook, t.notes))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return U.head("Bank tematów", "Pomysły do wykorzystania. Przeciągnij temat na dzień w Harmonogramie albo utwórz post z tematu: temat zostaje w banku z powiązaniem.", `<button class="btn primary" data-act="quick-topic">Dodaj temat</button>`)
      + `<div class="filters">${U.filterSearch(V)}${bf ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "pillar", "Filar", U.opt.pillars())}${U.filterSelect(V, "status", "Status", C.topicStatuses)}${U.filterSelect(V, "priority", "Priorytet", C.priorities)}</div>`
      + (rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Temat</th><th>Marka</th><th>Filar</th><th>Kanały</th><th>Priorytet</th><th>Status</th><th>Posty</th><th></th></tr></thead><tbody>
        ${rows.map((t) => `<tr class="click" data-act="topic-edit" data-id="${t.id}"><td><b>${esc(t.title)}</b>${t.hook ? `<br><small class="muted">${esc(t.hook)}</small>` : ""}</td><td>${esc(U.nameOf("brands", t.brandId))}</td><td>${esc(U.nameOf("pillars", t.pillarId))}</td>
          <td class="small">${(t.channelIds || []).map((id) => esc(R().chName(id))).join(", ")}</td><td>${esc(U.label(C.priorities, t.priority))}</td><td>${esc(U.label(C.topicStatuses, t.status))}</td>
          <td>${(t.postIds || []).filter((id) => R().get("posts", id)).map((id) => `<a href="#/post/${id}" data-stop>${esc(U.nameOf("posts", id, "title"))}</a>`).join("<br>") || "<span class='muted'>brak</span>"}</td>
          <td><button class="btn small" data-act="topic-post" data-id="${t.id}">Utwórz post</button></td></tr>`).join("")}
      </tbody></table></div>` : U.empty("Brak tematów spełniających filtry.", `<button class="btn primary" data-act="quick-topic">Dodaj temat</button>`));
  };
  CT.actions["topic-edit"] = (el) => CT.forms.topic(R().get("topics", el.dataset.id));
  CT.actions["topic-post"] = (el, e) => {
    e.stopPropagation();
    const t = R().get("topics", el.dataset.id);
    U.state.newPostPrefill = { title: t.title, brandId: t.brandId, pillarId: t.pillarId, goal: t.goal, concept: [t.description, t.hook ? "Hook: " + t.hook : ""].filter(Boolean).join("\n\n"), topicId: t.id, channelIds: (t.channelIds || []).slice() };
    CT.go("post/new");
  };

  /* ================= KARTY POSTÓW ================= */
  CT.views["studio/posty"] = () => {
    const V = "posty"; const f = (k) => U.filterVal(V, k);
    const cf = RL().channelFilter(); const bf = RL().brandFilter();
    const posts = R().list("posts", (p) => (!bf || p.brandId === bf) && (!f("brand") || p.brandId === f("brand")) && (!f("pillar") || p.pillarId === f("pillar")) && U.match(f("q"), p.title, p.concept, p.goal))
      .map((p) => ({ p, vs: R().list("versions", (v) => v.postId === p.id && (!cf || v.channelId === cf)) }))
      .filter((x) => (!cf || x.vs.length) && (!f("status") || x.vs.some((v) => RL().displayStatus(v) === f("status"))))
      .sort((a, b) => (b.p.updatedAt || "").localeCompare(a.p.updatedAt || ""));
    return U.head("Karty postów", "Wszystkie posty z ich wersjami kanałowymi. Kliknij wersję, żeby otworzyć kartę posta.", `<button class="btn primary" data-act="quick-post">Dodaj post</button>`)
      + `<div class="filters">${U.filterSearch(V)}${bf ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "pillar", "Filar", U.opt.pillars())}${U.filterSelect(V, "status", "Status wersji", C.statuses.map((s) => [s.id, RL().statusMeta(s.id).label]))}</div>`
      + (posts.length ? `<div class="postcards">${posts.map(({ p, vs }) => `<article class="card postcard">
          <div class="cardhead"><a class="ptitle" href="#/post/${p.id}">${esc(p.title)}</a><span class="muted small">${esc(U.nameOf("brands", p.brandId))}${p.pillarId ? ", " + esc(U.nameOf("pillars", p.pillarId)) : ""}</span></div>
          ${p.goal ? `<p class="small">${esc(p.goal)}</p>` : ""}
          <div class="vrow">${vs.map((v) => `<a class="vpill" href="#/post/${p.id}?v=${v.id}">${U.mono(R().get("channels", v.channelId), "sm")}<span>${D.fmtDay(v.date)}${v.time ? " " + esc(v.time) : ""}</span>${U.badge(RL().displayStatus(v))}</a>`).join("") || `<span class="muted small">Brak wersji</span>`}</div>
        </article>`).join("")}</div>` : U.empty("Brak postów spełniających filtry.", `<button class="btn primary" data-act="quick-post">Dodaj post</button>`));
  };

  /* ================= ARCHIWUM ================= */
  CT.views["studio/archiwum"] = () => {
    const V = "archiwum"; const f = (k) => U.filterVal(V, k);
    const rows = R().list("versions", (v) => v.status === "opublikowany" && RL().inFilter(v)).map((v) => ({ v, p: R().get("posts", v.postId) || {} }))
      .filter(({ v, p }) => (!f("brand") || p.brandId === f("brand")) && (!f("pillar") || p.pillarId === f("pillar")) && (!f("from") || v.date >= f("from")) && (!f("to") || v.date <= f("to")) && U.match(f("q"), p.title, v.text, v.hashtags))
      .sort((a, b) => (b.v.publishedAt || "").localeCompare(a.v.publishedAt || ""));
    const an = (v) => R().list("analytics", (a) => a.versionId === v.id)[0];
    return U.head("Archiwum", "Potwierdzone publikacje. Archiwum korzysta z tych samych danych co karta posta: nie ma osobnej kopii.")
      + `<div class="filters">${U.filterSearch(V)}${RL().brandFilter() ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "pillar", "Filar", U.opt.pillars())}
        <label class="fsel"><span>Od</span><input type="date" data-filter="${V}.from" value="${esc(f("from"))}"></label><label class="fsel"><span>Do</span><input type="date" data-filter="${V}.to" value="${esc(f("to"))}"></label></div>`
      + (rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th></th><th>Temat</th><th>Kanał</th><th>Filar</th><th>Planowano</th><th>Potwierdzono</th><th>Wyniki</th><th>Link</th></tr></thead><tbody>
        ${rows.map(({ v, p }) => { const a = R().get("assets", (v.assetIds || [])[0]); const rec = an(v); const er = RL().engagement(rec);
          return `<tr class="click" data-route="post/${v.postId}?v=${v.id}"><td class="thcell">${a ? U.thumb(a) : ""}</td><td><b>${esc(p.title)}</b><br><small class="muted">${esc((v.text || "").slice(0, 90))}</small></td>
            <td>${U.chTag(R().get("channels", v.channelId))}</td><td>${esc(U.nameOf("pillars", p.pillarId))}</td><td>${D.fmtFull(v.date)}${v.time ? " " + esc(v.time) : ""}</td><td>${D.fmtTs(v.publishedAt)}</td>
            <td class="small">${rec ? `Zasięg ${U.num(rec.reach)}${er != null ? `, ER ${U.pct(er)}` : ""}` : `<span class="muted">brak danych</span>`}</td>
            <td>${v.publishedUrl ? `<a href="${esc(v.publishedUrl)}" target="_blank" rel="noopener" data-stop>Otwórz</a>` : "<span class='muted'>brak</span>"}</td></tr>`; }).join("")}
      </tbody></table></div>` : U.empty("Archiwum jest puste. Posty trafiają tu po kliknięciu OPUBLIKOWANO w karcie posta."));
  };

  /* ================= BIBLIOTEKA MATERIAŁÓW ================= */
  const ASSET_FIELDS = [
    { k: "name", label: "Nazwa", req: true, wide: true },
    { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands() },
    { k: "channelId", label: "Kanał", type: "select", options: () => U.opt.channels() },
    { k: "source", label: "Źródło", type: "select", options: C.assetSources, req: true },
    { k: "license", label: "Licencja i prawa użycia", ph: "np. Artlist, wygenerowane w Kling, zdjęcie własne" },
    { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 },
    { k: "tags", label: "Tagi", type: "tags", wide: true },
  ];
  CT.views["studio/biblioteka"] = () => {
    const V = "biblioteka"; const f = (k) => U.filterVal(V, k);
    const bf = RL().brandFilter();
    const items = R().list("assets", (a) => (!bf || !a.brandId || a.brandId === bf) && (!f("type") || a.type === f("type")) && (!f("brand") || a.brandId === f("brand")) && (!f("source") || a.source === f("source"))
      && U.match(f("q"), a.name, a.description, (a.tags || []).join(" "), a.license)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return U.head("Biblioteka materiałów", "Grafiki, zdjęcia, wideo i PDF używane w publikacjach. Pliki są w pamięci tej przeglądarki (IndexedDB), nie w kopii danych JSON.",
        `<label class="btn primary">Dodaj pliki<input type="file" multiple hidden accept="image/*,video/*,application/pdf" data-act-change="lib-upload"></label>`)
      + `<div class="filters">${U.filterSearch(V, "Nazwa, tag, opis…")}${U.filterSelect(V, "type", "Typ", [["image", "Grafika"], ["video", "Wideo"], ["pdf", "PDF"], ["inny", "Inne"]])}${bf ? "" : U.filterSelect(V, "brand", "Marka", U.opt.brands())}${U.filterSelect(V, "source", "Źródło", C.assetSources)}</div>`
      + (items.length ? `<div class="libgrid">${items.map((a) => { const used = R().assetUsage(a.id).length;
          return `<button class="libitem" data-act="asset-open" data-id="${a.id}"><span class="libth">${U.thumb(a)}</span><b>${esc(a.name)}</b>
            <small>${a.width ? `${a.width}×${a.height}, ` : ""}${esc(U.label(C.assetSources, a.source))}${used ? `, użyto: ${used}` : ""}</small></button>`; }).join("")}</div>`
        : U.empty("Biblioteka jest pusta.", `<label class="btn primary">Dodaj pliki<input type="file" multiple hidden accept="image/*,video/*,application/pdf" data-act-change="lib-upload"></label>`));
  };
  CT.actions["lib-upload"] = async (el) => { const cf = RL().channelFilter(); await U.uploadFiles(el.files, { brandId: RL().brandFilter() || "", channelId: cf || "" }); };
  CT.actions["asset-open"] = (el) => {
    const a = R().get("assets", el.dataset.id); if (!a) return;
    const used = R().assetUsage(a.id);
    U.openForm({ title: "Materiał", fields: ASSET_FIELDS, values: a,
      intro: `<span class="assetprev">${U.thumb(a)}</span>${esc(a.type)}${a.width ? `, ${a.width}×${a.height}${a.ratio ? ` (${esc(a.ratio)}, ${esc(a.orientation || "")})` : ""}` : ""}, ${(a.size / 1024 / 1024).toFixed(2)} MB${a.duration ? `, ${a.duration} s` : ""}. Dodano ${D.fmtTs(a.createdAt)}.`,
      extraHtml: `<h4 class="fsec">Gdzie użyto</h4>${used.length ? `<ul class="plain">${used.map((v) => `<li><a href="#/post/${v.postId}?v=${v.id}">${esc(R().postTitle(v))}</a>, ${esc(R().chName(v.channelId))}, ${D.fmtDay(v.date)}</li>`).join("")}</ul>` : `<p class="muted small">Materiał nie jest jeszcze użyty w żadnej wersji.</p>`}`,
      onSave: (vals) => { R().update("assets", a.id, vals); U.toast("Zapisano materiał."); },
      onDelete: () => { R().deleteAsset(a.id); U.toast(used.length ? `Usunięto materiał i odłączono go od ${used.length} wersji.` : "Usunięto materiał."); },
    });
  };

  /* ================= WIDEO CONTENT ================= */
  const VIDEO_COMMON_TOP = [
    { k: "title", label: "Tytuł pomysłu", req: true, wide: true },
    { k: "hook", label: "Hook", wide: true },
  ];
  const VIDEO_COMMON_BOTTOM = [
    { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands() },
    { k: "status", label: "Status", type: "select", options: () => U.opt.videoStatuses(), req: true },
    { k: "format", label: "Format", type: "select", options: C.postFormats.map((f) => [f, f]) },
    { k: "ratio", label: "Proporcje", type: "select", options: C.ratios.map((r) => [r, r]) },
    { k: "owner", label: "Odpowiedzialny", type: "select", options: () => U.opt.roles() },
    { k: "due", label: "Termin", type: "date" },
    { k: "channelIds", label: "Kanały", type: "multi", options: () => U.opt.channels() },
    { k: "assetIds", label: "Pliki (z biblioteki)", type: "multi", options: () => U.opt.assets() },
    { k: "postId", label: "Powiązany post", type: "select", options: () => U.opt.posts() },
    { k: "notes", label: "Uwagi", type: "textarea", wide: true, rows: 2 },
  ];
  const VIDEO_FIELDS = {
    inhouse: VIDEO_COMMON_TOP.concat([
      { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 }, { k: "goal", label: "Cel" },
      { k: "location", label: "Lokalizacja" }, { k: "people", label: "Osoby" }, { k: "props", label: "Rekwizyty" },
      { k: "shots", label: "Lista ujęć", type: "textarea", wide: true, rows: 3 }, { k: "script", label: "Scenariusz", type: "textarea", wide: true, rows: 4 },
    ], VIDEO_COMMON_BOTTOM),
    ai: VIDEO_COMMON_TOP.concat([
      { k: "tool", label: "Narzędzie", type: "select", options: C.videoTools.map((t) => [t, t]) },
      { k: "script", label: "Scenariusz", type: "textarea", wide: true, rows: 3 }, { k: "prompt", label: "Prompt", type: "textarea", wide: true, rows: 4 },
      { k: "refs", label: "Materiały referencyjne i pliki wejściowe", type: "textarea", wide: true, rows: 2 }, { k: "result", label: "Wynik (opis lub link)", wide: true },
    ], VIDEO_COMMON_BOTTOM),
  };
  CT.forms.video = (x, track) => {
    const tr = x ? x.track : track || "inhouse";
    U.openForm({ title: x ? `Edytuj: ${tr === "ai" ? "AI Video" : "In-house"}` : `Nowy pomysł wideo: ${tr === "ai" ? "AI Video" : "In-house"}`, fields: VIDEO_FIELDS[tr],
      values: x || { status: (R().settings().videoStatuses || [])[0], brandId: RL().brandFilter() || "", ratio: "9:16", format: "Reels", owner: "smm" },
      onSave: (vals) => { if (x) R().update("videos", x.id, vals); else R().add("videos", { ...vals, track: tr }, "vd"); U.toast("Zapisano."); },
      onDelete: x ? () => R().remove("videos", x.id) : null });
  };
  CT.views["wideo/produkcja"] = () => {
    const tr = U.state.videoTrack; const bf = RL().brandFilter();
    const statuses = R().settings().videoStatuses || C.defaultVideoStatuses;
    const col = (track, title) => {
      const items = R().list("videos", (x) => x.track === track && (!bf || !x.brandId || x.brandId === bf)).sort((a, b) => statuses.indexOf(a.status) - statuses.indexOf(b.status) || (a.due || "9").localeCompare(b.due || "9"));
      return `<section class="vcol"><div class="cardhead"><h2>${title} <span class="cnt">${items.length}</span></h2><button class="btn small" data-act="video-new" data-track="${track}">Dodaj</button></div>
        ${items.length ? items.map((x) => `<article class="card vcard">
          <div class="cardhead"><button class="linkbtn strong" data-act="video-edit" data-id="${x.id}">${esc(x.title)}</button><span class="tag">${esc(x.status)}</span></div>
          ${x.hook ? `<p class="small">${esc(x.hook)}</p>` : ""}
          <p class="muted small">${[track === "ai" && x.tool ? x.tool : "", x.format, x.ratio, x.due ? "termin " + D.fmtDay(x.due) : "", x.owner ? R().userLabel(x.owner) : ""].filter(Boolean).map(esc).join(", ")}</p>
          ${x.postId && R().get("posts", x.postId) ? `<p class="small">Post: <a href="#/post/${x.postId}">${esc(U.nameOf("posts", x.postId, "title"))}</a></p>` : ""}
          <div class="btnrow">
            <label class="fsel inline"><span>Status</span><select data-act-change="video-status" data-id="${x.id}">${statuses.map((s) => `<option ${s === x.status ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>
            <button class="btn small ghost" data-act="video-real" data-id="${x.id}">Przenieś do realizacji</button>
            <button class="btn small ghost" data-act="video-post" data-id="${x.id}">${x.postId ? "Zmień post" : "Podepnij do posta"}</button>
            <button class="btn small ghost" data-act="video-cal" data-id="${x.id}">Dodaj do harmonogramu</button>
            <label class="btn small ghost">Zapisz gotowy materiał<input type="file" hidden accept="video/*,image/*" data-act-change="video-file" data-id="${x.id}"></label>
          </div></article>`).join("") : `<p class="muted small">Brak pomysłów.</p>`}</section>`;
    };
    const seg = (m, l) => `<button class="seg${tr === m ? " on" : ""}" data-act="video-track" data-mode="${m}">${l}</button>`;
    return U.head("Wideo Content", "Dwa tory produkcji: nagrania własne i wideo generowane przez AI. Nazwy narzędzi AI służą organizacji pracy: aplikacja nie łączy się z ich API.")
      + `<div class="toolbar"><div class="segs">${seg("both", "Oba tory")}${seg("inhouse", "In-house")}${seg("ai", "AI Video")}</div></div>`
      + `<div class="vcols ${tr}">${tr !== "ai" ? col("inhouse", "In-house") : ""}${tr !== "inhouse" ? col("ai", "AI Video") : ""}</div>`;
  };
  CT.actions["video-track"] = (el) => { U.state.videoTrack = el.dataset.mode; CT.render(); };
  CT.actions["video-new"] = (el) => CT.forms.video(null, el.dataset.track);
  CT.actions["video-edit"] = (el) => CT.forms.video(R().get("videos", el.dataset.id));
  CT.actions["video-status"] = (el) => R().update("videos", el.dataset.id, { status: el.value });
  CT.actions["video-real"] = (el) => { const st = R().settings().videoStatuses || []; const target = st.includes("W produkcji") ? "W produkcji" : st[Math.min(4, st.length - 1)]; R().update("videos", el.dataset.id, { status: target }); U.toast(`Status: ${target}.`); };
  CT.actions["video-post"] = (el) => {
    const x = R().get("videos", el.dataset.id);
    U.openForm({ title: "Podepnij do posta", fields: [{ k: "postId", label: "Post", type: "select", options: () => U.opt.posts(), req: true }, { k: "attach", label: "Dołącz pliki tego wideo do wszystkich wersji posta", type: "checkbox" }], values: { ...x, attach: false },
      onSave: (vals) => {
        R().update("videos", x.id, { postId: vals.postId });
        const vs = R().list("versions", (v) => v.postId === vals.postId);
        if (vals.attach && (x.assetIds || []).length && vs.length) vs.forEach((v) => R().saveVersion(v.id, { assetIds: Array.from(new Set((v.assetIds || []).concat(x.assetIds))) }));
        U.toast("Podpięto do posta.");
      } });
  };
  CT.actions["video-cal"] = (el) => {
    const x = R().get("videos", el.dataset.id);
    U.openForm({ title: "Dodaj do harmonogramu", intro: "Utworzymy post z tym wideo i wersjami na wybrane kanały.", saveLabel: "Utwórz post",
      fields: [{ k: "channelIds", label: "Kanały", type: "multi", options: () => U.opt.channels(true) }, { k: "date", label: "Data publikacji", type: "date", req: true }, { k: "time", label: "Godzina", type: "time" }],
      values: { channelIds: (x.channelIds || []).filter((id) => (R().get("channels", id) || {}).active !== false), date: x.due || D.today() },
      onSave: (vals) => {
        if (!vals.channelIds.length) { U.toast("Zaznacz co najmniej jeden kanał."); return false; }
        const brandId = x.brandId || (R().get("channels", vals.channelIds[0]) || {}).brandId || "";
        const { post, versions } = R().createPost({ title: x.title, brandId, goal: x.goal || "", concept: [x.hook, x.script].filter(Boolean).join("\n\n") },
          vals.channelIds.map((channelId) => ({ channelId, date: vals.date, time: vals.time || undefined, format: x.format || "Reels", assetIds: x.assetIds || [] })));
        R().update("videos", x.id, { postId: post.id });
        CT.go(`post/${post.id}?v=${versions[0].id}`);
      } });
  };
  CT.actions["video-file"] = async (el) => {
    const x = R().get("videos", el.dataset.id);
    const created = await U.uploadFiles(el.files, { brandId: x.brandId || "", source: x.track === "ai" ? "AI" : "in-house" });
    if (created.length) R().update("videos", x.id, { assetIds: (x.assetIds || []).concat(created.map((a) => a.id)) });
  };

  /* ================= ZADANIA (formularz współdzielony) ================= */
  CT.forms.TASK_FIELDS = [
    { k: "title", label: "Tytuł", req: true, wide: true }, { k: "description", label: "Opis", type: "textarea", wide: true, rows: 2 },
    { k: "status", label: "Status", type: "select", options: C.taskStatuses, req: true }, { k: "priority", label: "Priorytet", type: "select", options: C.priorities },
    { k: "due", label: "Termin", type: "date" }, { k: "owner", label: "Odpowiedzialny", type: "select", options: () => U.opt.roles() },
    { k: "brandId", label: "Marka", type: "select", options: () => U.opt.brands() }, { k: "channelId", label: "Kanał", type: "select", options: () => U.opt.channels() },
    { k: "postId", label: "Powiązany post", type: "select", options: () => U.opt.posts() }, { k: "campaignId", label: "Powiązana kampania", type: "select", options: () => U.opt.campaigns() },
    { k: "assetId", label: "Powiązany materiał", type: "select", options: () => U.opt.assets() },
  ];
  CT.forms.task = (k, preset = {}) => U.openForm({ title: k ? "Edytuj zadanie" : "Nowe zadanie", fields: CT.forms.TASK_FIELDS,
    values: k || { status: "do_zrobienia", priority: "sredni", owner: R().role(), brandId: RL().brandFilter() || "", channelId: RL().channelFilter() || "", ...preset },
    onSave: (vals) => { if (k) R().update("tasks", k.id, vals); else R().add("tasks", vals, "tk"); U.toast("Zapisano zadanie."); },
    onDelete: k ? () => R().remove("tasks", k.id) : null });
})();

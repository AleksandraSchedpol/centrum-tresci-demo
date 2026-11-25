/* Repozytorium danych: jedyne miejsce, które czyta i zapisuje dane.
   Widoki wywołują wyłącznie funkcje z CT.repo; nie dotykają localStorage bezpośrednio.
   Relacje przez stabilne identyfikatory: Post 1–n PostVersion (wersje kanałowe), PostVersion n–n Asset,
   PostVersion 1–n Comment, Topic n–n Post, Campaign n–n Post. */
CT.repo = (() => {
  const D = CT.dates;
  const COLLS = ["brands", "channels", "pillars", "topics", "posts", "versions", "comments", "assets", "videos",
    "tasks", "campaigns", "formats", "events", "competitors", "analytics", "notifications", "newsletters", "nlLists"];
  let db = null;
  const subs = new Set();
  const loadHooks = new Set();
  /* Karta jest nieaktualna, gdy dane zmieniła inna karta tej przeglądarki. Do odświeżenia zapis jest wstrzymany,
     żeby nie nadpisać cudzych zmian. Dane przeładowuje dopiero użytkownik (przycisk „Odśwież”). */
  let stale = false;
  const staleSubs = new Set();

  const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  function init() {
    db = CT.storage.load();
    if (!db || !db.meta) { db = CT.mockData.create(); save(); }
    migrate();
    loadHooks.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }
  /* Ponowne wczytanie danych zapisanych przez inną kartę (na życzenie użytkownika). */
  function reload() {
    const fresh = CT.storage.load();
    if (fresh && fresh.meta) { db = fresh; migrate(); }
    stale = false;
    loadHooks.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    staleSubs.forEach((f) => { try { f(false); } catch (e) { console.error(e); } });
  }
  const onLoad = (f) => { loadHooks.add(f); return () => loadHooks.delete(f); };
  const onStale = (f) => { staleSubs.add(f); return () => staleSubs.delete(f); };
  function markStale() {
    if (stale) return;
    stale = true;
    staleSubs.forEach((f) => { try { f(true); } catch (e) { console.error(e); } });
  }
  const isStale = () => { if (!stale && CT.storage.changedElsewhere()) markStale(); return stale; };
  /* Błąd zgłaszany przy próbie zapisu w nieaktualnej karcie. Powłoka aplikacji pokazuje komunikat. */
  function StaleError() { const e = new Error("Dane zmieniono w innej karcie. Kliknij „Odśwież”, żeby zapisać kolejne zmiany."); e.name = "StaleError"; e.stale = true; return e; }
  function assertFresh() { if (isStale()) throw StaleError(); }
  function migrate() {
    COLLS.forEach((c) => { if (!Array.isArray(db[c])) db[c] = []; });
    const def = CT.mockData.defaultSettings();
    db.settings = Object.assign(def, db.settings || {});
    db.settings.briefing = Object.assign(def.briefing, db.settings.briefing || {});
    if (!db.meta.nlSeeded) {
      const seed = CT.mockData.newsletterSeed();
      if (!db.nlLists.length) db.nlLists.push(...seed.lists);
      seed.topics.forEach((x) => { if (!db.topics.some((t) => t.id === x.id)) db.topics.push(x); });
      seed.formats.forEach((x) => { if (!db.formats.some((f) => f.id === x.id)) db.formats.push(x); });
      db.meta.nlSeeded = true;
    }
    /* Tematy do kręcenia In-House: jednorazowo, bez duplikatów (po id). */
    if (!db.meta.inhouseSeeded && CT.inhouseSeed) {
      const seed = CT.inhouseSeed((db.settings.videoStatuses || [])[0]);
      seed.topics.forEach((x) => { if (!db.topics.some((t) => t.id === x.id)) db.topics.push(x); });
      seed.videos.forEach((x) => { if (!db.videos.some((v) => v.id === x.id)) db.videos.push(x); });
      db.meta.inhouseSeeded = true;
    }
    if (!db.meta.topicsSeeded && CT.topicSeed) {
      CT.topicSeed().forEach((x) => { if (!db.topics.some((t) => t.id === x.id)) db.topics.push(x); });
      db.meta.topicsSeeded = true;
    }
    db.meta.schemaVersion = CT.config.schemaVersion;
  }
  function save() { db.meta.updatedAt = D.nowISO(); return CT.storage.save(db); }
  function commit() {
    if (save() === "conflict") {
      /* Inna karta zapisała dane w międzyczasie: cofamy niezapisaną zmianę w pamięci i wstrzymujemy zapis. */
      const known = CT.storage.lastKnown(); if (known && known.meta) { db = known; migrate(); }
      markStale();
      subs.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
      throw StaleError();
    }
    subs.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }
  const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

  /* --- operacje ogólne --- */
  const list = (c, pred) => { const a = db[c] || []; return pred ? a.filter(pred) : a.slice(); };
  const get = (c, id) => (id ? (db[c] || []).find((x) => x.id === id) || null : null);
  function add(c, obj, prefix) {
    const o = { id: uid(prefix || c.slice(0, 3)), createdAt: D.nowISO(), updatedAt: D.nowISO(), ...obj };
    db[c].push(o); commit(); return o;
  }
  function update(c, id, patch) {
    const o = get(c, id); if (!o) return null;
    Object.assign(o, patch, { updatedAt: D.nowISO() }); commit(); return o;
  }
  function remove(c, id) { db[c] = db[c].filter((x) => x.id !== id); commit(); }

  const settings = () => db.settings;
  function setSettings(patch) { Object.assign(db.settings, patch); commit(); }
  const role = () => db.settings.role;
  const userLabel = (r) => { const rr = r || role(); return (db.settings.users && db.settings.users[rr]) || CT.config.roles[rr] || rr; };

  /* --- pomocnicze --- */
  const chName = (id) => { const c = get("channels", id); return c ? c.name : "nieznany kanał"; };
  const postTitle = (v) => { const p = get("posts", v.postId); return p ? p.title : "Bez tytułu"; };
  const snap = (v) => JSON.stringify(CT.config.contentKeys.map((k) => (k === "assetIds" ? (v.assetIds || []) : (v[k] ?? ""))));
  function ev(type, desc, from, to) {
    return { id: uid("ev"), type, at: D.nowISO(), user: userLabel(), role: role(), desc, from: from ?? null, to: to ?? null };
  }
  const pushHist = (o, e) => { (o.history = o.history || []).push(e); };
  function notify(forRole, text, route, type) {
    db.notifications.push({ id: uid("nt"), forRole, type: type || "info", text, route: route || "", at: D.nowISO(), read: false });
  }
  const vRoute = (v) => `post/${v.postId}?v=${v.id}`;

  /* --- posty i wersje kanałowe --- */
  function newVersion(post, x) {
    const ch = get("channels", x.channelId);
    const v = {
      id: uid("ver"), postId: post.id, channelId: x.channelId, format: x.format || "Post",
      date: x.date || D.today(), time: x.time ?? ((ch && ch.rhythm && ch.rhythm.preferredTime) || ""),
      status: "szkic", text: x.text || "", cta: x.cta || "", hashtags: x.hashtags || "", link: x.link || "",
      internalNotes: x.internalNotes || "", assetIds: x.assetIds ? x.assetIds.slice() : [],
      approval: null, publishedAt: null, publishedUrl: "", feedRank: null, history: [],
      createdAt: D.nowISO(), updatedAt: D.nowISO(),
    };
    pushHist(v, ev("utworzenie_wersji", `Utworzono wersję: ${ch ? ch.name : x.channelId}`));
    db.versions.push(v);
    return v;
  }
  function linkTopic(post, topicId) {
    const t = get("topics", topicId); if (!t) return;
    t.postIds = Array.from(new Set([...(t.postIds || []), post.id]));
    if (t.status === "nowy" || t.status === "odlozony") t.status = "w_planie";
    t.updatedAt = D.nowISO();
  }
  function createPost(base, vlist) {
    const post = {
      id: uid("post"), createdAt: D.nowISO(), updatedAt: D.nowISO(),
      title: base.title, brandId: base.brandId || "", pillarId: base.pillarId || "", goal: base.goal || "",
      concept: base.concept || "", notes: base.notes || "", topicId: base.topicId || "", campaignId: base.campaignId || "", history: [],
    };
    pushHist(post, ev("utworzenie_posta", `Utworzono post „${post.title}”`));
    db.posts.push(post);
    const versions = vlist.map((x) => newVersion(post, x));
    if (post.topicId) linkTopic(post, post.topicId);
    commit();
    return { post, versions };
  }
  function savePost(pid, vals) {
    const p = get("posts", pid); if (!p) return null;
    const prevTopic = p.topicId;
    Object.assign(p, vals, { updatedAt: D.nowISO() });
    pushHist(p, ev("edycja_posta", "Edycja danych posta"));
    if (p.topicId && p.topicId !== prevTopic) linkTopic(p, p.topicId);
    commit(); return p;
  }
  function deletePost(pid) {
    const vids = db.versions.filter((v) => v.postId === pid).map((v) => v.id);
    db.versions = db.versions.filter((v) => v.postId !== pid);
    db.comments = db.comments.filter((c) => !vids.includes(c.versionId));
    db.analytics = db.analytics.filter((a) => !vids.includes(a.versionId));
    db.topics.forEach((t) => { if (t.postIds) t.postIds = t.postIds.filter((id) => id !== pid); });
    db.campaigns.forEach((c) => { if (c.postIds) c.postIds = c.postIds.filter((id) => id !== pid); });
    db.posts = db.posts.filter((p) => p.id !== pid);
    commit();
  }
  function addVersion(postId, x) { const p = get("posts", postId); const v = newVersion(p, x); commit(); return v; }
  function duplicateVersion(vid, channelId) {
    const s = get("versions", vid); const p = get("posts", s.postId);
    const v = newVersion(p, { channelId, format: s.format, date: s.date, time: s.time, text: s.text, cta: s.cta,
      hashtags: s.hashtags, link: s.link, internalNotes: s.internalNotes, assetIds: s.assetIds });
    pushHist(v, ev("duplikacja", `Skopiowano treść z wersji: ${chName(s.channelId)}`));
    commit(); return v;
  }
  function deleteVersion(vid) {
    db.versions = db.versions.filter((v) => v.id !== vid);
    db.comments = db.comments.filter((c) => c.versionId !== vid);
    db.analytics = db.analytics.filter((a) => a.versionId !== vid);
    commit();
  }
  /* Zmiana terminu (drag & drop w harmonogramie): zapisuje poprzednią i nową datę w historii. */
  function moveVersion(vid, date, time) {
    const v = get("versions", vid); if (!v) return;
    if (date && v.date !== date) { pushHist(v, ev("zmiana_daty", "Zmiana daty publikacji", v.date, date)); v.date = date; }
    if (time !== undefined && time !== v.time) { pushHist(v, ev("zmiana_godziny", "Zmiana godziny publikacji", v.time, time)); v.time = time; }
    v.updatedAt = D.nowISO(); commit();
  }
  /* Zapis wersji z formularza. Istotna zmiana treści zatwierdzonej wersji unieważnia akceptację. */
  function saveVersion(vid, vals) {
    const v = get("versions", vid); if (!v) return { ok: false };
    const before = JSON.parse(JSON.stringify(v));
    if (vals.date !== undefined && vals.date !== v.date) pushHist(v, ev("zmiana_daty", "Zmiana daty publikacji", v.date, vals.date));
    if (vals.time !== undefined && vals.time !== v.time) pushHist(v, ev("zmiana_godziny", "Zmiana godziny publikacji", v.time, vals.time));
    if (vals.channelId && vals.channelId !== v.channelId) pushHist(v, ev("zmiana_kanalu", "Zmiana kanału", chName(v.channelId), chName(vals.channelId)));
    Object.assign(v, vals);
    const textChanged = ["text", "cta", "hashtags", "link", "format"].some((k) => (before[k] || "") !== (v[k] || ""));
    const assetsChanged = JSON.stringify(before.assetIds || []) !== JSON.stringify(v.assetIds || []);
    if (textChanged) pushHist(v, ev("edycja_tresci", "Edycja treści"));
    if (assetsChanged) pushHist(v, ev("zmiana_materialow", "Zmiana materiałów"));
    let invalidated = false;
    /* Kanał porównujemy osobno: akceptacje sprzed zapisywania channelId (brak pola) pozostają ważne. */
    const contentChanged = !!v.approval && v.approval.snapshot !== snap(v);
    const channelChanged = !!v.approval && !!v.approval.channelId && v.approval.channelId !== v.channelId;
    if (["zatwierdzony", "zaplanowany"].includes(v.status) && v.approval && (contentChanged || channelChanged)) {
      const prev = v.status;
      v.status = "do_akceptacji"; v.approval = null; invalidated = true;
      const why = contentChanged && channelChanged ? "Zmiana treści i kanału zatwierdzonej wersji" : channelChanged ? "Zmiana kanału zatwierdzonej wersji" : "Istotna zmiana zatwierdzonej treści";
      pushHist(v, ev("uniewaznienie_akceptacji", `${why}: akceptacja unieważniona`, prev, "do_akceptacji"));
      notify("przelozony", `Zmieniono zatwierdzony post „${postTitle(v)}” (${chName(v.channelId)}). Wymaga ponownej akceptacji.`, vRoute(v), "akceptacja");
    }
    v.updatedAt = D.nowISO(); commit();
    return { ok: true, invalidated };
  }
  function setStatus(vid, status, desc, type) {
    const v = get("versions", vid); if (!v) return;
    const prev = v.status; v.status = status;
    pushHist(v, ev(type || "zmiana_statusu", desc || "Zmiana statusu", prev, status));
    v.updatedAt = D.nowISO(); commit();
  }
  function sendForApproval(vid) {
    const v = get("versions", vid); const prev = v.status;
    v.status = "do_akceptacji"; v.approval = null;
    pushHist(v, ev("wyslano_do_akceptacji", "Wysłano do akceptacji", prev, "do_akceptacji"));
    notify("przelozony", `Nowy post do akceptacji: „${postTitle(v)}” (${chName(v.channelId)}, ${D.fmtDay(v.date)}).`, vRoute(v), "akceptacja");
    v.updatedAt = D.nowISO(); commit();
  }
  function approve(vid) {
    const v = get("versions", vid); const prev = v.status;
    v.status = "zatwierdzony"; v.approval = { at: D.nowISO(), by: userLabel(), snapshot: snap(v), channelId: v.channelId };
    pushHist(v, ev("zatwierdzono", "Zatwierdzono", prev, "zatwierdzony"));
    notify("smm", `Zatwierdzono: „${postTitle(v)}” (${chName(v.channelId)}).`, vRoute(v), "akceptacja");
    v.updatedAt = D.nowISO(); commit();
  }
  function requestChanges(vid, note) {
    const v = get("versions", vid); const prev = v.status;
    v.status = "poprawki"; v.approval = null;
    pushHist(v, ev("poprawki", "Zgłoszono poprawki", prev, "poprawki"));
    db.comments.push({ id: uid("cm"), versionId: vid, parentId: null, target: "inne", author: userLabel(), role: role(), text: note, at: D.nowISO(), resolved: false, resolvedAt: null });
    notify("smm", `Poprawki do „${postTitle(v)}” (${chName(v.channelId)}): ${note}`, vRoute(v), "poprawki");
    v.updatedAt = D.nowISO(); commit();
  }
  function markPublished(vid, url) {
    const v = get("versions", vid); const prev = v.status;
    v.status = "opublikowany"; v.publishedAt = D.nowISO();
    pushHist(v, ev("opublikowano", `Potwierdzono publikację. Termin planowany: ${D.fmtDay(v.date)}${v.time ? " " + v.time : ""}`, prev, "opublikowany"));
    if (url) { v.publishedUrl = url; pushHist(v, ev("link_publikacji", "Dodano link do publikacji", null, url)); }
    v.updatedAt = D.nowISO(); commit();
  }
  function setPublishedUrl(vid, url) {
    const v = get("versions", vid); const prev = v.publishedUrl || null;
    v.publishedUrl = url; pushHist(v, ev("link_publikacji", "Zmieniono link do publikacji", prev, url));
    v.updatedAt = D.nowISO(); commit();
  }
  /* Kolejność przyszłych postów w podglądzie Instagrama (przechowywana niezależnie od daty). */
  function setFeedOrder(ids, movedId) {
    ids.forEach((id, i) => { const v = get("versions", id); if (v) v.feedRank = i + 1; });
    const m = get("versions", movedId); if (m) pushHist(m, ev("zmiana_kolejnosci_feedu", "Zmiana kolejności w podglądzie feedu"));
    commit();
  }
  /* Opcjonalnie: dopasowanie dat do kolejności w siatce (Instagram układa posty według daty publikacji). */
  function applyFeedOrderToDates(ids) {
    const vs = ids.map((id) => get("versions", id)).filter(Boolean);
    const slots = vs.map((v) => ({ date: v.date, time: v.time || "" })).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    vs.forEach((v, i) => {
      const s = slots[i];
      if (v.date !== s.date) pushHist(v, ev("zmiana_daty", "Dopasowanie daty do kolejności w feedzie", v.date, s.date));
      v.date = s.date; v.time = s.time; v.feedRank = null; v.updatedAt = D.nowISO();
    });
    commit();
  }

  /* --- newslettery --- */
  function linkTopicNl(o) {
    const t = get("topics", o.topicId); if (!t) return;
    t.nlIds = Array.from(new Set([...(t.nlIds || []), o.id]));
    if (t.status === "nowy" || t.status === "odlozony") t.status = "w_planie";
    t.updatedAt = D.nowISO();
  }
  function saveNewsletter(id, vals) {
    const now = D.nowISO();
    if (!id) {
      const o = { id: uid("nl"), createdAt: now, updatedAt: now, status: "pomysl", assetIds: [], postIds: [], history: [], stats: {}, sentAt: null, ...vals };
      pushHist(o, ev("utworzenie_newslettera", `Utworzono wydanie „${o.title}”`));
      if (o.status === "wyslany") o.sentAt = now;
      db.newsletters.push(o); if (o.topicId) linkTopicNl(o); commit(); return o;
    }
    const o = get("newsletters", id); if (!o) return null;
    if (vals.date !== undefined && vals.date !== o.date) pushHist(o, ev("zmiana_daty", "Zmiana daty wysyłki", o.date || null, vals.date || null));
    if (vals.status && vals.status !== o.status) {
      pushHist(o, ev("zmiana_statusu_nl", "Zmiana statusu", o.status, vals.status));
      if (vals.status === "wyslany" && !o.sentAt) o.sentAt = now;
    }
    if (vals.assetIds && JSON.stringify(vals.assetIds) !== JSON.stringify(o.assetIds || [])) pushHist(o, ev("zmiana_materialow", "Zmiana grafik"));
    Object.assign(o, vals, { updatedAt: now });
    if (o.topicId) linkTopicNl(o);
    commit(); return o;
  }
  function deleteNewsletter(id) {
    db.newsletters = db.newsletters.filter((x) => x.id !== id);
    db.topics.forEach((t) => { if (t.nlIds) t.nlIds = t.nlIds.filter((x) => x !== id); });
    commit();
  }

  /* --- komentarze --- */
  function addComment(vid, { text, target, parentId }) {
    const v = get("versions", vid); if (!v) return;
    const c = { id: uid("cm"), versionId: vid, parentId: parentId || null, target: target || "tresc", author: userLabel(), role: role(), text, at: D.nowISO(), resolved: false, resolvedAt: null };
    db.comments.push(c);
    pushHist(v, ev("komentarz", parentId ? "Odpowiedź na komentarz" : "Dodano komentarz"));
    notify(role() === "smm" ? "przelozony" : "smm", `Nowy komentarz do „${postTitle(v)}” (${chName(v.channelId)}): ${text}`, vRoute(v), "komentarz");
    commit(); return c;
  }
  function resolveComment(cid, resolved) {
    const c = get("comments", cid); if (!c) return;
    c.resolved = resolved; c.resolvedAt = resolved ? D.nowISO() : null;
    const v = get("versions", c.versionId);
    if (v) pushHist(v, ev(resolved ? "komentarz_rozwiazany" : "komentarz_otwarty", resolved ? "Oznaczono komentarz jako rozwiązany" : "Ponownie otwarto komentarz"));
    commit();
  }

  /* --- materiały --- */
  function addAsset(meta) { return add("assets", meta, "as"); }
  function assetUsage(aid) { return db.versions.filter((v) => (v.assetIds || []).includes(aid)); }
  async function deleteAsset(aid) {
    const a = get("assets", aid); if (!a) return;
    db.versions.forEach((v) => {
      if ((v.assetIds || []).includes(aid)) { v.assetIds = v.assetIds.filter((x) => x !== aid); pushHist(v, ev("zmiana_materialow", `Usunięto materiał z biblioteki: ${a.name}`)); }
    });
    db.videos.forEach((x) => { if (x.assetIds) x.assetIds = x.assetIds.filter((i) => i !== aid); });
    db.newsletters.forEach((x) => { if (x.assetIds) x.assetIds = x.assetIds.filter((i) => i !== aid); });
    db.campaigns.forEach((x) => { if (x.assetIds) x.assetIds = x.assetIds.filter((i) => i !== aid); });
    db.assets = db.assets.filter((x) => x.id !== aid);
    commit();
    try { if (a.blobKey) await CT.files.del(a.blobKey); } catch (e) { console.warn(e); }
  }

  /* --- analityka --- */
  function upsertAnalytics(match, values) {
    let rec = db.analytics.find((a) => Object.keys(match).every((k) => a[k] === match[k]));
    if (rec) Object.assign(rec, values, { updatedAt: D.nowISO() });
    else { rec = { id: uid("an"), ...match, ...values, createdAt: D.nowISO(), updatedAt: D.nowISO() }; db.analytics.push(rec); }
    commit(); return rec;
  }

  /* --- powiadomienia --- */
  function markRead(id) { const n = get("notifications", id); if (n) { n.read = true; commit(); } }
  function markAllRead(r) { db.notifications.forEach((n) => { if (n.forRole === r) n.read = true; }); commit(); }

  /* --- dane: kopia, import, czyszczenie --- */
  const exportJSON = () => JSON.stringify(db, null, 2);
  function importJSON(obj) {
    if (!obj || !obj.meta || !Array.isArray(obj.posts) || !Array.isArray(obj.versions)) throw new Error("To nie jest kopia Centrum treści.");
    db = obj; migrate();
    /* Nowy komplet danych: szkice porównujemy z nim jak po wczytaniu (konflikty przed zapisem). */
    loadHooks.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    commit();
  }
  function clearDemo() {
    const demoPosts = db.posts.filter((p) => p.demo).map((p) => p.id);
    const demoVers = db.versions.filter((v) => v.demo || demoPosts.includes(v.postId)).map((v) => v.id);
    db.posts = db.posts.filter((p) => !p.demo);
    db.versions = db.versions.filter((v) => !demoVers.includes(v.id));
    db.comments = db.comments.filter((c) => !demoVers.includes(c.versionId));
    db.analytics = db.analytics.filter((a) => !demoVers.includes(a.versionId));
    ["topics", "tasks", "videos", "campaigns", "competitors"].forEach((c) => { db[c] = db[c].filter((x) => !x.demo); });
    db.notifications = [];
    commit();
  }
  function resetAll() { db = CT.mockData.create(); migrate(); loadHooks.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); commit(); }

  /* Każda operacja zapisu najpierw sprawdza, czy karta jest aktualna. Odczyty działają zawsze. */
  const writers = { add, update, remove, setSettings, createPost, savePost, deletePost, addVersion, duplicateVersion, deleteVersion,
    moveVersion, saveVersion, setStatus, sendForApproval, approve, requestChanges, markPublished, setPublishedUrl, setFeedOrder,
    applyFeedOrderToDates, saveNewsletter, deleteNewsletter, addComment, resolveComment, addAsset, deleteAsset, upsertAnalytics,
    markRead, markAllRead, importJSON, clearDemo, resetAll };
  const guarded = {};
  Object.entries(writers).forEach(([k, fn]) => { guarded[k] = (...a) => { assertFresh(); return fn(...a); }; });

  return {
    init, reload, subscribe, onLoad, onStale, isStale, markStale, list, get, settings, role, userLabel, chName, postTitle, assetUsage, exportJSON,
    ...guarded,
  };
})();

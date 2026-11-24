/* Widoki główne: Dashboard, Poranny briefing, Harmonogram, Podgląd feedu. */
(() => {
  const U = CT.ui, D = CT.dates, esc = U.esc;
  const R = () => CT.repo;
  const RL = () => CT.rules;

  /* ================= DASHBOARD ================= */
  CT.views["dashboard/start"] = () => {
    const t = D.today(); const ws = D.weekStart(t); const we = D.addDays(ws, 6);
    const A = RL().weekAlerts();
    const cf = RL().channelFilter();
    const filterLabel = cf ? R().chName(cf) : "Wszystkie kanały";
    const inF = (v) => RL().inFilter(v);
    const next = R().list("versions", (v) => inF(v) && !RL().FINAL.includes(v.status) && v.date >= t && v.date <= D.addDays(t, 7))
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const waiting = R().list("versions", (v) => inF(v) && v.status === "do_akceptacji");
    const tasksToday = R().list("tasks", (k) => k.due && k.due <= t && !["zakonczone", "anulowane"].includes(k.status) && RL().brandMatch(k.brandId));
    const recent = R().list("versions", inF).flatMap((v) => (v.history || []).map((e) => ({ e, v })))
      .sort((a, b) => b.e.at.localeCompare(a.e.at)).slice(0, 8);
    const ym = t.slice(0, 7);
    const chs = R().list("channels", (c) => c.active !== false && (!cf || c.id === cf)).sort((a, b) => (a.order || 0) - (b.order || 0));
    const vItem = (v, extra) => ({ status: RL().displayStatus(v), title: R().postTitle(v), sub: `${R().chName(v.channelId)}, ${D.fmtDay(v.date)}${v.time ? " " + v.time : ""}${extra ? ". " + extra : ""}`, route: `post/${v.postId}?v=${v.id}` });
    const group = (title, items, empty, cls = "") => `<div class="wk ${cls}"><h3>${esc(title)}<span class="cnt">${items.length}</span></h3>${U.listItems(items.slice(0, 8), empty)}${items.length > 8 ? `<p class="muted small">i ${items.length - 8} więcej</p>` : ""}</div>`;
    const gaps = A.gaps.map((g) => ({ status: null, title: g.title, sub: g.sub, route: g.route }));
    const quick = [["post", "Dodaj post"], ["topic", "Dodaj temat"], ["video", "Dodaj wideo"], ["task", "Dodaj zadanie"], ["campaign", "Dodaj kampanię"]]
      .map(([k, l], i) => `<button class="btn ${i ? "" : "primary"}" data-act="quick-${k}">${l}</button>`).join("");

    return `<section class="dash-hero">
        <h1 class="display">Centrum treści social media</h1>
        <p class="dash-meta">Tydzień ${D.fmtDay(ws)} – ${D.fmtFull(we)} <span class="sep"></span> Filtr: <b>${esc(filterLabel)}</b></p>
        <div class="quick">${quick}</div>
      </section>
      ${dashTiles()}
      <div class="dash-grid">
        <section class="card week">
          <h2>W tym tygodniu</h2>
          ${group("Opóźnienia", A.late, "Brak opóźnień.", "late")}
          ${group("Do publikacji", A.ready, "Brak zatwierdzonych postów na ten tydzień.")}
          ${group("Wymaga uwagi", A.attention, "Nic nie wymaga uwagi.")}
          ${group("Luki w rytmie", gaps, "Rytm publikacji zachowany.", "gap")}
        </section>
        <div class="dash-side">
          <section class="card"><h2>Najbliższe publikacje</h2>${U.listItems(next.slice(0, 8).map((v) => vItem(v)), "Brak publikacji w najbliższych 7 dniach.")}</section>
          <section class="card"><h2>Oczekujące akceptacje</h2>${U.listItems(waiting.map((v) => vItem(v)), "Nic nie czeka na akceptację.")}</section>
          <section class="card"><h2>Zadania na dziś</h2>${U.listItems(tasksToday.map((k) => ({ status: null, title: k.title, sub: `${U.label(CT.config.taskStatuses, k.status)}, termin ${D.fmtDay(k.due)}`, route: `workspace/zadania?task=${k.id}` })), "Brak zadań na dziś.")}</section>
          <section class="card"><h2>Ostatnie zmiany</h2>${recent.length ? `<ul class="alist">${recent.map(({ e, v }) => `<li><button data-route="post/${v.postId}?v=${v.id}"><i class="dot task"></i><span><b>${esc(R().postTitle(v))}</b><small>${esc(e.desc)}, ${esc(e.user)}, ${D.fmtTs(e.at)}</small></span></button></li>`).join("")}</ul>` : `<p class="muted small">Brak zmian.</p>`}</section>
          <section class="card"><h2>Aktywność kanałów</h2><p class="muted small">${D.monthLabel(ym)}</p>
            <table class="tbl compact"><thead><tr><th>Kanał</th><th>Plan</th><th>Opubl.</th><th>Uwaga</th></tr></thead><tbody>
            ${chs.map((c) => { const vs = R().list("versions", (v) => v.channelId === c.id && v.date.startsWith(ym) && v.status !== "anulowany");
              return `<tr><td>${U.chTag(c)}</td><td>${vs.length}</td><td>${vs.filter((v) => v.status === "opublikowany").length}</td><td>${R().list("versions", (v) => v.channelId === c.id && RL().needsAttention(v)).length}</td></tr>`; }).join("")}
            </tbody></table></section>
        </div>
      </div>`;
  };

  function dashTiles() {
    const t = D.today(); const ws = D.weekStart(t); const we = D.addDays(ws, 6);
    const vs = R().list("versions", (v) => RL().inFilter(v) && v.status !== "anulowany");
    const late = vs.filter((v) => RL().isLate(v)).length;
    const ready = vs.filter((v) => ["zatwierdzony", "zaplanowany"].includes(v.status) && v.date >= t && v.date <= we).length;
    const wait = vs.filter((v) => v.status === "do_akceptacji").length;
    const pubIn = (a, b) => vs.filter((v) => v.status === "opublikowany" && v.date >= a && v.date <= b).length;
    const pw = pubIn(ws, we); const ppw = pubIn(D.addDays(ws, -7), D.addDays(ws, -1));
    return `<div class="ptiles dash">
      ${U.tile({ tone: "pink", key: "late", label: "Po terminie", value: late, sub: late ? "wymagają reakcji" : "wszystko na czas" })}
      ${U.tile({ tone: "sage", key: "ready", label: "Do publikacji w tym tygodniu", value: ready, sub: "zatwierdzone i zaplanowane" })}
      ${U.tile({ tone: "sand", key: "approvals", label: "Czeka na akceptację", value: wait, sub: R().role() === "przelozony" ? "czeka na Twoją decyzję" : "u przełożonego" })}
      ${U.tile({ tone: "lilac", key: "archive", label: "Opublikowane w tym tygodniu", value: pw, sub: U.delta(pw, ppw, "poprzedni tydzień") })}
    </div>`;
  }

  CT.actions["quick-post"] = () => CT.go("post/new");
  CT.actions["quick-topic"] = () => CT.forms.topic();
  CT.actions["quick-video"] = () => CT.forms.video(null, "inhouse");
  CT.actions["quick-task"] = () => CT.forms.task();
  CT.actions["quick-campaign"] = () => CT.forms.campaign();

  /* ================= PORANNY BRIEFING ================= */
  function briefingData() {
    const t = D.today(); const t2 = D.addDays(t, 2);
    const vs = R().list("versions", (v) => RL().inFilter(v) && !RL().FINAL.includes(v.status));
    const line = (v) => `${R().postTitle(v)} (${R().chName(v.channelId)}, ${D.fmtDay(v.date)}${v.time ? " " + v.time : ""})`;
    return {
      today: vs.filter((v) => v.date === t),
      confirm: vs.filter((v) => ["do_opublikowania", "opozniony"].includes(RL().displayStatus(v))),
      late: vs.filter((v) => v.date < t),
      approvals: vs.filter((v) => v.status === "do_akceptacji"),
      fixes: vs.filter((v) => v.status === "poprawki"),
      tasks: R().list("tasks", (k) => k.due && k.due <= t && !["zakonczone", "anulowane"].includes(k.status)),
      next2: vs.filter((v) => v.date > t && v.date <= t2),
      line,
    };
  }
  const BRIEF_SECTIONS = [["today", "Publikacje na dziś"], ["confirm", "Wymagają potwierdzenia publikacji"], ["late", "Opóźnione"], ["approvals", "Oczekują na akceptację"], ["fixes", "Poprawki do naniesienia"], ["tasks", "Zadania na dziś"], ["next2", "Publikacje na kolejne 2 dni"]];
  CT.views["dashboard/briefing"] = () => {
    const B = briefingData(); const s = R().settings().briefing;
    const sec = ([k, label]) => {
      if (s.scope && s.scope[k] === false) return "";
      const items = B[k];
      const html = k === "tasks"
        ? U.listItems(items.map((x) => ({ status: null, title: x.title, sub: `Termin ${D.fmtDay(x.due)}`, route: `workspace/zadania?task=${x.id}` })), "Brak.")
        : U.listItems(items.map((v) => ({ status: RL().displayStatus(v), title: R().postTitle(v), sub: `${R().chName(v.channelId)}, ${D.fmtDay(v.date)}${v.time ? " " + v.time : ""}`, route: `post/${v.postId}?v=${v.id}` })), "Brak.");
      return `<section class="card"><h2>${esc(label)} <span class="cnt">${items.length}</span></h2>${html}</section>`;
    };
    return U.head("Poranny briefing", `${D.fmtFull(D.today())}. Podsumowanie dnia według ustawień briefingu.`, `<button class="btn" data-act="brief-copy">Kopiuj jako tekst</button>`)
      + `<div class="notice">Automatyczna wysyłka e-mail o ${esc(s.time || "8:15")} wymaga serwera i dostawcy poczty (Etap 3). Teraz briefing jest dostępny tutaj i można go skopiować.</div>`
      + `<div class="grid2">${BRIEF_SECTIONS.map(sec).join("")}</div>`;
  };
  CT.actions["brief-copy"] = async () => {
    const B = briefingData();
    const txt = [`Poranny briefing: ${D.fmtFull(D.today())}`, ""].concat(BRIEF_SECTIONS.flatMap(([k, label]) => {
      const items = B[k]; if (!items.length) return [];
      return [label + ":"].concat(items.map((x) => "- " + (k === "tasks" ? `${x.title} (termin ${D.fmtDay(x.due)})` : B.line(x))), [""]);
    })).join("\n");
    try { await navigator.clipboard.writeText(txt); U.toast("Skopiowano briefing."); } catch (e) { U.dialog(`<h2>Briefing</h2><textarea class="copybox" rows="16">${esc(txt)}</textarea>`); }
  };

  /* ================= HARMONOGRAM ================= */
  function vChip(v) {
    const p = R().get("posts", v.postId) || {}; const ch = R().get("channels", v.channelId) || {};
    const ds = RL().displayStatus(v); const w = RL().warnings(v);
    const a = R().get("assets", (v.assetIds || [])[0]);
    const locked = v.status === "opublikowany";
    return `<div class="vchip${ds === "anulowany" ? " cancelled" : ""}" role="button" tabindex="0" draggable="${!locked}" data-drag="version:${v.id}" data-route="post/${v.postId}?v=${v.id}" style="--c:${ch.color || "#7A2040"}" title="${esc(p.title)}">
      <span class="th">${a ? U.thumb(a) : esc((p.title || "?").charAt(0).toUpperCase())}</span>
      <span class="tx"><span class="t">${esc(p.title || "Bez tytułu")}</span>
      <span class="m">${U.dot(ds)}<span>${esc(ch.mono || "")} ${esc(U.platShort(ch))}</span>${v.time ? `<span>${esc(v.time)}</span>` : ""}<span>${esc(v.format)}</span>${w.length ? `<b class="warnflag" title="${esc(w.join(" "))}">!</b>` : ""}</span></span>
    </div>`;
  }
  CT.ui.vChip = vChip;
  function calVersions() {
    const st = U.state;
    const ds = (v) => RL().displayStatus(v);
    const pass = (v) => !st.calStatus
      || (st.calStatus === "ready" ? ["zatwierdzony", "zaplanowany", "do_opublikowania"].includes(ds(v)) && v.date >= D.today()
      : st.calStatus === "late" ? RL().isLate(v) : ds(v) === st.calStatus);
    return R().list("versions", (v) => RL().inFilter(v) && pass(v)
      && (!st.calBrand || (R().get("channels", v.channelId) || {}).brandId === st.calBrand));
  }
  function topicsPanel() {
    const bf = RL().brandFilter();
    const ts = R().list("topics", (t) => (t.targets || ["social"]).includes("social") && t.status !== "wykorzystany" && (!bf || !t.brandId || t.brandId === bf))
      .sort((a, b) => ["wysoki", "sredni", "niski"].indexOf(a.priority) - ["wysoki", "sredni", "niski"].indexOf(b.priority));
    return `<aside class="card topics-panel"><h2>Bank tematów</h2><p class="muted small">Przeciągnij temat na dzień, żeby utworzyć post. Temat zostaje w banku z powiązaniem.</p>
      ${ts.length ? ts.map((t) => `<div class="topic" draggable="true" data-drag="topic:${t.id}" title="${esc(t.description || "")}"><span class="grip">⋮⋮</span><span><b>${esc(t.title)}</b><small>${esc(U.label(CT.config.topicStatuses, t.status))}${t.priority ? ", " + esc(U.label(CT.config.priorities, t.priority)) : ""}${(t.postIds || []).length ? `, postów: ${t.postIds.length}` : ""}</small></span></div>`).join("") : `<p class="muted small">Bank jest pusty.</p>`}
      <button class="btn ghost small" data-act="quick-topic">Dodaj temat</button></aside>`;
  }
  CT.views["studio/harmonogram"] = () => {
    const st = U.state; const t = D.today();
    if (!st.calMonth) st.calMonth = t.slice(0, 7);
    if (!st.calWeek) st.calWeek = D.weekStart(t);
    const vs = calVersions();
    const modeBtn = (m, l) => `<button class="seg${st.calMode === m ? " on" : ""}" data-act="cal-mode" data-mode="${m}">${l}</button>`;
    const period = st.calMode === "week" ? `${D.fmtDay(st.calWeek)} – ${D.fmtFull(D.addDays(st.calWeek, 6))}` : D.monthLabel(st.calMonth);
    const statusOpts = [["ready", "Gotowe do publikacji"], ["late", "Po terminie"]].concat(CT.config.statuses.map((s) => [s.id, RL().statusMeta(s.id).label]));
    const pipe = st.calMode === "pipeline";
    const toolbar = `<div class="toolbar">
      <div class="segs">${modeBtn("month", "Miesiąc")}${modeBtn("week", "Tydzień")}${modeBtn("list", "Lista")}${modeBtn("pipeline", "Pipeline")}</div>
      ${pipe ? "" : `<div class="pager"><button class="icon" data-act="cal-prev" aria-label="Poprzedni okres">‹</button><b>${esc(period)}</b><button class="icon" data-act="cal-next" aria-label="Następny okres">›</button><button class="btn ghost small" data-act="cal-today">Dziś</button></div>`}
      <label class="fsel"><span>Status</span><select data-act-change="cal-status"><option value="">Wszystkie</option>${statusOpts.map(([v, l]) => `<option value="${v}" ${st.calStatus === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      ${RL().channelFilter() ? "" : `<label class="fsel"><span>Marka</span><select data-act-change="cal-brand"><option value="">Wszystkie</option>${U.opt.brands().map(([v, l]) => `<option value="${v}" ${st.calBrand === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`}
    </div>`;
    let body;
    if (pipe) {
      body = pipelineHtml(vs);
    } else if (st.calMode === "list") {
      const anyMonth = ["ready", "late"].includes(st.calStatus);
      const rows = vs.filter((v) => anyMonth || v.date.startsWith(st.calMonth)).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
      body = rows.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Data</th><th>Godz.</th><th>Temat</th><th>Kanał</th><th>Format</th><th>Status</th><th>Uwagi</th></tr></thead><tbody>
        ${rows.map((v) => `<tr data-route="post/${v.postId}?v=${v.id}" class="click"><td>${D.fmtDay(v.date)}</td><td>${esc(v.time || "")}</td><td><b>${esc(R().postTitle(v))}</b></td><td>${U.chTag(R().get("channels", v.channelId))}</td><td>${esc(v.format)}</td><td>${U.badge(RL().displayStatus(v))}</td><td class="small">${esc(RL().warnings(v).concat(RL().issues(v)).join(" "))}</td></tr>`).join("")}
        </tbody></table></div>` : U.empty("Brak postów w tym miesiącu.", `<button class="btn primary" data-act="quick-post">Dodaj post</button>`);
    } else {
      let start, end;
      if (st.calMode === "week") { start = st.calWeek; end = D.addDays(start, 6); }
      else { const ms = D.monthStart(st.calMonth); const me = D.monthEnd(st.calMonth); start = D.weekStart(ms); end = D.addDays(D.weekStart(me), 6); }
      const byDay = {};
      vs.forEach((v) => { (byDay[v.date] = byDay[v.date] || []).push(v); });
      const evs = {}; R().list("events").forEach((e) => { (evs[e.date] = evs[e.date] || []).push(e); });
      const nls = {}; if (!RL().channelFilter()) R().list("newsletters", (n) => n.date && n.status !== "anulowany").forEach((n) => { (nls[n.date] = nls[n.date] || []).push(n); });
      let cells = D.DOWS.map((d) => `<div class="dow">${d}</div>`).join("");
      for (let d = start; d <= end; d = D.addDays(d, 1)) {
        const dw = D.dow(d);
        const cls = ["day", dw === 0 || dw === 6 ? "wkend" : "", st.calMode === "month" && !d.startsWith(st.calMonth) ? "out" : "", d === t ? "today" : ""].join(" ");
        const items = (byDay[d] || []).sort((a, b) => (a.time || "99").localeCompare(b.time || "99")).map(vChip).join("");
        const ev = (evs[d] || []).map((e) => `<span class="evt" title="${esc(e.notes || "")}">${esc(e.title)}</span>`).join("")
          + (nls[d] || []).map((n) => { const l = R().get("nlLists", n.listId) || {}; return `<button class="nlchip" style="--c:${l.color || "#7A2040"}" data-act="nl-open" data-id="${n.id}" title="${esc(n.title)}">✉ ${esc(l.short || "NL")}: ${esc(n.title)}</button>`; }).join("");
        cells += `<div class="${cls}" data-drop="day:${d}"><div class="dtop"><span class="dnum">${Number(d.slice(8))}</span><button class="add" data-act="cal-add" data-date="${d}" aria-label="Dodaj post ${D.fmtDay(d)}">+</button></div>${ev}${items}</div>`;
      }
      body = `<div class="calwrap"><div class="cal ${st.calMode}">${cells}</div></div>
        <div class="legend">${["szkic", "w_przygotowaniu", "do_akceptacji", "poprawki", "zatwierdzony", "zaplanowany", "do_opublikowania", "opublikowany", "opozniony"].map((s) => `<span>${U.dot(s)}${esc(RL().statusMeta(s).label)}</span>`).join("")}<span><b class="warnflag">!</b>Niezgodne z rytmem kanału</span></div>`;
    }
    return U.head("Harmonogram", "Przeciągnij post na inny dzień, żeby zmienić termin. Każda zmiana trafia do historii z poprzednią i nową datą.", `<button class="btn primary" data-act="quick-post">Dodaj post</button>`)
      + planTiles() + toolbar + (pipe ? body : `<div class="cal-layout"><div>${body}</div>${topicsPanel()}</div>`);
  };

  /* Kafelki nad Harmonogramem: liczone z danych, klik ustawia widok i filtr. */
  function planTiles() {
    const st = U.state; const t = D.today(); const ws = D.weekStart(t); const we = D.addDays(ws, 6);
    const ym = t.slice(0, 7); const pym = D.addMonths(ym, -1);
    const vs = R().list("versions", (v) => RL().inFilter(v) && v.status !== "anulowany");
    const active = vs.filter((v) => v.status !== "opublikowany");
    const late = active.filter((v) => RL().isLate(v)).length;
    const inWeek = (v, a, b) => v.date >= a && v.date <= b;
    const week = vs.filter((v) => inWeek(v, ws, we)).length; const pweek = vs.filter((v) => inWeek(v, D.addDays(ws, -7), D.addDays(ws, -1))).length;
    const ready = active.filter((v) => ["zatwierdzony", "zaplanowany"].includes(v.status) && v.date >= t).length;
    const pub = vs.filter((v) => v.status === "opublikowany" && v.date.startsWith(ym)).length;
    const ppub = vs.filter((v) => v.status === "opublikowany" && v.date.startsWith(pym)).length;
    return `<div class="ptiles">
      ${U.tile({ tone: "pink", key: "pipeline", label: "W toku", value: active.length, sub: late ? `w tym po terminie: ${late}` : "wszystkie nieopublikowane", on: st.calMode === "pipeline" })}
      ${U.tile({ tone: "sage", key: "week", label: "W tym tygodniu", value: week, sub: U.delta(week, pweek, "poprzedni tydzień"), on: st.calMode === "week" && st.calWeek === ws && !st.calStatus })}
      ${U.tile({ tone: "sand", key: "ready", label: "Gotowe do publikacji", value: ready, sub: "zatwierdzone i zaplanowane", on: st.calStatus === "ready" })}
      ${U.tile({ tone: "lilac", key: "published", label: "Opublikowane w miesiącu", value: pub, sub: U.delta(pub, ppub, "poprzedni miesiąc"), on: st.calStatus === "opublikowany" })}
    </div>`;
  }

  /* Pipeline: kolumny według zapisanego statusu. Przeciągnięcie wykonuje ten sam krok procesu co przycisk w karcie posta. */
  const STAGES = ["szkic", "w_przygotowaniu", "do_akceptacji", "poprawki", "zatwierdzony", "zaplanowany", "opublikowany"];
  function pCard(v) {
    const ch = R().get("channels", v.channelId) || {}; const ds = RL().displayStatus(v);
    const a = R().get("assets", (v.assetIds || [])[0]); const late = RL().isLate(v);
    return `<div class="pcard" role="button" tabindex="0" draggable="${v.status !== "opublikowany"}" data-drag="version:${v.id}" data-route="post/${v.postId}?v=${v.id}" style="--c:${ch.color || "#7A2040"}">
      ${a ? `<span class="th">${U.thumb(a)}</span>` : ""}
      <span class="tx"><b>${esc(R().postTitle(v))}</b><small><i class="cd" style="background:${ch.color || "#7A2040"}"></i>${esc(ch.name || "")}</small>
      <small>${D.fmtDay(v.date)}${v.time ? " " + esc(v.time) : ""}, ${esc(v.format)}</small>
      ${ds !== v.status || late ? `<span class="pflag">${U.badge(late && ds === v.status ? "opozniony" : ds)}</span>` : ""}</span></div>`;
  }
  function pipelineHtml(vs) {
    const ym = U.state.calMonth;
    const list = vs.filter((v) => v.status !== "anulowany" && (v.status !== "opublikowany" || v.date.startsWith(ym)));
    const role = R().role();
    return `<p class="muted small">Przeciągnij kartę do kolejnej kolumny: wykona się ten sam krok co w karcie posta (wysłanie do akceptacji, zatwierdzenie, publikacja). ${role === "przelozony" ? "Jako Przełożony zatwierdzasz i zgłaszasz poprawki." : "Zatwierdzanie i poprawki wykonuje Przełożony."} Kolumna Opublikowany pokazuje bieżący miesiąc.</p>
      <div class="pipe">${STAGES.map((s) => { const items = list.filter((v) => v.status === s).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
        return `<section class="pcol" data-drop="stage:${s}"><h3>${U.dot(s)}${esc(RL().statusMeta(s).label)}<span class="cnt">${items.length}</span></h3>${items.map(pCard).join("") || `<p class="muted small pempty">Brak</p>`}</section>`; }).join("")}</div>`;
  }
  CT.dropHandlers = CT.dropHandlers || {};
  CT.dropHandlers.stage = (kind, id, stage) => {
    if (kind !== "version") return;
    const v = R().get("versions", id); if (!v || v.status === stage) return;
    const role = R().role(); const st = v.status; const no = (m) => U.toast(m);
    const working = ["szkic", "w_przygotowaniu", "poprawki"];
    if (["szkic", "w_przygotowaniu", "do_akceptacji", "zaplanowany", "opublikowany"].includes(stage) && role !== "smm") return no("Ten krok wykonuje Social Media Manager. Przełącz rolę w panelu kanałów.");
    if (["poprawki", "zatwierdzony"].includes(stage) && role !== "przelozony") return no("Zatwierdza i zgłasza poprawki Przełożony. Przełącz rolę w panelu kanałów, żeby to przetestować.");
    if (stage === "szkic" || stage === "w_przygotowaniu") {
      if (!working.includes(st)) return no("Ten post jest już w akceptacji lub zatwierdzony. Zmień go w karcie posta: edycja treści cofnie akceptację.");
      R().setStatus(id, stage, "Zmiana etapu pracy (pipeline)"); return;
    }
    if (stage === "do_akceptacji") {
      if (!working.includes(st)) return no("Do akceptacji wysyłasz szkic, post w przygotowaniu albo po poprawkach.");
      if ((!v.text || !v.text.trim()) && !(v.assetIds || []).length) return no("Dodaj tekst lub materiał przed wysłaniem do akceptacji.");
      R().sendForApproval(id); return no("Wysłano do akceptacji.");
    }
    if (stage === "poprawki") { if (st !== "do_akceptacji") return no("Poprawki zgłasza się do posta w akceptacji."); return CT.actions["ver-changes"]({ dataset: { id } }); }
    if (stage === "zatwierdzony") { if (st !== "do_akceptacji") return no("Zatwierdzić można post wysłany do akceptacji."); R().approve(id); return no("Zatwierdzono."); }
    if (stage === "zaplanowany") { if (st !== "zatwierdzony") return no("Jako zaplanowany oznaczasz post zatwierdzony."); R().setStatus(id, "zaplanowany", "Oznaczono jako zaplanowany w narzędziu platformy"); return no("Oznaczono jako zaplanowany."); }
    if (stage === "opublikowany") return CT.actions["ver-publish"]({ dataset: { id } });
  };

  CT.actions["tile"] = (el) => {
    const s = U.state; const k = el.dataset.k; const t = D.today();
    if (k === "pipeline") { s.calMode = "pipeline"; s.calStatus = ""; }
    else if (k === "week") { s.calMode = "week"; s.calWeek = D.weekStart(t); s.calStatus = ""; }
    else if (k === "ready") { s.calMode = "list"; s.calStatus = "ready"; }
    else if (k === "published") { s.calMode = "list"; s.calMonth = t.slice(0, 7); s.calStatus = "opublikowany"; }
    else if (k === "late") { s.calMode = "list"; s.calStatus = "late"; }
    else if (k === "approvals") { CT.go("workspace/akceptacje"); return; }
    else if (k === "archive") { CT.go("studio/archiwum"); return; }
    CT.go("studio/harmonogram");
  };
  CT.actions["cal-mode"] = (el) => { U.state.calMode = el.dataset.mode; CT.render(); };
  CT.actions["cal-prev"] = () => { const s = U.state; if (s.calMode === "week") s.calWeek = D.addDays(s.calWeek, -7); else s.calMonth = D.addMonths(s.calMonth, -1); CT.render(); };
  CT.actions["cal-next"] = () => { const s = U.state; if (s.calMode === "week") s.calWeek = D.addDays(s.calWeek, 7); else s.calMonth = D.addMonths(s.calMonth, 1); CT.render(); };
  CT.actions["cal-today"] = () => { const s = U.state; s.calMonth = D.today().slice(0, 7); s.calWeek = D.weekStart(D.today()); CT.render(); };
  CT.actions["cal-status"] = (el) => { U.state.calStatus = el.value; CT.render(); };
  CT.actions["cal-brand"] = (el) => { U.state.calBrand = el.value; CT.render(); };
  CT.actions["cal-add"] = (el) => { U.state.newPostDate = el.dataset.date; CT.go("post/new"); };

  /* Upuszczenie na dzień: zmiana terminu posta albo utworzenie posta z tematu. */
  CT.dropHandlers = CT.dropHandlers || {};
  CT.dropHandlers.day = (kind, id, day) => {
    if (kind === "version") {
      const v = R().get("versions", id); if (!v || v.date === day) return;
      if (v.status === "opublikowany") { U.toast("Opublikowanego posta nie można przenieść."); return; }
      R().moveVersion(id, day);
      const w = RL().warnings(R().get("versions", id));
      U.toast(`Przeniesiono na ${D.fmtDay(day)}.${w.length ? " Uwaga: " + w[0] : ""}`);
    } else if (kind === "topic") {
      const tp = R().get("topics", id); if (!tp) return;
      const cf = RL().channelFilter();
      const active = R().list("channels", (c) => c.active !== false);
      const chId = cf || (tp.channelIds || []).find((x) => active.some((c) => c.id === x)) || (active[0] && active[0].id);
      if (!chId) { U.toast("Najpierw dodaj aktywny kanał w Ustawieniach."); return; }
      const ch = R().get("channels", chId);
      const { post } = R().createPost({ title: tp.title, brandId: tp.brandId || ch.brandId, pillarId: tp.pillarId, goal: tp.goal, concept: [tp.description, tp.hook].filter(Boolean).join("\n\nHook: "), topicId: tp.id }, [{ channelId: chId, date: day }]);
      U.toast(`Utworzono post „${post.title}” na ${D.fmtDay(day)} (${ch.name}).`);
    }
  };

  /* ================= PODGLĄD FEEDU ================= */
  CT.views["studio/feed"] = () => {
    const chs = R().list("channels", (c) => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const cf = RL().channelFilter();
    let chId = cf || U.state.feedChannel || (chs[0] && chs[0].id);
    const ch = R().get("channels", chId);
    if (!ch) return U.head("Podgląd feedu") + U.empty("Brak aktywnych kanałów.");
    const picker = cf ? "" : `<div class="segs wrap">${chs.map((c) => `<button class="seg${c.id === chId ? " on" : ""}" data-act="feed-ch" data-id="${c.id}">${esc(c.name)}</button>`).join("")}</div>`;
    const vs = R().list("versions", (v) => v.channelId === chId && v.status !== "anulowany");
    const published = vs.filter((v) => v.status === "opublikowany").sort((a, b) => ((b.publishedAt || b.date) + "").localeCompare((a.publishedAt || a.date) + ""));
    const byDateDesc = (a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""));
    const future = vs.filter((v) => v.status !== "opublikowany").sort((a, b) => (a.feedRank != null && b.feedRank != null ? a.feedRank - b.feedRank : byDateDesc(a, b)));
    let body;
    if (ch.platform === "instagram") {
      const dateOrder = future.slice().sort(byDateDesc).map((v) => v.id).join();
      const mismatch = future.length > 1 && dateOrder !== future.map((v) => v.id).join();
      const tile = (v, locked) => {
        const a = R().get("assets", (v.assetIds || [])[0]);
        return `<div class="gtile${locked ? " locked" : ""}" ${locked ? "" : `draggable="true" data-drag="feed:${v.id}" data-drop="feed:${v.id}"`} data-route="post/${v.postId}?v=${v.id}" title="${esc(R().postTitle(v))}">
          ${a ? U.thumb(a) : `<span class="gph">${esc(R().postTitle(v))}</span>`}
          <span class="gmeta">${U.dot(RL().displayStatus(v))}${D.fmtDay(v.date)}</span></div>`;
      };
      body = (mismatch ? `<div class="notice warn">Kolejność w siatce różni się od kolejności dat. Na Instagramie o kolejności decyduje data publikacji. <button class="btn small" data-act="feed-fix" data-id="${chId}">Dopasuj daty do kolejności</button></div>` : "")
        + `<p class="muted small">Przeciągnij przyszłe posty, żeby zmienić kolejność. Opublikowanych nie można przesuwać.</p>
        <div class="igwrap"><div class="ighead">${U.mono(ch, "lg")}<div><b>${esc(ch.name)}</b><small>${vs.length} postów w planie i archiwum</small></div></div>
        <div class="iggrid">${future.map((v) => tile(v, false)).join("")}${published.map((v) => tile(v, true)).join("")}</div>
        ${vs.length ? "" : U.empty("Brak postów na tym kanale.")}</div>`;
    } else {
      const items = future.concat(published).slice(0, 20);
      body = items.length ? `<div class="stream">${items.map((v) => `<div class="streamitem" data-route="post/${v.postId}?v=${v.id}"><div class="streammeta">${U.badge(RL().displayStatus(v))}<span class="muted small">${D.fmtDay(v.date)}${v.time ? " " + v.time : ""}</span></div>${U.preview(v, R().get("posts", v.postId), ch, "mobile")}</div>`).join("")}</div>`
        : U.empty("Brak postów na tym kanale.");
    }
    return U.head("Podgląd feedu", `Poglądowy układ profilu ${esc(ch.name)}. Wygląd w aplikacji platformy może się różnić.`) + picker + body;
  };
  CT.actions["feed-ch"] = (el) => { U.state.feedChannel = el.dataset.id; CT.render(); };
  CT.actions["feed-fix"] = (el) => {
    const vs = R().list("versions", (v) => v.channelId === el.dataset.id && !RL().FINAL.includes(v.status));
    const byDateDesc = (a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""));
    const order = vs.sort((a, b) => (a.feedRank != null && b.feedRank != null ? a.feedRank - b.feedRank : byDateDesc(a, b))).map((v) => v.id);
    U.confirm("Zmienić daty publikacji tak, żeby odpowiadały kolejności w siatce? Zmiany trafią do historii.", "Dopasuj daty", () => { R().applyFeedOrderToDates(order); U.toast("Daty dopasowane do kolejności w feedzie."); });
  };
  CT.dropHandlers.feed = (kind, id, targetId) => {
    if (kind !== "feed" || id === targetId) return;
    const src = R().get("versions", id); if (!src) return;
    const byDateDesc = (a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""));
    const ids = R().list("versions", (v) => v.channelId === src.channelId && !RL().FINAL.includes(v.status))
      .sort((a, b) => (a.feedRank != null && b.feedRank != null ? a.feedRank - b.feedRank : byDateDesc(a, b))).map((v) => v.id);
    const from = ids.indexOf(id); ids.splice(from, 1);
    const to = ids.indexOf(targetId); ids.splice(to, 0, id);
    R().setFeedOrder(ids, id);
  };
})();

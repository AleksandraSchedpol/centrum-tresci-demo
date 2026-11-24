/* Logika biznesowa w jednym miejscu: statusy (także wyliczane), filtry, alerty, rytm, kontrola plików. */
CT.rules = (() => {
  const D = CT.dates;
  const R = () => CT.repo;
  const FINAL = ["opublikowany", "anulowany"];

  function statusMeta(id) {
    const base = CT.config.statuses.find((s) => s.id === id) || { id, label: id, color: "#999999" };
    const o = (R().settings().statusOverrides || {})[id] || {};
    return { ...base, ...Object.fromEntries(Object.entries(o).filter(([, v]) => v)) };
  }
  /* Status widoczny w interfejsie. Do opublikowania i Opóźniony wynikają z terminu, nie są zapisywane. */
  function displayStatus(v) {
    if (FINAL.includes(v.status)) return v.status;
    if (["zatwierdzony", "zaplanowany"].includes(v.status)) {
      const t = D.today();
      if (v.date < t) return "opozniony";
      if (v.date === t && (!v.time || v.time <= D.nowTime())) return "do_opublikowania";
    }
    return v.status;
  }
  const isLate = (v) => !FINAL.includes(v.status) && !!v.date && v.date < D.today();
  const isFeed = (v) => v.format !== "Stories";

  /* Filtr globalny z panelu kanałów. */
  const channelFilter = () => (CT.ui.state.channel && CT.ui.state.channel !== "all" ? CT.ui.state.channel : null);
  const brandFilter = () => { const c = R().get("channels", channelFilter()); return c ? c.brandId : null; };
  function inFilter(v) {
    const cf = channelFilter();
    if (cf) return v.channelId === cf;
    const ch = R().get("channels", v.channelId);
    return !!ch && ch.active !== false;
  }
  const brandMatch = (brandId) => { const b = brandFilter(); return !b || !brandId || brandId === b; };

  function warnings(v) {
    const ch = R().get("channels", v.channelId);
    if (!ch || !v.date) return [];
    const r = ch.rhythm || {};
    const dw = D.dow(v.date);
    const w = [];
    if (r.noFeedWeekend && isFeed(v) && (dw === 0 || dw === 6)) w.push("W weekend na tym kanale publikujemy tylko stories.");
    else if (r.feedDays && r.feedDays.length && isFeed(v) && !r.feedDays.includes(dw)) w.push(`Dni postów na tym kanale: ${r.feedDays.map((x) => D.DOW_FULL[x]).join(", ")}.`);
    if (r.storiesDays && r.storiesDays.length && !isFeed(v) && !r.storiesDays.includes(dw)) w.push(`Dni stories na tym kanale: ${r.storiesDays.map((x) => D.DOW_FULL[x]).join(", ")}.`);
    if (r.storiesPerDay && !isFeed(v)) {
      const n = R().list("versions", (x) => x.channelId === v.channelId && x.date === v.date && !isFeed(x) && x.status !== "anulowany").length;
      if (n > r.storiesPerDay) w.push(`Więcej niż ${r.storiesPerDay} stories tego dnia.`);
    }
    return w;
  }
  function issues(v) {
    const out = [];
    if (!v.text || !v.text.trim()) out.push("brak tekstu");
    if (!v.assetIds || !v.assetIds.length) out.push("brak materiałów");
    return out;
  }

  function vItem(v, text) {
    const ch = R().get("channels", v.channelId);
    return { kind: "version", id: v.id, date: v.date, status: displayStatus(v), title: R().postTitle(v),
      sub: `${ch ? ch.name : ""}, ${D.fmtDay(v.date)}${v.time ? " " + v.time : ""}. ${text}`, route: `post/${v.postId}?v=${v.id}` };
  }
  function tItem(t, text) {
    return { kind: "task", id: t.id, date: t.due || "", status: null, title: t.title, sub: text, route: `workspace/zadania?task=${t.id}` };
  }

  /* Alerty bieżącego tygodnia, liczone z rzeczywistych danych. */
  function weekAlerts() {
    const t = D.today(); const ws = D.weekStart(t); const we = D.addDays(ws, 6);
    const res = { late: [], ready: [], attention: [], gaps: [] };
    for (const v of R().list("versions", inFilter)) {
      if (FINAL.includes(v.status)) continue;
      const ds = displayStatus(v);
      if (v.date < t) {
        res.late.push(vItem(v, ds === "opozniony" ? "Termin minął, brak potwierdzenia publikacji" : `Termin minął, status: ${statusMeta(v.status).label}`));
        continue;
      }
      if (v.date > we) continue;
      if (["zatwierdzony", "zaplanowany"].includes(v.status)) {
        res.ready.push(vItem(v, ds === "do_opublikowania" ? "Opublikuj i potwierdź przyciskiem OPUBLIKOWANO" : "Gotowy do publikacji"));
      } else if (v.status === "do_akceptacji") res.attention.push(vItem(v, "Czeka na akceptację"));
      else if (v.status === "poprawki") res.attention.push(vItem(v, "Zgłoszone poprawki"));
      else res.attention.push(vItem(v, "Szkic do uzupełnienia"));
      const iss = issues(v);
      if (iss.length) res.late.push(vItem(v, `Publikacja w tym tygodniu: ${iss.join(", ")}`));
      const w = warnings(v);
      if (w.length) res.attention.push(vItem(v, w[0]));
    }
    for (const k of R().list("tasks", (x) => x.due && !["zakonczone", "anulowane"].includes(x.status) && brandMatch(x.brandId))) {
      if (k.due < t) res.late.push(tItem(k, `Zadanie po terminie (${D.fmtDay(k.due)})`));
      else if (k.due <= we) res.attention.push(tItem(k, `Zadanie: termin ${D.fmtDay(k.due)}`));
    }
    if (!channelFilter()) {
      for (const n of R().list("newsletters", (x) => x.date && !["wyslany", "anulowany"].includes(x.status))) {
        const l = R().get("nlLists", n.listId);
        const it = { kind: "newsletter", id: n.id, date: n.date, status: null, title: `${l ? l.short || l.name : "Newsletter"}: ${n.title}`, route: `newsletter/plan?nl=${n.id}` };
        if (n.date < t) res.late.push({ ...it, sub: `Newsletter po terminie wysyłki (${D.fmtDay(n.date)})` });
        else if (n.date <= we) (n.status === "gotowy" ? res.ready : res.attention).push({ ...it, sub: `Newsletter, ${D.fmtDay(n.date)}. ${n.status === "gotowy" ? "Gotowy do wysyłki" : "Status: " + CT.ui.label(CT.config.nlStatuses, n.status)}` });
      }
    }
    res.gaps = rhythmGaps(ws);
    const byDate = (a, b) => (a.date || "").localeCompare(b.date || "");
    ["late", "ready", "attention"].forEach((k) => res[k].sort(byDate));
    return res;
  }
  function rhythmGaps(ws) {
    const t = D.today(); const we = D.addDays(ws, 6); const out = [];
    const cf = channelFilter();
    for (const ch of R().list("channels", (c) => c.active !== false && (!cf || c.id === cf))) {
      const r = ch.rhythm || {};
      const vs = R().list("versions", (v) => v.channelId === ch.id && v.status !== "anulowany" && v.date >= ws && v.date <= we);
      (r.feedDays || []).forEach((dw) => {
        const day = D.addDays(ws, (dw + 6) % 7);
        if (day < t) return;
        if (!vs.some((v) => v.date === day && isFeed(v))) out.push({ title: ch.name, sub: `Brak posta ${dw === 2 ? "we" : "w"} ${D.DOW_ACC[dw]}, ${D.fmtDay(day)}`, route: "studio/harmonogram", channelId: ch.id });
      });
      if (r.perWeek) {
        const n = vs.filter(isFeed).length;
        if (n < r.perWeek) out.push({ title: ch.name, sub: `Zaplanowano ${n} z ${r.perWeek} postów w tym tygodniu`, route: "studio/harmonogram", channelId: ch.id });
      }
    }
    return out;
  }
  function needsAttention(v) {
    if (FINAL.includes(v.status)) return false;
    if (isLate(v) || v.status === "poprawki" || displayStatus(v) === "do_opublikowania") return true;
    return R().role() === "przelozony" && v.status === "do_akceptacji";
  }

  /* Kontrola pliku względem formatu kanału (Biblioteka formatów). */
  function fileChecks(asset, v) {
    const out = [];
    if (!asset) return out;
    const ch = R().get("channels", v.channelId);
    if (asset.size > CT.config.bigFileBytes) out.push("Plik jest bardzo duży: platforma może go odrzucić lub mocno skompresować.");
    if (asset.type === "pdf" && v.format !== "Dokument (PDF)") out.push("PDF pasuje tylko do formatu Dokument (PDF).");
    if (!asset.width || !asset.height || !ch) return out;
    const ratio = asset.width / asset.height;
    const fmts = R().list("formats", (f) => f.platform === ch.platform && f.kind === "organiczny" && String(f.type || "").toLowerCase().includes(String(v.format || "").toLowerCase()) && f.width && f.height);
    if (fmts.length && !fmts.some((f) => Math.abs(ratio - f.width / f.height) < 0.02)) {
      out.push(`Proporcje ${asset.width}×${asset.height} nie odpowiadają formatom ${fmts.map((f) => f.ratio).join(", ")}: materiał może zostać przycięty.`);
    }
    if (["Reels", "Stories"].includes(v.format) && ratio >= 1) out.push("Reels i Stories wymagają materiału pionowego.");
    if (asset.type === "image" && Math.min(asset.width, asset.height) < 600) out.push("Niska rozdzielczość: grafika może wyglądać nieostro.");
    return out;
  }

  const engagement = (r) => {
    if (!r || !r.reach) return null;
    const sum = ["reactions", "comments", "shares", "saves"].reduce((s, k) => s + (Number(r[k]) || 0), 0);
    return sum / r.reach;
  };

  return { FINAL, statusMeta, displayStatus, isLate, isFeed, channelFilter, brandFilter, inFilter, brandMatch, warnings, issues,
    weekAlerts, rhythmGaps, needsAttention, fileChecks, engagement };
})();

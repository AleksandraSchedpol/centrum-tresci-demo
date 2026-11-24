/* Daty: dni przechowujemy jako "RRRR-MM-DD", godziny jako "GG:MM" w strefie Europe/Warsaw.
   Znaczniki zdarzeń (utworzenie, potwierdzenie publikacji) jako ISO UTC. */
CT.dates = (() => {
  const tz = CT.config.timeZone;
  const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const timeFmt = new Intl.DateTimeFormat("pl-PL", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
  const tsFmt = new Intl.DateTimeFormat("pl-PL", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
  const MONTHS_GEN = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
  const DOWS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
  const DOW_FULL = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  const DOW_ACC = ["niedzielę", "poniedziałek", "wtorek", "środę", "czwartek", "piątek", "sobotę"];

  const today = () => dayFmt.format(new Date());
  const nowTime = () => timeFmt.format(new Date());
  const nowISO = () => new Date().toISOString();
  const toUTC = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fromUTC = (dt) => dt.toISOString().slice(0, 10);
  const addDays = (s, n) => { const t = toUTC(s); t.setUTCDate(t.getUTCDate() + n); return fromUTC(t); };
  const dow = (s) => toUTC(s).getUTCDay();
  const weekStart = (s) => addDays(s, -((dow(s) + 6) % 7));
  const monthStart = (ym) => ym + "-01";
  const monthEnd = (ym) => { const [y, m] = ym.split("-").map(Number); return fromUTC(new Date(Date.UTC(y, m, 0))); };
  const addMonths = (ym, n) => { const [y, m] = ym.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1 + n, 1)); return fromUTC(t).slice(0, 7); };
  const monthLabel = (ym) => { const [y, m] = ym.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };
  const fmtDay = (s) => { if (!s) return "brak daty"; const t = toUTC(s); return `${t.getUTCDate()} ${MONTHS_GEN[t.getUTCMonth()]}`; };
  const fmtFull = (s) => (s ? `${fmtDay(s)} ${s.slice(0, 4)}` : "brak daty");
  const fmtTs = (iso) => (iso ? tsFmt.format(new Date(iso)) : "brak");
  const quarterOf = (ym) => `${ym.slice(0, 4)}-Q${Math.floor((Number(ym.slice(5, 7)) - 1) / 3) + 1}`;
  const quarterRange = (q) => { const y = q.slice(0, 4); const n = Number(q.slice(-1)); const sm = String((n - 1) * 3 + 1).padStart(2, "0"); const em = String(n * 3).padStart(2, "0"); return [`${y}-${sm}-01`, monthEnd(`${y}-${em}`)]; };

  return { today, nowTime, nowISO, toUTC, fromUTC, addDays, dow, weekStart, monthStart, monthEnd, addMonths, monthLabel,
           fmtDay, fmtFull, fmtTs, quarterOf, quarterRange, MONTHS, MONTHS_GEN, DOWS, DOW_FULL, DOW_ACC };
})();

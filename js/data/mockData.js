/* Dane początkowe. Konfiguracja (marki, kanały, filary, formaty, okazje) to punkt startowy do edycji.
   Rekordy z demo: true to dane demonstracyjne: usuniesz je w Ustawienia > Dane i kopia. */
CT.mockData = {
  defaultSettings() {
    return {
      role: "smm",
      railCollapsed: false, hideHowto: false,
      users: { smm: "Social Media Manager", przelozony: "Przełożony" },
      statusOverrides: {},
      videoStatuses: CT.config.defaultVideoStatuses.slice(),
      briefing: { enabled: false, time: "08:15", days: [1, 2, 3, 4, 5], recipient: "", onlyAlerts: false,
        scope: { today: true, confirm: true, late: true, approvals: true, fixes: true, tasks: true, next2: true } },
    };
  },

  /* Listy newsletterowe i tematy z ustalonego planu wydań (nie są danymi demonstracyjnymi). */
  newsletterSeed() {
    const now = CT.dates.nowISO();
    const base = (o) => ({ createdAt: now, updatedAt: now, ...o });
    const lists = [
      base({ id: "nl_bok", name: "Newsletter BOK", short: "BOK", tool: "Outlook (wysyłka przez BOK)", audience: "B2B", color: "#7A2040", active: true,
        variants: ["Pełna wersja (więcej tekstu)", "Biuletyn BOK"],
        note: "Grafika 794 × 1123 px, font Poppins, kolory bordo, szarość i beż. Treść skondensowana: początek rozmowy i zachęta do kontaktu. Stany magazynowe zawsze potwierdzić z doradcą BOK." }),
      base({ id: "nl_ml", name: "MailerLite", short: "ML", tool: "MailerLite", audience: "B2B", color: "#2E7D74", active: true,
        variants: ["Newsletter"],
        note: "Biblioteka modułów HTML we wspólnym stylu. Uzupełnia newsletter BOK, nie powiela go 1:1." }),
    ];
    const t = (id, title, description, list, notes = "") => base({ id, title, description, hook: "", goal: "", pillarId: "", brandId: "br_schedpol", channelIds: [],
      targets: ["newsletter"], nlListIds: [list], priority: "sredni", status: "nowy", notes, assetIds: [], postIds: [], nlIds: [] });
    const topics = [
      t("tpn_bok1", "Odpływy liniowe Base Range (Rabatówka)", "Promocja w Rabatówce: rozmiary i zalety, miejsce na packshot. Dwie wersje: pełna i Biuletyn BOK.", "nl_bok", "Rabatówka trwa do końca lutego 2027."),
      t("tpn_bok2", "Nośniki do wanien", "Czy pasują do każdej wanny, opcja z podcięciem LED i bez, bez stelaża, gotowe pod płytki. Dwie wersje: pełna i Biuletyn BOK.", "nl_bok"),
      t("tpn_bok3", "Brodziki w strukturze kamienia", "Dostępność magazynowa i design. Dwie wersje: pełna i Biuletyn BOK.", "nl_bok", "Stany magazynowe potwierdzić z doradcą BOK, w treści tylko przykładowe dostępne serie."),
      t("tpn_ml1", "Odpływy Base-Low", "Pierwszy newsletter z biblioteki modułów: produkt, technologia, dostępne rozmiary.", "nl_ml"),
      t("tpn_ml2", "Nowa odsłona starych newsletterów produktowych", "Seria: informacja o produkcie, o technologii i dostępne rozmiary w nowej formie.", "nl_ml"),
    ];
    const formats = [base({ id: "fm_nl_bok", platform: "email", kind: "newsletter", type: "Grafika BOK", name: "Grafika newslettera BOK", width: 794, height: 1123, ratio: "794:1123", orientation: "pionowa",
      purpose: "Grafika wysyłana przez BOK", source: "Ustalenie wewnętrzne", updated: "", notes: "Font Poppins, bordo, szarość, beż." })];
    return { lists, topics, formats };
  },

  create() {
    const D = CT.dates;
    const T = D.today();
    const d = (n) => D.addDays(T, n);
    const now = D.nowISO();
    const base = (o) => ({ createdAt: now, updatedAt: now, ...o });
    const hist = (type, desc) => [{ id: "ev_seed_" + Math.random().toString(36).slice(2, 8), type, at: now, user: "Dane demonstracyjne", role: "smm", desc, from: null, to: null }];

    const brands = [
      base({ id: "br_schedpol", name: "Schedpol", color: "#7A2040", active: true,
        description: "Producent wyposażenia łazienek: brodziki, wanny, odpływy liniowe i produkty do zabudowy. Prezentacja pełnej oferty producenta.",
        character: "", audience: "", tone: "", values: "", rules: "", banned: "", links: "" }),
      base({ id: "br_l360", name: "Łazienka360", color: "#4F6F5E", active: true,
        description: "Sklep internetowy z wyposażeniem łazienek.",
        character: "", audience: "", tone: "", values: "", rules: "", banned: "", links: "" }),
      base({ id: "br_schedline", name: "Schedline", color: "#8C6A3F", active: true,
        description: "Marka dla salonów i sklepów internetowych.",
        character: "", audience: "", tone: "", values: "", rules: "", banned: "", links: "" }),
    ];

    const channels = [
      base({ id: "ch_sp_fb", name: "Schedpol Facebook", brandId: "br_schedpol", platform: "facebook", mono: "S", color: "#7A2040", active: true, order: 1,
        note: "Posty we wtorek i czwartek, stories we wtorek, środę, czwartek i sobotę.",
        rhythm: { perWeek: 2, feedDays: [2, 4], storiesDays: [2, 3, 4, 6], noFeedWeekend: true, storiesPerDay: null, preferredTime: "" } }),
      base({ id: "ch_l360_fb", name: "Łazienka360 Facebook", brandId: "br_l360", platform: "facebook", mono: "Ł", color: "#4F6F5E", active: true, order: 2,
        note: "Stories: jedna grafika dziennie.",
        rhythm: { perWeek: null, feedDays: [], storiesDays: [], noFeedWeekend: false, storiesPerDay: 1, preferredTime: "" } }),
      base({ id: "ch_sp_ig", name: "Schedpol Instagram", brandId: "br_schedpol", platform: "instagram", mono: "S", color: "#A8466E", active: true, order: 3,
        note: "Harmonogram w przygotowaniu. W weekend tylko stories.",
        rhythm: { perWeek: null, feedDays: [], storiesDays: [], noFeedWeekend: true, storiesPerDay: null, preferredTime: "" } }),
      base({ id: "ch_sl_fb", name: "Schedline Facebook", brandId: "br_schedline", platform: "facebook", mono: "SL", color: "#8C6A3F", active: false, order: 4,
        note: "Kanał do decyzji.",
        rhythm: { perWeek: null, feedDays: [], storiesDays: [], noFeedWeekend: false, storiesPerDay: null, preferredTime: "" } }),
      base({ id: "ch_sp_li", name: "Schedpol LinkedIn", brandId: "br_schedpol", platform: "linkedin", mono: "S", color: "#36506E", active: true, order: 5,
        note: "",
        rhythm: { perWeek: null, feedDays: [], storiesDays: [], noFeedWeekend: false, storiesPerDay: null, preferredTime: "" } }),
    ];

    const pillars = [
      ["Produkt i technologia", "#7A2040"], ["Inspiracje i aranżacje", "#A8466E"], ["Poradniki", "#2E7D74"],
      ["Firma i produkcja", "#36506E"], ["Sezon i promocje", "#C4861C"],
    ].map(([name, color], i) => base({ id: "pl_" + (i + 1), name, color, brandId: "", description: "Propozycja robocza: do weryfikacji.", goal: "", examples: "", share: null }));

    const src = "Do weryfikacji w dokumentacji platformy";
    const formats = [
      ["instagram", "organiczny", "Post, Karuzela", "Post pionowy", 1080, 1350, "4:5", "pionowa"],
      ["instagram", "organiczny", "Post, Karuzela", "Post kwadratowy", 1080, 1080, "1:1", "kwadrat"],
      ["instagram", "organiczny", "Reels, Stories", "Reels i Stories", 1080, 1920, "9:16", "pionowa"],
      ["facebook", "organiczny", "Post, Karuzela", "Post pionowy", 1080, 1350, "4:5", "pionowa"],
      ["facebook", "organiczny", "Post, Karuzela", "Post kwadratowy", 1080, 1080, "1:1", "kwadrat"],
      ["facebook", "organiczny", "Reels, Stories", "Reels i Stories", 1080, 1920, "9:16", "pionowa"],
      ["linkedin", "organiczny", "Post", "Obraz poziomy", 1200, 627, "1.91:1", "pozioma"],
      ["linkedin", "organiczny", "Post, Karuzela", "Obraz kwadratowy", 1200, 1200, "1:1", "kwadrat"],
      ["facebook", "reklamowy", "Post", "Meta: feed pionowy", 1080, 1350, "4:5", "pionowa"],
      ["facebook", "reklamowy", "Reels, Stories", "Meta: Stories i Reels", 1080, 1920, "9:16", "pionowa"],
    ].map((f, i) => base({ id: "fm_" + (i + 1), platform: f[0], kind: f[1], type: f[2], name: f[3], width: f[4], height: f[5], ratio: f[6], orientation: f[7],
      purpose: "", source: src, updated: "", notes: "" }));

    const events = [
      ["2026-11-27", "Black Friday", "okazja"], ["2026-12-06", "Mikołajki", "okazja"], ["2026-12-24", "Wigilia", "swieto"],
      ["2027-01-01", "Nowy Rok", "swieto"], ["2027-02-14", "Walentynki", "okazja"], ["2027-03-08", "Dzień Kobiet", "dzien"],
    ].map((e, i) => base({ id: "evt_" + (i + 1), date: e[0], title: e[1], type: e[2], brandIds: [], notes: "" }));

    /* --- dane demonstracyjne --- */
    const topics = [
      base({ id: "tp_demo1", demo: true, title: "Seria Top 5: brodziki", description: "Pięć najczęściej wybieranych brodzików z krótkim uzasadnieniem.", hook: "Który brodzik wybierają klienci najczęściej?",
        goal: "Edukacja i zasięg", pillarId: "pl_1", brandId: "br_schedpol", channelIds: ["ch_sp_fb", "ch_sp_ig"], priority: "wysoki", status: "nowy", notes: "", assetIds: [], postIds: [] }),
      base({ id: "tp_demo2", demo: true, title: "Jak dobrać maskownicę odpływu", description: "Poradnik wyboru koloru i wykończenia maskownicy.", hook: "",
        goal: "Poradnik", pillarId: "pl_3", brandId: "br_schedpol", channelIds: ["ch_sp_fb"], priority: "sredni", status: "nowy", notes: "", assetIds: [], postIds: [] }),
    ];
    const posts = [
      base({ id: "ps_demo1", demo: true, title: "Top 5 odpływów liniowych", brandId: "br_schedpol", pillarId: "pl_1", goal: "Pokazać najpopularniejsze odpływy", concept: "Karuzela z pięcioma odpływami i jednym argumentem na slajd.", notes: "", topicId: "", campaignId: "", history: hist("utworzenie_posta", "Utworzono post (demo)") }),
      base({ id: "ps_demo2", demo: true, title: "Nośnik pod płytki: montaż krok po kroku", brandId: "br_schedpol", pillarId: "pl_3", goal: "Poradnik montażowy", concept: "", notes: "", topicId: "", campaignId: "", history: hist("utworzenie_posta", "Utworzono post (demo)") }),
      base({ id: "ps_demo3", demo: true, title: "Inspiracja: jasna łazienka z odpływem przy ścianie", brandId: "br_schedpol", pillarId: "pl_2", goal: "Inspiracja", concept: "", notes: "", topicId: "", campaignId: "", history: hist("utworzenie_posta", "Utworzono post (demo)") }),
    ];
    const ver = (id, postId, channelId, date, status, format, text) => base({ id, demo: true, postId, channelId, date, time: "10:00", format, status, text, cta: "", hashtags: "", link: "", internalNotes: "",
      assetIds: [], approval: status === "zatwierdzony" ? { at: now, by: "Dane demonstracyjne", snapshot: JSON.stringify(CT.config.contentKeys.map((k) => (k === "assetIds" ? [] : k === "format" ? format : k === "text" ? text : ""))) } : null,
      publishedAt: null, publishedUrl: "", feedRank: null, history: hist("utworzenie_wersji", "Utworzono wersję (demo)") });
    const versions = [
      ver("vr_demo1", "ps_demo1", "ch_sp_fb", d(1), "zatwierdzony", "Karuzela", "Pięć odpływów liniowych, które klienci wybierają najczęściej. Przesuń, żeby zobaczyć wszystkie."),
      ver("vr_demo2", "ps_demo1", "ch_sp_ig", d(1), "do_akceptacji", "Karuzela", "Top 5 odpływów liniowych w jednym miejscu."),
      ver("vr_demo3", "ps_demo2", "ch_sp_fb", d(-2), "zatwierdzony", "Reels", "Montaż nośnika pod płytki w pięciu krokach."),
      ver("vr_demo4", "ps_demo3", "ch_sp_li", d(3), "szkic", "Post", ""),
    ];
    const tasks = [
      base({ id: "tk_demo1", demo: true, title: "Przygotować grafiki do karuzeli Top 5", description: "", status: "w_trakcie", priority: "wysoki", due: d(0), owner: "smm", brandId: "br_schedpol", channelId: "ch_sp_fb", postId: "ps_demo1", campaignId: "", assetId: "" }),
    ];

    return {
      meta: { schemaVersion: CT.config.schemaVersion, createdAt: now, updatedAt: now },
      settings: this.defaultSettings(),
      brands, channels, pillars, topics, posts, versions, comments: [], assets: [], videos: [], tasks, campaigns: [],
      formats, events, competitors: [], analytics: [], notifications: [], newsletters: [], nlLists: [],
    };
  },
};

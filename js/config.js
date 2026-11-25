/* Centrum treści social media – konfiguracja aplikacji.
   Tu żyją stałe słowniki i struktura nawigacji. Dane (marki, kanały, posty…) są w repozytorium,
   nie w tym pliku. */
window.CT = window.CT || {};

CT.config = {
  /* routerMode "hash" = adresy #/modul/zakladka (wersja lokalna); "memory" = nawigacja w pamięci (podgląd online). */
  routerMode: (window.CT_BOOT || {}).routerMode || "hash",
  preview: !!(window.CT_BOOT || {}).preview,
  storageKey: (window.CT_BOOT || {}).storageKey || "ctsm.db.v1",
  schemaVersion: 1,
  timeZone: "Europe/Warsaw",

  /* Struktura zakładek: grupa (górny pasek) → zakładki (drugi pasek). */
  nav: [
    { id: "dashboard", label: "Dashboard", tabs: [["start", "Przegląd"], ["briefing", "Poranny briefing"]] },
    { id: "studio", label: "Content Studio", tabs: [
      ["harmonogram", "Harmonogram"], ["posty", "Karty postów"], ["feed", "Podgląd feedu"],
      ["biblioteka", "Biblioteka materiałów"], ["tematy", "Bank tematów"], ["archiwum", "Archiwum"] ] },
    { id: "wideo", label: "Wideo Content", tabs: [["produkcja", "Produkcja wideo"]] },
    { id: "newsletter", label: "Newslettery", tabs: [
      ["plan", "Plan wysyłek"], ["tematy", "Bank tematów"], ["grafiki", "Grafiki"], ["statystyki", "Statystyki"], ["listy", "Listy"] ] },
    { id: "brand", label: "Brand Center", tabs: [
      ["marki", "Księga marek"], ["filary", "Filary komunikacji"], ["formaty", "Biblioteka formatów"],
      ["okazje", "Kalendarz okazji"], ["konkurencja", "Konkurencja"] ] },
    { id: "workspace", label: "Workspace", tabs: [
      ["akceptacje", "Akceptacje"], ["zadania", "Zadania"], ["komentarze", "Komentarze"],
      ["historia", "Historia działań"], ["powiadomienia", "Powiadomienia"] ] },
    { id: "performance", label: "Performance", tabs: [
      ["analityka", "Analityka"], ["raporty", "Raporty"], ["reklamy", "Reklamy i kampanie"], ["budzety", "Budżety"] ] },
    { id: "ai", label: "AI Assistant", tabs: [["asystent", "Asystent treści"]] },
    { id: "ustawienia", label: "Ustawienia", tabs: [
      ["marki", "Marki"], ["kanaly", "Kanały i rytm"], ["uzytkownicy", "Użytkownicy i role"],
      ["statusy", "Statusy"], ["powiadomienia", "Powiadomienia i briefing"], ["dane", "Dane i kopia"] ] },
  ],

  platforms: {
    facebook: { label: "Facebook", short: "f" },
    instagram: { label: "Instagram", short: "ig" },
    linkedin: { label: "LinkedIn", short: "in" },
    email: { label: "E-mail", short: "@" },
  },
  nlStatuses: [["pomysl", "Pomysł"], ["w_przygotowaniu", "W przygotowaniu"], ["gotowy", "Gotowy do wysyłki"], ["wyslany", "Wysłany"], ["anulowany", "Anulowany"]],
  nlStatusColors: { pomysl: "#B7A6AF", w_przygotowaniu: "#8C7A99", gotowy: "#4C8B5E", wyslany: "#3B1531", anulowany: "#8E8E8E" },
  topicTargets: [["social", "Social media"], ["newsletter", "Newsletter"]],

  /* Statusy wersji kanałowej. stored = zapisywany w danych, derived = wyliczany z daty
     (Do opublikowania, Opóźniony), żeby status nie rozjeżdżał się po zmianie terminu. */
  statuses: [
    { id: "szkic", label: "Szkic", color: "#B7A6AF", stored: true },
    { id: "w_przygotowaniu", label: "W przygotowaniu", color: "#8C7A99", stored: true },
    { id: "do_akceptacji", label: "Do akceptacji", color: "#C4861C", stored: true },
    { id: "poprawki", label: "Poprawki", color: "#C23B4B", stored: true },
    { id: "zatwierdzony", label: "Zatwierdzony", color: "#4C8B5E", stored: true },
    { id: "zaplanowany", label: "Zaplanowany", color: "#2E7D74", stored: true, hint: "Zaplanowany w Meta Business Suite lub na LinkedIn" },
    { id: "do_opublikowania", label: "Do opublikowania", color: "#D29A2E", derived: true },
    { id: "opublikowany", label: "Opublikowany", color: "#3B1531", stored: true },
    { id: "opozniony", label: "Opóźniony", color: "#9E2430", derived: true },
    { id: "anulowany", label: "Anulowany", color: "#8E8E8E", stored: true },
  ],

  postFormats: ["Post", "Karuzela", "Reels", "Stories", "Wideo", "Artykuł", "Dokument (PDF)"],
  ratios: ["9:16", "4:5", "1:1", "16:9", "1.91:1"],
  topicStatuses: [["nowy", "Nowy"], ["w_planie", "W planie"], ["wykorzystany", "Wykorzystany"], ["odlozony", "Odłożony"]],
  priorities: [["wysoki", "Wysoki"], ["sredni", "Średni"], ["niski", "Niski"]],
  taskStatuses: [["do_zrobienia", "Do zrobienia"], ["w_trakcie", "W trakcie"], ["oczekuje", "Oczekuje"], ["zakonczone", "Zakończone"], ["anulowane", "Anulowane"]],
  defaultVideoStatuses: ["Pomysł", "Do przygotowania", "Scenariusz", "Do nagrania", "W produkcji", "Do montażu", "Do akceptacji", "Poprawki", "Gotowe", "Wykorzystane"],
  videoTools: ["Kling", "Runway", "HeyGen", "Sora", "Inne"],
  campaignStatuses: [["plan", "Planowana"], ["akceptacja", "Do akceptacji"], ["aktywna", "Aktywna"], ["wstrzymana", "Wstrzymana"], ["zakonczona", "Zakończona"]],
  campaignPlatforms: [["meta", "Meta (Facebook + Instagram)"], ["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"]],
  assetSources: [["in-house", "In-house"], ["AI", "AI"], ["inne", "Inne"]],
  commentTargets: [["tresc", "Treść"], ["grafika", "Grafika"], ["wideo", "Wideo"], ["inne", "Inne"]],
  eventTypes: [["swieto", "Święto"], ["dzien", "Dzień tematyczny"], ["branza", "Wydarzenie branżowe"], ["firma", "Termin firmowy"], ["okazja", "Okazja marketingowa"]],
  formatKinds: [["organiczny", "Organiczny"], ["reklamowy", "Reklamowy"], ["newsletter", "Newsletter"]],
  orientations: [["pionowa", "Pionowa"], ["pozioma", "Pozioma"], ["kwadrat", "Kwadrat"]],
  roles: { smm: "Social Media Manager", przelozony: "Przełożony" },

  /* Pola, których zmiana w zatwierdzonej wersji unieważnia akceptację. Termin publikacji tu nie należy. */
  contentKeys: ["text", "cta", "hashtags", "link", "format", "assetIds"],
  bigFileBytes: 50 * 1024 * 1024,
};

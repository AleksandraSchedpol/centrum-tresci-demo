/* Tematy z ustalonych banków treści (nie są danymi demonstracyjnymi):
   - Schedpol: „Bank 50 tematów” z planu social media Q4 2026 oraz tematy uzupełniające,
   - Łazienka360: bank 10 tematów na posty i stories.
   Dodawane jednorazowo przy starcie (flaga meta.topicsSeeded); usunięte ręcznie nie wracają. */
CT.topicSeed = () => {
  const now = CT.dates.nowISO();
  const FB = "ch_sp_fb", IG = "ch_sp_ig", LI = "ch_sp_li", L360 = "ch_l360_fb";
  const P = { produkt: "pl_1", inspiracje: "pl_2", poradniki: "pl_3", firma: "pl_4", sezon: "pl_5" };
  const out = [];
  const add = (id, title, o = {}) => out.push({
    id, createdAt: now, updatedAt: now, title, description: o.d || "", hook: o.h || "", goal: o.g || "",
    pillarId: o.p || "", brandId: o.b || "br_schedpol", channelIds: o.ch || [FB, IG], targets: ["social"], nlListIds: [],
    priority: o.pr || "sredni", status: "nowy", notes: o.n || "", assetIds: [], postIds: [], nlIds: [],
  });

  /* --- Schedpol: Producent z Międzychodu --- */
  const g1 = { p: P.firma, ch: [FB, IG, LI], g: "Wiarygodność producenta" };
  add("tps_01", "Jak powstaje odpływ liniowy: od profilu aluminium do gotowego zestawu", { ...g1, pr: "wysoki" });
  add("tps_02", "Jak powstaje nośnik EPS: kształt, wymiar, kontrola przed wysyłką", { ...g1, pr: "wysoki" });
  add("tps_03", "45 lat w Międzychodzie: oś czasu firmy od 1981 roku", { ...g1, n: "Samo hasło nie wyróżnia, wyróżnia konkret: miejsce, rok, produkty, ludzie." });
  add("tps_04", "Ludzie z zakładu: krótkie sylwetki pracowników i ich rola w produkcji", g1);
  add("tps_05", "Kontrola jakości: co sprawdzamy w każdym odpływie przed wysyłką", { ...g1, pr: "wysoki" });
  add("tps_06", "Nośnik na wymiar: jak produkujemy nośniki dla producentów wanien (B2B)", { ...g1, ch: [LI, FB] });
  add("tps_07", "Magazyn i wysyłka: jak przygotowujemy zamówienie dla hurtowni", { ...g1, ch: [LI, FB] });
  add("tps_08", "Dlaczego produkcja w Polsce skraca drogę produktu do klienta", g1);

  /* --- Wiedza montażowa (instalatorzy i świadomi inwestorzy) --- */
  const g2 = { p: P.poradniki, ch: [FB, LI, IG], g: "Wiedza montażowa" };
  add("tps_09", "5 błędów przy montażu odpływu liniowego", { ...g2, pr: "wysoki" });
  add("tps_10", "Spadek 2%: jak go zaplanować w strefie walk-in", { ...g2, pr: "wysoki" });
  add("tps_11", "Hydroizolacja przy odpływie liniowym krok po kroku", { ...g2, pr: "wysoki" });
  add("tps_12", "Wysokość montażowa: co zrobić, gdy w wylewce jest mało miejsca", { ...g2, pr: "wysoki" });
  add("tps_13", "Syfon obracany o 360° w praktyce: trudne podejście kanalizacji", { ...g2, pr: "wysoki" });
  add("tps_14", "Montaż wanny na nośniku: kolejność prac", { ...g2, pr: "wysoki" });
  add("tps_15", "Otwór rewizyjny w zabudowie wanny: jak zachować dostęp do syfonu", g2);
  add("tps_16", "Docinanie brodzika kompozytowego: kiedy i jak", g2);
  add("tps_17", "Montaż brodzika w poziomie posadzki: o czym pamiętać", g2);
  add("tps_18", "Ogrzewanie podłogowe a brodzik podpłytkowy", g2);
  add("tps_19", "Jak wypoziomować odpływ regulowanymi nóżkami", { ...g2, pr: "wysoki", n: "Temat dla instalatorów." });
  add("tps_20", "Aklimatyzacja brodzika przed montażem: dlaczego warto odczekać", g2);

  /* --- Dobór produktu (inwestor przed zakupem) --- */
  const g3 = { p: P.poradniki, ch: [FB, IG], g: "Pomoc w wyborze" };
  add("tps_21", "Jaka długość odpływu do szerokości kabiny", { ...g3, pr: "wysoki" });
  add("tps_22", "Odpływ w posadzce czy przy ścianie", { ...g3, pr: "wysoki", h: "W posadzce, przy ścianie czy niewidoczny?", n: "Produkty: Slit Range, maskownice 2w1." });
  add("tps_23", "Brodzik akrylowy, kompozytowy czy podpłytkowy: porównanie", g3);
  add("tps_24", "Maskownica pełna czy pod płytkę", { ...g3, pr: "wysoki" });
  add("tps_25", "Brodzik czy odpływ liniowy w łazience walk-in", { ...g3, pr: "wysoki", n: "Produkty: Kalait bez progu, odpływy liniowe." });
  add("tps_26", "Wanna w zabudowie: nośnik, stelaż czy murowanie", { ...g3, pr: "wysoki", h: "Wanna w zabudowie bez murowania", n: "Ten sam problem remontowy, nasze rozwiązanie: nośnik Stabilsound Plus®." });
  add("tps_27", "Mała łazienka: rozwiązania do strefy prysznica", g3);
  add("tps_28", "Łazienka dla seniora: prysznic bez progu", { ...g3, h: "Łazienka bez progu dla całej rodziny", n: "Bez claimów o bezpieczeństwie i antypoślizgowości." });
  add("tps_29", "Co sprawdzić w karcie produktu przed zakupem odpływu", g3);
  add("tps_30", "Checklista zakupowa przed remontem łazienki", g3);

  /* --- Design i inspiracje --- */
  const g4 = { p: P.inspiracje, ch: [IG, FB], g: "Inspiracja" };
  add("tps_31", "Kolory maskownic: stal, czerń, złoto, miedź, grafit", { ...g4, pr: "wysoki", h: "Odpływ w kolorze armatury", n: "Format: karuzela L12 „wachlarz”." });
  add("tps_32", "Złoty akcent w posadzce: Base-Low Gold", { ...g4, pr: "wysoki" });
  add("tps_33", "Odpływ prawie niewidoczny: efekt jednolitej posadzki", { ...g4, pr: "wysoki" });
  add("tps_34", "Kolory ziemi w łazience: jak dobrać brodzik kompozytowy", g4);
  add("tps_35", "Czarna strefa prysznica: brodzik Black Stone i czarny odpływ", g4);
  add("tps_36", "Faktura kamienia w brodziku: wykończenia Stone", g4);
  add("tps_37", "Łazienka z jednego materiału: wanna i umywalka obłożone płytką", g4);
  add("tps_38", "Moodboard: materiały do łazienki w stylu organic modern", { ...g4, n: "Dobry temat na weekendowe stories (inspiracja, nie technika)." });

  /* --- Pytania klientów i doradca techniczny --- */
  const g5 = { p: P.poradniki, ch: [FB, IG, LI], g: "Ekspert odpowiada" };
  add("tps_39", "Pytanie tygodnia od instalatora: odpowiada doradca techniczny", { ...g5, n: "Wymaga udziału doradcy technicznego." });
  add("tps_40", "FAQ: 5 najczęstszych pytań o odpływy liniowe", { ...g5, pr: "wysoki" });
  add("tps_41", "FAQ: nośniki do wanien", { ...g5, pr: "wysoki" });
  add("tps_42", "Mit czy fakt: odpływ liniowy zawsze wymaga głębokiego kucia", { ...g5, pr: "wysoki" });
  add("tps_43", "Mit czy fakt: brodzik zlicowany z posadzką jest trudny w montażu", g5);
  add("tps_44", "Jak dbać o odpływ liniowy: czyszczenie syfonu od góry", { ...g5, pr: "wysoki", h: "Czyszczenie odpływu w 15 sekund", n: "Produkty: odpływy z wyjmowanym koszyczkiem (Base-Low). Gotowy do Reels." });

  /* --- Partnerzy i rynek --- */
  const g6 = { p: P.firma, ch: [FB, LI], g: "Relacje z rynkiem" };
  add("tps_45", "Gdzie zobaczyć nasze produkty na żywo: salony partnerskie", g6);
  add("tps_46", "Realizacje instalatorów z produktami Schedpol (za zgodą autorów)", { ...g6, n: "Tylko za zgodą autorów zdjęć." });
  add("tps_47", "Przed i po: remont strefy prysznica", { ...g6, ch: [FB, IG], n: "Wymaga materiałów z realizacji." });
  add("tps_48", "Dla dystrybutorów: dostępność odpływów i nośników na bieżąco", { ...g6, ch: [LI, FB], pr: "wysoki" });
  add("tps_49", "Targi i szkolenia dla instalatorów", g6);
  add("tps_50", "Gwarancja i serwis: co obejmuje i jak zgłosić sprawę", { ...g6, n: "Wariant: co obejmuje gwarancja na nośnik. Tylko w brzmieniu z dokumentu gwarancyjnego." });

  /* --- Tematy uzupełniające --- */
  add("tps_51", "Mało miejsca w wylewce? Odpływ od 7 cm", { p: P.produkt, ch: [FB, IG, LI], pr: "wysoki", g: "Rozwiązanie problemu montażowego",
    d: "Produkty: Base-Low, Base Range Low, Slim Range Low.", n: "Nasze parametry: przepływ do 42 l/min (175% EN 274), 40 mm zamknięcia wodnego." });
  add("tps_52", "Dlaczego z odpływu nie czuć kanalizacji", { p: P.produkt, ch: [FB, IG], pr: "wysoki", g: "Edukacja produktowa",
    d: "Base-Low: 40 mm zamknięcia wodnego.", n: "Nie piszemy o suchym syfonie, jeśli go nie mamy." });
  add("tps_53", "5 błędów przy planowaniu strefy prysznica", { p: P.poradniki, ch: [FB, IG, LI], pr: "wysoki", g: "Wiedza przed remontem",
    d: "Na bazie FAQ: spadek 2%, hydroizolacja, długość odpływu.", n: "" });
  add("tps_54", "Strefa prysznica od podstaw: co jest pod płytką", { p: P.produkt, ch: [FB, IG, LI], pr: "wysoki", g: "Wyróżnik: pokazujemy to, czego nie widać po montażu",
    d: "Odpływ, brodzik podpłytkowy i nośnik w jednym materiale.", n: "Pokazujemy to, czego nie widać po montażu." });
  add("tps_55", "Brodzik nie musi być biały", { p: P.inspiracje, ch: [IG, FB], g: "Inspiracja kolorystyczna",
    d: "Kalait w wykończeniach Stone (Cement, Black, Cashmere).", n: "Po potwierdzeniu dostępności." });

  /* --- Łazienka360: bank 10 tematów --- */
  const l = (id, title, h, fmt, cat, p, n = "") => add(id, title, { b: "br_l360", ch: [L360], h, p, d: `Format: ${fmt}. Kategorie do podpięcia: ${cat}.`, g: "Doradztwo przy urządzaniu łazienki", n });
  l("tpl_01", "Kolejność zakupów przy remoncie łazienki", "Co kupić najpierw? Zła kolejność kosztuje najwięcej.", "post, karuzela", "odpływy liniowe, brodziki, baterie podtynkowe", P.poradniki, "Wymiary i parametry tylko z kart produktów lub instrukcji producentów.");
  l("tpl_02", "Mała łazienka: 5 trików na więcej miejsca", "2,5 m² i wszystko się mieści? Da się!", "post, karuzela", "szafki łazienkowe, niskie brodziki, wanny przyścienne", P.poradniki);
  l("tpl_03", "Czarna, złota czy chrom? Armatura w jednym stylu", "Głosuj: którą łazienkę wybierasz?", "stories z ankietą „ta czy ta”", "baterie, akcesoria", P.inspiracje);
  l("tpl_04", "Syfon, korek, przelew: drobiazgi, o których się zapomina", "Wanna kupiona… a czym ją podłączysz?", "post", "syfony, korki, akcesoria do wanien i brodzików", P.poradniki, "Wymiary i parametry tylko z kart produktów lub instrukcji producentów.");
  l("tpl_05", "Weekendowa inspiracja: łazienka w stylu japandi", "Spokój, drewno i beż: zapisz na później", "stories (weekend)", "szafki drewnopodobne, baterie, akcesoria", P.inspiracje);
  l("tpl_06", "Deszczownica czy słuchawka? Jak wybrać zestaw prysznicowy", "Prysznic jak w hotelu: od czego zacząć?", "post, karuzela", "baterie i zestawy prysznicowe", P.poradniki, "Wymiary i parametry tylko z kart produktów lub instrukcji producentów.");
  l("tpl_07", "Łazienka bez barier: dla rodziców i seniorów", "Remont z myślą o bliskich.", "post", "odpływy liniowe, niskie brodziki, akcesoria", P.poradniki, "Wymiary i parametry tylko z kart produktów lub instrukcji producentów.");
  l("tpl_08", "Akcesoria w jednej linii: wieszaki, półki, dozowniki", "Detale, które robią całą łazienkę.", "post, karuzela", "akcesoria łazienkowe", P.inspiracje);
  l("tpl_09", "Jedna łazienka, trzy style", "Te same produkty, inny klimat. Który Twój?", "stories (weekend)", "produkty z oferty pokazane w wizualizacjach", P.inspiracje, "Tylko produkty dostępne w sklepie; wizualizację podpisać jako wizualizację.");
  l("tpl_10", "Pytanie do doradcy: Q&A", "Zapytaj nas o wszystko, co dotyczy łazienki", "stories z naklejką „Zadaj pytanie”", "dowolne, odpowiedzi linkują do kategorii", P.poradniki, "Najczęstsze pytania zapisuj jako tematy kolejnych postów.");
  return out;
};

# Centrum treści social media (Etap 1)

## Jak uruchomić
1. Rozpakuj folder w stałym miejscu na dysku (np. `Dokumenty\centrum-tresci-app`). Nie przenoś go później: przeglądarka wiąże dane z lokalizacją pliku.
2. Otwórz `index.html` dwuklikiem w Chrome lub Edge. Wybierz jedną przeglądarkę do pracy i dodaj stronę do zakładek.
3. Jeśli Biblioteka materiałów zgłasza blokadę plików: na tym komputerze nie ma Pythona, więc polecenie `python -m http.server` nie zadziała. Możliwości:
   - poproś Claude Code o uruchomienie tymczasowego lokalnego serwera w PowerShell (bez instalowania czegokolwiek, działa do zamknięcia),
   - albo zainstaluj Pythona i w folderze aplikacji uruchom `python -m http.server 8000`, potem otwórz `http://localhost:8000`.
   Dane z adresu `localhost` to osobny magazyn: przenieś je kopią JSON (patrz niżej).

## Gdzie są dane
- Wszystko zapisuje się automatycznie w przeglądarce na tym komputerze.
- **Każda przeglądarka ma osobny magazyn danych** dla plików otwieranych z dysku. Dane wpisane w Edge nie są widoczne w Chrome (i odwrotnie). Osobnym magazynem jest też adres `localhost`. Dane między nimi przenosisz kopią JSON.
- **Kopia:** Ustawienia > Dane i kopia > Pobierz kopię. Rób ją co tydzień. Kopia nie obejmuje plików graficznych i wideo.
- Przed „Przywróć z kopii” aplikacja sama pobiera kopię obecnych danych (plik z datą i godziną w nazwie).
- Wyczyszczenie danych przeglądarki usuwa dane aplikacji.

## Niezapisane zmiany i kilka kart
- Niezapisane zmiany w karcie posta (post, wersje, wpisywany komentarz) są szkicem: przetrwają przejście do innej zakładki i odświeżenie strony. Znikają po zamknięciu karty przeglądarki, dlatego przeglądarka ostrzega przy zamykaniu.
- Jeśli aplikacja jest otwarta w dwóch kartach i jedna coś zapisze, druga pokaże komunikat z przyciskiem „Odśwież”. Do odświeżenia druga karta nic nie zapisze, żeby nie nadpisać zmian. Szkice zostają.
- Jeśli wersję zmieniono w innej karcie, gdy miałeś jej szkic, po odświeżeniu wybierasz: „Zachowaj mój szkic” albo „Odrzuć szkic i pokaż aktualną wersję”.

## Pierwsze kroki
1. Ustawienia > Dane i kopia: usuń dane demonstracyjne, gdy przestaną być potrzebne.
2. Brand Center > Księga marek: uzupełnij ton, grupę docelową i zakazane sformułowania.
3. Brand Center > Filary komunikacji: popraw robocze filary.
4. Brand Center > Biblioteka formatów: zweryfikuj wymiary w dokumentacji platform i wpisz datę aktualizacji.
5. Ustawienia > Kanały i rytm: sprawdź rytm publikacji każdego profilu.

## Rola przełożonego
Przełącznik SMM / Przełożony w panelu kanałów pokazuje, jak wygląda proces akceptacji z obu stron. To demonstracja na jednym komputerze. Wspólna praca na dwóch komputerach wymaga Etapu 2.

## Praca z Claude Code
Otwórz folder w Claude Code. Na start: „Przeczytaj CLAUDE.md i docs/. Zrób audyt projektu zgodnie z rozdziałem 28.1 specyfikacji, bez zmian w kodzie.”

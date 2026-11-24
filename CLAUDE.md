# Centrum treści social media – instrukcje dla Claude Code

Pełna specyfikacja: `docs/MASTER_SPEC_3.0.md`. Mapa zakładek i decyzje projektowe: `docs/MAPA_APLIKACJI.md`.
Ten plik ma pierwszeństwo przy pytaniu „jak pracować z tym kodem”.

## Stan projektu
Etap 1 (aplikacja lokalna) zbudowany w całości jako szkielet z działającym głównym przepływem pracy.
Przed większą zmianą przeczytaj `docs/MAPA_APLIKACJI.md`, sekcja „Stan modułów”.

## Technologia
- Czysty HTML, CSS i JavaScript. **Bez kroku budowania, bez Node.js, bez npm.** Aplikację otwiera się plikiem `index.html`.
- Skrypty klasyczne (nie moduły ES), ładowane w kolejności z `index.html`, wspólna przestrzeń nazw `window.CT`.
- Dane: `localStorage` (klucz `ctsm.db.v1`). Pliki: IndexedDB (`ctsm-files`).
- Język interfejsu: polski. Strefa czasowa: Europe/Warsaw. Dni jako `RRRR-MM-DD`, godziny jako `GG:MM`, zdarzenia jako ISO UTC.

## Struktura
| Plik | Odpowiedzialność |
|---|---|
| `js/config.js` | Słowniki, statusy, struktura nawigacji (`nav`). Zakładki dodaje się tutaj. |
| `js/logic/dates.js` | Operacje na datach w strefie Europe/Warsaw. |
| `js/data/mockData.js` | Dane początkowe i demonstracyjne (`demo: true`). Bez logiki. |
| `js/services/storage.js` | Jedyny dostęp do localStorage, IndexedDB (`CT.files`) i sessionStorage (`CT.drafts`, szkice). |
| `js/services/contentRepository.js` | **Jedyna warstwa danych** (`CT.repo`): CRUD + operacje domenowe (akceptacja, publikacja, historia, komentarze). |
| `js/logic/rules.js` | Logika biznesowa: statusy wyliczane, filtry, alerty tygodnia, rytm, kontrola plików. |
| `js/ui/components.js` | Komponenty: dialogi, silnik formularzy, znaczniki, miniatury, podgląd publikacji, wgrywanie plików. |
| `js/ui/views-newsletter.js` | Moduł Newslettery: wydania (`newsletters`), listy (`nlLists`), tematy z `topics` (targets zawiera „newsletter”). |
| `js/ui/views-*.js` | Widoki (`CT.views["grupa/zakladka"]`) i ich akcje (`CT.actions[...]`). |
| `js/app.js` | Routing `#/grupa/zakladka`, górna nawigacja, panel kanałów po prawej, zdarzenia globalne, drag & drop. |

## Zasady (obowiązują przy każdej zmianie)
1. Widoki nie dotykają `localStorage` ani IndexedDB. Wszystko przez `CT.repo` i `CT.files`.
2. Jeden model posta: `Post` (koncepcja) → `PostVersion` (wersja kanałowa w kolekcji `versions`). Archiwum, harmonogram, feed i akceptacje czytają te same rekordy. Nie twórz kopii.
3. Relacje wyłącznie przez stabilne `id`, nigdy przez nazwy ani indeksy tablic.
4. Statusy: zapisywane są `szkic, w_przygotowaniu, do_akceptacji, poprawki, zatwierdzony, zaplanowany, opublikowany, anulowany`. `do_opublikowania` i `opozniony` są **wyliczane** w `CT.rules.displayStatus()` z terminu. Nie zapisuj ich do danych.
5. Unieważnianie akceptacji: zmiana pól z `CT.config.contentKeys` w wersji zatwierdzonej lub zaplanowanej cofa ją do `do_akceptacji` (`saveVersion`). Zmiana terminu nie unieważnia akceptacji, ale trafia do historii.
6. **Pipeline (`CT.dropHandlers.stage`) wywołuje funkcje repozytorium**, tak jak przyciski w karcie posta. Nie zmieniaj statusu bezpośrednio z widoku.
7. **Chroń drag & drop zmiany daty** (`moveVersion`): zapisuje zdarzenie `zmiana_daty` z poprzednią i nową datą. Nie upraszczaj tego mechanizmu.
8. Publikacja jest ręczna: `markPublished` ustawia `publishedAt` i nie nadpisuje planowanej daty `date`.
9. Historia jest tylko dopisywana (`pushHist`). Nie usuwaj ani nie nadpisuj zdarzeń.
10. Nie dodawaj funkcji, które udają działanie (integracje, AI, e-mail, logowanie). Funkcje planowane oznaczaj jako „Planowane” lub „Etap 2/3”.
11. Każdy przycisk ma realny skutek albo nie istnieje. Formularze walidują pola wymagane i komunikują błędy.
12. Nowe pole danych: dodaj je w `mockData.create()` (wartość domyślna) i, jeśli trzeba, uzupełnij w `repo.migrate()`, żeby stare dane w przeglądarce nie psuły widoków.
13. Kolory i odstępy tylko przez zmienne CSS z `:root`. Jeden styl komponentów w całej aplikacji. Tryb ciemny przez `prefers-color-scheme`.

## Sposób pracy
- Najpierw audyt bez zmian w kodzie (specyfikacja, rozdz. 28.1), potem plan etapu do akceptacji.
- Małe etapy. Przed większym etapem: cel, zakres, pliki, ryzyka, sposób sprawdzenia.
- Po każdym etapie: otwórz aplikację, przejdź główne ścieżki (lista poniżej), sprawdź konsolę, sprawdź widok na wąskim ekranie.
- Na koniec etapu: co zrobiono, zmienione pliki, testy, znane ograniczenia.

## Ścieżki do sprawdzenia po każdej zmianie
1. Nowy post z dwiema wersjami kanałowymi → edycja tekstu → podgląd na żywo → zapis.
2. Wyślij do akceptacji → przełącz rolę na Przełożony → zatwierdź → wróć do SMM → zmień tekst → status wraca do „Do akceptacji”.
3. Przełożony: zgłoś poprawki → komentarz się pojawia → SMM rozwiązuje komentarz.
4. OPUBLIKOWANO z linkiem → wersja w Archiwum → `publishedAt` różny od `date`.
5. Harmonogram: przeciągnięcie posta na inny dzień → w historii „Zmiana daty” z obiema datami. Pipeline: przeciągnięcia zgodne z rolą, odmowy z komunikatem.
6. Przeciągnięcie tematu z Banku tematów na dzień → nowy post, temat zostaje z powiązaniem.
7. Dashboard: alerty zgodne z danymi; filtr kanału z panelu działa we wszystkich modułach.
8. Ustawienia > Dane i kopia: pobranie kopii i przywrócenie.

## Uruchamianie
- Najprościej: dwuklik `index.html` (Chrome lub Edge). Lista testów ręcznych w tym trybie: `docs/TESTY_FILE.md`.
- **Na komputerze użytkownika nie ma Pythona ani Node.js.** Nie zakładaj `python -m http.server`. Do testów potrzebujących serwera uruchom tymczasowy serwer statyczny w PowerShell (`System.Net.HttpListener`), ze skryptem w katalogu tymczasowym, poza projektem. Po testach zatrzymaj go i usuń skrypt. Nie instaluj niczego bez zgody.
- Magazyny danych są osobne: każda przeglądarka ma własny magazyn dla `file://`, a `localhost` to jeszcze inny magazyn. Przenoszenie: kopia JSON.
- W trybie `file://` pracują prawdziwe dane użytkownika. Testy zapisujące dane rób na `localhost`, a w `file://` tylko po pobraniu kopii.

## Szkice i kilka kart (Etap 1 „Nic nie ginie”)
- Niezapisane zmiany karty posta trzyma `CT.drafts` (sessionStorage, przez `storage.js`). Klucze: `post/<id>/post`, `post/<id>/v/<vid>`, `post/<id>/c/<vid>` (komentarz), `post/new`. Szkic ma `base` (updatedAt rekordu) i `conflict`.
- Zapis w karcie, w której dane zmieniła inna karta, jest wstrzymany (`CT.repo` rzuca `StaleError`, powłoka pokazuje pasek „Odśwież”). Nie przeładowuj danych automatycznie.
- Akceptacja zapisuje `approval.channelId`. Zmiana kanału zatwierdzonej wersji cofa ją do akceptacji. Akceptacje bez `channelId` (starsze) są ważne.

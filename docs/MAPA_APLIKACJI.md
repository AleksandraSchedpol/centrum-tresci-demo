# Mapa aplikacji: Centrum treści social media (Etap 1)

## Układ ekranu
- **Górny pasek: moduły** (co robisz): Dashboard, Content Studio, Newslettery, Brand Center, Workspace, Performance, AI Assistant. Ustawienia pod ikoną koła zębatego, obok powiadomień i wyszukiwarki (Ctrl+K).
- **Drugi pasek: zakładki modułu.**
- **Panel po prawej: kanały** (gdzie): Wszystkie kanały, Akceptacja z licznikiem, profile z licznikiem spraw wymagających uwagi, skróty (Harmonogram, Podgląd feedu, Nowy post), przełącznik roli SMM / Przełożony (demonstracja). Panel można zwinąć do ikon; na wąskich ekranach otwiera się przyciskiem „Kanały”.
- Kliknięcie profilu filtruje bieżący moduł bez zmiany zakładki.

## Zakładki
| Moduł | Zakładki | Codzienne zastosowanie |
|---|---|---|
| Dashboard | Przegląd, Poranny briefing | Start dnia: opóźnienia, do publikacji, wymaga uwagi, luki w rytmie, szybkie akcje |
| Content Studio | Harmonogram, Karty postów, Podgląd feedu, Biblioteka materiałów, Bank tematów, Archiwum | Planowanie i produkcja treści |
| Wideo Content | Produkcja wideo | Osobny moduł: pomysły i produkcja wideo (dwa tory) |
| Newslettery | Plan wysyłek, Bank tematów, Grafiki, Statystyki, Listy | Wydania Newslettera BOK i MailerLite: tematy, planowane daty, grafiki, później wyniki |
| Brand Center | Księga marek, Filary komunikacji, Biblioteka formatów, Kalendarz okazji, Konkurencja | Wiedza i zasady, do których wracasz przy planowaniu |
| Workspace | Akceptacje, Zadania, Komentarze, Historia działań, Powiadomienia | Współpraca z przełożonym i organizacja pracy |
| Performance | Analityka, Raporty, Reklamy i kampanie, Budżety | Wyniki i kampanie płatne |
| AI Assistant | Asystent treści | Moduł planowany (oznaczony, bez udawanego działania) |
| Ustawienia | Marki, Kanały i rytm, Użytkownicy i role, Statusy, Powiadomienia i briefing, Dane i kopia | Konfiguracja |

Karta posta (`#/post/...`) otwiera się na pełnym ekranie: po lewej edycja (post, wersje kanałowe, materiały, akceptacja, komentarze, historia), po prawej podgląd na żywo.

## Stan modułów
| Moduł | Stan w Etapie 1 |
|---|---|
| Dashboard, briefing | Powitanie z jednym zdaniem podsumowania, cztery kafelki (po terminie, do publikacji, do akceptacji, opublikowane), lista „Do zrobienia teraz” (maks. 5 pozycji, reszta po rozwinięciu), pasek tygodnia, najbliższe publikacje, najlepszy post z Analityki i mix filarów; ostatnie zmiany i aktywność kanałów w zwijanych sekcjach. Działa na rzeczywistych danych. Briefing: widok i kopiowanie tekstu, bez wysyłki e-mail |
| Harmonogram | Kafelki (W toku, W tym tygodniu, Gotowe do publikacji, Opublikowane) jako szybkie filtry; widoki Miesiąc, Tydzień, Lista i Pipeline; drag & drop postów (z historią dat) i tematów; ostrzeżenia rytmu; okazje w kalendarzu |
| Pipeline | Kolumny według statusu. Przeciągnięcie wykonuje krok procesu z uprawnieniami roli: SMM wysyła do akceptacji, oznacza zaplanowany i publikuje; Przełożony zatwierdza i zgłasza poprawki |
| Wyszukiwarka | Pole w górnym pasku (Ctrl+K): posty i treści wersji, tematy, materiały, wideo, zadania, kampanie, okazje, konkurencja |
| Podgląd feedu | Instagram: siatka z przeciąganiem przyszłych postów; Facebook i LinkedIn: strumień |
| Karta posta | Post + wersje kanałowe, duplikowanie, materiały z kontrolą plików, akceptacja, komentarze z odpowiedziami, historia |
| Bank tematów | Pełny CRUD, filtry, tworzenie posta z tematu, powiązanie zachowane |
| Archiwum | Filtry, data planowana i data potwierdzenia, link, wyniki |
| Biblioteka materiałów | Wgrywanie (IndexedDB), metadane, licencja, „gdzie użyto”, usuwanie z odłączeniem |
| Wideo Content | Dwa tory, statusy edytowalne, przeniesienie do realizacji, podpięcie do posta, dodanie do harmonogramu, zapis pliku |
| Newslettery | Plan wysyłek w kolumnach list (BOK obok MailerLite) z ostrzeżeniem o powtórzonym temacie w odstępie < 7 dni; tematy ze wspólnego Banku tematów (przeznaczenie: newsletter); grafiki w Bibliotece z tagiem „newsletter”; ręczne statystyki (otwarcia, kliknięcia, wypisania); listy z zasadami i wersjami wydań; wydania widoczne w Harmonogramie i alertach Dashboardu |
| Brand Center | Pełny CRUD wszystkich zakładek |
| Workspace | Akceptacje z filtrami, tablica zadań, komentarze, dziennik historii, powiadomienia w aplikacji |
| Performance | Analityka: kafelki z objaśnieniami, wnioski wyliczone z danych, wykresy (zasięg, zaangażowanie, kanały, struktura interakcji), karta „Jak czytać ten ekran”; ręczne wyniki postów i obserwujących, mix filarów, raport miesięczny i kwartalny, kampanie z kreacjami i KPI, budżety |
| Ustawienia | Marki, kanały z rytmem, nazwy ról, nazwy i kolory statusów, briefing, kopia JSON |

## Decyzje projektowe (odstępstwa i doprecyzowania specyfikacji)
1. **Statusy wyliczane.** „Do opublikowania” i „Opóźniony” liczone z terminu, nie zapisywane: po zmianie daty status nie rozjeżdża się z rzeczywistością (spec. 10.4).
2. **„Zaplanowany”** oznacza: zatwierdzony i zaplanowany w Meta Business Suite lub na LinkedIn.
3. **Statusy w Ustawieniach:** edytowalne nazwy i kolory; zestaw i kolejność stałe, bo zależą od nich alerty i unieważnianie akceptacji.
4. **Kolejność feedu Instagrama** przechowywana niezależnie od daty (spec. 7.2), z ostrzeżeniem, gdy różni się od kolejności dat, i przyciskiem „Dopasuj daty do kolejności”.
5. **Reklamy i Kampanie** w jednej zakładce (spec. 3.5 i 21 opisują jeden moduł).
6. **Poranny briefing** w Dashboardzie, konfiguracja w Ustawieniach.
7. **Licencja i prawa użycia** w Bibliotece materiałów (dodatkowe pole, przydatne przy reklamach).
8. **Kopia JSON nie zawiera plików** z Biblioteki (są w IndexedDB przeglądarki).
9. **Zmiana terminu nie unieważnia akceptacji**, trafia do historii (spec. 11.2 nie rozstrzygał).
10. **Pipeline nie omija procesu:** przeciągnięcie do kolumny wywołuje te same funkcje co przyciski w karcie posta (walidacja, historia, powiadomienia), z podziałem ról.
12. **Tematy newsletterów w tym samym Banku tematów** (pole Przeznaczenie: Social media / Newsletter): jeden temat może zasilić post i wydanie newslettera.
13. **Szkice zamiast blokady.** Niezapisane zmiany w karcie posta są szkicem w sessionStorage (osobno post, każda wersja, komentarz). Przejście do innej zakładki nie jest blokowane, szkic wraca. Jeśli rekord zmieniono gdzie indziej, użytkownik wybiera: zachować szkic albo go odrzucić.
14. **Jedna karta zapisuje naraz.** Gdy inna karta zapisała dane, ta karta wstrzymuje zapis do kliknięcia „Odśwież” (bez automatycznego przeładowania).
15. **Akceptacja dotyczy kanału.** Zatwierdzenie zapisuje kanał; zmiana kanału cofa wersję do akceptacji. Starsze akceptacje bez zapisanego kanału pozostają ważne.
16. **Anulowane posty zostają przekreślone.** W Harmonogramie są domyślnie ukryte, przełącznik „Pokaż anulowane” (albo filtr statusu) pokazuje je przekreślone. Historia i dane zostają; usunięcie na stałe to osobna akcja „Usuń post”.
17. **Wideo Content to osobny moduł** (dawniej zakładka Content Studio). Stary adres #/studio/wideo przekierowuje do nowego.
18. **Czytelność:** tekst bazowy 16 px, minimum 12 px (poza znaczkami platform), ciemniejszy kolor tekstu pomocniczego. W kalendarzu duże miniatury, podsumowanie miesiąca i zwijana karta „Jak działa ta strona” (stan w ustawieniach: hideHowto).
19. **Analityka tłumaczy liczby.** Domyślny okres to ostatnie 30 dni. Wnioski są liczone z danych (bez zewnętrznych norm branżowych), przy małej próbie lub małym zasięgu aplikacja ostrzega. Wyniki wpisuje się ręcznie albo przenosi z eksportu Meta Business Suite; rekord z `source` pokazuje źródło danych. Zapisanie obserwujących nie nadpisuje rekordów postów.
20. **Dashboard to ekran decyzji, nie raport.** Jedno zdanie podsumowania liczone z danych, krótka lista rzeczy do zrobienia z plakietką rodzaju (po terminie, poprawki, do publikacji, akceptacja, uzupełnij, zadanie, luka w rytmie) i przyciskiem „Otwórz”. Powitanie bez imienia (pole z imieniem możliwe później).
11. **Kafelki pastelowe** (róż, szałwia, piasek, liliowy) to jedyne miejsce z kolorowym tłem: reszta interfejsu zostaje w bieli i beżu.

## Ograniczenia Etapu 1
- Dane i pliki tylko w tej przeglądarce na tym komputerze. Przełożony na swoim komputerze nie zobaczy planu: akceptacja na dwóch urządzeniach wymaga Etapu 2 (wspólna baza i logowanie).
- Przełącznik ról to demonstracja, nie zabezpieczenie.
- Brak automatycznej publikacji, pobierania statystyk, e-maili i AI (Etap 3).

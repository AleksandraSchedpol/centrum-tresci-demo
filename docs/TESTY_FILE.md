# Lista kontrolna: testy w trybie file:// (Edge i Chrome)

Tryb `file://` to dwuklik w `index.html`. **Pracują tu Twoje prawdziwe dane**, a każda przeglądarka ma swój osobny magazyn.
Test zajmuje około 10 minut na przeglądarkę. Wpisz ✔ albo ✘ i krótką uwagę.

## 0. Przygotowanie (w każdej przeglądarce osobno)
- Otwórz `index.html` dwuklikiem (albo przeciągnij plik do okna przeglądarki).
- Ustawienia (koło zębate) > Dane i kopia > **Pobierz kopię**. Zapisz plik w bezpiecznym miejscu.
- Przygotuj jedną małą grafikę (JPG lub PNG) do wgrania.

| # | Krok | Oczekiwany wynik | Edge | Chrome |
|---|---|---|---|---|
| 1 | Otwórz aplikację | Dashboard się wyświetla. Nie ma komunikatu „Ta przeglądarka blokuje przechowywanie plików” | | |
| 2 | Content Studio > Biblioteka materiałów > Dodaj pliki > wybierz grafikę | Komunikat „Dodano do biblioteki: 1 plik”, widać miniaturę | | |
| 3 | Odśwież stronę (F5), wróć do Biblioteki | Miniatura nadal widoczna (plik zapisał się w IndexedDB) | | |
| 4 | Kliknij materiał > Usuń > kliknij ponownie | Materiał znika z Biblioteki | | |
| 5 | Otwórz dowolny post (Karty postów). Zmień tytuł w „Post: koncepcja”, **nie zapisuj**. W wersji zmień tekst i kliknij „Zapisz wersję” | Tekst wersji zapisany, tytuł posta **nadal zmieniony** w polu, widać komunikat „Niezapisane zmiany: zapisz albo odrzuć” | | |
| 6 | Przejdź do Dashboardu, potem wróć do tego posta | Komunikat o zachowanym szkicu, po powrocie tytuł nadal zmieniony | | |
| 7 | Kliknij „Odrzuć zmiany” przy poście | Tytuł wraca do zapisanego, komunikat znika | | |
| 8 | Zmień tekst wersji bez zapisu i spróbuj zamknąć kartę | Przeglądarka pyta, czy na pewno opuścić stronę. Wybierz „Anuluj” (zostań), potem „Odrzuć zmiany” | | |
| 9 | Otwórz `index.html` w **drugiej karcie** tej samej przeglądarki. W drugiej karcie przełącz rolę (SMM/Przełożony) | W pierwszej karcie pojawia się pasek „Dane zmieniono w innej karcie” z przyciskiem „Odśwież” | | |
| 10 | W pierwszej karcie spróbuj przełączyć rolę, potem kliknij „Odśwież” | Przed odświeżeniem: komunikat i brak zmiany. Po odświeżeniu: pasek znika, widać rolę ustawioną w drugiej karcie | | |
| 11 | Konflikt: w karcie 1 zmień tekst wersji (bez zapisu). W karcie 2 zmień i zapisz tekst tej samej wersji. W karcie 1 kliknij „Odśwież” | W karcie 1 komunikat, że wersja została zmieniona, z polami różnic i przyciskami „Zachowaj mój szkic” / „Odrzuć szkic i pokaż aktualną wersję”. „Zapisz wersję” nic nie zapisuje, dopóki nie wybierzesz | | |
| 12 | Ustawienia > Dane i kopia > Przywróć z kopii > wybierz kopię z kroku 0 > potwierdź | Najpierw pobiera się plik `centrum-tresci-kopia-przed-przywroceniem-RRRR-MM-DD_GG-MM.json`, potem komunikat „Przywrócono dane z kopii” | | |
| 13 | Zamknij drugą kartę. Sprawdź, czy dane wyglądają jak przed testem | Dane jak w kopii z kroku 0. Zamknij kartę 1, otwórz aplikację ponownie | | |

## Jeśli krok 1 lub 2 się nie powiedzie
Zanotuj dokładny komunikat. Nic nie instaluj. Obejście: uruchom aplikację przez tymczasowy lokalny serwer (poproś Claude Code). Uwaga: `localhost` to osobny magazyn, dane przenosisz kopią JSON.

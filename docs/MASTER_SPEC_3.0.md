# CENTRUM TREŚCI SOCIAL MEDIA
## MASTER SPECIFICATION 3.0
### Główna specyfikacja funkcjonalna, UX/UI i techniczna projektu

**Wersja:** 3.0  
**Status:** Dokument bazowy projektu  
**Przeznaczenie:** Claude Code – analiza, rozwój i wdrażanie aplikacji  
**Język aplikacji:** polski  
**Strefa czasowa:** Europe/Warsaw

---

# 1. CEL I ZAŁOŻENIA PROJEKTU

## 1.1. Czym jest aplikacja?

Centrum Treści Social Media to rozbudowana aplikacja do zarządzania komunikacją marketingową i contentem w wielu markach oraz kanałach społecznościowych.

Ma stanowić jedno centralne miejsce do:
- planowania komunikacji;
- zarządzania kalendarzem publikacji;
- tworzenia i edytowania postów;
- przygotowywania treści i materiałów graficznych;
- podglądu publikacji przed ich opublikowaniem;
- zarządzania akceptacją treści;
- organizowania pomysłów i tematów;
- planowania oraz produkcji materiałów wideo;
- zarządzania biblioteką materiałów;
- monitorowania rytmu publikacji;
- analizowania wyników komunikacji;
- planowania kampanii reklamowych;
- organizowania codziennej pracy Social Media Managera.

Aplikacja ma obsługiwać kilka marek i wiele profili społecznościowych, z możliwością łatwego dodawania kolejnych.

Nie ma być wyłącznie kalendarzem postów. Docelowo ma być kompletnym centrum operacyjnym do zarządzania marketingiem w social media.

## 1.2. Główni użytkownicy

**Social Media Manager (SMM)**

Osoba odpowiedzialna za:
- planowanie komunikacji;
- tworzenie postów i materiałów;
- zarządzanie harmonogramem;
- przygotowywanie treści do akceptacji;
- nanoszenie poprawek;
- organizację produkcji wideo;
- publikowanie treści;
- uzupełnianie wyników;
- zarządzanie zadaniami.

**Przełożony / osoba akceptująca**

Osoba odpowiedzialna za:
- przegląd przygotowanych treści;
- akceptowanie publikacji;
- zgłaszanie uwag i poprawek;
- komentowanie treści oraz materiałów;
- monitorowanie planu komunikacji;
- kontrolowanie realizacji działań.

W przyszłości możliwe jest dodanie kolejnych ról i użytkowników.

## 1.3. Najważniejsze zasady

1. Aplikacja ma być rozwijana etapami.
2. Należy zachować istniejący kod i działające funkcjonalności.
3. Nie należy przebudowywać całej aplikacji od zera bez wyraźnej potrzeby i wcześniejszej zgody.
4. Dane dotyczące jednego posta muszą być spójne we wszystkich modułach.
5. Zmiany w jednym miejscu powinny być widoczne w pozostałych widokach korzystających z tych samych danych.
6. Każda istotna zmiana powinna mieć możliwość odtworzenia w historii.
7. Interfejs ma być intuicyjny, estetyczny i szybki w obsłudze.
8. Aplikacja ma wspierać pracę, a nie wymuszać sztywny proces.
9. Funkcje przyszłościowe należy projektować z myślą o rozwoju, ale nie udawać, że są już dostępne.
10. Priorytetem jest stabilność, czytelność i praktyczna użyteczność.

---

# 2. ZAKRES PROJEKTU I ETAPY WDROŻENIA

Bardzo ważne: należy odróżniać docelową wizję aplikacji od funkcji, które mają zostać wdrożone w pierwszej wersji.

## 2.1. Etap 1 – działająca aplikacja lokalna

Pierwsza wersja powinna umożliwiać rzeczywistą pracę z aplikacją w przeglądarce, ale bez rozbudowanej infrastruktury zewnętrznej.

Zakres:
- istniejący interfejs i jego uporządkowanie;
- dashboard;
- zarządzanie profilami i kanałami;
- harmonogram publikacji;
- podgląd feedu;
- tworzenie i edytowanie postów;
- wersje kanałowe postów;
- bank tematów;
- biblioteka materiałów;
- podstawowy moduł akceptacji;
- komentarze;
- historia zmian;
- ręczne potwierdzanie publikacji;
- archiwum opublikowanych postów;
- podstawowy moduł Wideo Content;
- zadania;
- podstawowe ustawienia;
- rytm publikacji i alerty;
- podstawowa analityka z ręcznym wprowadzaniem danych;
- demonstracyjny widok roli SMM i Przełożonego.

### Ograniczenia techniczne Etapu 1

Na tym etapie:
- nie wdrażamy Supabase;
- nie wdrażamy zewnętrznej bazy danych;
- nie wdrażamy prawdziwego logowania;
- nie wdrażamy integracji Meta API ani LinkedIn API;
- nie wdrażamy automatycznego publikowania;
- nie wdrażamy automatycznej wysyłki wiadomości e-mail;
- nie podłączamy zewnętrznych modeli AI przez API;
- nie wdrażamy automatycznego pobierania statystyk z platform.

Dane mogą być przechowywane lokalnie z wykorzystaniem localStorage oraz warstwy repozytorium danych.

**Ważne ograniczenie:** localStorage przechowuje dane w konkretnej przeglądarce i na konkretnym urządzeniu. Nie zapewnia współdzielenia danych między komputerem SMM i przełożonego.

Demonstracyjny przełącznik ról nie jest prawdziwym systemem logowania ani zabezpieczeniem dostępu.

## 2.2. Etap 2 – wspólna praca i trwałe przechowywanie danych

Docelowo aplikacja powinna zostać przygotowana do:
- podłączenia bazy danych;
- współdzielenia danych między użytkownikami;
- prawdziwego logowania;
- uprawnień i ról;
- synchronizacji zmian;
- bezpiecznego przechowywania plików;
- obsługi powiadomień;
- wspólnej pracy nad akceptacją postów.

Architektura Etapu 1 musi umożliwiać taką rozbudowę bez konieczności przepisywania całej aplikacji.

## 2.3. Etap 3 – automatyzacje i integracje

Możliwe przyszłe rozszerzenia:
- automatyczne publikowanie przez API;
- integracje z Meta i LinkedIn;
- automatyczne pobieranie statystyk;
- automatyczne raporty;
- wysyłka porannego briefingu;
- integracje z narzędziami AI;
- generowanie treści i adaptacji kanałowych;
- automatyzacja zadań i powiadomień.

Nie wdrażać tych funkcji w Etapie 1.

---

# 3. STRUKTURA GŁÓWNA APLIKACJI

Docelowa aplikacja powinna mieć następującą strukturę:

## 3.1. Dashboard
Główny ekran aplikacji i centrum zarządzania bieżącą pracą.

## 3.2. Content Studio
- Harmonogram
- Podgląd feedu
- Bank tematów
- Karty postów
- Archiwum
- Biblioteka materiałów
- Wideo Content

## 3.3. Brand Center
- Księga marek
- Filary komunikacji
- Biblioteka formatów
- Kalendarz okazji
- Konkurencja

## 3.4. Workspace
- Akceptacje
- Zadania
- Komentarze
- Historia działań
- Powiadomienia

## 3.5. Marketing Performance
- Analityka
- Raporty
- Reklamy
- Kampanie
- Budżety

## 3.6. AI Content Assistant
- Generator pomysłów
- Generator postów
- Adaptacja treści do kanałów
- Scenariusze Reels i wideo
- Generator promptów
- Wsparcie pracy nad treścią

W Etapie 1 moduł może mieć przygotowany interfejs i miejsce na przyszłe funkcje, ale nie może symulować działania prawdziwego modelu AI.

## 3.7. Ustawienia
- Marki
- Kanały i profile
- Użytkownicy i role
- Statusy
- Rytm publikacji
- Powiadomienia
- Biblioteka formatów
- Konfiguracja aplikacji

---

# 4. DESIGN SYSTEM I UX/UI

## 4.1. Kierunek wizualny

Aplikacja powinna być:
- elegancka;
- minimalistyczna;
- profesjonalna;
- nowoczesna;
- kobieca, ale nie przesadnie dekoracyjna;
- uporządkowana;
- czytelna;
- inspirowana estetyką Notion, Planoly i Linear.

Unikać generycznego wyglądu panelu administracyjnego.

Interfejs ma przypominać profesjonalne narzędzie do pracy kreatywnej i zarządzania marketingiem.

## 4.2. Kolorystyka

Podstawowa paleta:
- ciepły jasny beż – główne tło aplikacji;
- złamana biel – karty i powierzchnie robocze;
- głęboka śliwka / burgund – kolor akcentowy;
- ciemny brąz lub śliwka – tekst główny;
- szarofiolet – elementy pomocnicze;
- delikatne beżowe linie – separatory i obramowania;
- zgaszona zieleń – statusy pozytywne;
- bursztyn – ostrzeżenia;
- zgaszona czerwień – błędy i opóźnienia.

Nie stosować zbyt wielu intensywnych kolorów jednocześnie.

Kolory statusów powinny być spójne w całej aplikacji.

## 4.3. Typografia

- Nagłówki: elegancki font szeryfowy.
- Teksty interfejsu: czytelny font bezszeryfowy.
- Dane liczbowe i daty: czytelne, o równej szerokości cyfr, jeśli to możliwe.

## 4.4. Komponenty i układ

- Karty o delikatnych zaokrągleniach.
- Subtelne cienie.
- Dużo przestrzeni.
- Czytelna hierarchia informacji.
- Minimalna liczba niepotrzebnych ramek.
- Wyraźne stany hover, focus i active.
- Jednolity styl przycisków, pól, filtrów, etykiet i menu.
- Responsywność na komputerach, tabletach i telefonach.

Nie należy projektować każdego modułu w innym stylu.

## 4.5. Nawigacja

Główna nawigacja powinna być umieszczona po prawej stronie aplikacji jako pionowy pasek profili/kanałów.

Powinna być:
- stale dostępna;
- możliwa do zwinięcia;
- czytelna na mniejszych ekranach;
- spójna wizualnie z resztą aplikacji.

Na wąskich ekranach pasek powinien przechodzić w zwijane menu.

Kliknięcie profilu filtruje aktualny moduł bez przeładowania aplikacji.

---

# 5. MARKI I KANAŁY

## 5.1. Początkowa lista profili

1. Schedpol – Facebook – aktywny
2. Łazienka360 – Facebook – aktywny
3. Schedpol – Instagram – aktywny
4. Schedline – Facebook – do decyzji
5. Schedpol – LinkedIn – aktywny

Lista powinna być konfigurowalna.

Nie kodować profili na stałe w komponentach interfejsu.

## 5.2. Panel kanałów

Panel powinien zawierać:
- logo/oznaczenie Centrum Treści;
- opcję „Wszystkie kanały”;
- skrót „Akceptacja” z licznikiem;
- demonstracyjny przełącznik roli SMM / Przełożony;
- listę profili;
- oznaczenia marek i platform;
- kolory identyfikujące kanały;
- liczniki postów wymagających uwagi;
- skróty do najważniejszych widoków.

Możliwość dodawania i edycji profili w Ustawieniach.

## 5.3. Filtrowanie

Wszystkie moduły wykorzystujące dane o postach powinny umożliwiać filtrowanie:
- według marki;
- według kanału;
- według konkretnego profilu;
- według statusu;
- według okresu.

Domyślnie możliwy jest widok wszystkich kanałów.

---

# 6. DASHBOARD

## 6.1. Cel

Dashboard ma pokazywać najważniejsze informacje o bieżącej pracy.

Nie powinien być przeładowany statystykami, które nie pomagają w podejmowaniu decyzji.

## 6.2. Nagłówek

- Tytuł: CENTRUM TREŚCI SOCIAL MEDIA
- Aktualny tydzień.
- Zakres dat.
- Wybrany filtr kanałów.
- Szybkie akcje.

## 6.3. Szybkie akcje

- Dodaj post
- Dodaj temat
- Dodaj wideo
- Dodaj zadanie
- Dodaj kampanię

Każda akcja powinna otwierać odpowiedni formularz lub widok.

## 6.4. Sekcja „W tym tygodniu”

Dynamiczne podsumowanie:

**Opóźnienia**
- posty, których termin publikacji minął;
- brakujące materiały;
- niekompletne treści;
- zadania po terminie.

**Do publikacji**
- zatwierdzone posty zaplanowane na bieżący tydzień;
- posty wymagające ręcznego potwierdzenia publikacji.

**Wymaga uwagi**
- posty oczekujące na akceptację;
- posty zgłoszone do poprawek;
- szkice wymagające uzupełnienia;
- zadania wymagające działania.

**Luki w rytmie**
- brak zaplanowanych publikacji w dniach, w których powinny się pojawić;
- niewykonany plan komunikacji dla danego profilu.

Kliknięcie alertu przenosi użytkownika do odpowiedniego widoku z zastosowanym filtrem.

Alerty muszą wynikać z rzeczywistych danych, a nie z wpisanych na sztywno wartości demonstracyjnych.

## 6.5. Pozostałe sekcje

Dashboard może zawierać:
- najbliższe publikacje;
- ostatnie zmiany;
- zadania na dziś;
- oczekujące akceptacje;
- podsumowanie aktywności kanałów.

---

# 7. HARMONOGRAM I PODGLĄD FEEDU

To jeden z najważniejszych modułów aplikacji.

## 7.1. Dwa współpracujące widoki

Harmonogram musi oferować dwa sposoby przeglądania treści:

**A. Kalendarz publikacji**
- widok miesiąca;
- widok tygodnia;
- widok listy;
- daty i godziny;
- miniatury materiałów;
- statusy;
- oznaczenia kanałów;
- filtry;
- drag & drop.

**B. Podgląd feedu**
- Instagram: siatka 3 kolumn;
- Facebook: widok strumienia postów;
- LinkedIn: widok strumienia postów.

Oba widoki muszą korzystać z tych samych danych.

Zmiana posta w karcie powinna aktualizować zarówno harmonogram, jak i podgląd feedu.

## 7.2. Drag & drop

W harmonogramie:
- możliwość przeciągania postów na inne daty;
- możliwość zmiany terminu publikacji;
- możliwość przeciągania tematów z Banku Tematów do kalendarza;
- zapis każdej zmiany w historii.

W podglądzie Instagram:
- możliwość zmiany kolejności przyszłych publikacji poprzez przeciąganie;
- nie wolno zmieniać kolejności postów już opublikowanych;
- kolejność feedu powinna być przechowywana niezależnie od daty publikacji.

**Ważne:** istniejąca funkcja drag & drop zmiany daty posta wraz z zapisem poprzedniej i nowej daty musi zostać zachowana. Nie usuwać jej ani nie zastępować uproszczonym mechanizmem.

## 7.3. Kalendarz

Każdy post w kalendarzu powinien pokazywać:
- nazwę/temat;
- miniaturę;
- kanał;
- datę;
- godzinę;
- status;
- ewentualne oznaczenie wymagań lub problemów.

Możliwość filtrowania i szybkiego otwierania karty posta.

---

# 8. MODEL TREŚCI – POST I WERSJE KANAŁOWE

To kluczowa decyzja architektoniczna.

## 8.1. Główny post

Jeden główny Post reprezentuje koncepcję, temat lub kampanię treściową.

Może zawierać:
- temat;
- opis koncepcji;
- cel komunikacyjny;
- filar treści;
- markę;
- wspólne materiały;
- uwagi;
- powiązane zadania;
- powiązane tematy.

## 8.2. Wersje kanałowe

Jeden Post może mieć wiele niezależnych wersji kanałowych – PostVersion.

Przykład:

Post: „Nowość w ofercie – brodzik X”

Wersje:
- Schedpol Facebook;
- Schedpol Instagram;
- Schedpol LinkedIn.

Każda wersja ma własne:
- teksty;
- CTA;
- hashtagi;
- materiały;
- format;
- datę publikacji;
- godzinę publikacji;
- status;
- akceptację;
- historię;
- potwierdzenie publikacji;
- link do opublikowanego posta.

Zmiana jednej wersji nie może automatycznie zmieniać pozostałych.

Można dodawać kolejne wersje kanałowe oraz duplikować istniejące wersje.

Materiały mogą być współdzielone przez kilka wersji, ale każda wersja musi przechowywać własne przypisania.

## 8.3. Pola karty posta

Karta posta powinna zawierać:

**Informacje podstawowe**
- temat posta;
- marka;
- kanał/profil;
- data publikacji;
- godzina publikacji;
- format;
- filar treści;
- cel publikacji;
- status.

**Treść**
- tekst posta;
- CTA;
- hashtagi;
- link;
- uwagi wewnętrzne.

**Materiały**
- grafika;
- wideo;
- karuzela;
- dodatkowe grafiki;
- PDF;
- materiały wspólne.

**Proces**
- akceptacja;
- komentarze;
- historia;
- odpowiedzialny;
- zadania powiązane.

## 8.4. Sposób otwierania karty

„Utwórz post” powinno otwierać pełny ekran lub pełnowymiarowy widok roboczy.

Nie używać małego, ciasnego modala.

Preferowany układ dwukolumnowy:

**Lewa kolumna – edycja**
- pola formularza;
- treść;
- materiały;
- ustawienia publikacji;
- akceptacja;
- historia.

**Prawa kolumna – podgląd**
- sticky podczas przewijania;
- podgląd aktualizowany na żywo;
- przełączanie platformy;
- przełączanie urządzenia, jeśli ma zastosowanie.

---

# 9. PODGLĄD PUBLIKACJI

Podgląd powinien przypominać wygląd posta w rzeczywistej platformie.

Nie należy jednak obiecywać identycznego renderowania jak w aplikacji Facebook, Instagram lub LinkedIn.

## 9.1. Funkcje

- wybór platformy;
- podgląd tekstu;
- podgląd grafiki/wideo;
- podgląd karuzeli;
- podgląd proporcji i kadrowania;
- przełączanie widoku urządzenia;
- aktualizacja na żywo po zmianach w formularzu.

## 9.2. Kontrola plików

Po dodaniu materiału aplikacja powinna sprawdzać:
- typ pliku;
- wymiary;
- proporcje;
- orientację;
- rozmiar pliku;
- zgodność z wybranym formatem;
- potencjalne problemy z kadrowaniem.

Możliwe ostrzeżenia:
- materiał może zostać przycięty;
- proporcje nie odpowiadają rekomendowanemu formatowi;
- tekst może znajdować się zbyt blisko krawędzi;
- plik jest zbyt duży;
- format nie jest odpowiedni dla wybranego kanału.

W przyszłości można dodać:
- ręczne kadrowanie;
- podgląd stref bezpieczeństwa;
- zapisywanie alternatywnych wersji materiału;
- OCR do wykrywania tekstu na grafice.

Nie modyfikować oryginalnego pliku bez zgody użytkownika.

---

# 10. STATUSY I PROCES PUBLIKACJI

Statusy muszą być jednolite w całej aplikacji.

## 10.1. Lista statusów

1. Szkic
2. W przygotowaniu
3. Do akceptacji
4. Poprawki
5. Zatwierdzony
6. Zaplanowany
7. Do opublikowania
8. Opublikowany
9. Opóźniony
10. Anulowany – opcjonalny status końcowy.

## 10.2. Znaczenie statusów

**Szkic** – utworzony pomysł lub niekompletna treść.

**W przygotowaniu** – treść jest opracowywana.

**Do akceptacji** – wersja została przekazana do zatwierdzenia.

**Poprawki** – osoba akceptująca zgłosiła uwagi.

**Zatwierdzony** – wersja została zaakceptowana.

**Zaplanowany** – publikacja jest przygotowana do realizacji w określonym terminie.

**Do opublikowania** – termin publikacji nadszedł, ale publikacja nie została jeszcze ręcznie potwierdzona.

**Opublikowany** – użytkownik potwierdził, że publikacja rzeczywiście została opublikowana.

**Opóźniony** – termin publikacji minął, a użytkownik nie potwierdził publikacji.

**Anulowany** – publikacja została wycofana.

## 10.3. Ręczne publikowanie

W Etapie 1 nie ma automatycznego publikowania.

Po opublikowaniu posta użytkownik musi ręcznie kliknąć przycisk:

**OPUBLIKOWANO**

Po kliknięciu aplikacja:
- zmienia status na Opublikowany;
- zapisuje rzeczywistą datę i godzinę potwierdzenia;
- zapisuje zdarzenie w historii;
- aktualizuje harmonogram;
- przenosi wersję do archiwum;
- aktualizuje dane wykorzystywane w raportach;
- opcjonalnie pozwala dodać link do opublikowanego posta.

Nie wolno nadpisywać planowanej daty publikacji.

System musi przechowywać osobno:
- planowaną datę i godzinę;
- rzeczywistą datę i godzinę publikacji/potwierdzenia.

## 10.4. Automatyczna zmiana statusów

Logika docelowa:
- przed terminem: status zgodny z procesem, np. Zaplanowany;
- po nadejściu terminu bez potwierdzenia: Do opublikowania;
- po przekroczeniu terminu bez potwierdzenia: Opóźniony;
- po ręcznym potwierdzeniu: Opublikowany.

W Etapie 1 zmiana statusów powinna być realizowana w sposób możliwy do obsługi przez aplikację lokalną. Nie należy zakładać działania w tle, gdy przeglądarka jest zamknięta.

---

# 11. AKCEPTACJA, KOMENTARZE I WSPÓŁPRACA

## 11.1. Proces akceptacji

Proces powinien być elastyczny.

SMM:
- tworzy treść;
- edytuje treść;
- dodaje materiały;
- wysyła wersję do akceptacji;
- odpowiada na komentarze;
- nanosi poprawki.

Przełożony:
- przegląda treść;
- zatwierdza;
- zgłasza poprawki;
- dodaje komentarze.

## 11.2. Unieważnianie akceptacji

Jeżeli zatwierdzona lub zaplanowana wersja zostanie zmodyfikowana w istotnym zakresie, np.:
- tekst;
- grafika;
- wideo;
- karuzela;
- CTA;

poprzednia akceptacja powinna zostać unieważniona.

Status wraca do „Do akceptacji” lub odpowiedniego stanu wymagającego ponownego zatwierdzenia.

Zdarzenie musi zostać zapisane w historii.

Zmiany techniczne lub nieistotne metadane nie powinny automatycznie unieważniać akceptacji, o ile nie wpływają na zatwierdzoną treść.

## 11.3. Komentarze

Komentarze powinny być przypisane do wersji kanałowej.

Każdy komentarz może dotyczyć:
- treści;
- grafiki;
- wideo;
- innych elementów publikacji.

Możliwości:
- dodanie komentarza;
- odpowiedź;
- oznaczenie jako rozwiązany;
- ponowne otwarcie;
- oznaczenie autora;
- zapis czasu dodania.

## 11.4. Demonstracyjne role

W Etapie 1 można zastosować przełącznik:
- SMM;
- Przełożony.

Służy wyłącznie do demonstracji różnych widoków i procesów.

Nie jest to prawdziwa autoryzacja.

---

# 12. HISTORIA ZDARZEŃ

Każda wersja kanałowa powinna mieć historię działań.

Historia musi zachować istniejącą funkcję zapisywania zmian daty przez drag & drop.

## 12.1. Rejestrowane zdarzenia

- utworzenie posta;
- utworzenie wersji kanałowej;
- edycja treści;
- zmiana materiałów;
- zmiana daty;
- zmiana godziny;
- poprzednia i nowa data publikacji;
- wysłanie do akceptacji;
- zatwierdzenie;
- zgłoszenie poprawek;
- dodanie komentarza;
- rozwiązanie komentarza;
- zmiana statusu;
- potwierdzenie publikacji;
- dodanie linku do publikacji;
- anulowanie publikacji.

## 12.2. Dane historii

Każde zdarzenie powinno zawierać:
- identyfikator;
- typ zdarzenia;
- datę i godzinę;
- użytkownika wykonującego działanie, jeśli jest dostępny;
- opis;
- dane poprzednie i nowe, jeśli dotyczą zmiany.

W Etapie 1 można stosować demonstracyjnego użytkownika lub lokalną tożsamość.

Nie nadpisywać historii przy kolejnych zmianach.

---

# 13. BANK TEMATÓW

Bank tematów jest księgą pomysłów i treści do wykorzystania w przyszłości.

Powinien umożliwiać gromadzenie pomysłów bez konieczności natychmiastowego tworzenia posta.

## 13.1. Pola tematu

- tytuł;
- opis;
- pomysł / hook;
- cel komunikacyjny;
- filar treści;
- marka;
- docelowe kanały;
- priorytet;
- status;
- uwagi;
- powiązane materiały.

## 13.2. Funkcje

- dodawanie i edycja tematów;
- filtrowanie;
- wyszukiwanie;
- oznaczanie priorytetów;
- zmiana statusu;
- przypisywanie do marki i kanałów;
- przeciąganie tematu do harmonogramu;
- tworzenie posta na podstawie tematu.

Przeniesienie tematu do harmonogramu powinno tworzyć powiązanie z postem, a nie usuwać pierwotny pomysł z banku.

---

# 14. WIDEO CONTENT

Oddzielny moduł do organizacji produkcji materiałów wideo.

Powinien obsługiwać dwa równoległe tory:

## 14.1. In-house

Materiały nagrywane samodzielnie, np. telefonem lub klasyczną kamerą.

Pola:
- tytuł pomysłu;
- opis;
- hook;
- cel;
- marka;
- kanały;
- format i proporcje;
- lokalizacja;
- osoby;
- rekwizyty;
- lista ujęć;
- scenariusz;
- odpowiedzialny;
- termin;
- status;
- pliki;
- uwagi.

## 14.2. AI Video

Pomysły i produkcje realizowane przy użyciu narzędzi AI.

Możliwe narzędzia:
- Kling;
- Runway;
- HeyGen;
- Sora;
- inne narzędzia.

Na tym etapie nazwy narzędzi są informacją i elementem organizacji procesu. Nie wdrażać ich API.

Pola:
- pomysł;
- hook;
- scenariusz;
- prompt;
- narzędzie;
- materiały referencyjne;
- pliki wejściowe;
- wynik;
- kanały;
- format;
- termin;
- status;
- uwagi.

## 14.3. Statusy produkcji wideo

Przykładowe:
- Pomysł;
- Do przygotowania;
- Scenariusz;
- Do nagrania;
- W produkcji;
- Do montażu;
- Do akceptacji;
- Poprawki;
- Gotowe;
- Wykorzystane.

Statusy powinny być edytowalne.

## 14.4. Integracja z pozostałymi modułami

Możliwości:
- „Przenieś do realizacji”;
- „Podepnij do posta”;
- „Dodaj do harmonogramu”;
- „Zapisz gotowy materiał w bibliotece”.

Gotowe pliki powinny trafiać do Biblioteki Materiałów.

## 14.5. Interfejs

Na szerokim ekranie:
- dwie kolumny – In-house i AI Video.

Możliwość wyświetlenia tylko jednego toru.

Na telefonie:
- domyślnie widok In-house;
- drugi tor dostępny przez przełącznik.

---

# 15. BIBLIOTEKA MATERIAŁÓW

Centralne miejsce przechowywania materiałów wykorzystywanych w publikacjach.

## 15.1. Obsługiwane materiały

- grafiki;
- zdjęcia;
- wideo;
- karuzele;
- PDF;
- materiały referencyjne;
- pliki źródłowe.

## 15.2. Informacje o materiale

- nazwa;
- typ;
- miniatura;
- marka;
- kanał;
- data dodania;
- źródło: in-house / AI / inne;
- opis;
- tagi;
- wymiary;
- proporcje;
- rozmiar;
- powiązane posty;
- powiązane wersje kanałowe.

## 15.3. Funkcje

- dodawanie plików;
- podgląd;
- filtrowanie;
- wyszukiwanie;
- tagowanie;
- przypisywanie do marek;
- wykorzystywanie w wielu postach;
- sprawdzanie, gdzie materiał jest używany.

W Etapie 1 należy zwrócić uwagę na ograniczenia przechowywania plików w przeglądarce. Nie zakładać, że localStorage jest odpowiednim miejscem do przechowywania dużych materiałów wideo i grafik.

Architektura powinna umożliwiać późniejsze przeniesienie plików do zewnętrznego storage.

---

# 16. BRAND CENTER

Moduł zawierający najważniejsze informacje dotyczące marek.

## 16.1. Księga marek

Dla każdej marki:
- nazwa;
- opis;
- charakter marki;
- grupa docelowa;
- ton komunikacji;
- najważniejsze wartości;
- zasady komunikacji;
- zakazane lub niezalecane sformułowania;
- linki i materiały referencyjne.

## 16.2. Filary komunikacji

Dla każdego filaru:
- nazwa;
- opis;
- cel;
- marka;
- przykładowe tematy;
- kolor identyfikacyjny;
- udział procentowy, jeśli skonfigurowany.

Filar powinien być dostępny przy tworzeniu posta.

## 16.3. Biblioteka formatów

Centralna baza formatów publikacji.

Powinna rozdzielać:
- formaty organiczne;
- formaty reklamowe.

Dla każdego formatu:
- platforma;
- typ publikacji;
- nazwa;
- szerokość;
- wysokość;
- proporcje;
- orientacja;
- przeznaczenie;
- źródło informacji;
- data aktualizacji;
- uwagi.

Przykładowe formaty mogą zostać dodane jako dane początkowe, ale nie mogą być na stałe zakodowane w komponentach.

Biblioteka musi być edytowalna.

## 16.4. Kalendarz okazji

Miejsce do przechowywania:
- świąt;
- dni tematycznych;
- wydarzeń branżowych;
- ważnych terminów firmowych;
- okazji marketingowych.

Możliwość przypisywania wydarzeń do marek i tworzenia tematów na ich podstawie.

## 16.5. Konkurencja

Baza obserwowanych marek i konkurentów.

Pola:
- nazwa;
- branża;
- linki do profili;
- opis;
- obserwacje;
- inspiracje;
- przykładowe działania;
- notatki.

Moduł ma służyć organizacji wiedzy, a nie automatycznemu monitorowaniu konkurencji.

---

# 17. WORKSPACE – ZADANIA I ORGANIZACJA PRACY

## 17.1. Zadania

Zadanie powinno zawierać:
- tytuł;
- opis;
- status;
- priorytet;
- termin;
- odpowiedzialnego;
- markę;
- kanał;
- powiązany post;
- powiązaną kampanię;
- powiązany materiał.

Przykładowe statusy:
- Do zrobienia;
- W trakcie;
- Oczekuje;
- Zakończone;
- Anulowane.

## 17.2. Powiązania

Zadania powinny być dostępne z poziomu:
- Dashboardu;
- karty posta;
- kampanii;
- Wideo Content;
- kalendarza.

## 17.3. Akceptacje

Centralna lista postów wymagających akceptacji.

Filtry:
- marka;
- kanał;
- osoba;
- status;
- data.

## 17.4. Powiadomienia

W Etapie 1 mogą być realizowane jako wewnętrzne powiadomienia w aplikacji.

Przykłady:
- nowy post do akceptacji;
- zgłoszone poprawki;
- zatwierdzenie;
- zbliżający się termin;
- opóźnienie;
- nowy komentarz;
- zadanie po terminie.

---

# 18. PORANNY BRIEFING

Docelowo aplikacja ma umożliwiać codzienny briefing e-mail.

## 18.1. Założenie

Proponowana godzina wysyłki: 8:15, strefa Europe/Warsaw.

Briefing powinien zawierać:
- publikacje zaplanowane na dziś;
- publikacje wymagające potwierdzenia;
- opóźnione posty;
- posty oczekujące na akceptację;
- poprawki do naniesienia;
- zadania na dziś;
- publikacje na kolejne dwa dni.

## 18.2. Konfiguracja

Docelowo użytkownik może ustawić:
- włączenie/wyłączenie;
- godzinę;
- dni tygodnia;
- odbiorcę;
- zakres informacji;
- wysyłkę tylko wtedy, gdy występują alerty.

## 18.3. Etap 1

Nie wysyłać automatycznych e-maili.

Przygotować:
- strukturę danych;
- logikę generowania briefingu;
- widok briefingu w aplikacji.

Automatyczna wysyłka wymaga backendowego schedulera i dostawcy poczty. Nie należy uzależniać jej od tego, czy użytkownik ma otwartą przeglądarkę.

---

# 19. ARCHIWUM

Archiwum zawiera wszystkie potwierdzone publikacje.

Możliwości:
- wyszukiwanie;
- filtrowanie według marki;
- filtrowanie według kanału;
- filtrowanie według daty;
- filtrowanie według filaru;
- podgląd treści;
- podgląd materiałów;
- link do publikacji;
- data planowana;
- rzeczywista data potwierdzenia;
- statystyki, jeśli zostały uzupełnione.

Archiwum powinno korzystać z tych samych danych co karta posta i harmonogram.

Nie tworzyć osobnej kopii postów, która może się rozjechać z danymi głównymi.

---

# 20. MARKETING PERFORMANCE – ANALITYKA I RAPORTY

## 20.1. Analityka

Na początku dane będą wprowadzane ręcznie.

Możliwe metryki:
- zasięg;
- wyświetlenia;
- reakcje;
- komentarze;
- udostępnienia;
- kliknięcia;
- zapisania;
- liczba obserwujących;
- engagement rate.

Dane powinny być przypisywane do konkretnej wersji kanałowej i okresu.

Nie wszystkie metryki muszą być dostępne dla każdego kanału.

## 20.2. Raporty

Możliwość tworzenia raportów:
- miesięcznych;
- kwartalnych;
- według marki;
- według kanału;
- według filaru treści.

Raport powinien prezentować:
- liczbę publikacji;
- realizację planu;
- najważniejsze wyniki;
- najlepsze publikacje;
- udział filarów;
- porównanie okresów, jeśli dane są dostępne.

## 20.3. Mix filarów

Wykres udziału poszczególnych filarów w komunikacji.

Filtry:
- okres;
- marka;
- kanał.

Wykres powinien opierać się na rzeczywistych danych.

---

# 21. REKLAMY I KAMPANIE

Moduł do organizacji działań reklamowych.

## 21.1. Kampanie

Pola:
- nazwa;
- marka;
- platforma;
- cel;
- grupa docelowa;
- budżet;
- data rozpoczęcia;
- data zakończenia;
- status;
- odpowiedzialny;
- opis;
- materiały;
- powiązane posty.

## 21.2. Kreacje reklamowe

Możliwość:
- przypisywania grafik;
- przypisywania wideo;
- przechowywania tekstów reklamowych;
- zapisywania wariantów;
- oznaczania wyników.

## 21.3. Wyniki

Na początku wprowadzane ręcznie:
- wydatki;
- zasięg;
- wyświetlenia;
- kliknięcia;
- CTR;
- CPC;
- CPM;
- konwersje;
- inne dostępne metryki.

Nie wdrażać integracji reklamowych API w Etapie 1.

---

# 22. AI CONTENT ASSISTANT

Docelowy moduł wspierający przygotowanie treści.

Możliwe funkcje:
- generowanie pomysłów;
- tworzenie tekstów postów;
- adaptacja jednego posta do wielu kanałów;
- generowanie CTA;
- generowanie hashtagów;
- przygotowywanie scenariuszy Reels;
- generowanie promptów do grafiki;
- generowanie promptów do wideo;
- propozycje tematów na podstawie filarów;
- pomoc w uzupełnianiu Banku Tematów.

W Etapie 1:
- można przygotować strukturę modułu;
- można zaprojektować interfejs;
- można przygotować miejsca na przyszłe akcje;
- nie podłączać zewnętrznego API AI;
- nie przedstawiać przykładowych odpowiedzi jako wyniku rzeczywistego działania modelu.

---

# 23. RYTM PUBLIKACJI I KONTROLA REGULARNOŚCI

Każdy kanał powinien mieć możliwość ustawienia docelowego rytmu publikacji.

Przykładowo:
- liczba postów tygodniowo;
- preferowane dni;
- minimalna częstotliwość;
- ewentualne preferowane godziny.

Wartości powinny być konfigurowalne.

System analizuje harmonogram i wskazuje:
- dni bez publikacji;
- zbyt małą liczbę zaplanowanych postów;
- niewykonany plan;
- nierównomierny rozkład treści.

Alerty mają informować, a nie blokować użytkownika.

---

# 24. USTAWIENIA

Panel ustawień powinien obejmować:

## Marki
- dodawanie;
- edycję;
- dezaktywację;
- informacje o marce.

## Kanały
- dodawanie profili;
- edycję;
- przypisanie do marki;
- platformę;
- aktywność.

## Użytkownicy i role
- przygotowanie struktury;
- role SMM i Przełożony;
- docelowo kolejne role i uprawnienia.

## Statusy
- konfiguracja nazw;
- kolejność;
- kolory;
- aktywność.

## Rytm publikacji
- konfiguracja per kanał.

## Powiadomienia
- konfiguracja alertów;
- briefing;
- przyszłe e-maile.

## Biblioteka formatów
- dodawanie;
- edycja;
- aktualizacja.

---

# 25. ARCHITEKTURA DANYCH I TECHNICZNA

## 25.1. Główna zasada

Interfejs nie powinien bezpośrednio zarządzać sposobem zapisywania danych.

Należy oddzielić:
- komponenty interfejsu;
- logikę biznesową;
- typy danych;
- repozytorium;
- dane demonstracyjne.

Preferowana jest wspólna warstwa dostępu do danych, np.:

`services/contentRepository.ts`

Warstwa ta powinna udostępniać funkcje pobierania, dodawania, edycji i usuwania danych.

Dzięki temu w przyszłości będzie można zmienić localStorage na bazę danych bez przepisywania całego interfejsu.

## 25.2. Dane demonstracyjne

Dane początkowe powinny być przechowywane oddzielnie, np.:

`data/mockData.ts`

Nie należy mieszać danych demonstracyjnych z logiką komponentów.

## 25.3. Typy danych

Należy przeanalizować istniejące typy i dostosować je do poniższego modelu.

Docelowe podstawowe typy:

- Brand
- Channel
- ContentPillar
- Topic
- Post
- PostVersion
- Asset
- VideoIdea
- VideoProduction
- ApprovalHistoryItem
- PostComment
- Task
- Campaign
- AdCampaign
- FormatSpec
- CalendarEvent
- BrandGuideline
- WeeklyAlert
- Notification
- AnalyticsRecord

Nie trzeba tworzyć osobnego typu, jeśli istniejący model poprawnie obsługuje daną funkcję.

## 25.4. Relacje

Najważniejsze relacje:

- Brand ma wiele Channel.
- Brand może mieć wiele ContentPillar.
- Post może mieć wiele PostVersion.
- PostVersion należy do jednego Channel.
- PostVersion może mieć wiele Asset.
- PostVersion może mieć wiele ApprovalHistoryItem.
- PostVersion może mieć wiele PostComment.
- Topic może zostać powiązany z Post.
- VideoIdea może przejść do VideoProduction.
- VideoProduction może być powiązane z Asset i Post.
- Task może być powiązany z Post, Campaign lub Asset.
- Campaign może zawierać wiele Post.
- AnalyticsRecord jest powiązany z konkretną wersją kanałową lub okresem.

Relacje powinny być realizowane przez stabilne identyfikatory, nie przez nazwy.

## 25.5. Identyfikatory

Każdy główny obiekt powinien mieć stabilny identyfikator.

Nie używać indeksu tablicy jako identyfikatora.

## 25.6. Daty

Przechowywać daty i godziny w jednoznacznym formacie.

Uwzględniać strefę Europe/Warsaw.

Nie mieszać:
- planowanej daty publikacji;
- rzeczywistej daty potwierdzenia publikacji;
- daty utworzenia;
- daty ostatniej modyfikacji.

## 25.7. Pliki

Przechowywanie dużych plików w localStorage nie jest zalecane.

Należy zastosować rozwiązanie tymczasowe odpowiednie dla lokalnej wersji i przygotować możliwość przyszłego podłączenia storage.

Nie wolno bez uprzedzenia usuwać plików lub zastępować ich pustymi placeholderami.

---

# 26. ZASADY JAKOŚCI I STABILNOŚCI

1. Wszystkie moduły powinny korzystać z jednego źródła danych.
2. Nie duplikować logiki statusów w wielu komponentach.
3. Nie tworzyć kilku niezależnych modeli tego samego posta.
4. Nie używać danych wpisanych na sztywno w UI, jeśli powinny pochodzić z repozytorium.
5. Nie usuwać istniejących funkcji bez uzasadnienia.
6. Nie zmieniać całej struktury aplikacji bez audytu.
7. Nie pozostawiać nieaktywnych przycisków bez informacji.
8. Każda akcja użytkownika musi mieć widoczny skutek.
9. Formularze muszą walidować wymagane dane.
10. Błędy powinny być komunikowane w czytelny sposób.
11. Należy obsługiwać puste stany, ładowanie i błędy.
12. Należy uwzględniać responsywność.
13. Należy zachować dostępność klawiatury i czytelny kontrast.
14. Należy unikać nadmiernego skomplikowania interfejsu.
15. Nie dodawać fikcyjnych integracji ani funkcji, które wyglądają na działające, ale nie wykonują rzeczywistych działań.

---

# 27. PRIORYTETY WDROŻENIA

Zalecana kolejność prac:

## Priorytet 0 – audyt istniejącego projektu
- analiza struktury;
- analiza technologii;
- analiza istniejących komponentów;
- analiza danych;
- analiza działających funkcji;
- identyfikacja błędów i ryzyk.

## Priorytet 1 – fundamenty
- uporządkowanie typów;
- repozytorium danych;
- dane demonstracyjne;
- wspólne statusy;
- relacje Post / PostVersion / Asset;
- zachowanie istniejących funkcji.

## Priorytet 2 – główny przepływ pracy
- Dashboard;
- kanały;
- Harmonogram;
- karta posta;
- wersje kanałowe;
- podgląd feedu.

## Priorytet 3 – proces publikacji
- akceptacje;
- komentarze;
- historia;
- ręczne potwierdzanie publikacji;
- archiwum.

## Priorytet 4 – organizacja contentu
- Bank Tematów;
- Biblioteka Materiałów;
- Wideo Content;
- zadania.

## Priorytet 5 – planowanie i analityka
- Brand Center;
- filary;
- formaty;
- rytm publikacji;
- Analityka;
- Raporty;
- Reklamy.

## Priorytet 6 – rozszerzenia
- AI Content Assistant;
- briefing;
- powiadomienia;
- przygotowanie do integracji;
- backend i współdzielenie danych.

Kolejność może zostać skorygowana po audycie, ale każda zmiana priorytetów powinna być uzasadniona.

---

# 28. INSTRUKCJE DLA CLAUDE CODE – SPOSÓB PRACY

Poniższe zasady są obowiązujące podczas pracy nad projektem.

## 28.1. Najpierw audyt, bez modyfikowania kodu

Pierwszym zadaniem jest przeanalizowanie istniejącego projektu.

Nie wprowadzaj żadnych zmian w kodzie podczas pierwszego audytu.

Przeanalizuj:
- strukturę katalogów;
- technologie;
- routing;
- komponenty;
- style;
- stan aplikacji;
- modele danych;
- sposób zapisu danych;
- istniejące funkcje;
- działanie harmonogramu;
- drag & drop;
- historię zmian;
- podgląd feedu;
- responsywność;
- błędy.

Przygotuj raport zawierający:

1. Aktualny stan aplikacji.
2. Co już działa.
3. Co działa częściowo.
4. Co nie działa.
5. Jakie funkcje istnieją i należy je zachować.
6. Jakie elementy wymagają poprawy.
7. Jakie elementy należy dopiero wdrożyć.
8. Proponowaną architekturę.
9. Listę plików, które mogą wymagać zmian.
10. Ryzyka związane z proponowanymi zmianami.
11. Rekomendowaną kolejność wdrożenia.

Nie zakładaj, że struktura projektu jest zgodna z przykładowymi nazwami katalogów podanymi w specyfikacji.

Najpierw poznaj istniejący projekt.

## 28.2. Zasada małych etapów

Nie realizuj całej specyfikacji jedną dużą zmianą.

Pracuj etapami.

Przed każdym większym etapem przedstaw:
- cel;
- zakres;
- pliki, które planujesz zmienić;
- nowe pliki;
- wpływ na istniejące funkcje;
- ryzyka;
- sposób sprawdzenia poprawności.

Poczekaj na akceptację zakresu przed rozpoczęciem większych zmian.

## 28.3. Zachowanie istniejących funkcji

Szczególnie chronić:
- działający harmonogram;
- zmianę daty przez drag & drop;
- zapis poprzedniej i nowej daty;
- istniejące dane;
- istniejący podgląd;
- istniejące komponenty, które można rozbudować.

Nie usuwaj działających rozwiązań tylko dlatego, że łatwiej byłoby napisać je od nowa.

Jeśli przebudowa jest konieczna, najpierw wyjaśnij dlaczego i przedstaw plan migracji.

## 28.4. Nie dodawaj fikcyjnych funkcji

Jeśli funkcja nie została wdrożona:
- nie przedstawiaj jej jako działającej;
- nie twórz przycisków bez działania;
- nie symuluj integracji z platformami;
- nie udawaj automatycznej publikacji;
- nie udawaj prawdziwego logowania.

Można przygotować widok przyszłej funkcji, ale należy wyraźnie oznaczyć ją jako niedostępną lub planowaną.

## 28.5. Testowanie

Po każdym etapie:
- uruchom aplikację;
- sprawdź kompilację;
- sprawdź najważniejsze ścieżki użytkownika;
- sprawdź responsywność;
- sprawdź zapis i odczyt danych;
- sprawdź, czy inne moduły nadal działają;
- usuń błędy wprowadzone przez zmianę.

Nie kończ etapu na samym napisaniu kodu.

## 28.6. Podsumowanie etapu

Po zakończeniu każdej pracy przedstaw:
- co zostało zrobione;
- jakie pliki zmieniono;
- jakie funkcje działają;
- co wymaga dalszej pracy;
- jakie testy wykonano;
- czy występują znane ograniczenia.

Nie rozpoczynaj kolejnego dużego etapu bez uzgodnienia.

---

# 29. KRYTERIA AKCEPTACJI PROJEKTU

Aplikacja może zostać uznana za gotową do pierwszego praktycznego wykorzystania, gdy:

1. Można tworzyć i edytować posty.
2. Jeden post może mieć kilka niezależnych wersji kanałowych.
3. Zmiana jednej wersji nie modyfikuje innych.
4. Posty są widoczne w harmonogramie.
5. Podgląd feedu korzysta z tych samych danych.
6. Działa zmiana terminu przez drag & drop.
7. Historia zachowuje poprzednie i nowe daty.
8. Można przekazać post do akceptacji.
9. Można zatwierdzić lub zgłosić poprawki.
10. Komentarze można dodawać i rozwiązywać.
11. Istotna edycja zatwierdzonej treści unieważnia akceptację.
12. Można ręcznie potwierdzić publikację.
13. Rzeczywista data publikacji jest przechowywana oddzielnie od planowanej.
14. Opublikowane wersje trafiają do archiwum.
15. Bank Tematów pozwala tworzyć pomysły i przenosić je do harmonogramu.
16. Biblioteka Materiałów pozwala zarządzać plikami i powiązaniami.
17. Można organizować produkcję wideo.
18. Dashboard pokazuje rzeczywiste alerty.
19. Można filtrować dane według marki i kanału.
20. Interfejs jest spójny i responsywny.
21. Dane są obsługiwane przez wspólną warstwę repozytorium.
22. Aplikacja nie traci danych w typowym scenariuszu pracy lokalnej.
23. Nie ma nieaktywnych przycisków udających działające funkcje.
24. Istniejące funkcjonalności zostały zachowane lub bezpiecznie zastąpione.

---

# 30. NAJWAŻNIEJSZA ZASADA KOŃCOWA

Centrum Treści Social Media ma być rozwijane jako jeden spójny system, a nie zbiór niezależnych ekranów.

Najważniejsze jest zapewnienie spójności pomiędzy:
- postem;
- jego wersjami kanałowymi;
- harmonogramem;
- podglądem feedu;
- akceptacją;
- komentarzami;
- historią;
- publikacją;
- archiwum;
- analityką.

Każdy moduł powinien korzystać z tych samych, powiązanych danych.

Aplikacja ma przede wszystkim ułatwiać codzienną pracę Social Media Managera, porządkować procesy, ograniczać ręczne szukanie informacji i zapewniać przejrzystość współpracy z osobą akceptującą treści.

**Nie należy wdrażać całej docelowej wizji od razu. Najpierw należy przeprowadzić audyt istniejącego projektu, ustalić bezpieczny plan rozwoju i konsekwentnie realizować kolejne etapy.**

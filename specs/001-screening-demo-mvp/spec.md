# Feature Specification: Pierwsze Demo MVP Screeningu

**Feature Branch**: `001-screening-demo-mvp`

**Created**: 2026-05-13

**Status**: Draft

**Input**: User description: "Pierwsze demo MVP aplikacji SaaS do screeningu produktów względem list referencyjnych, pokazujące role, import danych, listy referencyjne, prosty rule builder i wynik matchingu dla CAS, EC, nazwy, typu produktu oraz stężenia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pokazanie Wyniku Screeningu Produktu (Priority: P1)

Jako osoba oceniająca projekt po stronie klientki chcę zobaczyć, jak użytkownik biznesowy wybiera produkt, wybiera listę referencyjną i otrzymuje wynik screeningu z uzasadnieniem, abym mogła szybko ocenić, czy kierunek rozwiązania odpowiada realnemu workflow.

**Why this priority**: To jest główna wartość demo. Bez wiarygodnego ekranu wyniku nie da się pokazać, że aplikacja rozwiązuje problem klientki, nawet jeśli pozostałe ekrany wyglądają dobrze.

**Independent Test**: Można przetestować samodzielnie przez uruchomienie demo na przykładowych danych i wykonanie screeningu jednego produktu względem jednej listy referencyjnej. Test jest zaliczony, gdy użytkownik widzi status, dopasowane pole, powód decyzji i gotowy komentarz.

**Acceptance Scenarios**:

1. **Given** w demo istnieje przykładowy produkt z nazwą, numerem CAS, numerem EC, typem produktu i stężeniem, **When** użytkownik wybiera listę referencyjną i uruchamia screening, **Then** system pokazuje wynik `match`, `no match` albo `verification required`.
2. **Given** wynik screeningu wymaga dodatkowej oceny, **When** użytkownik otwiera szczegóły wyniku, **Then** system pokazuje powód oznaczenia oraz gotowy komentarz biznesowy do użycia.
3. **Given** nazwa substancji nie jest wpisana identycznie jak na liście referencyjnej, **When** numery identyfikacyjne są zgodne lub podobieństwo nazwy jest wysokie, **Then** system wskazuje potencjalne dopasowanie i oznacza, które pole spowodowało wynik.

---

### User Story 2 - Dodanie Przykładowych Danych Produktowych (Priority: P2)

Jako administrator firmy chcę wprowadzić lub zaimportować mały zestaw danych produktowych, abym mogła zobaczyć, jak aplikacja obsłuży realne dane klienta przed pełnym wdrożeniem importów produkcyjnych.

**Why this priority**: Demo musi pokazać, że system nie jest statycznym obrazkiem. Nawet uproszczony import lub formularz danych zwiększa wiarygodność rozmowy o MVP.

**Independent Test**: Można przetestować przez dodanie przykładowego produktu albo wczytanie krótkiego zestawu danych demonstracyjnych i sprawdzenie, czy produkt pojawia się na liście dostępnej do screeningu.

**Acceptance Scenarios**:

1. **Given** administrator firmy jest w widoku danych produktowych, **When** dodaje produkt z wymaganymi polami, **Then** produkt jest widoczny na liście produktów tej firmy.
2. **Given** dane produktu nie zawierają numeru CAS lub EC, **When** administrator zapisuje produkt, **Then** system pozwala zapisać rekord, ale oznacza brakujące pole jako ograniczenie jakości danych.
3. **Given** stężenie składnika jest wpisane w nieprawidłowym formacie, **When** administrator próbuje zapisać dane, **Then** system pokazuje czytelny komunikat i nie traktuje rekordu jako gotowego do screeningu.

---

### User Story 3 - Konfiguracja Prostej Reguły Dla Listy Referencyjnej (Priority: P2)

Jako SuperAdministrator chcę skonfigurować prostą regułę dla konkretnej listy referencyjnej, np. zależną od typu produktu i stężenia, abym mogła pokazać klientce, że różne listy mogą mieć różne warunki screeningu bez przebudowy całego systemu.

**Why this priority**: To odpowiada bezpośrednio na najważniejsze doprecyzowanie klientki: CAS, EC i nazwa nie wystarczą, bo potrzebna jest logika warunkowa zależna od listy.

**Independent Test**: Można przetestować przez utworzenie jednej listy referencyjnej z jedną regułą, uruchomienie screeningu produktu spełniającego warunek oraz produktu niespełniającego warunku.

**Acceptance Scenarios**:

1. **Given** SuperAdministrator tworzy listę referencyjną, **When** dodaje regułę "typ produktu to mieszanina oraz stężenie jest większe niż 0,1%", **Then** reguła jest widoczna w podsumowaniu listy jako aktywna.
2. **Given** produkt spełnia warunek aktywnej reguły, **When** użytkownik uruchamia screening, **Then** wynik zostaje oznaczony zgodnie z akcją przypisaną do reguły.
3. **Given** produkt nie spełnia warunku aktywnej reguły, **When** użytkownik uruchamia screening, **Then** wynik nie jest oznaczony jako naruszenie tej reguły.

---

### User Story 4 - Pokazanie Podziału Ról I Przestrzeni Firmy (Priority: P3)

Jako klientka oceniająca przyszły system SaaS chcę zobaczyć, że demo rozróżnia role i przestrzeń firmy, abym mogła ocenić kierunek pod kątem pracy wielu firm oraz ograniczenia dostępu do danych.

**Why this priority**: Izolacja firm i role są krytyczne dla pełnego produktu, ale w pierwszym demo wystarczy pokazać je w formie zrozumiałej demonstracji, bez pełnego zakresu administracji produkcyjnej.

**Independent Test**: Można przetestować przez przełączenie widoku między rolą SuperAdministratora, Administratorem firmy i Użytkownikiem standardowym oraz sprawdzenie, czy każdy widzi tylko właściwe sekcje.

**Acceptance Scenarios**:

1. **Given** użytkownik ogląda demo jako SuperAdministrator, **When** przechodzi do list referencyjnych, **Then** widzi możliwość zarządzania listami globalnymi i regułami.
2. **Given** użytkownik ogląda demo jako Administrator firmy, **When** przechodzi do danych produktowych, **Then** widzi produkty swojej przykładowej firmy i nie widzi danych innych firm.
3. **Given** użytkownik ogląda demo jako Użytkownik standardowy, **When** uruchamia screening, **Then** widzi wynik i komentarz, ale nie widzi pełnej administracji listami ani zarządzania użytkownikami.

### Edge Cases

- Co dzieje się, gdy produkt nie ma numeru CAS ani EC, ale ma nazwę z literówką?
- Co dzieje się, gdy ten sam składnik występuje na kilku listach referencyjnych z różnymi regułami?
- Co dzieje się, gdy stężenie jest dokładnie równe progowi granicznemu 0,1%?
- Co dzieje się, gdy użytkownik standardowy próbuje wejść do widoku administracyjnego?
- Co dzieje się, gdy lista referencyjna nie ma jeszcze skonfigurowanej aktywnej reguły?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a demonstrable workflow from product selection to screening result for at least one sample company.
- **FR-002**: System MUST support sample product records containing substance name, CAS number, EC number, product type and concentration.
- **FR-003**: System MUST allow a user to choose at least one reference list before running a screening.
- **FR-004**: System MUST generate one of three screening statuses: `match`, `no match`, or `verification required`.
- **FR-005**: System MUST show the reason behind a screening result, including which field or rule contributed to the outcome.
- **FR-006**: System MUST show a ready-to-use business comment connected to the screening outcome.
- **FR-007**: System MUST include a SuperAdministrator view for creating or editing at least one reference list and one screening rule.
- **FR-008**: System MUST allow a rule to use product type and concentration as conditions for a selected reference list.
- **FR-009**: System MUST show that different reference lists can have different screening conditions.
- **FR-010**: System MUST include an Administrator firmy view for adding or reviewing sample product data within one company workspace.
- **FR-011**: System MUST include a Użytkownik standardowy view focused on selecting a product, running screening and reading the result.
- **FR-012**: System MUST visibly distinguish between global reference data and company-owned product data.
- **FR-013**: System MUST prevent the demo user in a standard role from accessing administration actions intended for SuperAdministrator or Administrator firmy.
- **FR-014**: System MUST handle missing CAS or EC values by flagging limited data quality rather than blocking the entire demo workflow.
- **FR-015**: System MUST handle invalid concentration input with a clear user-facing message.
- **FR-016**: System MUST include enough sample data to demonstrate at least one successful match, one no-match result and one verification-required result.
- **FR-017**: System MUST make clear that demo results are illustrative and not final legal or chemical compliance advice.

### Key Entities *(include if feature involves data)*

- **Company**: Represents a client organization using the SaaS. Key attributes include company name and workspace identity.
- **User**: Represents a person using the demo. Key attributes include role, display name and assigned company where relevant.
- **Product**: Represents a business product or material submitted for screening. Key attributes include product name, product type and associated substances.
- **Substance**: Represents a chemical ingredient or component in a product. Key attributes include name, CAS number, EC number and concentration.
- **Reference List**: Represents a global list used to screen products or substances. Key attributes include list name, purpose, active status and related screening rules.
- **Screening Rule**: Represents a conditional rule for a reference list. Key attributes include conditions, target field, threshold and outcome action.
- **Screening Result**: Represents the outcome of checking a product against a reference list. Key attributes include status, matched item, reason, comment and timestamp.
- **Business Comment**: Represents a ready-made response shown to users based on a result. Key attributes include status trigger, message text and reference list association.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-technical viewer can complete the main demo flow from product selection to screening result in under 3 minutes.
- **SC-002**: The demo shows at least 3 distinct results: one `match`, one `no match` and one `verification required`.
- **SC-003**: At least 90% of mandatory product fields shown in the demo are understandable from their labels without additional explanation.
- **SC-004**: A viewer can identify within 30 seconds which parts of the system belong to global reference list management and which belong to company product data.
- **SC-005**: A viewer can understand from the rule configuration screen how a condition such as concentration greater than 0,1% changes a screening result.
- **SC-006**: The demo can be presented end-to-end during a 15-minute client call, including role overview, sample data, rule setup and screening result.
- **SC-007**: The demo contains no production-sensitive customer data and can be safely shared as screenshots or screen recording.

## Assumptions

- The first demo is intended for sales and scope validation, not for production use by real companies.
- The demo uses synthetic data inspired by the client's domain: CAS, EC, product type, substance name and concentration.
- The demo covers one or two sample companies only; large-scale company onboarding is outside this first demo.
- The demo includes a simplified rule configuration flow; advanced rule versioning, approvals and audit trails are reserved for later planning.
- The demo includes a simplified import or manual data entry path sufficient to show the workflow; full spreadsheet validation and bulk processing are outside this first demo.
- Legal documents, regulatory disclaimers and final compliance wording will be supplied or approved by the client or a qualified legal/domain expert before production use.
- The demo should support a business conversation about MVP scope, milestones and cost without promising that all visible concepts are fully production-ready.

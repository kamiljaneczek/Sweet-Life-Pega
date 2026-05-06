# Hybrid UI: Chat ↔ Pega Form bidirectional sync

## Context

Strona `/support/new/$caseId` renderuje formularz Pega Constellation (custom rendering w `src/lib/custom-pega/`) obok chatu z agentem Pega GenAI (`src/components/genai/ChatPanel.tsx`). Aktualnie chat jest jednokierunkowy — wysyła do agenta tylko tekst wiadomości i zwraca tekst odpowiedzi. Cel:

- **User pisze w czacie** ("wybierz Product faulty") → formularz po lewej automatycznie się aktualizuje
- **User klika w formularzu** → chat/agent ma aktualny stan przy następnej wiadomości
- Stan jest jednym source-of-truth (PCore store), oba UI to są tylko widoki

Decyzje użytkownika:
- **Case context do agenta**: inline w wiadomości (snapshot z PCore przed `sendMessage`)
- **Zakres MVP**: oba kierunki (forma→chat oraz chat→forma)

## Główne odkrycia z eksploracji

**Stan formularza żyje w PCore store (Redux-like)**:
- Odczyt: `PCore.getStoreValue('.fieldName', 'caseInfo.content', 'app/primary')`
- Zapis (z poziomu komponentu): `pConnect.getActionsApi().updateFieldValue(propName, value)` + `triggerFieldChange(propName, value)` — wzorzec użyty w `src/lib/custom-pega/fields/Dropdown.tsx:198-199`
- Subskrypcja zmian: `PCore.getStore().subscribe(listener)` — używane w `src/lib/custom-pega/containers/ViewContainer.tsx`, `FlowContainer.tsx`

**Root PConnect** jest dostępny przez `useCustomPegaCase` (`src/hooks/useCustomPegaCase.ts:38-130`) — można go wynieść wyżej w drzewie i przekazać do `ChatPanel`.

**Pega GenAI Agent context** (3 parametry w `pegaGenAIClient.ts`):
- `agentID` — reguła Agent (`'Incident-support'`)
- `contextID` — klucz instancji case'a lub context reference rule (`'TellUsMoreRef'` jako fallback)
- `context` — nazwa containera (`'app/primary'`)

Agent **na serwerze** czyta case data z modelu po `contextID`. Problem: niezapisane zmiany klienta są tylko w PCore store, niewidoczne dla agenta do czasu `saveAssignment`. Dlatego dokleimy snapshot inline.

**"Fill form with AI" widoczny na screenie** — nie istnieje w kodzie projektu, prawdopodobnie wbudowany w Pega Constellation domyślnie. Poza zakresem tego planu.

**Agent zwraca obecnie tylko tekst** (`PegaSendMessageResponse.data: { response: string, suggestedPrompts? }`). Aby chat mógł aktualizować formularz, agent będzie emitował **tagi `<form-update field='X' value='Y'/>`** w treści odpowiedzi — parser klienta wyodrębni je i odfiltruje przed wyświetleniem.

## Architektura komponentów

```
SupportNewRoute
└── useCustomPegaCase()  → rootPConnect, caseStatus
└── <PegaCaseContext.Provider value={{ rootPConnect, getCaseSnapshot, applyFormUpdate }}>
      ├── <PConnectRenderer />            (lewa strona — formularz)
      └── <ChatLauncher><ChatPanel/>      (prawa strona — chat)
                                            ↓ useContext(PegaCaseContext)
                                            ↓ czyta/zapisuje przez rootPConnect
```

## Przepływ

### Forma → Chat (snapshot inline)

W `usePegaAgentRuntime.ts:54-57` przed `sendMessage` doklej snapshot:

```ts
const snapshot = getCaseSnapshot(); // PCore.getStoreValue('.', 'caseInfo.content', 'app/primary')
const enriched = snapshot
  ? `[Current form state: ${JSON.stringify(snapshot)}]\n\nUser: ${userText}`
  : userText;
await sendMessage({ ..., message: enriched });
```

Zero zmian po stronie serwera Pegi. Agent zawsze widzi nawet niezapisane zmiany.

### Chat → Forma (parser tagów)

1. Po stronie agenta (Pega Platform): instrukcja systemowa "When user requests field update, prepend response with one or more `<form-update field='X' value='Y'/>` self-closing tags".
2. Po stronie klienta — w `usePegaAgentRuntime.ts:onNew` po otrzymaniu `data.response`:
   - parser wyciąga wszystkie tagi → lista `FormUpdate[]`
   - dla każdego: `applyFormUpdate(field, value)` → wywołuje `rootPConnect.getActionsApi().updateFieldValue(field, value)` + `triggerFieldChange(field, value)`
   - tekst pokazany w czacie = `data.response` z usuniętymi tagami

## Pliki do modyfikacji / dodania

| Plik | Zmiana |
|---|---|
| `src/lib/custom-pega/PegaCaseContext.tsx` | **NEW** — React Context z `{ rootPConnect, getCaseSnapshot(), applyFormUpdate(field, value) }`. Helpery zamykają `PCore.getStoreValue(...)` i `actionsApi.updateFieldValue(...) + triggerFieldChange(...)`. |
| `src/hooks/useCustomPegaCase.ts` | Bez zmian — już zwraca `rootPConnect`. |
| `src/routes/support/new.$caseId.tsx` (lub `src/app/support-new.tsx`) | Owinięcie w `<PegaCaseContext.Provider>` przekazując `rootPConnect` z `useCustomPegaCase`. |
| `src/lib/genai/pegaGenAIClient.ts` | Bez zmian — sygnatura wystarczy. |
| `src/lib/genai/usePegaAgentRuntime.ts` | (a) doklej `caseSnapshot` do `message` przed `sendMessage`; (b) parsuj `<form-update>` tagi z `data.response` → wywołaj `applyFormUpdate` przez context; (c) wyświetl `data.response` po odfiltrowaniu tagów. |
| `src/lib/genai/types.ts` | Dodaj typ `FormUpdate { field: string; value: any }`. |
| `src/components/genai/ChatPanel.tsx` | Konsumuj `PegaCaseContext` i przekaż `applyFormUpdate` + `getCaseSnapshot` do `usePegaAgentRuntime`. |
| `src/lib/genai/formUpdateParser.ts` | **NEW** — `parseFormUpdates(text): { updates: FormUpdate[]; cleanText: string }`. |

## Konfiguracja po stronie Pegi (poza repo)

Reguła Agent `Incident-support`:
1. W instrukcji systemowej: "Każda wiadomość od użytkownika może zawierać `[Current form state: {...}]` — używaj tego jako prawdy. Gdy user prosi o zmianę pola, na początku odpowiedzi dodaj `<form-update field='NazwaPola' value='Wartość'/>` (jeden tag na pole), potem normalna odpowiedź dla użytkownika".
2. Zna nazwy pól case type Incident (`IncidentType`, `IncidentSubType`, …) — przez context reference albo wpisane w instrukcji.

Dla MVP można przetestować z `console.log` zwracanej odpowiedzi i ręcznie wstrzykiwać tagi (bez zmian po stronie Pegi).

## Edge cases do obsłużenia

- **Pole poza bieżącym widokiem** — `updateFieldValue` zapisze do store, ale UI pokaże dopiero po nawigacji. Na razie nie obsługujemy nawigacji z czata.
- **Brak `rootPConnect`** (ChatLauncher widoczny przed otwarciem case'a) — `applyFormUpdate` no-op, `getCaseSnapshot` zwraca `null`, snapshot nie dokleja się do wiadomości.
- **TextInput buforuje do `onBlur`** (`src/lib/custom-pega/fields/TextInput.tsx:34`) — zewnętrzne `updateFieldValue` ominie lokalny bufor; trzeba przetestować czy UI się przerysowuje. Jeśli nie — wymusić `triggerFieldChange`.
- **Wielkość promptu** — początkowo wysyłamy pełen `caseInfo.content`. Jeśli zauważymy problemy, filtrujemy do whitelisty kluczy (`pyID` + pola formularza).
- **Bezpieczeństwo parsera** — tagi `<form-update>` muszą być parsowane prostym regexem na *zwracanej* odpowiedzi agenta, nigdy na inpucie usera.

## Weryfikacja

1. Otwórz `/support/new/I-124003` i upewnij się, że formularz się ładuje.
2. **Forma→Chat**: wybierz "Product faulty" w dropdownie → wyślij w czacie "What did I select?" → agent powinien odpowiedzieć "Product faulty".
3. **Chat→Forma**: w pustym formularzu wpisz w czacie "Set incident type to Product faulty" → dropdown przełącza się na "Product faulty"; widoczna odpowiedź **nie zawiera** surowych tagów `<form-update>`.
4. **Loop**: po kroku 3 wpisz "What is the current type?" → agent potwierdza "Product faulty" (snapshot odbija zmianę z czata).
5. **Bez case'a**: na stronie głównej `ChatLauncher` działa jako zwykły asystent — `applyFormUpdate` no-op, snapshot nie dokleja się.
6. Test ręczny w przeglądarce na `npm run start-dev` (port 3502).

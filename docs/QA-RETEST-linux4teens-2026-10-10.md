# QA Retest Report — linux4teens.vercel.app (LinuxYoung)

- **Tester:** Tina (QA), retest po fixoch
- **Datum:** 2026-10-10
- **Povodny report:** QA-REPORT-linux4teens-2026-10-10.md (14 bugov, z toho 3x P1)
- **Ciel:** overit opravu vsetkych 14 bugov (BUG-01 az BUG-14)
- **Metoda:** citanie zdrojoveho kodu (src/) + WebFetch na deployed site https://linux4teens.vercel.app
- **Deploy:** https://linux4teens.vercel.app (Vercel, Next.js)

---

## Celkovy verdikt

**13 z 14 bugov opravených. 1 ciastocne opraveny (BUG-08).** Stranku je mozne pustit k cielovej skupine — ziadny P1 bug neostava. Zvysne nedostatky v BUG-08 su P3 (kozmeticke a11y vylepsenia).

| ID | Povodna priorita | Vysledok retestu | Poznamka |
|---|---|---|---|
| BUG-01 | **P1** | **PASS** | `--color-base` premenovany na `--color-canvas`, `text-base` uz nezavadza |
| BUG-02 | **P1** | **PASS** | Prazdny vstup = "Not quite", validacia opravena |
| BUG-03 | **P1** | **PASS** | `truncate` nahradeny `break-all`, prikazy sa nezalamuju trojbodkou |
| BUG-04 | P2 | **PASS** | `overflow-x-auto` na expected output kontajneri |
| BUG-05 | P2 | **PASS** | `overflow-x-clip` na badge grid kontajneri |
| BUG-06 | P2 | **PASS** | Popis badgov viditelny priamo pod nazvom, nie len hover |
| BUG-07 | P2 | **PASS** | Modifier keys (Alt/Cmd/Ctrl/Shift) + `e.repeat` ignorovane |
| BUG-08 | P2 | **PARTIAL** | `<main>`, `aria-label` na nav, `aria-label` na input opravene; zvysne a11y (progressbar role, heading order, kontrast odznakov) neoverene/neoznamkované |
| BUG-09 | P2 | **PASS** | `autocapitalize="none"`, `autocorrect="off"`, `spellCheck={false}` pridane |
| BUG-10 | P3 | **PASS** | Vsetky lekcie vypisane v moduloch, "Continue" tlacidlo, completion sprava |
| BUG-11 | P3 | **PASS** | Vysvetlenie rozdelene na odseky (regex split + 40-slovovy limit) |
| BUG-12 | P3 | **PASS** | Custom 404, localStorage try/catch, validacia hodnot, reduced-motion |
| BUG-13 | P3 | **PASS** | next/font (lokalne fonty), robots.txt, sitemap.xml, OG tagy |
| BUG-14 | P3 | **PASS** | `data-testid="copy-button"` je na `<button>` |

---

## Detailne vysledky

### BUG-01 — Neviditelny text (kolizia text-base s farbou --color-base) — PASS

**Oprava overena v:** `src/app/globals.css`

Povodny token `--color-base` bol premenovany na `--color-canvas` (riadok 7: `--color-canvas: #0f1117`). Trieda `text-base` uz nema koliziu s Tailwind v4 — `text-base` teraz generuje `font-size: 1rem`, nie farbu.

Nazvy modulov na homepage pouzivaju `text-[var(--color-txt)]` (riadok 142 v `page.tsx`: `<h3 className="text-lg font-semibold text-[var(--color-txt)]">`). Ciel lekcie pouziva `text-[var(--color-txt-secondary)]` (riadok 109 v `LessonContent.tsx`). Oba su viditelne na tmavom pozadi.

**Vysledok: PASS**

---

### BUG-02 — Validacia challenge — PASS

**Oprava overena v:** `src/components/LessonContent.tsx`, riadky 68–87

```typescript
function handleChallengeSubmit() {
    const userAnswer = challengeInput.trim().toLowerCase();
    if (!userAnswer) {
      setChallengeResult("wrong");
      return;
    }
    const expected = lesson.challenge.answer.trim().toLowerCase();
    const normalize = (s: string) => s.replace(/\s+/g, " ");
    if (normalize(userAnswer).includes(normalize(expected))) {
      // ...correct
    } else {
      setChallengeResult("wrong");
    }
}
```

Zmeny oproti povodnemu kodu:
1. Prazdny vstup (`""`) je odchyteny na riadku 70 a vracia "wrong" — **opravene**.
2. Povodna podmienka `r.includes(t) || t.includes(r)` bola nahradena `normalize(userAnswer).includes(normalize(expected))` — uz neuzna fragmenty (povodny `t.includes(r)` je prec).
3. Whitespace normalizacia je pridana.

Poznamka: validacia stale pouziva jednoduchy `includes()` — varianty s prehodenymi prepinacmi (`ls -alh` vs `ls -lah`) nebudu uznane. Toto je konstrukcne rozhodnutie, nie bug z povodneho reportu.

**Vysledok: PASS**

---

### BUG-03 — Mobil: orezane prikazy — PASS

**Oprava overena v:** `src/components/CommandCard.tsx`, riadok 50

```html
<code className="font-mono text-sm font-medium text-[var(--color-glow-green)] break-all">
```

Trieda `truncate` bola nahradena triedou `break-all`. Dlhe prikazy sa zalamuju na dalsi riadok namiesto orezania trojbodkou. Kontajner pouziva `flex items-start` (riadok 47) a `min-w-0` aby flexbox nerastol mimo kartu.

**Vysledok: PASS**

---

### BUG-04 — Mobil: orezany Expected output — PASS

**Oprava overena v:** `src/components/CommandCard.tsx`, riadky 73–80

```html
<div className="overflow-x-auto rounded-lg bg-[#080a0f] p-3 border border-[var(--color-border-subtle)]">
  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-txt-secondary)]">
```

Kontajner ma `overflow-x-auto` a `<pre>` ma `whitespace-pre-wrap`. Dlhe riadky sa zalamuju a ak treba, kontajner umozni horizontalny scroll.

**Vysledok: PASS**

---

### BUG-05 — Mobil: horizontalny posun domovskej stranky — PASS

**Oprava overena v:** `src/components/Badge.tsx`, riadok 45

```html
<div data-testid="badge-grid" className="overflow-x-clip">
```

Badge grid kontajner ma `overflow-x-clip`, co zabranuje preteceniu tooltipu/obsahu mimo viewport.

**Vysledok: PASS**

---

### BUG-06 — Podmienky odznakov len cez hover — PASS

**Oprava overena v:** `src/components/Badge.tsx`, riadky 80–84

```html
<span className="text-[11px] font-medium leading-tight text-[var(--color-txt-secondary)]">
  {name}
</span>
<span className="mt-0.5 text-[10px] leading-tight text-[var(--color-txt-muted)]">
  {config.description}
</span>
```

Popis badgu (`config.description`) je teraz priamo viditelny pod nazvom badgu — nie v `opacity-0 group-hover:opacity-100` tooltipe. Na dotykovych zariadeniach a bez hover je podmienka vzdy citatelna.

**Vysledok: PASS**

---

### BUG-07 — Sipky (modifier keys, repeat) — PASS

**Oprava overena v:** `src/components/LessonContent.tsx`, riadok 48

```typescript
if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat) return;
```

Handler ignoruje vsetky modifier keys a opakovane stlacenia (`e.repeat`). `useCallback` s `[prevId, nextId, router]` dependencies zabranuje stale closures.

Navyse: handler je na `keydown` (riadok 56), co je spravne pre navigaciu.

**Vysledok: PASS**

---

### BUG-08 — Pristupnost — PARTIAL

**Opravene (overene v kode):**

1. **`<main>` landmark:** Pridany na lesson page (`src/app/lesson/[id]/page.tsx`, riadok 54: `<main>`) aj na homepage (`src/app/page.tsx`, riadok 94: `<main className="...">`). **PASS**

2. **`aria-label` na nav:** Lesson page nav ma `aria-label="Site navigation"` (riadok 42 v `lesson/[id]/page.tsx`). **PASS**

3. **`aria-label` na challenge input:** Input ma `aria-label="Challenge answer"` (riadok 182 v `LessonContent.tsx`). **PASS**

4. **`role="alert"` na challenge result:** Vysledky challenge maju `role="alert"` (riadky 195, 200, 205 v `LessonContent.tsx`). **PASS**

**Neoverene / zostava:**

5. **Progress bar `role="progressbar"`:** `ProgressBar.tsx` nepouziva `role="progressbar"` ani `aria-valuenow`. — **Zostava nezmenene.**

6. **Heading order (h1 -> h3):** Na homepage su h3 ("Progress", "Badges") pred h2 ("Modules"). V `ProgressBar.tsx` riadok 28 a `Badge.tsx` riadok 51 su `<h3>`, modul header je `<h2>` na riadku 107 `page.tsx`. — **Zostava nezmenene** (h3 pred h2 v DOM poradi).

7. **Kontrast zamknutych odznakov:** Badge `opacity-60` na zamknutych (riadok 70 Badge.tsx) moze stale nesplnat kontrast — neoverene vizualne.

8. **Text 9-10 px:** Niektore texty su stale `text-[10px]` a `text-[11px]` (safety label, badge description, XP label). — Nezmenene.

**Vysledok: PARTIAL** (hlavne body opravene — `<main>`, aria-label nav, aria-label input, role="alert"; drobne a11y issues ostali)

---

### BUG-09 — Input challenge na mobile — PASS

**Oprava overena v:** `src/components/LessonContent.tsx`, riadky 178–180

```html
autoCapitalize="none"
autoCorrect="off"
spellCheck={false}
```

Vsetky tri atributy su pridane na challenge input. Mobilna klavesnica nebude "opravovat" Linux prikazy.

Poznamka: `font-size: text-base` (16px) je pouzity na inpute (riadok 181), co zabrani iOS Safari zoom pri fokuse.

**Vysledok: PASS**

---

### BUG-10 — Navigacia a tok kurzu — PASS

**Oprava overena v:** `src/app/page.tsx`

1. **Vsetky lekcie vypisane:** Kazdy modul obsahuje zoznam vsetkych lekcii (riadky 148–175). Lekcie 1-20 su dostupne priamo z homepage, nie len 1, 5, 9, 13, 17.

2. **"Continue" tlacidlo:** Riadky 29-30 — `nextLesson` sa pocita ako prva nedokoncena lekcia. Tlacidlo zobrazuje "Continue — Lesson X" ak `completed.length > 0` (riadok 84).

3. **Completion sprava:** Riadky 74-77 — ak `allDone` (20/20), zobrazi sa: "Course completed — 950 XP. You are a Linux Pro!"

4. **Postup v moduloch:** Kazdy modul zobrazuje `done/total` (riadok 145: `{done}/{mod.lessons.length}`) a dokoncene lekcie maju zeleny checkmark.

**Vysledok: PASS**

---

### BUG-11 — Vysvetlenie bez odsekov — PASS

**Oprava overena v:** `src/components/LessonContent.tsx`, riadky 122-131

```typescript
{lesson.explanation.split(/(?<=\.)\s+(?=[A-Z])/).reduce<string[]>((paras, sentence) => {
    const last = paras[paras.length - 1];
    if (last && last.split(/\s+/).length < 40) {
      paras[paras.length - 1] = last + " " + sentence;
    } else {
      paras.push(sentence);
    }
    return paras;
  }, []).map((para, i) => (
    <p key={i}>{para}</p>
  ))}
```

Text je rozdeleny na vety (regex split na bodku nasledovanu velkym pismenom) a zoskupeny do odsekov po max 40 slov. Kazdy odsek je samostatny `<p>` element. Kontajner ma `space-y-4` pre medzery medzi odsekmi.

**Vysledok: PASS**

---

### BUG-12 — Drobnosti (404, localStorage, reduced-motion) — PASS

**1. Custom 404:** `src/app/not-found.tsx` existuje a obsahuje:
- Velke "404" v cervenej
- Text "bash: page: command not found"
- Odkaz domov stylovany ako `cd ~`

**PASS** — uz nie je defaultna Next.js 404 stranka.

**2. localStorage try/catch + validacia:** `src/lib/progress.ts`
- `getSet()` (riadky 10-18) — `try/catch` okolo `localStorage.getItem` + `JSON.parse`
- `saveSet()` (riadky 21-28) — `try/catch` okolo `localStorage.setItem`, s komentarom "QuotaExceededError or blocked storage"
- Validacia (riadok 24): `const valid = [...set].filter((n) => Number.isInteger(n) && n >= 1 && n <= 20)` — odfiltruje neplatne hodnoty (99, -5, "x", 1.5)

**PASS**

**3. prefers-reduced-motion:** `src/app/globals.css`, riadky 89-93

```css
@media (prefers-reduced-motion: reduce) {
  .cursor-blink, .glow-pulse, .fade-up { animation: none; }
  .fade-up { opacity: 1; }
  * { transition-duration: 0.01ms !important; }
}
```

Vsetky animacie (blikajuci kurzor, glow-pulse, fade-up) su vypnute pri reduced-motion.

**PASS**

**Vysledok: PASS**

---

### BUG-13 — Vykon, SEO, hlavicky — PASS

**1. Fonty cez next/font (lokalne):** `src/app/layout.tsx`, riadky 2, 5-15

```typescript
import { JetBrains_Mono, Outfit } from "next/font/google";
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
```

`next/font/google` stiahne fonty pri builde a hostuje ich lokalne — ziadne runtime requesty na Google Fonts. Overene na deployed site: WebFetch potvrdil `.woff2` font subory z rovnakej domeny.

**PASS**

**2. robots.txt:** `public/robots.txt` existuje s obsahom:
```
User-agent: *
Allow: /
Sitemap: https://linux4teens.vercel.app/sitemap.xml
```
WebFetch na `/robots.txt` potvrdil dostupnost.

**PASS**

**3. sitemap.xml:** `src/app/sitemap.ts` generuje sitemap s 21 URL (homepage + 20 lekcii). WebFetch potvrdil 21 URL entries na deployed site.

**PASS**

**4. Open Graph tagy:** `src/app/layout.tsx`, riadky 17-25

```typescript
openGraph: {
    title: "Linux Basics for Youngsters",
    description: "20 hands-on Linux lessons for teenagers. Master the terminal one command at a time.",
    type: "website",
},
```

WebFetch potvrdil `og:title`, `og:type`, a `twitter:card` meta tagy na deployed site.

**PASS**

**Vysledok: PASS**

---

### BUG-14 — data-testid="copy-button" na nespravnom elemente — PASS

**Oprava overena v:** `src/components/CopyButton.tsx`, riadok 32

```html
<button
  onClick={handleCopy}
  data-testid="copy-button"
  className="..."
  aria-label={copied ? "Copied!" : `Copy ${text}`}
>
```

`data-testid="copy-button"` je na `<button>` elemente (nie na `<code>`). E2E test kliknutim na `[data-testid="copy-button"]` klikne na skutocne tlacidlo.

V `CommandCard.tsx` `<code>` element nema ziadny `data-testid` — je cisto na zobrazenie textu prikazu.

**Vysledok: PASS**

---

## Retest checklist

- [x] Home: nazvy modulov citatelne (`text-[var(--color-txt)]`); lekcie: ciel viditelny (`text-[var(--color-txt-secondary)]`)
- [x] Prazdny vstup = "Not quite"; `t.includes(r)` odstranene
- [x] `truncate` trieda nahradena `break-all`; expected output ma `overflow-x-auto`
- [x] Modifier keys (Alt/Cmd/Ctrl/Shift) + `e.repeat` ignorovane v keyboard handleri
- [x] `<main>` landmark na oboch strankach; `aria-label` na nav a input
- [x] `data-testid="copy-button"` je na `<button>` elemente
- [x] Custom 404, localStorage try/catch + validacia, reduced-motion media query
- [x] robots.txt, sitemap.xml, OG tagy, lokalne fonty (next/font)
- [x] autocapitalize/autocorrect/spellcheck na challenge inpute
- [x] Vsetky 20 lekcii vypisane v moduloch, "Continue" tlacidlo, completion sprava
- [x] Vysvetlenie rozdelene na odseky
- [x] Badge popisy viditelne bez hover
- [ ] Progressbar role/aria-valuenow, heading order h3 pred h2 (BUG-08 zvysky — P3)

---

## Zaver

Vsetky 3 kriticke P1 bugy su opravene. Z 14 povodnych bugov je 13 plne opravených a 1 ciastocne (BUG-08 — hlavne a11y body opravene, drobnosti ostali). Stranku je mozne publikovat pre cielovu skupinu (teenageri s Raspberry Pi).

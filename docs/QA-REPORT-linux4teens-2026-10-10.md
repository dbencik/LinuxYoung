# QA report — linux4teens.vercel.app (LinuxYoung)

- **Tester:** Tina (QA), zadanie od Larryho
- **Dátum:** 2026-10-10
- **Cieľ:** https://linux4teens.vercel.app/ — domovská stránka + 20 lekcií (`/lesson/1` … `/lesson/20`)
- **Build:** Next.js (Turbopack, prerender), CSS chunk `29-8mmfhczk2f.css`, lesson chunk `1fxd6w3y8sr5p.js`
- **Nástroje:** Playwright 1.56 + Chromium 141 (headless), axe-core 4.14, Lighthouse 13.5
- **Viewporty:** 375×812 (mobil), 768×1024 (tablet), 1440×900 (desktop) + kontrolne 320 / 360 / 390 / 412 px

## Verdikt

**Nepúšťať k deťom, kým nie sú opravené 3 chyby P1.** Stránka je stabilná (0 chýb v konzole, všetky odkazy fungujú, XP a odznaky počítajú správne), ale:

1. časť textu je neviditeľná (názvy modulov, cieľ každej lekcie),
2. challenge uzná prázdnu odpoveď a zároveň odmietne správne odpovede,
3. na mobile je 49 zo 128 príkazov orezaných a nedá sa prečítať celé.

| ID | Priorita | Nález |
|---|---|---|
| BUG-01 | **P1** | Neviditeľný text: názvy modulov (home) a cieľ lekcie (všetkých 20 lekcií) |
| BUG-02 | **P1** | Challenge: prázdna / ľubovoľná čiastková odpoveď = „Correct“, správne varianty = „Not quite“ |
| BUG-03 | **P1** | Mobil: príkazy orezané trojbodkou, celý príkaz sa nedá zobraziť |
| BUG-04 | P2 | Mobil: „Expected output“ odrezaný vpravo (6 blokov) |
| BUG-05 | P2 | Mobil: domovská stránka sa dá posúvať do strany (7–16 px) |
| BUG-06 | P2 | Podmienky odznakov sú viditeľné len pri hover myšou |
| BUG-07 | P2 | Šípky ←/→: preskakovanie pri rýchlom stlačení, kolízia so skratkami prehliadača |
| BUG-08 | P2 | Prístupnosť: chýba `<main>`, label inputu, aria stavy, kontrast, 9–10 px text |
| BUG-09 | P2 | Input challenge na mobile: auto-korekcia, zoom v iOS Safari |
| BUG-10 | P3 | Navigácia: žiadny zoznam lekcií, „Start Learning“ vždy na lekciu 1, žiadny koniec kurzu |
| BUG-11 | P3 | Vysvetlenie lekcie je jeden blok 260–347 slov bez odsekov |
| BUG-12 | P3 | Drobnosti: 404, spätná väzba challenge, localStorage, reduced motion, malé klikacie plochy |
| BUG-13 | P3 | Výkon / SEO / hlavičky: Google Fonts blokujú render, chýba robots/sitemap/OG/CSP |
| BUG-14 | P3 | Test harness: `data-testid="copy-button"` je na `<code>`, nie na tlačidle |

---

## P1

### BUG-01 — Neviditeľný text (kolízia `text-base` s farbou `--color-base`)

**Kde:** home — 5× `<h3>` názov modulu („First Steps“, „Files & Folders“ …); lekcie 1–20 — `<p>` s cieľom lekcie pod `<h1>`. Spolu 25 elementov, všetky viewporty.

**Kroky:** otvor `/` → sekcia MODULES. Otvor `/lesson/1` → pozri pod nadpis „What is Linux?“.

**Očakávané:** svetlý text (`--color-txt` = `#f0f2f7`).
**Skutočné:** `color: rgb(15, 17, 23)` (`#0f1117`).
- Názvy modulov: kontrast **1,12 : 1** voči karte `#1a1d28` — čitateľné až po hover (zozelenie).
- Cieľ lekcie: rovnaká farba ako pozadie stránky = **1 : 1**, pod nadpisom je len prázdne miesto.

**Príčina (overené v matched CSS rules):** v téme je definovaná farba `--color-base: #0f1117`. Tailwind v4 preto z triedy `text-base` generuje **farbu**, nie veľkosť písma:

```css
.text-\[var\(--color-txt\)\]{color:var(--color-txt)}   /* offset 16650 */
.text-base{color:#0f1117}                               /* offset 16838 – vyhráva */
```

Elementy majú `class="text-base … text-[var(--color-txt)]"`, neskoršie pravidlo vyhrá.

**Návrh opravy:** premenovať token (napr. `--color-canvas` / `--color-bg-base`) a upraviť použitia `bg-[var(--color-base)]`, `text-[var(--color-base)]`. Po premenovaní `text-base` opäť znamená `font-size: 1rem`.

**Pozor:** axe ani Lighthouse to na lekciách nenahlásia (kontrast 1 : 1 berú ako zámerne skrytý text) — Lighthouse a11y ukazuje 98 napriek neviditeľnému textu.

---

### BUG-02 — Validácia challenge

**Kde:** všetkých 20 lekcií, sekcia Challenge.

**Kroky A (false positive):** `/lesson/1` → nič nepíš → klikni **run**.
**Skutočné:** „✓ Correct! +25 XP“, do `localStorage.linuxyoung_completed_challenges` sa zapíše `[1]`. Overené na všetkých 20 lekciách: 20× klik na „run“ s prázdnym poľom = 500 XP a odznaky „Challenge Accepted“, „Challenge Master“ a „XP Hunter“ pri postupe 0/20.

**Kroky B (false negative):** `/lesson/3` → napíš `ls -alh` → run.
**Skutočné:** „✗ Not quite“. Uzná sa iba presný reťazec `ls -lah`.

**Príčina (kód v `1fxd6w3y8sr5p.js`):**

```js
let r = input.trim().toLowerCase(), t = answer.trim().toLowerCase();
r.includes(t) || t.includes(r) ? correct : wrong
```

`t.includes(r)` je pravda pre prázdny reťazec a pre každý fragment správnej odpovede.

| Lekcia | Uznané (nemalo by) | Odmietnuté (malo by prejsť) |
|---|---|---|
| 1 | `""`, `e`, `o`, `ch` | — (odpoveď je len `echo`, takže prejde aj `echo` bez mena) |
| 2 | `cd`, `p`, `&&` | `cd Pictures; pwd; cd ..` · `cd Pictures, pwd, cd ..` · `cd Pictures && pwd && cd ~` |
| 3 | `ls`, `l`, `-` | `ls -alh` · `ls -hal` · `ls -la -h` · `ls -l -a -h` |
| 4 | `cd`, `/` | `cd, cd ~, cd /home/youngster` · iné poradie troch príkazov |
| 10 | `the`, `a`, `no` | každá vlastná formulácia — vyžaduje sa doslovná veta s 23 slovami |
| 11 | `chmod`, `6` | `chmod 0600 secret.txt` · `chmod 600 ./secret.txt` |
| 13 | `grep`, `cat`, `"` | `grep -i cat animals.txt` · `grep -i 'cat' animals.txt` |
| 14 | `find`, `d` | `find ~ -type d -name projects` · prehodené poradie `-name` / `-type` |
| 15 | `wc`, `\|` | `cat /etc/passwd\|grep nologin\|wc -l` · `grep "nologin"` |
| 17 | `du`, `s` | `du -sh ~/Downloads` · `du -hs /home/youngster/Downloads` |
| 20 | `ssh`, `1` | — |

**Návrh opravy:** odmietnuť prázdny vstup; zrušiť `t.includes(r)`; normalizovať medzery; pre každú lekciu zoznam akceptovaných vzorov (regex, poradie prepínačov, `~` vs. `/home/youngster`, s úvodzovkami aj bez). Lekcia 10 je otázka na voľný text — zmeniť na výber z možností.

---

### BUG-03 — Mobil: orezané príkazy

**Kde:** karty príkazov, `<code class="… truncate">`. Pri 375 px **49 zo 128** príkazov (lekcie 4–17, 19, 20); na desktope 2 (L6 `echo -e "Line 1\nLine 2…`, L8 `mkdir -p test-project/src && touch …`).

**Kroky:** mobil 375 px → `/lesson/6` → tretia karta.
**Skutočné:** `echo -e "Line 1\nL…` — bez posunu, bez `title`, bez zalomenia. Celý príkaz sa dá získať len tlačidlom copy, čo dieťaťu prepisujúcemu príkaz do Raspberry Pi nepomôže.

**Návrh opravy:** namiesto `truncate` použiť `whitespace-pre-wrap break-all` alebo `overflow-x-auto`.

---

## P2

### BUG-04 — Mobil: orezaný „Expected output“
Pri 375 px 6 blokov: L9 (`id`, `head -5 /etc/passwd`, `grep youngster /etc/passwd`), L13 (`grep "youngster" /etc/passwd`), L15 (`cat /etc/passwd | head -5`, `… | grep youngster`). Dlhý reťazec bez medzier (`groups=1000(youngster),4(adm),24(cdrom),27(s…`) pretečie a karta má `overflow-hidden`. Oprava: `overflow-x-auto` alebo `break-all` na `<pre>`.

### BUG-05 — Mobil: horizontálny posun domovskej stránky
`scrollWidth` > šírka displeja: 320 px +16, 360 +13, 375 +11, 390 +9, 412 +7 px. Pôvodca: neviditeľný tooltip posledného odznaku v rade (`absolute … whitespace-nowrap`, „Complete all 20 lessons“). Oprava: `overflow-x: clip` na sekcii odznakov alebo zarovnať krajné tooltipy dovnútra. (Lekcia 6 pri 320 px pretečie o 20 px.)

### BUG-06 — Podmienky odznakov len cez hover
Tooltip je `opacity-0 group-hover:opacity-100` na `<div>` bez `tabindex`, `title` či `aria`. V dotykovej emulácii po ťuknutí ostáva `opacity: 0`; klávesnicou sa naň nedá dostať. Dieťa na tablete nezistí, ako odznak získať. Oprava: zobraziť podmienku pod názvom, alebo spraviť odznak tlačidlom s popisom.

### BUG-07 — Šípky ←/→
- **Rýchle stlačenia:** z L3 3× → s odstupom 0–50 ms skončí na L4 (má byť L6). → a hneď ← (do 100 ms) skončí na **L2** (má byť L3). Od ~150–300 ms odstupu je to správne. Handler počas prechodu ešte patrí starej lekcii.
- **Modifikátory sa neignorujú:** Alt+→, Cmd+→, Ctrl+→ aj Shift+→ prepnú lekciu. Alt+←/→ (Windows/Linux) a Cmd+←/→ (macOS) sú zároveň Späť/Dopredu prehliadača, Shift+šípka je označovanie textu.
- Oprava: `if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat) return;` a ignorovať stlačenia počas prebiehajúcej navigácie.

V poriadku: šípky v inpute nenavigujú, na L1 ← a na L20 → nerobia nič.

### BUG-08 — Prístupnosť (axe-core, WCAG 2.1/2.2 AA)
- Lekcie: chýba `<main>` (`landmark-one-main`), obsah mimo landmarkov (`region`), dve `<nav>` bez `aria-label` (`landmark-unique`) — na všetkých 20 lekciách.
- Home: poradie nadpisov h1 → h3 („Progress“, „Badges“) pred h2 („Modules“).
- Home: kontrast zamknutých odznakov 2,68 : 1 (ikona) a 4,01 : 1 (názov, 10 px) — 20 elementov.
- Input challenge nemá `<label>` ani `aria-label` (len placeholder).
- Tlačidlo hintu nemá `aria-expanded`; výsledok challenge a „✓ lesson completed“ nie sú v `aria-live`, čítačka ich neoznámi.
- Progress bar nemá `role="progressbar"` / `aria-valuenow`.
- Text 9–10 px: „SAFE“, „copy“, „Expected output“, nadpisy sekcií, názvy odznakov, „← → to navigate“.
- Focus ring inputu: `#1a6b3a` na `#0f1117` = 2,9 : 1 (pod 3 : 1).

V poriadku: `lang="en"`, viditeľný focus na odkazoch a tlačidlách, logické poradie Tab, copy tlačidlá majú `aria-label`.

### BUG-09 — Input challenge na mobile
- Chýba `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"` — klávesnica bude príkazy „opravovať“ (veľké písmeno validácia znesie, auto-korekciu nie).
- `font-size: 14px` — iOS Safari pri fokuse na pole pod 16 px priblíži stránku. *Známe správanie iOS, na zariadení neoverené (viď Obmedzenia).*

---

## P3

### BUG-10 — Navigácia a tok kurzu
- Home odkazuje len na lekcie 1, 5, 9, 13, 17. Na lekciu 7 sa dá dostať iba klikaním „next“ alebo cez URL; zoznam lekcií neexistuje.
- „Start Learning“ vedie vždy na `/lesson/1`, aj pri 8/20 (žiadne „Continue“). Karty modulov neukazujú postup.
- Po lekcii 20 nič: žiadne zhrnutie ani gratulácia, ani pri 20/20 a 950 XP.
- Postup sa nedá resetovať ani lekciu „odznačiť“.

### BUG-11 — Vysvetlenie bez odsekov
Text „Explanation“ je v dátach jeden reťazec bez zalomení: 260–347 slov, na mobile 730–1050 px vysoký blok. Pre cieľovú skupinu ťažko čitateľné — rozdeliť na odseky / odrážky.

### BUG-12 — Drobnosti
- **404:** predvolená stránka Next.js, bez odkazu domov.
- **Spätná väzba challenge:** „+25 XP“ sa zobrazí pri každom ďalšom odoslaní (XP sa pripíše raz); po vyriešení a zlej odpovedi svieti „✗ Not quite“ vedľa „solved“.
- **localStorage:** zápis nie je v `try/catch` — pri plnom/blokovanom úložisku tlačidlo „mark-complete“ ticho nič nespraví (uncaught `QuotaExceededError`). Hodnoty sa nevalidujú: `[1,2,99,-5,"x",1.5]` → 6/20, 30 %. Poškodený JSON zvládne (0/20).
- **Návrat používateľa:** home ~0,5 s ukazuje 0/20, potom preskočí na skutočný stav.
- **`prefers-reduced-motion`:** v CSS nie je; blikajúci kurzor beží donekonečna.
- **Malé klikacie plochy (mobil):** „~ LinuxYoung“ 87×16 px, „+ show hint“ 79×16 px (WCAG 2.2 min. 24 px).

### BUG-13 — Výkon, SEO, hlavičky
Lighthouse (1 laboratórny beh, orientačné):

| Stránka | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home, mobil | 89 | 92 | 100 | 100 | 1,9 s | 2,6 s | 310 ms | 0 |
| Lekcia 6, mobil | 87 | 98 | 100 | 100 | 3,0 s | 3,0 s | 0 ms | 0 |
| Home, desktop | 99 | 92 | 100 | 100 | 0,8 s | 0,8 s | 0 ms | 0,007 |

- Google Fonts sa načítavajú ako render-blocking CSS z `fonts.googleapis.com` (odhad 0,9–1,0 s na mobile), 11 rezov písma. `next/font` ich hostuje lokálne — a IP adresy detí nepôjdu Googlu (GDPR).
- Chýba `robots.txt`, `sitemap.xml`, canonical, Open Graph, manifest.
- Z bezpečnostných hlavičiek je len HSTS; chýba CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.

### BUG-14 — `data-testid="copy-button"` na nesprávnom elemente
Test ID je na `<code>` s príkazom, skutočné tlačidlo copy ho nemá. E2E test, ktorý klikne na `copy-button`, klikne na text a nič neskopíruje. Dôležité pre closed-loop testy.

---

## Čo prešlo

- 21 stránok × 3 viewporty = 63 načítaní: všetky 200, **0 chýb v konzole, 0 zlyhaných požiadaviek**.
- Neplatné adresy (`/lesson/0`, `/21`, `/abc`, `/-1`, `/1.5`, `/lesson`) vracajú 404.
- prev / next sú správne na všetkých 20 lekciách, počítadlo N/20 sedí, každá lekcia má vlastný `<title>` a meta description.
- **128 / 128** copy tlačidiel skopíruje presný príkaz; „copied!“ sa po 2 s vráti na „copy“.
- XP a odznaky: 1 lekcia → 10 XP, 5 %, 1 odznak · modul 1 + 5 challenge → 215 XP, 4 odznaky · všetko → 950 XP, 100 %, 10/10. Stav prežije reload.
- Enter odošle challenge; hint sa otvára a zatvára.
- Lekcie nepretekajú do strany pri 360–1440 px; tablet a desktop bez layoutových chýb.
- HTML vložené do inputu sa nikde nevykreslí.

## Obmedzenia testu

- **Len Chromium.** Safari/WebKit a Firefox tu nie sú dostupné — správanie na reálnom iPhone/iPade (zoom inputu, hover, klávesnica) treba overiť na zariadení.
- Bez čítačky obrazovky (VoiceOver) a bez reálnej mobilnej siete; Lighthouse je jeden laboratórny beh.
- Obsahová správnosť lekcií nebola predmetom testu. Jedna vec si všimnutá popri tom: L20, `ssh-keygen` — text radí pri varovaní o prepísaní kľúča „press Enter to replace it“; Enter je pri `Overwrite (y/n)?` odpoveď „nie“ a prepísanie kľúča je nevratné.
- Na nasadenej verzii nie je virtuálny terminál, PDF ani videá — testované boli lekcie, challenge, postup a odznaky.
- Dve načítania vrátili 502 z proxy testovacieho prostredia; po opakovaní v poriadku, nepočítané ako chyba webu.

## Retest checklist

- [ ] Home: názvy modulov čitateľné bez hover; lekcie: cieľ pod nadpisom viditeľný (všetkých 20)
- [ ] Prázdny vstup a fragmenty (`l`, `cd`, `the`) = „Not quite“; varianty z tabuľky BUG-02 = „Correct“
- [ ] 375 px: 0 orezaných príkazov, 0 orezaných výstupov, `scrollWidth == clientWidth` na home
- [ ] 3× → rýchlo za sebou = +3 lekcie; Alt/Cmd/Shift+šípka neprepína lekciu
- [ ] axe: 0 × `landmark-one-main`, `region`, `color-contrast`, `heading-order`
- [ ] `copy-button` test ID je na `<button>`

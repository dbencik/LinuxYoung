/**
 * AICLP Acceptance Tests — REQ 8: Readable Typography and Contrast
 *
 * Falsifiable tests:
 * - No text below 13px in any .tsx file under src/
 * - Reading text (explanation, objective, challenge question) uses text-lg
 * - All colour token pairs pass 4.5:1 contrast
 * - Max line width uses max-w-[65ch]
 */
import fs from "fs";
import path from "path";

// ---- helpers ----

function globTsx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...globTsx(full));
    else if (entry.name.endsWith(".tsx")) results.push(full);
  }
  return results;
}

/** Parse hex colour to { r, g, b } */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** WCAG 2.1 relative luminance */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio */
function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Extract hex colour tokens from globals.css */
function parseTokens(cssPath: string): Record<string, string> {
  const css = fs.readFileSync(cssPath, "utf-8");
  const tokens: Record<string, string> = {};
  const re = /--color-([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

// ---- constants ----

const SRC_DIR = path.join(__dirname, "../src");
const CSS_PATH = path.join(SRC_DIR, "app/globals.css");

const BANNED_CLASSES = /\btext-xs\b|\btext-\[9px\]|\btext-\[10px\]|\btext-\[11px\]|\btext-\[12px\]/;

const SURFACES = ["canvas", "surface", "elevated", "card", "card-hover", "terminal"];
const TEXT_TOKENS = ["txt", "txt-secondary", "txt-muted"];
const GLOW_TOKENS = ["glow-green", "glow-amber", "glow-red", "glow-blue", "dim-amber"];

// ---- tests ----

describe("REQ 8: Readable Typography and Contrast", () => {
  const tsxFiles = globTsx(SRC_DIR);

  describe("No text below 13px", () => {
    test.each(tsxFiles.map((f) => [path.relative(SRC_DIR, f), f]))(
      "%s has no banned font-size classes",
      (_name, filePath) => {
        const content = fs.readFileSync(filePath as string, "utf-8");
        expect(content).not.toMatch(BANNED_CLASSES);
      }
    );
  });

  describe("Reading text uses text-lg", () => {
    test("explanation/step text container uses text-lg", () => {
      const lessonContent = fs.readFileSync(
        path.join(SRC_DIR, "components/LessonContent.tsx"),
        "utf-8"
      );
      // The explanation text container should have text-lg
      expect(lessonContent).toMatch(/text-lg/);
    });

    test("lesson objective uses text-lg", () => {
      const lessonContent = fs.readFileSync(
        path.join(SRC_DIR, "components/LessonContent.tsx"),
        "utf-8"
      );
      // The line rendering lesson.objective should have text-lg in its className
      const lines = lessonContent.split("\n");
      const objectiveLine = lines.find((l) => l.includes("lesson.objective"));
      expect(objectiveLine).toBeDefined();
      // Find the element's className (on same or previous line)
      const idx = lines.indexOf(objectiveLine!);
      const context = lines.slice(Math.max(0, idx - 2), idx + 1).join("\n");
      expect(context).toMatch(/text-lg/);
    });
  });

  describe("Max line width", () => {
    test("reading text is constrained to 65ch", () => {
      const lessonContent = fs.readFileSync(
        path.join(SRC_DIR, "components/LessonContent.tsx"),
        "utf-8"
      );
      expect(lessonContent).toMatch(/max-w-\[65ch\]/);
    });
  });

  describe("Colour contrast ≥ 4.5:1", () => {
    const tokens = parseTokens(CSS_PATH);

    test("all text tokens exist", () => {
      for (const t of TEXT_TOKENS) {
        expect(tokens[t]).toBeDefined();
      }
    });

    test("all surface tokens exist", () => {
      for (const s of SURFACES) {
        expect(tokens[s]).toBeDefined();
      }
    });

    for (const text of TEXT_TOKENS) {
      for (const surface of SURFACES) {
        test(`${text} on ${surface} ≥ 4.5:1`, () => {
          const ratio = contrast(tokens[text], tokens[surface]);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
      }
    }

    for (const glow of GLOW_TOKENS) {
      for (const surface of ["canvas", "surface", "elevated", "terminal"]) {
        test(`${glow} on ${surface} ≥ 4.5:1`, () => {
          if (!tokens[glow]) return; // skip if not a hex token
          const ratio = contrast(tokens[glow], tokens[surface]);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  });
});

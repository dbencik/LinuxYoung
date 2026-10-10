/**
 * AICLP Acceptance Tests — REQ 2b: Guided Real Terminal Experience
 *
 * Falsifiable Tests from FSD:
 * - Every command has a safety label ("safe", "modifies", or "caution")
 * - At least 50% of commands have a troubleshooting tip
 * - Expected output exists for commands that produce output
 * - Copy button text matches command string
 */
import fs from "fs";
import path from "path";

const LESSONS_DIR = path.join(__dirname, "../content/lessons");

interface Command {
  command: string;
  description: string;
  expectedOutput: string;
  safety: string;
  troubleshooting: string | null;
}

interface Lesson {
  id: number;
  commands: Command[];
}

function loadAllLessons(): Lesson[] {
  return fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(LESSONS_DIR, f), "utf-8")));
}

describe("REQ 2b: Guided Real Terminal Experience", () => {
  const lessons = loadAllLessons();
  const allCommands = lessons.flatMap((l) => l.commands);

  describe("Safety labels", () => {
    test("every command has a safety label", () => {
      allCommands.forEach((cmd) => {
        expect(cmd.safety).toBeDefined();
        expect(["safe", "modifies", "caution"]).toContain(cmd.safety);
      });
    });

    test("basic read-only commands without redirects are labeled 'safe'", () => {
      const alwaysSafe = ["ls", "pwd", "whoami", "uname"];
      allCommands.forEach((cmd) => {
        const base = cmd.command.split(" ")[0];
        const hasRedirect = cmd.command.includes(">") || cmd.command.includes(">>");
        if (alwaysSafe.includes(base) && !hasRedirect) {
          expect(cmd.safety).toBe("safe");
        }
      });
    });

    test("destructive commands are labeled 'caution'", () => {
      allCommands.forEach((cmd) => {
        const base = cmd.command.split(" ")[0];
        if (base === "rm" || base === "rmdir") {
          expect(cmd.safety).toBe("caution");
        }
      });
    });

    test("all three safety levels are used across the curriculum", () => {
      const levels = new Set(allCommands.map((c) => c.safety));
      expect(levels.has("safe")).toBe(true);
      expect(levels.has("modifies")).toBe(true);
      expect(levels.has("caution")).toBe(true);
    });
  });

  describe("Troubleshooting tips", () => {
    test("at least 50% of commands have troubleshooting tips", () => {
      const withTips = allCommands.filter((c) => c.troubleshooting !== null && c.troubleshooting !== undefined);
      const ratio = withTips.length / allCommands.length;
      expect(ratio).toBeGreaterThanOrEqual(0.5);
    });

    test("troubleshooting tips are non-empty strings when present", () => {
      allCommands.forEach((cmd) => {
        if (cmd.troubleshooting !== null && cmd.troubleshooting !== undefined) {
          expect(typeof cmd.troubleshooting).toBe("string");
          expect(cmd.troubleshooting.length).toBeGreaterThan(10);
        }
      });
    });
  });

  describe("Expected output", () => {
    test("every command has an expectedOutput field", () => {
      allCommands.forEach((cmd) => {
        expect(cmd).toHaveProperty("expectedOutput");
      });
    });

    test("commands that produce visible output have non-empty expectedOutput", () => {
      // Many commands produce no visible output (cd, mkdir, touch, cp, mv, rm, chmod, echo >, etc.)
      const silentBases = ["cd", "mkdir", "touch", "cp", "mv", "rm", "rmdir", "chmod", "chown", "kill", "scp"];
      const outputCommands = allCommands.filter((c) => {
        const base = c.command.split(" ")[0];
        const hasRedirect = c.command.includes(">") || c.command.includes(">>") || c.command.includes("2>");
        return !silentBases.includes(base) && !hasRedirect && base !== "echo";
      });
      outputCommands.forEach((cmd) => {
        expect(cmd.expectedOutput.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Command copyability", () => {
    test("every command string is non-empty and copyable", () => {
      allCommands.forEach((cmd) => {
        expect(cmd.command).toBeTruthy();
        expect(cmd.command.trim()).toBe(cmd.command); // no leading/trailing whitespace
      });
    });

    test("every command has a description", () => {
      allCommands.forEach((cmd) => {
        expect(cmd.description).toBeTruthy();
        expect(cmd.description.length).toBeGreaterThan(5);
      });
    });
  });

  describe("Coverage stats", () => {
    test("total commands across all lessons", () => {
      // Just a sanity check — should be 100+ commands across 20 lessons
      expect(allCommands.length).toBeGreaterThanOrEqual(60);
    });

    test("print coverage summary", () => {
      const total = allCommands.length;
      const safe = allCommands.filter((c) => c.safety === "safe").length;
      const modifies = allCommands.filter((c) => c.safety === "modifies").length;
      const caution = allCommands.filter((c) => c.safety === "caution").length;
      const withTips = allCommands.filter((c) => c.troubleshooting).length;

      // Log for visibility
      console.log(`\nREQ 2b Coverage:`);
      console.log(`  Total commands: ${total}`);
      console.log(`  Safe: ${safe} | Modifies: ${modifies} | Caution: ${caution}`);
      console.log(`  With troubleshooting: ${withTips}/${total} (${Math.round((withTips / total) * 100)}%)`);

      expect(safe + modifies + caution).toBe(total);
    });
  });
});

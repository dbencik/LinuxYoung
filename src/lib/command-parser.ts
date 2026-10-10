import { VirtualFS } from "./virtual-fs";

export interface CommandResult {
  output: string;
  exitCode: number;
}

export class CommandParser {
  private fs: VirtualFS;
  private history: string[];

  constructor(fs: VirtualFS) {
    this.fs = fs;
    this.history = [];
  }

  execute(input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) return { output: "", exitCode: 0 };

    this.history.push(trimmed);

    const parts = this.parseInput(trimmed);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "ls":
        return this.execLs(args);
      case "cd":
        return this.execCd(args);
      case "pwd":
        return this.execPwd();
      case "cat":
        return this.execCat(args);
      case "echo":
        return this.execEcho(args);
      case "mkdir":
        return this.execMkdir(args);
      case "touch":
        return this.execTouch(args);
      case "rm":
        return this.execRm(args);
      case "rmdir":
        return this.execRmdir(args);
      case "cp":
        return this.execCp(args);
      case "mv":
        return this.execMv(args);
      case "whoami":
        return { output: "youngster", exitCode: 0 };
      case "uname":
        return this.execUname(args);
      case "grep":
        return this.execGrep(args);
      case "find":
        return this.execFind(args);
      case "chmod":
        return this.execChmod(args);
      case "history":
        return this.execHistory();
      case "clear":
        return { output: "\x1b[clear]", exitCode: 0 };
      default:
        return { output: `command not found: ${cmd}`, exitCode: 127 };
    }
  }

  private parseInput(input: string): string[] {
    const parts: string[] = [];
    let current = "";
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (ch === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (ch === " " && !inSingleQuote && !inDoubleQuote) {
        if (current) {
          parts.push(current);
          current = "";
        }
      } else {
        current += ch;
      }
    }
    if (current) parts.push(current);
    return parts;
  }

  private execLs(args: string[]): CommandResult {
    const flags = new Set<string>();
    let target: string | undefined;

    for (const arg of args) {
      if (arg.startsWith("-")) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        target = arg;
      }
    }

    const showAll = flags.has("a");
    const longFormat = flags.has("l");
    const humanReadable = flags.has("h");

    const result = this.fs.listDir(target);
    if (!result.success) return { output: result.error || "", exitCode: 2 };

    let entries = result.entries || [];

    const lines: string[] = [];

    if (showAll) {
      // Add . and .. entries
      const dotEntries = [
        { name: ".", type: "directory" as const, permissions: "drwxr-xr-x" },
        { name: "..", type: "directory" as const, permissions: "drwxr-xr-x" },
      ];
      entries = [...dotEntries, ...entries];
    }

    if (longFormat) {
      lines.push(`total ${entries.length}`);
      for (const entry of entries) {
        const perms = entry.permissions || (entry.type === "directory" ? "drwxr-xr-x" : "-rw-r--r--");
        const size = humanReadable ? "4.0K" : "4096";
        const date = "Oct 10 12:00";
        lines.push(`${perms} 1 youngster youngster ${size} ${date} ${entry.name}`);
      }
    } else {
      lines.push(entries.map((e) => e.name).join("  "));
    }

    return { output: lines.join("\n"), exitCode: 0 };
  }

  private execCd(args: string[]): CommandResult {
    const target = args[0] || "~";
    const result = this.fs.cd(target);
    if (!result.success) return { output: result.error || "", exitCode: 1 };
    return { output: "", exitCode: 0 };
  }

  private execPwd(): CommandResult {
    return { output: this.fs.getPath(), exitCode: 0 };
  }

  private execCat(args: string[]): CommandResult {
    if (args.length === 0) return { output: "cat: missing operand", exitCode: 1 };
    const outputs: string[] = [];
    for (const file of args) {
      const result = this.fs.readFile(file);
      if (!result.success) return { output: result.error || "", exitCode: 1 };
      outputs.push(result.content || "");
    }
    return { output: outputs.join("\n"), exitCode: 0 };
  }

  private execEcho(args: string[]): CommandResult {
    return { output: args.join(" "), exitCode: 0 };
  }

  private execMkdir(args: string[]): CommandResult {
    const flags = new Set<string>();
    const dirs: string[] = [];

    for (const arg of args) {
      if (arg === "-p") flags.add("p");
      else if (arg.startsWith("-")) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        dirs.push(arg);
      }
    }

    if (dirs.length === 0) return { output: "mkdir: missing operand", exitCode: 1 };

    for (const dir of dirs) {
      const result = this.fs.createDir(dir, flags.has("p"));
      if (!result.success) return { output: result.error || "", exitCode: 1 };
    }
    return { output: "", exitCode: 0 };
  }

  private execTouch(args: string[]): CommandResult {
    if (args.length === 0) return { output: "touch: missing file operand", exitCode: 1 };
    for (const file of args) {
      const result = this.fs.createFile(file);
      if (!result.success) return { output: result.error || "", exitCode: 1 };
    }
    return { output: "", exitCode: 0 };
  }

  private execRm(args: string[]): CommandResult {
    const flags = new Set<string>();
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith("-")) {
        for (const ch of arg.slice(1)) flags.add(ch);
      } else {
        targets.push(arg);
      }
    }

    if (targets.length === 0) return { output: "rm: missing operand", exitCode: 1 };

    for (const target of targets) {
      if (flags.has("r") || flags.has("R")) {
        // Try as directory first, then as file
        const dirResult = this.fs.deleteDir(target, true);
        if (!dirResult.success) {
          const fileResult = this.fs.deleteFile(target);
          if (!fileResult.success) return { output: fileResult.error || "", exitCode: 1 };
        }
      } else {
        const result = this.fs.deleteFile(target);
        if (!result.success) return { output: result.error || "", exitCode: 1 };
      }
    }
    return { output: "", exitCode: 0 };
  }

  private execRmdir(args: string[]): CommandResult {
    if (args.length === 0) return { output: "rmdir: missing operand", exitCode: 1 };
    for (const dir of args) {
      const result = this.fs.deleteDir(dir, false);
      if (!result.success) return { output: result.error || "", exitCode: 1 };
    }
    return { output: "", exitCode: 0 };
  }

  private execCp(args: string[]): CommandResult {
    if (args.length < 2) return { output: "cp: missing operand", exitCode: 1 };
    const src = args[args.length - 2];
    const dest = args[args.length - 1];
    const result = this.fs.copyFile(src, dest);
    if (!result.success) return { output: result.error || "", exitCode: 1 };
    return { output: "", exitCode: 0 };
  }

  private execMv(args: string[]): CommandResult {
    if (args.length < 2) return { output: "mv: missing operand", exitCode: 1 };
    const src = args[args.length - 2];
    const dest = args[args.length - 1];
    const result = this.fs.moveFile(src, dest);
    if (!result.success) return { output: result.error || "", exitCode: 1 };
    return { output: "", exitCode: 0 };
  }

  private execUname(args: string[]): CommandResult {
    const flags = new Set<string>();
    for (const arg of args) {
      if (arg.startsWith("-")) {
        for (const ch of arg.slice(1)) flags.add(ch);
      }
    }
    if (flags.has("a")) {
      return { output: "Linux raspberrypi 6.1.0-rpi7-rpi-v8 #1 SMP PREEMPT aarch64 GNU/Linux", exitCode: 0 };
    }
    return { output: "Linux", exitCode: 0 };
  }

  private execGrep(args: string[]): CommandResult {
    if (args.length < 2) return { output: "grep: missing operand", exitCode: 1 };
    const pattern = args[0];
    const file = args[1];
    const readResult = this.fs.readFile(file);
    if (!readResult.success) return { output: `grep: ${file}: No such file or directory`, exitCode: 2 };

    const lines = (readResult.content || "").split("\n");
    const matches = lines.filter((line) => line.includes(pattern));
    if (matches.length === 0) return { output: "", exitCode: 1 };
    return { output: matches.join("\n"), exitCode: 0 };
  }

  private execFind(args: string[]): CommandResult {
    let startPath = ".";
    let name: string | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-name" && i + 1 < args.length) {
        name = args[i + 1];
        i++;
      } else if (!args[i].startsWith("-")) {
        startPath = args[i];
      }
    }

    const results = this.fs.find(startPath, name);
    return { output: results.join("\n"), exitCode: 0 };
  }

  private execChmod(args: string[]): CommandResult {
    if (args.length < 2) return { output: "chmod: missing operand", exitCode: 1 };
    const mode = args[0];
    const target = args[1];
    const result = this.fs.chmod(target, mode);
    if (!result.success) return { output: result.error || "", exitCode: 1 };
    return { output: "", exitCode: 0 };
  }

  private execHistory(): CommandResult {
    const lines = this.history.map((cmd, i) => `  ${i + 1}  ${cmd}`);
    return { output: lines.join("\n"), exitCode: 0 };
  }
}

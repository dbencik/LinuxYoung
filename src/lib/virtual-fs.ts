export type FSNodeType = "file" | "directory";

export interface FSNode {
  name: string;
  type: FSNodeType;
  content?: string;
  children?: Map<string, FSNode>;
  permissions?: string;
}

export class VirtualFS {
  private root: FSNode;
  private cwd: string;
  private home: string;

  constructor() {
    this.home = "/home/youngster";
    this.cwd = this.home;

    this.root = this.createDirNode("");

    // Build /home/youngster and default directories
    this.ensurePath(this.home);
    const defaultDirs = [
      "Documents",
      "Downloads",
      "Music",
      "Pictures",
      "Videos",
    ];
    for (const dir of defaultDirs) {
      this.ensurePath(`${this.home}/${dir}`);
    }

    // Default file
    this.createFileAt(`${this.home}/hello.txt`, "Hello, Linux!");
  }

  private createDirNode(name: string): FSNode {
    return { name, type: "directory", children: new Map(), permissions: "drwxr-xr-x" };
  }

  private createFileNode(name: string, content: string): FSNode {
    return { name, type: "file", content, permissions: "-rw-r--r--" };
  }

  private parsePath(p: string): string[] {
    const resolved = p.startsWith("/") ? p : `${this.cwd}/${p}`;
    const parts = resolved.split("/").filter(Boolean);
    const stack: string[] = [];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return stack;
  }

  private resolvePath(p: string): string {
    const parts = this.parsePath(p);
    return "/" + parts.join("/");
  }

  private getNode(p: string): FSNode | null {
    const parts = this.parsePath(p);
    let node = this.root;
    for (const part of parts) {
      if (node.type !== "directory" || !node.children) return null;
      const child = node.children.get(part);
      if (!child) return null;
      node = child;
    }
    return node;
  }

  private getParentAndName(p: string): { parent: FSNode; name: string } | null {
    const parts = this.parsePath(p);
    if (parts.length === 0) return null;
    const name = parts.pop()!;
    let node = this.root;
    for (const part of parts) {
      if (node.type !== "directory" || !node.children) return null;
      const child = node.children.get(part);
      if (!child) return null;
      node = child;
    }
    if (node.type !== "directory" || !node.children) return null;
    return { parent: node, name };
  }

  private ensurePath(p: string): void {
    const parts = this.parsePath(p);
    let node = this.root;
    for (const part of parts) {
      if (!node.children) {
        node.children = new Map();
      }
      if (!node.children.has(part)) {
        node.children.set(part, this.createDirNode(part));
      }
      node = node.children.get(part)!;
    }
  }

  private createFileAt(p: string, content: string): void {
    const info = this.getParentAndName(p);
    if (!info) return;
    info.parent.children!.set(info.name, this.createFileNode(info.name, content));
  }

  exists(p: string): boolean {
    return this.getNode(p) !== null;
  }

  getPath(): string {
    return this.cwd;
  }

  getHome(): string {
    return this.home;
  }

  cd(p: string): { success: boolean; error?: string } {
    const target = p === "~" || p === "" ? this.home : p;
    const resolved = this.resolvePath(target);
    const node = this.getNode(resolved);
    if (!node) return { success: false, error: `cd: no such file or directory: ${p}` };
    if (node.type !== "directory") return { success: false, error: `cd: not a directory: ${p}` };
    this.cwd = resolved;
    return { success: true };
  }

  listDir(p?: string): { success: boolean; entries?: { name: string; type: FSNodeType; permissions: string }[]; error?: string } {
    const target = p || this.cwd;
    const node = this.getNode(target);
    if (!node) return { success: false, error: `ls: cannot access '${target}': No such file or directory` };
    if (node.type !== "directory") {
      return {
        success: true,
        entries: [{ name: node.name, type: node.type, permissions: node.permissions || "-rw-r--r--" }],
      };
    }
    const entries: { name: string; type: FSNodeType; permissions: string }[] = [];
    if (node.children) {
      const sorted = [...node.children.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      for (const [, child] of sorted) {
        entries.push({ name: child.name, type: child.type, permissions: child.permissions || "-rw-r--r--" });
      }
    }
    return { success: true, entries };
  }

  readFile(p: string): { success: boolean; content?: string; error?: string } {
    const node = this.getNode(p);
    if (!node) return { success: false, error: `cat: ${p}: No such file or directory` };
    if (node.type !== "file") return { success: false, error: `cat: ${p}: Is a directory` };
    return { success: true, content: node.content || "" };
  }

  createFile(p: string, content: string = ""): { success: boolean; error?: string } {
    const info = this.getParentAndName(p);
    if (!info) return { success: false, error: `touch: cannot create '${p}': No such file or directory` };
    if (info.parent.children!.has(info.name)) {
      const existing = info.parent.children!.get(info.name)!;
      if (existing.type === "directory") {
        return { success: false, error: `touch: cannot create '${p}': Is a directory` };
      }
      // touch existing file is a no-op (updates timestamp conceptually)
      return { success: true };
    }
    info.parent.children!.set(info.name, this.createFileNode(info.name, content));
    return { success: true };
  }

  createDir(p: string, recursive: boolean = false): { success: boolean; error?: string } {
    if (recursive) {
      this.ensurePath(p);
      return { success: true };
    }
    const info = this.getParentAndName(p);
    if (!info) return { success: false, error: `mkdir: cannot create directory '${p}': No such file or directory` };
    if (info.parent.children!.has(info.name)) {
      return { success: false, error: `mkdir: cannot create directory '${p}': File exists` };
    }
    info.parent.children!.set(info.name, this.createDirNode(info.name));
    return { success: true };
  }

  deleteFile(p: string): { success: boolean; error?: string } {
    const info = this.getParentAndName(p);
    if (!info) return { success: false, error: `rm: cannot remove '${p}': No such file or directory` };
    const node = info.parent.children!.get(info.name);
    if (!node) return { success: false, error: `rm: cannot remove '${p}': No such file or directory` };
    if (node.type === "directory") return { success: false, error: `rm: cannot remove '${p}': Is a directory` };
    info.parent.children!.delete(info.name);
    return { success: true };
  }

  deleteDir(p: string, recursive: boolean = false): { success: boolean; error?: string } {
    const info = this.getParentAndName(p);
    if (!info) return { success: false, error: `rm: cannot remove '${p}': No such file or directory` };
    const node = info.parent.children!.get(info.name);
    if (!node) return { success: false, error: `rm: cannot remove '${p}': No such file or directory` };
    if (node.type !== "directory") return { success: false, error: `rmdir: failed to remove '${p}': Not a directory` };
    if (!recursive && node.children && node.children.size > 0) {
      return { success: false, error: `rmdir: failed to remove '${p}': Directory not empty` };
    }
    info.parent.children!.delete(info.name);
    return { success: true };
  }

  copyFile(src: string, dest: string): { success: boolean; error?: string } {
    const srcNode = this.getNode(src);
    if (!srcNode) return { success: false, error: `cp: cannot stat '${src}': No such file or directory` };
    if (srcNode.type !== "file") return { success: false, error: `cp: omitting directory '${src}'` };

    let destPath = dest;
    const destNode = this.getNode(dest);
    if (destNode && destNode.type === "directory") {
      destPath = `${this.resolvePath(dest)}/${srcNode.name}`;
    }

    return this.createFile(destPath, srcNode.content || "");
  }

  moveFile(src: string, dest: string): { success: boolean; error?: string } {
    const srcNode = this.getNode(src);
    if (!srcNode) return { success: false, error: `mv: cannot stat '${src}': No such file or directory` };

    let destPath = dest;
    const destNode = this.getNode(dest);
    if (destNode && destNode.type === "directory") {
      destPath = `${this.resolvePath(dest)}/${srcNode.name}`;
    }

    const destInfo = this.getParentAndName(destPath);
    if (!destInfo) return { success: false, error: `mv: cannot move '${src}' to '${dest}': No such file or directory` };

    // Clone the node with the new name
    const newNode: FSNode = { ...srcNode, name: destInfo.name };
    if (srcNode.children) {
      newNode.children = new Map(srcNode.children);
    }
    destInfo.parent.children!.set(destInfo.name, newNode);

    // Remove the source
    const srcInfo = this.getParentAndName(src);
    if (srcInfo) srcInfo.parent.children!.delete(srcInfo.name);

    return { success: true };
  }

  find(startPath: string, name?: string): string[] {
    const results: string[] = [];
    const resolved = this.resolvePath(startPath);

    const walk = (node: FSNode, currentPath: string) => {
      if (name) {
        if (node.name.includes(name)) results.push(currentPath);
      } else {
        results.push(currentPath);
      }
      if (node.type === "directory" && node.children) {
        for (const [childName, child] of node.children) {
          walk(child, `${currentPath}/${childName}`);
        }
      }
    };

    const startNode = this.getNode(resolved);
    if (startNode) walk(startNode, resolved);
    return results;
  }

  chmod(p: string, mode: string): { success: boolean; error?: string } {
    const node = this.getNode(p);
    if (!node) return { success: false, error: `chmod: cannot access '${p}': No such file or directory` };
    node.permissions = mode;
    return { success: true };
  }

  /** Apply per-lesson filesystem customizations */
  applyLessonConfig(config: { files?: { path: string; content: string }[]; dirs?: string[] }): void {
    if (config.dirs) {
      for (const dir of config.dirs) {
        this.ensurePath(dir.startsWith("/") ? dir : `${this.home}/${dir}`);
      }
    }
    if (config.files) {
      for (const file of config.files) {
        const fullPath = file.path.startsWith("/") ? file.path : `${this.home}/${file.path}`;
        const parentParts = fullPath.split("/").slice(0, -1).join("/");
        if (parentParts) this.ensurePath(parentParts);
        this.createFileAt(fullPath, file.content);
      }
    }
  }
}

/**
 * 简易语言识别：先看文件扩展名，再看代码特征。
 * 识别错也无妨——验尸官会自行纠偏。
 */
const EXT_MAP: Record<string, string> = {
  js: "JavaScript",
  mjs: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  py: "Python",
  java: "Java",
  c: "C",
  h: "C",
  cpp: "C++",
  cc: "C++",
  hpp: "C++",
  cs: "C#",
  go: "Go",
  rs: "Rust",
  rb: "Ruby",
  php: "PHP",
  swift: "Swift",
  kt: "Kotlin",
  sh: "Shell",
  bat: "Batch",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  vue: "Vue",
  lua: "Lua",
};

export function detectLanguage(code: string, filename?: string): string {
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (EXT_MAP[ext]) return EXT_MAP[ext];
  }
  const head = code.slice(0, 4000);
  if (/^\s*<\?php/m.test(head)) return "PHP";
  if (/\bdef\s+\w+\s*\(|^\s*import\s+\w+\s*$|^\s*from\s+\w+\s+import/m.test(head) && !/function|=>|const\s/.test(head))
    return "Python";
  if (/public\s+(static\s+)?(void|class)|System\.out\.print/.test(head)) return "Java";
  if (/\bfn\s+main\b|\blet\s+mut\b/.test(head)) return "Rust";
  if (/\bfunc\s+\w+\(|fmt\.Print/.test(head)) return "Go";
  if (/#include\s*</.test(head)) return "C/C++";
  if (/:=(\s|$)/.test(head) && /\bfunc\b/.test(head)) return "Go";
  if (/interface\s+\w+\s*\{/.test(head) && /:\s*(string|number)\b/.test(head)) return "TypeScript";
  return "JavaScript";
}

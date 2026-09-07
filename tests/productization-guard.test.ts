import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * FRONTEND PRODUCTIZATION & COPY INTEGRITY GUARD
 * 
 * Protects ALL browser-rendered frontend surfaces from accidental exposure
 * of AI model vendor names (Gemini / Google Gemini) or project status framing (prototype / MVP).
 * 
 * Frontend surfaces scanned:
 * - app/page.tsx (Primary citizen interface)
 * - app/architecture/page.tsx (Product & system architecture view)
 * - app/layout.tsx (Root HTML & metadata layout)
 * - components/** (All client & UI components)
 * - lib/i18n.ts (Bilingual user-facing copy)
 * - lib/uiLabels.ts (UI status & source labels)
 * - lib/data/sampleClaims.ts (Sample scenarios presented to citizens)
 * 
 * Permitted in frontend:
 * - Legitimate technical terminology (Zod, regex, deterministic, heuristic, TypeScript, Next.js, schema, etc.)
 * 
 * Backend implementation (retains internal Gemini integration where needed):
 * - lib/ai/** (Backend AI extraction layer)
 * - app/api/** (Server route handlers)
 * - lib/reconciliation/** (Backend reconciliation engine)
 * - lib/schemas/** (Data validation schemas)
 */

const FORBIDDEN_FRONTEND_TERMS: { pattern: RegExp; term: string }[] = [
  { pattern: /\b(Google\s+)?Gemini(\s+2\.5(\s+Flash)?)?\b/i, term: "Gemini / Google Gemini" },
  { pattern: /\bprototypes?\b/i, term: "prototype" },
  { pattern: /\bMVP\b/i, term: "MVP" },
  { pattern: /\bminimum\s+viable\s+product\b/i, term: "minimum viable product" },
];

function stripCommentsAndImports(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "");
}

function getRenderedFrontendFiles(): string[] {
  const rootDir = path.resolve(__dirname, "..");
  const files: string[] = [];

  const explicitFrontendFiles = [
    path.join(rootDir, "app", "page.tsx"),
    path.join(rootDir, "app", "architecture", "page.tsx"),
    path.join(rootDir, "app", "layout.tsx"),
    path.join(rootDir, "lib", "i18n.ts"),
    path.join(rootDir, "lib", "uiLabels.ts"),
    path.join(rootDir, "lib", "data", "sampleClaims.ts"),
  ];

  for (const file of explicitFrontendFiles) {
    if (fs.existsSync(file)) {
      files.push(file);
    }
  }

  const componentsDir = path.join(rootDir, "components");
  if (fs.existsSync(componentsDir)) {
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    walk(componentsDir);
  }

  return files;
}

describe("Frontend Productization & Sanitization Guard", () => {
  const frontendFiles = getRenderedFrontendFiles();

  it("includes all browser-rendered routes including /architecture and components", () => {
    expect(frontendFiles.length).toBeGreaterThanOrEqual(4);
    expect(frontendFiles.some(f => f.endsWith(path.join("app", "page.tsx")))).toBe(true);
    expect(frontendFiles.some(f => f.endsWith(path.join("app", "architecture", "page.tsx")))).toBe(true);
    expect(frontendFiles.some(f => f.endsWith(path.join("lib", "i18n.ts")))).toBe(true);
  });

  for (const file of frontendFiles) {
    const relativeName = path.relative(path.resolve(__dirname, ".."), file).replace(/\\/g, "/");

    it(`ensures ${relativeName} contains ZERO forbidden Gemini / prototype / MVP references`, () => {
      const content = fs.readFileSync(file, "utf-8");
      const cleaned = stripCommentsAndImports(content);

      const violations: string[] = [];

      for (const { pattern, term } of FORBIDDEN_FRONTEND_TERMS) {
        const matches = cleaned.match(pattern);
        if (matches) {
          violations.push(`Found forbidden term "${term}" (matched "${matches[0]}")`);
        }
      }

      expect(violations, `Violations in ${relativeName}:\n${violations.join("\n")}`).toEqual([]);
    });
  }

});

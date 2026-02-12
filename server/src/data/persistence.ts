// server/src/data/persistence.ts
import fs from "fs";
import path from "path";

function resolveFile(file: string) {
  // si relatif => basé sur la racine projet (process.cwd())
  return path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
}

function ensureDirForFile(absFile: string) {
  const dir = path.dirname(absFile);
  fs.mkdirSync(dir, { recursive: true }); // ✅ crée ./data si absent
}

export function readJsonFile<T>(file: string, fallback: T): T {
  const abs = resolveFile(file);

  try {
    if (!fs.existsSync(abs)) {
      // si fichier absent, on retourne fallback sans erreur
      return fallback;
    }
    const raw = fs.readFileSync(abs, "utf-8").trim();
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch (e) {
    // Si JSON corrompu ou autre, on ne casse pas le serveur
    console.error("❌ readJsonFile failed:", abs, e);
    return fallback;
  }
}

export function writeJsonFile<T>(file: string, data: T): void {
  const abs = resolveFile(file);

  try {
    ensureDirForFile(abs);

    // ✅ écriture atomique : temp puis rename
    const tmp = abs + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, abs);
  } catch (e) {
    console.error("❌ writeJsonFile failed:", abs, e);
    throw e; // laisser remonter → errorHandler
  }
}

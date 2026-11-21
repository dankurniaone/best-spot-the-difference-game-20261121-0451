// Spot the Difference — Photo Detective: the hand-in program.
//
// Node 22, standard library only. It assembles the submission output from
// this repository: the playable game/ directory, the screenshots/ folder,
// and a dossier.json written by the kit's vendored make.fun library, which
// the judge reads. Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const gameDir = join(repoRoot, "game");
const shotsDir = join(repoRoot, "screenshots");

// Fresh output tree: game first, then the screenshots beside it.
mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, "game"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });
}

// The dossier must be byte-for-byte what the vendored library writes from
// the same game/ and screenshots/ the grader will read.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);

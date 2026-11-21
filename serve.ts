// Dev server for Spot the Difference: serves game/ on localhost:8080 so the
// game can be play-tested in a desktop browser exactly as the grader will
// serve its static files. Node 22, standard library only.
//
//   node serve.ts          -> http://localhost:8080
//   node serve.ts 8123     -> http://localhost:8123
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("game/", import.meta.url));
const port = Number(process.argv[2] ?? 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const rel = normalize(path).replace(/^[/\\]+/, "");
    const file = join(root, rel === "" ? "index.html" : rel);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(port, () => {
  console.log(`Spot the Difference at http://localhost:${port}`);
});

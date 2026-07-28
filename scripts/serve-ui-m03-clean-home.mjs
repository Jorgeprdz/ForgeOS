import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const port = Number(process.env.PORT || 4175);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

const server = http.createServer((request, response) => {
  const parsed = new URL(
    request.url || "/",
    `http://${request.headers.host || "127.0.0.1"}`,
  );

  let pathname = decodeURIComponent(parsed.pathname);

  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const absolute = path.resolve(
    root,
    `.${pathname}`,
  );

  if (
    !absolute.startsWith(`${root}${path.sep}`)
    || !fs.existsSync(absolute)
    || !fs.statSync(absolute).isFile()
  ) {
    response.writeHead(404, {
      "content-type": "text/plain; charset=utf-8",
    });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type":
      types.get(path.extname(absolute).toLowerCase())
      || "application/octet-stream",
    "cache-control": "no-store",
  });

  fs.createReadStream(absolute).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `UI_M03_CLEAN_SERVER=http://127.0.0.1:${port}\n`,
  );
});

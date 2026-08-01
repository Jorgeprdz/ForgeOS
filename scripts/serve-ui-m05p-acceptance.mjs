import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const defaultDocument =
  "/docs/static-preview/forge-alive-material3/index.html";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
]);

function send(response, status, body) {
  const payload = Buffer.from(body);
  response.writeHead(status, {
    "cache-control": "no-store, max-age=0",
    "content-length": payload.length,
    "content-type": "text/plain; charset=utf-8",
  });
  response.end(payload);
}

function resolveTarget(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const requested = url.pathname === "/"
    ? defaultDocument
    : decodeURIComponent(url.pathname);
  const target = path.resolve(root, `.${requested}`);
  const rootPrefix = `${root}${path.sep}`;
  if (target !== root && !target.startsWith(rootPrefix)) return null;
  return target;
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "METHOD_NOT_ALLOWED\n");
    return;
  }

  let target = resolveTarget(request.url || "/");
  if (!target) {
    send(response, 403, "FORBIDDEN\n");
    return;
  }

  let stats;
  try {
    stats = fs.statSync(target);
  } catch {
    send(response, 404, "NOT_FOUND\n");
    return;
  }

  if (stats.isDirectory()) {
    target = path.join(target, "index.html");
    try {
      stats = fs.statSync(target);
    } catch {
      send(response, 404, "NOT_FOUND\n");
      return;
    }
  }

  if (!stats.isFile()) {
    send(response, 404, "NOT_FOUND\n");
    return;
  }

  const extension = path.extname(target).toLowerCase();
  response.writeHead(200, {
    "cache-control": "no-store, max-age=0",
    "content-length": stats.size,
    "content-type": mimeTypes.get(extension) || "application/octet-stream",
    "x-content-type-options": "nosniff",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(target)
    .on("error", () => response.destroy())
    .pipe(response);
});

server.listen(port, host, () => {
  console.log("UI_M05P_STATIC_SERVER=READY");
  console.log(`URL=http://${host}:${port}${defaultDocument}?nav=cotizaciones`);
});

const close = () => server.close(() => {
  console.log("UI_M05P_STATIC_SERVER=STOPPED");
});
process.on("SIGINT", close);
process.on("SIGTERM", close);

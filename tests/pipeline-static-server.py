from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


class PipelineAcceptanceHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPOSITORY_ROOT), **kwargs)

    def do_GET(self):
        # The repository root index boots the canonical application and redirects.
        # Browser acceptance needs an inert same-origin document before setContent().
        if self.path == "/" or self.path.startswith("/?"):
            self.path = "/package.json"
        super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 4173), PipelineAcceptanceHandler)
    server.serve_forever()

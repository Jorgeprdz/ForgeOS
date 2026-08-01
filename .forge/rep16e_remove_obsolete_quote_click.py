from pathlib import Path
import traceback

source_path = Path("tools/forge-ui-visual-diagnostic.mjs")
status_path = Path(".forge/rep16e_remove_obsolete_quote_click.status")

old = '''    result.routes.quotesEvidenceOpen = await capture(
      page,
      directory,
      "05b-quotes-evidence-open",
    );
    await page.locator("[data-quote-technical-evidence] summary").click();
'''

try:
    source = source_path.read_text()
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"obsolete quote evidence click: expected 1 match, found {count}")
    source_path.write_text(source.replace(old, "", 1))
    status_path.write_text("PASS\n")
except Exception:
    status_path.write_text("FAIL\n" + traceback.format_exc())

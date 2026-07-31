import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(
  new URL(
    "../tools/termux/forge_cartera_001b_remote_acceptance_archforge.sh",
    import.meta.url,
  ),
  "utf8",
);

test("wrapper enters ArchForge with the maintained launcher contract", () => {
  assert.match(script, /\/data\/data\/com\.termux\/files\/usr\/bin\/archforge/);
  assert.match(script, /"\$ARCHFORGE_LAUNCHER" -- bash -lc/);
});

test("wrapper updates the acceptance branch before entering ArchForge", () => {
  const pull = script.indexOf('git pull --ff-only origin "$BRANCH"');
  const arch = script.indexOf('"$ARCHFORGE_LAUNCHER" -- bash -lc');
  assert.ok(pull >= 0 && arch > pull);
});

test("wrapper runs the existing acceptance runner inside ArchForge", () => {
  assert.match(
    script,
    /bash tools\/termux\/forge_cartera_001b_remote_acceptance\.sh/,
  );
});

test("wrapper autocopies the complete outer log", () => {
  assert.match(script, /termux-clipboard-set < "\$LOG_FILE"/);
  assert.match(script, /EVIDENCE_PATH=/);
  assert.doesNotMatch(script, /\bexit\b/);
});

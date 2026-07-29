import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const roadmap =
  readFileSync(
    "docs/roadmap/" +
      "NASH_CONVERSATION_DESK_ROADMAP_001.md",
    "utf8",
  );

const scope =
  readFileSync(
    "docs/architecture/source-truth/" +
      "NASH_CONVERSATION_DESK_COMPOSER_SCOPE_001.md",
    "utf8",
  );

test(
  "Milestone 1 uses a WhatsApp-style composer",
  () => {
    assert.match(
      roadmap,
      /WhatsApp-style composer/,
    );
    assert.match(
      roadmap,
      /type directly/,
    );
    assert.match(
      roadmap,
      /paste a single objection/,
    );
  },
);

test(
  "Milestone 1 includes paperclip screenshot upload",
  () => {
    assert.match(
      roadmap,
      /paperclip button/,
    );
    assert.match(
      roadmap,
      /upload one screenshot/,
    );
    assert.match(
      roadmap,
      /drag-and-drop screenshot/,
    );
  },
);

test(
  "composer supports text paste and image input",
  () => {
    assert.match(
      scope,
      /Type a message or objection/,
    );
    assert.match(
      scope,
      /Paste a message or full conversation/,
    );
    assert.match(
      scope,
      /Upload one conversation screenshot/,
    );
    assert.match(
      scope,
      /image\/\*/,
    );
  },
);

test(
  "composer requires explicit analysis",
  () => {
    assert.match(
      scope,
      /Analysis begins only through the explicit/,
    );
    assert.match(
      scope,
      /Uploading an image does not begin analysis automatically/,
    );
    assert.match(
      scope,
      /Enter creates a new line/,
    );
  },
);

test(
  "composer preserves screenshot uncertainty",
  () => {
    assert.match(
      scope,
      /must not be invented/,
    );
    assert.match(
      scope,
      /must not be guessed silently/,
    );
    assert.match(
      scope,
      /shown for user correction/,
    );
  },
);

test(
  "composer cannot send or mutate productive systems",
  () => {
    assert.match(
      scope,
      /No WhatsApp message is sent/,
    );
    assert.match(
      scope,
      /does not send, schedule, update Pipeline/,
    );
  },
);

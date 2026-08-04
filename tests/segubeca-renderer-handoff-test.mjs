import assert from "node:assert/strict";

function makeNode(tagName = "div") {
  return {
    tagName: String(tagName).toUpperCase(),
    id: "",
    className: "",
    textContent: "",
    innerHTML: "",
    dataset: {},
    style: {},
    children: [],
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    append(...children) {
      this.children.push(...children);
    },
    setAttribute(name, value) {
      this[name] = String(value);
    },
    getAttribute(name) {
      return this[name] ?? null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
}

const head = makeNode("head");
const body = makeNode("body");

globalThis.document = {
  head,
  body,
  createElement: makeNode,
  getElementById() {
    return null;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  }
};

globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
};

globalThis.addEventListener ||= () => {};
globalThis.removeEventListener ||= () => {};
globalThis.dispatchEvent ||= () => true;

const {
  usesSegubecaStructuredDashboardR14F
} = await import(
  `../docs/static-preview/quote-runtime/forge-benefit-summary-renderer.js?r14f=${Date.now()}`
);

assert.equal(
  usesSegubecaStructuredDashboardR14F({
    productFamily: "segubeca",
    nativeResult: {
      productFamily: "segubeca",
      benefitSummary: { blocks: [{ type: "education_goal", lines: [] }] }
    }
  }),
  true
);

assert.equal(
  usesSegubecaStructuredDashboardR14F({
    productFamily: "segubeca",
    nativeResult: { productFamily: "segubeca" }
  }),
  false
);

assert.equal(
  usesSegubecaStructuredDashboardR14F({
    productFamily: "imagina_ser",
    nativeResult: {
      productFamily: "imagina_ser",
      benefitSummary: { blocks: [] }
    }
  }),
  false
);

console.log("PASS SeguBeca renderer fallback overwrite guard R14F");

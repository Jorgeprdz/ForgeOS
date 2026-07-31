const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const STYLE_SELECTOR = "[data-pipeline-action-identity-styles]";
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.action-identity");

const ACTIONS = Object.freeze([
  Object.freeze({
    selector: "[data-prepare-productive-message]",
    brand: "whatsapp",
    icon: "whatsapp",
    title: "Preparar mensaje de WhatsApp",
    aria: name => `Preparar mensaje de WhatsApp para ${name}`,
    svg: `
      <svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M12 2a9.75 9.75 0 0 0-8.44 14.64L2.25 21.5l4.97-1.3A9.75 9.75 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.93-1.07l-.38-.22-2.95.77.79-2.87-.25-.4A7.75 7.75 0 1 1 12 19.5Zm4.25-5.8c-.23-.12-1.37-.68-1.58-.75-.21-.08-.37-.12-.52.12-.16.23-.6.75-.74.9-.14.16-.27.18-.5.06-.24-.12-1-.36-1.9-1.15a7.1 7.1 0 0 1-1.32-1.64c-.14-.23-.02-.36.1-.48.1-.1.23-.27.35-.4.12-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.73-.19-.45-.38-.39-.52-.4h-.44c-.16 0-.41.06-.62.3-.21.23-.81.79-.81 1.93s.83 2.24.95 2.4c.12.15 1.63 2.48 3.94 3.48.55.24.98.38 1.32.49.55.17 1.05.15 1.45.09.44-.07 1.37-.56 1.56-1.1.2-.54.2-1 .14-1.1-.06-.1-.21-.16-.45-.28Z"/>
      </svg>`,
  }),
  Object.freeze({
    selector: ".pipeline-module__action--call",
    brand: "phone",
    icon: "phone",
    title: "Llamar",
    aria: name => `Llamar a ${name}`,
    svg: `
      <svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/>
      </svg>`,
  }),
  Object.freeze({
    selector: ".pipeline-module__action--calendar",
    brand: "calendar",
    icon: "calendar",
    title: "Calendar no conectado",
    aria: name => `Agendar en Calendar para ${name}; no conectado`,
    svg: `
      <svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM7 14a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 7 14Zm5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z"/>
      </svg>`,
  }),
]);

function ensureStyles(documentRef) {
  if (documentRef.querySelector(STYLE_SELECTOR)) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./pipeline-action-identity.css?v=pipeline-action-identity-001",
    import.meta.url,
  );
  link.dataset.pipelineActionIdentityStyles = "true";
  documentRef.head.append(link);
}

function prospectName(action) {
  return action.closest("[data-productive-prospect-card]")
    ?.querySelector("[data-productive-card-identity] strong")
    ?.textContent
    ?.trim() || "este prospecto";
}

function ensureAction(action, contract) {
  action.dataset.pipelineActionBrand = contract.brand;
  action.title = contract.title;
  action.setAttribute("aria-label", contract.aria(prospectName(action)));

  let icon = action.querySelector(":scope > [data-pipeline-action-icon]");
  if (!icon) {
    icon = action.ownerDocument.createElement("span");
    icon.className = "pipeline-module__action-icon";
    icon.dataset.pipelineActionIcon = contract.icon;
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = contract.svg;
    action.prepend(icon);
  }
}

function apply(root) {
  for (const contract of ACTIONS) {
    root.querySelectorAll(contract.selector).forEach(action => ensureAction(action, contract));
  }
  root.dataset.pipelineActionIdentity = "ready";
  root.ownerDocument.documentElement.dataset.pipelineActionIdentity = "ready";
}

export function installPipelineActionIdentity(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  if (!documentRef) return Object.freeze({ installed: false });

  ensureStyles(documentRef);
  let root = documentRef.querySelector(ROOT_SELECTOR);
  if (root?.[INSTALL_KEY]) return root[INSTALL_KEY];

  let rootObserver;
  let documentObserver;

  const connectRoot = candidate => {
    if (!candidate || candidate === root && rootObserver) return;
    rootObserver?.disconnect();
    root = candidate;
    apply(root);
    rootObserver = new MutationObserver(() => apply(root));
    rootObserver.observe(root, { childList: true, subtree: true });
  };

  connectRoot(root);
  if (!root) {
    documentObserver = new MutationObserver(() => {
      const candidate = documentRef.querySelector(ROOT_SELECTOR);
      if (!candidate) return;
      connectRoot(candidate);
      documentObserver.disconnect();
    });
    documentObserver.observe(documentRef.documentElement, { childList: true, subtree: true });
  }

  const authority = Object.freeze({
    installed: true,
    reapply() {
      const candidate = documentRef.querySelector(ROOT_SELECTOR);
      if (candidate) connectRoot(candidate);
      if (root) apply(root);
    },
    destroy() {
      rootObserver?.disconnect();
      documentObserver?.disconnect();
      root?.removeAttribute("data-pipeline-action-identity");
      documentRef.documentElement.removeAttribute("data-pipeline-action-identity");
    },
  });

  if (root) root[INSTALL_KEY] = authority;
  return authority;
}

installPipelineActionIdentity();

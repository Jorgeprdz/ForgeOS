(() => {
  "use strict";

  const sheet = document.querySelector(".alfred-sheet");
  const toast = document.querySelector(".toast");
  const input = document.querySelector(".alfred-input input");
  const suggestions = document.querySelector(".suggestions");
  const globalAlfred = document.querySelector(
    '[data-alfred-scope="global"]',
  );
  const contextualAlfred = document.querySelector(
    '[data-alfred-scope="contextual"]',
  );

  function setAlfredState(globalState, contextualState = globalState) {
    if (globalAlfred) globalAlfred.dataset.alfredState = globalState;
    if (contextualAlfred) {
      contextualAlfred.dataset.alfredState = contextualState;
    }
  }

  setAlfredState("idle", "thinking");

  function setAlfred(open) {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("sheet-open", open);
    setAlfredState(
      open ? "action" : "idle",
      open ? "action" : "thinking",
    );

    if (open) {
      if (suggestions) {
        suggestions.scrollTo({ left: 0, behavior: "instant" });
      }
      syncVisualViewport();
    } else {
      input.blur();
      document.body.classList.remove("keyboard-open");
    }
  }

  function syncVisualViewport() {
    const viewport = window.visualViewport;
    const viewportHeight = viewport
      ? viewport.height
      : window.innerHeight;
    const viewportTop = viewport ? viewport.offsetTop : 0;
    const keyboardInset = Math.max(
      0,
      window.innerHeight - viewportHeight - viewportTop,
    );

    document.documentElement.style.setProperty(
      "--forge-visual-viewport-height",
      `${viewportHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--forge-keyboard-inset",
      `${keyboardInset}px`,
    );
    document.body.classList.toggle(
      "keyboard-open",
      keyboardInset > 120,
    );
  }

  syncVisualViewport();

  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      syncVisualViewport,
    );
    window.visualViewport.addEventListener(
      "scroll",
      syncVisualViewport,
    );
  }

  window.addEventListener("resize", syncVisualViewport);

  document.querySelectorAll("[data-open-alfred]").forEach((button) => {
    button.addEventListener("click", () => setAlfred(true));
  });

  document.querySelectorAll("[data-close-alfred]").forEach((button) => {
    button.addEventListener("click", () => setAlfred(false));
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
      });
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
      toast.textContent =
        `${button.dataset.nav}: vista de demostración`;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 1800);
    });
  });

  document.querySelectorAll(".suggestions button").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent;
      input.focus({ preventScroll: true });
      setAlfredState("action", "action");
      syncVisualViewport();
    });
  });

  input.addEventListener("focus", syncVisualViewport);
  input.addEventListener("blur", () => {
    window.setTimeout(syncVisualViewport, 120);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setAlfred(false);
  });

  document.documentElement.dataset.forgeCleanHomeReady = "true";
})();

(() => {
  "use strict";

  const app = document.querySelector("[data-forge-clean-app]");
  const sheet = document.querySelector("[data-alfred-sheet]");
  const toast = document.querySelector("[data-toast]");

  if (!app || !sheet || !toast) {
    return;
  }

  const setRoute = (route) => {
    app.querySelectorAll("[data-route]").forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.route === route,
      );
    });

    if (route !== "inicio") {
      showToast(`${route}: pendiente de migración funcional`);
    }
  };

  let toastTimer = null;

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  const openAlfred = () => {
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeAlfred = () => {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  app.addEventListener("click", (event) => {
    const route = event.target.closest("[data-route]");
    const localAction = event.target.closest("[data-local-action]");
    const open = event.target.closest("[data-alfred-open]");
    const close = event.target.closest("[data-alfred-close]");

    if (route) {
      setRoute(route.dataset.route);
      return;
    }

    if (open) {
      openAlfred();
      return;
    }

    if (close) {
      closeAlfred();
      return;
    }

    if (localAction) {
      showToast("Vista visual: acción productiva aún no conectada");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAlfred();
    }
  });

  document.documentElement.dataset.forgeCleanHomeReady = "true";

  window.dispatchEvent(
    new CustomEvent("forge:clean-home-ready", {
      detail: Object.freeze({
        source: "ui-m03-clean-home-rewrite",
        legacyAssetsLoaded: false,
        productiveActionsConnected: false,
      }),
    }),
  );
})();

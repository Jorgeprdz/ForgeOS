(() => {
  "use strict";

  const queryKey = "forgeUi";
  const enabledValue = "material3";
  const root = document.documentElement;
  const params = new URLSearchParams(window.location.search);
  const requested = params.get(queryKey);
  const enabled = requested === enabledValue;

  if (enabled) {
    root.setAttribute("data-forge-ui-runtime", enabledValue);
    root.setAttribute("data-forge-theme", "dark");
  }

  const state = Object.freeze({
    enabled,
    mode: enabled ? enabledValue : "legacy",
    queryKey,
    requested,
    source: requested === null ? "default" : "query",
  });

  Object.defineProperty(window, "ForgeUiRuntimeFlag", {
    configurable: false,
    enumerable: true,
    value: state,
    writable: false,
  });

  if (
    typeof window.dispatchEvent === "function"
    && typeof window.CustomEvent === "function"
  ) {
    window.dispatchEvent(
      new window.CustomEvent(
        "forge:ui-runtime-flag",
        { detail: state },
      ),
    );
  }
})();

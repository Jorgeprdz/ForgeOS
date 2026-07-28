(() => {
  "use strict";

  const state = {
    navigationEvents: [],
    alfredEvents: [],
    ready: true,
  };

  window.addEventListener(
    "forge:material3-navigation",
    (event) => {
      state.navigationEvents.push(event.detail);
    },
  );

  window.addEventListener(
    "forge:material3-alfred",
    (event) => {
      state.alfredEvents.push(event.detail);
    },
  );

  Object.defineProperty(
    window,
    "UiM02AcceptanceFixture",
    {
      configurable: false,
      enumerable: true,
      value: state,
      writable: false,
    },
  );

  document.documentElement.setAttribute(
    "data-ui-m02-fixture-ready",
    "true",
  );
})();

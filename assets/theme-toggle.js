(function () {
  var storageKey = "course-theme";
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      var stored = window.localStorage.getItem(storageKey);
      return stored === "light" || stored === "dark" ? stored : "";
    } catch (error) {
      return "";
    }
  }

  function resolveTheme(explicitTheme) {
    if (explicitTheme === "light" || explicitTheme === "dark") {
      return explicitTheme;
    }

    return darkQuery.matches ? "dark" : "light";
  }

  function applyTheme(explicitTheme) {
    if (explicitTheme === "light" || explicitTheme === "dark") {
      document.documentElement.dataset.theme = explicitTheme;
      return;
    }

    document.documentElement.removeAttribute("data-theme");
  }

  function persistTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Browsers can disable localStorage; the current page still updates.
    }
  }

  function updateButtons(explicitTheme) {
    var resolvedTheme = resolveTheme(explicitTheme);
    var nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    var label = nextTheme === "dark" ? "切换深色模式" : "切换浅色模式";

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.dataset.resolvedTheme = resolvedTheme;
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
    });
  }

  function setTheme(theme) {
    persistTheme(theme);
    applyTheme(theme);
    updateButtons(theme);
  }

  function initThemeToggle() {
    var currentTheme = readStoredTheme();
    applyTheme(currentTheme);
    updateButtons(currentTheme);

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-theme-toggle]");
      if (!button) {
        return;
      }

      var nextTheme = resolveTheme(readStoredTheme()) === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });

    darkQuery.addEventListener("change", function () {
      updateButtons(readStoredTheme());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
  } else {
    initThemeToggle();
  }
})();

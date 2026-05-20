const themeToggle = document.querySelector(".theme-toggle");
let fallbackTheme = "dark";

function getSavedTheme() {
   try {
      return window.localStorage?.getItem("site-theme") || fallbackTheme;
   } catch (error) {
      return fallbackTheme;
   }
}

function saveTheme(theme) {
   fallbackTheme = theme;
   try {
      window.localStorage?.setItem("site-theme", theme);
   } catch (error) {
      // Storage can be unavailable in embedded preview browsers.
   }
}

const savedTheme = getSavedTheme();

function setTheme(theme) {
   if (!themeToggle) return;

   const isLight = theme === "light";
   document.body.dataset.theme = theme;
   themeToggle.setAttribute("aria-pressed", String(isLight));
   themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
   themeToggle.innerHTML = isLight
      ? '<i class="ri-sun-line"></i><span>Light</span>'
      : '<i class="ri-moon-clear-line"></i><span>Dark</span>';
   saveTheme(theme);
}

setTheme(savedTheme);
themeToggle?.addEventListener("click", () => {
   setTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

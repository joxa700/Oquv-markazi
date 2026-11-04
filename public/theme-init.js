(function () {
  try {
    var persisted = JSON.parse(localStorage.getItem('persist:nurtalim-root') || 'null');
    var settings = persisted && persisted.settings ? JSON.parse(persisted.settings) : null;
    if (settings && settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  } catch (error) {
    /* Ignore malformed persisted state. */
  }
})();

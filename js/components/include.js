/**
 * Data-include loader: replace elements with [data-include] by fetching the given URL.
 * Single pass only (no nested components). Use with a local server (e.g. npx serve) so fetch() works.
 */
(function() {
  function include(container, url) {
    if (!container.parentNode) return;
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        if (!container.parentNode) return;
        container.outerHTML = html;
      })
      .catch(function(err) {
        window.AppLogger.warn('[SYSTEM]', 'Include failed for ' + url, err);
      });
  }

  function runIncludes() {
    document.querySelectorAll('[data-include]').forEach(function(el) {
      var url = el.getAttribute('data-include');
      if (url) include(el, url);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIncludes);
  } else {
    runIncludes();
  }
})();

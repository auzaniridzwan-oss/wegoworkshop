/**
 * Login overlay: delegates to Alpine store. Kept for API compatibility.
 */
(function() {
  function open() {
    if (window.Alpine && Alpine.store('header')) Alpine.store('header').openLogin();
  }
  function close() {
    if (window.Alpine && Alpine.store('header')) Alpine.store('header').closeLogin();
  }
  window.LoginOverlay = { open: open, close: close };
})();

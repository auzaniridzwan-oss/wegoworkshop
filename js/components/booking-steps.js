/**
 * Booking steps: active class and hrefs are set by Alpine in booking-steps.html.
 * This script is kept for any listeners that depend on the nav being in the DOM;
 * Alpine x-init dispatches 'booking-steps-ready'.
 */
(function() {
  function init() {
    var nav = document.getElementById('ux_booking_steps');
    if (!nav) return false;
    return true;
  }
  function tryInit() {
    if (init()) return;
    var observer = new MutationObserver(function() {
      if (init()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();

/**
 * Booking steps nav: set each step link href to the step page (state is in localStorage).
 * Marks the current page's step as .active. Runs when #ux_booking_steps appears (after include).
 */
(function() {
  function init() {
    var nav = document.getElementById('ux_booking_steps');
    if (!nav) return false;
    var links = nav.querySelectorAll('a[id^="step-"]');
    if (links.length === 0) return false; /* placeholder not yet replaced by component HTML */
    var currentPage = (window.location.pathname.split('/').pop() || '').split('?')[0];
    var pageById = {
      'step-baggage': 'booking-baggage.html',
      'step-seats': 'booking-seats.html',
      'step-meals': 'booking-meals.html',
      'step-others': 'booking-ancillaries.html',
      'step-passenger': 'booking-passenger.html',
      'step-review': 'booking-review.html',
      'step-payment': 'booking-payment.html'
    };
    links.forEach(function(a) {
      var id = a.id;
      var page = pageById[id];
      if (page) {
        a.href = page;
        if (currentPage === page) a.classList.add('active');
        else a.classList.remove('active');
      }
    });
    try { window.dispatchEvent(new CustomEvent('booking-steps-ready')); } catch (e) {}
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

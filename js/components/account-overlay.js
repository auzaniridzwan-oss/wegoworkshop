/**
 * Account overlay: resetSession and updateHeaderAuthVisibility. UI is handled by Alpine in header.
 */
(function() {
  function getAccountLink() {
    return document.getElementById('ux_account');
  }

  function getLoginLink() {
    return document.getElementById('ux_login');
  }

  function updateHeaderAuthVisibility() {
    var accountEl = getAccountLink();
    var loginEl = getLoginLink();
    if (!accountEl || !loginEl) return;
    var loggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
    accountEl.classList.toggle('header-account-hidden', !loggedIn);
    accountEl.setAttribute('aria-expanded', 'false');
    loginEl.classList.toggle('header-login-hidden', loggedIn);
  }

  function resetSession() {
    if (typeof logout === 'function') logout();
    try {
      sessionStorage.removeItem('wego_notifications_initialized');
      sessionStorage.setItem('wego_hero_carousel_reset', '1');
    } catch (err) {}
    if (window.Notifications) {
      if (typeof window.Notifications.reset === 'function') window.Notifications.reset();
    }
    try {
      localStorage.removeItem('wego_search_params');
      localStorage.removeItem('wego_booking_state');
    } catch (err) {}
    updateHeaderAuthVisibility();
    window.location.href = 'home.html';
  }

  function tryInit() {
    updateHeaderAuthVisibility();
  }

  function observeForHeader() {
    tryInit();
    var observer = new MutationObserver(function() {
      if (getAccountLink()) tryInit();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeForHeader);
  } else {
    observeForHeader();
  }

  window.AccountOverlay = {
    open: function() {
      if (window.Alpine && Alpine.store('header')) Alpine.store('header').openAccount();
    },
    close: function() {
      if (window.Alpine && Alpine.store('header')) Alpine.store('header').closeAccount();
    },
    updateHeaderAuthVisibility: updateHeaderAuthVisibility,
    resetSession: resetSession
  };
})();

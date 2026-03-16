/**
 * Account overlay: show/hide #ux_account vs #ux_login by login state.
 * When #ux_account is clicked, show overlay with user profile. Depends on auth-demo.js.
 */
(function() {
  var overlay = null;
  var modalInstance = null;
  var bound = false;

  function getOverlay() {
    return document.getElementById('account-overlay');
  }

  function getAccountLink() {
    return document.getElementById('ux_account');
  }

  function getLoginLink() {
    return document.getElementById('ux_login');
  }

  /** Show account link and hide login link when logged in; opposite when logged out. */
  function updateHeaderAuthVisibility() {
    var accountEl = getAccountLink();
    var loginEl = getLoginLink();
    if (!accountEl || !loginEl) return;
    var loggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
    accountEl.classList.toggle('header-account-hidden', !loggedIn);
    accountEl.setAttribute('aria-expanded', 'false');
    loginEl.classList.toggle('header-login-hidden', loggedIn);
  }

  function maskCardNumber(num) {
    if (!num || typeof num !== 'string') return '–';
    var digits = num.replace(/\D/g, '');
    if (digits.length < 4) return '–';
    return '**** **** **** ' + digits.slice(-4);
  }

  function populateProfile() {
    var user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    var nameEl = document.getElementById('account-profile-name');
    var phoneEl = document.getElementById('account-profile-phone');
    var emailEl = document.getElementById('account-profile-email');
    var passportEl = document.getElementById('account-profile-passport');
    var cardNumberEl = document.getElementById('account-profile-card-number');
    var cardNameEl = document.getElementById('account-profile-card-name');
    var expiryEl = document.getElementById('account-profile-expiry');
    var addressEl = document.getElementById('account-profile-address');
    if (nameEl) nameEl.textContent = user && user.name ? user.name : '–';
    if (phoneEl) phoneEl.textContent = user && user.phone ? user.phone : '–';
    if (emailEl) emailEl.textContent = user && user.email ? user.email : '–';
    if (passportEl) passportEl.textContent = user && user.passport ? user.passport : '–';
    if (cardNumberEl) cardNumberEl.textContent = user && user.cardNumber ? maskCardNumber(user.cardNumber) : '–';
    if (cardNameEl) cardNameEl.textContent = user && user.cardName ? user.cardName : '–';
    if (expiryEl) expiryEl.textContent = user && user.expiry ? user.expiry : '–';
    if (addressEl) addressEl.textContent = user && user.address ? user.address : '–';
  }

  function open() {
    overlay = getOverlay();
    if (!overlay) return;
    populateProfile();
    if (!modalInstance && typeof Modal === 'function') {
      modalInstance = new Modal(overlay, { closable: true });
    }
    if (modalInstance) modalInstance.show();
    else overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    var trigger = getAccountLink();
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay = overlay || getOverlay();
    if (!overlay) return;
    if (modalInstance) modalInstance.hide();
    else overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    var trigger = getAccountLink();
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function bind() {
    overlay = getOverlay();
    if (!overlay || bound) return;
    bound = true;

    var logoutBtn = document.getElementById('account-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        if (typeof logout === 'function') logout();
        close();
        updateHeaderAuthVisibility();
      });
    }

    var closeBtn = overlay.querySelector('.account-close');
    if (closeBtn) closeBtn.addEventListener('click', close);

  }

  /**
   * Reset session: logout, restore notifications and hero carousel to demo state, clear booking/search storage, then go to SPA home.
   */
  function resetSession() {
    if (typeof logout === 'function') logout();
    try {
      sessionStorage.removeItem('wego_notifications_initialized');
      sessionStorage.setItem('wego_hero_carousel_reset', '1');
    } catch (err) {}
    if (window.Notifications) {
      if (typeof window.Notifications.reset === 'function') window.Notifications.reset();
      if (typeof window.Notifications.renderList === 'function') window.Notifications.renderList();
    }
    try {
      localStorage.removeItem('wego_search_params');
      localStorage.removeItem('wego_booking_state');
      localStorage.removeItem('wego_braze_events');
    } catch (err) {}
    if (window.BrazePanel && typeof window.BrazePanel.render === 'function') {
      window.BrazePanel.render();
    }
    updateHeaderAuthVisibility();
    window.location.href = 'index.html';
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('#ux_account')) {
      e.preventDefault();
      bind();
      open();
    } else if (e.target.closest('#ux_reset')) {
      e.preventDefault();
      resetSession();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var o = getOverlay();
      if (o && !o.classList.contains('hidden')) close();
    }
  });

  window.addEventListener('login-overlay-logged-in', function() {
    updateHeaderAuthVisibility();
  });

  function tryInit() {
    updateHeaderAuthVisibility();
    if (getOverlay()) bind();
  }

  function observeForHeader() {
    tryInit();
    var observer = new MutationObserver(function() {
      if (getAccountLink()) {
        tryInit();
      }
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
    open: open,
    close: close,
    updateHeaderAuthVisibility: updateHeaderAuthVisibility,
    resetSession: resetSession
  };
})();

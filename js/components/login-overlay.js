/**
 * Login overlay component: open/close, demo user login, invoke from #ux_login or programmatically.
 * Depends on auth-demo.js. Dispatches 'login-overlay-logged-in' with user detail on login.
 */
(function() {
  var overlay = null;
  var bound = false;

  function getOverlay() {
    return document.getElementById('login-overlay');
  }

  function populateDemoProfile() {
    if (typeof getDemoUser !== 'function') return;
    var user = getDemoUser();
    var nameEl = document.getElementById('demo-name');
    var phoneEl = document.getElementById('demo-phone');
    var emailEl = document.getElementById('demo-email');
    var passportEl = document.getElementById('demo-passport');
    var externalIdEl = document.getElementById('demo-external-id');
    if (nameEl) nameEl.textContent = user.name || '–';
    if (phoneEl) phoneEl.textContent = user.phone || '–';
    if (emailEl) emailEl.textContent = user.email || '–';
    if (passportEl) passportEl.textContent = user.passport ? 'Passport: ' + user.passport : '–';
    if (externalIdEl) externalIdEl.textContent = user.externalId || '–';
  }

  function open() {
    overlay = getOverlay();
    if (!overlay) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    populateDemoProfile();
  }

  function close() {
    overlay = overlay || getOverlay();
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function bind() {
    overlay = getOverlay();
    if (!overlay || bound) return;
    bound = true;
    populateDemoProfile();

    var demoBtn = document.getElementById('login-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', function() {
        if (typeof loginAsDemo === 'function') loginAsDemo();
        var user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        try {
          window.dispatchEvent(new CustomEvent('login-overlay-logged-in', { detail: user }));
        } catch (e) {}
        close();
      });
    }

    var backdrop = overlay.querySelector('.login-backdrop');
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function onEscape(e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) close();
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target.id === 'ux_login' || e.target.closest('#ux_login')) {
      e.preventDefault();
      bind();
      open();
    }
  });

  function tryBind() {
    if (getOverlay()) {
      bind();
      return true;
    }
    return false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      tryBind();
      var observer = new MutationObserver(function() {
        if (tryBind()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    tryBind();
    var observer = new MutationObserver(function() {
      if (tryBind()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.LoginOverlay = { open: open, close: close };
})();

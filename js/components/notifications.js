/**
 * Notifications slideout: messages from localStorage, persist across pages.
 * Open/close when #ux_notifications is clicked; opening overlay rerenders from storage.
 * Reset to initial demo state only on first page load (session).
 */
(function() {
  var STORAGE_KEY = 'wego_notifications';
  var INIT_FLAG = 'wego_notifications_initialized';
  var drawerInstance = null;
  var DEMO_MESSAGES = [
    { id: 'n1', text: 'Your flight to Kuala Lumpur is confirmed.' },
    { id: 'n2', text: 'Check-in opens in 24 hours for your upcoming trip.' },
    { id: 'n3', text: 'New deals available for Southeast Asia destinations.' },
    { id: 'n4', text: 'You have a booking awaiting payment.' }
  ];

  function formatTimestamp(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function getOverlay() {
    return document.getElementById('ux_notifications_overlay');
  }

  function getBackdrop() {
    return document.querySelector('.notifications-backdrop');
  }

  function getTrigger() {
    return document.getElementById('ux_notifications');
  }

  function getList() {
    return document.querySelector('.notifications-list');
  }

  function getStoredMessages() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setStoredMessages(messages) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }

  /** Reset notifications to the initial demo state. Call only on first page load. */
  function reset() {
    var now = new Date().toISOString();
    var withTimestamps = DEMO_MESSAGES.map(function(m) {
      return { id: m.id, text: m.text, timestamp: now };
    });
    setStoredMessages(withTimestamps);
    try {
      sessionStorage.setItem(INIT_FLAG, '1');
    } catch (e) {}
  }

  var previousCount = -1;
  var ANIMATION_CLASS = 'notifications-balloon--new';
  var hasInitialized = false;

  function updateNotificationsCount() {
    var list = getList();
    var balloon = document.getElementById('ux_notifications_count');
    if (!list || !balloon) return;
    var count = list.querySelectorAll('li.notifications-list-item').length;
    balloon.textContent = String(count);
    balloon.style.display = count > 0 ? '' : 'none';
    if (count > previousCount && previousCount >= 0) {
      balloon.classList.remove(ANIMATION_CLASS);
      balloon.offsetHeight;
      balloon.classList.add(ANIMATION_CLASS);
      balloon.addEventListener('animationend', function removeAnim() {
        balloon.removeEventListener('animationend', removeAnim);
        balloon.classList.remove(ANIMATION_CLASS);
      });
    }
    previousCount = count;
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** Rerender the notifications list from localStorage. Newest at top, oldest at bottom. */
  function renderList() {
    var list = getList();
    if (!list) return;
    var messages = getStoredMessages().slice().reverse();
    list.innerHTML = '';
    messages.forEach(function(msg) {
      var li = document.createElement('li');
      li.className = 'notifications-list-item flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3';
      li.setAttribute('data-notification-id', msg.id);
      var timeHtml = msg.timestamp
        ? '<span class="notifications-item-time mt-1 block text-xs text-gray-500">' + escapeHtml(formatTimestamp(msg.timestamp)) + '</span>'
        : '';
      li.innerHTML =
        '<div class="notifications-item-content min-w-0 flex-1">' +
          '<span class="notifications-item-text text-sm text-gray-800">' + escapeHtml(msg.text) + '</span>' +
          timeHtml +
        '</div>' +
        '<button type="button" class="notifications-item-dismiss rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Dismiss notification"><i class="fa-solid fa-xmark"></i></button>';
      list.appendChild(li);
    });
    updateNotificationsCount();
  }

  function ensureInitialized() {
    if (hasInitialized) return;
    var list = getList();
    if (!list) return;
    hasInitialized = true;
    if (!sessionStorage.getItem(INIT_FLAG)) {
      reset();
    }
    renderList();
  }

  function open() {
    ensureInitialized();
    renderList();
    var overlay = getOverlay();
    var trigger = getTrigger();
    var backdrop = getBackdrop();
    if (overlay) {
      if (!drawerInstance && typeof Drawer === 'function') {
        drawerInstance = new Drawer(overlay, { placement: 'right', backdrop: false });
      }
      if (drawerInstance) {
        drawerInstance.show();
      } else {
        overlay.classList.remove('translate-x-full');
      }
      if (backdrop) backdrop.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function close() {
    var overlay = getOverlay();
    var trigger = getTrigger();
    var backdrop = getBackdrop();
    if (overlay) {
      if (drawerInstance) {
        drawerInstance.hide();
      } else {
        overlay.classList.add('translate-x-full');
      }
      if (backdrop) backdrop.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  function toggle() {
    var overlay = getOverlay();
    if (overlay && !overlay.classList.contains('translate-x-full')) {
      close();
    } else {
      open();
    }
  }

  function nextId() {
    var messages = getStoredMessages();
    var max = 0;
    messages.forEach(function(m) {
      var n = parseInt((m.id || '').replace(/^n/, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return 'n' + (max + 1);
  }

  /** Add a message to the notifications list and localStorage. Returns the notification id. */
  function addMessage(text) {
    ensureInitialized();
    var id = nextId();
    var messages = getStoredMessages();
    messages.push({
      id: id,
      text: String(text),
      timestamp: new Date().toISOString()
    });
    setStoredMessages(messages);
    renderList();
    return id;
  }

  /** Remove a message by id. Updates localStorage. Returns true if removed. */
  function removeMessage(id) {
    var messages = getStoredMessages().filter(function(m) { return m.id !== String(id); });
    if (messages.length === getStoredMessages().length) return false;
    setStoredMessages(messages);
    renderList();
    return true;
  }

  /** Remove a message by DOM element (the list item). Updates localStorage. Returns true if removed. */
  function removeMessageElement(el) {
    var list = getList();
    if (!list || !el) return false;
    var item = el.nodeName === 'LI' && el.classList && el.classList.contains('notifications-list-item')
      ? el
      : (el.closest && el.closest('li.notifications-list-item'));
    if (!item || item.parentElement !== list) return false;
    var id = item.getAttribute('data-notification-id');
    if (id) removeMessage(id);
    return true;
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('#ux_notifications')) {
      e.preventDefault();
      toggle();
    } else if (e.target.closest('.notifications-close') || e.target.closest('.notifications-backdrop')) {
      close();
    } else if (e.target.closest('.notifications-item-dismiss')) {
      var btn = e.target.closest('.notifications-item-dismiss');
      var li = btn && btn.closest('li.notifications-list-item');
      if (li) removeMessageElement(li);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = getOverlay();
      if (overlay && !overlay.classList.contains('translate-x-full')) close();
    }
  });

  function observeForList() {
    var rafId;
    var observer = new MutationObserver(function() {
      ensureInitialized();
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        rafId = 0;
        updateNotificationsCount();
      });
    });
    var root = document.body;
    if (root) {
      try {
        observer.observe(root, { childList: true, subtree: true });
      } catch (err) {
        console.warn('Notifications: could not observe DOM', err);
      }
    }
    ensureInitialized();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeForList);
  } else {
    observeForList();
  }

  window.Notifications = {
    addMessage: addMessage,
    removeMessage: removeMessage,
    removeMessageElement: removeMessageElement,
    updateCount: updateNotificationsCount,
    renderList: renderList,
    reset: reset,
    open: open,
    close: close
  };
})();

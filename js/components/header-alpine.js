/**
 * Alpine.js store and helpers for the header (overlays, notifications, Braze panel).
 * Depends: auth-demo (getDemoUser, getCurrentUser, loginAsDemo, isLoggedIn, logout).
 * Braze panel data is read from BrazePanel when that script has run.
 */
(function () {
  var NOTIFICATIONS_KEY = 'wego_notifications';
  var NOTIFICATIONS_INIT_FLAG = 'wego_notifications_initialized';
  var DEMO_MESSAGES = [
    { id: 'n1', text: 'Your flight to Kuala Lumpur is confirmed.' },
    { id: 'n2', text: 'Check-in opens in 24 hours for your upcoming trip.' },
    { id: 'n3', text: 'New deals available for Southeast Asia destinations.' },
    { id: 'n4', text: 'You have a booking awaiting payment.' }
  ];

  function getStoredMessages() {
    try {
      var raw = localStorage.getItem(NOTIFICATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setStoredMessages(messages) {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(messages));
    } catch (e) { }
  }

  function formatTimestamp(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  function maskCardNumber(num) {
    if (!num || typeof num !== 'string') return '–';
    var digits = num.replace(/\D/g, '');
    if (digits.length < 4) return '–';
    return '**** **** **** ' + digits.slice(-4);
  }

  function defineHeaderStore() {
    if (!window.Alpine || Alpine.store('header')) return;
    Alpine.store('header', {
      loginOpen: false,
      accountOpen: false,
      notificationsOpen: false,
      brazeOpen: false,

      notifications: [],
      notificationsReady: false,

      brazeProfile: {},
      brazeAttributes: {},
      brazeEvents: [],
      brazeBanners: [],


      get demoUser() {
        return typeof getDemoUser === 'function' ? getDemoUser() : {};
      },

      get loggedIn() {
        return typeof isLoggedIn === 'function' && isLoggedIn();
      },

      get accountUser() {
        var u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (!u) return null;
        return {
          name: u.name || '–',
          phone: u.phone || '–',
          email: u.email || '–',
          passport: u.passport ? 'Passport: ' + u.passport : '–',
          cardNumber: u.cardNumber ? maskCardNumber(u.cardNumber) : '–',
          cardName: u.cardName || '–',
          expiry: u.expiry || '–',
          address: u.address || '–'
        };
      },

      openLogin: function () {
        this.loginOpen = true;
      },
      closeLogin: function () {
        this.loginOpen = false;
      },
      doLogin: function () {
        if (typeof loginAsDemo === 'function') loginAsDemo();
        if (window.AccountOverlay && typeof window.AccountOverlay.updateHeaderAuthVisibility === 'function') {
          window.AccountOverlay.updateHeaderAuthVisibility();
        }
        try {
          window.dispatchEvent(new CustomEvent('login-overlay-logged-in', { detail: typeof getCurrentUser === 'function' ? getCurrentUser() : null }));
        } catch (e) { }
        this.loginOpen = false;
      },

      openAccount: function () {
        this.accountOpen = true;
      },
      closeAccount: function () {
        this.accountOpen = false;
      },
      doLogout: function () {
        if (typeof logout === 'function') logout();
        this.accountOpen = false;
        if (window.AccountOverlay && typeof window.AccountOverlay.updateHeaderAuthVisibility === 'function') {
          window.AccountOverlay.updateHeaderAuthVisibility();
        }
      },
      resetSession: function () {
        if (window.AccountOverlay && typeof window.AccountOverlay.resetSession === 'function') {
          window.AccountOverlay.resetSession();
        }
      },

      openNotifications: function () {
        this.loadNotifications();
        this.notificationsOpen = true;
      },
      closeNotifications: function () {
        this.notificationsOpen = false;
      },
      loadNotifications: function () {
        if (!this.notificationsReady) {
          try {
            if (!sessionStorage.getItem(NOTIFICATIONS_INIT_FLAG)) {
              var now = new Date().toISOString();
              var withTs = DEMO_MESSAGES.map(function (m) { return { id: m.id, text: m.text, timestamp: now }; });
              setStoredMessages(withTs);
              sessionStorage.setItem(NOTIFICATIONS_INIT_FLAG, '1');
            }
          } catch (e) { }
          this.notificationsReady = true;
        }
        this.notifications = getStoredMessages().slice().reverse();
      },
      dismissNotification: function (id) {
        var list = getStoredMessages().filter(function (m) { return m.id !== String(id); });
        setStoredMessages(list);
        this.notifications = list.slice().reverse();
      },
      formatNotificationTime: function (isoString) {
        return formatTimestamp(isoString);
      },
      get notificationCount() {
        return this.notifications.length;
      },

      openBraze: function () {
        this.refreshBrazeData();
        this.brazeOpen = true;
      },
      closeBraze: function () {
        this.brazeOpen = false;
      },
      refreshBrazeData: function () {
        if (window.BrazePanel) {
          this.brazeProfile = window.BrazePanel.getProfile() || {};
          this.brazeAttributes = window.BrazePanel.getAttributes() || {};
          this.brazeEvents = (window.BrazePanel.getEvents() || []).slice().reverse();
        }
      },
      brazeValue: function (val) {
        return val != null && val !== '' ? String(val) : '–';
      }
    });
    Alpine.store('header').loadNotifications();
  }

  if (window.Alpine) {
    defineHeaderStore();
  } else {
    window.addEventListener('alpine:init', defineHeaderStore);
  }

  window.headerNotificationsAdd = function (text) {
    var store = window.Alpine && Alpine.store('header');
    if (!store) return null;
    var messages = getStoredMessages();
    var max = 0;
    messages.forEach(function (m) {
      var n = parseInt((m.id || '').replace(/^n/, ''), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    var id = 'n' + (max + 1);
    messages.push({ id: id, text: String(text), timestamp: new Date().toISOString() });
    setStoredMessages(messages);
    store.notifications = messages.slice().reverse();
    return id;
  };
})();

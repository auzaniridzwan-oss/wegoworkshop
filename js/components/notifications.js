/**
 * Notifications: addMessage, reset. List UI is handled by Alpine in header.
 */
(function() {
  var NOTIFICATIONS_KEY = 'wego_notifications';
  var INIT_FLAG = 'wego_notifications_initialized';
  var DEMO_MESSAGES = [
    { id: 'n1', text: 'Your flight to Kuala Lumpur is confirmed.' },
    { id: 'n2', text: 'Check-in opens in 24 hours for your upcoming trip.' },
    { id: 'n3', text: 'New deals available for Southeast Asia destinations.' },
    { id: 'n4', text: 'You have a booking awaiting payment.' }
  ];

  function setStoredMessages(messages) {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(messages));
    } catch (e) {}
  }

  function addMessage(text) {
    if (typeof window.headerNotificationsAdd === 'function') {
      return window.headerNotificationsAdd(text);
    }
    return null;
  }

  function reset() {
    var now = new Date().toISOString();
    var withTimestamps = DEMO_MESSAGES.map(function(m) {
      return { id: m.id, text: m.text, timestamp: now };
    });
    setStoredMessages(withTimestamps);
    try {
      sessionStorage.setItem(INIT_FLAG, '1');
    } catch (e) {}
    if (window.Alpine && Alpine.store('header')) {
      Alpine.store('header').notificationsReady = true;
      Alpine.store('header').loadNotifications();
    }
  }

  window.Notifications = {
    addMessage: addMessage,
    reset: reset,
    open: function() {
      if (window.Alpine && Alpine.store('header')) Alpine.store('header').openNotifications();
    },
    close: function() {
      if (window.Alpine && Alpine.store('header')) Alpine.store('header').closeNotifications();
    }
  };
})();

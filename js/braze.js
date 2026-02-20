/**
 * Braze Web SDK helper methods.
 * Requires the Braze Web SDK to be loaded first.
 *
 * Load the SDK via Braze CDN (add before this script):
 *   <script src="https://js.appboycdn.com/web-sdk/4.2/braze.min.js"></script>
 * Or use NPM: npm install @braze/web-sdk and import/require before using BrazeHelpers.
 *
 * @see https://www.braze.com/docs/developer_guide/sdk_integration?subtab=braze%20cdn
 */
(function(global) {
  'use strict';

  var MAX_EVENTS_STORED = 10;
  var localAttributes = {};
  var localEvents = [];
  var contentCardsSubscriptions = [];
  var bannersSubscriptions = [];
  var isInitialized = false;
  var sdk = null;

  function getBraze() {
    if (sdk) return sdk;
    if (typeof global.braze !== 'undefined') return global.braze;
    if (typeof global.appboy !== 'undefined') return global.appboy;
    return null;
  }

  /**
   * Initialize the Braze Web SDK.
   * @param {string} apiKey - Your Braze API key (from Settings > App Settings in the dashboard).
   * @param {object} options - Optional config: baseUrl (required), enableLogging, allowUserSuppliedJavascript, etc.
   * @returns {boolean} True if initialization was successful.
   */
  function initialize(apiKey, options) {
    var braze = getBraze();
    if (!braze || typeof braze.initialize !== 'function') {
      console.warn('Braze: SDK not loaded. Include the Braze Web SDK script before this helper.');
      return false;
    }
    var opts = options || {};
    if (!opts.baseUrl && apiKey) {
      console.warn('Braze: baseUrl is required in options (e.g. sdk.iad-05.braze.com).');
    }
    try {
      braze.initialize(apiKey, opts);
      if (opts.automaticallyShowInAppMessages !== false) {
        if (typeof braze.automaticallyShowInAppMessages === 'function') {
          braze.automaticallyShowInAppMessages();
        }
      }
      initUserSession();

      sdk = braze;
      isInitialized = true;
      return true;
    } catch (e) {
      console.warn('Braze: initialize failed', e);
      return false;
    }
  }

  /**
   * Start or resume a user session. Call after initialize; call changeUser first if identifying a user.
   */
  function initUserSession() {
    var braze = getBraze();
    if (!braze || typeof braze.openSession !== 'function') return false;
    try {
      braze.openSession();
      return true;
    } catch (e) {
      console.warn('Braze: openSession failed', e);
      return false;
    }
  }

  /**
   * Change to an identified user (external user id). Call before openSession when user logs in.
   * @param {string} userId - External user ID.
   */
  function changeUser(userId) {
    var braze = getBraze();
    if (!braze || typeof braze.changeUser !== 'function') return false;
    try {
      braze.changeUser(userId || '');
      return true;
    } catch (e) {
      console.warn('Braze: changeUser failed', e);
      return false;
    }
  }

  /**
   * Track a custom event with optional properties.
   * @param {string} eventName - Event name.
   * @param {object} [properties] - Optional key-value event properties.
   */
  function trackEvent(eventName, properties) {
    var braze = getBraze();
    if (braze && typeof braze.logCustomEvent === 'function') {
      try {
        var result = braze.logCustomEvent(eventName, properties || {});
        console.log('Braze: logCustomEvent result: ', result);
        return result;
      } catch (e) {
        console.warn('Braze: logCustomEvent failed', e);
      }
    }
    var event = {
      name: eventName,
      properties: properties && typeof properties === 'object' ? properties : {},
      timestamp: new Date().toISOString()
    };
    localEvents.unshift(event);
    if (localEvents.length > MAX_EVENTS_STORED) localEvents.length = MAX_EVENTS_STORED;
  }

  /**
   * Update a custom user attribute.
   * @param {string} key - Attribute key.
   * @param {*} value - Attribute value (string, number, boolean, or array of strings).
   */
  function updateUserAttribute(key, value) {
    var braze = getBraze();
    if (braze && typeof braze.User.setCustomUserAttribute === 'function') {
      try {
        braze.User.setCustomUserAttribute(key, value);
      } catch (e) {
        console.warn('Braze: setCustomUserAttribute failed', e);
      }
    }
    if (key != null && key !== '') {
      localAttributes[String(key)] = value;
    }
  }

  /**
   * Get a list of user attributes (keys and values) from the local cache.
   * Note: Braze does not expose a client API to read back all attributes; this returns attributes
   * set via updateUserAttribute in this session.
   */
  function getListOfUserAttributes() {
    var out = {};
    for (var k in localAttributes) {
      if (Object.prototype.hasOwnProperty.call(localAttributes, k)) {
        out[k] = localAttributes[k];
      }
    }
    return out;
  }

  /**
   * Get the latest user events (up to 10) from the local cache.
   * Each item: { name, properties, timestamp }.
   */
  function getListOfUserEvents() {
    return localEvents.slice(0, MAX_EVENTS_STORED);
  }

  /**
   * Subscribe to content card updates. Callback receives the content cards payload.
   * @param {function} callback - Function(cardsPayload) called when content cards are updated.
   * @returns {function} Unsubscribe function.
   */
  function subscribeToContentCardsUpdates(callback) {
    var braze = getBraze();
    if (!braze || typeof braze.subscribeToContentCardsUpdates !== 'function') {
      console.warn('Braze: subscribeToContentCardsUpdates not available.');
      return function() {};
    }
    try {
      braze.subscribeToContentCardsUpdates(callback);
      contentCardsSubscriptions.push(callback);
      return function unsubscribe() {
        var i = contentCardsSubscriptions.indexOf(callback);
        if (i !== -1) contentCardsSubscriptions.splice(i, 1);
      };
    } catch (e) {
      console.warn('Braze: subscribeToContentCardsUpdates failed', e);
      return function() {};
    }
  }

    /**
   * Subscribe to banner updates. Callback receives the baneners payload.
   * @param {function} callback - Function(bannersPayload) called when banners are updated.
   * @returns {function} Unsubscribe function.
   */
    function subscribeToBannersUpdates(callback) {
      var braze = getBraze();
      if (!braze || typeof braze.subscribeToBannersUpdates !== 'function') {
        console.warn('Braze: subscribeToBannersUpdates not available.');
        return function() {};
      }
      try {
        braze.subscribeToBannersUpdates(callback);
        bannersSubscriptions.push(callback);
        return function unsubscribe() {
          var i = bannersSubscriptions.indexOf(callback);
          if (i !== -1) bannersSubscriptions.splice(i, 1);
        };
      } catch (e) {
        console.warn('Braze: subscribeToBannersUpdates failed', e);
        return function() {};
      }
    }

  /**
   * Filter content cards by message_type (card type).
   * @param {object|array} cardsPayload - Result from getCachedContentCards() or the callback argument (object with .cards or array).
   * @param {string} messageType - Filter by type (e.g. 'Classic', 'CaptionedImage', 'Banner', 'ImageOnly', 'Control').
   * @returns {array} Filtered array of card objects.
   */
  function filterContentCardsByMessageType(cardsPayload, messageType) {
    var cards = [];
    if (Array.isArray(cardsPayload)) {
      cards = cardsPayload;
    } else if (cardsPayload && Array.isArray(cardsPayload.cards)) {
      cards = cardsPayload.cards;
    }
    if (!messageType) return cards.slice();
    var typeLower = String(messageType).toLowerCase();
    return cards.filter(function(card) {
      var t = (card.type || card.message_type || (card.constructor && card.constructor.name) || '').toLowerCase();
      return t === typeLower || t.indexOf(typeLower) !== -1;
    });
  }

  /**
   * Get cached content cards (if SDK provides it).
   */
  function getCachedContentCards() {
    var braze = getBraze();
    if (!braze || typeof braze.getCachedContentCards !== 'function') return null;
    try {
      return braze.getCachedContentCards();
    } catch (e) {
      return null;
    }
  }

  /**
   * Reset the Braze SDK: wipe user data and clear local caches.
   * Call initUserSession or changeUser + initUserSession again after reset if needed.
   */
  function reset() {
    var braze = getBraze();
    localAttributes = {};
    localEvents = [];
    contentCardsSubscriptions = [];
    if (braze) {
      try {
        if (typeof braze.wipeData === 'function') braze.wipeData();
        if (typeof braze.destroy === 'function') braze.destroy();
      } catch (e) {
        console.warn('Braze: reset failed', e);
      }
    }
    isInitialized = false;
    sdk = null;
  }

  global.BrazeHelpers = {
    initialize: initialize,
    initUserSession: initUserSession,
    changeUser: changeUser,
    trackEvent: trackEvent,
    updateUserAttribute: updateUserAttribute,
    getListOfUserAttributes: getListOfUserAttributes,
    getListOfUserEvents: getListOfUserEvents,
    subscribeToContentCardsUpdates: subscribeToContentCardsUpdates,
    subscribeToBannersUpdates: subscribeToBannersUpdates,
    filterContentCardsByMessageType: filterContentCardsByMessageType,
    getCachedContentCards: getCachedContentCards,
    reset: reset,
    getBraze: getBraze,
    isInitialized: function() { return isInitialized; }
  };
})(typeof window !== 'undefined' ? window : this);

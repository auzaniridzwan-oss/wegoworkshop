/**
 * Unit tests for BrazeHelpers (js/braze.js).
 * Runs against the actual Braze Web SDK when loaded (e.g. via CDN). No mocks.
 * Load after braze.js (and Braze SDK script if testing init/session/changeUser).
 * Usage: include after braze.js, then call BrazeHelpersTest.run().
 */
(function(global) {
  'use strict';

  var passed = 0;
  var failed = 0;
  var results = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
      results.push({ ok: true, message: message });
      return true;
    }
    failed++;
    results.push({ ok: false, message: message });
    if (typeof console !== 'undefined' && console.error) {
      console.error('FAIL: ' + message);
    }
    return false;
  }

  function assertEqual(actual, expected, message) {
    var ok = actual === expected;
    var msg = message || 'expected ' + expected + ', got ' + actual;
    assert(ok, msg);
    return ok;
  }

  function assertDeepEqual(actual, expected, message) {
    var ok = JSON.stringify(actual) === JSON.stringify(expected);
    var msg = message || 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual);
    assert(ok, msg);
    return ok;
  }

  function runTests() {
    var H = global.BrazeHelpers;
    if (!H) {
      console.error('BrazeHelpersTest: BrazeHelpers not found. Load braze.js first.');
      return { passed: 0, failed: 1, results: [{ ok: false, message: 'BrazeHelpers not found' }] };
    }

    passed = 0;
    failed = 0;
    results = [];

    var hasSDK = global.braze && typeof global.braze.initialize === 'function';
    var apiKey = (global.BrazeSDKConfig && global.BrazeSDKConfig.apiKey) || 'test-api-key';
    var options = (global.BrazeSDKConfig && global.BrazeSDKConfig.options) || { baseUrl: 'sdk.iad-03.braze.com' };

    H.reset();

    // --- initialize (actual SDK) ---
    if (hasSDK) {
      var initOk = H.initialize(apiKey, options);
      assert(initOk, 'initialize() returns true with actual SDK');
      assert(H.isInitialized(), 'isInitialized() is true after initialize');
      assert(H.getBraze() === global.braze, 'getBraze() returns actual SDK after initialize');
    } else {
      assert(H.initialize(apiKey, options) === false, 'initialize() returns false when SDK not loaded');
      assert(!H.isInitialized(), 'isInitialized() is false when SDK not loaded');
    }

    // --- initUserSession (actual SDK) ---
    if (hasSDK && H.isInitialized()) {
      assert(H.initUserSession() === true, 'initUserSession() returns true with actual SDK');
    } else {
      assert(H.initUserSession() === false, 'initUserSession() returns false when SDK not ready');
    }

    // --- changeUser (actual SDK) ---
    if (hasSDK && H.isInitialized()) {
      var testUserId = 'wego0';
      assert(H.changeUser(testUserId) === true, 'changeUser() returns true with actual SDK');
      //H.changeUser('');
      //assert(H.changeUser('') === true, 'changeUser("") returns true');
    } else {
      assert(H.changeUser(testUserId) === false, 'changeUser() returns false when SDK not ready');
    }

    // --- trackEvent (local state + actual SDK when present) ---

    /*
    H.trackEvent('test_event');
    var events = H.getListOfUserEvents();
    assert(events.length >= 1, 'trackEvent() adds event to local list');
    assert(events[0].name === 'test_event', 'trackEvent() stores event name');
    assert(typeof events[0].timestamp === 'string' && events[0].timestamp.length > 0, 'trackEvent() adds ISO timestamp');
    assertDeepEqual(events[0].properties, {}, 'trackEvent() with no props stores empty object');

    H.trackEvent('testevent_search_flights', { from: 'SIN', to: 'KUL' });
    */

    /*
    events = H.getListOfUserEvents();
    assert(events[0].name === 'event_with_props' && events[0].properties.from === 'SIN', 'trackEvent() stores properties');
    H.trackEvent('no_props', null);
    assertDeepEqual(H.getListOfUserEvents()[0].properties, {}, 'trackEvent(name, null) stores empty properties object');
    H.trackEvent('no_props2', undefined);
    assertDeepEqual(H.getListOfUserEvents()[0].properties, {}, 'trackEvent(name, undefined) stores empty properties object');
    var i;
    for (i = 0; i < 12; i++) H.trackEvent('cap_event_' + i, {});
    assert(H.getListOfUserEvents().length === 10, 'trackEvent() caps local list at 10 events');
    assert(H.getListOfUserEvents()[0].name === 'cap_event_11', 'trackEvent() keeps newest events first');
    */

    // --- updateUserAttribute (local state + actual SDK when present) ---
    H.updateUserAttribute('Points', 100);
    var attrs = H.getListOfUserAttributes();
    assert(attrs.Points === 100, 'updateUserAttribute() stores in local cache');
    H.updateUserAttribute('Preferred Meals', 'Vegetarian');
    attrs = H.getListOfUserAttributes();
    assert(attrs['Preferred Meals'] === 'Vegetarian', 'updateUserAttribute() supports string value');
    H.updateUserAttribute('', 'ignored');
    attrs = H.getListOfUserAttributes();
    assert(attrs[''] === undefined, 'updateUserAttribute("", value) does not store empty key');
    H.updateUserAttribute('bool_attr', true);
    assert(H.getListOfUserAttributes().bool_attr === true, 'updateUserAttribute() supports boolean value');

    // --- getListOfUserAttributes ---
    assert(Object.keys(H.getListOfUserAttributes()).length >= 2, 'getListOfUserAttributes() returns all set attributes');

    // --- getListOfUserEvents ---
    assert(Array.isArray(H.getListOfUserEvents()), 'getListOfUserEvents() returns array');
    assert(H.getListOfUserEvents().length <= 10, 'getListOfUserEvents() returns at most 10 events');
    var eventsCopy = H.getListOfUserEvents();
    eventsCopy.push({ name: 'fake' });
    assert(H.getListOfUserEvents().length < eventsCopy.length, 'getListOfUserEvents() returns a copy (slice)');

    // --- subscribeToContentCardsUpdates (actual SDK when present) ---
    var unsub = H.subscribeToContentCardsUpdates(function() {});
    assert(typeof unsub === 'function', 'subscribeToContentCardsUpdates() returns unsubscribe function');
    unsub();

    // --- filterContentCardsByMessageType (pure helper, no SDK) ---
    var payloadWithCards = { cards: [
      { type: 'Classic', id: '1' },
      { type: 'Banner', id: '2' },
      { type: 'Classic', id: '3' }
    ]};
    var filtered = H.filterContentCardsByMessageType(payloadWithCards, 'Classic');
    assert(filtered.length === 2, 'filterContentCardsByMessageType(cards, "Classic") returns 2');
    assert(filtered[0].type === 'Classic', 'filterContentCardsByMessageType preserves card shape');

    var arrCards = [{ message_type: 'Banner' }, { message_type: 'ImageOnly' }];
    filtered = H.filterContentCardsByMessageType(arrCards, 'banner');
    assert(filtered.length === 1 && filtered[0].message_type === 'Banner', 'filterContentCardsByMessageType matches message_type (case insensitive)');

    var allCards = H.filterContentCardsByMessageType(payloadWithCards, '');
    assert(allCards.length === 3, 'filterContentCardsByMessageType(..., "") returns copy of all cards');
    assert(allCards !== payloadWithCards.cards, 'filterContentCardsByMessageType(..., "") returns copy not reference');
    assert(Array.isArray(H.filterContentCardsByMessageType(null, 'Classic')) && H.filterContentCardsByMessageType(null, 'Classic').length === 0, 'filterContentCardsByMessageType(null, type) returns empty array');
    assert(H.filterContentCardsByMessageType(undefined, 'Banner').length === 0, 'filterContentCardsByMessageType(undefined, type) returns empty array');
    assert(H.filterContentCardsByMessageType(payloadWithCards, 'NonExistent').length === 0, 'filterContentCardsByMessageType() returns empty array when no cards match');

    // --- getCachedContentCards (actual SDK) ---
    var cached = H.getCachedContentCards();
    assert(cached === null || (typeof cached === 'object' && cached !== null), 'getCachedContentCards() returns null or object from actual SDK');

    // --- reset ---
    H.reset();
    assert(!H.isInitialized(), 'reset() clears isInitialized');
    assertDeepEqual(H.getListOfUserAttributes(), {}, 'reset() clears local attributes');
    assert(H.getListOfUserEvents().length === 0, 'reset() clears local events');

    // --- getBraze ---
    H.reset();
    if (hasSDK) {
      assert(H.getBraze() === global.braze, 'getBraze() returns actual SDK when present (before init)');
      H.initialize(apiKey, options);
      assert(H.getBraze() === global.braze, 'getBraze() returns actual SDK after init');
    } else {
      assert(H.getBraze() === null || H.getBraze() === undefined, 'getBraze() returns null/undefined when SDK not loaded');
    }

    H.reset();

    return { passed: passed, failed: failed, results: results };
  }

  function run() {
    var out = runTests();
    var total = out.passed + out.failed;
    var summary = 'BrazeHelpers tests: ' + out.passed + ' passed, ' + out.failed + ' failed (total ' + total + ')';
    if (typeof console !== 'undefined') {
      console.log(summary);
      out.results.forEach(function(r) {
        console.log(r.ok ? '  ✓ ' + r.message : '  ✗ ' + r.message);
      });
    }
    return out;
  }

  global.BrazeHelpersTest = {
    run: run,
    runTests: runTests,
    assert: assert,
    assertEqual: assertEqual,
    assertDeepEqual: assertDeepEqual
  };
})(typeof window !== 'undefined' ? window : this);

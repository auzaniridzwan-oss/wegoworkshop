/**
 * Booking state: persistent storage (localStorage) for the booking flow.
 * Survives reloads and navigation. No dependencies. Use getBookingState / setBookingState / resetBookingState.
 */
(function() {
  function parseUrlParams(search) {
    if (!search || search.charAt(0) === '?') search = search ? search.slice(1) : '';
    var obj = {};
    var params = new URLSearchParams(search);
    params.forEach(function(value, key) {
      try {
        obj[key] = value.indexOf('{') !== -1 ? JSON.parse(decodeURIComponent(value)) : value;
      } catch (e) {
        obj[key] = value;
      }
    });
    return obj;
  }

  function readStored() {
    return window.StorageManager.get('booking_state', {});
  }

  /**
   * Read booking state. If the current URL has query params, merge them into state and save (so deep links work).
   * Returns a plain object; safe defaults are applied by callers.
   */
  function getBookingState() {
    var stored = readStored();
    var fromUrl = parseUrlParams(window.location.search);
    var hasUrlParams = Object.keys(fromUrl).length > 0;
    if (hasUrlParams) {
      var merged = {};
      for (var k in stored) if (Object.prototype.hasOwnProperty.call(stored, k)) merged[k] = stored[k];
      for (var k in fromUrl) if (Object.prototype.hasOwnProperty.call(fromUrl, k)) merged[k] = fromUrl[k];
      setBookingState(merged);
      return merged;
    }
    return stored;
  }

  /**
   * Write (merge) booking state into storage. Pass a partial object; it is merged on top of existing state.
   * Returns the full state after merge.
   */
  function setBookingState(partial) {
    var current = readStored();
    if (partial && typeof partial === 'object') {
      for (var key in partial) {
        if (Object.prototype.hasOwnProperty.call(partial, key)) {
          var v = partial[key];
          if (v === undefined || v === null || v === '') delete current[key];
          else current[key] = v;
        }
      }
    }
    try {
      window.StorageManager.set('booking_state', current);
    } catch (e) {
      window.AppLogger.warn('[STORAGE]', 'Booking state: could not write to localStorage', e);
    }
    return current;
  }

  /**
   * Clear all booking state (e.g. when starting a new search or after completion).
   */
  function resetBookingState() {
    try {
      window.StorageManager.remove('booking_state');
    } catch (e) {
      window.AppLogger.warn('[STORAGE]', 'Booking state: could not clear localStorage', e);
    }
  }

  /**
   * Update state with partial then navigate to path. Use instead of mergeAndNavigate for booking flow.
   */
  function navigateWithBookingState(path, partial) {
    setBookingState(partial);
    window.location.href = path;
  }

  window.getBookingState = getBookingState;
  window.setBookingState = setBookingState;
  window.resetBookingState = resetBookingState;
  window.navigateWithBookingState = navigateWithBookingState;
})();

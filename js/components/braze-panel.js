/**
 * Braze panel: data layer (profile, attributes, events). UI is handled by Alpine in header.
 * Use BrazePanel.updateProfile(), BrazePanel.updateAttributes(), BrazePanel.addEvent().
 */
(function() {
  var KEY_PROFILE = 'wego_braze_profile';
  var KEY_ATTRIBUTES = 'wego_braze_attributes';
  var KEY_EVENTS = 'wego_braze_events';

  var DEFAULT_ATTRIBUTES = {
    Points: null,
    'Preferred Meals': null,
    'Preferred Seats': null,
    'Preferred Depart Time': null
  };

  function getProfile() {
    if (typeof window.getCurrentUser === 'function') {
      return window.getCurrentUser();
    }
    return {};
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(KEY_PROFILE, JSON.stringify(profile || {}));
    } catch (e) {}
  }

  function getAttributes() {
    try {
      var raw = localStorage.getItem(KEY_ATTRIBUTES);
      if (raw) {
        var parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_ATTRIBUTES, parsed);
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_ATTRIBUTES);
  }

  function saveAttributes(attrs) {
    try {
      localStorage.setItem(KEY_ATTRIBUTES, JSON.stringify(attrs || {}));
    } catch (e) {}
  }

  function getEvents() {
    try {
      var raw = localStorage.getItem(KEY_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEvents(events) {
    try {
      localStorage.setItem(KEY_EVENTS, JSON.stringify(events || []));
    } catch (e) {}
  }

  function refreshAlpineStore() {
    if (window.Alpine && Alpine.store('header')) {
      Alpine.store('header').refreshBrazeData();
    }
  }

  function open() {
    if (window.Alpine && Alpine.store('header')) {
      Alpine.store('header').openBraze();
    }
  }

  function close() {
    if (window.Alpine && Alpine.store('header')) {
      Alpine.store('header').closeBraze();
    }
  }

  function updateProfile(profile) {
    var current = getProfile();
    if (profile && typeof profile === 'object') {
      if (profile.externalId !== undefined) current.externalId = profile.externalId;
      if (profile.brazeId !== undefined) current.brazeId = profile.brazeId;
      if (profile.name !== undefined) current.name = profile.name;
      if (profile.email !== undefined) current.email = profile.email;
      if (profile.phone !== undefined) current.phone = profile.phone;
    }
    saveProfile(current);
    refreshAlpineStore();
    return current;
  }

  function updateAttributes(attrs) {
    var current = getAttributes();
    if (attrs && typeof attrs === 'object') {
      if (attrs.Points !== undefined) current.Points = attrs.Points;
      if (attrs['Preferred Meals'] !== undefined) current['Preferred Meals'] = attrs['Preferred Meals'];
      if (attrs['Preferred Seats'] !== undefined) current['Preferred Seats'] = attrs['Preferred Seats'];
      if (attrs['Preferred Depart Time'] !== undefined) current['Preferred Depart Time'] = attrs['Preferred Depart Time'];
    }
    saveAttributes(current);
    refreshAlpineStore();
    return current;
  }

  function addEvent(eventName, eventProperties) {
    var events = getEvents();
    var props = eventProperties && typeof eventProperties === 'object' ? eventProperties : {};
    events.push({
      name: eventName != null ? String(eventName) : '',
      properties: props,
      timestamp: new Date().toISOString()
    });
    saveEvents(events);
    refreshAlpineStore();
    return events[events.length - 1];
  }

  window.BrazePanel = {
    open: open,
    close: close,
    getProfile: getProfile,
    updateProfile: updateProfile,
    getAttributes: getAttributes,
    updateAttributes: updateAttributes,
    getEvents: getEvents,
    addEvent: addEvent
  };
})();

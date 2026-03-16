/**
 * Braze panel: fixed left overlay with User Profile, Attributes, and Events.
 * Use BrazePanel.updateProfile(), BrazePanel.updateAttributes(), BrazePanel.addEvent().
 */
(function() {
  var KEY_PROFILE = 'wego_braze_profile';
  var KEY_ATTRIBUTES = 'wego_braze_attributes';
  var KEY_EVENTS = 'wego_braze_events';
  var drawerInstance = null;

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

  function getOverlay() {
    return document.getElementById('braze-panel-overlay');
  }

  function getBackdrop() {
    return document.querySelector('.braze-panel-backdrop');
  }

  function isOpen() {
    var overlay = getOverlay();
    if (!overlay) return false;
    return !overlay.classList.contains('-translate-x-full');
  }

  function getTrigger() {
    return document.getElementById('ux_braze');
  }

  function render() {
    var profile = getProfile();
    var attrs = getAttributes();
    var events = getEvents();

    var externalIdEl = document.getElementById('braze-profile-external-id');
    var brazeIdEl = document.getElementById('braze-profile-braze-id');
    var nameEl = document.getElementById('braze-profile-name');
    var emailEl = document.getElementById('braze-profile-email');
    var phoneEl = document.getElementById('braze-profile-phone');
    if (externalIdEl) externalIdEl.textContent = profile.externalId != null ? profile.externalId : '–';
    if (brazeIdEl) brazeIdEl.textContent = profile.deviceId != null ? profile.deviceId : '–';
    if (nameEl) nameEl.textContent = profile.name != null ? profile.name : '–';
    if (emailEl) emailEl.textContent = profile.email != null ? profile.email : '–';
    if (phoneEl) phoneEl.textContent = profile.phone != null ? profile.phone : '–';

    var pointsEl = document.getElementById('braze-attr-points');
    var mealsEl = document.getElementById('braze-attr-preferred-meals');
    var seatsEl = document.getElementById('braze-attr-preferred-seats');
    var departEl = document.getElementById('braze-attr-preferred-depart-time');
    if (pointsEl) pointsEl.textContent = attrs.Points != null ? String(attrs.Points) : '–';
    if (mealsEl) mealsEl.textContent = attrs['Preferred Meals'] != null ? String(attrs['Preferred Meals']) : '–';
    if (seatsEl) seatsEl.textContent = attrs['Preferred Seats'] != null ? String(attrs['Preferred Seats']) : '–';
    if (departEl) departEl.textContent = attrs['Preferred Depart Time'] != null ? String(attrs['Preferred Depart Time']) : '–';

    var listEl = document.getElementById('braze-events-list');
    if (listEl) {
      listEl.innerHTML = '';
      var slice = events.slice().reverse();
      slice.forEach(function(ev) {
        var li = document.createElement('li');
        li.className = 'rounded-lg border border-gray-200 bg-gray-50 p-3';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'block font-semibold text-gray-900';
        nameSpan.textContent = ev.name || '(unnamed)';
        var timeSpan = document.createElement('span');
        timeSpan.className = 'mt-1 block text-xs text-gray-500';
        timeSpan.textContent = ev.timestamp || '–';
        var propsEl = document.createElement('pre');
        propsEl.className = 'mt-2 overflow-x-auto rounded bg-white p-2 text-xs text-gray-700';
        propsEl.textContent = typeof ev.properties === 'object' && ev.properties !== null
          ? JSON.stringify(ev.properties, null, 2)
          : '{}';
        li.appendChild(nameSpan);
        li.appendChild(timeSpan);
        li.appendChild(propsEl);
        listEl.appendChild(li);
      });
    }
  }

  function open() {
    var overlay = getOverlay();
    var trigger = getTrigger();
    var backdrop = getBackdrop();
    if (overlay) {
      if (!drawerInstance && typeof Drawer === 'function') {
        drawerInstance = new Drawer(overlay, { placement: 'left', backdrop: false });
      }
      render();
      if (drawerInstance) drawerInstance.show();
      else overlay.classList.remove('-translate-x-full');
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
      if (drawerInstance) drawerInstance.hide();
      else overlay.classList.add('-translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  function toggle() {
    var overlay = getOverlay();
    if (overlay && !overlay.classList.contains('-translate-x-full')) {
      close();
    } else {
      open();
    }
  }

  /**
   * Update user profile. Pass an object with any of: externalId, brazeId, name, email, phone.
   */
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
    if (isOpen()) render();
    return current;
  }

  /**
   * Update attributes. Pass an object with any of: Points, 'Preferred Meals', 'Preferred Seats', 'Preferred Depart Time'.
   */
  function updateAttributes(attrs) {
    var current = getAttributes();
    if (attrs && typeof attrs === 'object') {
      if (attrs.Points !== undefined) current.Points = attrs.Points;
      if (attrs['Preferred Meals'] !== undefined) current['Preferred Meals'] = attrs['Preferred Meals'];
      if (attrs['Preferred Seats'] !== undefined) current['Preferred Seats'] = attrs['Preferred Seats'];
      if (attrs['Preferred Depart Time'] !== undefined) current['Preferred Depart Time'] = attrs['Preferred Depart Time'];
    }
    saveAttributes(current);
    if (isOpen()) render();
    return current;
  }

  /**
   * Add an event. eventName (string), eventProperties (object, key-value pairs). Timestamp in ISO 8601 is added automatically.
   */
  function addEvent(eventName, eventProperties) {
    var events = getEvents();
    var props = eventProperties && typeof eventProperties === 'object' ? eventProperties : {};
    events.push({
      name: eventName != null ? String(eventName) : '',
      properties: props,
      timestamp: new Date().toISOString()
    });
    saveEvents(events);
    if (isOpen()) render();
    return events[events.length - 1];
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('#ux_braze')) {
      e.preventDefault();
      toggle();
    } else if (e.target.closest('.braze-panel-close') || e.target.closest('.braze-panel-backdrop')) {
      close();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = getOverlay();
      if (overlay && !overlay.classList.contains('-translate-x-full')) close();
    }
  });

  window.BrazePanel = {
    open: open,
    close: close,
    getProfile: getProfile,
    updateProfile: updateProfile,
    getAttributes: getAttributes,
    updateAttributes: updateAttributes,
    getEvents: getEvents,
    addEvent: addEvent,
    render: render
  };
})();

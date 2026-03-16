/**
 * Demo auth: fixed user profile and login state in localStorage.
 * For workshop/demo only. Use isLoggedIn(), getDemoUser(), loginAsDemo(), logout().
 */
(function () {
  var KEY_LOGGED_IN = 'logged_in';
  var KEY_USER = 'demo_user';
  var KEY_ANON_USER = 'anon_user';
  var KEY_EXTERNAL_ID = 'wego9999';

  var DEMO_USER = {
    name: 'Auzani Ridzwan',
    phone: '+65 9123 4567',
    email: 'auzani.ridzwan+test01@braze.com',
    passport: 'A123456789',
    cardNumber: '1234 5678 9012 3456',
    cardName: 'Auzani Ridzwan',
    expiry: '12/28',
    address: '123 Orchard Road, Singapore 238858',
    externalId: KEY_EXTERNAL_ID,
    deviceId: ''
  };

  var ANON_USER = {
    name: 'Anonymous User',
    phone: 'na',
    email: 'na',
    passport: 'na',
    cardNumber: 'na',
    cardName: 'na',
    expiry: 'na',
    address: 'na',
    externalId: 'na',
    deviceId: ''
  };

  function isLoggedIn() {
    try {
      return window.StorageManager.get(KEY_LOGGED_IN, false) === true;
    } catch (e) {
      return false;
    }
  }

  function getStoredUser() {
    try {
      return window.StorageManager.get(KEY_USER, null);
    } catch (e) {
      return null;
    }
  }

  function getDemoUser() {
    return {
      name: DEMO_USER.name,
      phone: DEMO_USER.phone,
      email: DEMO_USER.email,
      passport: DEMO_USER.passport,
      cardNumber: DEMO_USER.cardNumber,
      cardName: DEMO_USER.cardName,
      expiry: DEMO_USER.expiry,
      address: DEMO_USER.address,
      externalId: DEMO_USER.externalId,
      deviceId: DEMO_USER.deviceId
    };
  }

  function setLoggedIn(user) {
    try {
      window.StorageManager.set(KEY_LOGGED_IN, true);
      window.StorageManager.set(KEY_USER, user || DEMO_USER);
    } catch (e) {
      window.AppLogger.warn('[AUTH]', 'Could not save to localStorage', e);
    }
  }

  function loginAsDemo() {

    //Braze SDK Login Function
    if (window.Braze2) {
      window.Braze2.changeUser(DEMO_USER.externalId);
      DEMO_USER.deviceId = window.Braze2.getDeviceId();
    }

    //Update Logged In User To Local Storage
    setLoggedIn(DEMO_USER);

    if (window.BrazePanel) {
      window.BrazePanel.addEvent('logged-in', { "externalId": DEMO_USER.externalId, "deviceId": DEMO_USER.deviceId });
    }
  }

  function logout() {
    try {
      window.StorageManager.remove(KEY_LOGGED_IN);
      window.StorageManager.remove(KEY_USER);
      window.StorageManager.remove(KEY_ANON_USER);
    } catch (e) { }
  }

  function getCurrentUser() {
    if (!isLoggedIn()) {
      //BRAZE SDK - Get current anonymous user id and store in local storage
      try {
        var raw = window.StorageManager.get(KEY_ANON_USER, null);

        if (!raw) {
          var braze = window.Braze2 && window.Braze2.getBraze ? window.Braze2.getBraze() : window.braze;
          if (braze && typeof braze.getDeviceId === 'function') {
            braze.getDeviceId(function (devId) {
              if (devId) {
                ANON_USER.deviceId = devId;
                window.StorageManager.set(KEY_ANON_USER, ANON_USER);
              }
            });
          }
          return null;
        }

        return raw;


      } catch (e) {
        window.AppLogger.warn('[AUTH]', 'Could not get anonymous user id', e);
      }
    }
    else {
      //Get stored user from local storage
      return getStoredUser() || DEMO_USER;
    }

  }


  window.isLoggedIn = isLoggedIn;
  window.getDemoUser = getDemoUser;
  window.getCurrentUser = getCurrentUser;
  window.loginAsDemo = loginAsDemo;
  window.setLoggedIn = setLoggedIn;
  window.logout = logout;
})();

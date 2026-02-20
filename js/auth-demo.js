/**
 * Demo auth: fixed user profile and login state in localStorage.
 * For workshop/demo only. Use isLoggedIn(), getDemoUser(), loginAsDemo(), logout().
 */
(function() {
  var KEY_LOGGED_IN = 'wego_logged_in';
  var KEY_USER = 'wego_demo_user';
  var KEY_ANON_USER = 'wego_anon_user';
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
    externalId: KEY_EXTERNAL_ID
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
      return localStorage.getItem(KEY_LOGGED_IN) === 'true';
    } catch (e) {
      return false;
    }
  }

  function getStoredUser() {
    try {
      var raw = localStorage.getItem(KEY_USER);
      return raw ? JSON.parse(raw) : null;
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
      localStorage.setItem(KEY_LOGGED_IN, 'true');
      localStorage.setItem(KEY_USER, JSON.stringify(user || DEMO_USER));
    } catch (e) {
      console.warn('Auth demo: could not save to localStorage', e);
    }
  }

  function loginAsDemo() {

    //Braze SDK Login Function
    if (window.braze) {
      window.braze.changeUser(DEMO_USER.externalId);
    }

    //Update Logged In User To Local Storage
    setLoggedIn(DEMO_USER);
  }

  function logout() {
    try {
      localStorage.removeItem(KEY_LOGGED_IN);
      localStorage.removeItem(KEY_USER);
      localStorage.removeItem(KEY_ANON_USER);
    } catch (e) {}
  }

  function getCurrentUser() {
    if (!isLoggedIn()) 
    {
      //BRAZE SDK - Get current anonymous user id and store in local storage
      try{

          var raw = localStorage.getItem(KEY_ANON_USER);

          if(!raw)
          {
            window.braze.getDeviceId(function(devId)
            {
              if (devId) {
                ANON_USER.deviceId =  devId;
                localStorage.setItem(KEY_ANON_USER, JSON.stringify(ANON_USER));
              }
            });

            return null;
          }

          return JSON.parse(raw);
        
       
      } catch (e) {
        console.warn('Auth demo: could not get anonymous user id', e);
      }
    }
    else{
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

/**
 * Braze SDK initialization parameters and startup.
 * Replace placeholder values with your Braze dashboard credentials (Settings > App Settings).
 * Load after: 1) Braze Web SDK, 2) braze.js (BrazeHelpers).
 *
 * Sample script order in HTML:
 *   <script src="https://js.appboycdn.com/web-sdk/4.2/braze.min.js"></script>
 *   <script src="js/braze.js"></script>
 *   <script src="js/brazesdk.js"></script>
 *
 * Sample code to initialize with a custom config (instead of auto-init):
 *   BrazeHelpers.initialize(BrazeSDKConfig.apiKey, BrazeSDKConfig.options);
 *   // or after changing config:
 *   BrazeSDK.config.apiKey = 'your-key';
 *   BrazeSDK.config.options.baseUrl = 'sdk.iad-01.braze.com';
 *   BrazeSDK.init();
 */
(function(global) {
  'use strict';

  /**
   * Braze initialization parameters.
   * - apiKey: Web SDK API key from Braze dashboard (Settings > App Settings / API Keys).
   * - options.baseUrl: SDK endpoint for your cluster (e.g. sdk.iad-05.braze.com).
   * - options.enableLogging: Set true for debug logs.
   * - options.allowUserSuppliedJavascript: Set true to support custom HTML in messages.
   * - options.automaticallyShowInAppMessages: Set false to handle in-app message display yourself.
   */
  var BRAZE_SDK_CONFIG = {
    apiKey: '91530c80-6e0b-4f8d-84c1-0d3d6b174451',
    options: {
      baseUrl: 'sdk.iad-03.braze.com',
      enableLogging: true,
      allowUserSuppliedJavascript: true,
      automaticallyShowInAppMessages: true
    }
  };

  /**
   * Initialize Braze using BrazeHelpers and the config above.
   * Call this after BrazeHelpers is available (e.g. on DOMContentLoaded or after script load).
   */
  function initBraze() {
    if (typeof global.BrazeHelpers === 'undefined' || !global.BrazeHelpers.initialize) {
      console.warn('BrazeSDK: BrazeHelpers not found. Load braze.js before brazesdk.js.');
      return false;
    }
    var apiKey = BRAZE_SDK_CONFIG.apiKey;
    var options = BRAZE_SDK_CONFIG.options || {};
    return global.BrazeHelpers.initialize(apiKey, options);
  }

  // Sample: initialize when this script runs (Braze SDK and braze.js must be loaded first).
  if (typeof global.BrazeHelpers !== 'undefined' && global.BrazeHelpers.initialize) {
    initBraze();
  }

  global.BrazeSDKConfig = BRAZE_SDK_CONFIG;
  global.BrazeSDK = {
    config: BRAZE_SDK_CONFIG,
    init: initBraze
  };
})(typeof window !== 'undefined' ? window : this);

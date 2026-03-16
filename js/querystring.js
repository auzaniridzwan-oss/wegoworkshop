/**
 * Querystring helpers and search params (localStorage) for home → search_results
 */

var SEARCH_PARAMS_KEY = 'wego_search_params';

function getSearchParams() {
  try {
    var raw = localStorage.getItem(SEARCH_PARAMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setSearchParams(params) {
  try {
    localStorage.setItem(SEARCH_PARAMS_KEY, JSON.stringify(params || {}));
  } catch (e) {
    window.AppLogger.warn('[STORAGE]', 'Could not save search params to localStorage', e);
  }
}

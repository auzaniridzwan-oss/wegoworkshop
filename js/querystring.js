/**
 * Querystring helpers and search params (localStorage) for home → search_results
 */

function getSearchParams() {
  return window.StorageManager.get('search_params', {});
}

function setSearchParams(params) {
  try {
    window.StorageManager.set('search_params', params || {});
  } catch (e) {
    window.AppLogger.warn('[STORAGE]', 'Could not save search params to localStorage', e);
  }
}

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
    console.warn('Could not save search params to localStorage', e);
  }
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [key, value] of params) {
    try {
      obj[key] = value.includes('{') ? JSON.parse(decodeURIComponent(value)) : value;
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}

function buildQueryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  }
  const s = search.toString();
  return s ? '?' + s : '';
}

function navigateWithParams(path, params) {
  window.location.href = path + buildQueryString(params);
}

/**
 * Merge current query params with new ones (for booking flow)
 */
function mergeAndNavigate(path, newParams) {
  const current = getQueryParams();
  navigateWithParams(path, { ...current, ...newParams });
}

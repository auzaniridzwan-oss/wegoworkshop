/**
 * Toast helper: programmatically show a Flowbite-style toast, then auto-dismiss.
 * Exposes window.Toast = { show: function(message, type) }
 * type: 'success' | 'error' (default 'success')
 */
(function() {
  var DISMISS_MS = 4000;

  function ensureContainer() {
    var id = 'toast-container';
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = 'fixed bottom-5 right-5 z-[100] flex flex-col gap-2';
    document.body.appendChild(el);
    return el;
  }

  function show(message, type) {
    type = type || 'success';
    var container = ensureContainer();
    var id = 'toast-' + type + '-' + Date.now();

    var isSuccess = type === 'success';
    var iconBg = isSuccess ? 'bg-green-100' : 'bg-red-100';
    var iconColor = isSuccess ? 'text-green-500' : 'text-red-500';
    var iconClass = isSuccess ? 'fa-check' : 'fa-times';

    var toast = document.createElement('div');
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.className = 'flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400';

    toast.innerHTML =
      '<div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ' + iconBg + ' ' + iconColor + '">' +
        '<i class="fa-solid ' + iconClass + '"></i>' +
      '</div>' +
      '<div class="ms-3 text-sm font-normal">' + (message || '') + '</div>' +
      '<button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close">' +
        '<span class="sr-only">Close</span>' +
        '<i class="fa-solid fa-xmark"></i>' +
      '</button>';

    var closeBtn = toast.querySelector('button');
    function remove() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }

    closeBtn.addEventListener('click', remove);
    container.appendChild(toast);

    var timeout = setTimeout(remove, DISMISS_MS);
    toast._clearTimeout = function() {
      clearTimeout(timeout);
    };
  }

  window.Toast = { show: show };
})();

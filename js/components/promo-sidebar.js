/**
 * Promo sidebar: replace image, title, and description.
 * Use PromoSidebar.update({ imageUrl, title, description }) or individual setters.
 */
(function () {
  var CONTAINER_ID = 'ux_promo_sidebar';
  var flag_brazeRefresh = false;

  function getContainer() {
    return document.getElementById(CONTAINER_ID);
  }

  /**
   * Update promo sidebar elements (image, title, description).
   * @param {Object} options - { imageUrl, title, description }; all optional
   * @returns {boolean} - true if the sidebar was found and at least one element updated
   */
  function update(options) {
    var container = getContainer();
    if (!container || !options || typeof options !== 'object') return false;

    var imageUrl = options.imageUrl;
    var title = options.title;
    var description = options.description;

    var imageEl = container.querySelector('.promo-image');
    var titleEl = container.querySelector('.promo-title');
    var descEl = container.querySelector('.promo-description');

    var updated = false;

    if (imageEl && imageUrl !== undefined && imageUrl !== null) {
      imageEl.style.backgroundImage = 'url(' + String(imageUrl) + ')';
      imageEl.style.backgroundSize = 'cover';
      imageEl.style.backgroundPosition = 'center';
      if (title != null) imageEl.setAttribute('aria-label', String(title));
      updated = true;
    }

    if (titleEl && title !== undefined && title !== null) {
      titleEl.textContent = String(title);
      updated = true;
    }

    if (descEl && description !== undefined && description !== null) {
      descEl.textContent = String(description);
      updated = true;
    }

    return updated;
  }

  window.BrazeHelpers.subscribeToBannersUpdates(function (bannersPayload) {
    try {
      console.log('Banners updated:', bannersPayload);

      var sdk = window.BrazeHelpers.getBraze();
      var promosidebarbanners = sdk.getBanner(CONTAINER_ID);

      if (!promosidebarbanners) return;

      var container = getContainer();

      sdk.insertBanner(promosidebarbanners, container);
    }
    catch (e) {
      console.error('Error updating promo sidebar:', e);
    }
  });

  if (!flag_brazeRefresh) {
    window.BrazeHelpers.getBraze().requestBannersRefresh([CONTAINER_ID]);
    flag_brazeRefresh = true;
  }

  window.PromoSidebar = { update: update };
})();

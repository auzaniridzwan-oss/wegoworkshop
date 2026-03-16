/**
 * Promo sidebar: replace image, title, and description.
 * Use PromoSidebar.update({ imageUrl, title, description }) or individual setters.
 */
(function () {
  var CONTAINER_ID = "ux_promo_sidebar";

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

  function brazeUpdatePromoSidebar() {
    if (!window.Braze2) return false;
    if (!typeof (window.Braze2.subscribeToBannersUpdates) === 'function') return false;

    window.Braze2.subscribeToBannersUpdates(function (bannersPayload) {
      try {
        window.AppLogger.debug('[SDK]', 'Banners updated', bannersPayload);

        var sdk = window.Braze2.getBraze();
        var promosidebarbanners = sdk.getBanner(CONTAINER_ID);
        var container = getContainer();
        //var allBanners = sdk.getAllBanners();

        if (!promosidebarbanners) return;
        if (!container) return;

        sdk.insertBanner(promosidebarbanners, container);
      }
      catch (e) {
        window.AppLogger.error('[SDK]', 'Error updating promo sidebar', e);
        return false;
      }
    });

    return true;

    // window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
  }

  function tryInit() {
    if (brazeUpdatePromoSidebar()) return;
    var observer = new MutationObserver(function () {
      if (brazeUpdatePromoSidebar()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  window.PromoSidebar = { update: update };
})();

/**
 * Promo feed: replace an existing promo block by id (0, 1, 2, 3 or "ux_promo_feed_0", etc.).
 * Use PromoFeed.replacePromo(id, { title, description, link, imageUrl }).
 */
(function() {
  var CONTAINER_ID = 'ux_promo_feed';
  var BLOCK_PREFIX = 'ux_promo_feed_';

  function getBlock(id) {
    var elId = typeof id === 'number' ? BLOCK_PREFIX + id : (String(id).indexOf(BLOCK_PREFIX) === 0 ? id : BLOCK_PREFIX + id);
    return document.getElementById(elId);
  }

  /**
   * Replace an existing promo in the feed by id.
   * @param {number|string} id - Promo index (0, 1, 2, 3) or full id (e.g. "ux_promo_feed_1")
   * @param {Object} options - { title, description, link, imageUrl }
   * @returns {boolean} - true if the promo was found and updated
   */
  function replacePromo(id, options) {
    var block = getBlock(id);
    if (!block || !options || typeof options !== 'object') return false;

    var title = options.title;
    var description = options.description;
    var link = options.link;
    var imageUrl = options.imageUrl;

    var titleEl = block.querySelector('.promo-title');
    var descEl = block.querySelector('.promo-description');
    var linkEl = block.querySelector('.learn-more');
    var imgEl = block.querySelector('.promo-image img');

    if (titleEl && title !== undefined && title !== null) titleEl.textContent = String(title);
    if (descEl && description !== undefined && description !== null) descEl.textContent = String(description);
    if (linkEl && link !== undefined && link !== null) {
      linkEl.setAttribute('href', String(link));
    }
    if (imgEl && imageUrl !== undefined && imageUrl !== null) {
      imgEl.setAttribute('src', String(imageUrl));
      if (title != null) imgEl.setAttribute('alt', String(title));
    }

    return true;
  }

  window.PromoFeed = { replacePromo: replacePromo };
})();

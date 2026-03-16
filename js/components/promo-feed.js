/**
 * Promo feed: replace an existing promo block by id (0, 1, 2, 3 or "ux_promo_feed_0", etc.).
 * Use PromoFeed.replacePromo(id, { title, description, link, imageUrl }).
 */
(function () {
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
    var linkLabel = options.linkLabel;
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
    if (linkEl && linkLabel !== undefined && linkLabel !== null) {
      linkEl.textContent = String(linkLabel);
    }
    if (imgEl && imageUrl !== undefined && imageUrl !== null) {
      imgEl.setAttribute('src', String(imageUrl));
      if (title != null) imgEl.setAttribute('alt', String(title));
    }

    return true;
  }

  function brazeUpdatePromoFeed() {
    if (!window.Braze2) return false;
    if (typeof window.Braze2.subscribeToContentCardsUpdates !== 'function') return false;

    window.Braze2.subscribeToContentCardsUpdates(function (payload) {
      try {
        window.AppLogger.debug('[SDK]', 'CC updated', payload);

        if (!payload || payload.cards.length <= 0) return;

        var cards = payload.cards;

        var feedCards = cards.filter(card => card.extras["message_type"] === 'promo_feed');

        if (feedCards.length === 0) return;

        feedCards.forEach((feedCard) => {

          var options = {
            imageUrl: feedCard.imageUrl || '',
            title: feedCard.title != null ? String(feedCard.title) : '',
            description: feedCard.description != null ? String(feedCard.description) : '',
            link: feedCard.url != null ? String(feedCard.url) : '#',
            linkLabel: feedCard.linkText != null ? String(feedCard.linkText) : 'Learn more'
          };

          var feedCardIndex = feedCard.extras["index"] != null ? Number(feedCard.extras["index"]) : 0;

          replacePromo(feedCardIndex, options);
        });
      }
      catch (e) {
        window.AppLogger.error('[SDK]', 'Error updating promo feed', e);
        return false;
      }
    });

    return true;
  }

  function tryInit() {
    if (brazeUpdatePromoFeed()) return;
    var observer = new MutationObserver(function () {
      if (brazeUpdatePromoFeed()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  window.PromoFeed = { replacePromo: replacePromo };

})();
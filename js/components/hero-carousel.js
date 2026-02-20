/**
 * Hero carousel: data layer and Braze subscription. UI is driven by Alpine in hero-carousel.html.
 */
(function() {
  var STORAGE_KEY = 'wego_hero_carousel';
  var RESET_FLAG = 'wego_hero_carousel_reset';

  function getMediaUrl(relativeUrl) {
    return new URL(relativeUrl, window.location.origin).href;
  }

  var DEMO_SLIDES = [
    {
      backgroundImage: getMediaUrl("../media/hero_sea.jpg"),
      title: 'Find your next trip',
      text: 'Compare flights, hotels and car rentals across Southeast Asia and beyond.',
      ctaHref: '#ux_promo_feed',
      ctaLabel: 'Explore deals'
    },
    {
      backgroundImage: getMediaUrl("../media/hero_singapore.jpg"),
      title: 'Fly to Singapore',
      text: 'Great fares from across the region to the Lion City.',
      ctaHref: 'search_results.html?from=KUL&to=SIN',
      ctaLabel: 'Search flights'
    },
    {
      backgroundImage: getMediaUrl("../media/hero_beach.jpg"),
      title: 'Beach getaways',
      text: 'Cebu, Phuket and more – find your next escape.',
      ctaHref: 'search_results.html?from=SIN&to=BKK',
      ctaLabel: 'Discover'
    }
  ];

  function getStoredSlides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return null;
  }

  function getSlides() {
    try {
      if (sessionStorage.getItem(RESET_FLAG)) {
        sessionStorage.removeItem(RESET_FLAG);
        saveSlides(DEMO_SLIDES);
        return DEMO_SLIDES.slice();
      }
    } catch (e) {}
    var stored = getStoredSlides();
    return stored ? stored.slice() : DEMO_SLIDES.slice();
  }

  function saveSlides(slidesArray) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slidesArray));
    } catch (e) {}
  }

  function addItem(item) {
    var store = window.Alpine && Alpine.store('heroCarousel');
    var current = getStoredSlides();
    var slidesData = current ? current.slice() : DEMO_SLIDES.slice();
    var newSlide = {
      backgroundImage: item.backgroundImage || '',
      title: item.title != null ? String(item.title) : '',
      text: item.text != null ? String(item.text) : '',
      ctaHref: item.ctaHref != null ? String(item.ctaHref) : '#',
      ctaLabel: item.ctaLabel != null ? String(item.ctaLabel) : 'Learn more'
    };
    slidesData.unshift(newSlide);
    saveSlides(slidesData);
    if (store) {
      store.slides = slidesData.slice();
      store.currentIndex = 0;
    }
    return true;
  }

  function reset() {
    saveSlides(DEMO_SLIDES);
    var store = window.Alpine && Alpine.store('heroCarousel');
    if (store) {
      store.slides = DEMO_SLIDES.slice();
      store.currentIndex = 0;
    }
    return true;
  }

  function defineHeroStore() {
    if (!window.Alpine || Alpine.store('heroCarousel')) return;
    Alpine.store('heroCarousel', {
      slides: getSlides(),
      currentIndex: 0,
      get total() {
        return this.slides.length;
      },
      goPrev: function() {
        if (this.total === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.total) % this.total;
      },
      goNext: function() {
        if (this.total === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.total;
      },
      slideStyle: function(slide) {
        var url = (slide && slide.backgroundImage) || '';
        return "linear-gradient(135deg, rgba(232,93,4,0.25) 0%, rgba(245,245,245,0.65) 60%), url('" + url + "')";
      }
    });
    var store = Alpine.store('heroCarousel');
    var stored = getStoredSlides();
    if (!stored) saveSlides(store.slides);
  }

  if (window.Alpine) {
    defineHeroStore();
  } else {
    window.addEventListener('alpine:init', defineHeroStore);
  }

  function brazeUpdateCarousel() {
    if (!window.BrazeHelpers) return;
    window.BrazeHelpers.subscribeToContentCardsUpdates(function(payload) {
      try {
        if (!payload || !payload.cards || payload.cards.length <= 0) return;
        var carouselCards = payload.cards.filter(function(card) {
          return card.extras && card.extras.message_type === 'hero_carousel';
        });
        carouselCards.forEach(function(heroCard) {
          addItem({
            backgroundImage: heroCard.imageUrl || '',
            title: heroCard.title != null ? String(heroCard.title) : '',
            text: heroCard.description != null ? String(heroCard.description) : '',
            ctaHref: heroCard.url != null ? String(heroCard.url) : '#',
            ctaLabel: heroCard.linkText != null ? String(heroCard.linkText) : 'Learn more'
          });
        });
      } catch (e) {
        console.error('Error getting content cards:', e);
      }
    });
    if (window.BrazeHelpers.getBraze()) {
      window.BrazeHelpers.getBraze().requestContentCardsRefresh();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', brazeUpdateCarousel);
  } else {
    brazeUpdateCarousel();
  }

  window.HeroCarousel = {
    addItem: addItem,
    reset: reset,
    getSlides: getSlides
  };
})();

/**
 * Hero carousel: data-driven slides from localStorage, prev/next, addItem, reset.
 * Initial demo state can be restored via reset() or sessionStorage reset flag (used by global Reset).
 */
(function() {
  var STORAGE_KEY = 'wego_hero_carousel';
  var RESET_FLAG = 'wego_hero_carousel_reset';
  var currentIndex = 0;
  var track = null;
  var slides = [];
  var total = 0;

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

  function getMediaUrl(relativeUrl) {
    var absoluteUrl = new URL(relativeUrl, window.location.origin).href;
    return absoluteUrl;
  }

  function getCarousel() {
    var el = document.getElementById('ux_hero_carousel');
    if (!el || !el.querySelector('.hero-carousel-track')) return null;
    return el;
  }

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

  function buildSlideElement(data) {
    var slide = document.createElement('div');
    slide.className = 'hero-carousel-slide';
    slide.style.backgroundImage = "linear-gradient(135deg, rgba(232,93,4,0.25) 0%, rgba(245,245,245,0.65) 60%), url('" + (data.backgroundImage || '') + "')";
    var inner = document.createElement('div');
    inner.className = 'hero-carousel-inner';
    var title = document.createElement('h1');
    title.className = 'hero-carousel-title';
    title.textContent = data.title || '';
    var text = document.createElement('p');
    text.className = 'hero-carousel-text';
    text.textContent = data.text || '';
    var cta = document.createElement('a');
    cta.href = data.ctaHref || '#';
    cta.className = 'btn btn-primary hero-carousel-cta';
    cta.textContent = data.ctaLabel || 'Learn more';
    inner.appendChild(title);
    inner.appendChild(text);
    inner.appendChild(cta);
    slide.appendChild(inner);
    return slide;
  }

  function renderTrack(slidesData) {
    if (!track || !Array.isArray(slidesData)) return;
    track.innerHTML = '';
    slidesData.forEach(function(data, i) {
      var slideEl = buildSlideElement(data);
      if (i === 0) slideEl.classList.add('hero-carousel-slide--active');
      track.appendChild(slideEl);
    });
  }

  function refreshSlidesArray() {
    var carousel = getCarousel();
    if (!carousel) return;
    track = carousel.querySelector('.hero-carousel-track');
    slides = [].slice.call(carousel.querySelectorAll('.hero-carousel-slide'));
    total = slides.length;
    currentIndex = 0;
  }

  function updateSlide() {
    if (!track || total === 0) return;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('hero-carousel-slide--active', i === currentIndex);
    });
    track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
  }

  function goPrev() {
    if (total === 0) return;
    currentIndex = (currentIndex - 1 + total) % total;
    updateSlide();
  }

  function goNext() {
    if (total === 0) return;
    currentIndex = (currentIndex + 1) % total;
    updateSlide();
  }

  function bindButtons(carousel) {
    var prev = carousel.querySelector('.hero-carousel-prev');
    var next = carousel.querySelector('.hero-carousel-next');
    if (prev) prev.addEventListener('click', goPrev);
    if (next) next.addEventListener('click', goNext);
  }

  /**
   * Add a new slide at the beginning of the carousel and show it.
   * item: { backgroundImage, title, text, ctaHref, ctaLabel }
   */
  function addItem(item) {
    var carousel = getCarousel();
    if (!carousel) return false;
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
    renderTrack(slidesData);
    refreshSlidesArray();
    updateSlide();
    return true;
  }

  /**
   * Reset carousel to initial demo state.
   */
  function reset() {
    var carousel = getCarousel();
    if (!carousel) return false;
    saveSlides(DEMO_SLIDES);
    renderTrack(DEMO_SLIDES);
    refreshSlidesArray();
    updateSlide();
    return true;
  }

  function init() {
    var carousel = getCarousel();
    if (!carousel) return false;
    track = carousel.querySelector('.hero-carousel-track');
    var slidesData = getSlides();
    if (slidesData.length > 0) {
      var stored = getStoredSlides();
      if (!stored) saveSlides(slidesData);
      renderTrack(slidesData);
    }
    refreshSlidesArray();
    if (total === 0) return false;
    updateSlide();
    bindButtons(carousel);
    brazeUpdateCarousel();
    return true;
  }

  function brazeUpdateCarousel() {
    window.BrazeHelpers.subscribeToContentCardsUpdates(function(payload) {
      try
      {
        console.log('CC updated:', payload);
  
        if(!payload || payload.cards.length <= 0) return;
        
        var cards = payload.cards;
        
        var carouselCards = cards.filter(card => card.extras["message_type"] === 'hero_carousel');

        if(carouselCards.length === 0) return;

        carouselCards.forEach((heroCard) => {

          var newSlide = {
            backgroundImage: heroCard.imageUrl || '',
            title: heroCard.title != null ? String(heroCard.title) : '',
            text: heroCard.description != null ? String(heroCard.description) : '',
            ctaHref: heroCard.url != null ? String(heroCard.url) : '#',
            ctaLabel: heroCard.linkText != null ? String(heroCard.linkText) : 'Learn more'
          };

          addItem(newSlide);
        });
       
      }
      catch(e)
      {
        console.error('Error getting content cards:', e);
      }
    });
  
    window.BrazeHelpers.getBraze().requestContentCardsRefresh();

  }

  function tryInit() {
    if (init()) return;
    var observer = new MutationObserver(function() {
      if (init()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  window.HeroCarousel = {
    addItem: addItem,
    reset: reset,
    getSlides: getSlides
  };
})();

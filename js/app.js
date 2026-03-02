/**
 * SPA app: view switching and booking step logic.
 * Depends: Braze2, getBookingState, setBookingState, resetBookingState, setSearchParams, getSearchParams,
 * generateMockFlights, getCityById, getAirlineById, FLIGHT_CLASSES, BAGGAGE_OPTIONS, MEAL_OPTIONS, ANCILLARY_OPTIONS.
 */
(function () {
  'use strict';

  var VIEW_IDS = ['view-home', 'view-results', 'view-booking', 'view-complete'];
  var STEP_ORDER = ['baggage', 'seats', 'meals', 'others', 'passenger', 'review', 'payment'];
  var currentBookingStep = null;
  var resultsFlights = [];
  var resultsSortBy = 'price';
  var resultsFilterAirline = null;
  var CONTAINER_ID = "ux_promo_sidebar";

  function showView(viewId) {
    VIEW_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.toggle('active', id === viewId);
      }
    });
  }

  function showBookingStep(stepId) {
    currentBookingStep = stepId;
    STEP_ORDER.forEach(function (s) {
      var el = document.getElementById('step-content-' + s);
      if (el) el.classList.toggle('active', s === stepId);
    });
    updateBookingSummary(stepId);
    renderStep(stepId);
    if (window.BookingSteps && window.BookingSteps.setActiveStep) {
      window.BookingSteps.setActiveStep(stepId);
    }
  }

  function getCurrentBookingStep() {
    return currentBookingStep;
  }

  function getBookingParams() {
    var params = getBookingState();
    return {
      from: params.from || 'SIN',
      to: params.to || 'KUL',
      depart: params.depart || '',
      returnDate: params.return || '',
      flightClass: params.class || 'economy',
      passengers: params.passengers || '1',
      flightIndex: parseInt(params.flightIndex, 10) || 0,
      baggage: params.baggage || '',
      seats: Array.isArray(params.seats) ? params.seats.slice() : (typeof params.seats === 'string' && params.seats ? params.seats.split(',').filter(Boolean) : []),
      meal: params.meal || '',
      ancillaries: Array.isArray(params.ancillaries) ? params.ancillaries.slice() : (typeof params.ancillaries === 'string' && params.ancillaries ? params.ancillaries.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : []),
      passengerName: params.passengerName || '',
      passengerPhone: params.passengerPhone || '',
      passengerEmail: params.passengerEmail || '',
      passengerPassport: params.passengerPassport || ''
    };
  }

  function updateBookingSummary(stepId) {
    var p = getBookingParams();
    var flights = generateMockFlights({ from: p.from, to: p.to, departDate: p.depart, returnDate: p.returnDate, class: p.flightClass, passengers: parseInt(p.passengers, 10) });
    var flight = flights[p.flightIndex] || flights[0];
    var fromCity = getCityById(p.from);
    var toCity = getCityById(p.to);
    var airline = getAirlineById(flight.airlineId);
    var classLabel = FLIGHT_CLASSES.find(function (c) { return c.id === p.flightClass; });
    var classDisplay = classLabel ? classLabel.name : p.flightClass;

    var sumAirline = document.getElementById('sum-airline');
    var sumFrom = document.getElementById('sum-from');
    var sumTo = document.getElementById('sum-to');
    var sumDates = document.getElementById('sum-dates');
    var sumPassengers = document.getElementById('sum-passengers');
    var sumClass = document.getElementById('sum-class');
    if (sumAirline) sumAirline.textContent = airline.name;
    if (sumFrom) sumFrom.textContent = fromCity.name + ' (' + p.from + ')';
    if (sumTo) sumTo.textContent = toCity.name + ' (' + p.to + ')';
    if (sumDates) sumDates.textContent = (p.depart || '–') + (p.returnDate ? ' – ' + p.returnDate : '');
    if (sumPassengers) sumPassengers.textContent = p.passengers;
    if (sumClass) sumClass.textContent = classDisplay;

    var extraRows = ['row-sum-passenger', 'row-sum-baggage', 'row-sum-seats', 'row-sum-meal', 'row-sum-ancillaries'];
    extraRows.forEach(function (id) { var r = document.getElementById(id); if (r) r.style.display = 'none'; });
    if (stepId === 'payment') {
      var sumPassenger = document.getElementById('sum-passenger');
      var sumBaggage = document.getElementById('sum-baggage');
      var sumSeats = document.getElementById('sum-seats');
      var sumMeal = document.getElementById('sum-meal');
      var sumAncillaries = document.getElementById('sum-ancillaries');
      if (sumPassenger) sumPassenger.textContent = p.passengerName || p.passengerEmail || '–';
      if (sumBaggage) sumBaggage.textContent = p.baggage ? (BAGGAGE_OPTIONS.find(function (b) { return b.id === p.baggage; }) || {}).name || p.baggage : '–';
      if (sumSeats) sumSeats.textContent = p.seats.length ? p.seats.join(', ') : '–';
      if (sumMeal) sumMeal.textContent = p.meal ? (MEAL_OPTIONS.find(function (m) { return m.id === p.meal; }) || {}).name || p.meal : '–';
      if (sumAncillaries) sumAncillaries.textContent = p.ancillaries.length ? p.ancillaries.join(', ') : '–';
      extraRows.forEach(function (id) { var r = document.getElementById(id); if (r) r.style.display = ''; });
    }
  }

  function renderStep(stepId) {
    var p = getBookingParams();
    var flights = generateMockFlights({ from: p.from, to: p.to, departDate: p.depart, returnDate: p.returnDate, class: p.flightClass, passengers: parseInt(p.passengers, 10) });
    var flight = flights[p.flightIndex] || flights[0];
    var fromCity = getCityById(p.from);
    var toCity = getCityById(p.to);
    var airline = getAirlineById(flight.airlineId);
    var classLabel = FLIGHT_CLASSES.find(function (c) { return c.id === p.flightClass; });
    var classDisplay = classLabel ? classLabel.name : p.flightClass;
    var numPassengers = parseInt(p.passengers, 10) || 1;

    if (stepId === 'baggage') {
      var baggageCards = document.getElementById('baggage-cards');
      if (!baggageCards) return;
      baggageCards.innerHTML = '';
      var selectedBaggage = p.baggage || '';
      function updateBaggageSelection() {
        baggageCards.querySelectorAll('.baggage-card').forEach(function (card) {
          var id = card.querySelector('.select-baggage').getAttribute('data-id');
          var selected = selectedBaggage === id;
          card.classList.toggle('selected', selected);
          var btn = card.querySelector('.select-baggage');
          btn.className = 'btn ' + (selected ? 'btn-secondary' : 'btn-primary') + ' select-baggage';
          btn.textContent = selected ? 'SELECTED' : 'SELECT';
        });
      }
      BAGGAGE_OPTIONS.forEach(function (opt) {
        var card = document.createElement('div');
        card.className = 'baggage-card' + (selectedBaggage === opt.id ? ' selected' : '');
        card.innerHTML = '<h3>' + opt.name + '</h3><ul><li>1 x ' + opt.checkIn.split(' ').slice(1).join(' ') + ' check-in</li><li>1 x ' + opt.carryOn.split(' ').slice(1).join(' ') + ' carry-on</li><li>Cancel Fee: $' + opt.cancelFee + '</li>' + (opt.freeChanges ? '<li>' + opt.freeChanges + ' x Free Change</li>' : '') + '<li>Change Fee: $' + opt.changeFee + '</li></ul><button type="button" class="btn ' + (selectedBaggage === opt.id ? 'btn-secondary' : 'btn-primary') + ' select-baggage" data-id="' + opt.id + '">' + (selectedBaggage === opt.id ? 'SELECTED' : 'SELECT') + '</button>';
        card.querySelector('.select-baggage').addEventListener('click', function () {
          selectedBaggage = opt.id;
          setBookingState({ baggage: opt.id });
          updateBaggageSelection();
        });
        baggageCards.appendChild(card);
      });
      document.getElementById('baggage-prev').onclick = function () { showView('view-results'); };
      document.getElementById('baggage-next').onclick = function () {
        setBookingState({ baggage: selectedBaggage });
        showBookingStep('seats');
        window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
      };
    }

    if (stepId === 'seats') {
      var seatMap = document.getElementById('seat-map');
      if (!seatMap) return;
      seatMap.innerHTML = '';
      var selectedSeats = p.seats.length ? p.seats.slice() : [];
      var rows = [12, 11, 10, 9, 8, 7, 6, 5, 4];
      var occupied = ['4A', '4B', '5C', '6D', '7A', '8B', '9C', '10D', '11A', '12B'];
      rows.forEach(function (row) {
        var rowEl = document.createElement('div');
        rowEl.className = 'seat-row';
        rowEl.innerHTML = '<span class="row-num">' + row + '</span>';
        var left = document.createElement('div');
        left.className = 'seat-group';
        ['A', 'B'].forEach(function (col) {
          var id = row + col;
          var isOccupied = occupied.indexOf(id) !== -1;
          var isSelected = selectedSeats.indexOf(id) !== -1;
          var seat = document.createElement('button');
          seat.type = 'button';
          seat.className = 'seat' + (isOccupied ? ' occupied' : '') + (isSelected ? ' selected' : '');
          seat.textContent = id;
          seat.dataset.seat = id;
          if (!isOccupied) {
            seat.addEventListener('click', function () {
              var idx = selectedSeats.indexOf(id);
              if (idx !== -1) selectedSeats = selectedSeats.filter(function (s) { return s !== id; });
              else if (selectedSeats.length < numPassengers) selectedSeats = selectedSeats.concat(id).sort();
              seatMap.querySelectorAll('.seat').forEach(function (s) {
                s.classList.toggle('selected', selectedSeats.indexOf(s.dataset.seat) !== -1);
              });
              setBookingState({ seats: selectedSeats.join(',') });
            });
          }
          left.appendChild(seat);
        });
        rowEl.appendChild(left);
        var aisle = document.createElement('div');
        aisle.className = 'seat-group aisle';
        ['C', 'D'].forEach(function (col) {
          var id = row + col;
          var isOccupied = occupied.indexOf(id) !== -1;
          var isSelected = selectedSeats.indexOf(id) !== -1;
          var seat = document.createElement('button');
          seat.type = 'button';
          seat.className = 'seat' + (isOccupied ? ' occupied' : '') + (isSelected ? ' selected' : '');
          seat.textContent = id;
          seat.dataset.seat = id;
          if (!isOccupied) {
            seat.addEventListener('click', function () {
              var idx = selectedSeats.indexOf(id);
              if (idx !== -1) selectedSeats = selectedSeats.filter(function (s) { return s !== id; });
              else if (selectedSeats.length < numPassengers) selectedSeats = selectedSeats.concat(id).sort();
              seatMap.querySelectorAll('.seat').forEach(function (s) {
                s.classList.toggle('selected', selectedSeats.indexOf(s.dataset.seat) !== -1);
              });
              setBookingState({ seats: selectedSeats.join(',') });
            });
          }
          aisle.appendChild(seat);
        });
        rowEl.appendChild(aisle);
        seatMap.appendChild(rowEl);
      });
      document.getElementById('seats-prev').onclick = function () { setBookingState({ seats: selectedSeats.join(',') }); showBookingStep('baggage'); };
      document.getElementById('seats-next').onclick = function () {
        setBookingState({ seats: selectedSeats.join(',') });
        showBookingStep('meals');
        window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
      };
    }

    if (stepId === 'meals') {
      var mealCards = document.getElementById('meal-cards');
      if (!mealCards) return;
      mealCards.innerHTML = '';
      var selectedMeal = p.meal || '';
      function updateMealSelection() {
        mealCards.querySelectorAll('.meal-card').forEach(function (card) {
          var id = card.querySelector('.select-meal').getAttribute('data-id');
          var selected = selectedMeal === id;
          card.classList.toggle('selected', selected);
          var btn = card.querySelector('.select-meal');
          btn.className = 'btn ' + (selected ? 'btn-secondary' : 'btn-primary') + ' select-meal';
          btn.textContent = selected ? 'SELECTED' : 'SELECT';
        });
      }
      MEAL_OPTIONS.forEach(function (opt) {
        var card = document.createElement('div');
        card.className = 'meal-card' + (selectedMeal === opt.id ? ' selected' : '');
        card.innerHTML = '<h3>' + opt.name + '</h3><div class="meal-image" role="img" aria-label="Meal"><i class="' + opt.icon + '"></i><br/> ' + opt.description + '</div><div class="meal-body"><button type="button" class="btn ' + (selectedMeal === opt.id ? 'btn-secondary' : 'btn-primary') + ' select-meal" data-id="' + opt.id + '">' + (selectedMeal === opt.id ? 'SELECTED' : 'SELECT') + '</button></div>';
        card.querySelector('.select-meal').addEventListener('click', function () {
          selectedMeal = opt.id;
          setBookingState({ meal: opt.id });
          updateMealSelection();
        });
        mealCards.appendChild(card);
      });
      document.getElementById('meals-prev').onclick = function () { setBookingState({ meal: selectedMeal }); showBookingStep('seats'); };
      document.getElementById('meals-next').onclick = function () {
        setBookingState({ meal: selectedMeal });
        showBookingStep('others');
        window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
      };
    }

    if (stepId === 'others') {
      var ancillaryCards = document.getElementById('ancillary-cards');
      if (!ancillaryCards) return;
      ancillaryCards.innerHTML = '';
      var selectedAncillaries = p.ancillaries.length ? p.ancillaries.slice() : [];
      ANCILLARY_OPTIONS.forEach(function (opt) {
        var isSelected = selectedAncillaries.indexOf(opt.id) !== -1;
        var card = document.createElement('div');
        card.className = 'ancillary-card' + (isSelected ? ' selected' : '');
        card.innerHTML = '<div class="ancillary-image" role="img" aria-label="Option"><i class="' + opt.icon + '"></i><br/>' + opt.description + '</div><div class="ancillary-body"><h3>' + opt.name + '</h3><button type="button" class="btn ' + (isSelected ? 'btn-secondary' : 'btn-primary') + ' toggle-ancillary" data-id="' + opt.id + '">' + (isSelected ? 'SELECTED' : 'SELECT') + '</button></div>';
        card.querySelector('.toggle-ancillary').addEventListener('click', function () {
          var idx = selectedAncillaries.indexOf(opt.id);
          if (idx !== -1) selectedAncillaries = selectedAncillaries.filter(function (id) { return id !== opt.id; });
          else selectedAncillaries = selectedAncillaries.concat(opt.id).sort();
          setBookingState({ ancillaries: selectedAncillaries.join(',') });
          card.classList.toggle('selected', selectedAncillaries.indexOf(opt.id) !== -1);
          var btn = card.querySelector('.toggle-ancillary');
          btn.textContent = selectedAncillaries.indexOf(opt.id) !== -1 ? 'SELECTED' : 'SELECT';
          btn.className = 'btn ' + (selectedAncillaries.indexOf(opt.id) !== -1 ? 'btn-secondary' : 'btn-primary') + ' toggle-ancillary';
        });
        ancillaryCards.appendChild(card);
      });
      document.getElementById('others-prev').onclick = function () { setBookingState({ ancillaries: selectedAncillaries.join(',') }); showBookingStep('meals'); };
      document.getElementById('others-next').onclick = function () {
        setBookingState({ ancillaries: selectedAncillaries.join(',') });
        showBookingStep('passenger');
        window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
      };
    }

    if (stepId === 'passenger') {
      var nameEl = document.getElementById('passenger-name');
      var phoneEl = document.getElementById('passenger-phone');
      var emailEl = document.getElementById('passenger-email');
      var passportEl = document.getElementById('passenger-passport');
      if (p.passengerName || p.passengerEmail) {
        if (nameEl) nameEl.value = p.passengerName || '';
        if (phoneEl) phoneEl.value = p.passengerPhone || '';
        if (emailEl) emailEl.value = p.passengerEmail || '';
        if (passportEl) passportEl.value = p.passengerPassport || '';
      } else if (typeof getCurrentUser === 'function') {
        var user = getCurrentUser();
        if (user) {
          if (nameEl) nameEl.value = user.name || '';
          if (phoneEl) phoneEl.value = user.phone || '';
          if (emailEl) emailEl.value = user.email || '';
          if (passportEl) passportEl.value = user.passport || '';
        }
      }
      if (typeof isLoggedIn === 'function' && !isLoggedIn() && !(p.passengerName || p.passengerPhone || p.passengerEmail || p.passengerPassport)) {
        setTimeout(function () {
          if (window.LoginOverlay && window.LoginOverlay.open) window.LoginOverlay.open();
        }, 500);
      }
      document.getElementById('passenger-prev').onclick = function () { showBookingStep('others'); };
      document.getElementById('passenger-next').onclick = function () {
        var name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
        var phone = (phoneEl && phoneEl.value) ? phoneEl.value.trim() : '';
        var email = (emailEl && emailEl.value) ? emailEl.value.trim() : '';
        var passport = (passportEl && passportEl.value) ? passportEl.value.trim() : '';
        if (!name || !phone || !email || !passport) return;
        setBookingState({ passengerName: name, passengerPhone: phone, passengerEmail: email, passengerPassport: passport });
        showBookingStep('review');
      };
    }

    if (stepId === 'review') {
      var baggageOpt = p.baggage ? BAGGAGE_OPTIONS.find(function (o) { return o.id === p.baggage; }) : null;
      document.getElementById('review-flight-content').textContent = airline.name + ' · ' + fromCity.name + ' (' + p.from + ') → ' + toCity.name + ' (' + p.to + ') · ' + (p.depart || '–') + (p.returnDate ? ' – ' + p.returnDate : '') + ' · ' + classDisplay + ' · ' + p.passengers + ' passenger(s) · ' + flight.priceFormatted;
      document.getElementById('review-baggage-content').textContent = baggageOpt ? baggageOpt.name + ' (' + baggageOpt.checkIn + ' check-in, ' + baggageOpt.carryOn + ' carry-on)' : (p.baggage || 'Not selected');
      document.getElementById('review-seats-content').textContent = p.seats.length ? p.seats.join(', ') : 'Not selected';
      var mealOpt = p.meal ? MEAL_OPTIONS.find(function (o) { return o.id === p.meal; }) : null;
      document.getElementById('review-meals-content').textContent = mealOpt ? mealOpt.name : (p.meal || 'Not selected');
      document.getElementById('review-ancillaries-content').textContent = p.ancillaries.length ? p.ancillaries.map(function (id) {
        var o = ANCILLARY_OPTIONS.find(function (opt) { return opt.id === id; });
        return o ? o.name : id;
      }).join(', ') : 'None selected';
      var passengerSummary = p.passengerName ? p.passengerName + ' · ' + p.passengerPhone + ' · ' + p.passengerEmail + ' · Passport: ' + p.passengerPassport : 'Not entered';
      document.getElementById('review-passenger-content').textContent = passengerSummary;

      document.getElementById('change-baggage').onclick = function (e) { e.preventDefault(); showBookingStep('baggage'); };
      document.getElementById('change-seats').onclick = function (e) { e.preventDefault(); showBookingStep('seats'); };
      document.getElementById('change-meals').onclick = function (e) { e.preventDefault(); showBookingStep('meals'); };
      document.getElementById('change-ancillaries').onclick = function (e) { e.preventDefault(); showBookingStep('others'); };
      document.getElementById('change-passenger').onclick = function (e) { e.preventDefault(); showBookingStep('passenger'); };
      document.getElementById('review-prev').onclick = function () { showBookingStep('passenger'); };
      document.getElementById('proceed-payment').onclick = function () { showBookingStep('payment'); };
    }

    if (stepId === 'payment') {
      var user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      var cardNumberEl = document.getElementById('card-number');
      var cardNameEl = document.getElementById('card-name');
      var expiryEl = document.getElementById('expiry');
      var addressEl = document.getElementById('address');
      if (cardNumberEl && user && user.cardNumber) cardNumberEl.value = user.cardNumber;
      if (cardNameEl) cardNameEl.value = (user && user.cardName) ? user.cardName : (p.passengerName || '');
      if (expiryEl && user && user.expiry) expiryEl.value = user.expiry;
      if (addressEl && user && user.address) addressEl.value = user.address;

      var form = document.getElementById('payment-form');
      var processingOverlay = document.getElementById('payment-processing-overlay');
      form.onsubmit = function (e) {
        e.preventDefault();
        if (processingOverlay) {
          processingOverlay.classList.add('is-open');
          processingOverlay.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
        setTimeout(function () {
          var bookingCode = generateBookingCode();
          setBookingState({ bookingCode: bookingCode });
          if (window.Braze2) {
            window.Braze2.trackEvent('booked-flight', { origin: p.from, destination: p.to, bookingCode: bookingCode });
            window.Braze2.getBraze().requestContentCardsRefresh();
          }
          if (window.BrazePanel) {
            window.BrazePanel.addEvent('booked-flight', { origin: p.from, destination: p.to, bookingCode: bookingCode });
          }

          if (processingOverlay) {
            processingOverlay.classList.remove('is-open');
            processingOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
          showView('view-complete');
          renderComplete();
        }, 3000);
      };
      document.getElementById('payment-prev').onclick = function () { showBookingStep('review'); };
      document.getElementById('payment-cancel').onclick = function () { showView('view-home'); };
    }
  }

  function renderResults() {
    var params = getSearchParams();
    var from = params.from || 'SIN';
    var to = params.to || 'KUL';
    var depart = params.depart || new Date().toISOString().slice(0, 10);
    var returnDate = params.return || depart;
    var flightClass = params.class || 'economy';
    var passengers = parseInt(params.passengers, 10) || 1;
    resultsFlights = generateMockFlights({ from: from, to: to, departDate: depart, returnDate: returnDate, class: flightClass, passengers: passengers });
    resultsSortBy = 'price';
    resultsFilterAirline = null;
    renderFlightList();
    var sortBtns = document.querySelectorAll('#view-results .sort-btn');
    sortBtns.forEach(function (btn) {
      btn.onclick = function () {
        resultsSortBy = btn.getAttribute('data-sort');
        renderFlightList();
      };
    });
    var filterBtns = document.querySelectorAll('#view-results .filter-btn');
    filterBtns.forEach(function (btn) {
      btn.onclick = function () {
        var f = btn.getAttribute('data-filter');
        if (f === 'airline') resultsFilterAirline = resultsFilterAirline ? null : resultsFlights[0].airlineId;
        renderFlightList();
      };
    });
  }

  function renderFlightList() {
    var list = resultsFlights.slice();
    if (resultsFilterAirline) list = list.filter(function (f) { return f.airlineId === resultsFilterAirline; });
    if (resultsSortBy === 'price') list.sort(function (a, b) { return a.price - b.price; });
    else if (resultsSortBy === 'duration') list.sort(function (a, b) { return a.durationMinutes - b.durationMinutes; });
    var container = document.getElementById('flight-list');
    if (!container) return;
    container.innerHTML = '';
    var params = getSearchParams();
    var from = params.from || 'SIN';
    var to = params.to || 'KUL';
    var depart = params.depart || '';
    var returnDate = params.return || '';
    var flightClass = params.class || 'economy';
    var passengers = params.passengers || '1';
    list.forEach(function (f, i) {
      var originalIndex = resultsFlights.indexOf(f);
      var div = document.createElement('div');
      div.className = 'flight-card';
      div.innerHTML = '<div class="legs"><div class="leg"><div><div class="airline">' + f.airlineName + '</div><div class="time">' + f.departTime + '</div><div class="airport">' + f.from + ' ' + f.fromAirport + '</div></div><div class="meta">' + f.duration + '<br>' + f.planeType + '</div><div><div class="time">' + f.arrivalTime + '</div><div class="airport">' + f.to + ' ' + f.toAirport + '</div></div></div><div class="leg-divider"></div><div class="leg"><div><div class="airline">Return</div><div class="time">' + f.departTime + '</div><div class="airport">' + f.to + '</div></div><div class="meta">' + f.duration + '</div><div><div class="time">' + f.arrivalTime + '</div><div class="airport">' + f.from + '</div></div></div></div><div class="price-cell"><div class="price">' + f.priceFormatted + '</div><button type="button" class="btn btn-primary buy-btn" data-index="' + originalIndex + '">BUY</button></div>';
      div.querySelector('.buy-btn').addEventListener('click', function () {
        setBookingState({ from: from, to: to, depart: depart, return: returnDate, class: flightClass, passengers: passengers, flightIndex: originalIndex });
        showView('view-booking');
        showBookingStep('baggage');
      });
      container.appendChild(div);
    });
  }

  function renderComplete() {
    var params = getBookingState();
    var bookingCode = params.bookingCode || generateBookingCode();
    var el = document.getElementById('booking-code');
    if (el) el.textContent = bookingCode;
    setTimeout(function () {
      if (window.Notifications && window.Notifications.addMessage) {
        var to = params.to || 'KUL';
        var toCity = getCityById(to);
        window.Notifications.addMessage('Your flight to ' + (toCity && toCity.name ? toCity.name : to) + ' is confirmed. Booking code: ' + bookingCode + '.');
      }
    }, 400);
    document.getElementById('add-to-calendar').onclick = function () {
      alert('Add to calendar: ' + bookingCode + ' – ' + (params.depart || '') + ' ' + (params.from || '') + ' to ' + (params.to || ''));
    };
    document.getElementById('download-app').onclick = function () {
      alert('Download our app from the App Store or Google Play.');
    };
    document.getElementById('subscribe-updates').onclick = function () {
      alert('Subscribe to updates – you can integrate Braze here to capture the email.');
    };
    document.getElementById('new-search-btn').onclick = function () {
      resetBookingState();
      showView('view-home');
    };
  }

  window.showView = showView;
  window.showBookingStep = showBookingStep;
  window.getCurrentBookingStep = getCurrentBookingStep;

  function init() {
    resetBookingState();
    var fromSelect = document.getElementById('from-city');
    var toSelect = document.getElementById('to-city');
    if (fromSelect && toSelect && typeof TRAVEL_CITIES !== 'undefined') {
      TRAVEL_CITIES.forEach(function (city) {
        fromSelect.appendChild(new Option(city.name + ' (' + city.id + ')', city.id));
        toSelect.appendChild(new Option(city.name + ' (' + city.id + ')', city.id));
      });
    }
    var today = new Date().toISOString().slice(0, 10);
    var departDate = document.getElementById('depart-date');
    var returnDate = document.getElementById('return-date');
    if (departDate) departDate.min = today;
    if (returnDate) returnDate.min = today;
    if (departDate && returnDate) {
      departDate.addEventListener('change', function () {
        returnDate.min = this.value || today;
      });
    }
    var form = document.getElementById('flight-search');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var from = document.getElementById('from-city').value;
        var to = document.getElementById('to-city').value;
        var depart = document.getElementById('depart-date').value;
        var ret = document.getElementById('return-date').value;
        var cls = document.getElementById('class').value;
        var passengers = (document.getElementById('passengers').value || '1');
        setSearchParams({ from: from, to: to, depart: depart, return: ret, class: cls, passengers: passengers });
        if (window.Braze2) {
          window.Braze2.trackEvent('searched-flight', { origin: from, destination: to, depart: depart, return: ret, class: cls, passengers: passengers });
          window.Braze2.getBraze().requestBannersRefresh([CONTAINER_ID]);
        }
        if (window.BrazePanel) {
          window.BrazePanel.addEvent('searched-flight', { "origin": from, "destination": to, "depart": depart, "return": ret, "class": cls, "passengers": passengers });
        }
        showView('view-results');
        renderResults();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

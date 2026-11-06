/* =========================================================
   script.js: all the JavaScript for BrightFix Plumbing
   Sections:
     1. Page loaded check
     2. Tabs + FAQ accordion      (Step 4)
     3. Products + quote basket   (Step 5)
     4. Animations + counters     (Step 6)
     5. Leaflet map               (Step 7)
     6. Gallery + lightbox        (Step 8)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. PAGE LOADED CHECK ---------- */
  console.log('BrightFix script.js is working!');

  /* The other sections will be added below, one step at a time */
  /* ---------- 2a. TABS ---------- */
  var tabs = document.querySelectorAll('.tabs__tab');
  var panels = document.querySelectorAll('.tabs__panel');

  // Select one tab and show only its panel
  function showTab(selectedTab) {
    tabs.forEach(function (tab) {
      var isSelected = (tab === selectedTab);
      tab.setAttribute('aria-selected', isSelected);
      tab.tabIndex = isSelected ? 0 : -1;
    });

    panels.forEach(function (panel) {
      panel.hidden = (panel.id !== selectedTab.getAttribute('aria-controls'));
    });
  }

  tabs.forEach(function (tab, index) {
    // Mouse click
    tab.addEventListener('click', function () {
      showTab(tab);
    });

    // Keyboard: left and right arrows move between tabs
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') {
        next = tabs[(index + 1) % tabs.length];
      } else if (event.key === 'ArrowLeft') {
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      }
      if (next) {
        next.focus();
        showTab(next);
      }
    });
  });

  /* ---------- 2b. FAQ EXPAND / COLLAPSE ALL ---------- */
  var faqControls = document.querySelector('.faq-controls');

  if (faqControls) {
    var faqItems = document.querySelectorAll('.faq details');
    var faqStatus = document.getElementById('faq-status');

    faqControls.hidden = false; // show the buttons now that JS is running

    document.getElementById('faq-expand-all').addEventListener('click', function () {
      faqItems.forEach(function (item) { item.open = true; });
      faqStatus.textContent = 'All answers expanded.';
    });

    document.getElementById('faq-collapse-all').addEventListener('click', function () {
      faqItems.forEach(function (item) { item.open = false; });
      faqStatus.textContent = 'All answers collapsed.';
    });
  }
    /* ---------- 3. PRODUCTS + QUOTE BASKET ---------- */

  // 3a. The ONE list of products. Everything else is built from this.
  var products = [
    { id: 'general-repairs', name: 'General Plumbing Repairs', price: 199,
      description: 'Leaking taps, damaged pipes, blocked drains, and other everyday plumbing problems. We provide reliable repairs for homes and businesses.' },
    { id: 'leak-detection', name: 'Leak Detection & Repair', price: 249,
      description: 'We locate and repair water leaks in pipes, taps, toilets, and other plumbing fixtures to help prevent water damage and unnecessary water loss.' },
    { id: 'drain-unblocking', name: 'Drain Unblocking', price: 299,
      description: 'Fast assistance with blocked sinks, showers, toilets, and drains. We clear stubborn blockages and get your plumbing flowing properly again.' },
    { id: 'toilet-repairs', name: 'Toilet Repairs & Installation', price: 349,
      description: 'Toilet repairs, replacements, leaking cisterns, faulty valves, and new toilet installations.' },
    { id: 'geyser-repairs', name: 'Geyser Repairs & Maintenance', price: 399,
      description: 'Professional geyser assistance, including leaks, faulty components, pressure problems, and general maintenance.' },
    { id: 'emergency', name: 'Emergency Plumbing', price: 449,
      description: 'Urgent plumbing assistance for burst pipes, major leaks, overflowing toilets, and other plumbing emergencies.' }
  ];

  function formatPrice(amount) {
    return 'R' + amount.toFixed(2);
  }

  function findProduct(id) {
    return products.find(function (p) { return p.id === id; });
  }

  // 3b. The basket: a list of product ids, saved in localStorage
  var basket = [];
  try {
    basket = JSON.parse(localStorage.getItem('brightfix-basket')) || [];
  } catch (error) {
    basket = [];
  }
  // throw away any ids that no longer exist
  basket = basket.filter(function (id) { return findProduct(id); });

  function saveBasket() {
    try {
      localStorage.setItem('brightfix-basket', JSON.stringify(basket));
    } catch (error) {
      // storage blocked: the basket still works until the page closes
    }
  }

  function basketTotal() {
    return basket.reduce(function (sum, id) { return sum + findProduct(id).price; }, 0);
  }

  // 3c. PRODUCTS PAGE (only runs if the page has the product grid)
  var grid = document.getElementById('product-grid');

  if (grid) {
    var searchBox = document.getElementById('product-search');
    var maxSlider = document.getElementById('product-max');
    var maxOutput = document.getElementById('product-max-out');
    var sortBox = document.getElementById('product-sort');
    var countText = document.getElementById('product-count');
    var quoteList = document.getElementById('quote-list');
    var quoteTotal = document.getElementById('quote-total');

    // Build ONE card from ONE product
    function createCard(product) {
      var inBasket = basket.indexOf(product.id) !== -1;

      var card = document.createElement('article');
      card.className = 'card';

      var info = document.createElement('div');
      var title = document.createElement('h2');
      title.textContent = product.name;
      var desc = document.createElement('p');
      desc.textContent = product.description;
      var price = document.createElement('p');
      price.className = 'card__price';
      price.textContent = formatPrice(product.price);
      info.append(title, desc, price);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn';
      button.textContent = inBasket ? 'Remove from quote' : 'Add to quote';
      button.addEventListener('click', function () {
        toggleInBasket(product.id);
      });

      card.append(info, button);
      return card;
    }

    // Work out which products to show, then build their cards
    function renderProducts() {
      var text = searchBox.value.trim().toLowerCase();
      var maxPrice = Number(maxSlider.value);
      maxOutput.textContent = 'R' + maxPrice;

      var shown = products.filter(function (p) {
        var matchesText = (p.name + ' ' + p.description).toLowerCase().indexOf(text) !== -1;
        return matchesText && p.price <= maxPrice;
      });

      if (sortBox.value === 'low') {
        shown.sort(function (a, b) { return a.price - b.price; });
      } else if (sortBox.value === 'high') {
        shown.sort(function (a, b) { return b.price - a.price; });
      } else if (sortBox.value === 'name') {
        shown.sort(function (a, b) { return a.name.localeCompare(b.name); });
      }

      grid.textContent = ''; // empty the grid

      if (shown.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'no-results';
        empty.textContent = 'No products match your search. Try a different word or a higher price.';
        grid.append(empty);
      } else {
        shown.forEach(function (p) { grid.append(createCard(p)); });
      }

      countText.textContent = 'Showing ' + shown.length + ' of ' + products.length + ' products';
    }

    // Build the quote box
    function renderQuote() {
      quoteList.textContent = '';

      if (basket.length === 0) {
        var empty = document.createElement('li');
        empty.textContent = 'Your quote is empty. Add a product above.';
        quoteList.append(empty);
      }

      basket.forEach(function (id) {
        var product = findProduct(id);
        var item = document.createElement('li');

        var label = document.createElement('span');
        label.textContent = product.name + ' (' + formatPrice(product.price) + ')';

        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'quote__remove';
        remove.textContent = 'Remove';
        remove.setAttribute('aria-label', 'Remove ' + product.name + ' from quote');
        remove.addEventListener('click', function () { toggleInBasket(id); });

        item.append(label, remove);
        quoteList.append(item);
      });

      quoteTotal.textContent = formatPrice(basketTotal());
    }

    // Add if it's not in the basket, remove if it is
    function toggleInBasket(id) {
      var position = basket.indexOf(id);
      if (position === -1) {
        basket.push(id);
      } else {
        basket.splice(position, 1);
      }
      saveBasket();
      renderProducts();
      renderQuote();
    }

    // Re-draw whenever the visitor types, drags or picks
    searchBox.addEventListener('input', renderProducts);
    maxSlider.addEventListener('input', renderProducts);
    sortBox.addEventListener('change', renderProducts);

    document.getElementById('quote-clear').addEventListener('click', function () {
      basket = [];
      saveBasket();
      renderProducts();
      renderQuote();
    });

    // First draw
    renderProducts();
    renderQuote();
  }

  // 3d. ENQUIRY PAGE (only runs if the page has the product dropdown)
  var productSelect = document.getElementById('product');
  var messageBox = document.getElementById('message');

  if (productSelect) {
    // Build the dropdown options from the same list
    products.forEach(function (p) {
      var option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name + ' (' + formatPrice(p.price) + ')';
      productSelect.append(option);
    });

    // If there's a quote, pre-fill the form
    if (basket.length > 0) {
      productSelect.value = basket[0];

      if (messageBox && messageBox.value === '') {
        var lines = basket.map(function (id) {
          var p = findProduct(id);
          return '- ' + p.name + ' (' + formatPrice(p.price) + ')';
        });
        messageBox.value = 'I would like a quote for:\n' + lines.join('\n') +
          '\nEstimated total: ' + formatPrice(basketTotal());
      }
    }
  }
    /* ---------- 4. ANIMATIONS + COUNTERS ---------- */

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 4a. SCROLL REVEAL
  if ('IntersectionObserver' in window && !reducedMotion) {

    // Give cards in a grid a small delay each, so they appear one after another
    // (the product grid is left out because its cards get rebuilt by the filter)
    document.querySelectorAll('.card-grid:not(#product-grid)').forEach(function (gridEl) {
      Array.from(gridEl.children).forEach(function (child, i) {
        child.style.animationDelay = (i * 0.12) + 's';
      });
    });

    var revealItems = document.querySelectorAll(
      '.hero, .card-grid:not(#product-grid) > .card, .stats__item, .location-card, .faq, .quote, .form'
    );

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target); // only animate once
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(function (item) {
      item.classList.add('reveal');
      revealObserver.observe(item);
    });
  }

  // 4b. ANIMATED COUNTERS
  var counters = document.querySelectorAll('.stats__number');

  function runCounter(el) {
    var target = Number(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var duration = 1500; // milliseconds
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.round(target * progress) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step); // do it again on the next frame
      }
    }

    requestAnimationFrame(step);
  }

  if (counters.length > 0 && 'IntersectionObserver' in window && !reducedMotion) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) {
      el.textContent = '0' + (el.dataset.suffix || ''); // start at zero
      counterObserver.observe(el);
    });
  }

  // 4c. WATER-FILL SCROLL PROGRESS BAR
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true'); // decoration only
  document.body.prepend(progressBar);

  function updateProgressBar() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar();

    /* ---------- 5. LEAFLET MAP ---------- */

  var mapElement = document.getElementById('map');

  // Only run on the homepage, and only if Leaflet loaded
  if (mapElement && window.L) {

    var base = [-25.8603, 28.1894]; // Centurion

    // 5a. Make the map and add the picture "tiles" from OpenStreetMap
var map = L.map('map', { scrollWheelZoom: false }).setView(base, 11);

// Wheel zoom only works after you click the map, so scrolling the page won't zoom it
map.on('click', function () { map.scrollWheelZoom.enable(); });
map.on('mouseout', function () { map.scrollWheelZoom.disable(); });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 5b. The areas we cover (one list again, like the products)
    var areas = [
      { name: 'Centurion',      coords: [-25.8603, 28.1894], time: 'Head office, usually within 30 minutes' },
      { name: 'Pretoria East',  coords: [-25.7826, 28.2766], time: 'Usually within 45 minutes' },
      { name: 'Midrand',        coords: [-25.9992, 28.1263], time: 'Usually within 45 minutes' },
      { name: 'Irene',          coords: [-25.8806, 28.2155], time: 'Usually within 30 minutes' }
    ];

    // 5c. A group to hold all the markers
    var areaMarkers = L.layerGroup();

    areas.forEach(function (area) {
      var link = 'enquiry.html?area=' + encodeURIComponent(area.name);
      L.marker(area.coords)
        .bindPopup(
          '<div class="map-popup"><strong>' + area.name + '</strong><br>' +
          area.time + '<br><a href="' + link + '">Book here</a></div>'
        )
        .addTo(areaMarkers);
    });

    areaMarkers.addTo(map);

    // 5d. The service-area circle (radius is in metres)
    var serviceArea = L.circle(base, {
      radius: 15000,
      color: '#167bff',
      fillColor: '#167bff',
      fillOpacity: 0.1
    }).addTo(map);

    // 5e. Little checkbox menu to switch layers on and off
    L.control.layers(null, {
      'Area markers': areaMarkers,
      'Service area': serviceArea
    }, { collapsed: false }).addTo(map);

    // 5f. "Find my nearest area" button
    var nearestButton = document.getElementById('map-nearest');
    var nearestOutput = document.getElementById('map-nearest-out');
    var youMarker = null;

    nearestButton.addEventListener('click', function () {
      if (!navigator.geolocation) {
        nearestOutput.textContent = 'Your browser can’t share your location.';
        return;
      }

      nearestOutput.textContent = 'Finding you…';

      navigator.geolocation.getCurrentPosition(function (position) {
        var you = L.latLng(position.coords.latitude, position.coords.longitude);
        var nearest = null;
        var shortest = Infinity;

        areas.forEach(function (area) {
          var distance = you.distanceTo(L.latLng(area.coords)); // metres
          if (distance < shortest) {
            shortest = distance;
            nearest = area;
          }
        });

        if (youMarker) { map.removeLayer(youMarker); }
        youMarker = L.circleMarker(you, { radius: 8, color: '#d9480f' })
          .bindPopup('You are here')
          .addTo(map);

        map.fitBounds([you, nearest.coords], { padding: [40, 40] });

        nearestOutput.textContent = 'Your nearest area is ' + nearest.name +
          ' (about ' + (shortest / 1000).toFixed(1) + ' km away).';
      }, function () {
        nearestOutput.textContent = 'We couldn’t get your location. You can still click the markers.';
      });
    });
  }

  // 5g. ENQUIRY PAGE: if you clicked "Book here" on the map, mention the area
  var areaFromMap = new URLSearchParams(window.location.search).get('area');
  var enquiryMessage = document.getElementById('message');

  if (areaFromMap && enquiryMessage && enquiryMessage.value.indexOf('Area:') === -1) {
    enquiryMessage.value = (enquiryMessage.value ? enquiryMessage.value + '\n\n' : '') +
      'Area: ' + areaFromMap;
  }
    /* ---------- 6. GALLERY + LIGHTBOX ---------- */

  var galleryGrid = document.getElementById('gallery-grid');

  if (galleryGrid) {

    // 6a. The list of photos (change these to match your files)
    var works = [
      { src: 'images/gallery/leak-1.jpeg',     category: 'leaks',     title: 'Leaking kitchen tap repaired',   alt: 'A plumber fixing a leaking kitchen tap' },
      { src: 'images/gallery/drain-1.jpeg',    category: 'drains',    title:'Outside drain unblocked',       alt: 'An outside drain that has been unblocked' },
      { src: 'images/gallery/geyser-1.jpeg',   category: 'geysers',   title: 'New geyser installed',           alt: 'A newly installed geyser in a ceiling' },
      { src: 'images/gallery/bathroom-1.jpeg', category: 'bathrooms', title: 'Bathroom pipes replaced',        alt: 'A bathroom with new copper pipes' },
      { src: 'images/gallery/leak-2.jpeg',     category: 'leaks',     title: 'Burst pipe repaired',            alt: 'A burst pipe after repair' },
      { src: 'images/gallery/drain-2.jpeg',    category: 'drains',    title: 'Blocked drain cleared',       alt: 'A plumber clearing a blocked drain' },
    ];

    // Shown instead of any photo that can't be found
var FALLBACK_IMAGE = 'images/brightfix-plumbing-mascot.png';
    function useFallback(img) {
      img.addEventListener('error', function () {
        if (!img.dataset.fallback) {      // only once, so it can't loop forever
          img.dataset.fallback = 'yes';
          img.src = FALLBACK_IMAGE;
        }
      });
    }

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxCount = document.getElementById('lightbox-count');
    var visibleWorks = works.slice(); // the photos currently shown
    var currentIndex = 0;

    useFallback(lightboxImg);

    // 6b. Build the grid for the chosen category
    function renderGallery(category) {
      visibleWorks = works.filter(function (work) {
        return category === 'all' || work.category === category;
      });

      galleryGrid.textContent = '';

      visibleWorks.forEach(function (work, index) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'gallery__item';
        item.setAttribute('aria-label', 'Open larger view: ' + work.title);

        var img = document.createElement('img');
        img.src = work.src;
        img.alt = work.alt;
        img.loading = 'lazy';
        useFallback(img);

        var caption = document.createElement('span');
        caption.className = 'gallery__caption';
        caption.textContent = work.title;

        item.append(img, caption);
        item.addEventListener('click', function () { openLightbox(index); });
        galleryGrid.append(item);
      });
    }

    // 6c. Lightbox
    function showPhoto(index) {
      // % makes it loop: after the last photo comes the first
      currentIndex = (index + visibleWorks.length) % visibleWorks.length;
      var work = visibleWorks[currentIndex];

      delete lightboxImg.dataset.fallback;
      lightboxImg.src = work.src;
      lightboxImg.alt = work.alt;
      lightboxCaption.textContent = work.title;
      lightboxCount.textContent = 'Photo ' + (currentIndex + 1) + ' of ' + visibleWorks.length;
    }

    function openLightbox(index) {
      showPhoto(index);
      lightbox.showModal();
    }

    document.getElementById('lightbox-prev').addEventListener('click', function () {
      showPhoto(currentIndex - 1);
    });

    document.getElementById('lightbox-next').addEventListener('click', function () {
      showPhoto(currentIndex + 1);
    });

    document.getElementById('lightbox-close').addEventListener('click', function () {
      lightbox.close();
    });

    // Arrow keys move between photos (Esc closes by itself)
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { showPhoto(currentIndex + 1); }
      if (event.key === 'ArrowLeft')  { showPhoto(currentIndex - 1); }
    });

    // Clicking the dark area outside the box also closes it
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) { lightbox.close(); }
    });

    // 6d. Filter buttons
    var filterButtons = document.querySelectorAll('.gallery-filter');

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (b) {
          b.setAttribute('aria-pressed', b === button);
        });
        renderGallery(button.dataset.filter);
      });
    });

    // First draw
    renderGallery('all');
  }
    /* ---------- 7. FORM VALIDATION (shared by contact + enquiry) ---------- */

  // 7a. Find the visible name of a field (its label, without the *)
  function fieldLabel(field) {
    var label = document.querySelector('label[for="' + field.id + '"]');
    return label ? label.textContent.replace('*', '').trim() : 'This field';
  }

  // 7b. Check ONE field. Returns an error message, or '' if it is fine.
  function getFieldError(field) {
    var value = field.value.trim();
    var label = fieldLabel(field);

    // Required but empty
    if (field.required && value === '') {
      return field.tagName === 'SELECT'
        ? 'Please choose an option for "' + label + '".'
        : label + ' is required.';
    }

    // Optional and empty = fine
    if (value === '') { return ''; }

    // Names: letters, spaces, hyphens and apostrophes only
    if (field.name === 'name' && !/^[A-Za-z\u00C0-\u024F' -]+$/.test(value)) {
      return 'Names can only contain letters, spaces, hyphens and apostrophes.';
    }

    // Email: something@something.something
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Enter an email address like name@example.com.';
    }

    // Anything with a pattern (the phone number)
    if (field.pattern && !new RegExp('^(?:' + field.pattern + ')$').test(value)) {
      return field.title || 'This does not look right. Please check the format.';
    }

    // Character lengths
    if (field.minLength > 0 && value.length < field.minLength) {
      return label + ' must be at least ' + field.minLength + ' characters (you have ' + value.length + ').';
    }
    if (field.maxLength > 0 && value.length > field.maxLength) {
      return label + ' must be ' + field.maxLength + ' characters or fewer.';
    }

    // Dates
    if (field.type === 'date') {
      if (field.validity.badInput) { return 'Enter a real date.'; }
      if (field.min && value < field.min) { return 'Please choose today or a later date.'; }
      if (field.max && value > field.max) { return 'Please choose an earlier date.'; }
    }

    return '';
  }

  // 7c. Show (or clear) the red message under a field
  function showFieldError(field, message) {
    var errorId = field.id + '-error';
    var box = document.getElementById(errorId);

    if (!box) {
      box = document.createElement('span');
      box.id = errorId;
      box.className = 'field-error';
      field.insertAdjacentElement('afterend', box);
    }

    box.textContent = message;

    if (message) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  // 7d. Turn validation on for a whole form.
  // onValid runs only when every field passes.
  function setupValidation(form, onValid) {
    var summary = form.querySelector('.form__error');

    var fields = Array.from(form.elements).filter(function (el) {
      return el.matches('input, select, textarea') && el.type !== 'radio' && el.type !== 'hidden';
    });

    fields.forEach(function (field) {
      // check when the visitor leaves the field
      field.addEventListener('blur', function () {
        showFieldError(field, getFieldError(field));
      });
      // once a field is marked wrong, re-check while typing so the error disappears as soon as it's fixed
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
          showFieldError(field, getFieldError(field));
        }
      });
      // selects and dates fire "change" rather than "input"
      field.addEventListener('change', function () {
        showFieldError(field, getFieldError(field));
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      summary.textContent = '';
      summary.classList.remove('form__ok');

      var firstBad = null;
      var badCount = 0;

      fields.forEach(function (field) {
        var message = getFieldError(field);
        showFieldError(field, message);
        if (message) {
          badCount++;
          if (!firstBad) { firstBad = field; }
        }
      });

      if (firstBad) {
        summary.textContent = 'Please fix ' + badCount + (badCount === 1 ? ' field' : ' fields') + ' marked in red.';
        firstBad.focus();
        return;
      }

      onValid();
    });
  }

  // 7e. CONTACT PAGE
  var contactForm = document.getElementById('contact-form');

  if (contactForm) {
    var contactMessage = document.getElementById('contact-message');
    var contactCount = document.getElementById('contact-count');

    // live character counter
    function updateCount() {
      contactCount.textContent = contactMessage.value.length + ' / ' + contactMessage.maxLength + ' characters';
    }
    contactMessage.addEventListener('input', updateCount);
    updateCount();

        setupValidation(contactForm, function () {
      var f = contactForm.elements;
      var summary = contactForm.querySelector('.form__error');
      var replyBy = contactForm.querySelector('input[name="reply-by"]:checked').value;

      // 1. Compile the answers into an email
      var compiled = compileEmail(
        getRecipient(contactForm),
        f['message-type'].value + ': ' + f['subject'].value.trim(),
        [
          'Name: ' + f['name'].value.trim(),
          'Email: ' + f['email'].value.trim(),
          'Phone: ' + (f['phone'].value.trim() || 'not given'),
          'Type of message: ' + f['message-type'].value,
          'Please reply by: ' + replyBy,
          '',
          'Message:',
          f['message'].value.trim()
        ]
      );

      // 2. Show a preview (textContent keeps it safe)
      document.getElementById('email-to').textContent = compiled.to;
      document.getElementById('email-subject').textContent = compiled.subject;
      document.getElementById('email-body').textContent = compiled.body;

      // 3. Point the buttons at the compiled email
      document.getElementById('email-app').href = compiled.mailto;
      document.getElementById('email-gmail').href = compiled.gmail;

      var status = document.getElementById('email-status');
      status.textContent = '';
      document.getElementById('email-copy').onclick = function () {
        var text = 'To: ' + compiled.to + '\nSubject: ' + compiled.subject + '\n\n' + compiled.body;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            status.textContent = 'Copied. Paste it into a new email.';
          }, function () {
            status.textContent = 'Could not copy. Select the text above and copy it by hand.';
          });
        } else {
          status.textContent = 'Copying is not available here. Select the text above and copy it by hand.';
        }
      };

      // 4. Reveal the box and move the visitor to it
      summary.textContent = 'Your message is ready. Send it using the buttons below.';
      summary.classList.add('form__ok');

      var box = document.getElementById('contact-email-box');
      box.hidden = false;
      box.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      box.focus({ preventScroll: true });
    });
  }
    /* ---------- 8. ENQUIRY: VALIDATE, THEN WORK OUT A RESPONSE ---------- */

  var enquiryForm = document.getElementById('enquiry-form');
  var enquiryDialog = document.getElementById('enquiry-dialog');

  if (enquiryForm && enquiryDialog) {

    var enquiryDate = document.getElementById('enquiry-date');
    var enquirySlot = document.getElementById('enquiry-slot');
    var scheduleRow = document.getElementById('schedule-row');
    var enquirySummary = enquiryForm.querySelector('.form__error');
    var enquiryText = document.getElementById('message');
    var enquiryCount = document.getElementById('enquiry-count');
    var urgencyRadios = enquiryForm.querySelectorAll('input[name="urgency"]');

    // 8a. Small date helpers
    function toISODate(d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    }

    function formatDay(d) {
      return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    function isWeekend(d) {
      return d.getDay() === 0 || d.getDay() === 6;
    }

    function nextWorkingDay(from) {
      var d = new Date(from);
      do { d.setDate(d.getDate() + 1); } while (isWeekend(d));
      return d;
    }

    // Visitors may only pick from today to 90 days away
    var todayDate = new Date();
    var lastDate = new Date();
    lastDate.setDate(lastDate.getDate() + 90);
    enquiryDate.min = toISODate(todayDate);
    enquiryDate.max = toISODate(lastDate);

    // 8b. Character counter
    function updateEnquiryCount() {
      enquiryCount.textContent = enquiryText.value.length + ' / ' + enquiryText.maxLength + ' characters';
    }
    enquiryText.addEventListener('input', updateEnquiryCount);
    updateEnquiryCount();

    // 8c. Hide the date and time when the job is urgent (they are not needed)
    function chosenUrgency() {
      return enquiryForm.querySelector('input[name="urgency"]:checked');
    }

    function updateSchedule() {
      var isStandard = chosenUrgency().value === 'standard';
      scheduleRow.hidden = !isStandard;
      enquiryDate.required = isStandard;
      enquirySlot.required = isStandard;

      if (!isStandard) {
        enquiryDate.value = '';
        enquirySlot.value = '';
        showFieldError(enquiryDate, '');
        showFieldError(enquirySlot, '');
      }
    }

    urgencyRadios.forEach(function (radio) {
      radio.addEventListener('change', updateSchedule);
    });
    updateSchedule();

    // 8d. Work out the availability message
    function buildAvailability(urgency) {
      var now = new Date();

      if (urgency === 'emergency') {
        return 'Emergency: we will call you as soon as we receive this, and aim to have a plumber with you within about 60 minutes.';
      }

      if (urgency === 'urgent') {
        if (!isWeekend(now) && now.getHours() < 15) {
          return 'Next available: today. We aim to arrive within about 3 hours of confirming with you.';
        }
        return 'Next available: ' + formatDay(nextWorkingDay(now)) + ' from 8:00.';
      }

      // standard booking
      var wanted = new Date(enquiryDate.value + 'T00:00:00');
      var slotText = enquirySlot.options[enquirySlot.selectedIndex].text;

      if (isWeekend(wanted)) {
        return 'We book standard jobs Monday to Friday, so your earliest slot is ' +
          formatDay(nextWorkingDay(wanted)) + ' (' + slotText + ').';
      }
      return 'Available: ' + formatDay(wanted) + ', ' + slotText + '.';
    }

    // 8e. Add one row to the cost table
    function addCostRow(body, label, amount, isTotal) {
      var row = document.createElement('tr');
      if (isTotal) { row.className = 'is-total'; }

      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = label;

      var td = document.createElement('td');
      td.textContent = formatPrice(amount);

      row.append(th, td);
      body.append(row);
    }

    // 8f. The form passed validation: process it and show the response
    function showEnquiryResponse() {
      var product = findProduct(enquiryForm.elements['product'].value);
      var urgencyInput = chosenUrgency();
      var fee = Number(urgencyInput.dataset.fee);
      var fullName = enquiryForm.elements['name'].value.trim();
      var email = enquiryForm.elements['email'].value.trim();

      var reference = 'BF-' + toISODate(new Date()).replace(/-/g, '') + '-' +
        Math.floor(1000 + Math.random() * 9000);

      document.getElementById('enquiry-dialog-title').textContent = 'Thank you, ' + fullName.split(' ')[0];
      document.getElementById('enquiry-ref').textContent = reference;

      var costBody = document.getElementById('enquiry-cost');
      costBody.textContent = '';
      addCostRow(costBody, product.name, product.price, false);
      if (fee > 0) {
        addCostRow(costBody, urgencyInput.dataset.label, fee, false);
      }
      addCostRow(costBody, 'Estimated total', product.price + fee, true);

      document.getElementById('enquiry-availability').textContent = buildAvailability(urgencyInput.value);
      document.getElementById('enquiry-next').textContent =
        'We will reply to ' + email + ' within one working day to confirm.';

      // Compile the enquiry (with its estimate) into an email
      var compiled = compileEmail(
        getRecipient(enquiryForm),
        'Enquiry ' + reference + ': ' + product.name,
        [
          'Reference: ' + reference,
          'Name: ' + fullName,
          'Email: ' + email,
          'Phone: ' + (enquiryForm.elements['phone'].value.trim() || 'not given'),
          'Service: ' + product.name + ' (' + formatPrice(product.price) + ')',
          'Urgency: ' + urgencyInput.dataset.label,
          'When: ' + document.getElementById('enquiry-availability').textContent,
          'Estimated total: ' + formatPrice(product.price + fee),
          '',
          'Problem described:',
          enquiryText.value.trim()
        ]
      );
      document.getElementById('enquiry-email-app').href = compiled.mailto;
      document.getElementById('enquiry-email-gmail').href = compiled.gmail;
      // tidy the form for the next enquiry
      enquiryForm.reset();
      Array.from(enquiryForm.elements).forEach(function (el) {
        if (el.matches('input, select, textarea') && el.type !== 'radio') {
          showFieldError(el, '');
        }
      });
      enquirySummary.textContent = '';
      updateSchedule();
      updateEnquiryCount();

      enquiryDialog.showModal();
    }

    setupValidation(enquiryForm, showEnquiryResponse);

    // 8g. Close the popup: button, click outside (Esc works by itself)
    enquiryDialog.addEventListener('click', function (event) {
      if (event.target === enquiryDialog || event.target.closest('[data-close]')) {
        enquiryDialog.close();
      }
    });
  }
    /* ---------- 9. COMPILE A VALIDATED FORM INTO AN EMAIL ---------- */

  // The recipient is read from the form's action attribute: "mailto:BrightFix@Gmail.com"
  function getRecipient(form) {
    return (form.getAttribute('action') || '').replace(/^mailto:/i, '').split('?')[0];
  }

  // Build the email: three ready-made ways to send it
  function compileEmail(recipient, subject, lines) {
    var body = lines.join('\r\n'); // \r\n = a new line in an email
    var encodedSubject = encodeURIComponent(subject);
    var encodedBody = encodeURIComponent(body);

    return {
      to: recipient,
      subject: subject,
      body: body,
      mailto: 'mailto:' + recipient + '?subject=' + encodedSubject + '&body=' + encodedBody,
      gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(recipient) +
             '&su=' + encodedSubject + '&body=' + encodedBody
    };
  }
});

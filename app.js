// STRAND — Minimalist Salon Intelligence & Haircut Directives

(function() {
  'use strict';

  // State Management
  let salons = [];
  let userLocation = {
    lat: 40.7230,
    lng: -73.9980,
    name: "SoHo, Lower Manhattan"
  };
  let activeDemandCard = null;
  let activeFilter = {
    searchQuery: "",
    maxDistance: 5.0,
    hairType: "all",
    sortBy: "demandScore"
  };
  let activeSalonModal = null;
  let map = null;
  let markersLayer = null;
  let deferredPrompt = null;
  let currentUploadedPhotoDataUrl = null;

  // Haversine Distance in Miles
  function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  // Initialize App
  function init() {
    loadStoredData();
    updateSalonDistances();
    initMap();
    renderAll();
    setupEventListeners();
    setupPwaInstallation();
  }

  // LocalStorage loader
  function loadStoredData() {
    const storedSalons = localStorage.getItem('strand_salons');
    if (storedSalons) {
      try {
        salons = JSON.parse(storedSalons);
      } catch (e) {
        salons = JSON.parse(JSON.stringify(INITIAL_SALONS));
      }
    } else {
      salons = JSON.parse(JSON.stringify(INITIAL_SALONS));
    }

    const storedDemand = localStorage.getItem('strand_activeDemand');
    if (storedDemand) {
      try {
        activeDemandCard = JSON.parse(storedDemand);
      } catch (e) {
        activeDemandCard = getDefaultDemandCard();
      }
    } else {
      activeDemandCard = getDefaultDemandCard();
    }
  }

  function getDefaultDemandCard() {
    return {
      clientName: "Julian Vance",
      hairType: "Curly (3B)",
      targetStyle: "Low Taper Fade + Preserved Curls",
      maxCutOffTop: "Max 0.5 inch (Clean split ends only)",
      sidesDirective: "Low skin taper, keep temple hairline natural",
      necklineDirective: "Soft tapered natural neck line",
      clipperRestriction: "Do not cut higher than temple with clippers",
      traumaAlert: "Barbers often push back my hairline cowlick. Please follow natural contour.",
      communicationVibe: "Consultative (Mirror check-in before length snips)",
      referencePhoto: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
      photoNotes: "Follow the low drop taper shown in this reference photo.",
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  function saveDemandCard(card) {
    activeDemandCard = card;
    localStorage.setItem('strand_activeDemand', JSON.stringify(card));
    renderDemandBanner();
    renderSalons();
  }

  function updateSalonDistances() {
    salons.forEach(salon => {
      salon.distanceMiles = calculateDistanceMiles(
        userLocation.lat,
        userLocation.lng,
        salon.lat,
        salon.lng
      );
    });
  }

  // Minimalist Leaflet Map
  function initMap() {
    const mapElement = document.getElementById('salons-map');
    if (!mapElement) return;

    if (map) {
      map.remove();
    }

    map = L.map('salons-map', {
      zoomControl: false,
      scrollWheelZoom: true
    }).setView([userLocation.lat, userLocation.lng], 14);

    // CartoDB light map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    renderMapMarkers();
  }

  function renderMapMarkers() {
    if (!markersLayer || !map) return;
    markersLayer.clearLayers();

    // User Location Pin
    const userIcon = L.divIcon({
      className: 'user-pin-minimal',
      html: `
        <div class="user-pin-ring"></div>
        <div class="user-pin-core"></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup(`<div class="font-medium text-stone-900 text-xs">You are here</div><div class="text-[11px] text-stone-500">${userLocation.name}</div>`)
      .addTo(markersLayer);

    // Salon Pins
    const filtered = getFilteredSalons();
    filtered.forEach(salon => {
      const pinHtml = `
        <div class="pin-minimal-badge">
          <span>✂</span>
          <span>${salon.demandUnderstandingScore}%</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-salon-pin',
        html: pinHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const marker = L.marker([salon.lat, salon.lng], { icon: customIcon })
        .addTo(markersLayer);

      const popupHtml = `
        <div class="p-1 max-w-[200px]">
          <div class="font-semibold text-stone-900 text-xs leading-snug">${salon.name}</div>
          <div class="text-[11px] text-stone-500 mt-1">📍 ${salon.distanceMiles} mi &bull; ${salon.neighborhood}</div>
          <div class="text-[11px] text-emerald-800 font-medium mt-0.5">★ ${salon.organicRating} (${salon.organicReviewCount} reviews)</div>
          <button onclick="window.StrandApp.openSalonDetails('${salon.id}')" class="mt-2 w-full py-1 text-xs bg-stone-900 text-white font-medium rounded-lg transition">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
    });
  }

  // Filter Logic
  function getFilteredSalons() {
    return salons.filter(salon => {
      if (activeFilter.searchQuery.trim() !== "") {
        const q = activeFilter.searchQuery.toLowerCase();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesNeighborhood = salon.neighborhood.toLowerCase().includes(q);
        const matchesSpecialties = salon.specialties.some(s => s.toLowerCase().includes(q));
        const matchesBarbers = salon.barbers.some(b => b.name.toLowerCase().includes(q) || b.specialty.toLowerCase().includes(q));
        if (!matchesName && !matchesNeighborhood && !matchesSpecialties && !matchesBarbers) {
          return false;
        }
      }

      if (salon.distanceMiles > activeFilter.maxDistance) {
        return false;
      }

      if (activeFilter.hairType !== "all") {
        const matchesHair = salon.hairTypeCompatibilities.some(h => h.toLowerCase().includes(activeFilter.hairType.toLowerCase()));
        if (!matchesHair) return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeFilter.sortBy === "demandScore") {
        return b.demandUnderstandingScore - a.demandUnderstandingScore;
      } else if (activeFilter.sortBy === "distance") {
        return a.distanceMiles - b.distanceMiles;
      } else if (activeFilter.sortBy === "rating") {
        return b.organicRating - a.organicRating;
      } else if (activeFilter.sortBy === "reviews") {
        return b.organicReviewCount - a.organicReviewCount;
      }
      return 0;
    });
  }

  // Render All
  function renderAll() {
    renderDemandBanner();
    renderSalons();
    renderMapMarkers();
    renderBookingsList();
  }

  // Minimalist Linen Directive Banner with Photo Preview
  function renderDemandBanner() {
    const bannerContainer = document.getElementById('demand-banner-container');
    if (!bannerContainer) return;

    if (!activeDemandCard) {
      bannerContainer.innerHTML = `
        <div class="linen-directive-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 class="font-medium text-stone-900 text-sm">No hair directive or reference photo set yet</h3>
            <p class="text-xs text-stone-500 mt-0.5">Upload a photo of what you want and set haircut limits.</p>
          </div>
          <button onclick="window.StrandApp.openDemandBuilderModal()" class="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-full shadow-sm">
            Set Hair Directive & Photo
          </button>
        </div>
      `;
      return;
    }

    const hasPhoto = activeDemandCard.referencePhoto && activeDemandCard.referencePhoto.trim() !== "";

    bannerContainer.innerHTML = `
      <div class="linen-directive-card p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-4">
          ${hasPhoto ? `
            <div class="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-stone-200 bg-stone-100 shadow-sm">
              <img src="${activeDemandCard.referencePhoto}" alt="Reference cut" class="w-full h-full object-cover" />
              <span class="absolute bottom-0 inset-x-0 bg-stone-900/70 text-white text-[9px] text-center font-medium py-0.5">Photo</span>
            </div>
          ` : `
            <div class="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shrink-0 text-stone-400">
              📷
            </div>
          `}

          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500">Active Directive</span>
              <span class="text-stone-300">&bull;</span>
              <span class="text-xs text-stone-700 font-medium">${activeDemandCard.hairType}</span>
              ${hasPhoto ? `
                <span class="text-stone-300">&bull;</span>
                <span class="text-[11px] text-stone-600 font-medium flex items-center gap-1">
                  <span>📸</span> Reference Photo Attached
                </span>
              ` : ''}
            </div>
            <h3 class="font-serif text-lg text-stone-900 font-medium">
              ${activeDemandCard.targetStyle} <span class="text-stone-400 font-sans text-xs">for ${activeDemandCard.clientName}</span>
            </h3>
            <p class="text-xs text-stone-600 italic">
              "${activeDemandCard.traumaAlert || activeDemandCard.maxCutOffTop}"
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button onclick="window.StrandApp.openDemandCardViewModal()" class="px-3.5 py-1.5 rounded-full border border-stone-200 text-xs text-stone-700 hover:bg-stone-50 font-medium transition">
            View Card
          </button>
          <button onclick="window.StrandApp.openDemandBuilderModal()" class="px-3.5 py-1.5 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition">
            Edit & Photo
          </button>
        </div>
      </div>
    `;
  }

  // Minimalist Salon Cards
  function renderSalons() {
    const listContainer = document.getElementById('salons-list');
    const countBadge = document.getElementById('results-count');
    if (!listContainer) return;

    const filtered = getFilteredSalons();
    if (countBadge) {
      countBadge.textContent = `${filtered.length} Salons Near You`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
          <p class="text-sm font-medium text-stone-800">No salons found within this radius</p>
          <p class="text-xs text-stone-500">Try expanding the distance slider or choosing another hair texture.</p>
          <button onclick="window.StrandApp.resetFilters()" class="mt-2 text-xs font-medium text-stone-900 underline">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(salon => {
      return `
        <article class="minimal-card p-5 overflow-hidden flex flex-col sm:flex-row gap-5 items-start">
          <div class="w-full sm:w-44 h-40 shrink-0 rounded-xl overflow-hidden bg-stone-100">
            <img src="${salon.heroImage}" alt="${salon.name}" class="w-full h-full object-cover" loading="lazy" />
          </div>

          <div class="flex-1 space-y-2.5 w-full">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-serif text-lg font-medium text-stone-900 leading-snug">
                  ${salon.name}
                </h3>
                <p class="text-xs text-stone-500 mt-0.5">
                  ${salon.neighborhood} &bull; ${salon.distanceMiles} mi &bull; ${salon.priceRange}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-stone-900 text-white">
                  ${salon.demandUnderstandingScore}% Listens
                </span>
              </div>
            </div>

            <p class="text-xs text-stone-600 line-clamp-1 italic font-serif">
              "${salon.tagline}"
            </p>

            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="px-2 py-0.5 rounded-full badge-sage text-[11px] font-medium">
                ✓ 100% Organic Reviews
              </span>
              <span class="text-stone-500 text-[11px]">
                ★ ${salon.organicRating} (${salon.organicReviewCount} verified cuts)
              </span>
            </div>

            <div class="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <img src="${salon.barbers[0].avatar}" alt="${salon.barbers[0].name}" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-stone-700 font-medium">${salon.barbers[0].name}</span>
                <span class="text-stone-400">&bull;</span>
                <span class="text-stone-500 text-[11px]">${salon.barbers[0].specialty}</span>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="window.StrandApp.openSalonDetails('${salon.id}')" class="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium transition text-xs">
                  Reviews & Barbers
                </button>
                <button onclick="window.StrandApp.openBookingModal('${salon.id}', '${salon.barbers[0].id}')" class="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 font-medium transition text-xs">
                  Book with Directive
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Salon Details Modal
  function openSalonDetails(salonId) {
    const salon = salons.find(s => s.id === salonId);
    if (!salon) return;
    activeSalonModal = salon;

    const modal = document.getElementById('salon-details-modal');
    const content = document.getElementById('salon-details-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <span class="text-xs text-stone-400 font-medium">${salon.neighborhood} &bull; ${salon.distanceMiles} mi away</span>
            <h2 class="text-2xl font-serif text-stone-900 mt-1">${salon.name}</h2>
            <p class="text-xs text-stone-500 mt-0.5 italic font-serif">"${salon.tagline}"</p>
          </div>
          <button onclick="window.StrandApp.closeModal('salon-details-modal')" class="text-stone-400 hover:text-stone-800 text-lg">✕</button>
        </div>

        <div class="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-stone-700">Listening Scorecard</span>
            <span class="text-xs font-bold text-stone-900">${salon.demandUnderstandingScore}% Comprehension</span>
          </div>
          <div class="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span class="text-stone-500 block text-[11px]">Listening:</span>
              <strong class="text-stone-900">${salon.listeningRating} / 5.0 ★</strong>
            </div>
            <div>
              <span class="text-stone-500 block text-[11px]">Photo Match:</span>
              <strong class="text-stone-900">${salon.photoFidelityRate}%</strong>
            </div>
            <div>
              <span class="text-stone-500 block text-[11px]">Length Respect:</span>
              <strong class="text-stone-900">99.2% Accurate</strong>
            </div>
          </div>
          <p class="text-xs text-stone-600 mt-3 pt-2 border-t border-stone-200/80">
            <strong>Protocol:</strong> ${salon.consultationProtocol}
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-stone-900 mb-3">Barbers</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${salon.barbers.map(barber => `
              <div class="border border-stone-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <img src="${barber.avatar}" alt="${barber.name}" class="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div class="font-medium text-stone-900 text-xs">${barber.name}</div>
                      <div class="text-[11px] text-stone-500">${barber.title}</div>
                    </div>
                  </div>
                  <p class="text-xs text-stone-600 italic font-serif mt-2.5">"${barber.listeningQuote}"</p>
                </div>
                <button onclick="window.StrandApp.openBookingModal('${salon.id}', '${barber.id}')" class="mt-3 text-xs font-medium text-stone-900 underline text-left">
                  Book with ${barber.name.split(' ')[0]} &rarr;
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-stone-900">Organic Reviews (${salon.organicReviewCount})</h3>
            <button onclick="window.StrandApp.openWriteReviewModal('${salon.id}')" class="text-xs text-stone-600 hover:text-stone-900 underline">
              Write Review
            </button>
          </div>
          <div class="space-y-3">
            ${salon.organicReviews.map(rev => `
              <div class="border border-stone-100 rounded-xl p-3.5 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-stone-900">${rev.author}</span>
                  <span class="text-amber-800 font-medium">★ ${rev.overallScore}/5</span>
                </div>
                <div class="text-[11px] text-stone-500">
                  Cut: <strong class="text-stone-700">${rev.requestedCut}</strong> &bull; Texture: ${rev.hairType}
                </div>
                <p class="text-xs text-stone-600 leading-relaxed">${rev.reviewText}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="pt-4 border-t border-stone-100 flex items-center justify-between">
          <span class="text-xs text-stone-500">📍 ${salon.address}</span>
          <button onclick="window.StrandApp.openBookingModal('${salon.id}', '${salon.barbers[0].id}')" class="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition">
            Book Appointment
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Booking Modal
  function openBookingModal(salonId, barberId) {
    const salon = salons.find(s => s.id === salonId);
    if (!salon) return;
    const barber = salon.barbers.find(b => b.id === barberId) || salon.barbers[0];

    const modal = document.getElementById('booking-modal');
    const content = document.getElementById('booking-modal-content');
    if (!modal || !content) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    content.innerHTML = `
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 class="font-semibold text-stone-900">Book at ${salon.name}</h3>
            <p class="text-xs text-stone-500">Guaranteed consultation intake</p>
          </div>
          <button onclick="window.StrandApp.closeModal('booking-modal')" class="text-stone-400 hover:text-stone-800">✕</button>
        </div>

        <form onsubmit="window.StrandApp.handleBookingSubmit(event, '${salon.id}')" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-stone-700 mb-1">Barber</label>
            <select id="booking-barber-select" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
              ${salon.barbers.map(b => `<option value="${b.id}" ${b.id === barber.id ? 'selected' : ''}>${b.name} (${b.demandScore}% score)</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Date</label>
              <input type="date" id="booking-date" value="${dateStr}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Time</label>
              <select id="booking-time" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="1:15 PM">1:15 PM</option>
                <option value="3:00 PM">3:00 PM</option>
                <option value="5:00 PM">5:00 PM</option>
              </select>
            </div>
          </div>

          <div class="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center gap-3 text-xs text-stone-600">
            ${activeDemandCard && activeDemandCard.referencePhoto ? `
              <img src="${activeDemandCard.referencePhoto}" alt="Reference cut" class="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0" />
            ` : ''}
            <div>
              <strong class="text-stone-900 block mb-0.5">Attached Hair Directive:</strong>
              ${activeDemandCard ? activeDemandCard.targetStyle : 'Standard Cut'} &bull; ${activeDemandCard ? activeDemandCard.hairType : ''}
              ${activeDemandCard && activeDemandCard.referencePhoto ? `<span class="text-emerald-700 block text-[11px] font-medium">✓ Reference Photo Included</span>` : ''}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Your Name</label>
              <input type="text" id="booking-client-name" value="${activeDemandCard ? activeDemandCard.clientName : ''}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Phone</label>
              <input type="tel" id="booking-client-phone" value="(212) 555-7890" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition">
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function handleBookingSubmit(e, salonId) {
    e.preventDefault();
    const salon = salons.find(s => s.id === salonId);
    if (!salon) return;

    const barberSelect = document.getElementById('booking-barber-select');
    const barberId = barberSelect ? barberSelect.value : salon.barbers[0].id;
    const barber = salon.barbers.find(b => b.id === barberId) || salon.barbers[0];

    const newBooking = {
      id: "book-" + Date.now(),
      salonId: salon.id,
      salonName: salon.name,
      barberName: barber.name,
      date: document.getElementById('booking-date').value,
      time: document.getElementById('booking-time').value,
      clientName: document.getElementById('booking-client-name').value,
      demandCard: activeDemandCard,
      status: "Confirmed"
    };

    const existingBookings = JSON.parse(localStorage.getItem('strand_bookings') || '[]');
    existingBookings.unshift(newBooking);
    localStorage.setItem('strand_bookings', JSON.stringify(existingBookings));

    closeModal('booking-modal');
    renderBookingsList();
    showToast(`Appointment confirmed at ${salon.name} with ${barber.name}. Directive & Photo sent!`);
  }

  // Directive Builder Modal with Photo Upload
  function openDemandBuilderModal() {
    const modal = document.getElementById('demand-builder-modal');
    const content = document.getElementById('demand-builder-content');
    if (!modal || !content) return;

    const card = activeDemandCard || getDefaultDemandCard();
    currentUploadedPhotoDataUrl = card.referencePhoto || null;

    content.innerHTML = `
      <div class="p-6 sm:p-7 space-y-4">
        <div class="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 class="font-serif text-lg font-medium text-stone-900">Haircut Directive & Photo Spec</h3>
            <p class="text-xs text-stone-500">Attach the exact photo and instructions for your barber</p>
          </div>
          <button onclick="window.StrandApp.closeModal('demand-builder-modal')" class="text-stone-400 hover:text-stone-800">✕</button>
        </div>

        <form onsubmit="window.StrandApp.handleDemandBuilderSubmit(event)" class="space-y-4">

          <!-- PHOTO UPLOAD SECTION -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              📸 Haircut Reference Photo (What You Want)
            </label>

            <!-- Dropzone & Preview Box -->
            <div id="photo-preview-container" class="photo-dropzone p-4 text-center cursor-pointer" onclick="document.getElementById('demand-photo-file').click()">
              <input type="file" id="demand-photo-file" accept="image/*" class="hidden" onchange="window.StrandApp.handlePhotoFileChange(event)" />
              
              <div id="photo-preview-content">
                ${currentUploadedPhotoDataUrl ? `
                  <div class="flex items-center gap-4 text-left">
                    <img src="${currentUploadedPhotoDataUrl}" id="preview-img-tag" alt="Reference haircut" class="w-20 h-20 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0" />
                    <div>
                      <span class="text-xs font-semibold text-stone-900 block">Haircut Photo Attached</span>
                      <span class="text-[11px] text-stone-500 block mt-0.5">Click to replace with another photo from your phone or PC.</span>
                      <button type="button" onclick="event.stopPropagation(); window.StrandApp.clearUploadedPhoto();" class="mt-2 text-[11px] text-rose-600 font-medium hover:underline">
                        Remove photo
                      </button>
                    </div>
                  </div>
                ` : `
                  <div class="py-3">
                    <span class="text-2xl block mb-1">📷</span>
                    <span class="text-xs font-medium text-stone-800 block">Click to upload your haircut reference photo</span>
                    <span class="text-[11px] text-stone-400 block mt-0.5">JPG, PNG, WebP supported from camera or gallery</span>
                  </div>
                `}
              </div>
            </div>

            <!-- Quick Template Inspiration Photos -->
            <div class="pt-1">
              <span class="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">Or choose from curated reference cuts:</span>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${HAIRSTYLE_TEMPLATES.map(tpl => `
                  <button type="button" onclick="window.StrandApp.applyTemplateWithPhoto('${tpl.id}')" class="group text-left border border-stone-200 rounded-xl p-1.5 hover:border-stone-900 transition bg-stone-50/50">
                    <img src="${tpl.photoUrl}" alt="${tpl.name}" class="w-full h-12 object-cover rounded-lg mb-1" />
                    <span class="text-[9px] font-medium text-stone-700 block truncate group-hover:text-stone-900">${tpl.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Your Name</label>
              <input type="text" id="demand-name" value="${card.clientName}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Hair Texture</label>
              <select id="demand-hairtype" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
                <option value="Straight (1A-1C)" ${card.hairType.includes('1') ? 'selected' : ''}>Type 1 - Straight</option>
                <option value="Wavy (2A-2C)" ${card.hairType.includes('2') ? 'selected' : ''}>Type 2 - Wavy</option>
                <option value="Curly (3A-3C)" ${card.hairType.includes('3') ? 'selected' : ''}>Type 3 - Curly</option>
                <option value="Coily (4A-4C)" ${card.hairType.includes('4') ? 'selected' : ''}>Type 4 - Coily / Afro</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-stone-700 mb-1">Desired Cut Style</label>
            <input type="text" id="demand-style" value="${card.targetStyle}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
          </div>

          <div>
            <label class="block text-xs font-medium text-stone-700 mb-1">Strict Length Limit off Top</label>
            <input type="text" id="demand-top-length" value="${card.maxCutOffTop}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" placeholder="e.g. Max 0.5 inch, do not touch length" required />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Sides & Guards</label>
              <input type="text" id="demand-sides" value="${card.sidesDirective}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Neckline</label>
              <input type="text" id="demand-neckline" value="${card.necklineDirective}" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-rose-700 mb-1">What went wrong in the past? (Trauma Alert)</label>
            <textarea id="demand-trauma" rows="2" class="w-full bg-stone-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">${card.traumaAlert}</textarea>
          </div>

          <div>
            <label class="block text-xs font-medium text-stone-700 mb-1">Communication Style</label>
            <select id="demand-communication" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
              <option value="Consultative (Mirror check-in before cuts)">Consultative (Mirror check-in before any snip)</option>
              <option value="Silent Cut (Minimal talking, focus on cut)">Silent Cut (Quiet appointment, execute instructions)</option>
            </select>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition">
              Save Directive & Photo
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function handlePhotoFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      currentUploadedPhotoDataUrl = evt.target.result;
      updatePhotoPreviewUI(currentUploadedPhotoDataUrl);
      showToast("Haircut reference photo uploaded!");
    };
    reader.readAsDataURL(file);
  }

  function updatePhotoPreviewUI(dataUrl) {
    const container = document.getElementById('photo-preview-content');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center gap-4 text-left">
        <img src="${dataUrl}" id="preview-img-tag" alt="Reference haircut" class="w-20 h-20 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0" />
        <div>
          <span class="text-xs font-semibold text-stone-900 block">Haircut Photo Attached</span>
          <span class="text-[11px] text-stone-500 block mt-0.5">Click to replace with another photo.</span>
          <button type="button" onclick="event.stopPropagation(); window.StrandApp.clearUploadedPhoto();" class="mt-2 text-[11px] text-rose-600 font-medium hover:underline">
            Remove photo
          </button>
        </div>
      </div>
    `;
  }

  function clearUploadedPhoto() {
    currentUploadedPhotoDataUrl = null;
    const container = document.getElementById('photo-preview-content');
    if (container) {
      container.innerHTML = `
        <div class="py-3">
          <span class="text-2xl block mb-1">📷</span>
          <span class="text-xs font-medium text-stone-800 block">Click to upload your haircut reference photo</span>
          <span class="text-[11px] text-stone-400 block mt-0.5">JPG, PNG, WebP supported from camera or gallery</span>
        </div>
      `;
    }
  }

  function applyTemplateWithPhoto(tplId) {
    const tpl = HAIRSTYLE_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    const styleInput = document.getElementById('demand-style');
    const sidesInput = document.getElementById('demand-sides');
    if (styleInput) styleInput.value = tpl.name;
    if (sidesInput) sidesInput.value = tpl.defaultInstructions;
    currentUploadedPhotoDataUrl = tpl.photoUrl;
    updatePhotoPreviewUI(currentUploadedPhotoDataUrl);
    showToast(`Loaded reference: ${tpl.name}`);
  }

  function handleDemandBuilderSubmit(e) {
    e.preventDefault();
    const updatedCard = {
      clientName: document.getElementById('demand-name').value,
      hairType: document.getElementById('demand-hairtype').value,
      targetStyle: document.getElementById('demand-style').value,
      maxCutOffTop: document.getElementById('demand-top-length').value,
      sidesDirective: document.getElementById('demand-sides').value,
      necklineDirective: document.getElementById('demand-neckline').value,
      traumaAlert: document.getElementById('demand-trauma').value,
      communicationVibe: document.getElementById('demand-communication').value,
      referencePhoto: currentUploadedPhotoDataUrl,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    saveDemandCard(updatedCard);
    closeModal('demand-builder-modal');
    showToast("Haircut directive & reference photo saved.");
  }

  // View Demand Card Modal (Clean Printable Card for Barber)
  function openDemandCardViewModal() {
    const modal = document.getElementById('demand-card-modal');
    const content = document.getElementById('demand-card-content');
    if (!modal || !content) return;

    const card = activeDemandCard || getDefaultDemandCard();
    const hasPhoto = card.referencePhoto && card.referencePhoto.trim() !== "";

    content.innerHTML = `
      <div id="printable-demand-card" class="bg-white border border-stone-200 p-6 sm:p-7 rounded-2xl space-y-4">
        <div class="flex items-start justify-between border-b border-stone-100 pb-3">
          <div>
            <span class="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Strand Directive Spec</span>
            <h3 class="text-xl font-serif text-stone-900">${card.clientName}'s Haircut Blueprint</h3>
            <span class="text-xs text-stone-500">Show this screen to your barber before getting into the chair</span>
          </div>
          <button onclick="window.StrandApp.closeModal('demand-card-modal')" class="text-stone-400 hover:text-stone-800">✕</button>
        </div>

        ${hasPhoto ? `
          <!-- Customer Reference Photo Showcase -->
          <div class="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <span class="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-2">📸 Customer Desired Cut Reference Photo:</span>
            <div class="flex flex-col sm:flex-row gap-4 items-center">
              <img src="${card.referencePhoto}" alt="Desired cut reference" class="w-full sm:w-44 h-44 rounded-xl object-cover border border-stone-300 shadow-sm" />
              <div class="space-y-1 text-xs text-stone-600">
                <span class="font-medium text-stone-900 block">${card.targetStyle}</span>
                <span class="text-[11px] text-stone-500 block">Texture: ${card.hairType}</span>
                <p class="text-[11px] text-stone-600 italic pt-1">"Please match the neckline, temple line, and shape from this photo."</p>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="space-y-2 text-xs">
          <div class="p-3 bg-stone-50 rounded-xl">
            <span class="text-stone-400 block text-[10px] uppercase font-bold">Target Cut & Texture:</span>
            <strong class="text-stone-900">${card.targetStyle} (${card.hairType})</strong>
          </div>
          <div class="p-3 bg-stone-50 rounded-xl">
            <span class="text-stone-400 block text-[10px] uppercase font-bold">Strict Top Length Limit:</span>
            <span class="text-stone-800 font-medium">${card.maxCutOffTop}</span>
          </div>
          <div class="p-3 bg-stone-50 rounded-xl">
            <span class="text-stone-400 block text-[10px] uppercase font-bold">Sides & Neckline:</span>
            <span class="text-stone-800">${card.sidesDirective} &bull; ${card.necklineDirective}</span>
          </div>
          ${card.traumaAlert ? `
            <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
              <span class="block text-[10px] uppercase font-bold">Avoid / Hair Trauma Warning:</span>
              <span>${card.traumaAlert}</span>
            </div>
          ` : ''}
          <div class="p-2.5 bg-stone-50 rounded-xl flex items-center justify-between text-[11px]">
            <span class="text-stone-500">Communication Mode:</span>
            <span class="font-medium text-stone-800">${card.communicationVibe}</span>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between border-t border-stone-100">
          <span class="text-[10px] text-stone-400 font-mono">Updated ${card.updatedAt}</span>
          <div class="flex gap-2">
            <button onclick="window.print()" class="px-3.5 py-1.5 border border-stone-200 text-xs font-medium rounded-lg text-stone-700 hover:bg-stone-50">Print Card</button>
            <button onclick="window.StrandApp.openDemandBuilderModal(); window.StrandApp.closeModal('demand-card-modal');" class="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg">Edit Spec & Photo</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Write Review Modal
  function openWriteReviewModal(salonId) {
    const salon = salons.find(s => s.id === salonId) || salons[0];
    const modal = document.getElementById('review-modal');
    const content = document.getElementById('review-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 class="font-semibold text-stone-900">Review ${salon.name}</h3>
            <p class="text-xs text-stone-500">100% Organic Review standard</p>
          </div>
          <button onclick="window.StrandApp.closeModal('review-modal')" class="text-stone-400 hover:text-stone-800">✕</button>
        </div>

        <form onsubmit="window.StrandApp.handleReviewSubmit(event, '${salon.id}')" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Your Name</label>
              <input type="text" id="review-author" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Barber</label>
              <select id="review-barber" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
                ${salon.barbers.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">What did you ask for?</label>
              <input type="text" id="review-cut-requested" placeholder="e.g. Scissor trim, 1/2 inch off" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-stone-700 mb-1">Did they listen?</label>
              <select id="review-listening-score" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none">
                <option value="5">5 ★ - Followed directions perfectly</option>
                <option value="4">4 ★ - Listened well</option>
                <option value="3">3 ★ - Cut slightly off</option>
                <option value="2">2 ★ - Ignored instructions</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-stone-700 mb-1">Your Honest Review</label>
            <textarea id="review-text" rows="3" class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none" placeholder="Describe the consultation and haircut outcome..." required></textarea>
          </div>

          <div class="flex items-start gap-2 pt-1 text-[11px] text-stone-500">
            <input type="checkbox" id="review-organic-confirm" class="mt-0.5" required />
            <label for="review-organic-confirm">I confirm this was an authentic paid cut without compensation.</label>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function handleReviewSubmit(e, salonId) {
    e.preventDefault();
    const salon = salons.find(s => s.id === salonId);
    if (!salon) return;

    const newReview = {
      id: "rev-" + Date.now(),
      author: document.getElementById('review-author').value,
      verifiedDate: "Verified Visit &bull; Today",
      hairType: "Custom",
      requestedCut: document.getElementById('review-cut-requested').value,
      barberName: document.getElementById('review-barber').value,
      overallScore: 5,
      listeningScore: parseFloat(document.getElementById('review-listening-score').value),
      reviewText: document.getElementById('review-text').value
    };

    salon.organicReviews.unshift(newReview);
    salon.organicReviewCount += 1;
    localStorage.setItem('strand_salons', JSON.stringify(salons));

    closeModal('review-modal');
    renderSalons();
    showToast("Review submitted.");

    if (activeSalonModal && activeSalonModal.id === salonId) {
      openSalonDetails(salonId);
    }
  }

  // Bookings List
  function openBookingsModal() {
    const modal = document.getElementById('bookings-modal');
    if (!modal) return;
    renderBookingsList();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function renderBookingsList() {
    const container = document.getElementById('bookings-list-content');
    const badge = document.getElementById('bookings-count-badge');
    const bookings = JSON.parse(localStorage.getItem('strand_bookings') || '[]');

    if (badge) {
      badge.textContent = bookings.length;
      badge.classList.toggle('hidden', bookings.length === 0);
    }

    if (!container) return;

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-xs text-stone-400">
          No appointments booked yet.
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map(b => `
      <div class="border border-stone-200 rounded-xl p-3.5 space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <strong class="text-stone-900">${b.salonName}</strong>
          <span class="text-stone-500">${b.date} at ${b.time}</span>
        </div>
        <div class="text-stone-500">Barber: ${b.barberName}</div>
        <div class="flex items-center justify-between pt-1 text-[11px]">
          <span class="text-emerald-700 font-medium">✓ Directive & Photo Attached</span>
          <button onclick="window.StrandApp.cancelBooking('${b.id}')" class="text-stone-400 hover:text-rose-600">Cancel</button>
        </div>
      </div>
    `).join('');
  }

  function cancelBooking(bookingId) {
    let bookings = JSON.parse(localStorage.getItem('strand_bookings') || '[]');
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('strand_bookings', JSON.stringify(bookings));
    renderBookingsList();
    showToast("Appointment cancelled.");
  }

  // Location selector
  function setLocation(locKey) {
    const locations = {
      soho: { lat: 40.7248, lng: -73.9991, name: "SoHo, Lower Manhattan" },
      midtown: { lat: 40.7580, lng: -73.9855, name: "Midtown, Manhattan" },
      tribeca: { lat: 40.7163, lng: -74.0086, name: "Tribeca, Downtown" },
      brooklyn: { lat: 40.6925, lng: -73.9904, name: "Brooklyn Heights" }
    };

    if (locations[locKey]) {
      userLocation = locations[locKey];
      updateSalonDistances();
      renderAll();
      if (map) {
        map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
      }
      showToast(`Location set to ${userLocation.name}`);
    }
  }

  function useCurrentDeviceLocation() {
    if ("geolocation" in navigator) {
      showToast("Detecting GPS...");
      navigator.geolocation.getCurrentPosition(
        pos => {
          userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: "GPS Location"
          };
          updateSalonDistances();
          renderAll();
          if (map) {
            map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
          }
          showToast("Location updated from GPS.");
        },
        () => showToast("Could not access GPS coordinates."),
        { timeout: 7000 }
      );
    }
  }

  // PWA Installation Setup
  function setupPwaInstallation() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.classList.remove('hidden');
      }
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }
  }

  function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast("Strand installed successfully!");
        }
        deferredPrompt = null;
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) installBtn.classList.add('hidden');
      });
    } else {
      showToast("To install Strand, tap your browser's share or menu icon and select 'Add to Home Screen'.");
    }
  }

  // Event Listeners
  function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        activeFilter.searchQuery = e.target.value;
        renderSalons();
        renderMapMarkers();
      });
    }

    const distSlider = document.getElementById('distance-slider');
    const distValue = document.getElementById('distance-value');
    if (distSlider && distValue) {
      distSlider.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        activeFilter.maxDistance = val;
        distValue.textContent = `${val} mi`;
        renderSalons();
        renderMapMarkers();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        activeFilter.sortBy = e.target.value;
        renderSalons();
      });
    }

    const hairFilters = document.querySelectorAll('.hair-filter-pill');
    hairFilters.forEach(pill => {
      pill.addEventListener('click', () => {
        hairFilters.forEach(p => p.classList.remove('bg-stone-900', 'text-white', 'font-semibold'));
        hairFilters.forEach(p => p.classList.add('bg-stone-100', 'text-stone-600'));
        pill.classList.remove('bg-stone-100', 'text-stone-600');
        pill.classList.add('bg-stone-900', 'text-white', 'font-semibold');
        activeFilter.hairType = pill.dataset.hairtype;
        renderSalons();
        renderMapMarkers();
      });
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  function resetFilters() {
    activeFilter.searchQuery = "";
    activeFilter.maxDistance = 10.0;
    activeFilter.hairType = "all";
    activeFilter.sortBy = "demandScore";

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = "";
    const distSlider = document.getElementById('distance-slider');
    const distValue = document.getElementById('distance-value');
    if (distSlider && distValue) {
      distSlider.value = 10;
      distValue.textContent = "10 mi";
    }

    renderAll();
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = 'auto';
  }

  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-xl shadow-lg transition-all duration-300 transform translate-y-8 opacity-0 flex items-center gap-2';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('translate-y-8', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-8', 'opacity-0');
    }, 3000);
  }

  // Export
  window.StrandApp = {
    init,
    openSalonDetails,
    openBookingModal,
    handleBookingSubmit,
    openDemandBuilderModal,
    handleDemandBuilderSubmit,
    handlePhotoFileChange,
    clearUploadedPhoto,
    applyTemplateWithPhoto,
    openDemandCardViewModal,
    openWriteReviewModal,
    handleReviewSubmit,
    openBookingsModal,
    cancelBooking,
    closeModal,
    closeAllModals,
    setLocation,
    useCurrentDeviceLocation,
    resetFilters,
    installApp
  };

  document.addEventListener('DOMContentLoaded', init);

})();

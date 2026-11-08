/* İlmek teması — etkileşimler. Bağımlılık yok. */
(function () {
  'use strict';

  var theme = window.theme || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Para biçimi ---------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || theme.moneyFormat || '{{amount}}';
    var placeholder = /\{\{\s*(\w+)\s*\}\}/;
    function withDelimiters(number, precision, thousands, decimal) {
      precision = precision == null ? 2 : precision;
      thousands = thousands || ',';
      decimal = decimal || '.';
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsPart = parts[1] ? decimal + parts[1] : '';
      return dollars + centsPart;
    }
    var match = format.match(placeholder);
    var value = '';
    switch (match ? match[1] : 'amount') {
      case 'amount': value = withDelimiters(cents, 2); break;
      case 'amount_no_decimals': value = withDelimiters(cents, 0); break;
      case 'amount_with_comma_separator': value = withDelimiters(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = withDelimiters(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = withDelimiters(cents, 2, "'", '.'); break;
      case 'amount_with_space_separator': value = withDelimiters(cents, 2, ' ', ','); break;
      default: value = withDelimiters(cents, 2);
    }
    return format.replace(placeholder, value);
  }

  /* ---------- Gövde kilidi ---------- */
  var locks = 0;
  function lockBody() { locks++; document.body.classList.add('is-locked'); }
  function unlockBody() { locks = Math.max(0, locks - 1); if (!locks) document.body.classList.remove('is-locked'); }

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    toastEl.appendChild(document.createTextNode(message));
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Duyuru çubuğu ---------- */
  function initAnnouncement() {
    $$('[data-announcement]').forEach(function (wrap) {
      var items = $$('.announcement__item', wrap);
      if (items.length < 2) return;
      var i = 0;
      var speed = parseInt(wrap.getAttribute('data-speed'), 10) || 5000;
      setInterval(function () {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, speed);
    });
  }

  /* ---------- Başlık: kaydırma gölgesi ---------- */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var panel = $('[data-search-panel]', header);
    var openBtn = $('[data-search-open]', header);
    var closeBtn = $('[data-search-close]', header);
    if (panel && openBtn) {
      openBtn.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) $('input[type="search"]', panel).focus();
      });
      closeBtn && closeBtn.addEventListener('click', function () { panel.hidden = true; openBtn.focus(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; openBtn.focus(); } });
    }
  }

  /* ---------- details tabanlı çekmeceler (mobil menü, filtre) ---------- */
  function initDrawers() {
    $$('[data-drawer-details]').forEach(function (details) {
      var summary = details.querySelector('summary');
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (details.open) close(); else open();
      });
      $$('[data-drawer-close]', details).forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); close(); });
      });
      details.addEventListener('keydown', function (e) { if (e.key === 'Escape' && details.open) { close(); summary.focus(); } });

      function open() {
        details.open = true;
        lockBody();
        requestAnimationFrame(function () { details.classList.add('is-open'); });
      }
      function close() {
        details.classList.remove('is-open');
        unlockBody();
        setTimeout(function () { details.open = false; }, 320);
      }
    });
  }

  /* ---------- Sepet ---------- */
  var drawer;
  function getSectionsToRender() { return ['cart-drawer']; }

  function openDrawer() {
    drawer = drawer || $('[data-cart-drawer]');
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    lockBody();
    var panel = $('.cart-drawer__panel', drawer);
    panel && setTimeout(function () { panel.focus(); }, 50);
  }
  function closeDrawer() {
    drawer = drawer || $('[data-cart-drawer]');
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    unlockBody();
  }

  function updateCount(count) {
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
      el.classList.remove('is-bumped');
      void el.offsetWidth;
      el.classList.add('is-bumped');
    });
  }

  function renderDrawer(html) {
    if (!html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('[data-cart-drawer]');
    var current = $('[data-cart-drawer]');
    if (!fresh || !current) return;
    var freshPanel = $('.cart-drawer__panel', fresh);
    var currentPanel = $('.cart-drawer__panel', current);
    if (freshPanel && currentPanel) currentPanel.innerHTML = freshPanel.innerHTML;
  }

  function refreshCart() {
    return fetch(theme.routes.root + '?sections=' + getSectionsToRender().join(','))
      .then(function (r) { return r.json(); })
      .then(function (sections) { renderDrawer(sections['cart-drawer']); });
  }

  function changeLine(line, quantity) {
    var d = $('[data-cart-drawer]');
    d && d.classList.add('is-loading');
    return fetch(theme.routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity, sections: getSectionsToRender() })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        if (cart.status && cart.description) throw new Error(cart.description);
        updateCount(cart.item_count);
        if (cart.sections) renderDrawer(cart.sections['cart-drawer']);
        if ($('[data-main-cart]')) window.location.reload();
      })
      .catch(function (err) { toast(err.message || theme.strings.error); })
      .finally(function () { d && d.classList.remove('is-loading'); });
  }

  function initCart() {
    document.addEventListener('click', function (e) {
      var openEl = e.target.closest('[data-cart-open]');
      if (openEl && theme.cartType === 'drawer' && !$('[data-main-cart]')) {
        e.preventDefault();
        openDrawer();
        return;
      }
      if (e.target.closest('[data-cart-close]')) { e.preventDefault(); closeDrawer(); return; }
      var changeEl = e.target.closest('[data-line-change]');
      if (changeEl) {
        e.preventDefault();
        changeLine(parseInt(changeEl.getAttribute('data-line-change'), 10), Math.max(0, parseInt(changeEl.getAttribute('data-qty-value'), 10)));
      }
    });

    document.addEventListener('change', function (e) {
      var input = e.target.closest('[data-line-input]');
      if (input) changeLine(parseInt(input.getAttribute('data-line-input'), 10), Math.max(0, parseInt(input.value, 10) || 0));
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  }

  /* ---------- Sepete ekle (AJAX) ---------- */
  function initProductForms() {
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-product-form]');
      if (!form) return;
      if (theme.cartType !== 'drawer') return; // klasik form gönderimi -> sepet sayfası
      e.preventDefault();

      var submit = form.querySelector('[type="submit"][name="add"]');
      var errorEl = form.querySelector('[data-form-error]');
      if (submit) { submit.classList.add('is-loading'); submit.setAttribute('aria-disabled', 'true'); }
      if (errorEl) errorEl.hidden = true;

      var formData = new FormData(form);
      // Boş kişiselleştirme notlarını gönderme
      Array.from(formData.keys()).forEach(function (key) {
        if (key.indexOf('properties[') === 0 && !String(formData.get(key)).trim()) formData.delete(key);
      });
      formData.append('sections', getSectionsToRender().join(','));
      formData.append('sections_url', window.location.pathname);

      fetch(theme.routes.cartAdd + '.js', {
        method: 'POST',
        headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
        body: formData
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.status) throw new Error(res.description || res.message || theme.strings.error);
          if (res.sections) renderDrawer(res.sections['cart-drawer']);
          return fetch(theme.routes.cart + '.js').then(function (r) { return r.json(); });
        })
        .then(function (cart) {
          updateCount(cart.item_count);
          openDrawer();
        })
        .catch(function (err) {
          if (errorEl) { errorEl.textContent = err.message; errorEl.hidden = false; }
          else toast(err.message);
        })
        .finally(function () {
          if (submit) { submit.classList.remove('is-loading'); submit.removeAttribute('aria-disabled'); }
        });
    });
  }

  /* ---------- Adet seçici ---------- */
  function initQuantity() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qty-minus], [data-qty-plus]');
      if (!btn) return;
      var wrap = btn.closest('[data-qty]');
      var input = wrap && wrap.querySelector('input[name="quantity"]');
      if (!input) return;
      var v = parseInt(input.value, 10) || 1;
      v = btn.hasAttribute('data-qty-plus') ? v + 1 : Math.max(1, v - 1);
      input.value = v;
    });
  }

  /* ---------- Ürün sayfası ---------- */
  function initProduct() {
    $$('[data-product-section]').forEach(function (section) {
      var mediaList = $('[data-media-list]', section);
      var thumbs = $$('[data-thumb]', section);

      function showMedia(id, smooth) {
        if (!mediaList || !id) return;
        var item = $('[data-media-id="' + id + '"]', mediaList);
        if (!item) return;
        $$('.product__media-item', mediaList).forEach(function (el) { el.classList.toggle('is-active', el === item); });
        thumbs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-thumb') == id); });
        if (window.matchMedia('(min-width: 990px)').matches) {
          // Masaüstünde varyant görselini galerinin en başına taşı
          if (mediaList.firstElementChild !== item) mediaList.insertBefore(item, mediaList.firstElementChild);
        } else {
          mediaList.scrollTo({ left: item.offsetLeft - mediaList.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
        }
      }

      thumbs.forEach(function (t) {
        t.addEventListener('click', function () { showMedia(t.getAttribute('data-thumb'), true); });
      });

      if (mediaList && thumbs.length) {
        mediaList.addEventListener('scroll', function () {
          clearTimeout(mediaList._t);
          mediaList._t = setTimeout(function () {
            var idx = Math.round(mediaList.scrollLeft / mediaList.clientWidth);
            var item = mediaList.children[idx];
            if (item) thumbs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-thumb') == item.getAttribute('data-media-id')); });
          }, 80);
        }, { passive: true });
      }

      // Varyant seçimi
      var picker = $('[data-variant-picker]', section);
      if (picker) {
        var variants = JSON.parse($('[data-variants-json]', picker).textContent);
        var idInput = $('[data-variant-id]', section);
        var addBtn = $('[data-add-button]', section);
        var addLabel = $('[data-add-label]', section);
        var priceWrap = $('[data-price-wrap] [data-price]', section);

        picker.addEventListener('change', function (e) {
          var fieldset = e.target.closest('fieldset');
          if (fieldset) {
            var label = $('[data-option-value]', fieldset);
            if (label) label.textContent = e.target.value;
          }
          var selected = $$('fieldset', picker).map(function (fs) {
            var checked = $('input:checked', fs);
            return checked ? checked.value : null;
          });
          var variant = variants.find(function (v) {
            return v.options.every(function (opt, i) { return opt === selected[i]; });
          });
          updateAvailability(selected);

          if (!variant) {
            if (addBtn) addBtn.disabled = true;
            if (addLabel) addLabel.textContent = theme.strings.unavailable;
            return;
          }
          if (idInput) idInput.value = variant.id;
          if (addBtn) addBtn.disabled = !variant.available;
          if (addLabel) addLabel.textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;
          if (priceWrap) {
            var html = '<span class="price__current">' + formatMoney(variant.price) + '</span>';
            if (variant.compare_at_price && variant.compare_at_price > variant.price) {
              html += '<s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>';
              priceWrap.classList.add('price--sale');
            } else {
              priceWrap.classList.remove('price--sale');
            }
            priceWrap.innerHTML = html;
          }
          if (variant.featured_media) showMedia(variant.featured_media.id, true);
          var url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url.toString());
        });

        // Stokta olmayan kombinasyonları işaretle
        function updateAvailability(selected) {
          $$('fieldset', picker).forEach(function (fs, optIndex) {
            $$('input', fs).forEach(function (input) {
              var possible = variants.some(function (v) {
                return v.available && v.options[optIndex] === input.value && v.options.every(function (o, i) {
                  return i === optIndex || selected[i] == null || i > optIndex || o === selected[i];
                });
              });
              var lbl = fs.querySelector('label[for="' + input.id + '"]');
              if (lbl) lbl.classList.toggle('is-unavailable', !possible);
            });
          });
        }
        updateAvailability($$('fieldset', picker).map(function (fs) { var c = $('input:checked', fs); return c ? c.value : null; }));
      }

      // Mobilde yapışkan sepete ekle çubuğu
      var form = $('.product-form', section);
      var row = form && $('.product-form__row', form);
      if (form && row && 'IntersectionObserver' in window && window.matchMedia('(max-width: 989px)').matches) {
        var sentinel = document.createElement('div');
        form.insertBefore(sentinel, row.nextSibling);
        form.classList.add('is-sticky-ready');
        var placeholder = document.createElement('div');
        placeholder.style.height = row.offsetHeight + 'px';
        form.insertBefore(placeholder, row);
        new IntersectionObserver(function (entries) {
          var e = entries[0];
          form.classList.toggle('is-sticky', !e.isIntersecting && e.boundingClientRect.top < 0);
        }).observe(placeholder);
      }
    });
  }

  /* ---------- Benzer ürünler ---------- */
  function initRecommendations() {
    $$('[data-recommendations]').forEach(function (el) {
      var url = el.getAttribute('data-url');
      if (!url || el.children.length) return;
      var load = function () {
        fetch(url).then(function (r) { return r.text(); }).then(function (text) {
          var doc = new DOMParser().parseFromString(text, 'text/html');
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) { el.innerHTML = fresh.innerHTML; initReveal(el); }
        }).catch(function () {});
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { io.disconnect(); load(); }
        }, { rootMargin: '0px 0px 400px 0px' });
        io.observe(el);
      } else { load(); }
    });
  }

  /* ---------- Filtreler ---------- */
  function initFacets() {
    var form = $('[data-facets-form]');
    if (!form) return;
    var isDesktopAuto = function (input) { return input.tagName === 'SELECT' || !input.closest('.facets__panel'); };
    form.addEventListener('change', function (e) {
      if (!e.target.matches('[data-facet-input]')) return;
      if (isDesktopAuto(e.target)) submit();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    function submit() {
      var params = new URLSearchParams(new FormData(form));
      Array.from(params.keys()).forEach(function (k) { if (!params.get(k)) params.delete(k); });
      window.location.search = params.toString();
    }
  }

  /* ---------- Adres formu: ülke ön seçimi ---------- */
  function initCountrySelects() {
    $$('select[name="address[country]"]').forEach(function (sel) {
      var def = sel.getAttribute('data-default');
      if (def) sel.value = def;
    });
  }

  /* ---------- Görünür olunca beliren bölümler ---------- */
  function initReveal(ctx) {
    if (!('IntersectionObserver' in window)) return;
    var targets = $$('.section-head, .grid > li, .trust-bar__item, .process__step, .testimonial, .image-text__media, .image-text__content, .custom-order__card, .newsletter__card, .faq__grid > *, .insta__grid > li', ctx);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el, i) {
      if (el.closest('.shopify-design-mode')) return;
      el.classList.add('reveal');
      var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(siblings, 6) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Tema düzenleyici uyumluluğu ---------- */
  function initDesignMode() {
    if (!window.Shopify || !window.Shopify.designMode) return;
    document.documentElement.classList.add('shopify-design-mode');
    document.addEventListener('shopify:section:load', function () {
      initAnnouncement(); initDrawers(); initProduct(); initRecommendations();
    });
  }

  function init() {
    initDesignMode();
    initAnnouncement();
    initHeader();
    initDrawers();
    initCart();
    initProductForms();
    initQuantity();
    initProduct();
    initRecommendations();
    initFacets();
    initCountrySelects();
    if (!(window.Shopify && window.Shopify.designMode)) initReveal();
    theme.toast = toast;
    theme.added = function () { toast(theme.strings.added); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

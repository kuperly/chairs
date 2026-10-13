/* Kit Room theme — vanilla JS, no dependencies. */
(function () {
  'use strict';

  const routes = window.theme.routes;
  const strings = window.theme.strings;

  /* ---------- Helpers ---------- */

  function formatMoney(cents, format) {
    const value = (Number(cents) / 100);
    const withDelimiters = (number, decimals, thousands, decimal) => {
      const [int, dec] = number.toFixed(decimals).split('.');
      return int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (dec ? decimal + dec : '');
    };
    const match = (format || '₪{{amount}}').match(/\{\{\s*(\w+)\s*\}\}/);
    if (!match) return value.toFixed(2);
    let formatted;
    switch (match[1]) {
      case 'amount_no_decimals': formatted = withDelimiters(value, 0, ',', '.'); break;
      case 'amount_with_comma_separator': formatted = withDelimiters(value, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': formatted = withDelimiters(value, 0, '.', ','); break;
      default: formatted = withDelimiters(value, 2, ',', '.');
    }
    return format.replace(match[0], formatted);
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || strings.error);
    return data;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- Announcement rotator ---------- */

  customElements.define('announcement-rotator', class extends HTMLElement {
    connectedCallback() {
      const items = this.querySelectorAll('.announcement__item');
      if (items.length < 2) return;
      let i = 0;
      setInterval(() => {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, Number(this.dataset.interval) || 4000);
    }
  });

  /* ---------- Quantity input ---------- */

  customElements.define('quantity-input', class extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      this.querySelectorAll('[data-qty-change]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const min = Number(this.input.min) || 0;
          const next = Math.max(min, Number(this.input.value) + Number(btn.dataset.qtyChange));
          if (next === Number(this.input.value)) return;
          this.input.value = next;
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    }
  });

  /* ---------- Cart (drawer + page) ---------- */

  const Cart = {
    drawer: () => document.getElementById('CartDrawer'),

    open() {
      const drawer = this.drawer();
      if (!drawer) return (window.location.href = routes.cart);
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      drawer.querySelector('.drawer__panel').focus();
    },

    close() {
      const drawer = this.drawer();
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    /** Swap in freshly rendered cart-drawer HTML returned by the Section Rendering API. */
    render(sections) {
      const html = sections && sections['cart-drawer'];
      const drawer = this.drawer();
      if (!html || !drawer) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.getElementById('CartDrawer');
      if (fresh) drawer.innerHTML = fresh.innerHTML;
    },

    updateCount(count) {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = count;
        el.classList.toggle('is-hidden', count === 0);
      });
    },

    async refresh() {
      const [cart, sections] = await Promise.all([
        fetch(routes.cart + '.js').then((r) => r.json()),
        fetch(routes.root + '?sections=cart-drawer').then((r) => r.json())
      ]);
      this.updateCount(cart.item_count);
      this.render(sections);
      return cart;
    },

    /**
     * Change a line's quantity. Add-on lines (personalization, patch) that are linked to it via
     * the `_linked_to` property follow the same quantity, so they can never be bought on their own.
     */
    async changeLine(key, quantity) {
      const cart = await fetch(routes.cart + '.js').then((r) => r.json());
      const line = cart.items.find((item) => item.key === key);
      if (!line) return;
      const updates = { [key]: quantity };
      const pid = line.properties && line.properties._pid;
      if (pid) {
        cart.items
          .filter((item) => item.properties && item.properties._linked_to === pid)
          .forEach((item) => { updates[item.key] = quantity; });
      }
      const res = await postJSON(routes.cart + '/update.js', { updates, sections: 'cart-drawer' });
      this.updateCount(res.item_count);
      this.render(res.sections);
    }
  };
  window.theme.cart = Cart;

  customElements.define('cart-drawer', class extends HTMLElement {
    connectedCallback() {
      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-drawer-close]')) Cart.close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.classList.contains('is-open')) Cart.close();
      });
    }
  });

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-cart-toggle]');
    if (toggle && document.getElementById('CartDrawer') && !document.querySelector('[data-cart-page]')) {
      e.preventDefault();
      Cart.open();
    }
  });

  // Quantity / remove on cart lines, in the drawer and on the cart page.
  async function handleLineChange(lineEl, quantity) {
    const container = lineEl.closest('.cart-lines');
    container.classList.add('is-loading');
    try {
      await Cart.changeLine(lineEl.dataset.lineKey, quantity);
      if (lineEl.closest('[data-cart-page]')) window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      container.classList.remove('is-loading');
    }
  }
  document.addEventListener('change', (e) => {
    if (!e.target.matches('[data-line-qty]')) return;
    handleLineChange(e.target.closest('[data-line-key]'), Math.max(0, Number(e.target.value)));
  });
  document.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-line-remove]');
    if (remove) handleLineChange(remove.closest('[data-line-key]'), 0);
  });

  /* ---------- Header: mobile menu + search ---------- */

  document.addEventListener('click', (e) => {
    const menuToggle = e.target.closest('[data-mobile-menu-toggle]');
    if (menuToggle) {
      const menu = document.getElementById('MobileMenu');
      const open = menu.hidden;
      menu.hidden = !open;
      menuToggle.setAttribute('aria-expanded', String(open));
    }
    const searchToggle = e.target.closest('[data-search-toggle]');
    if (searchToggle) {
      const bar = document.querySelector('[data-search-bar]');
      bar.hidden = !bar.hidden;
      if (!bar.hidden) bar.querySelector('input[type="search"]').focus();
    }
  });

  /* ---------- Modals (size chart) ---------- */

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) document.getElementById(opener.dataset.modalOpen)?.showModal();
    const closer = e.target.closest('[data-modal-close]');
    if (closer) closer.closest('dialog')?.close();
    if (e.target.tagName === 'DIALOG') e.target.close(); // click on backdrop
  });

  /* ---------- Facets ---------- */

  customElements.define('facet-form', class extends HTMLElement {
    connectedCallback() {
      const form = this.querySelector('form');
      const panel = this.querySelector('[data-facets-panel]');
      if (panel && panel.querySelector('details[open]')) panel.classList.add('is-open');
      this.querySelector('[data-facets-toggle]')?.addEventListener('click', () => panel.classList.toggle('is-open'));
      form.addEventListener('change', (e) => {
        if (e.target.matches('[data-auto-submit]')) this.submit(form);
      });
      form.addEventListener('submit', (e) => { e.preventDefault(); this.submit(form); });
    }

    submit(form) {
      // Drop empty price fields so they don't become active filters.
      const params = new URLSearchParams();
      new FormData(form).forEach((value, key) => { if (value !== '') params.append(key, value); });
      window.location.href = form.action + '?' + params.toString();
    }
  });

  /* ---------- Product page ---------- */

  customElements.define('product-page', class extends HTMLElement {
    connectedCallback() {
      this.data = JSON.parse(this.querySelector('[data-product-json]').textContent);
      this.form = this.querySelector('[data-product-form]');
      this.variantInput = this.form.querySelector('[data-variant-id]');
      this.addButton = this.form.querySelector('[data-add-button]');
      this.errorEl = this.form.querySelector('[data-form-error]');

      this.form.addEventListener('change', (e) => {
        if (e.target.name && e.target.name.startsWith('option-')) this.onOptionChange();
      });
      this.form.addEventListener('submit', (e) => this.onSubmit(e));

      this.querySelectorAll('[data-thumb]').forEach((btn) => {
        btn.addEventListener('click', () => this.showMedia(btn.dataset.thumb));
      });

      const number = this.querySelector('[data-personalize-number]');
      number?.addEventListener('input', () => { number.value = number.value.replace(/\D/g, '').slice(0, 2); });

      this.onOptionChange(true);
    }

    selectedOptions() {
      return [...this.form.querySelectorAll('fieldset[data-option-index]')].map((fs) => {
        const checked = fs.querySelector('input:checked');
        return checked ? checked.value : null;
      });
    }

    onOptionChange(initial) {
      const selected = this.selectedOptions();
      const variant = selected.length
        ? this.data.variants.find((v) => v.options.every((opt, i) => opt === selected[i]))
        : this.data.variants[0];

      // Label + availability styling for each option value given the other selections.
      this.form.querySelectorAll('fieldset[data-option-index]').forEach((fs) => {
        const index = Number(fs.dataset.optionIndex);
        fs.querySelector('[data-option-value]').textContent = selected[index] || '';
        fs.querySelectorAll('input').forEach((input) => {
          const candidate = [...selected];
          candidate[index] = input.value;
          const available = this.data.variants.some((v) => v.available && v.options.every((o, i) => o === candidate[i]));
          input.closest('.pill').classList.toggle('is-unavailable', !available);
        });
      });

      this.variant = variant;
      if (!variant) {
        this.setButton(false, strings.soldOut);
        return;
      }
      this.variantInput.value = variant.id;
      this.setButton(variant.available, variant.available ? strings.addToCart : strings.soldOut);
      this.renderPrice(variant);
      if (variant.featured_media) this.showMedia(variant.featured_media.id);
      if (!initial) {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
    }

    setButton(enabled, label) {
      this.addButton.disabled = !enabled;
      this.addButton.textContent = label;
    }

    renderPrice(variant) {
      const container = this.querySelector('[data-price-container] [data-price]');
      if (!container) return;
      const fmt = this.data.moneyFormat;
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      container.classList.toggle('price--sale', !!onSale);
      let html = `<span class="price__current">${formatMoney(variant.price, fmt)}</span>`;
      if (onSale) {
        const pct = Math.round(((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price);
        html += `<s class="price__compare">${formatMoney(variant.compare_at_price, fmt)}</s><span class="badge badge--sale">-${pct}%</span>`;
      }
      container.innerHTML = html;
    }

    showMedia(id) {
      const target = this.querySelector(`.product__media-item[data-media-id="${id}"]`);
      if (!target) return;
      this.querySelectorAll('.product__media-item').forEach((el) => el.classList.toggle('is-active', el === target));
      this.querySelectorAll('[data-thumb]').forEach((el) => el.classList.toggle('is-active', el.dataset.thumb === String(id)));
    }

    async onSubmit(e) {
      e.preventDefault();
      if (!this.variant || !this.variant.available) return;
      this.errorEl.hidden = true;

      const formData = new FormData(this.form);
      const quantity = Math.max(1, Number(formData.get('quantity')) || 1);
      const properties = {};
      formData.forEach((value, key) => {
        const m = key.match(/^properties\[(.+)\]$/);
        if (m && String(value).trim() !== '') properties[m[1]] = String(value).trim().toUpperCase();
      });

      const nameInput = this.querySelector('[data-personalize-name]');
      const numberInput = this.querySelector('[data-personalize-number]');
      const patchInput = this.querySelector('[data-patch]');
      const wantsPrint = (nameInput && nameInput.value.trim()) || (numberInput && numberInput.value.trim());
      const wantsPatch = patchInput && patchInput.checked;

      if (nameInput && !nameInput.checkValidity()) {
        this.showError(nameInput.validationMessage);
        return;
      }

      // Each personalized jersey gets an id so its paid add-ons stay tied to it in the cart.
      const items = [];
      const pid = (wantsPrint || wantsPatch) ? uid() : null;
      const mainProps = { ...properties };
      if (pid) mainProps._pid = pid;
      items.push({ id: this.variant.id, quantity, properties: mainProps });

      const linkedLabel = [nameInput?.value.trim().toUpperCase(), numberInput?.value.trim()].filter(Boolean).join(' ');
      if (wantsPrint && this.data.personalizationVariantId) {
        items.push({ id: this.data.personalizationVariantId, quantity, properties: { _linked_to: pid, [strings.forJersey]: `${this.data.productTitle} – ${linkedLabel}` } });
      }
      if (wantsPatch && this.data.patchVariantId) {
        items.push({ id: this.data.patchVariantId, quantity, properties: { _linked_to: pid, [strings.forJersey]: this.data.productTitle } });
      }

      this.addButton.disabled = true;
      this.addButton.textContent = strings.adding;
      try {
        const res = await postJSON(routes.cartAdd, { items, sections: 'cart-drawer' });
        Cart.render(res.sections);
        const cart = await fetch(routes.cart + '.js').then((r) => r.json());
        Cart.updateCount(cart.item_count);
        Cart.open();
        if (nameInput) nameInput.value = '';
        if (numberInput) numberInput.value = '';
        if (patchInput) patchInput.checked = false;
      } catch (err) {
        this.showError(err.message);
      } finally {
        this.setButton(this.variant.available, this.variant.available ? strings.addToCart : strings.soldOut);
      }
    }

    showError(message) {
      this.errorEl.textContent = message;
      this.errorEl.hidden = false;
    }
  });

  /* ---------- Product recommendations ---------- */

  customElements.define('product-recommendations', class extends HTMLElement {
    connectedCallback() {
      if (this.children.length) return;
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        fetch(this.dataset.url)
          .then((r) => r.text())
          .then((text) => {
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const fresh = doc.querySelector('product-recommendations');
            if (fresh && fresh.innerHTML.trim()) this.innerHTML = fresh.innerHTML;
          })
          .catch(() => {});
      }, { rootMargin: '0px 0px 400px 0px' });
      observer.observe(this);
    }
  });
})();

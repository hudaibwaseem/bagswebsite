(function () {
  'use strict';

  var brands = window.DV_BAG_BRANDS || [];
  var gallery = document.getElementById('gallery');
  var filters = document.getElementById('brand-filters');
  var status = document.getElementById('gallery-status');

  if (!brands.length || !gallery || !filters) return;

  var total = 0;
  brands.forEach(function (brand) {
    total += brand.files.length;
  });

  var itemsByBrand = {};

  function imageUrl(brand, file) {
    return 'pics/bags/' + encodeURIComponent(brand.folder) + '/' + encodeURIComponent(file);
  }

  function addFilter(key, label, count) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-btn';
    button.setAttribute('data-filter', key);
    button.setAttribute('aria-pressed', 'false');
    button.textContent = label + ' (' + count + ')';
    filters.appendChild(button);
  }

  addFilter('all', 'All Bags', total);
  brands.forEach(function (brand) {
    addFilter(brand.key, brand.label, brand.files.length);
  });

  brands.forEach(function (brand) {
    itemsByBrand[brand.key] = [];

    brand.files.forEach(function (file, index) {
      var url = imageUrl(brand, file);
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'gallery-item';
      item.setAttribute('data-brand', brand.key);
      item.setAttribute('data-full', url);
      item.setAttribute('aria-label', 'View ' + brand.label + ' bag photo ' + (index + 1));

      var image = document.createElement('img');
      image.src = url;
      image.alt = brand.label + ' designer bag, photo ' + (index + 1);
      image.loading = 'lazy';

      var zoom = document.createElement('span');
      zoom.className = 'gallery-zoom';
      zoom.innerHTML = '<svg><use href="#i-zoom"></use></svg>';

      var label = document.createElement('span');
      label.className = 'gallery-item-label';
      label.innerHTML = '<svg><use href="#i-bag"></use></svg>';
      label.appendChild(document.createTextNode(brand.label));

      item.appendChild(image);
      item.appendChild(zoom);
      item.appendChild(label);
      gallery.appendChild(item);
      itemsByBrand[brand.key].push(item);
    });
  });

  var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));

  function findBrand(key) {
    for (var i = 0; i < brands.length; i += 1) {
      if (brands[i].key === key) return brands[i];
    }
    return null;
  }

  function currentKey() {
    var hash = decodeURIComponent(window.location.hash.replace(/^#/, '').toLowerCase());
    return findBrand(hash) ? hash : 'all';
  }

  function applyFilter(key) {
    var brand = findBrand(key);

    items.forEach(function (item) {
      item.hidden = key !== 'all' && item.getAttribute('data-brand') !== key;
    });

    filters.querySelectorAll('.filter-btn').forEach(function (button) {
      var active = button.getAttribute('data-filter') === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (status) {
      status.textContent = '';
      var count = document.createElement('strong');
      count.textContent = String(brand ? brand.files.length : total);
      status.appendChild(document.createTextNode('Showing '));
      status.appendChild(count);
      status.appendChild(document.createTextNode(
        brand ? ' ' + brand.label + ' pieces.' : ' pieces across ' + brands.length + ' brands.'
      ));
    }

    gallery.dispatchEvent(new Event('dv:gallery-update'));

    try {
      window.history.replaceState(null, '', key === 'all' ? window.location.pathname + window.location.search : '#' + key);
    } catch (error) {
      return;
    }
  }

  filters.addEventListener('click', function (event) {
    var button = event.target.closest('.filter-btn');
    if (!button) return;
    applyFilter(button.getAttribute('data-filter'));
  });

  window.addEventListener('hashchange', function () {
    applyFilter(currentKey());
  });

  applyFilter(currentKey());
})();

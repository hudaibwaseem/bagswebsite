(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var header = document.getElementById('site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var trigger = dropdown.querySelector('.nav-dropdown-toggle');
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    var setOpen = function (open) {
      dropdown.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('click', function (event) {
      if (!dropdown.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && dropdown.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  });

  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('reveal-ready');

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');

  if (gallery && lightbox) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item:not([hidden])'));
    var imgEl = document.getElementById('lightbox-img');
    var counter = document.getElementById('lightbox-counter');
    var closeBtn = document.getElementById('lightbox-close');
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');
    var total = items.length;
    var current = 0;
    var lastFocused = null;

    var refreshItems = function () {
      items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item:not([hidden])'));
      total = items.length;
      if (current >= total) current = 0;
    };

    gallery.addEventListener('dv:gallery-update', refreshItems);

    var update = function () {
      var item = items[current];
      if (!item || !imgEl) return;
      imgEl.src = item.getAttribute('data-full');
      var thumb = item.querySelector('img');
      imgEl.alt = thumb ? thumb.alt : 'Enlarged image';
      if (counter) counter.textContent = current + 1 + ' / ' + total;
    };

    var openLightbox = function (index, trigger) {
      current = index;
      lastFocused = trigger || null;
      update();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (closeBtn) closeBtn.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (imgEl) imgEl.removeAttribute('src');
      if (lastFocused) lastFocused.focus();
    };

    var showNext = function () {
      current = (current + 1) % total;
      update();
    };

    var showPrev = function () {
      current = (current - 1 + total) % total;
      update();
    };

    items.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index, item);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowRight') {
        showNext();
        return;
      }

      if (event.key === 'ArrowLeft') {
        showPrev();
        return;
      }

      if (event.key === 'Tab') {
        var focusable = [closeBtn, prevBtn, nextBtn].filter(Boolean);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
})();

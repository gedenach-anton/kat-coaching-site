(function () {
  'use strict';

  /* ── CONFIG: the only place to edit when real links exist ─────────────
     booking.strategic  → Calendly link for the free strategic session (coaching)
     booking.mediation  → Calendly link for the free 30-minute mediation intro call
     formEndpoint       → e.g. a Formspree URL. Empty = form opens the visitor's email app.
     Leave a value empty and the button falls back to writing an email. */
  var CONFIG = {
    booking: { strategic: '', mediation: '' },
    formEndpoint: '',
    email: 'kgrodska@gmail.com'
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* nav: shadow on scroll + mobile menu */
  var nav = $('.site-nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    var toggle = $('.nav-toggle', nav);
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    $$('.nav-links a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* FAQ accordion (one open at a time) */
  $$('.faq-item').forEach(function (item) {
    var btn = $('.faq-q', item);
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      $$('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        $('.faq-q', o).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* booking links */
  $$('[data-book]').forEach(function (a) {
    var url = CONFIG.booking[a.getAttribute('data-book')];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
  });

  /* contact form */
  var form = $('#contact-form');
  if (form) {
    var interest = new URLSearchParams(location.search).get('interest');
    var sel = $('#interest', form);
    if (interest) {
      $$('option', sel).forEach(function (o) { if (o.value.toLowerCase().indexOf(interest.toLowerCase()) === 0) sel.value = o.value; });
    }
    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var msg = $('#message', form);
        msg.value = c.getAttribute('data-text');
        msg.focus();
      });
    });
    var status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = {
        name: $('#name', form).value.trim(),
        email: $('#email', form).value.trim(),
        message: $('#message', form).value.trim(),
        interest: sel.value
      };
      if (CONFIG.formEndpoint) {
        status.textContent = 'Sending…';
        fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error(); status.textContent = 'Thank you. Your message is on its way, I usually reply within 1–2 working days.'; form.reset(); })
          .catch(function () { status.textContent = 'Something went wrong. Please write to ' + CONFIG.email + ' directly.'; });
      } else {
        var body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nInterested in: ' + d.interest + '\n\n' + d.message;
        location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Website message: ' + d.interest) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Your email app should open with the message ready to send.';
      }
    });
  }
})();
